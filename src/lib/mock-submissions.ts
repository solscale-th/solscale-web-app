/**
 * Mock data for the "Submission" tab.
 *
 * Influencer view  – jobs the influencer has submitted work/content for.
 * Entrepreneur view – influencers who submitted work to the entrepreneur's jobs.
 */

// ─── Influencer side ──────────────────────────────────────────────────────────

export type Submission = {
  id: string;
  jobId: string;
  submittedDaysAgo: number;
  updatedDaysAgo: number;
  /** true = entrepreneur reviewed/responded since last view */
  hasUpdate: boolean;
};

/** Keyed by influencer userId */
export const MOCK_SUBMISSIONS: Record<string, Submission[]> = {
  "1": [
    { id: "sub-1", jobId: "j1", submittedDaysAgo: 0, updatedDaysAgo: 0, hasUpdate: true  },
    { id: "sub-2", jobId: "j8", submittedDaysAgo: 2, updatedDaysAgo: 1, hasUpdate: true  },
    { id: "sub-3", jobId: "j3", submittedDaysAgo: 4, updatedDaysAgo: 4, hasUpdate: false },
  ],
};

// ─── Entrepreneur side ────────────────────────────────────────────────────────

export type ReceivedSubmission = {
  id: string;
  jobId: string;
  influencerId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg: string;
  submittedDaysAgo: number;
  updatedDaysAgo: number;
  /** true = new submission the entrepreneur hasn't seen yet */
  hasUpdate: boolean;
};

/** Keyed by entrepreneur userId */
export const MOCK_RECEIVED_SUBMISSIONS: Record<string, ReceivedSubmission[]> = {
  "2": [
    {
      id: "rsub-1",
      jobId: "j2",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      submittedDaysAgo: 0,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-2",
      jobId: "j4",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      submittedDaysAgo: 1,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-3",
      jobId: "j6",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      submittedDaysAgo: 3,
      updatedDaysAgo: 3,
      hasUpdate: false,
    },
  ],
};

// ─── Badge count ──────────────────────────────────────────────────────────────

export function getSubmissionBadgeCount(
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string> = new Set(),
): number {
  if (role === "influencer") {
    return (MOCK_SUBMISSIONS[userId] ?? [])
      .filter((s) => s.hasUpdate && !seenIds.has(s.id)).length;
  }
  return (MOCK_RECEIVED_SUBMISSIONS[userId] ?? [])
    .filter((s) => s.hasUpdate && !seenIds.has(s.id)).length;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatSubmitted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
