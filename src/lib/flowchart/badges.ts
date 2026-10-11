import type { FlowchartState } from "./types";

const SUBMITTED_STATUSES = new Set(["submitted", "revision_requested", "approved"]);

export function liveApplicationBadgeCount(
  state: FlowchartState,
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string>
): number {
  if (role === "influencer") {
    return state.applications.filter(
      (app) =>
        app.influencerId === userId &&
        app.status !== "pending" &&
        !seenIds.has(app.id)
    ).length;
  }
  return state.applications.filter(
    (app) =>
      app.entrepreneurId === userId &&
      app.status === "pending" &&
      !seenIds.has(app.id)
  ).length;
}

export function liveDirectBadgeCount(
  state: FlowchartState,
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string>
): number {
  return state.invites.filter((invite) => {
    const mine =
      role === "influencer"
        ? invite.influencerId === userId
        : invite.entrepreneurId === userId;
    if (!mine) return false;
    if (invite.status === "pending") return !seenIds.has(invite.id);
    if (role !== "entrepreneur" || invite.status !== "accepted") return false;
    return state.engagements.some(
      (engagement) =>
        engagement.sourceId === invite.id &&
        engagement.paymentStatus === "escrowed" &&
        !engagement.checkoutPaid
    );
  }).length;
}

export function liveMyJobBadgeCount(
  state: FlowchartState,
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string>
): number {
  return state.engagements.filter((eng) => {
    const mine =
      role === "influencer"
        ? eng.influencerId === userId
        : eng.entrepreneurId === userId;
    const hasUpdate =
      role === "influencer"
        ? eng.workStatus === "submitted" || eng.workStatus === "revision_requested"
        : eng.workStatus === "submitted";
    return mine && hasUpdate && !seenIds.has(eng.id);
  }).length;
}

export function liveSubmissionBadgeCount(
  state: FlowchartState,
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string>
): number {
  if (role === "influencer") {
    return state.engagements.filter(
      (eng) =>
        eng.influencerId === userId &&
        SUBMITTED_STATUSES.has(eng.workStatus) &&
        (eng.workStatus === "submitted" ||
          eng.workStatus === "revision_requested") &&
        !seenIds.has(eng.id)
    ).length;
  }
  return state.engagements.filter(
    (eng) =>
      eng.entrepreneurId === userId &&
      eng.workStatus === "submitted" &&
      !seenIds.has(eng.id)
  ).length;
}
