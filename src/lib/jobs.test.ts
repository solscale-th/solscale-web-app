import { describe, expect, it } from "vitest";
import { mapApiJobToJob, type ApiJob } from "./jobs";
import { MOCK_JOBS } from "./mock-jobs";
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

describe("MOCK_JOBS API shape", () => {
  it("uses numeric ids and api-dev entrepreneur fields like mapApiJobToJob", () => {
    expect(MOCK_JOBS.length).toBeGreaterThan(0);
    for (const job of MOCK_JOBS) {
      expect(parseApiId(job.id)).not.toBeNull();
      expect(parseApiId(job.companyId)).not.toBeNull();
      expect(job.companyRating).toBe(0);
      expect(job.companyReviews).toBe(0);
      expect(job.website).toBe("");
      expect(job.applied).toBe(0);
      expect(job.verified).toBe(true);
    }
    expect(MOCK_JOBS.map((job) => job.company).sort()).toEqual(
      ["Pasit", "heew", "test"].sort()
    );
  });

  it("matches mapApiJobToJob for the heew fixture", () => {
    const mapped = mapApiJobToJob(
      apiJob({
        id: 1,
        title: MOCK_JOBS[0].title,
        description: MOCK_JOBS[0].description,
        brief: MOCK_JOBS[0].brief,
        platform: MOCK_JOBS[0].platform,
        deliverables: MOCK_JOBS[0].deliverables,
        requirements: MOCK_JOBS[0].requirements,
        tags: MOCK_JOBS[0].tags,
        location: MOCK_JOBS[0].location,
        duration: MOCK_JOBS[0].duration,
        budgetMin: MOCK_JOBS[0].budgetMin,
        budgetMax: MOCK_JOBS[0].budgetMax,
        promoted: Boolean(MOCK_JOBS[0].promoted),
        createdAt: "2026-09-12T00:00:00.000Z",
      })
    );
    expect(mapped.id).toBe(MOCK_JOBS[0].id);
    expect(mapped.company).toBe("heew");
    expect(mapped.companyId).toBe("2");
    expect(mapped.companyRating).toBe(0);
    expect(mapped.website).toBe("");
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
