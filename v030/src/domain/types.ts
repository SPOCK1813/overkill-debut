export const MEMBER_IDS = ["sarina", "miyu", "kilua", "raisa"] as const;
export type MemberId = (typeof MEMBER_IDS)[number];

export const CORE_STATS = ["vocal", "dance", "mc", "bond"] as const;
export type CoreStat = (typeof CORE_STATS)[number];
export type StatName = CoreStat | "energy";
export type RankTier = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type ActionType = "dance" | "vocal" | "mc" | "sns" | "flyer" | "rest";
export type TrainingOutcomeKey = "rest" | "super" | "great" | "success" | "normal" | "fail";
export type ScreenPhase =
  | "title"
  | "prologue"
  | "home"
  | "story"
  | "training"
  | "actionResult"
  | "weekResult"
  | "member"
  | "placeholder"
  | "gameComplete"
  | "saveError";

export interface MemberStats extends Record<StatName, number> {}

export interface RankNotice {
  id: string;
  tier: RankTier;
  sp: number;
  source: string;
}

export interface MemberState {
  id: MemberId;
  level: number;
  exp: number;
  sp: number;
  stats: MemberStats;
  /** Greatest MEMBER RANK tier already claimed or suppressed by SP allocation. */
  spRewardThroughTier: RankTier;
  rankHistory: string[];
  rankNotices: RankNotice[];
}

export interface Resources {
  cash: number;
  reach: number;
  fans: number;
  ovkPoints: number;
}

export interface MemberSnapshot {
  stats: MemberStats;
  level: number;
  exp: number;
  sp: number;
}

export interface WeekSnapshot {
  season: number;
  week: number;
  resources: Resources;
  members: Record<MemberId, MemberSnapshot>;
}

export interface ActionRecord {
  id: string;
  weekKey: string;
  type: ActionType;
  memberId: MemberId;
  tpCost: number;
  outcome: TrainingOutcomeKey;
  conditionKey: string;
  statDelta: Partial<Record<StatName, number>>;
  expGain: number;
  reachGain: number;
  fansGain: number;
  cashDelta: number;
  levelUps: number;
  spGain: number;
  applied: true;
  createdAt: string;
}

export interface StoryCursor {
  nodeId: string | null;
  eventId: string | null;
  returnPhase: "home" | "weekendStory" | null;
  startedAt: string | null;
}

export interface GameState {
  schemaVersion: 1;
  gameVersion: "0.30";
  saveId: string;
  createdAt: string;
  updatedAt: string;
  started: boolean;
  prologueSeen: boolean;
  progress: {
    season: number;
    week: number;
    phase: ScreenPhase;
    prologueIndex: number;
    story: StoryCursor;
    completedEvents: Record<string, boolean>;
  };
  week: {
    actionsUsed: number;
    tpRemaining: number;
    actionHistory: ActionRecord[];
    pendingActionId: string | null;
    weekendEventId: string | null;
    resultCommitted: boolean;
  };
  resources: Resources;
  members: Record<MemberId, MemberState>;
  weekStartSnapshot: WeekSnapshot | null;
  appliedEffectIds: string[];
  meta: {
    collection: Record<string, boolean>;
    achievements: string[];
    clearHistory: unknown[];
    rankNotices: RankNotice[];
    legacy: { version: string | null; v025Migrated: boolean };
  };
  ui: {
    lastStablePhase: ScreenPhase;
  };
}

export interface TrainingDefinition {
  id: ActionType;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  tp: number;
  primaryStat?: CoreStat;
  primaryGain?: number;
  bondGain?: number;
  reach?: number;
  energy: number;
  cash: number;
  exp: number;
}

export interface TrainingOutcomeDefinition {
  key: TrainingOutcomeKey;
  label: string;
  icon: string;
  statMultiplier: number;
  expMultiplier: number;
}

export interface StoryChoice {
  title: string;
  hint?: string;
  result?: string;
  next?: string;
}

export interface StoryNode {
  type?: "training" | "weekComplete";
  chapter?: string;
  bg?: string;
  member?: MemberId;
  expression?: "normal" | "smile" | "angry" | "troubled" | "cry";
  reaction?: string;
  speaker?: string;
  text?: string;
  next?: string;
  choices?: StoryChoice[];
}

export type StoryCondition =
  | { kind: "statAtLeast"; memberId: MemberId; stat: CoreStat; value: number }
  | { kind: "memberRankAtLeast"; memberId: MemberId; tier: RankTier }
  | { kind: "teamAverageRankAtLeast"; tier: RankTier }
  | { kind: "memberLeadsBy"; memberId: MemberId; stat: CoreStat; gap: number }
  | { kind: "bondBelow"; value: number }
  | { kind: "focusedTrainingCountAtLeast"; memberId: MemberId; count: number }
  | { kind: "actionUsedThisWeek"; actionType: ActionType; count: number };
