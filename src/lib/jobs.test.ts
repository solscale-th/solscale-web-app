import { describe, expect, it } from "vitest";
import { mapApiJobToJob, type ApiJob } from "./jobs";
import { parseApiId } from "./applications";

function apiJob(overrides: Partial<ApiJob> = {}): ApiJob {
  return {
    id: 10,
    entrepreneurId: 2,
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
    status: "open",
    promoted: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    entrepreneur: {
      id: 2,
      companyName: "heew",
      depositBalance: 50_000,
    },
    ...overrides,
  };
}

describe("mapApiJobToJob", () => {
  it("maps API fields onto the listing card shape", () => {
    const job = mapApiJobToJob(apiJob());
    expect(job.id).toBe("10");
    expect(job.company).toBe("heew");
    expect(job.companyId).toBe("2");
    expect(job.platform).toBe("Instagram");
    expect(job.budgetMin).toBe(10_000);
    expect(job.budgetMax).toBe(20_000);
  });
});

describe("parseApiId", () => {
  it("accepts positive integer ids from the API", () => {
    expect(parseApiId("12")).toBe(12);
  });

  it("rejects demo flowchart ids", () => {
    expect(parseApiId("offer-1")).toBeNull();
    expect(parseApiId("inv-123")).toBeNull();
  });
});
