import type { GameState } from "../domain/types";
import { escapeHtml } from "../utils/format";
import { screenHeader } from "./shared";

export function renderPlaceholderScreen(state: GameState, feature: string): string {
  const titles: Record<string, string> = { activity: "ACTIVITY", live: "LIVE", mission: "MISSION", room: "ROOM" };
  const title = titles[feature] ?? "FEATURE";
  return `<section class="screen-shell placeholder-screen">${screenHeader(state, title)}<div class="placeholder-card"><p class="eyebrow">v0.30 · PHASE 1–4</p><h2>${escapeHtml(title)}は準備中です</h2><p>この機能の入口と画面構成は確保しました。今回のPreviewで有効な行動はTRAININGです。未実装メニューを選んでもTP・行動回数・セーブデータは変化しません。</p><button class="button button-primary button-large" type="button" data-action="go-home">HOMEへ戻る</button></div></section>`;
}

export function renderGameCompleteScreen(): string {
  return `<section class="screen-shell completion-screen"><p class="eyebrow">4 SEASONS · 32 WEEKS</p><h1>THE STORY CONTINUES</h1><p>32週間のマネジメントが完了しました。</p><button class="button button-primary button-large" type="button" data-action="go-home">HOMEへ</button></section>`;
}
