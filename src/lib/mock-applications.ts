/**
 * Mock application data.
 * In a real app this would come from an API.
 *
 * `hasUpdate`     = unseen status change → drives the header badge count.
 * `updatedDaysAgo` = days since the last status change on this entry.
 */

export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type JobPostingStatus   = "active"  | "closed"  | "draft";

/** An application submitted by an influencer */
export type InfluencerApplication = {
  id: string;
  jobId: string;
  appliedDaysAgo: number;
  updatedDaysAgo: number;
  status: ApplicationStatus;
  hasUpdate: boolean;
};

/** A job posting created by an entrepreneur */
export type EntrepreneurPosting = {
  id: string;
  jobId: string;
  postedDaysAgo: number;
  updatedDaysAgo: number;
  status: JobPostingStatus;
  applicants: number;
  hasUpdate: boolean;
};

/** Keyed by userId */
export const MOCK_INFLUENCER_APPLICATIONS: Record<string, InfluencerApplication[]> = {
  "1": [
    { id: "app-1", jobId: "j1", appliedDaysAgo: 0, updatedDaysAgo: 0, status: "pending",  hasUpdate: false },
    { id: "app-2", jobId: "j3", appliedDaysAgo: 3, updatedDaysAgo: 1, status: "accepted", hasUpdate: true  },
    { id: "app-3", jobId: "j5", appliedDaysAgo: 5, updatedDaysAgo: 1, status: "rejected", hasUpdate: true  },
    { id: "app-4", jobId: "j8", appliedDaysAgo: 1, updatedDaysAgo: 1, status: "pending",  hasUpdate: false },
  ],
};

/** Keyed by userId */
export const MOCK_ENTREPRENEUR_POSTINGS: Record<string, EntrepreneurPosting[]> = {
  "1": [
    { id: "post-E1", jobId: "j5", postedDaysAgo: 1,  updatedDaysAgo: 0, status: "active", applicants: 45,  hasUpdate: true  },
    { id: "post-E2", jobId: "j7", postedDaysAgo: 2,  updatedDaysAgo: 0, status: "active", applicants: 23,  hasUpdate: true  },
    { id: "post-E3", jobId: "j2", postedDaysAgo: 5,  updatedDaysAgo: 2, status: "active", applicants: 112, hasUpdate: false },
    { id: "post-E4", jobId: "j8", postedDaysAgo: 7,  updatedDaysAgo: 4, status: "closed", applicants: 88,  hasUpdate: false },
    { id: "post-E5", jobId: "j6", postedDaysAgo: 0,  updatedDaysAgo: 0, status: "draft",  applicants: 0,   hasUpdate: false },
  ],
  "2": [
    { id: "post-1", jobId: "j2", postedDaysAgo: 3,  updatedDaysAgo: 0, status: "active", applicants: 58,  hasUpdate: true  },
    { id: "post-2", jobId: "j4", postedDaysAgo: 3,  updatedDaysAgo: 0, status: "active", applicants: 112, hasUpdate: true  },
    { id: "post-3", jobId: "j6", postedDaysAgo: 2,  updatedDaysAgo: 2, status: "active", applicants: 41,  hasUpdate: false },
    { id: "post-4", jobId: "j7", postedDaysAgo: 10, updatedDaysAgo: 5, status: "closed", applicants: 79,  hasUpdate: false },
  ],
};

/** Returns the number of unseen updates for the Application nav badge.
 *  `seenIds` is the set of application/posting IDs the user has already viewed. */
export function getApplicationBadgeCount(
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string> = new Set(),
): number {
  if (role === "influencer") {
    return (MOCK_INFLUENCER_APPLICATIONS[userId] ?? [])
      .filter((a) => a.hasUpdate && !seenIds.has(a.id)).length;
  }
  return (MOCK_ENTREPRENEUR_POSTINGS[userId] ?? [])
    .filter((p) => p.hasUpdate && !seenIds.has(p.id)).length;
}

export function formatApplied(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
