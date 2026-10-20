import { fetchMyApplications } from "@/lib/applications";
import { fetchMyAcceptedJobs, fetchMyRequestedJobs } from "@/lib/jobs";

export type NavBadgeCounts = {
  applications: number;
  direct: number;
  myJobs: number;
};

function unseenCount(ids: Array<string | number>, seen: Set<string>): number {
  let count = 0;
  for (const id of ids) {
    if (!seen.has(String(id))) count += 1;
  }
  return count;
}

/**
 * Badge counts from marketplace list APIs.
 * Empty API results stay at 0 — no flowchart / mock fallbacks.
 */
export async function fetchNavBadgeCounts(input: {
  role: "influencer" | "entrepreneur";
  seenApplicationIds: Set<string>;
  seenDirectIds: Set<string>;
  seenMyJobIds: Set<string>;
  signal?: AbortSignal;
}): Promise<NavBadgeCounts> {
  const { role, seenApplicationIds, seenDirectIds, seenMyJobIds, signal } = input;

  const [applications, requested, accepted] = await Promise.all([
    role === "influencer"
      ? fetchMyApplications(signal).catch(() => [])
      : Promise.resolve([]),
    fetchMyRequestedJobs({ signal }).catch(() => []),
    fetchMyAcceptedJobs({ signal }).catch(() => []),
  ]);

  const applicationIds =
    role === "influencer"
      ? applications
          .filter((app) => app.status.toLowerCase() !== "pending")
          .map((app) => app.id)
      : [];

  return {
    applications: unseenCount(applicationIds, seenApplicationIds),
    direct: unseenCount(
      requested.map((job) => job.id),
      seenDirectIds
    ),
    myJobs: unseenCount(
      accepted.map((job) => job.id),
      seenMyJobIds
    ),
  };
}
