import { graphqlRequest } from "./api";
import type { FlowEngagement, WorkStatus } from "./flowchart/types";
import type { ApiJob } from "./jobs";
import { mapApiJobToJob } from "./jobs";

export type { WorkStatus };

export const WORK_STATUS_LABELS: Record<WorkStatus, { en: string; className: string }> = {
  not_submitted: { en: "Not Submitted", className: "bg-gray-100 text-gray-500" },
  submitted: { en: "Submitted", className: "bg-blue-100 text-blue-600" },
  revision_requested: { en: "Revision Requested", className: "bg-amber-100 text-amber-700" },
  approved: { en: "Approved", className: "bg-green-100 text-green-700" },
};

export function canSubmitWork(workStatus: WorkStatus): boolean {
  return workStatus === "not_submitted" || workStatus === "revision_requested";
}

export type ApiSubmission = {
  id: number;
  engagementId: number;
  links?: string[] | null;
  note?: string | null;
  status?: string | null;
  reviewNote?: string | null;
  createdAt?: string | null;
};

export type ApiEngagement = {
  id: number;
  applicationId: number;
  jobId: number;
  influencerId: number;
  workStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  job?: ApiJob | null;
  submissions?: ApiSubmission[] | null;
};

const ENGAGEMENT_FIELDS = /* GraphQL */ `
  id
  applicationId
  jobId
  influencerId
  workStatus
  createdAt
  updatedAt
`;

const MY_ENGAGEMENTS_QUERY = /* GraphQL */ `
  query MyEngagements {
    myEngagements {
      data {
        ${ENGAGEMENT_FIELDS}
        job {
          id
          entrepreneurId
          title
          description
          brief
          platform
          budgetMin
          budgetMax
          packagePrice
          status
          promoted
          createdAt
          entrepreneur {
            id
            companyName
            brandDescription
            logoUrl
          }
        }
        submissions {
          id
          engagementId
          links
          note
          status
          reviewNote
          createdAt
        }
      }
      status {
        error
      }
    }
  }
`;

const SUBMIT_WORK = /* GraphQL */ `
  mutation SubmitWork($input: SubmitWorkInput!) {
    submitWork(input: $input) {
      data {
        ${ENGAGEMENT_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

type MyEngagementsResponse = {
  myEngagements: {
    data: ApiEngagement[] | null;
    status?: { error?: string | null };
  };
};

type SubmitWorkResponse = {
  submitWork: {
    data: ApiEngagement | null;
    status?: { error?: string | null };
  };
};

export function mapApiWorkStatus(status?: string | null): WorkStatus {
  const key = (status ?? "").toLowerCase();
  if (key === "submitted") return "submitted";
  if (key === "revision_requested") return "revision_requested";
  if (key === "approved") return "approved";
  return "not_submitted";
}

function latestSubmission(engagement: ApiEngagement): ApiSubmission | null {
  const list = engagement.submissions ?? [];
  if (list.length === 0) return null;
  return [...list].sort((a, b) => {
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : b.id;
    return bTime - aTime;
  })[0];
}

/**
 * Maps an API engagement into the local flowchart shape.
 * Marketplace engagements have no checkout step yet — treat them as paid so
 * the deliver UI matches the old ready-to-submit mock.
 */
export function mapApiEngagementToFlow(
  engagement: ApiEngagement,
  options: {
    influencerName: string;
    influencerHandle: string;
    influencerAvatarBg?: string;
  }
): FlowEngagement {
  const job = engagement.job ? mapApiJobToJob(engagement.job) : null;
  const submission = latestSubmission(engagement);
  const links = submission?.links?.filter(Boolean) ?? [];
  const noteParts = [
    ...links,
    submission?.note?.trim() ? submission.note.trim() : "",
  ].filter(Boolean);

  return {
    id: String(engagement.id),
    jobId: String(engagement.jobId),
    influencerId: String(engagement.influencerId),
    entrepreneurId: String(
      engagement.job?.entrepreneur?.id ?? engagement.job?.entrepreneurId ?? ""
    ),
    influencerName: options.influencerName,
    influencerHandle: options.influencerHandle,
    influencerAvatarBg: options.influencerAvatarBg ?? "bg-brand-tint",
    workStatus: mapApiWorkStatus(engagement.workStatus),
    paymentStatus: "escrowed",
    checkoutPaid: true,
    escrowAmount: job?.budgetMax ?? job?.budgetMin ?? 0,
    submissionNote: noteParts.join("\n"),
    reviewNote: submission?.reviewNote?.trim() ?? "",
    createdAt: engagement.createdAt
      ? new Date(engagement.createdAt).getTime()
      : Date.now(),
    source: "invite",
    sourceId: String(engagement.applicationId),
  };
}

export async function fetchMyEngagements(
  signal?: AbortSignal
): Promise<ApiEngagement[]> {
  const res = await graphqlRequest<MyEngagementsResponse>(
    MY_ENGAGEMENTS_QUERY,
    undefined,
    signal
  );
  const { data, status } = res.myEngagements;
  if (status?.error) throw new Error(status.error);
  return data ?? [];
}

export async function submitWork(input: {
  engagementId: number;
  links: string[];
  note?: string;
}): Promise<ApiEngagement> {
  const res = await graphqlRequest<SubmitWorkResponse>(SUBMIT_WORK, { input });
  const { data, status } = res.submitWork;
  if (!data) throw new Error(status?.error ?? "Failed to submit work");
  return data;
}
