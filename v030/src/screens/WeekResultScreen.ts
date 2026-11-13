import { STAT_LABELS } from "../domain/constants";
import { MEMBERS } from "../data/members";
import { selectWeekResult } from "../domain/selectors";
import { formatRank } from "../domain/rank";
import type { GameState, MemberId } from "../domain/types";
import { escapeHtml, formatMoney } from "../utils/format";
import { positiveDiff } from "./shared";

export function renderWeekResultScreen(state: GameState): string {
  const result = selectWeekResult(state);
  const missionCards = result.missions.length
    ? `<section class="result-card"><p class="eyebrow">WEEK MISSION</p><h2>今週の目標</h2><div class="mission-list">${result.missions.map((mission) => `<div class="mission-row ${mission.success ? "is-complete" : "is-pending"}"><span aria-hidden="true">${mission.success ? "✓" : "—"}</span><div><strong>${escapeHtml(mission.label)}</strong><small>現在 ${mission.value} / 目標 ${mission.target}</small></div></div>`).join("")}</div></section>`
    : "";
  const memberCards = result.members.map((entry) => {
    const id = entry.id as MemberId;
    return `<article class="week-member-result" style="--member-rgb:${MEMBERS[id].rgb}"><div class="week-member-heading"><strong>${escapeHtml(entry.name)}</strong><span>${entry.rank.rank}${entry.rank.point} · Lv.${entry.after.level}</span></div><div class="week-stat-grid">${(["vocal", "dance", "mc", "bond"] as const).map((stat) => `<div><span>${STAT_LABELS[stat]}</span><strong>${formatRank(entry.after.stats[stat])}</strong><small>${positiveDiff(entry.diff[stat])}</small></div>`).join("")}</div><div class="week-progress-line"><span>体力</span><b>${entry.after.stats.energy}</b><span class="inline-muted">(${positiveDiff(entry.diff.energy)})</span><span>EXP</span><b>Lv.${entry.after.level} · ${entry.after.exp}</b><span>SP</span><b>${entry.after.sp}</b></div></article>`;
  }).join("");
  const weekLabel = state.progress.week === 8 ? "NEXT SEASONへ" : `WEEK ${state.progress.week + 1}へ`;
  return `
    <section class="screen-shell week-result-screen">
      <p class="eyebrow">SEASON ${state.progress.season} · WEEK ${state.progress.week}</p>
      <h1>WEEK RESULT</h1>
      <p class="result-lead">今週の活動を振り返ろう。</p>
      <section class="resource-grid result-resources"><div class="resource-card"><span>認知度</span><strong>${result.snapshot?.resources.reach ?? state.resources.reach} → ${state.resources.reach}</strong><small>${positiveDiff(result.reachDelta)}</small></div><div class="resource-card"><span>ファン</span><strong>${result.snapshot?.resources.fans ?? state.resources.fans} → ${state.resources.fans}</strong><small>${positiveDiff(result.fansDelta)}</small></div><div class="resource-card"><span>活動資金</span><strong>${formatMoney(state.resources.cash)}</strong><small>${result.cashDelta < 0 ? `−${formatMoney(Math.abs(result.cashDelta))}` : positiveDiff(result.cashDelta)}</small></div><div class="resource-card"><span>自由行動</span><strong>${state.week.actionsUsed} / 3</strong><small>TP ${100 - state.week.tpRemaining} 消費 · 残り ${state.week.tpRemaining}</small></div></section>
      ${missionCards}
      <section class="result-card"><p class="eyebrow">MEMBER GROWTH</p><h2>4人の成長</h2><div class="week-member-list">${memberCards}</div></section>
      <button class="button button-primary button-large result-continue" type="button" data-action="next-week">${weekLabel}</button>
    </section>
  `;
}
