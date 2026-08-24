import { afterEach, describe, expect, it } from "vitest";
import { EMPTY_FLOWCHART_STATE } from "./types";
import {
  FLOWCHART_STORAGE_KEY,
  loadFlowchartState,
  resetFlowchartSnapshotCache,
  saveFlowchartState,
} from "./store";

afterEach(() => {
  resetFlowchartSnapshotCache();
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(FLOWCHART_STORAGE_KEY);
  }
});

describe("flowchart snapshot cache", () => {
  it("returns the same object when the store has not changed", () => {
    const first = loadFlowchartState();
    const second = loadFlowchartState();
    expect(first).toBe(second);
  });

  it("returns the shared empty snapshot on the server / with no data", () => {
    expect(loadFlowchartState()).toBe(EMPTY_FLOWCHART_STATE);
  });

  it("returns a new snapshot only after a write", () => {
    if (typeof localStorage === "undefined") return;

    const before = loadFlowchartState();
    const next = {
      ...EMPTY_FLOWCHART_STATE,
      wallets: { "ent-1": { available: 100 } },
    };
    saveFlowchartState(next);
    const after = loadFlowchartState();
    expect(after).toBe(next);
    expect(after).not.toBe(before);
    expect(after.wallets["ent-1"]?.available).toBe(100);
  });
});
