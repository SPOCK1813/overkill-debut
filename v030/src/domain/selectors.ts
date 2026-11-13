import { ACTIONS_PER_WEEK } from "./constants";
import { MEMBERS } from "../data/members";
import { memberRank, memberRankValue } from "./rank";
import { conditionForEnergy } from "./training";
import type { GameState, MemberId, MemberState, StatName } from "./types";

export function selectHomeSummary(state: GameState) {
  return {
    season: state.progress.season,
    week: state.progress.week,
    actionsUsed: state.week.actionsUsed,
    actionsRemaining: Math.max(0, ACTIONS_PER_WEEK - state.week.actionsUsed),
    tpRemaining: state.week.tpRemaining,
    cash: state.resources.cash,
    reach: state.resources.reach,
    fans: state.resources.fans,
    members: Object.keys(MEMBERS).map((id) => {
      const memberId = id as MemberId;
      const member = state.members[memberId];
      return {
        id: memberId,
        name: MEMBERS[memberId].name,
        color: MEMBERS[memberId].color,
        rank: memberRank(member),
        condition: conditionForEnergy(member.stats.energy),
        stats: member.stats,
        level: member.level,
        exp: member.exp,
        sp: member.sp,
      };
    }),
  };
}

export function statDifference(current: MemberState, previous: MemberState | { stats: MemberState["stats"] }): Record<StatName, number> {
  return {
    vocal: current.stats.vocal - previous.stats.vocal,
    dance: current.stats.dance - previous.stats.dance,
    mc: current.stats.mc - previous.stats.mc,
    bond: current.stats.bond - previous.stats.bond,
    energy: current.stats.energy - previous.stats.energy,
  };
}

function averageStat(state: GameState, stat: StatName): number {
  const total = Object.values(state.members).reduce((sum, member) => sum + member.stats[stat], 0);
  return Math.round(total / Object.keys(state.members).length);
}

function minimumStat(state: GameState, stat: StatName): number {
  return Math.min(...Object.values(state.members).map((member) => member.stats[stat]));
}

export function selectWeekResult(state: GameState) {
  const snapshot = state.weekStartSnapshot;
  const changes = snapshot
    ? Object.keys(state.members).map((id) => {
        const memberId = id as MemberId;
        const member = state.members[memberId];
        const before = snapshot.members[memberId];
        return {
          id: memberId,
          name: MEMBERS[memberId].name,
          before,
          after: member,
          diff: statDifference(member, before),
          rank: memberRank(member),
          rankValue: memberRankValue(member.stats),
        };
      })
    : [];
  const missions = state.progress.season === 1 && state.progress.week === 1
      ? [
        { id: "dance", label: "ダンス平均 45以上", value: averageStat(state, "dance"), target: 45 },
        { id: "bond", label: "連携平均 45以上", value: averageStat(state, "bond"), target: 45 },
        { id: "energy", label: "全員の体力40以上", value: minimumStat(state, "energy"), target: 40 },
      ].map((mission) => ({ ...mission, success: mission.value >= mission.target }))
    : [];
  return {
    season: state.progress.season,
    week: state.progress.week,
    snapshot,
    resources: state.resources,
    reachDelta: snapshot ? state.resources.reach - snapshot.resources.reach : 0,
    fansDelta: snapshot ? state.resources.fans - snapshot.resources.fans : 0,
    cashDelta: snapshot ? state.resources.cash - snapshot.resources.cash : 0,
    members: changes,
    missions,
  };
}
