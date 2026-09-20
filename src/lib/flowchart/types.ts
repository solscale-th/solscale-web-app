/**
 * UI-only marketplace flowchart model.
 *
 * This is the click-through contract from the Influencer / Entrepreneur journey
 * diagram. Persistence is localStorage. Nothing here talks to GraphQL.
 *
 * API connecting (replace this module, do not grow it):
 * - Jobs, invites, applications, engagements → marketplace Job / Match APIs
 * - Accept & pay / disputes → a ledger service + payment provider
 * - Ratings / disputes → moderation + review APIs
 *
 * RISK: two tabs can race on the same engagement. Production payment MUST be a
 * single atomic transaction on the server.
 */

export type InviteStatus = "pending" | "accepted" | "declined";
export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type JobVisibility = "public" | "private";
export type WorkStatus =
  | "not_submitted"
  | "submitted"
  | "revision_requested"
  | "approved";

/**
 * escrowed  = Job Active after match — brand can review work and release pay
 * released  = Accept & Pay completed
 * disputed  = Report path — funds stay held until admin resolves
 */
export type PaymentStatus = "escrowed" | "released" | "disputed";

export type FlowPostedJob = {
  id: string;
  entrepreneurId: string;
  companyName: string;
  title: string;
  description: string;
  brief: string;
  platform: string;
  deliverables: string[];
  requirements: string[];
  tags: string[];
  location: string;
  duration: string;
  budgetMin: number;
  budgetMax: number;
  visibility: JobVisibility;
  promoted?: boolean;
  createdAt: number;
};

export type FlowInvite = {
  id: string;
  jobId: string;
  entrepreneurId: string;
  influencerId: string;
  fromCompany: string;
  influencerName: string;
  isPrivate: boolean;
  status: InviteStatus;
  createdAt: number;
};

export type FlowApplication = {
  id: string;
  jobId: string;
  influencerId: string;
  entrepreneurId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg: string;
  coverMessage: string;
  status: ApplicationStatus;
  createdAt: number;
};

export type FlowEngagement = {
  id: string;
  jobId: string;
  influencerId: string;
  entrepreneurId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg: string;
  workStatus: WorkStatus;
  paymentStatus: PaymentStatus;
  escrowAmount: number;
  submissionNote: string;
  reviewNote: string;
  createdAt: number;
  source: "invite" | "application";
  sourceId: string;
};

export type FlowRating = {
  engagementId: string;
  fromUserId: string;
  toUserId: string;
  stars: number;
  comment: string;
  createdAt: number;
};

export type FlowDispute = {
  id: string;
  engagementId: string;
  raisedBy: string;
  reason: string;
  createdAt: number;
};

export type FlowchartState = {
  version: 1;
  postedJobs: FlowPostedJob[];
  invites: FlowInvite[];
  applications: FlowApplication[];
  engagements: FlowEngagement[];
  ratings: FlowRating[];
  disputes: FlowDispute[];
};

export const EMPTY_FLOWCHART_STATE: FlowchartState = {
  version: 1,
  postedJobs: [],
  invites: [],
  applications: [],
  engagements: [],
  ratings: [],
  disputes: [],
};

export type FlowErrorCode =
  | "INVITE_NOT_FOUND"
  | "INVITE_NOT_PENDING"
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_NOT_PENDING"
  | "ALREADY_APPLIED"
  | "ENGAGEMENT_NOT_FOUND"
  | "JOB_NOT_ACTIVE"
  | "WORK_NOT_SUBMITTED"
  | "WORK_NOT_APPROVED"
  | "PAYMENT_NOT_ESCROWED"
  | "ALREADY_RELEASED"
  | "PAYMENT_NOT_RELEASED"
  | "DISPUTED"
  | "ALREADY_RATED"
  | "INVALID_STARS";

export class FlowchartError extends Error {
  readonly code: FlowErrorCode;

  constructor(code: FlowErrorCode, message?: string) {
    super(message ?? code);
    this.name = "FlowchartError";
    this.code = code;
  }
}

export type FlowAction =
  | { type: "PUBLISH_JOB"; job: FlowPostedJob }
  | { type: "APPLY_TO_JOB"; application: FlowApplication }
  | { type: "SEND_INVITE"; invite: FlowInvite }
  | { type: "ACCEPT_INVITE"; inviteId: string; engagement: FlowEngagement }
  | { type: "DECLINE_INVITE"; inviteId: string }
  | { type: "ACCEPT_APPLICATION"; applicationId: string; engagement: FlowEngagement }
  | { type: "REJECT_APPLICATION"; applicationId: string }
  | { type: "SUBMIT_WORK"; engagementId: string; note: string }
  | { type: "REQUEST_REVISION"; engagementId: string; note: string }
  | { type: "APPROVE_WORK"; engagementId: string }
  | { type: "RELEASE_PAYMENT"; engagementId: string }
  | { type: "RAISE_DISPUTE"; dispute: FlowDispute }
  | { type: "LEAVE_RATING"; rating: FlowRating };
