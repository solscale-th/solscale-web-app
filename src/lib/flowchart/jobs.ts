import { MOCK_JOBS, type Job, type Platform } from "@/lib/mock-jobs";
import { getWalletBalance } from "./reducer";
import { loadFlowchartState } from "./store";
import type { FlowPostedJob, FlowchartState } from "./types";

const POSTED_THUMB = "bg-[#9d003b]";

export function postedJobToJob(posted: FlowPostedJob): Job {
  return {
    id: posted.id,
    title: posted.title,
    company: posted.companyName,
    companyId: posted.entrepreneurId,
    companyRating: 0,
    companyReviews: 0,
    platform: (posted.platform as Platform) || "Instagram",
    description: posted.description,
    brief: posted.brief,
    deliverables: posted.deliverables,
    requirements: posted.requirements,
    aboutBrand: posted.companyName,
    website: "",
    verified: false,
    tags: posted.tags,
    location: posted.location,
    duration: posted.duration,
    applied: 0,
    budgetMin: posted.budgetMin,
    budgetMax: posted.budgetMax,
    postedDaysAgo: 0,
    thumbnailBg: POSTED_THUMB,
  };
}

/**
 * A job is marketplace-visible only when the brand has enough wallet
 * balance to cover it, or funds are already held in escrow for it.
 */
export function hasEntrepreneurDepositForJob(
  state: FlowchartState,
  job: FlowPostedJob
): boolean {
  const needed = Math.max(escrowAmountForJob(job), 1);
  if (getWalletBalance(state, job.entrepreneurId) >= needed) return true;
  return state.engagements.some(
    (eng) => eng.jobId === job.id && eng.paymentStatus !== "unfunded"
  );
}

export function getMarketplaceJobs(state: FlowchartState): Job[] {
  return state.postedJobs
    .filter((job) => job.visibility === "public")
    .filter((job) => hasEntrepreneurDepositForJob(state, job))
    .map(postedJobToJob);
}

export function getAllJobs(): Job[] {
  return getMarketplaceJobs(loadFlowchartState());
}

export function findJobById(id: string): Job | undefined {
  const posted = loadFlowchartState().postedJobs.find((job) => job.id === id);
  if (posted) return postedJobToJob(posted);
  return MOCK_JOBS.find((job) => job.id === id);
}

export function escrowAmountForJob(job: { budgetMin: number; budgetMax: number }): number {
  return job.budgetMax > 0 ? job.budgetMax : job.budgetMin;
}
