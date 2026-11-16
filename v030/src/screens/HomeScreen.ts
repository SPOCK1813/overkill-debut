import { MEMBERS } from "../data/members";
import { ACTIONS_PER_WEEK } from "../domain/constants";
import { memberRank, formatRank } from "../domain/rank";
import { selectHomeSummary } from "../domain/selectors";
import { conditionForEnergy } from "../domain/training";
import type { GameState } from "../domain/types";
import { CONDITION_ICONS, CONDITION_LABELS, escapeHtml, formatMoney } from "../utils/format";
import { renderSarinaChibi } from "../components/chibi/sarina/SarinaChibi";

export function renderHomeScreen(
  state: GameState,
  options: { notice?: string | null; saveWarning?: string | null; audioEnabled?: boolean; rewardPulse?: boolean },
): string {
  const summary = selectHomeSummary(state);
  const member = state.members.sarina;
  const rank = memberRank(member);
  const condition = conditionForEnergy(member.stats.energy);
  const remaining = Math.max(0, ACTIONS_PER_WEEK - state.week.actionsUsed);
  const lastAction = state.week.actionHistory.at(-1);
  const danceIncreased = Boolean(options.rewardPulse && lastAction?.memberId === "sarina" && (lastAction.statDelta.dance ?? 0) > 0);
  const notice = options.notice ? `<div class="notice" role="status">${escapeHtml(options.notice)}</div>` : "";
  const saveWarning = options.saveWarning ? `<div class="notice notice-warning" role="status">${escapeHtml(options.saveWarning)}</div>` : "";
  const remainingClass = options.rewardPulse ? " value-pop" : "";
  return `
    <section class="screen-shell prototype-home-screen">
      <header class="prototype-home-header">
        <div class="prototype-brand"><span class="prototype-brand-mark" aria-hidden="true">O/K</span><div><p class="eyebrow">UNDERGROUND IDOL PROJECT</p><h1>O-VER-KiLL</h1></div></div>
        <div class="prototype-season-pill"><span>SEASON ${summary.season}</span><strong>WEEK ${summary.week}</strong></div>
      </header>
      ${notice}${saveWarning}
      <section class="prototype-week-grid" aria-label="今週の行動状況">
        <div class="prototype-week-stat"><span>残り行動</span><strong class="${remainingClass.trim()}">${remaining}<small> / ${ACTIONS_PER_WEEK}</small></strong><i class="prototype-action-dots" aria-hidden="true">${[0, 1, 2].map((index) => `<b class="${index < state.week.actionsUsed ? "is-used" : ""}"></b>`).join("")}</i></div>
        <div class="prototype-week-stat"><span>TP残り</span><strong class="${remainingClass.trim()}">⚡ ${summary.tpRemaining}<small> / 100</small></strong><div class="prototype-tp-track"><i style="width:${Math.max(0, Math.min(100, summary.tpRemaining))}%"></i></div></div>
      </section>
      <section class="prototype-home-hero" aria-label="SARiNA">
        <div class="prototype-hero-art"><span class="prototype-avatar-glow" aria-hidden="true"></span>${renderSarinaChibi({ placement: "home", mood: condition === "best" ? "happy" : "idle", ariaLabel: "SARiNAの仮アニメーション" })}</div>
        <div class="prototype-hero-copy"><p class="prototype-hero-eyebrow"><i aria-hidden="true"></i> GREEN POSITION</p><h2>SARiNA</h2><span class="prototype-temp-label prototype-temp-label--inline">ANIMATION TEST · 仮ビジュアル</span><p class="prototype-hero-quote">「今日のレッスン、ちゃんと見ててね。」</p><div class="prototype-rank-row"><span>MEMBER RANK</span><strong>${rank.rank}${rank.point}</strong></div><div class="prototype-quick-stats"><span>状態 ${CONDITION_ICONS[condition]} ${CONDITION_LABELS[condition]}</span><span>ダンス <strong class="${danceIncreased ? "value-pop" : ""}">${formatRank(member.stats.dance)}</strong></span></div></div>
      </section>
      <section class="prototype-resource-grid" aria-label="グループ資源">
        <div class="prototype-resource-card"><span>ファン</span><strong>${summary.fans.toLocaleString("ja-JP")}</strong><small>FANS</small></div>
        <div class="prototype-resource-card"><span>認知度</span><strong>${summary.reach.toLocaleString("ja-JP")}</strong><small>REACH</small></div>
        <div class="prototype-resource-card"><span>活動資金</span><strong>${formatMoney(summary.cash)}</strong><small>FUNDS</small></div>
      </section>
      <section class="prototype-menu-section">
        <div class="prototype-section-heading"><div><p class="eyebrow">MANAGER'S DESK</p><h2>次の一歩を選ぶ</h2></div><span>タップで進行</span></div>
        <nav class="prototype-menu-grid" aria-label="ゲームメニュー">
          <button class="prototype-menu-card" type="button" data-action="open-story"><span class="prototype-menu-icon" aria-hidden="true">✦</span><strong>STORY</strong><small>会話を読む</small></button>
          <button class="prototype-menu-card" type="button" data-action="open-training"><span class="prototype-menu-icon" aria-hidden="true">♬</span><strong>TRAINING</strong><small>ダンスレッスン</small></button>
          <button class="prototype-menu-card" type="button" data-action="open-member"><span class="prototype-menu-icon" aria-hidden="true">◎</span><strong>MEMBER</strong><small>SARiNAの成長</small></button>
        </nav>
      </section>
      <footer class="prototype-footer"><span>GAME FEEL PREVIEW</span><span>BGM ${options.audioEnabled ? "ON" : "OFF"}</span></footer>
      <button class="prototype-audio-toggle" type="button" data-action="toggle-audio" aria-label="BGM ${options.audioEnabled ? "を停止" : "を再生"}">${options.audioEnabled ? "♫" : "♪"}</button>
    </section>
  `;
}
