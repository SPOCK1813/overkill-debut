import { describe, expect, it } from "vitest";
import { createInitialState } from "../src/domain/stateFactory";
import { commitWeekResult, nextWeek } from "../src/domain/progression";
import { advanceStory, beginWeekendStory } from "../src/services/StoryEngine";

describe("week progression", () => {
  it("starts the next week with three actions, TP100 and a fresh snapshot", () => {
    let state = createInitialState("2026-01-01T00:00:00.000Z");
    state.started = true;
    state.progress.phase = "weekResult";
    state.week.actionsUsed = 3;
    state.week.tpRemaining = 10;
    state.week.resultCommitted = true;
    state = nextWeek(state, "w2_01", "2026-01-08T00:00:00.000Z");
    expect(state.progress.season).toBe(1);
    expect(state.progress.week).toBe(2);
    expect(state.progress.phase).toBe("story");
    expect(state.week.actionsUsed).toBe(0);
    expect(state.week.tpRemaining).toBe(100);
    expect(state.week.resultCommitted).toBe(false);
    expect(state.progress.story.nodeId).toBe("w2_01");
    expect(state.progress.story.returnPhase).toBe("home");
    expect(state.weekStartSnapshot?.week).toBe(2);
  });

  it("wraps Week 8 to Week 1 of the next Season", () => {
    const state = createInitialState();
    state.progress.season = 1;
    state.progress.week = 8;
    state.progress.phase = "weekResult";
    state.week.resultCommitted = true;
    const next = nextWeek(state);
    expect(next.progress.season).toBe(2);
    expect(next.progress.week).toBe(1);
    expect(next.progress.phase).toBe("home");
    expect(next.week.tpRemaining).toBe(100);
    expect(next.week.actionsUsed).toBe(0);
  });

  it("ends at Season 4 Week 8 instead of wrapping to an invalid Season 5", () => {
    const state = createInitialState();
    state.progress.season = 4;
    state.progress.week = 8;
    state.progress.phase = "weekResult";
    state.week.resultCommitted = true;
    const complete = nextWeek(state);
    expect(complete.progress.phase).toBe("gameComplete");
    expect(complete.progress.season).toBe(4);
    expect(complete.progress.week).toBe(8);
  });

  it("commits a WEEK RESULT only once", () => {
    const state = createInitialState();
    state.week.actionsUsed = 3;
    const first = commitWeekResult(state);
    const second = commitWeekResult(first);
    expect(first.week.resultCommitted).toBe(true);
    expect(second).toBe(first);
  });

  it("resumes a pending opening Story and chains to the weekend event before the result", () => {
    const state = createInitialState("2026-01-01T00:00:00.000Z");
    state.started = true;
    state.week.actionsUsed = 3;
    state.progress.phase = "home";
    state.progress.story = {
      nodeId: "w1_training",
      eventId: "S1W1-opening",
      returnPhase: "home",
      startedAt: "2026-01-01T00:01:00.000Z",
    };

    const resumed = beginWeekendStory(state, "2026-01-08T00:00:00.000Z");
    expect(resumed.progress.story.nodeId).toBe("w1_training");
    expect(resumed.progress.story.returnPhase).toBe("weekendStory");
    expect(resumed.progress.phase).toBe("story");

    const weekend = advanceStory(resumed, "2026-01-08T00:01:00.000Z");
    expect(weekend.progress.completedEvents["S1W1-opening"]).toBe(true);
    expect(weekend.progress.story.nodeId).toBe("w1_after_training");
    expect(weekend.progress.story.eventId).toBe("S1W1-weekend");
    expect(weekend.progress.phase).toBe("story");
    expect(weekend.week.actionsUsed).toBe(3);
  });

  it("does not skip an unopened Week 1 opening Story when closing the week", () => {
    const state = createInitialState("2026-01-01T00:00:00.000Z");
    state.week.actionsUsed = 3;
    state.progress.phase = "home";
    state.progress.story = { nodeId: null, eventId: null, returnPhase: null, startedAt: null };

    const next = beginWeekendStory(state, "2026-01-08T00:00:00.000Z");
    expect(next.progress.story.nodeId).toBe("w1_01");
    expect(next.progress.story.eventId).toBe("S1W1-opening");
    expect(next.progress.story.returnPhase).toBe("weekendStory");
    expect(next.week.weekendEventId).toBe("S1W1-weekend");
  });
});
