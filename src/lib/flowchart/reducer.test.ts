import { describe, expect, it } from "vitest";
import { reduceFlowchart, createEmptyFlowchartState, getWalletBalance } from "./reducer";
import { FlowchartError, type FlowAction, type FlowApplication, type FlowEngagement, type FlowInvite } from "./types";

function invite(overrides: Partial<FlowInvite> = {}): FlowInvite {
  return {
    id: "inv-1",
    jobId: "j1",
    entrepreneurId: "ent-1",
    influencerId: "inf-1",
    fromCompany: "Glow Lab",
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
    jobId: "j1",
    influencerId: "inf-1",
    entrepreneurId: "ent-1",
    influencerName: "Nina",
    influencerHandle: "@nina",
    influencerAvatarBg: "bg-[#fce8ee]",
    coverMessage: "I would love this campaign",
    status: "pending",
    createdAt: 1,
    ...overrides,
  };
}

function engagement(overrides: Partial<FlowEngagement> = {}): FlowEngagement {
  return {
    id: "eng-1",
    jobId: "j1",
    influencerId: "inf-1",
    entrepreneurId: "ent-1",
    influencerName: "Nina",
    influencerHandle: "@nina",
    influencerAvatarBg: "bg-[#fce8ee]",
    workStatus: "not_submitted",
    paymentStatus: "unfunded",
    escrowAmount: 20_000,
    submissionNote: "",
    reviewNote: "",
    createdAt: 1,
    source: "application",
    sourceId: "app-1",
    ...overrides,
  };
}

function run(actions: FlowAction[]) {
  return actions.reduce(reduceFlowchart, createEmptyFlowchartState());
}

function expectCode(fn: () => void, code: string) {
  try {
    fn();
    throw new Error(`expected ${code}`);
  } catch (err) {
    expect(err).toBeInstanceOf(FlowchartError);
    expect((err as FlowchartError).code).toBe(code);
  }
}

describe("flowchart: marketplace match", () => {
  it("lets an influencer apply and track a pending application", () => {
    const state = run([{ type: "APPLY_TO_JOB", application: application() }]);
    expect(state.applications).toHaveLength(1);
    expect(state.applications[0].status).toBe("pending");
  });

  it("blocks a duplicate apply on the same job", () => {
    const first = reduceFlowchart(createEmptyFlowchartState(), {
      type: "APPLY_TO_JOB",
      application: application(),
    });
    expectCode(
      () =>
        reduceFlowchart(first, {
          type: "APPLY_TO_JOB",
          application: application({ id: "app-2" }),
        }),
      "ALREADY_APPLIED"
    );
  });

  it("rejects an application without creating an engagement", () => {
    const state = run([
      { type: "APPLY_TO_JOB", application: application() },
      { type: "REJECT_APPLICATION", applicationId: "app-1" },
    ]);
    expect(state.applications[0].status).toBe("rejected");
    expect(state.engagements).toHaveLength(0);
  });
});

describe("flowchart: accept → deposit → job active", () => {
  it("does not activate the job when an application is accepted", () => {
    const state = run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
    ]);
    expect(state.applications[0].status).toBe("accepted");
    expect(state.engagements[0].paymentStatus).toBe("unfunded");
    expect(state.engagements[0].workStatus).toBe("not_submitted");
  });

  it("does not activate the job when an invite is accepted", () => {
    const state = run([
      { type: "SEND_INVITE", invite: invite() },
      {
        type: "ACCEPT_INVITE",
        inviteId: "inv-1",
        engagement: engagement({ source: "invite", sourceId: "inv-1" }),
      },
    ]);
    expect(state.invites[0].status).toBe("accepted");
    expect(state.engagements[0].paymentStatus).toBe("unfunded");
  });

  it("declining an invite returns to the review loop (no engagement)", () => {
    const state = run([
      { type: "SEND_INVITE", invite: invite() },
      { type: "DECLINE_INVITE", inviteId: "inv-1" },
    ]);
    expect(state.invites[0].status).toBe("declined");
    expect(state.engagements).toHaveLength(0);
  });

  it("requires a deposit before Job Active", () => {
    const accepted = run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
    ]);
    expectCode(
      () =>
        reduceFlowchart(accepted, {
          type: "FUND_ENGAGEMENT",
          engagementId: "eng-1",
          entrepreneurId: "ent-1",
        }),
      "INSUFFICIENT_FUNDS"
    );

    const funded = run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 },
      {
        type: "FUND_ENGAGEMENT",
        engagementId: "eng-1",
        entrepreneurId: "ent-1",
      },
    ]);
    expect(funded.engagements[0].paymentStatus).toBe("escrowed");
    expect(getWalletBalance(funded, "ent-1")).toBe(0);
  });

  it("blocks work submission until the job is funded", () => {
    const unfunded = run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
    ]);
    expectCode(
      () =>
        reduceFlowchart(unfunded, {
          type: "SUBMIT_WORK",
          engagementId: "eng-1",
          note: "https://instagram.com/p/demo",
        }),
      "JOB_NOT_ACTIVE"
    );
  });
});

describe("flowchart: work review → pay → withdraw", () => {
  function activeJob() {
    return run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 },
      {
        type: "FUND_ENGAGEMENT",
        engagementId: "eng-1",
        entrepreneurId: "ent-1",
      },
    ]);
  }

  it("supports reject → fix and resubmit → approve", () => {
    const submitted = reduceFlowchart(activeJob(), {
      type: "SUBMIT_WORK",
      engagementId: "eng-1",
      note: "first draft",
    });
    const revision = reduceFlowchart(submitted, {
      type: "REQUEST_REVISION",
      engagementId: "eng-1",
      note: "please reshoot the intro",
    });
    expect(revision.engagements[0].workStatus).toBe("revision_requested");

    const resubmitted = reduceFlowchart(revision, {
      type: "SUBMIT_WORK",
      engagementId: "eng-1",
      note: "revised draft",
    });
    const approved = reduceFlowchart(resubmitted, {
      type: "APPROVE_WORK",
      engagementId: "eng-1",
    });
    expect(approved.engagements[0].workStatus).toBe("approved");
  });

  it("releases escrow to the influencer wallet only after approve", () => {
    const submitted = reduceFlowchart(activeJob(), {
      type: "SUBMIT_WORK",
      engagementId: "eng-1",
      note: "done",
    });
    expectCode(
      () =>
        reduceFlowchart(submitted, {
          type: "RELEASE_PAYMENT",
          engagementId: "eng-1",
        }),
      "WORK_NOT_APPROVED"
    );

    const approved = reduceFlowchart(submitted, {
      type: "APPROVE_WORK",
      engagementId: "eng-1",
    });
    const paid = reduceFlowchart(approved, {
      type: "RELEASE_PAYMENT",
      engagementId: "eng-1",
    });
    expect(paid.engagements[0].paymentStatus).toBe("released");
    expect(getWalletBalance(paid, "inf-1")).toBe(20_000);
    expect(getWalletBalance(paid, "ent-1")).toBe(0);
  });

  it("lets the influencer withdraw credited funds", () => {
    const paid = run([
      { type: "APPLY_TO_JOB", application: application() },
      {
        type: "ACCEPT_APPLICATION",
        applicationId: "app-1",
        engagement: engagement(),
      },
      { type: "DEPOSIT", userId: "ent-1", amount: 20_000 },
      {
        type: "FUND_ENGAGEMENT",
        engagementId: "eng-1",
        entrepreneurId: "ent-1",
      },
      { type: "SUBMIT_WORK", engagementId: "eng-1", note: "done" },
      { type: "APPROVE_WORK", engagementId: "eng-1" },
      { type: "RELEASE_PAYMENT", engagementId: "eng-1" },
      { type: "WITHDRAW", userId: "inf-1", amount: 8_000 },
    ]);
    expect(getWalletBalance(paid, "inf-1")).toBe(12_000);
  });

  it("blocks release after a dispute is raised", () => {
    const submitted = reduceFlowchart(activeJob(), {
      type: "SUBMIT_WORK",
      engagementId: "eng-1",
      note: "done",
    });
    const disputed = reduceFlowchart(submitted, {
      type: "RAISE_DISPUTE",
      dispute: {
        id: "dsp-1",
        engagementId: "eng-1",
        raisedBy: "ent-1",
        reason: "deliverable does not match brief",
        createdAt: 2,
      },
    });
    expect(disputed.engagements[0].paymentStatus).toBe("disputed");
    expectCode(
      () =>
        reduceFlowchart(disputed, {
          type: "APPROVE_WORK",
          engagementId: "eng-1",
        }),
      "DISPUTED"
    );
  });

  it("allows a rating only after payment is released", () => {
    const approved = reduceFlowchart(
      reduceFlowchart(activeJob(), {
        type: "SUBMIT_WORK",
        engagementId: "eng-1",
        note: "done",
      }),
      { type: "APPROVE_WORK", engagementId: "eng-1" }
    );
    expectCode(
      () =>
        reduceFlowchart(approved, {
          type: "LEAVE_RATING",
          rating: {
            engagementId: "eng-1",
            fromUserId: "ent-1",
            toUserId: "inf-1",
            stars: 5,
            comment: "great",
            createdAt: 3,
          },
        }),
      "PAYMENT_NOT_RELEASED"
    );

    const paid = reduceFlowchart(approved, {
      type: "RELEASE_PAYMENT",
      engagementId: "eng-1",
    });
    const rated = reduceFlowchart(paid, {
      type: "LEAVE_RATING",
      rating: {
        engagementId: "eng-1",
        fromUserId: "ent-1",
        toUserId: "inf-1",
        stars: 5,
        comment: "great",
        createdAt: 3,
      },
    });
    expect(rated.ratings).toHaveLength(1);
  });
});
