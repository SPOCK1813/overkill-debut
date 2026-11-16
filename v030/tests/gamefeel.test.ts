import { describe, expect, it } from "vitest";
import { executeTraining } from "../src/domain/training";
import { createInitialState } from "../src/domain/stateFactory";
import { SequenceRandomSource } from "../src/services/RandomSource";
import { beginGameFeelStory, createGameFeelPreviewState, finishGameFeelStory, GAME_FEEL_PROTOTYPE } from "../src/services/GameFeelPrototype";
import { renderHomeScreen } from "../src/screens/HomeScreen";
import { renderGameFeelMemberScreen, renderGameFeelTrainingScreen } from "../src/screens/GameFeelScreens";
import { STORY_NODES } from "../src/services/StoryEngine";
import { renderStoryScreen } from "../src/screens/StoryScreen";

const gameFeelState = createGameFeelPreviewState("2026-01-01T00:00:00.000Z");

describe("SARiNA Game Feel prototype", () => {
  it("starts directly at Season 1 Week 1 HOME with three actions and 100 TP", () => {
    const state = createGameFeelPreviewState("2026-01-01T00:00:00.000Z");
    expect(state.progress.phase).toBe("home");
    expect(state.started).toBe(true);
    expect(state.progress.season).toBe(1);
    expect(state.progress.week).toBe(1);
    expect(state.week.actionsUsed).toBe(0);
    expect(state.week.tpRemaining).toBe(100);
    const html = renderHomeScreen(state, { audioEnabled: false });
    expect(html).toContain("SEASON 1");
    expect(html).toContain("WEEK 1");
    expect(html).toContain("TP残り");
    expect(html).toContain("SARiNA");
    expect(html).toContain("ANIMATION TEST · 仮ビジュアル");
    expect(html).toContain('data-action="open-story"');
    expect(html).toContain('data-action="open-training"');
    expect(html).toContain('data-action="open-member"');
    expect(html).not.toContain("MiYU");
    expect(html).not.toContain("KiLUA");
    expect(html).not.toContain("RAiSA");
  });

  it("shows exactly one existing Week 1 SARiNA speaking vignette without spending actions or TP", () => {
    const before = createGameFeelPreviewState("2026-01-01T00:00:00.000Z");
    const during = beginGameFeelStory(before, "2026-01-01T00:01:00.000Z");
    expect(during.progress.phase).toBe("story");
    expect(during.progress.story.nodeId).toBe(GAME_FEEL_PROTOTYPE.storyNodeId);
    const html = renderStoryScreen(during, STORY_NODES[GAME_FEEL_PROTOTYPE.storyNodeId]);
    expect(html).toContain("data-chibi-talking=\"true\"");
    expect(html).toContain("ANIMATION TEST · 仮ビジュアル");
    expect(html).toContain('data-action="story-next"');
    const after = finishGameFeelStory(during, "2026-01-01T00:02:00.000Z");
    expect(after.progress.phase).toBe("home");
    expect(after.week.actionsUsed).toBe(before.week.actionsUsed);
    expect(after.week.tpRemaining).toBe(before.week.tpRemaining);
  });

  it("offers only SARiNA and dance and prevents dancing before the member is selected", () => {
    const html = renderGameFeelTrainingScreen(gameFeelState, null);
    expect(html).toContain('data-member-id="sarina"');
    expect(html).toContain('data-training-id="dance"');
    expect(html).toContain("disabled");
    expect(html).toContain("ANIMATION TEST · 仮ビジュアル");
    expect(html).not.toContain("MiYU");
  });

  it("uses the existing domain to commit the deterministic dance result once", () => {
    const state = createGameFeelPreviewState("2026-01-01T00:00:00.000Z");
    state.progress.phase = "training";
    const danceBefore = state.members.sarina.stats.dance;
    const result = executeTraining(state, "sarina", "dance", new SequenceRandomSource([GAME_FEEL_PROTOTYPE.randomRoll]), {
      id: "gamefeel-sarina-dance-1",
      now: "2026-01-01T00:01:00.000Z",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.outcome).not.toBe("fail");
    expect(result.record.applied).toBe(true);
    expect(result.record.statDelta.dance).toBeGreaterThan(0);
    expect(result.state.members.sarina.stats.dance).toBe(danceBefore + result.record.statDelta.dance!);
    expect(result.state.week.actionsUsed).toBe(1);
    expect(result.state.week.tpRemaining).toBe(65);
    const duplicate = executeTraining(result.state, "sarina", "dance", new SequenceRandomSource([0.01]), {
      id: "gamefeel-sarina-dance-1",
      now: "2026-01-01T00:02:00.000Z",
    });
    expect(duplicate.ok).toBe(false);
    expect(result.state.week.actionHistory).toHaveLength(1);
  });

  it("keeps the MEMBER view limited to SARiNA", () => {
    const html = renderGameFeelMemberScreen(createInitialState("2026-01-01T00:00:00.000Z"));
    expect(html).toContain("SARiNA");
    expect(html).not.toContain("MiYU");
    expect(html).not.toContain("KiLUA");
    expect(html).not.toContain("RAiSA");
  });
});
