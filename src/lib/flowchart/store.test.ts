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
      postedJobs: [
        {
          id: "job-1",
          entrepreneurId: "ent-1",
          companyName: "Glow Lab",
          title: "Skincare launch",
          description: "Campaign brief",
          brief: "Full brief",
          platform: "Instagram",
          deliverables: ["3 posts"],
          requirements: ["50k followers"],
          tags: ["Beauty"],
          location: "Bangkok, TH",
          duration: "2 weeks",
          budgetMin: 10_000,
          budgetMax: 20_000,
          visibility: "public" as const,
          createdAt: 1,
        },
      ],
    };
    saveFlowchartState(next);
    const after = loadFlowchartState();
    expect(after).toBe(next);
    expect(after).not.toBe(before);
    expect(after.postedJobs).toHaveLength(1);
  });

  it("treats legacy unfunded engagements as active jobs", () => {
    if (typeof localStorage === "undefined") return;
    resetFlowchartSnapshotCache();
    localStorage.setItem(
      FLOWCHART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        wallets: { "ent-1": { available: 20_000 } },
        postedJobs: [],
        invites: [],
        applications: [],
        engagements: [
          {
            id: "eng-1",
            jobId: "j1",
            influencerId: "inf-1",
            entrepreneurId: "ent-1",
            influencerName: "Nina",
            influencerHandle: "@nina",
            influencerAvatarBg: "bg-brand-tint",
            workStatus: "not_submitted",
            paymentStatus: "unfunded",
            escrowAmount: 20_000,
            submissionNote: "",
            reviewNote: "",
            createdAt: 1,
            source: "application",
            sourceId: "app-1",
          },
        ],
        ratings: [],
        disputes: [],
      })
    );

    const state = loadFlowchartState();
    expect(state.engagements[0]?.paymentStatus).toBe("escrowed");
    expect("wallets" in state).toBe(false);
  });
});
