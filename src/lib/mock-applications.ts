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
    { id: "app-1",  jobId: "j1",  appliedDaysAgo: 0,  updatedDaysAgo: 0,  status: "pending",  hasUpdate: false },
    { id: "app-2",  jobId: "j3",  appliedDaysAgo: 3,  updatedDaysAgo: 1,  status: "accepted", hasUpdate: true  },
    { id: "app-3",  jobId: "j5",  appliedDaysAgo: 5,  updatedDaysAgo: 1,  status: "rejected", hasUpdate: true  },
    { id: "app-4",  jobId: "j8",  appliedDaysAgo: 1,  updatedDaysAgo: 1,  status: "pending",  hasUpdate: false },
    { id: "app-5",  jobId: "j9",  appliedDaysAgo: 2,  updatedDaysAgo: 0,  status: "pending",  hasUpdate: false },
    { id: "app-6",  jobId: "j11", appliedDaysAgo: 0,  updatedDaysAgo: 0,  status: "pending",  hasUpdate: true  },
    { id: "app-7",  jobId: "j13", appliedDaysAgo: 4,  updatedDaysAgo: 2,  status: "accepted", hasUpdate: true  },
    { id: "app-8",  jobId: "j15", appliedDaysAgo: 6,  updatedDaysAgo: 3,  status: "rejected", hasUpdate: false },
    { id: "app-9",  jobId: "j16", appliedDaysAgo: 1,  updatedDaysAgo: 0,  status: "pending",  hasUpdate: true  },
    { id: "app-10", jobId: "j18", appliedDaysAgo: 3,  updatedDaysAgo: 2,  status: "accepted", hasUpdate: true  },
    { id: "app-11", jobId: "j10", appliedDaysAgo: 7,  updatedDaysAgo: 5,  status: "rejected", hasUpdate: false },
    { id: "app-12", jobId: "j14", appliedDaysAgo: 2,  updatedDaysAgo: 0,  status: "pending",  hasUpdate: false },
  ],
};

/** Keyed by userId */
export const MOCK_ENTREPRENEUR_POSTINGS: Record<string, EntrepreneurPosting[]> = {
  "1": [
    { id: "post-E1",  jobId: "j5",  postedDaysAgo: 1,  updatedDaysAgo: 0, status: "active", applicants: 45,  hasUpdate: true  },
    { id: "post-E2",  jobId: "j7",  postedDaysAgo: 2,  updatedDaysAgo: 0, status: "active", applicants: 23,  hasUpdate: true  },
    { id: "post-E3",  jobId: "j2",  postedDaysAgo: 5,  updatedDaysAgo: 2, status: "active", applicants: 112, hasUpdate: false },
    { id: "post-E4",  jobId: "j8",  postedDaysAgo: 7,  updatedDaysAgo: 4, status: "closed", applicants: 88,  hasUpdate: false },
    { id: "post-E5",  jobId: "j6",  postedDaysAgo: 0,  updatedDaysAgo: 0, status: "draft",  applicants: 0,   hasUpdate: false },
    { id: "post-E6",  jobId: "j10", postedDaysAgo: 2,  updatedDaysAgo: 1, status: "active", applicants: 31,  hasUpdate: true  },
    { id: "post-E7",  jobId: "j12", postedDaysAgo: 4,  updatedDaysAgo: 0, status: "active", applicants: 43,  hasUpdate: false },
    { id: "post-E8",  jobId: "j14", postedDaysAgo: 5,  updatedDaysAgo: 3, status: "active", applicants: 18,  hasUpdate: false },
    { id: "post-E9",  jobId: "j16", postedDaysAgo: 0,  updatedDaysAgo: 0, status: "active", applicants: 97,  hasUpdate: true  },
    { id: "post-E10", jobId: "j18", postedDaysAgo: 2,  updatedDaysAgo: 1, status: "active", applicants: 72,  hasUpdate: true  },
    { id: "post-E11", jobId: "j11", postedDaysAgo: 0,  updatedDaysAgo: 0, status: "draft",  applicants: 0,   hasUpdate: false },
    { id: "post-E12", jobId: "j9",  postedDaysAgo: 8,  updatedDaysAgo: 6, status: "closed", applicants: 66,  hasUpdate: false },
  ],
  "2": [
    { id: "post-1",  jobId: "j2",  postedDaysAgo: 3,  updatedDaysAgo: 0, status: "active", applicants: 58,  hasUpdate: true  },
    { id: "post-2",  jobId: "j4",  postedDaysAgo: 3,  updatedDaysAgo: 0, status: "active", applicants: 112, hasUpdate: true  },
    { id: "post-3",  jobId: "j6",  postedDaysAgo: 2,  updatedDaysAgo: 2, status: "active", applicants: 41,  hasUpdate: false },
    { id: "post-4",  jobId: "j7",  postedDaysAgo: 10, updatedDaysAgo: 5, status: "closed", applicants: 79,  hasUpdate: false },
    { id: "post-5",  jobId: "j13", postedDaysAgo: 1,  updatedDaysAgo: 0, status: "active", applicants: 29,  hasUpdate: true  },
    { id: "post-6",  jobId: "j15", postedDaysAgo: 3,  updatedDaysAgo: 1, status: "active", applicants: 14,  hasUpdate: false },
    { id: "post-7",  jobId: "j17", postedDaysAgo: 6,  updatedDaysAgo: 4, status: "active", applicants: 37,  hasUpdate: false },
    { id: "post-8",  jobId: "j1",  postedDaysAgo: 0,  updatedDaysAgo: 0, status: "draft",  applicants: 0,   hasUpdate: false },
    { id: "post-9",  jobId: "j3",  postedDaysAgo: 9,  updatedDaysAgo: 7, status: "closed", applicants: 54,  hasUpdate: false },
    { id: "post-10", jobId: "j8",  postedDaysAgo: 4,  updatedDaysAgo: 2, status: "active", applicants: 53,  hasUpdate: true  },
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
    return (MOCK_INFLUENCER_APPLICATIONS[userId] ?? MOCK_INFLUENCER_APPLICATIONS["1"] ?? [])
      .filter((a) => a.hasUpdate && !seenIds.has(a.id)).length;
  }
  return (MOCK_ENTREPRENEUR_POSTINGS[userId] ?? MOCK_ENTREPRENEUR_POSTINGS["2"] ?? [])
    .filter((p) => p.hasUpdate && !seenIds.has(p.id)).length;
}

export function formatApplied(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
