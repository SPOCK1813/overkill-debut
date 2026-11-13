import { GAME_VERSION, SCHEMA_VERSION, WEEKLY_TP } from "./constants";
import { MEMBERS } from "../data/members";
import { formatRank, memberRank } from "./rank";
import type { GameState, MemberId, MemberSnapshot, MemberState, WeekSnapshot } from "./types";

let fallbackId = 0;

export function createId(prefix = "id"): string {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  fallbackId += 1;
  return `${prefix}-${Date.now().toString(36)}-${fallbackId.toString(36)}`;
}

export function makeMember(id: MemberId): MemberState {
  const definition = MEMBERS[id];
  const member: MemberState = {
    id,
    level: 1,
    exp: 0,
    sp: 0,
    stats: { ...definition.initial },
    spRewardThroughTier: 0,
    rankHistory: [],
    rankNotices: [],
  };
  member.spRewardThroughTier = memberRank(member).tier;
  member.rankHistory = [formatRank(memberRank(member).value)];
  return member;
}

export function createInitialState(now = new Date().toISOString()): GameState {
  const members = {
    sarina: makeMember("sarina"),
    miyu: makeMember("miyu"),
    kilua: makeMember("kilua"),
    raisa: makeMember("raisa"),
  };
  return {
    schemaVersion: SCHEMA_VERSION,
    gameVersion: GAME_VERSION,
    saveId: createId("save"),
    createdAt: now,
    updatedAt: now,
    started: false,
    prologueSeen: false,
    progress: {
      season: 1,
      week: 1,
      phase: "title",
      prologueIndex: 0,
      story: { nodeId: "w1_01", eventId: "S1W1-opening", returnPhase: "home", startedAt: null },
      completedEvents: {},
    },
    week: {
      actionsUsed: 0,
      tpRemaining: WEEKLY_TP,
      actionHistory: [],
      pendingActionId: null,
      weekendEventId: null,
      resultCommitted: false,
    },
    resources: { cash: 220000, reach: 10, fans: 0, ovkPoints: 0 },
    members,
    weekStartSnapshot: null,
    appliedEffectIds: [],
    meta: { collection: {}, achievements: [], clearHistory: [], rankNotices: [], legacy: { version: null, v025Migrated: false } },
    ui: { lastStablePhase: "title" },
  };
}

export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}

export function snapshotMember(member: MemberState): MemberSnapshot {
  return {
    stats: { ...member.stats },
    level: member.level,
    exp: member.exp,
    sp: member.sp,
  };
}

export function createWeekSnapshot(state: GameState): WeekSnapshot {
  const members = {} as Record<MemberId, MemberSnapshot>;
  (Object.keys(state.members) as MemberId[]).forEach((id) => {
    members[id] = snapshotMember(state.members[id]);
  });
  return {
    season: state.progress.season,
    week: state.progress.week,
    resources: { ...state.resources },
    members,
  };
}

export function startNewGame(state: GameState, now = new Date().toISOString()): GameState {
  const next = createInitialState(now);
  next.resources.ovkPoints = state.resources.ovkPoints;
  next.meta = structuredClone(state.meta);
  next.started = true;
  next.progress.phase = "prologue";
  next.progress.prologueIndex = 0;
  next.ui.lastStablePhase = "prologue";
  next.weekStartSnapshot = null;
  return next;
}
