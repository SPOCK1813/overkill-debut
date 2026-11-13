import { describe, expect, it } from "vitest";
import { formatRank, memberRankValue, rankParts } from "../src/domain/rank";
import { applyMemberStatChange, allocateMemberSP } from "../src/domain/sp";
import { executeTraining } from "../src/domain/training";
import { applyStoryDecision } from "../src/domain/storyEffects";
import { cloneState, createInitialState } from "../src/domain/stateFactory";
import { SequenceRandomSource } from "../src/services/RandomSource";
import { selectWeekResult } from "../src/domain/selectors";
import type { GameState } from "../src/domain/types";

function playingState(): GameState {
  const state = createInitialState("2026-01-01T00:00:00.000Z");
  state.started = true;
  state.progress.phase = "training";
  return state;
}

function backHome(state: GameState): GameState {
  const next = cloneState(state);
  next.week.pendingActionId = null;
  next.progress.phase = "home";
  return next;
}

describe("rank and member rank", () => {
  it("maps E1–SS100 boundaries without overlapping tiers", () => {
    expect(formatRank(1)).toBe("E1");
    expect(formatRank(100)).toBe("E100");
    expect(formatRank(101)).toBe("D1");
    expect(formatRank(200)).toBe("D100");
    expect(formatRank(201)).toBe("C1");
    expect(formatRank(700)).toBe("SS100");
    expect(rankParts(0).value).toBe(1);
    expect(rankParts(701).value).toBe(700);
  });

  it("uses the rounded mean of four core abilities, never energy", () => {
    expect(memberRankValue({ vocal: 80, dance: 130, mc: 70, bond: 60, energy: 0 })).toBe(85);
  });

  it("awards SP on ordinary growth but advances the tier without awarding on SP allocation", () => {
    const member = playingState().members.sarina;
    member.sp = 2;
    member.stats = { vocal: 100, dance: 100, mc: 100, bond: 100, energy: 50 };
    member.spRewardThroughTier = 0;
    const ordinary = applyMemberStatChange(member, "vocal", 2, "training", "training-rank-up");
    expect(ordinary.spGain).toBe(3);
    expect(ordinary.member.spRewardThroughTier).toBe(1);

    const noFreeSP = { ...member, sp: 2 };
    const first = allocateMemberSP(noFreeSP, "vocal");
    expect(first?.sp).toBe(1);
    const second = allocateMemberSP(first!, "vocal");
    expect(second?.sp).toBe(0);
    expect(second?.spRewardThroughTier).toBe(1);
    const laterTraining = applyMemberStatChange(second!, "vocal", 1, "training", "same-tier-training");
    expect(laterTraining.spGain).toBe(0);
  });
});

describe("weekly actions", () => {
  it("keeps the existing success formula and commits the outcome once", () => {
    const state = playingState();
    const result = executeTraining(state, "sarina", "dance", new SequenceRandomSource([0.5]), { id: "w1-dance-1", now: "2026-01-01T00:01:00.000Z" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.outcome).toBe("success");
    expect(result.record.tpCost).toBe(35);
    expect(result.record.statDelta.dance).toBe(7);
    expect(result.record.statDelta.energy).toBe(-7);
    expect(result.record.expGain).toBe(62);
    expect(result.record.cashDelta).toBe(-3000);
    expect(result.state.week.tpRemaining).toBe(65);
    expect(result.state.week.actionsUsed).toBe(1);
    expect(result.state.week.pendingActionId).toBe("w1-dance-1");
    const duplicate = executeTraining(result.state, "sarina", "dance", new SequenceRandomSource([0.5]), { id: "w1-dance-1" });
    expect(duplicate.ok).toBe(false);
    expect(result.state.week.actionHistory).toHaveLength(1);
  });

  it("lets free rest consume one action and recover 13 energy", () => {
    const result = executeTraining(playingState(), "sarina", "rest", new SequenceRandomSource([0.99]), { id: "w1-rest-1" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.record.tpCost).toBe(0);
    expect(result.record.statDelta.energy).toBe(13);
    expect(result.state.members.sarina.stats.energy).toBe(85);
    expect(result.state.week.actionsUsed).toBe(1);
    expect(result.state.week.tpRemaining).toBe(100);
  });

  it("rejects insufficient TP without changing any state", () => {
    const state = playingState();
    state.week.tpRemaining = 20;
    const before = JSON.stringify(state);
    const result = executeTraining(state, "sarina", "dance", new SequenceRandomSource([0.5]), { id: "rejected" });
    expect(result.ok).toBe(false);
    expect(JSON.stringify(state)).toBe(before);
  });

  it("rejects a fourth action after three committed actions", () => {
    let state = playingState();
    const actions = ["mc", "sns", "rest"] as const;
    for (let i = 0; i < actions.length; i += 1) {
      const result = executeTraining(state, "sarina", actions[i], new SequenceRandomSource([0.5]), { id: `action-${i}` });
      expect(result.ok).toBe(true);
      if (result.ok) state = backHome(result.state);
    }
    expect(state.week.actionsUsed).toBe(3);
    const rejected = executeTraining(state, "sarina", "rest", new SequenceRandomSource([0.5]), { id: "action-4" });
    expect(rejected.ok).toBe(false);
    expect(state.week.actionHistory).toHaveLength(3);
  });
});

describe("story effects", () => {
  it("applies Week 1 split as a fixed effect, without spending an action or TP, only once", () => {
    const state = playingState();
    const first = applyStoryDecision(state, "split", "split-once");
    expect(first.applied).toBe(true);
    expect(first.state.members.sarina.stats.dance - state.members.sarina.stats.dance).toBe(4);
    expect(first.state.members.sarina.stats.bond - state.members.sarina.stats.bond).toBe(3);
    expect(first.state.members.sarina.stats.energy - state.members.sarina.stats.energy).toBe(-6);
    expect(first.state.members.sarina.exp - state.members.sarina.exp).toBe(30);
    expect(first.state.week.actionsUsed).toBe(0);
    expect(first.state.week.tpRemaining).toBe(100);
    const repeated = applyStoryDecision(first.state, "split", "split-once");
    expect(repeated.applied).toBe(false);
    expect(repeated.state.members.sarina.stats.dance).toBe(first.state.members.sarina.stats.dance);
  });
});

describe("Week 1 mission labels", () => {
  it("shows the same numeric thresholds used by the legacy mission rules", () => {
    const missions = selectWeekResult(createInitialState()).missions;
    expect(missions.map(({ label, target }) => [label, target])).toEqual([
      ["ダンス平均 45以上", 45],
      ["連携平均 45以上", 45],
      ["全員の体力40以上", 40],
    ]);
  });
});
