import {
  EMPTY_FLOWCHART_STATE,
  FlowchartError,
  type FlowAction,
  type FlowchartState,
  type FlowEngagement,
} from "./types";

function requireEngagement(
  state: FlowchartState,
  engagementId: string
): FlowEngagement {
  const engagement = state.engagements.find((item) => item.id === engagementId);
  if (!engagement) throw new FlowchartError("ENGAGEMENT_NOT_FOUND");
  return engagement;
}

function replaceEngagement(
  state: FlowchartState,
  engagement: FlowEngagement
): FlowchartState {
  return {
    ...state,
    engagements: state.engagements.map((item) =>
      item.id === engagement.id ? engagement : item
    ),
  };
}

/**
 * Pure reducer for the UI-only flowchart. Callers persist the result.
 * Keep side effects (IDs, timestamps, localStorage) out of this function
 * so unit tests can pin every chart transition.
 */
export function reduceFlowchart(
  state: FlowchartState,
  action: FlowAction
): FlowchartState {
  switch (action.type) {
    case "PUBLISH_JOB": {
      return {
        ...state,
        postedJobs: [...state.postedJobs, action.job],
      };
    }

    case "APPLY_TO_JOB": {
      const duplicate = state.applications.some(
        (item) =>
          item.jobId === action.application.jobId &&
          item.influencerId === action.application.influencerId &&
          item.status !== "rejected"
      );
      if (duplicate) throw new FlowchartError("ALREADY_APPLIED");
      return {
        ...state,
        applications: [...state.applications, action.application],
      };
    }

    case "SEND_INVITE": {
      return {
        ...state,
        invites: [...state.invites, action.invite],
      };
    }

    case "DECLINE_INVITE": {
      const invite = state.invites.find((item) => item.id === action.inviteId);
      if (!invite) throw new FlowchartError("INVITE_NOT_FOUND");
      if (invite.status !== "pending") {
        throw new FlowchartError("INVITE_NOT_PENDING");
      }
      return {
        ...state,
        invites: state.invites.map((item) =>
          item.id === action.inviteId ? { ...item, status: "declined" } : item
        ),
      };
    }

    case "ACCEPT_INVITE": {
      const invite = state.invites.find((item) => item.id === action.inviteId);
      if (!invite) throw new FlowchartError("INVITE_NOT_FOUND");
      if (invite.status !== "pending") {
        throw new FlowchartError("INVITE_NOT_PENDING");
      }
      return {
        ...state,
        invites: state.invites.map((item) =>
          item.id === action.inviteId ? { ...item, status: "accepted" } : item
        ),
        engagements: [...state.engagements, action.engagement],
      };
    }

    case "REJECT_APPLICATION": {
      const application = state.applications.find(
        (item) => item.id === action.applicationId
      );
      if (!application) throw new FlowchartError("APPLICATION_NOT_FOUND");
      if (application.status !== "pending") {
        throw new FlowchartError("APPLICATION_NOT_PENDING");
      }
      return {
        ...state,
        applications: state.applications.map((item) =>
          item.id === action.applicationId
            ? { ...item, status: "rejected" }
            : item
        ),
      };
    }

    case "ACCEPT_APPLICATION": {
      const application = state.applications.find(
        (item) => item.id === action.applicationId
      );
      if (!application) throw new FlowchartError("APPLICATION_NOT_FOUND");
      if (application.status !== "pending") {
        throw new FlowchartError("APPLICATION_NOT_PENDING");
      }
      return {
        ...state,
        applications: state.applications.map((item) =>
          item.id === action.applicationId
            ? { ...item, status: "accepted" }
            : item
        ),
        engagements: [...state.engagements, action.engagement],
      };
    }

    case "SUBMIT_WORK": {
      const engagement = requireEngagement(state, action.engagementId);
      if (engagement.paymentStatus !== "escrowed") {
        throw new FlowchartError("JOB_NOT_ACTIVE");
      }
      if (
        engagement.workStatus !== "not_submitted" &&
        engagement.workStatus !== "revision_requested"
      ) {
        throw new FlowchartError("JOB_NOT_ACTIVE");
      }
      return replaceEngagement(state, {
        ...engagement,
        workStatus: "submitted",
        submissionNote: action.note,
      });
    }

    case "REQUEST_REVISION": {
      const engagement = requireEngagement(state, action.engagementId);
      if (engagement.workStatus !== "submitted") {
        throw new FlowchartError("WORK_NOT_SUBMITTED");
      }
      if (engagement.paymentStatus === "disputed") {
        throw new FlowchartError("DISPUTED");
      }
      return replaceEngagement(state, {
        ...engagement,
        workStatus: "revision_requested",
        reviewNote: action.note,
      });
    }

    case "APPROVE_WORK": {
      const engagement = requireEngagement(state, action.engagementId);
      if (engagement.workStatus !== "submitted") {
        throw new FlowchartError("WORK_NOT_SUBMITTED");
      }
      if (engagement.paymentStatus === "disputed") {
        throw new FlowchartError("DISPUTED");
      }
      return replaceEngagement(state, {
        ...engagement,
        workStatus: "approved",
        reviewNote: "Work has been approved.",
      });
    }

    case "RELEASE_PAYMENT": {
      const engagement = requireEngagement(state, action.engagementId);
      if (engagement.workStatus !== "approved") {
        throw new FlowchartError("WORK_NOT_APPROVED");
      }
      if (engagement.paymentStatus === "disputed") {
        throw new FlowchartError("DISPUTED");
      }
      if (engagement.paymentStatus === "released") {
        throw new FlowchartError("ALREADY_RELEASED");
      }
      if (engagement.paymentStatus !== "escrowed") {
        throw new FlowchartError("PAYMENT_NOT_ESCROWED");
      }
      return replaceEngagement(state, {
        ...engagement,
        paymentStatus: "released",
      });
    }

    case "RAISE_DISPUTE": {
      const engagement = requireEngagement(
        state,
        action.dispute.engagementId
      );
      if (engagement.paymentStatus !== "escrowed") {
        throw new FlowchartError("PAYMENT_NOT_ESCROWED");
      }
      return {
        ...replaceEngagement(state, {
          ...engagement,
          paymentStatus: "disputed",
        }),
        disputes: [...state.disputes, action.dispute],
      };
    }

    case "LEAVE_RATING": {
      if (action.rating.stars < 1 || action.rating.stars > 5) {
        throw new FlowchartError("INVALID_STARS");
      }
      const engagement = requireEngagement(
        state,
        action.rating.engagementId
      );
      if (engagement.paymentStatus !== "released") {
        throw new FlowchartError("PAYMENT_NOT_RELEASED");
      }
      const already = state.ratings.some(
        (item) =>
          item.engagementId === action.rating.engagementId &&
          item.fromUserId === action.rating.fromUserId
      );
      if (already) throw new FlowchartError("ALREADY_RATED");
      return {
        ...state,
        ratings: [...state.ratings, action.rating],
      };
    }

    default: {
      return state;
    }
  }
}

export function createEmptyFlowchartState(): FlowchartState {
  return {
    ...EMPTY_FLOWCHART_STATE,
    postedJobs: [],
    invites: [],
    applications: [],
    engagements: [],
    ratings: [],
    disputes: [],
  };
}
