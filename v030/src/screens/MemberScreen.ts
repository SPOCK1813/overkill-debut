import { STAT_LABELS } from "../domain/constants";
import { CORE_STATS, type GameState, type MemberId } from "../domain/types";
import { MEMBERS } from "../data/members";
import { memberRank, formatRank } from "../domain/rank";
import { MEMBER_PORTRAITS } from "../data/assetManifest";
import { escapeHtml } from "../utils/format";
import { screenHeader } from "./shared";

export function renderMemberScreen(state: GameState, notice?: string | null): string {
  const cards = (Object.keys(MEMBERS) as MemberId[]).map((id) => {
    const member = state.members[id];
    const rank = memberRank(member);
    return `<article class="member-detail-card" style="--member-color:${MEMBERS[id].color};--member-rgb:${MEMBERS[id].rgb}"><div class="member-detail-top"><img src="${MEMBER_PORTRAITS[id].normal}" alt="" loading="lazy"><div><p class="eyebrow">MEMBER RANK</p><h2>${escapeHtml(MEMBERS[id].name)}</h2><strong class="member-rank-large">${rank.rank}${rank.point}</strong><small>能力平均 ${rank.value} · Lv.${member.level} · EXP ${member.exp}</small></div></div><div class="member-stat-list">${CORE_STATS.map((stat) => `<div class="member-stat-row"><div><span>${STAT_LABELS[stat]}</span><strong>${formatRank(member.stats[stat])}</strong></div><button class="button button-sp" type="button" data-action="allocate-sp" data-member-id="${id}" data-stat="${stat}" ${member.sp <= 0 || member.stats[stat] >= 700 ? "disabled" : ""} aria-label="${escapeHtml(MEMBERS[id].name)}の${STAT_LABELS[stat]}へSPを1ポイント配分">＋1 SP</button></div>`).join("")}<div class="member-stat-row energy-row"><div><span>体力</span><strong>${member.stats.energy} / 100</strong></div><span class="energy-meter"><i style="width:${member.stats.energy}%"></i></span></div></div><div class="sp-balance"><span>自由配分SP</span><strong>${member.sp}</strong><small>配分は週行動を消費しません。</small></div></article>`;
  }).join("");
  return `<section class="screen-shell member-screen">${screenHeader(state, "MEMBER")}${notice ? `<div class="notice" role="status">${escapeHtml(notice)}</div>` : ""}<p class="screen-intro">4能力の平均がMEMBER RANK。自由配分SPは歌唱・ダンス・MC・連携へ1ポイントずつ使えます。</p><div class="member-detail-list">${cards}</div></section>`;
}
