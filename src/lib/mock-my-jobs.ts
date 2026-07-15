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
    {
      id: "eng-6",
      jobId: "j13",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 2,
      workStatus: "submitted",
      submissionNote:
        "Completed the 2-hour Facebook Live session. Total viewers peaked at 3,200. Recording link shared via DM. Post-event Stories are live.",
      reviewNote: "",
      messages: [
        { id: "m13", from: "entrepreneur", text: "Looking forward to the live session tomorrow. Let me know if you need anything.", sentDaysAgo: 3 },
        { id: "m14", from: "influencer",   text: "All set! I will go live at 7 PM as agreed.", sentDaysAgo: 2 },
        { id: "m15", from: "influencer",   text: "The session went great! Submission details sent.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-7",
      jobId: "j16",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 4,
      workStatus: "approved",
      submissionNote:
        "All 3 TikTok videos are live with the campaign hashtag and brand tag. Total combined views after 48h: 180K.",
      reviewNote:
        "Fantastic results! All three videos exceeded our benchmarks. Payment scheduled for this Friday.",
      messages: [
        { id: "m16", from: "entrepreneur", text: "Hey! Excited to have you on board for the lip collection launch.", sentDaysAgo: 5 },
        { id: "m17", from: "influencer",   text: "Love the products! I will do the swatch video first.", sentDaysAgo: 4 },
        { id: "m18", from: "entrepreneur", text: "Amazing — all content approved!", sentDaysAgo: 1 },
      ],
      hasUpdate: false,
    },
    {
      id: "eng-8",
      jobId: "j18",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 0,
      workStatus: "not_submitted",
      submissionNote: "",
      reviewNote: "",
      messages: [
        { id: "m19", from: "entrepreneur", text: "Welcome to the PeakForm SS26 campaign! Products will be shipped to you by tomorrow.", sentDaysAgo: 0 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-9",
      jobId: "j9",
      influencerId: "inf1",
      influencerName: "Nina Somchai",
      influencerHandle: "@nina.glows",
      influencerAvatarBg: "bg-[#fce8ee]",
      acceptedDaysAgo: 8,
      workStatus: "approved",
      submissionNote:
        "3 feed posts, 6 Stories, and 1 Reel published during the stay. Reach across all posts exceeded 95K. Links sent via DM.",
      reviewNote:
        "Outstanding work! The Reel especially performed beyond expectations. Full payment released today.",
      messages: [
        { id: "m20", from: "entrepreneur", text: "We are so excited to host you at the resort next week!", sentDaysAgo: 9 },
        { id: "m21", from: "influencer",   text: "I cannot wait — the property looks stunning.", sentDaysAgo: 9 },
        { id: "m22", from: "entrepreneur", text: "Everything approved. Wonderful content, thank you!", sentDaysAgo: 2 },
      ],
      hasUpdate: false,
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
    {
      id: "eng-E4",
      jobId: "j16",
      influencerId: "inf11",
      influencerName: "Dao Beauty",
      influencerHandle: "@dao.makeup",
      influencerAvatarBg: "bg-[#ffe0ec]",
      acceptedDaysAgo: 3,
      workStatus: "revision_requested",
      submissionNote:
        "All 3 TikTok videos published. Links: tiktok.com/@dao.makeup/video/a, /b, /c. Used #ColorBoomLips in all captions.",
      reviewNote:
        "Great swatches! Please re-shoot the wear-test video — the lighting is too dark. Resubmit by end of week.",
      messages: [
        { id: "mE8",  from: "entrepreneur", text: "Hi Dao! Products shipped today, should arrive in 2 days.", sentDaysAgo: 5 },
        { id: "mE9",  from: "influencer",   text: "Received! Obsessed with the shades — filming this weekend.", sentDaysAgo: 4 },
        { id: "mE10", from: "entrepreneur", text: "Reviewed — small revision needed on the wear-test video.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-E5",
      jobId: "j18",
      influencerId: "inf9",
      influencerName: "Kai Streetwear",
      influencerHandle: "@kai.fits",
      influencerAvatarBg: "bg-[#e0ecff]",
      acceptedDaysAgo: 1,
      workStatus: "not_submitted",
      submissionNote: "",
      reviewNote: "",
      messages: [
        { id: "mE11", from: "entrepreneur", text: "Welcome to the PeakForm SS26 campaign, Kai! Activewear set will be delivered tomorrow.", sentDaysAgo: 1 },
        { id: "mE12", from: "influencer",   text: "Can't wait! I have a gym session planned for the shoot.", sentDaysAgo: 0 },
      ],
      hasUpdate: false,
    },
    {
      id: "eng-E6",
      jobId: "j10",
      influencerId: "inf15",
      influencerName: "Born Invests",
      influencerHandle: "@born.invests",
      influencerAvatarBg: "bg-[#e4e0ff]",
      acceptedDaysAgo: 5,
      workStatus: "submitted",
      submissionNote:
        "YouTube video published: youtube.com/watch?v=stockdee-review. Covered account setup, key features, fees, and referral link included in description. Shorts also live.",
      reviewNote: "",
      messages: [
        { id: "mE13", from: "entrepreneur", text: "Script outline looks great. You are clear to film!", sentDaysAgo: 6 },
        { id: "mE14", from: "influencer",   text: "Video is live — performing well already, 12K views in 24h.", sentDaysAgo: 2 },
      ],
      hasUpdate: true,
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
    {
      id: "eng-10",
      jobId: "j13",
      influencerId: "inf10",
      influencerName: "Fern Wellness",
      influencerHandle: "@fern.calm",
      influencerAvatarBg: "bg-[#d8f0e0]",
      acceptedDaysAgo: 2,
      workStatus: "submitted",
      submissionNote:
        "Facebook Live completed. Peaked at 2,800 live viewers and sold 148 units during the session. Recording and post-event Stories links sent via DM.",
      reviewNote: "",
      messages: [
        { id: "m23", from: "entrepreneur", text: "Fern, the brief and product info deck is in the shared folder.", sentDaysAgo: 3 },
        { id: "m24", from: "influencer",   text: "Reviewed everything — ready for the live session!", sentDaysAgo: 2 },
        { id: "m25", from: "influencer",   text: "Live done! Really great response from the audience.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-11",
      jobId: "j17",
      influencerId: "inf2",
      influencerName: "Tom Foodie",
      influencerHandle: "@tom.eats.th",
      influencerAvatarBg: "bg-[#ffe8cc]",
      acceptedDaysAgo: 3,
      workStatus: "revision_requested",
      submissionNote:
        "YouTube video and Shorts submitted. Video link: youtube.com/watch?v=krua-tour. Covered market visit, cooking, and final dish.",
      reviewNote:
        "Great content! However the booking link in the description is incorrect. Please update it to the correct URL and re-submit.",
      messages: [
        { id: "m26", from: "entrepreneur", text: "Tom! We are so excited for your class visit next week.", sentDaysAgo: 4 },
        { id: "m27", from: "influencer",   text: "Looking forward to it! Love Thai cooking.", sentDaysAgo: 4 },
        { id: "m28", from: "entrepreneur", text: "Small fix needed on the description link — see revision note.", sentDaysAgo: 1 },
      ],
      hasUpdate: true,
    },
    {
      id: "eng-12",
      jobId: "j15",
      influencerId: "inf5",
      influencerName: "James Wallet",
      influencerHandle: "@james.wallet",
      influencerAvatarBg: "bg-[#e8e0ff]",
      acceptedDaysAgo: 7,
      workStatus: "approved",
      submissionNote:
        "Episode recorded and published on Spotify and Apple Podcasts. Shared on LinkedIn and Instagram. Episode link in DM.",
      reviewNote:
        "Brilliant episode! Listener feedback has been overwhelmingly positive. Payment released today.",
      messages: [
        { id: "m29", from: "entrepreneur", text: "James, your episode was one of our best performers this quarter!", sentDaysAgo: 2 },
        { id: "m30", from: "influencer",   text: "Really enjoyed the conversation. Thanks for having me!", sentDaysAgo: 2 },
      ],
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
      ? (MOCK_MY_JOBS_INFLUENCER[userId] ?? MOCK_MY_JOBS_INFLUENCER["1"] ?? [])
      : (MOCK_MY_JOBS_ENTREPRENEUR[userId] ?? MOCK_MY_JOBS_ENTREPRENEUR["2"] ?? []);
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
