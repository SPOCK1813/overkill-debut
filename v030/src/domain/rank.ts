import { MAX_STAT, MIN_STAT, RANK_LABELS, SP_REWARDS } from "./constants";
import type { MemberState, MemberStats, RankTier } from "./types";

export interface RankParts {
  tier: RankTier;
  rank: (typeof RANK_LABELS)[number];
  point: number;
  value: number;
}

export function clampStat(value: number): number {
  return Math.max(MIN_STAT, Math.min(MAX_STAT, Math.round(Number(value) || MIN_STAT)));
}

export function rankParts(value: number): RankParts {
  const safeValue = clampStat(value);
  const tier = Math.min(6, Math.floor((safeValue - 1) / 100)) as RankTier;
  return {
    tier,
    rank: RANK_LABELS[tier],
    point: safeValue - tier * 100,
    value: safeValue,
  };
}

export function formatRank(value: number): string {
  const parts = rankParts(value);
  return `${parts.rank}${parts.point}`;
}

export function memberRankValue(stats: MemberStats): number {
  const sum = stats.vocal + stats.dance + stats.mc + stats.bond;
  return clampStat(Math.round(sum / 4));
}

export function memberRank(member: Pick<MemberState, "stats">): RankParts {
  return rankParts(memberRankValue(member.stats));
}

export function spForTier(tier: RankTier): number {
  return SP_REWARDS[tier] ?? 0;
}
