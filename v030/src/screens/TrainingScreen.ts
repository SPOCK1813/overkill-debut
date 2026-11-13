import { TRAINING_ACTIONS } from "../data/actions";
import { MEMBERS } from "../data/members";
import { CONDITION_ICONS, CONDITION_LABELS, escapeHtml, formatMoney } from "../utils/format";
import { conditionForEnergy } from "../domain/training";
import { MEMBER_PORTRAITS } from "../data/assetManifest";
import type { GameState, MemberId } from "../domain/types";
import { screenHeader } from "./shared";

export function renderTrainingScreen(state: GameState, selected: MemberId | null, errorMessage?: string | null): string {
  const memberButtons = (Object.keys(MEMBERS) as MemberId[]).map((id) => {
    const member = state.members[id];
    const condition = conditionForEnergy(member.stats.energy);
    const expression = condition === "best" ? "smile" : "normal";
    return `<button class="training-member ${selected === id ? "is-selected" : ""}" type="button" data-action="select-member" data-member-id="${id}" aria-pressed="${selected === id}"><img src="${MEMBER_PORTRAITS[id][expression]}" alt="" loading="lazy"><span><strong>${escapeHtml(MEMBERS[id].name)}</strong><small>${CONDITION_ICONS[condition]} ${CONDITION_LABELS[condition]} · 体力 ${member.stats.energy}</small></span></button>`;
  }).join("");
  const cards = TRAINING_ACTIONS.map((action) => {
    const noTP = action.tp > state.week.tpRemaining;
    const noCash = action.cash < 0 && Math.abs(action.cash) > state.resources.cash;
    const closed = state.week.actionsUsed >= 3;
    const disabled = !selected || noTP || noCash || closed;
    const price = action.cash < 0 ? formatMoney(Math.abs(action.cash)) : "無料";
    const cost = action.tp === 0 ? "TP 0" : `TP ${action.tp}`;
    return `<button class="training-action ${disabled ? "is-disabled" : ""}" type="button" data-action="train" data-training-id="${action.id}" ${disabled ? "disabled" : ""}><span class="action-icon" aria-hidden="true">${action.icon}</span><span class="action-copy"><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.description)}</small><span class="action-cost"><b>${cost}</b><span>${price}</span></span></span></button>`;
  }).join("");
  return `
    <section class="screen-shell training-screen">
      ${screenHeader(state, "TRAINING")}
      ${errorMessage ? `<div class="notice notice-error" role="alert">${escapeHtml(errorMessage)}</div>` : ""}
      <section class="training-summary"><div><span>残り行動</span><strong>${Math.max(0, 3 - state.week.actionsUsed)} / 3</strong></div><div><span>残りTP</span><strong>⚡ ${state.week.tpRemaining}</strong></div><div><span>活動資金</span><strong>${formatMoney(state.resources.cash)}</strong></div></section>
      <section class="screen-section"><div class="section-heading"><div><p class="eyebrow">CHOOSE A MEMBER</p><h2>育成するメンバー</h2></div></div><div class="training-member-list">${memberButtons}</div></section>
      <section class="screen-section"><div class="section-heading"><div><p class="eyebrow">WEEKLY ACTION</p><h2>${selected ? `${escapeHtml(MEMBERS[selected].name)}と活動する` : "行動を選ぶ"}</h2></div></div><div class="training-action-list">${cards}</div></section>
      <p class="screen-footnote">1週あたり3行動。TPと活動資金の両方を確認して選択してください。休養はTP0でも行動を1回使います。</p>
    </section>
  `;
}
