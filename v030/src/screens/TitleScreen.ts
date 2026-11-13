import { TITLE_IMAGE } from "../data/assetManifest";
import { escapeHtml } from "../utils/format";

export function renderTitleScreen(options: { canContinue: boolean; errorMessage?: string | null; audioEnabled?: boolean }): string {
  return `
    <section class="screen-shell title-screen">
      <div class="title-photo" style="background-image:url('${TITLE_IMAGE}')" aria-hidden="true"></div>
      <div class="title-scrim" aria-hidden="true"></div>
      <div class="title-content">
        <p class="eyebrow">IDOL MANAGEMENT GAME</p>
        <p class="wordmark">O-VER-KiLL</p>
        <p class="title-subtitle">MANAGER’S STORY</p>
        <p class="title-edition">v0.30 · PREVIEW</p>
        ${options.errorMessage ? `<div class="notice notice-error" role="alert">${escapeHtml(options.errorMessage)}<br><small>旧データは削除・上書きしていません。</small></div>` : ""}
        <div class="title-actions">
          <button class="button button-primary button-large" type="button" data-action="new-game">${options.errorMessage ? "新規データで開始" : "NEW GAME"}</button>
          <button class="button button-quiet button-large" type="button" data-action="continue" ${options.canContinue ? "" : "disabled"}>CONTINUE</button>
          <button class="button button-quiet audio-toggle" type="button" data-action="toggle-audio">BGM ${options.audioEnabled ? "ON" : "OFF"}</button>
        </div>
        <p class="title-footnote">4人の最初のステージまで、あと少し。</p>
      </div>
    </section>
  `;
}
