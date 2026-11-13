import type { GameState } from "../domain/types";
import { escapeHtml } from "../utils/format";

export function screenHeader(state: GameState, title: string, showHome = true): string {
  return `
    <header class="screen-header">
      <div class="screen-heading">
        <p class="eyebrow">SEASON ${state.progress.season} · WEEK ${state.progress.week}</p>
        <h1>${escapeHtml(title)}</h1>
      </div>
      ${showHome ? '<button class="button button-quiet" type="button" data-action="go-home">HOME</button>' : ""}
    </header>
  `;
}

export function positiveDiff(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
