import { graphqlRequest } from "./api";

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export function formatApplied(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}

export type ApiApplicationJob = {
  id: number;
  title: string;
  description: string;
  platform: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  status: string;
  promoted: boolean;
  createdAt: string;
  entrepreneurId: number;
  entrepreneur?: {
    id: number;
    companyName: string;
    brandDescription?: string | null;
    logoUrl?: string | null;
  } | null;
};

export type ApiApplication = {
  id: number;
  jobId: number;
  influencerId: number;
  source?: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  job?: ApiApplicationJob | null;
};

const APPLICATION_FIELDS = /* GraphQL */ `
  id
  jobId
  influencerId
  source
  status
`;

const APPLY_TO_JOB = /* GraphQL */ `
  mutation ApplyToJob($jobId: Int!) {
    applyToJob(jobId: $jobId) {
      data {
        ${APPLICATION_FIELDS}
      }
      status {
        code
        error
      }
    }
  }
`;

const APPLICATION_LIST_FIELDS = /* GraphQL */ `
  ${APPLICATION_FIELDS}
  createdAt
  updatedAt
  job {
    id
    title
    description
    platform
    budgetMin
    budgetMax
    status
    promoted
    createdAt
    entrepreneurId
    entrepreneur {
      id
      companyName
      brandDescription
      logoUrl
    }
  }
`;

const MY_APPLICATIONS_QUERY = /* GraphQL */ `
  query MyApplications {
    myApplications {
      data {
        ${APPLICATION_LIST_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const MY_DIRECT_INVITES_QUERY = /* GraphQL */ `
  query MyDirectInvites {
    myDirectInvites {
      data {
        ${APPLICATION_LIST_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const ACCEPT_INVITE = /* GraphQL */ `
  mutation AcceptInvite($id: Int!) {
    acceptInvite(id: $id) {
      data {
        ${APPLICATION_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

const DECLINE_INVITE = /* GraphQL */ `
  mutation DeclineInvite($id: Int!) {
    declineInvite(id: $id) {
      data {
        ${APPLICATION_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

type ApplicationMutationResponse = {
  data: ApiApplication | null;
  status?: { code?: string | null; error?: string | null };
};

type MyApplicationsResponse = {
  myApplications: {
    data: ApiApplication[] | null;
    status?: { error?: string | null };
  };
};

type MyDirectInvitesResponse = {
  myDirectInvites: {
    data: ApiApplication[] | null;
    status?: { error?: string | null };
  };
};

function unwrapApplication(
  payload: ApplicationMutationResponse,
  fallback: string
): ApiApplication {
  if (!payload.data) throw new Error(payload.status?.error ?? fallback);
  return payload.data;
}

export function parseApiId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function isDuplicateRecordError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /duplicat/i.test(message);
}

export async function applyToJob(jobId: number): Promise<ApiApplication> {
  const res = await graphqlRequest<{ applyToJob: ApplicationMutationResponse }>(
    APPLY_TO_JOB,
    { jobId }
  );
  return unwrapApplication(res.applyToJob, "Failed to apply");
}

export async function fetchMyApplications(
  signal?: AbortSignal
): Promise<ApiApplication[]> {
  const res = await graphqlRequest<MyApplicationsResponse>(
    MY_APPLICATIONS_QUERY,
    undefined,
    signal
  );
  const { data, status } = res.myApplications;
  if (status?.error) throw new Error(status.error);
  return data ?? [];
}

export async function fetchMyDirectInvites(
  signal?: AbortSignal
): Promise<ApiApplication[]> {
  const res = await graphqlRequest<MyDirectInvitesResponse>(
    MY_DIRECT_INVITES_QUERY,
    undefined,
    signal
  );
  const { data, status } = res.myDirectInvites;
  if (status?.error) throw new Error(status.error);
  return data ?? [];
}

export async function acceptInvite(id: number): Promise<ApiApplication> {
  const res = await graphqlRequest<{ acceptInvite: ApplicationMutationResponse }>(
    ACCEPT_INVITE,
    { id }
  );
  return unwrapApplication(res.acceptInvite, "Failed to accept invite");
}

export async function declineInvite(id: number): Promise<ApiApplication> {
  const res = await graphqlRequest<{ declineInvite: ApplicationMutationResponse }>(
    DECLINE_INVITE,
    { id }
  );
  return unwrapApplication(res.declineInvite, "Failed to decline invite");
}
