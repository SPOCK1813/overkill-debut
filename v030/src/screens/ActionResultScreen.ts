import { MEMBERS } from "../data/members";
import { OUTCOME_DEFINITIONS, STAT_LABELS } from "../domain/constants";
import { memberRank } from "../domain/rank";
import type { ActionRecord, GameState, StatName } from "../domain/types";
import { escapeHtml, formatMoney } from "../utils/format";
import { positiveDiff } from "./shared";
import { renderSarinaChibi } from "../components/chibi/sarina/SarinaChibi";

export function renderActionResultScreen(state: GameState, record: ActionRecord): string {
  const member = state.members[record.memberId];
  const rank = memberRank(member);
  const outcome = OUTCOME_DEFINITIONS[record.outcome];
  const changes = Object.entries(record.statDelta).filter((entry): entry is [StatName, number] => typeof entry[1] === "number");
  return `
      <section class="screen-shell result-screen action-result-screen">
        <p class="eyebrow">ACTION RESULT · ${state.week.actionsUsed} / 3</p>
        <h1>${escapeHtml(outcome.icon)} ${escapeHtml(outcome.label)}</h1>
        <p class="result-lead">${escapeHtml(MEMBERS[record.memberId].name)} · ${escapeHtml(record.type.toUpperCase())}</p>
      ${record.memberId === "sarina" && record.type === "dance" && record.outcome !== "fail" ? `<section class="prototype-result-celebration" aria-label="SARiNAの成功リアクション">${renderSarinaChibi({ placement: "home", mood: "happy", ariaLabel: "SARiNAが喜んでいます" })}<div class="prototype-result-copy"><strong>GREAT WORK!</strong><p>やった！ちょっとずつ揃ってきたね。</p><span class="prototype-temp-label prototype-temp-label--inline">ANIMATION TEST · 仮ビジュアル</span></div></section>` : ""}
        <div class="result-highlight"><span>今回のEXP</span><strong>+${record.expGain}</strong><small>Lv.${member.level} · EXP ${member.exp}</small></div>
      <section class="result-card"><h2>変化</h2><div class="result-list">${changes.map(([stat, delta]) => `<div><span>${STAT_LABELS[stat]}</span><strong>${positiveDiff(delta)}</strong></div>`).join("") || '<div><span>能力</span><strong>変化なし</strong></div>'}${record.reachGain ? `<div><span>認知度</span><strong>+${record.reachGain}</strong></div>` : ""}${record.fansGain ? `<div><span>ファン</span><strong>+${record.fansGain}</strong></div>` : ""}<div><span>活動資金</span><strong>${record.cashDelta < 0 ? `−${formatMoney(Math.abs(record.cashDelta))}` : positiveDiff(record.cashDelta)}</strong></div><div><span>残りTP</span><strong>${state.week.tpRemaining}</strong></div><div><span>残り行動</span><strong>${Math.max(0, 3 - state.week.actionsUsed)} / 3</strong></div><div><span>MEMBER RANK</span><strong>${rank.rank}${rank.point} · 平均 ${rank.value}</strong></div><div><span>獲得SP</span><strong>${record.spGain ? `+${record.spGain}` : "—"}</strong></div></div></section>
        <p class="screen-footnote">結果は保存済みです。再読み込みしても同じ結果を表示し、二重適用しません。</p>
        <button class="button button-primary button-large result-continue" type="button" data-action="action-result-continue">HOMEへ戻る</button>
      </section>
  `;
}
