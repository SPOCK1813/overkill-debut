import { ACTIONS_PER_WEEK, SEASON_COUNT, WEEKLY_TP, WEEKS_PER_SEASON } from "./constants";
import { cloneState, createWeekSnapshot } from "./stateFactory";
import type { GameState, MemberState, ScreenPhase } from "./types";

export function weekKey(state: Pick<GameState, "progress">): string {
  return `S${state.progress.season}W${state.progress.week}`;
}

export function remainingActions(state: Pick<GameState, "week">): number {
  return Math.max(0, ACTIONS_PER_WEEK - state.week.actionsUsed);
}

export function addExperience(member: MemberState, amount: number): { member: MemberState; gained: number; levels: number } {
  const next = { ...member, exp: Math.max(0, member.exp + Math.max(0, Math.round(amount))) };
  let levels = 0;
  while (next.exp >= 100 + (next.level - 1) * 35) {
    next.exp -= 100 + (next.level - 1) * 35;
    next.level += 1;
    levels += 1;
  }
  return { member: next, gained: Math.max(0, Math.round(amount)), levels };
}

export function beginWeek(state: GameState, season: number, week: number, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  next.progress.season = Math.max(1, Math.min(SEASON_COUNT, Math.trunc(season)));
  next.progress.week = Math.max(1, Math.min(WEEKS_PER_SEASON, Math.trunc(week)));
  next.week.actionsUsed = 0;
  next.week.tpRemaining = WEEKLY_TP;
  next.week.actionHistory = [];
  next.week.pendingActionId = null;
  next.week.weekendEventId = null;
  next.week.resultCommitted = false;
  next.progress.phase = "home";
  next.weekStartSnapshot = createWeekSnapshot(next);
  next.updatedAt = now;
  return next;
}

export function canUseAction(state: GameState, tpCost: number): { ok: true } | { ok: false; reason: string } {
  if (state.progress.phase !== "training" && state.progress.phase !== "home") {
    return { ok: false, reason: "今は行動できません。HOMEへ戻ってください。" };
  }
  if (state.week.actionsUsed >= ACTIONS_PER_WEEK) {
    return { ok: false, reason: "今週の自由行動は終了しました。週末へ進んでください。" };
  }
  if (tpCost > state.week.tpRemaining) {
    return { ok: false, reason: `TPが足りません（必要 ${tpCost} / 残り ${state.week.tpRemaining}）。` };
  }
  return { ok: true };
}

export function commitWeekResult(state: GameState, now = new Date().toISOString()): GameState {
  if (state.week.resultCommitted) return state;
  const next = cloneState(state);
  next.week.resultCommitted = true;
  next.progress.phase = "weekResult";
  next.week.weekendEventId = null;
  next.updatedAt = now;
  return next;
}

export function nextWeek(state: GameState, storyStartNode: string | null = null, now = new Date().toISOString()): GameState {
  if (state.progress.phase !== "weekResult" || !state.week.resultCommitted) return state;
  if (state.progress.season === SEASON_COUNT && state.progress.week === WEEKS_PER_SEASON) {
    const complete = cloneState(state);
    complete.progress.phase = "gameComplete";
    complete.ui.lastStablePhase = "gameComplete";
    complete.updatedAt = now;
    return complete;
  }

  let season = state.progress.season;
  let week = state.progress.week + 1;
  if (week > WEEKS_PER_SEASON) {
    season += 1;
    week = 1;
  }
  const next = beginWeek(state, season, week, now);
  next.progress.story.nodeId = storyStartNode;
  next.progress.story.eventId = storyStartNode ? `S${season}W${week}-opening` : null;
  next.progress.story.returnPhase = "home";
  next.progress.story.startedAt = null;
  next.progress.phase = storyStartNode ? "story" : "home";
  next.ui.lastStablePhase = "home";
  return next;
}

export function returnToStablePhase(state: GameState, phase: ScreenPhase, now = new Date().toISOString()): GameState {
  const next = cloneState(state);
  next.progress.phase = phase;
  next.ui.lastStablePhase = phase;
  next.updatedAt = now;
  return next;
}
