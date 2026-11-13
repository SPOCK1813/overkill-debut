import type { ConditionKey } from "../domain/training";

export function formatMoney(value: number): string {
  return `¥${Math.max(0, Math.round(value)).toLocaleString("ja-JP")}`;
}

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  best: "絶好調",
  good: "好調",
  normal: "普通",
  bad: "不調",
  worst: "絶不調",
};

export const CONDITION_ICONS: Record<ConditionKey, string> = {
  best: "🔥",
  good: "🟢",
  normal: "🟡",
  bad: "🟠",
  worst: "🔴",
};

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
