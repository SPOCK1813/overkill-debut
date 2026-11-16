import { cloneState, createInitialState, createWeekSnapshot } from "../domain/stateFactory";
import type { GameState } from "../domain/types";

/** Switchable, Preview-only presentation mode for the first Game Feel slice. */
export const GAME_FEEL_PROTOTYPE = {
  enabled: true,
  storyNodeId: "w1_02",
  storyEventId: "gamefeel-sarina-prototype",
  randomRoll: 0.01,
} as const;

/** Begin directly at HOME for an empty Preview save while retaining the normal v0.30 schema. */
export function createGameFeelPreviewState(now = new Date().toISOString()): GameState {
  const next = createInitialState(now);
  next.started = true;
  next.prologueSeen = true;
  next.progress.phase = "home";
  next.progress.prologueIndex = 0;
  next.ui.lastStablePhase = "home";
  next.weekStartSnapshot = createWeekSnapshot(next);
  next.updatedAt = now;
  return next;
}

/** Open the one-page W1 SARiNA vignette without spending an action or TP. */
export function beginGameFeelStory(state: GameState, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  next.progress.phase = "story";
  next.progress.story = {
    nodeId: GAME_FEEL_PROTOTYPE.storyNodeId,
    eventId: GAME_FEEL_PROTOTYPE.storyEventId,
    returnPhase: "home",
    startedAt: now,
  };
  next.ui.lastStablePhase = "home";
  next.updatedAt = now;
  return next;
}

/** Finish the demo vignette and return HOME without spending an action or TP. */
export function finishGameFeelStory(state: GameState, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  if (next.progress.story.eventId === GAME_FEEL_PROTOTYPE.storyEventId) {
    next.progress.story = { nodeId: null, eventId: null, returnPhase: null, startedAt: null };
  }
  next.progress.phase = "home";
  next.ui.lastStablePhase = "home";
  next.updatedAt = now;
  return next;
}
