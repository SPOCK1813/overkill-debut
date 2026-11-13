import { MAX_ENERGY, MAX_STAT, MIN_ENERGY, MIN_STAT } from "./constants";
import { formatRank, memberRank, spForTier } from "./rank";
import type { CoreStat, MemberState, RankNotice, RankTier, StatName } from "./types";

export type GrowthSource = "training" | "story" | "live" | "sp";

export interface StatChangeResult {
  member: MemberState;
  actualDelta: number;
  spGain: number;
  rankUps: RankTier[];
}

function safeTier(value: number): RankTier {
  return Math.max(0, Math.min(6, Math.trunc(value))) as RankTier;
}

export function applyMemberStatChange(
  member: MemberState,
  stat: StatName,
  amount: number,
  source: GrowthSource,
  eventId: string,
): StatChangeResult {
  const before = member.stats[stat];
  const minimum = stat === "energy" ? MIN_ENERGY : MIN_STAT;
  const maximum = stat === "energy" ? MAX_ENERGY : MAX_STAT;
  const after = Math.max(minimum, Math.min(maximum, before + Math.round(amount)));
  const next: MemberState = { ...member, stats: { ...member.stats, [stat]: after } };
  const actualDelta = after - before;

  if (stat === "energy" || actualDelta === 0) {
    return { member: next, actualDelta, spGain: 0, rankUps: [] };
  }

  const currentTier = memberRank(next).tier;
  const claimedTier = safeTier(next.spRewardThroughTier);

  if (source === "sp") {
    next.spRewardThroughTier = Math.max(claimedTier, currentTier) as RankTier;
    return { member: next, actualDelta, spGain: 0, rankUps: [] };
  }

  if (currentTier <= claimedTier) {
    return { member: next, actualDelta, spGain: 0, rankUps: [] };
  }

  let spGain = 0;
  const rankUps: RankTier[] = [];
  const notices: RankNotice[] = [...next.rankNotices];
  for (let tier = claimedTier + 1; tier <= currentTier; tier += 1) {
    const rankTier = safeTier(tier);
    const award = spForTier(rankTier);
    spGain += award;
    rankUps.push(rankTier);
    notices.push({ id: `${eventId}:tier-${tier}`, tier: rankTier, sp: award, source });
    next.rankHistory = [...next.rankHistory, formatRank(memberRankValueForTier(next, rankTier))];
  }

  next.sp += spGain;
  next.spRewardThroughTier = currentTier;
  next.rankNotices = notices;
  return { member: next, actualDelta, spGain, rankUps };
}

function memberRankValueForTier(member: MemberState, _tier: RankTier): number {
  return memberRank(member).value;
}

export function allocateMemberSP(member: MemberState, stat: CoreStat): MemberState | null {
  if (member.sp <= 0 || member.stats[stat] >= MAX_STAT) return null;
  const result = applyMemberStatChange(member, stat, 1, "sp", `sp-allocation:${stat}:${member.sp}`);
  return { ...result.member, sp: member.sp - 1 };
}
