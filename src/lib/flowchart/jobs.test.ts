import { describe, expect, it } from "vitest";
import { getMarketplaceJobs } from "./jobs";
import { createEmptyFlowchartState } from "./reducer";
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

describe("marketplace posted jobs", () => {
  it("lists public postings as soon as they are published", () => {
    const job = postedJob();
    const state = {
      ...createEmptyFlowchartState(),
      postedJobs: [job],
    };

    expect(getMarketplaceJobs(state).map((item) => item.id)).toEqual(["job-1"]);
  });

  it("does not list catalog jobs from an empty flowchart", () => {
    expect(getMarketplaceJobs(createEmptyFlowchartState())).toHaveLength(0);
  });

  it("hides private postings", () => {
    const job = postedJob({ visibility: "private" });
    const state = {
      ...createEmptyFlowchartState(),
      postedJobs: [job],
    };

    expect(getMarketplaceJobs(state)).toHaveLength(0);
  });
});
