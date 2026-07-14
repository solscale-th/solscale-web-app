/**
 * Mock data for the "My Job" tab.
 *
 * An "engagement" is created when an entrepreneur accepts an influencer's application.
 *
 * Influencer view – jobs they are currently working on.
 * Entrepreneur view – engagements on their posted jobs.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkStatus =
  | "not_submitted"
  | "submitted"
  | "revision_requested"
  | "approved";

export type ChatMessage = {
  id: string;
  from: "influencer" | "entrepreneur";
  text: string;
  sentDaysAgo: number;
};

export type JobEngagement = {
  id: string;
  /** References a job in MOCK_JOBS */
  jobId: string;
  influencerId: string;
  influencerName: string;
  influencerHandle: string;
  influencerAvatarBg: string;
  acceptedDaysAgo: number;
  workStatus: WorkStatus;
  /** What the influencer submitted as their deliverable description */
  submissionNote: string;
  /** What the entrepreneur said about the submission */
  reviewNote: string;
  messages: ChatMessage[];
  /** true = there is an update the viewer hasn't seen yet */
  hasUpdate: boolean;
};

// ─── Mock data ────────────────────────────────────────────────────────────────

/** Keyed by influencer userId */
export const MOCK_MY_JOBS_INFLUENCER: Record<string, JobEngagement[]> = {
  "1": [
    {
      id: "eng-1",
      jobId: "j3",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 3,
      workStatus: "revision_requested",
      submissionNote:
        "I published the YouTube review video. Here is the link: youtube.com/watch?v=abc123. The video covers unboxing, real-world usage, and pros/cons.",
      reviewNote:
        "Great effort! Please re-record the intro — it is a bit blurry. Also add the affiliate link in the description before re-submitting.",
      messages: [
        { id: "m1", from: "entrepreneur", text: "Hi! Just a heads-up — the campaign deadline is in 5 days.", sentDaysAgo: 4 },
        { id: "m2", from: "influencer",   text: "Got it, I will have it ready well before then.", sentDaysAgo: 4 },
        { id: "m3", from: "entrepreneur", text: "We reviewed your submission. Please see the revision notes.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-2",
      jobId: "j1",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 6,
      workStatus: "approved",
      submissionNote:
        "All 3 feed posts, 5 stories, and 1 Reel have been published. Links in DM.",
      reviewNote:
        "Excellent work! Everything is approved. Payment will be processed within 3 business days.",
      messages: [
        { id: "m4", from: "influencer",   text: "Submitted everything! Please review when you get a chance.", sentDaysAgo: 2 },
        { id: "m5", from: "entrepreneur", text: "Reviewed and approved! Great content.", sentDaysAgo: 1 },
      ],
      hasUpdate: false,
    },
    {
      id: "eng-3",
      jobId: "j8",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 1,
      workStatus: "not_submitted",
      submissionNote: "",
      reviewNote: "",
      messages: [
        { id: "m6", from: "entrepreneur", text: "Welcome! Feel free to reach out if you have any questions about the brief.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
  ],
};

/** Keyed by entrepreneur userId */
export const MOCK_MY_JOBS_ENTREPRENEUR: Record<string, JobEngagement[]> = {
  "1": [
    {
      id: "eng-E1",
      jobId: "j5",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      acceptedDaysAgo: 2,
      workStatus: "submitted",
      submissionNote:
        "Recorded and published the podcast episode. Episode link: soundcloud.com/kritstyle/ep-wealthwise. Covered all talking points from the brief and added the sponsor mention at the 12-minute mark.",
      reviewNote: "",
      messages: [
        { id: "mE1", from: "influencer",   text: "Just wanted to confirm — the sponsor mention should be at the start or mid-episode?", sentDaysAgo: 3 },
        { id: "mE2", from: "entrepreneur", text: "Mid-episode is fine, around the 10–15 minute mark.", sentDaysAgo: 3 },
        { id: "mE3", from: "influencer",   text: "Done! I placed it at exactly 12 minutes. Submission sent.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-E2",
      jobId: "j7",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      acceptedDaysAgo: 1,
      workStatus: "not_submitted",
      submissionNote: "",
      reviewNote: "",
      messages: [
        { id: "mE4", from: "entrepreneur", text: "Hi Fern! Welcome aboard. Please check the brief doc I sent over. Let me know if you have questions.", sentDaysAgo: 1 },
        { id: "mE5", from: "influencer",   text: "Got it! Will start drafting the article this week.", sentDaysAgo: 0 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-E3",
      jobId: "j2",
      influencerId: "inf4",
      influencerName: "Tawan Suphan",
      influencerHandle: "@tawan.fit",
      influencerAvatarBg: "bg-[#d1fae5]",
      acceptedDaysAgo: 6,
      workStatus: "approved",
      submissionNote:
        "All 3 TikTok videos with the campaign hashtag are live. Total views so far: ~42k. Links in DM.",
      reviewNote: "Great work Tawan! All content is approved. Payment will be processed within 3 business days.",
      messages: [
        { id: "mE6", from: "influencer",   text: "All videos are live! Performing really well so far.", sentDaysAgo: 3 },
        { id: "mE7", from: "entrepreneur", text: "Fantastic results! Everything is approved.", sentDaysAgo: 2 },
      ],
      hasUpdate: false,
    },
  ],
  "2": [
    {
      id: "eng-4",
      jobId: "j2",
      influencerId: "inf2",
      influencerName: "Krit Wattana",
      influencerHandle: "@kritstyle",
      influencerAvatarBg: "bg-[#e0f0ff]",
      acceptedDaysAgo: 4,
      workStatus: "submitted",
      submissionNote:
        "I have uploaded all 4 TikTok videos and 2 photo carousels. The campaign hashtag is in every caption. Links: tiktok.com/@kritstyle/video/1, /2, /3, /4",
      reviewNote: "",
      messages: [
        { id: "m7", from: "influencer",   text: "Hey! Quick question — can I also post a duet video or should I stick to original content only?", sentDaysAgo: 3 },
        { id: "m8", from: "entrepreneur", text: "Original content only please, as per the brief.", sentDaysAgo: 3 },
        { id: "m9", from: "influencer",   text: "Understood! Submitted everything now.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-5",
      jobId: "j4",
      influencerId: "inf3",
      influencerName: "Fern Phakamas",
      influencerHandle: "@fernfoodie",
      influencerAvatarBg: "bg-[#fef3c7]",
      acceptedDaysAgo: 2,
      workStatus: "not_submitted",
      submissionNote: "",
      reviewNote: "",
      messages: [],
      hasUpdate: false,
    },
  ],
};

// ─── Badge count ──────────────────────────────────────────────────────────────

export function getMyJobsBadgeCount(
  userId: string,
  role: "influencer" | "entrepreneur",
  seenIds: Set<string> = new Set(),
): number {
  const list =
    role === "influencer"
      ? (MOCK_MY_JOBS_INFLUENCER[userId] ?? [])
      : (MOCK_MY_JOBS_ENTREPRENEUR[userId] ?? []);
  return list.filter((e) => e.hasUpdate && !seenIds.has(e.id)).length;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getEngagementById(id: string): JobEngagement | undefined {
  const all = [
    ...Object.values(MOCK_MY_JOBS_INFLUENCER).flat(),
    ...Object.values(MOCK_MY_JOBS_ENTREPRENEUR).flat(),
  ];
  return all.find((e) => e.id === id);
}

export const WORK_STATUS_LABELS: Record<WorkStatus, { en: string; className: string }> = {
  not_submitted:      { en: "Not Submitted",      className: "bg-gray-100 text-gray-500"   },
  submitted:          { en: "Submitted",           className: "bg-blue-100 text-blue-600"   },
  revision_requested: { en: "Revision Requested",  className: "bg-amber-100 text-amber-700" },
  approved:           { en: "Approved",            className: "bg-green-100 text-green-700" },
};
