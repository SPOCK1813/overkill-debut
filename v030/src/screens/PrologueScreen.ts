import { PROLOGUE } from "../services/StoryEngine";
import { escapeHtml } from "../utils/format";

export function renderPrologueScreen(index: number): string {
  const safeIndex = Math.max(0, Math.min(PROLOGUE.length - 1, index));
  return `
    <section class="screen-shell prologue-screen">
      <p class="wordmark wordmark-small">O-VER-KiLL</p>
      <div class="prologue-copy" aria-live="polite">${escapeHtml(PROLOGUE[safeIndex] ?? "")}</div>
      <div class="prologue-footer">
        <span class="eyebrow">PROLOGUE · ${safeIndex + 1} / ${PROLOGUE.length}</span>
        <button class="button button-primary button-large" type="button" data-action="prologue-next">${safeIndex === PROLOGUE.length - 1 ? "物語を始める" : "NEXT"}</button>
      </div>
    </section>
  `;
}
