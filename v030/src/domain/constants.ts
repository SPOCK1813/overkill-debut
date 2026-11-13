import type { RankTier } from "./types";

export const GAME_VERSION = "0.30" as const;
export const SCHEMA_VERSION = 1 as const;
export const STORAGE_KEY = "overkill_manager_v030";
export const LEGACY_STORAGE_KEY = "overkill_manager_v22";
export const SEASON_COUNT = 4;
export const WEEKS_PER_SEASON = 8;
export const ACTIONS_PER_WEEK = 3;
export const WEEKLY_TP = 100;
export const MIN_STAT = 1;
export const MAX_STAT = 700;
export const MIN_ENERGY = 0;
export const MAX_ENERGY = 100;
export const RANK_LABELS = ["E", "D", "C", "B", "A", "S", "SS"] as const;
export const SP_REWARDS: readonly number[] = [0, 3, 4, 5, 6, 8, 10];
export const ZERO_TIER: RankTier = 0;

export const STAT_LABELS = {
  vocal: "歌唱",
  dance: "ダンス",
  mc: "MC",
  bond: "連携",
  energy: "体力",
} as const;

export const OUTCOME_DEFINITIONS = {
  super: { key: "super", label: "超大成功!!", icon: "🌟", statMultiplier: 1.75, expMultiplier: 1.45 },
  great: { key: "great", label: "大成功！", icon: "✨", statMultiplier: 1.4, expMultiplier: 1.25 },
  success: { key: "success", label: "成功！", icon: "👍", statMultiplier: 1.1, expMultiplier: 1.1 },
  normal: { key: "normal", label: "普通", icon: "•", statMultiplier: 0.8, expMultiplier: 0.9 },
  fail: { key: "fail", label: "失敗…", icon: "💦", statMultiplier: 0.2, expMultiplier: 0.55 },
  rest: { key: "rest", label: "休養", icon: "💤", statMultiplier: 1, expMultiplier: 1 },
} as const;

export const CONDITION_PROBABILITIES = {
  best: { super: 2, great: 35, success: 45, normal: 16, fail: 2 },
  good: { super: 1, great: 20, success: 44, normal: 30, fail: 5 },
  normal: { super: 1, great: 10, success: 34, normal: 45, fail: 10 },
  bad: { super: 1, great: 5, success: 19, normal: 50, fail: 25 },
  worst: { super: 1, great: 2, success: 7, normal: 40, fail: 50 },
} as const;

export function expNeeded(level: number): number {
  return 100 + Math.max(0, level - 1) * 35;
}
