import { MOCK_JOBS, type Job, type Platform } from "@/lib/mock-jobs";
import { loadFlowchartState } from "./store";
import type { FlowPostedJob } from "./types";

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

export function getAllJobs(): Job[] {
  const posted = loadFlowchartState().postedJobs.map(postedJobToJob);
  const postedIds = new Set(posted.map((job) => job.id));
  return [...posted, ...MOCK_JOBS.filter((job) => !postedIds.has(job.id))];
}

export function findJobById(id: string): Job | undefined {
  const posted = loadFlowchartState().postedJobs.find((job) => job.id === id);
  if (posted) return postedJobToJob(posted);
  return MOCK_JOBS.find((job) => job.id === id);
}

export function escrowAmountForJob(job: { budgetMin: number; budgetMax: number }): number {
  return job.budgetMax > 0 ? job.budgetMax : job.budgetMin;
}
