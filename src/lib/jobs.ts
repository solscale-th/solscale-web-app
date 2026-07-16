import { graphqlRequest } from "./api";

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
};

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
`;

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
