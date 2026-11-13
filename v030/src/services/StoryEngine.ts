import { LEGACY_GAME_STORY } from "../data/story/legacyStory";
import { applyStoryDecision } from "../domain/storyEffects";
import { cloneState } from "../domain/stateFactory";
import { commitWeekResult } from "../domain/progression";
import type { GameState, StoryNode } from "../domain/types";

export const STORY_NODES = LEGACY_GAME_STORY.nodes as unknown as Record<string, StoryNode>;
export const STORY_WEEKS = LEGACY_GAME_STORY.weeks as unknown as Record<number, { start?: string; afterTraining?: string; ending?: string }>;
export const PROLOGUE = LEGACY_GAME_STORY.prologue as readonly string[];

export function storyStartFor(season: number, week: number): string | null {
  if (season !== 1) return null;
  return STORY_WEEKS[week]?.start ?? null;
}

export function openStory(state: GameState, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  const eventId = next.progress.story.eventId ?? `S${next.progress.season}W${next.progress.week}-opening`;
  const nodeId = next.progress.story.nodeId ?? storyStartFor(next.progress.season, next.progress.week);
  if (!nodeId || !STORY_NODES[nodeId]) {
    next.progress.phase = "home";
    next.progress.story = { nodeId: null, eventId: null, returnPhase: null, startedAt: null };
    next.updatedAt = now;
    return next;
  }
  next.progress.story = {
    nodeId,
    eventId,
    returnPhase: next.week.actionsUsed >= 3 ? "weekendStory" : "home",
    startedAt: now,
  };
  next.progress.phase = "story";
  next.ui.lastStablePhase = "home";
  next.updatedAt = now;
  return next;
}

export function beginWeekendStory(state: GameState, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  const weekDefinition = STORY_WEEKS[next.progress.week];
  const openingNodeId = next.progress.season === 1 ? weekDefinition?.start : undefined;
  const openingEventId = `S${next.progress.season}W${next.progress.week}-opening`;
  const weekendEventId = `S${next.progress.season}W${next.progress.week}-weekend`;

  if (openingNodeId && STORY_NODES[openingNodeId] && !next.progress.completedEvents[openingEventId]) {
    const cursor = next.progress.story;
    const resumeNode = cursor.eventId === openingEventId && cursor.nodeId && STORY_NODES[cursor.nodeId]
      ? cursor.nodeId
      : null;
    next.week.weekendEventId = weekendEventId;
    next.progress.story = {
      nodeId: resumeNode ?? openingNodeId,
      eventId: openingEventId,
      returnPhase: "weekendStory",
      startedAt: resumeNode ? cursor.startedAt : now,
    };
    next.progress.phase = "story";
    next.ui.lastStablePhase = "home";
    next.updatedAt = now;
    return next;
  }

  const nodeId = weekDefinition?.afterTraining;
  if (next.progress.season === 1 && nodeId && STORY_NODES[nodeId]) {
    next.week.weekendEventId = weekendEventId;
    next.progress.story = {
      nodeId,
      eventId: next.week.weekendEventId,
      returnPhase: "weekendStory",
      startedAt: now,
    };
    next.progress.phase = "story";
  } else {
    return commitWeekResult(next, now);
  }
  next.updatedAt = now;
  return next;
}

export function nodeFor(state: GameState): StoryNode | null {
  const id = state.progress.story.nodeId;
  return id ? STORY_NODES[id] ?? null : null;
}

function finishStoryEvent(state: GameState, now: string): GameState {
  const next = cloneState(state);
  const { eventId, returnPhase } = next.progress.story;
  if (eventId) next.progress.completedEvents[eventId] = true;
  next.progress.story = { nodeId: null, eventId: null, returnPhase: null, startedAt: null };

  if (returnPhase === "weekendStory") {
    if (eventId && eventId === next.week.weekendEventId) return commitWeekResult(next, now);
    return beginWeekendStory(next, now);
  }

  next.progress.phase = "home";
  next.ui.lastStablePhase = "home";
  next.updatedAt = now;
  return next;
}

export function advanceStory(state: GameState, now = new Date().toISOString()): GameState {
  const nodeId = state.progress.story.nodeId;
  const node = nodeId ? STORY_NODES[nodeId] : undefined;
  if (!node) return { ...state, progress: { ...state.progress, phase: "home" } };

  if (node.type === "weekComplete") return commitWeekResult(state, now);
  if (node.type === "training") return finishStoryEvent(state, now);
  if (!node.next || !STORY_NODES[node.next]) {
    return finishStoryEvent(state, now);
  }
  const next = cloneState(state);
  next.progress.story.nodeId = node.next;
  next.updatedAt = now;
  return next;
}

export function chooseStory(state: GameState, index: number, now = new Date().toISOString()): GameState {
  const node = nodeFor(state);
  const choice = node?.choices?.[index];
  if (!node || !choice) return state;
  let next = cloneState(state);
  const eventId = next.progress.story.eventId ?? `S${next.progress.season}W${next.progress.week}-opening`;
  const eventAlreadyCompleted = Boolean(next.progress.completedEvents[eventId]);
  if (choice.result && !eventAlreadyCompleted) {
    const applied = applyStoryDecision(next, choice.result, `legacy:w1-decision:${choice.result}`);
    next = applied.state;
  }
  if (choice.next && STORY_NODES[choice.next]) next.progress.story.nodeId = choice.next;
  next.updatedAt = now;
  return next;
}
