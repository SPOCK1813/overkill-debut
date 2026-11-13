import { GAME_VERSION, LEGACY_STORAGE_KEY, SCHEMA_VERSION, WEEKLY_TP } from "../domain/constants";
import { MEMBERS } from "../data/members";
import { LEGACY_GAME_STORY } from "../data/story/legacyStory";
import { clampStat, memberRank } from "../domain/rank";
import { createInitialState, createWeekSnapshot } from "../domain/stateFactory";
import type { GameState, MemberId, MemberSnapshot, MemberStats, RankTier, StoryNode, WeekSnapshot } from "../domain/types";

export interface MigrationResult {
  state: GameState;
  warnings: string[];
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function numeric(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function safeTier(value: number): RankTier {
  return Math.max(0, Math.min(6, Math.trunc(value))) as RankTier;
}

function safeStat(value: unknown, fallback: number, energy = false): number {
  const n = Math.round(numeric(value, fallback));
  return Math.max(energy ? 0 : 1, Math.min(energy ? 100 : 700, n));
}

function migratedStats(raw: unknown, defaults: MemberStats): MemberStats {
  const stats = record(raw) ?? {};
  return {
    vocal: safeStat(stats.vocal, defaults.vocal),
    dance: safeStat(stats.dance, defaults.dance),
    mc: safeStat(stats.mc, defaults.mc),
    bond: safeStat(stats.bond, defaults.bond),
    energy: safeStat(stats.energy, defaults.energy, true),
  };
}

function snapshotFromLegacy(rawValue: unknown, state: GameState): WeekSnapshot | null {
  const raw = record(rawValue);
  if (!raw) return null;
  const rawMembers = record(raw.members) ?? {};
  const members = {} as Record<MemberId, MemberSnapshot>;
  for (const id of Object.keys(MEMBERS) as MemberId[]) {
    const old = record(rawMembers[id]) ?? {};
    const defaults = state.members[id];
    members[id] = {
      stats: migratedStats(old.stats, defaults.stats),
      level: Math.max(1, Math.trunc(numeric(old.level, defaults.level))),
      exp: Math.max(0, numeric(old.exp, defaults.exp)),
      sp: Math.max(0, Math.trunc(numeric(old.sp, defaults.sp))),
    };
  }
  return {
    season: Math.max(1, Math.min(4, Math.trunc(numeric(raw.season, state.progress.season)))),
    week: Math.max(1, Math.min(8, Math.trunc(numeric(raw.week, state.progress.week)))),
    resources: {
      cash: Math.max(0, numeric(raw.cash, state.resources.cash)),
      reach: Math.max(0, numeric(raw.reach, state.resources.reach)),
      fans: Math.max(0, numeric(raw.fans, state.resources.fans)),
      ovkPoints: state.resources.ovkPoints,
    },
    members,
  };
}

function knownStoryNode(id: unknown): id is string {
  if (typeof id !== "string") return false;
  const nodes = LEGACY_GAME_STORY.nodes as unknown as Record<string, StoryNode>;
  return Object.prototype.hasOwnProperty.call(nodes, id);
}

export function migrateLegacySave(value: unknown, now = new Date().toISOString()): MigrationResult {
  const raw = record(value);
  if (!raw) throw new Error("旧セーブの形式がJSONオブジェクトではありません。");
  const rawMembers = record(raw.members);
  if (!rawMembers) throw new Error("旧セーブにメンバー状態がありません。旧データは保持されています。");

  const warnings: string[] = [];
  const state = createInitialState(now);
  state.gameVersion = GAME_VERSION;
  state.schemaVersion = SCHEMA_VERSION;
  state.started = Boolean(raw.started);
  state.prologueSeen = Boolean(raw.prologueSeen);
  state.progress.season = Math.max(1, Math.min(4, Math.trunc(numeric(raw.season, 1))));
  state.progress.week = Math.max(1, Math.min(8, Math.trunc(numeric(raw.week, 1))));
  state.week.actionsUsed = Math.max(0, Math.min(3, Math.trunc(numeric(raw.actionsUsed, 0))));
  if (typeof raw.trainingTP === "number" && Number.isFinite(raw.trainingTP)) {
    state.week.tpRemaining = Math.max(0, Math.min(WEEKLY_TP, Math.round(raw.trainingTP)));
  } else {
    state.week.tpRemaining = WEEKLY_TP;
    warnings.push("旧セーブに残TPがないため、v0.24の初期化規則に合わせて100TPを補完しました。");
  }
  state.resources = {
    cash: Math.max(0, numeric(raw.cash, 220000)),
    reach: Math.max(0, numeric(raw.reach, 10)),
    fans: Math.max(0, numeric(raw.fans, 0)),
    ovkPoints: Math.max(0, numeric(raw.ovkPoints, 0)),
  };

  for (const id of Object.keys(MEMBERS) as MemberId[]) {
    const old = record(rawMembers[id]);
    if (!old) {
      warnings.push(`${MEMBERS[id].name}の旧状態が見つからないため、初期能力を使用しました。`);
      continue;
    }
    const current = state.members[id];
    const stats = migratedStats(old.stats, current.stats);
    const member = {
      ...current,
      level: Math.max(1, Math.trunc(numeric(old.level, 1))),
      exp: Math.max(0, numeric(old.exp, 0)),
      sp: Math.max(0, Math.trunc(numeric(old.sp, 0))),
      stats,
      rankHistory: Array.isArray(old.rankHistory)
        ? old.rankHistory.filter((entry): entry is string => typeof entry === "string")
        : [],
      rankNotices: [],
      spRewardThroughTier: 0 as RankTier,
    };
    const rank = memberRank(member);
    const claimed = typeof old.rankBonusClaimed === "number"
      ? safeTier(old.rankBonusClaimed)
      : rank.tier;
    member.spRewardThroughTier = Math.max(claimed, rank.tier) as RankTier;
    if (member.rankHistory.length === 0) member.rankHistory = [`${rank.rank}${rank.point}`];
    state.members[id] = member;
  }

  const rawNode = raw.pendingStoryNext && raw.node === "w1_decision" ? raw.pendingStoryNext : raw.node;
  const nodeId = knownStoryNode(rawNode) ? rawNode : null;
  const nodes = LEGACY_GAME_STORY.nodes as unknown as Record<string, StoryNode>;
  const currentNode = nodeId ? nodes[nodeId] : undefined;
  const completedEvents: Record<string, boolean> = {};
  const eventKey = `S${state.progress.season}W${state.progress.week}-opening`;
  const decisionNodes: Record<string, string> = {
    w1_teach: "teach", w1_teach2: "teach",
    w1_split: "split", w1_split2: "split",
    w1_push: "push", w1_push2: "push",
    w1_talk: "talk", w1_talk2: "talk", w1_talk3: "talk",
  };
  const rawNodeString = typeof raw.node === "string" ? raw.node : "";
  let storyNodeId = nodeId;
  let phase: GameState["progress"]["phase"] = "home";

  if (!state.started) {
    phase = "title";
    storyNodeId = null;
  } else if (!state.prologueSeen) {
    phase = "prologue";
    storyNodeId = null;
  } else if (currentNode?.type === "training") {
    phase = "home";
    storyNodeId = null;
    completedEvents[eventKey] = true;
  } else if (currentNode?.type === "weekComplete" && state.week.actionsUsed >= 3) {
    phase = "weekResult";
    storyNodeId = null;
    state.week.resultCommitted = true;
  } else if (nodeId) {
    phase = "story";
    if (/^w1_(after_decision|after_0|training|after_training|end|complete)/.test(nodeId) || state.week.actionsUsed > 0) {
      completedEvents["S1W1-opening"] = true;
    }
    if (decisionNodes[nodeId]) {
      state.appliedEffectIds.push(`legacy:w1-decision:${decisionNodes[nodeId]}`);
    }
    if (/^w1_(after_training|end|complete)/.test(nodeId)) {
      state.week.weekendEventId = "S1W1-weekend";
    }
  } else {
    phase = "home";
    warnings.push("旧ストーリー位置が認識できないためHOMEから再開します。");
  }

  if (rawNodeString.startsWith("w1_after_decision") || rawNodeString.startsWith("w1_training") || rawNodeString.startsWith("w1_after_training") || rawNodeString.startsWith("w1_end")) {
    completedEvents["S1W1-opening"] = true;
  }
  state.progress.phase = phase;
  state.progress.prologueIndex = Math.max(0, Math.trunc(numeric(raw.prologueIndex, 0)));
  state.progress.story = {
    nodeId: storyNodeId,
    eventId: storyNodeId ? eventKey : null,
    returnPhase: state.week.weekendEventId ? "weekendStory" : "home",
    startedAt: storyNodeId ? now : null,
  };
  state.progress.completedEvents = completedEvents;
  state.week.pendingActionId = null;

  const snapshot = snapshotFromLegacy(raw.weekSnapshot, state);
  state.weekStartSnapshot = snapshot ?? createWeekSnapshot(state);
  if (raw.weekSnapshot && !snapshot) warnings.push("旧週snapshotを読めず、現在値を週の基準値として保存しました。");

  const collection = record(raw.collection) ?? {};
  state.meta.collection = Object.fromEntries(Object.entries(collection).map(([key, entry]) => [key, Boolean(entry)]));
  state.meta.achievements = Array.isArray(raw.achievements)
    ? raw.achievements.filter((entry): entry is string => typeof entry === "string")
    : [];
  state.meta.clearHistory = Array.isArray(raw.clearHistory) ? raw.clearHistory : [];
  state.meta.rankNotices = Array.isArray(raw.rankNotices)
    ? raw.rankNotices.filter((entry): entry is GameState["meta"]["rankNotices"][number] => {
        const item = record(entry);
        return Boolean(item && typeof item.id === "string" && typeof item.sp === "number");
      }).map((item) => ({ id: item.id, tier: 0 as RankTier, sp: item.sp, source: "legacy" }))
    : [];
  state.meta.legacy = {
    version: typeof raw.version === "string" ? raw.version : null,
    v025Migrated: Boolean(raw.v025Migrated),
  };
  state.ui.lastStablePhase = phase;
  state.updatedAt = now;
  return { state, warnings };
}

export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new Error("セーブデータをJSONとして読み取れません。データは削除・上書きしていません。");
  }
}

export function legacyStorageKey(): string {
  return LEGACY_STORAGE_KEY;
}
