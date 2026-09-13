import { describe, expect, it } from "vitest";
import {
  getMarketplaceJobs,
  hasEntrepreneurDepositForJob,
} from "./jobs";
import { createEmptyFlowchartState, reduceFlowchart } from "./reducer";
import type { FlowPostedJob } from "./types";

function postedJob(overrides: Partial<FlowPostedJob> = {}): FlowPostedJob {
  return {
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
    visibility: "public",
    createdAt: 1,
    ...overrides,
  };
}

describe("marketplace job deposit filter", () => {
  it("hides a public posting when the entrepreneur wallet cannot cover it", () => {
    const job = postedJob();
    const state = {
      ...createEmptyFlowchartState(),
      postedJobs: [job],
    };

    expect(hasEntrepreneurDepositForJob(state, job)).toBe(false);
    expect(getMarketplaceJobs(state)).toHaveLength(0);
  });

  it("shows a public posting after the entrepreneur deposits enough", () => {
    const job = postedJob();
    const state = reduceFlowchart(
      { ...createEmptyFlowchartState(), postedJobs: [job] },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 }
    );

    expect(hasEntrepreneurDepositForJob(state, job)).toBe(true);
    expect(getMarketplaceJobs(state).map((item) => item.id)).toEqual(["job-1"]);
  });

  it("keeps a job listed after escrow holds the deposit", () => {
    const job = postedJob();
    let state = reduceFlowchart(
      {
        ...createEmptyFlowchartState(),
        postedJobs: [job],
        engagements: [
          {
            id: "eng-1",
            jobId: job.id,
            influencerId: "inf-1",
            entrepreneurId: "ent-1",
            influencerName: "Nina",
            influencerHandle: "@nina",
            influencerAvatarBg: "bg-[#fce8ee]",
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
      },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 }
    );
    state = reduceFlowchart(state, {
      type: "FUND_ENGAGEMENT",
      engagementId: "eng-1",
      entrepreneurId: "ent-1",
    });

    expect(hasEntrepreneurDepositForJob(state, job)).toBe(true);
    expect(getMarketplaceJobs(state)).toHaveLength(1);
  });

  it("hides a posting when the deposit is less than the job budget", () => {
    const job = postedJob();
    const state = reduceFlowchart(
      { ...createEmptyFlowchartState(), postedJobs: [job] },
      { type: "DEPOSIT", userId: "ent-1", amount: 5_000 }
    );

    expect(hasEntrepreneurDepositForJob(state, job)).toBe(false);
    expect(getMarketplaceJobs(state)).toHaveLength(0);
  });

  it("does not list catalog jobs that have no entrepreneur wallet", () => {
    expect(getMarketplaceJobs(createEmptyFlowchartState())).toHaveLength(0);
  });

  it("hides private postings even when the wallet is funded", () => {
    const job = postedJob({ visibility: "private" });
    const state = reduceFlowchart(
      { ...createEmptyFlowchartState(), postedJobs: [job] },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 }
    );

    expect(getMarketplaceJobs(state)).toHaveLength(0);
  });
});
