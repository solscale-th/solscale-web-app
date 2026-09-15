import { MOCK_JOBS, type Job, type Platform } from "@/lib/mock-jobs";
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

export function getMarketplaceJobs(state: FlowchartState): Job[] {
  return state.postedJobs
    .filter((job) => job.visibility === "public")
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
