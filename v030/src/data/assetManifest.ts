import type { MemberId, StoryNode } from "../domain/types";

const BASE = "/assets";
export type Expression = NonNullable<StoryNode["expression"]>;

export const MEMBER_PORTRAITS: Record<MemberId, Record<Expression, string>> = {
  sarina: {
    normal: `${BASE}/characters/sarina_normal.png`, smile: `${BASE}/characters/sarina_smile.png`, angry: `${BASE}/characters/sarina_angry.png`, troubled: `${BASE}/characters/sarina_troubled.png`, cry: `${BASE}/characters/sarina_cry.png`,
  },
  miyu: {
    normal: `${BASE}/characters/miyu_normal.png`, smile: `${BASE}/characters/miyu_smile.png`, angry: `${BASE}/characters/miyu_angry.png`, troubled: `${BASE}/characters/miyu_troubled.png`, cry: `${BASE}/characters/miyu_cry.png`,
  },
  kilua: {
    normal: `${BASE}/characters/kilua_normal.png`, smile: `${BASE}/characters/kilua_smile.png`, angry: `${BASE}/characters/kilua_angry.png`, troubled: `${BASE}/characters/kilua_troubled.png`, cry: `${BASE}/characters/kilua_cry.png`,
  },
  raisa: {
    normal: `${BASE}/characters/raisa_normal.png`, smile: `${BASE}/characters/raisa_smile.png`, angry: `${BASE}/characters/raisa_angry.png`, troubled: `${BASE}/characters/raisa_troubled.png`, cry: `${BASE}/characters/raisa_cry.png`,
  },
};

export const BACKGROUNDS: Record<string, string> = {
  manager: `${BASE}/backgrounds/bg-backstage.png`,
  studio: `${BASE}/backgrounds/bg-studio.png`,
  lounge: `${BASE}/backgrounds/bg-backstage.png`,
  sns: `${BASE}/backgrounds/bg-stream.png`,
  city: `${BASE}/backgrounds/bg-street-night.png`,
  night: `${BASE}/backgrounds/bg-street-night.png`,
  live: `${BASE}/backgrounds/bg-livehouse.png`,
  outdoor: `${BASE}/backgrounds/bg-outdoor.png`,
};

export const TITLE_IMAGE = `${BASE}/ui/debut-live.webp`;
export const BGM_FILE = `${BASE}/audio/akunaki-kodou.mp3`;

export function backgroundFor(id?: string): string {
  return BACKGROUNDS[id ?? ""] ?? BACKGROUNDS.manager;
}
