import { CONDITION_PROBABILITIES, MAX_ENERGY, MIN_ENERGY, OUTCOME_DEFINITIONS } from "./constants";
import { TRAINING_ACTION_BY_ID } from "../data/actions";
import { applyMemberStatChange } from "./sp";
import { addExperience, canUseAction, weekKey } from "./progression";
import { cloneState, createId } from "./stateFactory";
import type { ActionRecord, ActionType, GameState, MemberId, TrainingDefinition, TrainingOutcomeKey } from "./types";
import type { RandomSource } from "../services/RandomSource";

export type ConditionKey = "best" | "good" | "normal" | "bad" | "worst";

export function conditionForEnergy(energy: number): ConditionKey {
  if (energy >= 80) return "best";
  if (energy >= 60) return "good";
  if (energy >= 40) return "normal";
  if (energy >= 20) return "bad";
  return "worst";
}

export function rollTrainingOutcome(energy: number, random: RandomSource): Exclude<TrainingOutcomeKey, "rest"> {
  const condition = conditionForEnergy(energy);
  const probabilities = CONDITION_PROBABILITIES[condition];
  let roll = Math.max(0, Math.min(99.999999, random.next() * 100));
  for (const key of ["super", "great", "success", "normal", "fail"] as const) {
    roll -= probabilities[key];
    if (roll < 0) return key;
  }
  return "normal";
}

export interface TrainingSuccess {
  ok: true;
  state: GameState;
  record: ActionRecord;
}

export interface TrainingFailure {
  ok: false;
  reason: string;
}

export function executeTraining(
  state: GameState,
  memberId: MemberId,
  actionId: ActionType,
  random: RandomSource,
  options: { id?: string; now?: string } = {},
): TrainingSuccess | TrainingFailure {
  const action: TrainingDefinition | undefined = TRAINING_ACTION_BY_ID[actionId];
  const member = state.members[memberId];
  if (!action || !member) return { ok: false, reason: "選択した行動またはメンバーが見つかりません。" };
  if (state.week.pendingActionId) return { ok: false, reason: "前の行動結果を確定中です。" };
  const available = canUseAction(state, action.tp);
  if (!available.ok) return available;
  if (action.cash < 0 && state.resources.cash < Math.abs(action.cash)) {
    return { ok: false, reason: "活動資金が足りません。" };
  }

  const id = options.id ?? createId("action");
  if (state.week.actionHistory.some((entry) => entry.id === id)) {
    return { ok: false, reason: "この行動はすでに適用されています。" };
  }
  const now = options.now ?? new Date().toISOString();
  const outcomeKey: TrainingOutcomeKey = actionId === "rest" ? "rest" : rollTrainingOutcome(member.stats.energy, random);
  const outcome = OUTCOME_DEFINITIONS[outcomeKey];
  const conditionKey = conditionForEnergy(member.stats.energy);
  const multiplier = outcome.statMultiplier;
  const expMultiplier = outcome.expMultiplier;
  const next = cloneState(state);
  const target = next.members[memberId];
  const statDelta: ActionRecord["statDelta"] = {};
  let spGain = 0;

  const apply = (stat: keyof typeof target.stats, delta: number, event: string): number => {
    const result = applyMemberStatChange(target, stat, delta, "training", `${id}:${event}`);
    next.members[memberId] = result.member;
    Object.assign(target, result.member);
    if (result.spGain) spGain += result.spGain;
    return result.actualDelta;
  };

  if (action.primaryStat && action.primaryGain) {
    const gain = Math.max(0, Math.round(action.primaryGain * 1.5 * multiplier));
    const actual = apply(action.primaryStat, gain, action.primaryStat);
    if (actual) statDelta[action.primaryStat] = (statDelta[action.primaryStat] ?? 0) + actual;
  }
  if (action.bondGain) {
    const gain = Math.max(0, Math.round(action.bondGain * 1.5 * multiplier));
    const actual = apply("bond", gain, "bond");
    if (actual) statDelta.bond = (statDelta.bond ?? 0) + actual;
  }
  if (action.energy) {
    const actual = apply("energy", action.energy, "energy");
    if (actual) statDelta.energy = (statDelta.energy ?? 0) + actual;
  }

  const reachGain = action.reach ? Math.max(1, Math.round(action.reach * multiplier)) : 0;
  const fansGain = reachGain > 0 && (actionId === "sns" || actionId === "flyer")
    ? Math.max(1, Math.floor(reachGain / 4))
    : 0;
  const expGain = Math.max(1, Math.round(action.exp * 1.6 * expMultiplier));
  next.resources.reach += reachGain;
  next.resources.fans += fansGain;
  const cashBefore = next.resources.cash;
  next.resources.cash = Math.max(0, next.resources.cash + action.cash);
  const cashDelta = next.resources.cash - cashBefore;
  const expResult = addExperience(next.members[memberId], expGain);
  next.members[memberId] = expResult.member;
  next.week.actionsUsed += 1;
  next.week.tpRemaining = Math.max(0, next.week.tpRemaining - action.tp);
  next.progress.phase = "actionResult";
  next.ui.lastStablePhase = "home";
  next.week.pendingActionId = id;
  next.updatedAt = now;

  const record: ActionRecord = {
    id,
    weekKey: weekKey(state),
    type: actionId,
    memberId,
    tpCost: action.tp,
    outcome: outcomeKey,
    conditionKey,
    statDelta,
    expGain,
    reachGain,
    fansGain,
    cashDelta,
    levelUps: expResult.levels,
    spGain,
    applied: true,
    createdAt: now,
  };
  next.week.actionHistory.push(record);
  return { ok: true, state: next, record };
}
