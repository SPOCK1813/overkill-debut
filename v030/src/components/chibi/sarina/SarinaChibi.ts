import type { StoryNode } from "../../../domain/types";
import { playChibiTap, renderLayeredChibi } from "../LayeredChibi";
import type { ChibiMood, ChibiPlacement, LayeredChibiOptions } from "../LayeredChibi";

export type SarinaChibiMood = ChibiMood;
export type SarinaChibiPlacement = ChibiPlacement;
export type SarinaChibiOptions = LayeredChibiOptions;
export type SarinaChibiPart =
  | "body"
  | "arm_left"
  | "arm_right"
  | "hair_back"
  | "head_base"
  | "eye_left_open"
  | "eye_right_open"
  | "eye_left_closed"
  | "eye_right_closed"
  | "brow_normal"
  | "brow_happy"
  | "brow_troubled"
  | "mouth_1"
  | "mouth_2"
  | "mouth_3"
  | "mouth_smile"
  | "mouth_troubled"
  | "hair_front"
  | "effect_sparkle"
  | "effect_sweat";

/** All PNG layers share a 512x512 transparent canvas and the same bottom-center anchor. */
export const SARINA_CHIBI_CANVAS = {
  width: 512,
  height: 512,
  anchor: { x: 256, y: 512 },
} as const;

/** DOM order is the canonical back-to-front layer order. */
export const SARINA_CHIBI_PART_ORDER: readonly SarinaChibiPart[] = [
  "body",
  "arm_left",
  "arm_right",
  "hair_back",
  "head_base",
  "eye_left_open",
  "eye_right_open",
  "eye_left_closed",
  "eye_right_closed",
  "brow_normal",
  "brow_happy",
  "brow_troubled",
  "mouth_1",
  "mouth_2",
  "mouth_3",
  "mouth_smile",
  "mouth_troubled",
  "hair_front",
  "effect_sparkle",
  "effect_sweat",
];

export const SARINA_CHIBI_MANIFEST = {
  id: "sarina",
  displayName: "SARiNA",
  assetBase: "/assets/chibi/sarina/parts",
  partOrder: SARINA_CHIBI_PART_ORDER,
} as const;

export function chibiMoodForExpression(expression?: StoryNode["expression"]): SarinaChibiMood {
  if (expression === "smile") return "happy";
  if (expression === "angry" || expression === "troubled" || expression === "cry") return "troubled";
  return "idle";
}

/** SARiNA asset wrapper; other members can reuse renderLayeredChibi with their own manifest. */
export function renderSarinaChibi(options: SarinaChibiOptions): string {
  return renderLayeredChibi(SARINA_CHIBI_MANIFEST, options);
}

export const playSarinaTap = playChibiTap;
