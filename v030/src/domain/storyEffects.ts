import { MEMBER_IDS } from "./types";
import { applyMemberStatChange } from "./sp";
import { addExperience } from "./progression";
import { cloneState } from "./stateFactory";
import type { CoreStat, GameState, MemberId } from "./types";

interface DecisionEffect {
  stats: Partial<Record<CoreStat, number>>;
  energy: number;
  exp: number;
}

function decisionForMember(decision: string, memberId: MemberId): DecisionEffect {
  if (decision === "teach") {
    if (memberId === "kilua") return { stats: { mc: 5, bond: 6, dance: 3 }, energy: -5, exp: 45 };
    return { stats: { dance: 3, bond: 2 }, energy: -5, exp: 25 };
  }
  if (decision === "split") return { stats: { dance: 4, bond: 3 }, energy: -6, exp: 30 };
  if (decision === "push") return { stats: { dance: memberId === "kilua" ? 4 : 6, bond: -2 }, energy: -11, exp: 35 };
  if (decision === "talk") return { stats: { bond: 4, mc: 2, dance: 1 }, energy: 2, exp: 25 };
  return { stats: {}, energy: 0, exp: 0 };
}

export function applyStoryDecision(state: GameState, decision: string, eventId = `legacy:w1-choice:${decision}`): { state: GameState; applied: boolean; spGain: number } {
  if (state.appliedEffectIds.includes(eventId)) return { state, applied: false, spGain: 0 };
  const next = cloneState(state);
  let spGain = 0;
  for (const id of MEMBER_IDS) {
    const effect = decisionForMember(decision, id);
    for (const [stat, amount] of Object.entries(effect.stats) as [CoreStat, number][]) {
      const result = applyMemberStatChange(next.members[id], stat, amount, "story", `${eventId}:${id}:${stat}`);
      next.members[id] = result.member;
      spGain += result.spGain;
    }
    const energy = applyMemberStatChange(next.members[id], "energy", effect.energy, "story", `${eventId}:${id}:energy`);
    next.members[id] = energy.member;
    const experience = addExperience(next.members[id], effect.exp);
    next.members[id] = experience.member;
  }
  next.appliedEffectIds = [...next.appliedEffectIds, eventId];
  next.updatedAt = new Date().toISOString();
  return { state: next, applied: true, spGain };
}
