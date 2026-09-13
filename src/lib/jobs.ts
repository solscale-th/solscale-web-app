import { graphqlRequest } from "./api";
import { PLATFORM_COLORS, type Job, type Platform } from "./mock-jobs";

export type ApiJobEntrepreneur = {
  id: number;
  companyName: string;
  brandDescription?: string | null;
  logoUrl?: string | null;
  depositBalance?: number | null;
};

export type ApiJob = {
  id: number;
  entrepreneurId: number;
  title: string;
  description: string;
  brief?: string | null;
  platform: string;
  deliverables?: string[] | null;
  requirements?: string[] | null;
  tags?: string[] | null;
  location?: string | null;
  duration?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  status: string;
  promoted: boolean;
  createdAt: string;
  entrepreneur?: ApiJobEntrepreneur | null;
};

const JOB_THUMBNAILS = [
  "bg-[#fce8ee]",
  "bg-[#ffe8cc]",
  "bg-[#cce4ff]",
  "bg-[#d0f0e8]",
  "bg-[#e8e0ff]",
  "bg-[#fff3cc]",
];

const KNOWN_PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];

const JOB_FIELDS = /* GraphQL */ `
  id
  entrepreneurId
  title
  description
  brief
  platform
  deliverables
  requirements
  tags
  location
  duration
  budgetMin
  budgetMax
  status
  promoted
  createdAt
  entrepreneur {
    id
    companyName
    brandDescription
    logoUrl
    depositBalance
  }
`;

function daysAgoFromIso(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function toPlatform(raw: string): Platform {
  const match = KNOWN_PLATFORMS.find(
    (platform) => platform.toLowerCase() === raw.toLowerCase()
  );
  return match ?? "Instagram";
}

export function mapApiJobToJob(job: ApiJob): Job {
  return {
    id: String(job.id),
    title: job.title,
    company: job.entrepreneur?.companyName ?? "",
    companyId: String(job.entrepreneur?.id ?? job.entrepreneurId),
    companyRating: 0,
    companyReviews: 0,
    platform: toPlatform(job.platform),
    description: job.description,
    brief: job.brief ?? "",
    deliverables: job.deliverables ?? [],
    requirements: job.requirements ?? [],
    aboutBrand: job.entrepreneur?.brandDescription ?? job.entrepreneur?.companyName ?? "",
    website: "",
    verified: true,
    tags: job.tags ?? [],
    location: job.location ?? "",
    duration: job.duration ?? "",
    applied: 0,
    budgetMin: job.budgetMin ?? 0,
    budgetMax: job.budgetMax ?? 0,
    postedDaysAgo: daysAgoFromIso(job.createdAt),
    promoted: job.promoted,
    thumbnailBg: JOB_THUMBNAILS[job.id % JOB_THUMBNAILS.length],
  };
}

const CREATE_JOB = /* GraphQL */ `
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      data {
        ${JOB_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const JOBS_QUERY = /* GraphQL */ `
  query Jobs {
    jobs {
      data {
        ${JOB_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const JOB_QUERY = /* GraphQL */ `
  query Job($id: Int!) {
    job(id: $id) {
      data {
        ${JOB_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const MY_JOBS_QUERY = /* GraphQL */ `
  query MyJobs {
    myJobs {
      data {
        ${JOB_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

type CreateJobResponse = {
  createJob: {
    data: ApiJob | null;
    status?: { error?: string | null };
  };
};

type JobsResponse = {
  jobs: {
    data: ApiJob[] | null;
    status?: { error?: string | null };
  };
};

type JobResponse = {
  job: {
    data: ApiJob | null;
    status?: { error?: string | null };
  };
};

type MyJobsResponse = {
  myJobs: {
    data: ApiJob[] | null;
    status?: { error?: string | null };
  };
};

export type CreateJobInput = {
  title: string;
  description: string;
  brief?: string;
  platform: string;
  deliverables?: string[];
  requirements?: string[];
  tags?: string[];
  location?: string;
  duration?: string;
  budgetMin?: number;
  budgetMax?: number;
};

export async function createJob(input: CreateJobInput): Promise<ApiJob> {
  const res = await graphqlRequest<CreateJobResponse>(CREATE_JOB, { input });
  const { data, status } = res.createJob;
  if (!data) throw new Error(status?.error ?? "Failed to create job");
  return data;
}

export async function fetchJobs(signal?: AbortSignal): Promise<ApiJob[]> {
  const res = await graphqlRequest<JobsResponse>(JOBS_QUERY, undefined, signal);
  const { data, status } = res.jobs;
  if (status?.error) throw new Error(status.error);
  return data ?? [];
}

export function logJobList(screen: string, items: unknown) {
  console.log(`[jobs:${screen}]`, items);
}

export async function fetchMarketplaceJobs(signal?: AbortSignal): Promise<Job[]> {
  const jobs = await fetchJobs(signal);
  const openJobs = jobs.filter((job) => job.status.toLowerCase() !== "closed");
  logJobList("home:api", {
    total: jobs.length,
    open: openJobs.length,
    jobs: openJobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      entrepreneurId: job.entrepreneurId,
      companyName: job.entrepreneur?.companyName ?? null,
      depositBalance: job.entrepreneur?.depositBalance ?? 0,
    })),
  });
  return openJobs.map(mapApiJobToJob);
}

export async function fetchJobById(
  id: number,
  signal?: AbortSignal
): Promise<ApiJob | null> {
  const res = await graphqlRequest<JobResponse>(JOB_QUERY, { id }, signal);
  const { data, status } = res.job;
  if (status?.error) throw new Error(status.error);
  return data;
}

export async function fetchMyJobs(signal?: AbortSignal): Promise<ApiJob[]> {
  const res = await graphqlRequest<MyJobsResponse>(MY_JOBS_QUERY, undefined, signal);
  const { data, status } = res.myJobs;
  if (status?.error) throw new Error(status.error);
  return data ?? [];
}
