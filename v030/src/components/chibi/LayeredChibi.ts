import { escapeHtml } from "../../utils/format";

export type ChibiMood = "idle" | "talk" | "happy" | "troubled";
export type ChibiPlacement = "home" | "story";

export interface ChibiManifest {
  id: string;
  displayName: string;
  assetBase: string;
  partOrder: readonly string[];
}

export interface LayeredChibiOptions {
  placement: ChibiPlacement;
  mood?: ChibiMood;
  talking?: boolean;
  ariaLabel?: string;
}

/** Renders replaceable, same-canvas PNGs back-to-front from a character manifest. */
export function renderLayeredChibi(manifest: ChibiManifest, options: LayeredChibiOptions): string {
  const mood = options.mood ?? "idle";
  const talking = options.talking ?? mood === "talk";
  const characterId = escapeHtml(manifest.id);
  const ariaLabel = escapeHtml(`${options.ariaLabel ?? manifest.displayName}にタップでリアクション`);
  const parts = manifest.partOrder.map((part) => {
    const safePart = escapeHtml(part);
    const source = escapeHtml(`${manifest.assetBase}/${part}.png`);
    return `<img class="chibi-sprite__part chibi-sprite__part--${safePart}" data-part="${safePart}" src="${source}" alt="" draggable="false" decoding="async" />`;
  }).join("");

  return `<button class="chibi-sprite chibi-sprite--${options.placement}" type="button" data-action="chibi-tap" data-character="${characterId}" data-chibi-placement="${options.placement}" data-chibi-mood="${mood}" data-chibi-talking="${talking}" aria-label="${ariaLabel}"><span class="chibi-sprite__figure" aria-hidden="true">${parts}</span></button>`;
}

const tapTimers = new WeakMap<HTMLElement, number>();
const tapRestoreMoods = new WeakMap<HTMLElement, ChibiMood>();

/** A cosmetic-only reaction: it never changes or saves GameState. */
export function playChibiTap(button: HTMLElement): void {
  if (!button.classList.contains("chibi-sprite")) return;

  const existingTimer = tapTimers.get(button);
  if (existingTimer !== undefined) {
    window.clearTimeout(existingTimer);
  } else {
    tapRestoreMoods.set(button, (button.dataset.chibiMood as ChibiMood | undefined) ?? "idle");
  }

  button.dataset.chibiMood = "happy";
  button.dataset.tapped = "true";
  const timer = window.setTimeout(() => {
    if (button.isConnected) {
      button.dataset.chibiMood = tapRestoreMoods.get(button) ?? "idle";
      delete button.dataset.tapped;
    }
    tapTimers.delete(button);
    tapRestoreMoods.delete(button);
  }, 520);
  tapTimers.set(button, timer);
}
