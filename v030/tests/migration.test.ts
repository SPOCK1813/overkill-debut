import { describe, expect, it } from "vitest";
import { createInitialState } from "../src/domain/stateFactory";
import { SaveRepository, type StorageLike } from "../src/services/SaveRepository";
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from "../src/domain/constants";

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

function legacySave() {
  const state = createInitialState("2025-01-01T00:00:00.000Z");
  return {
    version: "0.25",
    v025Migrated: true,
    started: true,
    prologueSeen: true,
    season: 1,
    week: 1,
    node: "w1_after_training",
    actionsUsed: 3,
    trainingTP: 10,
    reach: 28,
    fans: 4,
    cash: 217000,
    ovkPoints: 12,
    members: Object.fromEntries(Object.entries(state.members).map(([id, member]) => [id, {
      level: member.level + 1,
      exp: 22,
      sp: 7,
      stats: { ...member.stats, vocal: member.stats.vocal + 2 },
      rankBonusClaimed: 0,
      rankHistory: ["E70"],
    }])),
    weekSnapshot: {
      season: 1,
      week: 1,
      reach: 10,
      fans: 0,
      cash: 220000,
      members: state.members,
    },
    collection: { album: true },
    achievements: ["first-stage"],
    clearHistory: [{ season: 0, best: 1 }],
  };
}

describe("legacy and schema save migration", () => {
  it("migrates the v0.22-v0.25 save while retaining its source key and progress", () => {
    const storage = new MemoryStorage();
    const oldRaw = JSON.stringify(legacySave());
    storage.setItem(LEGACY_STORAGE_KEY, oldRaw);
    const repository = new SaveRepository(storage);
    const loaded = repository.load("2026-01-01T00:00:00.000Z");
    expect(loaded.status).toBe("migrated");
    if (loaded.status !== "migrated") return;
    expect(loaded.state.schemaVersion).toBe(1);
    expect(loaded.state.gameVersion).toBe("0.30");
    expect(loaded.state.progress.season).toBe(1);
    expect(loaded.state.progress.week).toBe(1);
    expect(loaded.state.week.actionsUsed).toBe(3);
    expect(loaded.state.week.tpRemaining).toBe(10);
    expect(loaded.state.resources.cash).toBe(217000);
    expect(loaded.state.resources.ovkPoints).toBe(12);
    expect(loaded.state.members.sarina.sp).toBe(7);
    expect(loaded.state.members.sarina.stats.vocal).toBe(80);
    expect(loaded.state.members.sarina.spRewardThroughTier).toBeGreaterThanOrEqual(0);
    expect(loaded.state.meta.legacy.version).toBe("0.25");
    expect(loaded.state.meta.legacy.v025Migrated).toBe(true);
    expect(loaded.state.weekStartSnapshot?.resources.reach).toBe(10);
    expect(loaded.state.progress.phase).toBe("story");
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe(oldRaw);
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(repository.load().status).toBe("loaded");
  });

  it("does not create or overwrite a new save when legacy migration fails", () => {
    const storage = new MemoryStorage();
    const broken = JSON.stringify({ version: "0.25", started: true });
    storage.setItem(LEGACY_STORAGE_KEY, broken);
    const loaded = new SaveRepository(storage).load();
    expect(loaded.status).toBe("error");
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe(broken);
  });

  it("does not silently replace a corrupt v0.30 save even if legacy data exists", () => {
    const storage = new MemoryStorage();
    const corrupt = "{broken";
    const oldRaw = JSON.stringify(legacySave());
    storage.setItem(STORAGE_KEY, corrupt);
    storage.setItem(LEGACY_STORAGE_KEY, oldRaw);
    const loaded = new SaveRepository(storage).load();
    expect(loaded.status).toBe("error");
    expect(storage.getItem(STORAGE_KEY)).toBe(corrupt);
    expect(storage.getItem(LEGACY_STORAGE_KEY)).toBe(oldRaw);
  });

  it("round-trips a new schema without changing progression", () => {
    const storage = new MemoryStorage();
    const repository = new SaveRepository(storage);
    const state = createInitialState("2026-01-01T00:00:00.000Z");
    state.started = true;
    state.progress.phase = "home";
    repository.save(state);
    const loaded = repository.load();
    expect(loaded.status).toBe("loaded");
    if (loaded.status === "loaded") expect(loaded.state).toEqual(state);
  });
});
