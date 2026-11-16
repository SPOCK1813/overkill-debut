import { TRAINING_ACTION_BY_ID } from "../data/actions";
import { ACTIONS_PER_WEEK, STAT_LABELS } from "../domain/constants";
import { memberRank, formatRank } from "../domain/rank";
import { CORE_STATS, type GameState, type MemberId, type StatName } from "../domain/types";
import { conditionForEnergy } from "../domain/training";
import { CONDITION_ICONS, CONDITION_LABELS, escapeHtml, formatMoney } from "../utils/format";
import { renderSarinaChibi } from "../components/chibi/sarina/SarinaChibi";
import { screenHeader } from "./shared";

const TEMPORARY_ART_LABEL = '<span class="prototype-temp-label prototype-temp-label--inline">ANIMATION TEST · 仮ビジュアル</span>';

export function renderGameFeelTrainingScreen(
  state: GameState,
  selected: MemberId | null,
  notice?: string | null,
): string {
  const member = state.members.sarina;
  const condition = conditionForEnergy(member.stats.energy);
  const dance = TRAINING_ACTION_BY_ID.dance;
  const selectedSarina = selected === "sarina";
  const weekClosed = state.week.actionsUsed >= ACTIONS_PER_WEEK;
  const noTP = state.week.tpRemaining < dance.tp;
  const disabled = !selectedSarina || weekClosed || noTP;
  const reason = weekClosed
    ? "今週の行動は終了しました。"
    : noTP
      ? `ダンスにはTP ${dance.tp}が必要です。`
      : "SARiNAを選ぶとレッスンできます。";

  return `
    <section class="screen-shell gamefeel-training-screen">
      ${screenHeader(state, "TRAINING")}
      ${notice ? `<div class="notice notice-error" role="alert">${escapeHtml(notice)}</div>` : ""}
      <p class="eyebrow">ONE LESSON · ONE MEMBER</p>
      <h1>ダンスレッスン</h1>
      <p class="screen-intro">SARiNAを選んで、今日のレッスンを始めよう。</p>
      <section class="prototype-training-card" aria-label="SARiNAを選択">
        <div class="prototype-training-avatar">${renderSarinaChibi({ placement: "home", mood: "idle", ariaLabel: "SARiNAの仮アニメーション" })}</div>
        <div class="prototype-training-member-copy">
          <p class="eyebrow">GREEN POSITION</p>
          <h2>SARiNA</h2>
          ${TEMPORARY_ART_LABEL}
          <p>${CONDITION_ICONS[condition]} ${CONDITION_LABELS[condition]} · 体力 ${member.stats.energy}/100</p>
          <p>ダンス ${formatRank(member.stats.dance)}</p>
          <button class="button ${selectedSarina ? "button-selected" : "button-primary"} prototype-select-member" type="button" data-action="select-member" data-member-id="sarina" aria-pressed="${selectedSarina}">${selectedSarina ? "SARiNAを選択中 ✓" : "SARiNAを選ぶ"}</button>
        </div>
      </section>
      <section class="prototype-training-action" aria-label="レッスンを選ぶ">
        <div class="prototype-action-heading"><div><p class="eyebrow">WEEKLY ACTION</p><h2>レッスンを選ぶ</h2></div><span class="prototype-cost">TP ${state.week.tpRemaining} / 100</span></div>
        <button class="prototype-dance-card ${disabled ? "is-disabled" : ""}" type="button" data-action="train" data-training-id="dance" ${disabled ? "disabled" : ""}>
          <span class="prototype-dance-icon" aria-hidden="true">♬</span>
          <span class="prototype-dance-copy"><strong>${escapeHtml(dance.label)}</strong><small>${escapeHtml(dance.description)}</small><span>TP ${dance.tp} · ${formatMoney(Math.abs(dance.cash))}</span></span>
          <span class="prototype-dance-arrow" aria-hidden="true">›</span>
        </button>
        ${disabled ? `<p class="prototype-training-hint">${escapeHtml(reason)}</p>` : '<p class="prototype-training-hint">レッスン後に成功結果と成長が表示されます。</p>'}
      </section>
      <div class="prototype-week-strip"><span>残り行動 <strong>${Math.max(0, ACTIONS_PER_WEEK - state.week.actionsUsed)} / ${ACTIONS_PER_WEEK}</strong></span><span>活動資金 <strong>${formatMoney(state.resources.cash)}</strong></span></div>
      <footer class="prototype-footer">この画面はGame Feel確認用の試作です。</footer>
    </section>
  `;
}

export function renderGameFeelMemberScreen(state: GameState, notice?: string | null): string {
  const member = state.members.sarina;
  const rank = memberRank(member);
  const stats: StatName[] = [...CORE_STATS];
  return `
    <section class="screen-shell gamefeel-member-screen">
      ${screenHeader(state, "MEMBER")}
      ${notice ? `<div class="notice" role="status">${escapeHtml(notice)}</div>` : ""}
      <section class="prototype-member-card">
        <div class="prototype-member-avatar">${renderSarinaChibi({ placement: "home", mood: "idle", ariaLabel: "SARiNAの仮アニメーション" })}</div>
        <div><p class="eyebrow">MEMBER RANK</p><h2>SARiNA</h2>${TEMPORARY_ART_LABEL}<strong class="prototype-member-rank">${rank.rank}${rank.point}</strong><p>4能力平均 ${rank.value} · Lv.${member.level} · EXP ${member.exp}</p></div>
      </section>
      <section class="prototype-stat-panel" aria-label="SARiNAのステータス">
        ${stats.map((stat) => `<div class="prototype-stat-row"><span>${STAT_LABELS[stat]}</span><strong>${formatRank(member.stats[stat])}</strong></div>`).join("")}
        <div class="prototype-stat-row"><span>体力</span><strong>${member.stats.energy} / 100</strong></div>
        <div class="prototype-stat-row"><span>自由配分SP</span><strong>${member.sp}</strong></div>
      </section>
      <p class="prototype-footer">この試作ではSARiNAだけを表示しています。4人への拡張は後工程です。</p>
    </section>
  `;
}
