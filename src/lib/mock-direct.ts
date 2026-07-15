/**
 * Mock data for the "Direct" tab.
 *
 * Influencer view – direct offers sent by an entrepreneur to a specific influencer.
 * Entrepreneur view – influencers who applied to (or were shortlisted for) a posted job.
 *
 * Jobs can be "open" (publicly visible) or "private" (invite-only / unlisted).
 */

// ─── Influencer side ──────────────────────────────────────────────────────────

export type DirectOfferStatus = "pending" | "accepted" | "declined";

export type DirectOffer = {
  id: string;
  /** The job being offered */
  jobId: string;
  /** Company that sent the offer */
  fromCompany: string;
  sentDaysAgo: number;
  updatedDaysAgo: number;
  /** true = invite-only / private listing; false = open public job */
  isPrivate: boolean;
  status: DirectOfferStatus;
  /** true = status changed since the influencer last viewed this card */
  hasUpdate: boolean;
};

/** Keyed by influencer userId */
export const MOCK_DIRECT_OFFERS: Record<string, DirectOffer[]> = {
  "1": [
    {
      id: "offer-1",
      jobId: "j2",
      fromCompany: "SomTam Empire",
      sentDaysAgo: 1,
      updatedDaysAgo: 0,
      isPrivate: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "offer-2",
      jobId: "j6",
      fromCompany: "LaeOlin Partner Brand",
      sentDaysAgo: 3,
      updatedDaysAgo: 1,
      isPrivate: true,
      status: "accepted",
      hasUpdate: true,
    },
    {
      id: "offer-3",
      jobId: "j4",
      fromCompany: "Zara TH Studio",
      sentDaysAgo: 5,
      updatedDaysAgo: 5,
      isPrivate: true,
      status: "declined",
      hasUpdate: false,
    },
    {
      id: "offer-4",
      jobId: "j9",
      fromCompany: "The Andaman Collection",
      sentDaysAgo: 0,
      updatedDaysAgo: 0,
      isPrivate: true,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "offer-5",
      jobId: "j16",
      fromCompany: "ColorBoom Cosmetics",
      sentDaysAgo: 2,
      updatedDaysAgo: 1,
      isPrivate: true,
      status: "accepted",
      hasUpdate: true,
    },
    {
      id: "offer-6",
      jobId: "j18",
      fromCompany: "PeakForm Thailand",
      sentDaysAgo: 4,
      updatedDaysAgo: 2,
      isPrivate: false,
      status: "pending",
      hasUpdate: false,
    },
    {
      id: "offer-7",
      jobId: "j11",
      fromCompany: "ArcLight Games TH",
      sentDaysAgo: 1,
      updatedDaysAgo: 0,
      isPrivate: true,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "offer-8",
      jobId: "j13",
      fromCompany: "NaturePure TH",
      sentDaysAgo: 6,
      updatedDaysAgo: 5,
      isPrivate: true,
      status: "declined",
      hasUpdate: false,
    },
    {
      id: "offer-9",
      jobId: "j10",
      fromCompany: "StockDee Thailand",
      sentDaysAgo: 3,
      updatedDaysAgo: 1,
      isPrivate: true,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "offer-10",
      jobId: "j12",
      fromCompany: "Casa Modern TH",
      sentDaysAgo: 7,
      updatedDaysAgo: 6,
      isPrivate: false,
      status: "declined",
      hasUpdate: false,
    },
  ],
};

// ─── Entrepreneur side ────────────────────────────────────────────────────────

export type ApplicantStatus = "pending" | "accepted" | "rejected";

export type JobApplicant = {
  id: string;
  /** The job this person applied to */
  jobId: string;
  influencerId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg: string;
  appliedDaysAgo: number;
  updatedDaysAgo: number;
  /** true = the job is open (public); false = private / invite-only */
  isOpenJob: boolean;
  status: ApplicantStatus;
  /** true = new application the entrepreneur hasn't seen yet */
  hasUpdate: boolean;
};

/** Keyed by entrepreneur userId */
export const MOCK_JOB_APPLICANTS: Record<string, JobApplicant[]> = {
  "1": [
    {
      id: "appl-E1",
      jobId: "j5",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      appliedDaysAgo: 0,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-E2",
      jobId: "j7",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      appliedDaysAgo: 1,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-E3",
      jobId: "j5",
      influencerId: "inf4",
      influencerName: "Tawan Suphan",
      influencerHandle: "@tawan.fit",
      influencerAvatarBg: "bg-[#d1fae5]",
      appliedDaysAgo: 2,
      updatedDaysAgo: 2,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "appl-E4",
      jobId: "j8",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      appliedDaysAgo: 3,
      updatedDaysAgo: 3,
      isOpenJob: true,
      status: "pending",
      hasUpdate: false,
    },
    {
      id: "appl-E5",
      jobId: "j16",
      influencerId: "inf11",
      influencerName: "Dao Beauty",
      influencerHandle: "@dao.makeup",
      influencerAvatarBg: "bg-[#ffe0ec]",
      appliedDaysAgo: 0,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-E6",
      jobId: "j18",
      influencerId: "inf9",
      influencerName: "Kai Streetwear",
      influencerHandle: "@kai.fits",
      influencerAvatarBg: "bg-[#e0ecff]",
      appliedDaysAgo: 1,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-E7",
      jobId: "j10",
      influencerId: "inf15",
      influencerName: "Born Invests",
      influencerHandle: "@born.invests",
      influencerAvatarBg: "bg-[#e4e0ff]",
      appliedDaysAgo: 2,
      updatedDaysAgo: 2,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "appl-E8",
      jobId: "j12",
      influencerId: "inf18",
      influencerName: "Bua Home",
      influencerHandle: "@bua.athome",
      influencerAvatarBg: "bg-[#fef0e0]",
      appliedDaysAgo: 4,
      updatedDaysAgo: 3,
      isOpenJob: true,
      status: "rejected",
      hasUpdate: false,
    },
    {
      id: "appl-E9",
      jobId: "j9",
      influencerId: "inf16",
      influencerName: "Som Adventures",
      influencerHandle: "@som.outdoors",
      influencerAvatarBg: "bg-[#dcf0d4]",
      appliedDaysAgo: 0,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-E10",
      jobId: "j11",
      influencerId: "inf7",
      influencerName: "Beam Gamer",
      influencerHandle: "@beam.plays",
      influencerAvatarBg: "bg-[#f0e6ff]",
      appliedDaysAgo: 1,
      updatedDaysAgo: 1,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
  ],
  "2": [
    {
      id: "appl-1",
      jobId: "j2",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      appliedDaysAgo: 0,
      updatedDaysAgo: 0,
      isOpenJob: true,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-2",
      jobId: "j4",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      appliedDaysAgo: 1,
      updatedDaysAgo: 0,
      isOpenJob: true,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-3",
      jobId: "j6",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      appliedDaysAgo: 2,
      updatedDaysAgo: 2,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "appl-4",
      jobId: "j2",
      influencerId: "inf4",
      influencerName: "Tawan Suphan",
      influencerHandle: "@tawan.fit",
      influencerAvatarBg: "bg-[#d1fae5]",
      appliedDaysAgo: 3,
      updatedDaysAgo: 3,
      isOpenJob: true,
      status: "rejected",
      hasUpdate: false,
    },
    {
      id: "appl-5",
      jobId: "j13",
      influencerId: "inf10",
      influencerName: "Fern Wellness",
      influencerHandle: "@fern.calm",
      influencerAvatarBg: "bg-[#d8f0e0]",
      appliedDaysAgo: 0,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-6",
      jobId: "j17",
      influencerId: "inf2",
      influencerName: "Tom Foodie",
      influencerHandle: "@tom.eats.th",
      influencerAvatarBg: "bg-[#ffe8cc]",
      appliedDaysAgo: 2,
      updatedDaysAgo: 0,
      isOpenJob: true,
      status: "pending",
      hasUpdate: false,
    },
    {
      id: "appl-7",
      jobId: "j15",
      influencerId: "inf5",
      influencerName: "James Wallet",
      influencerHandle: "@james.wallet",
      influencerAvatarBg: "bg-[#e8e0ff]",
      appliedDaysAgo: 3,
      updatedDaysAgo: 1,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "appl-8",
      jobId: "j8",
      influencerId: "inf4",
      influencerName: "Maya Fit",
      influencerHandle: "@maya.moves",
      influencerAvatarBg: "bg-[#d0f0e8]",
      appliedDaysAgo: 1,
      updatedDaysAgo: 0,
      isOpenJob: false,
      status: "pending",
      hasUpdate: true,
    },
    {
      id: "appl-9",
      jobId: "j1",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      appliedDaysAgo: 5,
      updatedDaysAgo: 4,
      isOpenJob: false,
      status: "accepted",
      hasUpdate: false,
    },
    {
      id: "appl-10",
      jobId: "j3",
      influencerId: "inf3",
      influencerName: "Arkin Tech",
      influencerHandle: "@arkin.unbox",
      influencerAvatarBg: "bg-[#cce4ff]",
      appliedDaysAgo: 7,
      updatedDaysAgo: 6,
      isOpenJob: true,
      status: "rejected",
      hasUpdate: false,
    },
  ],
};

// ─── Badge count ──────────────────────────────────────────────────────────────

export function getDirectBadgeCount(
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string> = new Set(),
): number {
  if (role === "influencer") {
    // Only private invites are shown on the Direct screen
    return (MOCK_DIRECT_OFFERS[userId] ?? MOCK_DIRECT_OFFERS["1"] ?? [])
      .filter((o) => o.isPrivate && o.hasUpdate && !seenIds.has(o.id)).length;
  }
  // Only applicants from private jobs
  return (MOCK_JOB_APPLICANTS[userId] ?? MOCK_JOB_APPLICANTS["2"] ?? [])
    .filter((a) => !a.isOpenJob && a.hasUpdate && !seenIds.has(a.id)).length;
}

// ─── Shared utils ─────────────────────────────────────────────────────────────

export function formatSent(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
