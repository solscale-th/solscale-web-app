import { describe, expect, it } from "vitest";
import {
  liveApplicationBadgeCount,
  liveDirectBadgeCount,
  liveMyJobBadgeCount,
  liveSubmissionBadgeCount,
} from "./badges";
import { createEmptyFlowchartState } from "./reducer";
import type { FlowApplication, FlowEngagement, FlowInvite } from "./types";

function invite(overrides: Partial<FlowInvite> = {}): FlowInvite {
  return {
    id: "inv-1",
    jobId: "1",
    entrepreneurId: "2",
    influencerId: "10",
    fromCompany: "heew",
    influencerName: "Nina",
    isPrivate: true,
    status: "pending",
    createdAt: 1,
    ...overrides,
  };
}

function application(overrides: Partial<FlowApplication> = {}): FlowApplication {
  return {
    id: "app-1",
    jobId: "1",
    influencerId: "10",
    entrepreneurId: "2",
    influencerName: "Nina",
    influencerHandle: "@nina",
    influencerAvatarBg: "bg-brand-tint",
    coverMessage: "",
    status: "accepted",
    createdAt: 1,
    ...overrides,
  };
}

function engagement(overrides: Partial<FlowEngagement> = {}): FlowEngagement {
  return {
    id: "eng-1",
    jobId: "1",
    influencerId: "10",
    entrepreneurId: "2",
    influencerName: "Nina",
    influencerHandle: "@nina",
    influencerAvatarBg: "bg-brand-tint",
    workStatus: "submitted",
    paymentStatus: "escrowed",
    escrowAmount: 20_000,
    submissionNote: "Done",
    reviewNote: "",
    createdAt: 1,
    source: "invite",
    sourceId: "inv-1",
    ...overrides,
  };
}

describe("live nav badges", () => {
  it("ignores seed-style ids and only counts live flowchart rows", () => {
    const state = {
      ...createEmptyFlowchartState(),
      invites: [invite()],
      applications: [application()],
      engagements: [engagement()],
    };
    const seen = new Set<string>();

    expect(liveDirectBadgeCount(state, "10", "influencer", seen)).toBe(1);
    expect(liveApplicationBadgeCount(state, "10", "influencer", seen)).toBe(1);
    expect(liveSubmissionBadgeCount(state, "10", "influencer", seen)).toBe(1);
    expect(liveMyJobBadgeCount(state, "10", "influencer", seen)).toBe(1);
  });

  it("keeps a payment dot for the brand after a private offer is accepted", () => {
    const state = {
      ...createEmptyFlowchartState(),
      invites: [invite({ status: "accepted" })],
      engagements: [engagement({ paymentStatus: "escrowed", sourceId: "inv-1" })],
    };

    expect(liveDirectBadgeCount(state, "2", "entrepreneur", new Set(["inv-1"]))).toBe(1);
  });

  it("drops the payment dot once the brand has paid the checkout", () => {
    const state = {
      ...createEmptyFlowchartState(),
      invites: [invite({ status: "accepted" })],
      engagements: [engagement({ paymentStatus: "escrowed", checkoutPaid: true, sourceId: "inv-1" })],
    };

    expect(liveDirectBadgeCount(state, "2", "entrepreneur", new Set())).toBe(0);
  });

  it("drops the payment dot once the brand has paid", () => {
    const state = {
      ...createEmptyFlowchartState(),
      invites: [invite({ status: "accepted" })],
      engagements: [engagement({ paymentStatus: "released", sourceId: "inv-1" })],
    };

    expect(liveDirectBadgeCount(state, "2", "entrepreneur", new Set())).toBe(0);
  });

  it("counts a revision request on Current Job for the influencer", () => {
    const state = {
      ...createEmptyFlowchartState(),
      engagements: [engagement({ workStatus: "revision_requested" })],
    };

    expect(liveMyJobBadgeCount(state, "10", "influencer", new Set())).toBe(1);
    expect(liveMyJobBadgeCount(state, "2", "entrepreneur", new Set())).toBe(0);
  });

  it("does not badge a pending application as an update for the influencer", () => {
    const state = {
      ...createEmptyFlowchartState(),
      applications: [application({ status: "pending" })],
    };
    expect(
      liveApplicationBadgeCount(state, "10", "influencer", new Set())
    ).toBe(0);
  });
});
