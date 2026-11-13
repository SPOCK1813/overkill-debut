import { LEGACY_STORAGE_KEY, SCHEMA_VERSION, STORAGE_KEY } from "../domain/constants";
import { MEMBERS } from "../data/members";
import { migrateLegacySave, parseJson } from "./migrations";
import type { GameState, MemberId } from "../domain/types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type LoadResult =
  | { status: "empty"; state: null; warnings: string[] }
  | { status: "loaded" | "migrated"; state: GameState; warnings: string[] }
  | { status: "error"; state: null; warnings: string[]; message: string; legacyPresent: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateGameState(value: unknown): value is GameState {
  if (!isRecord(value) || value.schemaVersion !== SCHEMA_VERSION || value.gameVersion !== "0.30") return false;
  const progress = value.progress;
  const week = value.week;
  const resources = value.resources;
  const members = value.members;
  if (!isRecord(progress) || !isRecord(week) || !isRecord(resources) || !isRecord(members)) return false;
  const season = progress.season;
  const weekNo = progress.week;
  if (typeof season !== "number" || season < 1 || season > 4 || typeof weekNo !== "number" || weekNo < 1 || weekNo > 8) return false;
  if (typeof week.actionsUsed !== "number" || week.actionsUsed < 0 || week.actionsUsed > 3) return false;
  if (typeof week.tpRemaining !== "number" || week.tpRemaining < 0 || week.tpRemaining > 100) return false;
  for (const id of Object.keys(MEMBERS) as MemberId[]) {
    const member = members[id];
    if (!isRecord(member) || !isRecord(member.stats)) return false;
    for (const stat of ["vocal", "dance", "mc", "bond"]) {
      const score = member.stats[stat];
      if (typeof score !== "number" || score < 1 || score > 700) return false;
    }
    const energy = member.stats.energy;
    if (typeof energy !== "number" || energy < 0 || energy > 100) return false;
    if (typeof member.level !== "number" || member.level < 1 || typeof member.exp !== "number" || member.exp < 0 || typeof member.sp !== "number" || member.sp < 0) return false;
  }
  return true;
}

export class SaveRepository {
  constructor(
    private readonly storage: StorageLike,
    private readonly storageKey = STORAGE_KEY,
    private readonly legacyKey = LEGACY_STORAGE_KEY,
  ) {}

  load(now?: string): LoadResult {
    let currentRaw: string | null;
    let legacyRaw: string | null;
    try {
      currentRaw = this.storage.getItem(this.storageKey);
      legacyRaw = this.storage.getItem(this.legacyKey);
    } catch {
      return { status: "error", state: null, warnings: [], message: "Safariの保存領域を読み取れません。保存データは変更していません。", legacyPresent: false };
    }
    if (currentRaw !== null) {
      try {
        const parsed = parseJson(currentRaw);
        if (!validateGameState(parsed)) throw new Error("v0.30セーブのschemaまたは範囲が不正です。");
        return { status: "loaded", state: parsed, warnings: [] };
      } catch (error) {
        return { status: "error", state: null, warnings: [], message: error instanceof Error ? error.message : "v0.30セーブを読み込めません。", legacyPresent: legacyRaw !== null };
      }
    }
    if (legacyRaw !== null) {
      try {
        const migrated = migrateLegacySave(parseJson(legacyRaw), now);
        if (!validateGameState(migrated.state)) throw new Error("移行後の状態がschema検証を通りませんでした。");
        this.save(migrated.state);
        return { status: "migrated", state: migrated.state, warnings: migrated.warnings };
      } catch (error) {
        return { status: "error", state: null, warnings: [], message: error instanceof Error ? error.message : "旧セーブを安全に移行できませんでした。", legacyPresent: true };
      }
    }
    return { status: "empty", state: null, warnings: [] };
  }

  save(state: GameState): void {
    if (!validateGameState(state)) throw new Error("保存を中断しました。状態がv0.30 schemaの範囲外です。");
    this.storage.setItem(this.storageKey, JSON.stringify(state));
  }

  preserveCurrentSave(suffix = new Date().toISOString().replaceAll(":", "-")): string | null {
    const raw = this.storage.getItem(this.storageKey);
    if (raw === null) return null;
    const backupKey = `${this.storageKey}.backup-${suffix}`;
    this.storage.setItem(backupKey, raw);
    return backupKey;
  }

  hasLegacySave(): boolean {
    return this.storage.getItem(this.legacyKey) !== null;
  }

  get keys(): { current: string; legacy: string } {
    return { current: this.storageKey, legacy: this.legacyKey };
  }
}
