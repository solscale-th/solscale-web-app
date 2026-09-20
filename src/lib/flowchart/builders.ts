import { createFlowId } from "./store";
import type {
  FlowApplication,
  FlowDispute,
  FlowEngagement,
  FlowInvite,
  FlowPostedJob,
  FlowRating,
  JobVisibility,
} from "./types";

export function buildPostedJob(input: {
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
}): FlowPostedJob {
  return {
    id: createFlowId("job"),
    createdAt: Date.now(),
    promoted: false,
    ...input,
  };
}

export function buildInvite(input: {
  jobId: string;
  entrepreneurId: string;
  influencerId: string;
  fromCompany: string;
  influencerName: string;
  isPrivate: boolean;
}): FlowInvite {
  return {
    id: createFlowId("inv"),
    status: "pending",
    createdAt: Date.now(),
    ...input,
  };
}

export function buildApplication(input: {
  jobId: string;
  influencerId: string;
  entrepreneurId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg?: string;
  coverMessage: string;
}): FlowApplication {
  return {
    id: createFlowId("app"),
    influencerAvatarBg: input.influencerAvatarBg ?? "bg-[#fce8ee]",
    status: "pending",
    createdAt: Date.now(),
    ...input,
  };
}

export function buildEngagement(input: {
  jobId: string;
  influencerId: string;
  entrepreneurId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg?: string;
  escrowAmount: number;
  source: "invite" | "application";
  sourceId: string;
}): FlowEngagement {
  return {
    id: createFlowId("eng"),
    influencerAvatarBg: input.influencerAvatarBg ?? "bg-[#fce8ee]",
    workStatus: "not_submitted",
    paymentStatus: "escrowed",
    submissionNote: "",
    reviewNote: "",
    createdAt: Date.now(),
    ...input,
  };
}

export function buildDispute(input: {
  engagementId: string;
  raisedBy: string;
  reason: string;
}): FlowDispute {
  return {
    id: createFlowId("dsp"),
    createdAt: Date.now(),
    ...input,
  };
}

export function buildRating(input: {
  engagementId: string;
  fromUserId: string;
  toUserId: string;
  stars: number;
  comment: string;
}): FlowRating {
  return {
    createdAt: Date.now(),
    ...input,
  };
}
