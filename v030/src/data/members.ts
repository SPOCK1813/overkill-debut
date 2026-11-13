import type { CoreStat, MemberId } from "../domain/types";

export interface MemberDefinition {
  id: MemberId;
  name: string;
  color: string;
  rgb: string;
  initial: Record<CoreStat | "energy", number>;
}

export const MEMBERS: Record<MemberId, MemberDefinition> = {
  sarina: {
    id: "sarina",
    name: "SARiNA",
    color: "#69e09a",
    rgb: "105,224,154",
    initial: { vocal: 78, dance: 48, mc: 62, bond: 74, energy: 72 },
  },
  miyu: {
    id: "miyu",
    name: "MiYU",
    color: "#72bdff",
    rgb: "114,189,255",
    initial: { vocal: 74, dance: 54, mc: 65, bond: 68, energy: 76 },
  },
  kilua: {
    id: "kilua",
    name: "KiLUA",
    color: "#ff7b88",
    rgb: "255,123,136",
    initial: { vocal: 52, dance: 84, mc: 55, bond: 40, energy: 80 },
  },
  raisa: {
    id: "raisa",
    name: "RAiSA",
    color: "#ffdc69",
    rgb: "255,220,105",
    initial: { vocal: 42, dance: 44, mc: 58, bond: 58, energy: 70 },
  },
};
