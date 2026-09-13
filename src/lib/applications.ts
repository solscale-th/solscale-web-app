import { graphqlRequest } from "./api";

export type ApiApplication = {
  id: number;
  jobId: number;
  influencerId: number;
  source?: string | null;
  status: string;
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
  status?: { error?: string | null };
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

export async function applyToJob(jobId: number): Promise<ApiApplication> {
  const res = await graphqlRequest<{ applyToJob: ApplicationMutationResponse }>(
    APPLY_TO_JOB,
    { jobId }
  );
  return unwrapApplication(res.applyToJob, "Failed to apply");
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
