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
    { id: "sub-1",  jobId: "j1",  submittedDaysAgo: 0, updatedDaysAgo: 0, hasUpdate: true  },
    { id: "sub-2",  jobId: "j8",  submittedDaysAgo: 2, updatedDaysAgo: 1, hasUpdate: true  },
    { id: "sub-3",  jobId: "j3",  submittedDaysAgo: 4, updatedDaysAgo: 4, hasUpdate: false },
    { id: "sub-4",  jobId: "j13", submittedDaysAgo: 1, updatedDaysAgo: 0, hasUpdate: true  },
    { id: "sub-5",  jobId: "j16", submittedDaysAgo: 3, updatedDaysAgo: 2, hasUpdate: true  },
    { id: "sub-6",  jobId: "j9",  submittedDaysAgo: 7, updatedDaysAgo: 6, hasUpdate: false },
    { id: "sub-7",  jobId: "j18", submittedDaysAgo: 0, updatedDaysAgo: 0, hasUpdate: true  },
    { id: "sub-8",  jobId: "j10", submittedDaysAgo: 5, updatedDaysAgo: 5, hasUpdate: false },
    { id: "sub-9",  jobId: "j11", submittedDaysAgo: 2, updatedDaysAgo: 1, hasUpdate: false },
    { id: "sub-10", jobId: "j6",  submittedDaysAgo: 6, updatedDaysAgo: 4, hasUpdate: false },
    { id: "sub-11", jobId: "j14", submittedDaysAgo: 1, updatedDaysAgo: 0, hasUpdate: true  },
    { id: "sub-12", jobId: "j17", submittedDaysAgo: 3, updatedDaysAgo: 3, hasUpdate: false },
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
  "1": [
    {
      id: "rsub-E1",
      jobId: "j5",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      submittedDaysAgo: 0,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-E2",
      jobId: "j7",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      submittedDaysAgo: 1,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-E3",
      jobId: "j2",
      influencerId: "inf4",
      influencerName: "Tawan Suphan",
      influencerHandle: "@tawan.fit",
      influencerAvatarBg: "bg-[#d1fae5]",
      submittedDaysAgo: 4,
      updatedDaysAgo: 4,
      hasUpdate: false,
    },
    {
      id: "rsub-E4",
      jobId: "j16",
      influencerId: "inf11",
      influencerName: "Dao Beauty",
      influencerHandle: "@dao.makeup",
      influencerAvatarBg: "bg-[#ffe0ec]",
      submittedDaysAgo: 2,
      updatedDaysAgo: 1,
      hasUpdate: true,
    },
    {
      id: "rsub-E5",
      jobId: "j10",
      influencerId: "inf15",
      influencerName: "Born Invests",
      influencerHandle: "@born.invests",
      influencerAvatarBg: "bg-[#e4e0ff]",
      submittedDaysAgo: 2,
      updatedDaysAgo: 2,
      hasUpdate: true,
    },
    {
      id: "rsub-E6",
      jobId: "j8",
      influencerId: "inf4",
      influencerName: "Maya Fit",
      influencerHandle: "@maya.moves",
      influencerAvatarBg: "bg-[#d0f0e8]",
      submittedDaysAgo: 5,
      updatedDaysAgo: 5,
      hasUpdate: false,
    },
    {
      id: "rsub-E7",
      jobId: "j11",
      influencerId: "inf7",
      influencerName: "Beam Gamer",
      influencerHandle: "@beam.plays",
      influencerAvatarBg: "bg-[#f0e6ff]",
      submittedDaysAgo: 0,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-E8",
      jobId: "j9",
      influencerId: "inf16",
      influencerName: "Som Adventures",
      influencerHandle: "@som.outdoors",
      influencerAvatarBg: "bg-[#dcf0d4]",
      submittedDaysAgo: 3,
      updatedDaysAgo: 2,
      hasUpdate: false,
    },
  ],
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
    {
      id: "rsub-4",
      jobId: "j13",
      influencerId: "inf10",
      influencerName: "Fern Wellness",
      influencerHandle: "@fern.calm",
      influencerAvatarBg: "bg-[#d8f0e0]",
      submittedDaysAgo: 1,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-5",
      jobId: "j17",
      influencerId: "inf2",
      influencerName: "Tom Foodie",
      influencerHandle: "@tom.eats.th",
      influencerAvatarBg: "bg-[#ffe8cc]",
      submittedDaysAgo: 2,
      updatedDaysAgo: 2,
      hasUpdate: true,
    },
    {
      id: "rsub-6",
      jobId: "j15",
      influencerId: "inf5",
      influencerName: "James Wallet",
      influencerHandle: "@james.wallet",
      influencerAvatarBg: "bg-[#e8e0ff]",
      submittedDaysAgo: 6,
      updatedDaysAgo: 6,
      hasUpdate: false,
    },
    {
      id: "rsub-7",
      jobId: "j8",
      influencerId: "inf4",
      influencerName: "Maya Fit",
      influencerHandle: "@maya.moves",
      influencerAvatarBg: "bg-[#d0f0e8]",
      submittedDaysAgo: 0,
      updatedDaysAgo: 0,
      hasUpdate: true,
    },
    {
      id: "rsub-8",
      jobId: "j3",
      influencerId: "inf3",
      influencerName: "Arkin Tech",
      influencerHandle: "@arkin.unbox",
      influencerAvatarBg: "bg-[#cce4ff]",
      submittedDaysAgo: 4,
      updatedDaysAgo: 4,
      hasUpdate: false,
    },
    {
      id: "rsub-9",
      jobId: "j1",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      submittedDaysAgo: 5,
      updatedDaysAgo: 5,
      hasUpdate: false,
    },
    {
      id: "rsub-10",
      jobId: "j10",
      influencerId: "inf15",
      influencerName: "Born Invests",
      influencerHandle: "@born.invests",
      influencerAvatarBg: "bg-[#e4e0ff]",
      submittedDaysAgo: 2,
      updatedDaysAgo: 1,
      hasUpdate: true,
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
    return (MOCK_SUBMISSIONS[userId] ?? MOCK_SUBMISSIONS["1"] ?? [])
      .filter((s) => s.hasUpdate && !seenIds.has(s.id)).length;
  }
  return (MOCK_RECEIVED_SUBMISSIONS[userId] ?? MOCK_RECEIVED_SUBMISSIONS["2"] ?? [])
    .filter((s) => s.hasUpdate && !seenIds.has(s.id)).length;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function formatSubmitted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
