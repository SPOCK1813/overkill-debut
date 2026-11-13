import { MEMBER_PORTRAITS } from "../data/assetManifest";
import { MEMBERS } from "../data/members";
import { ACTIONS_PER_WEEK } from "../domain/constants";
import { selectHomeSummary } from "../domain/selectors";
import type { GameState, MemberId } from "../domain/types";
import { CONDITION_ICONS, CONDITION_LABELS, escapeHtml, formatMoney } from "../utils/format";

export function renderHomeScreen(state: GameState, options: { notice?: string | null; saveWarning?: string | null; audioEnabled?: boolean }): string {
  const summary = selectHomeSummary(state);
  const completed = state.week.actionsUsed >= ACTIONS_PER_WEEK;
  const storyPending = Boolean(state.progress.story.nodeId);
  const weekOneWeekend = state.progress.season === 1 && state.progress.week === 1;
  const modules: Array<{ key: string; label: string; subtitle: string; action: string; ready: boolean }> = [
    { key: "story", label: "STORY", subtitle: storyPending ? "未読・続きの物語" : "物語を読み返す", action: "open-story", ready: true },
    { key: "training", label: "TRAINING", subtitle: "レッスンと休養", action: "open-training", ready: true },
    { key: "activity", label: "ACTIVITY", subtitle: "活動メニュー", action: "open-placeholder", ready: false },
    { key: "live", label: "LIVE", subtitle: "ライブ機能", action: "open-placeholder", ready: false },
    { key: "member", label: "MEMBER", subtitle: "能力・ランク・SP", action: "open-member", ready: true },
    { key: "mission", label: "MISSION", subtitle: "ミッション", action: "open-placeholder", ready: false },
    { key: "room", label: "ROOM", subtitle: "ルーム・家具", action: "open-placeholder", ready: false },
  ];
  const members = summary.members.map((member) => {
    const id = member.id as MemberId;
    const expression = member.condition === "best" ? "smile" : member.condition === "bad" || member.condition === "worst" ? "troubled" : "normal";
    const image = MEMBER_PORTRAITS[id][expression];
    const rgb = MEMBERS[id].rgb;
    return `
      <article class="member-status-card" style="--member-color:${member.color};--member-rgb:${rgb}">
        <img class="member-avatar" src="${image}" alt="" loading="lazy" />
        <div class="member-status-copy">
          <div class="member-name-row"><strong>${escapeHtml(member.name)}</strong><span class="rank-chip">${member.rank.rank}${member.rank.point}</span></div>
          <p class="condition-line"><span>${CONDITION_ICONS[member.condition]}</span>${CONDITION_LABELS[member.condition]} · 体力 ${member.stats.energy}</p>
          <p class="member-mini-stats">歌 ${member.stats.vocal} · 踊 ${member.stats.dance} · MC ${member.stats.mc} · 連 ${member.stats.bond}</p>
        </div>
      </article>
    `;
  }).join("");
  const notice = options.notice ? `<div class="notice" role="status">${escapeHtml(options.notice)}</div>` : "";
  const saveWarning = options.saveWarning ? `<div class="notice notice-warning" role="status">${escapeHtml(options.saveWarning)}</div>` : "";
  const weekAction = completed
    ? `<button class="button button-primary button-large week-close-button" type="button" data-action="close-week">${state.week.weekendEventId ? "週末ストーリーを続ける" : weekOneWeekend ? "週末ストーリーへ" : "WEEK RESULTへ"}</button>`
    : "";
  return `
    <section class="screen-shell home-screen">
      <header class="home-topbar">
        <div><p class="eyebrow">O-VER-KiLL · MANAGER’S STORY</p><h1>HOME</h1></div>
        <div class="topbar-actions"><button class="button button-quiet audio-toggle" type="button" data-action="toggle-audio">BGM ${options.audioEnabled ? "ON" : "OFF"}</button><span class="week-pill">SEASON ${summary.season}<br><strong>WEEK ${summary.week}</strong></span></div>
      </header>
      ${notice}${saveWarning}
      <section class="week-meter" aria-label="今週の行動状況">
        <div class="meter-heading"><strong>今週の行動</strong><span>${summary.actionsRemaining} / ${ACTIONS_PER_WEEK} 回 残り</span></div>
        <div class="meter-track"><i style="width:${Math.round(summary.actionsUsed / ACTIONS_PER_WEEK * 100)}%"></i></div>
        <div class="meter-foot"><span>⚡ TP ${summary.tpRemaining} / 100</span><span>${summary.actionsUsed} / ${ACTIONS_PER_WEEK} 回使用</span></div>
      </section>
      <section class="resource-grid" aria-label="グループ資源">
        <div class="resource-card"><span>活動資金</span><strong>${formatMoney(summary.cash)}</strong></div>
        <div class="resource-card"><span>認知度</span><strong>${summary.reach.toLocaleString("ja-JP")}</strong></div>
        <div class="resource-card"><span>ファン</span><strong>${summary.fans.toLocaleString("ja-JP")}</strong></div>
      </section>
      <section class="home-section">
        <div class="section-heading"><div><p class="eyebrow">MEMBER CONDITION</p><h2>4人のコンディション</h2></div><button class="text-button" type="button" data-action="open-member">一覧を見る</button></div>
        <div class="member-status-list">${members}</div>
      </section>
      ${weekAction}
      <section class="home-section home-menu-section">
        <div class="section-heading"><div><p class="eyebrow">MANAGEMENT</p><h2>今日、何をする？</h2></div></div>
        <nav class="home-menu" aria-label="ゲームメニュー">
          ${modules.map((item) => `<button class="menu-card ${item.ready ? "" : "menu-card-planned"}" type="button" data-action="${item.action}" data-feature="${item.key}" ${!item.ready ? `aria-label="${item.label}・今回のPreviewでは未実装"` : ""}><span class="menu-card-mark" aria-hidden="true">${item.key === "story" ? "✦" : item.key === "training" ? "↗" : item.key === "member" ? "◎" : "·"}</span><strong>${item.label}</strong><small>${escapeHtml(item.subtitle)}</small>${item.ready ? "" : "<em>COMING SOON</em>"}</button>`).join("")}
        </nav>
      </section>
      <footer class="home-footer">v0.30 PREVIEW <span>ローカル保存</span></footer>
    </section>
  `;
}
