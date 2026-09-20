export type Platform = "Instagram" | "TikTok" | "YouTube" | "Facebook" | "Podcast" | "Blog" | "Live Event";

export type Job = {
  id: string;
  title: string;
  company: string;
  companyId: string;
  companyRating: number;
  companyReviews: number;
  platform: Platform;
  description: string;
  brief: string;
  deliverables: string[];
  requirements: string[];
  aboutBrand: string;
  website: string;
  verified: boolean;
  tags: string[];
  location: string;
  duration: string;
  applied: number;
  budgetMin: number;
  budgetMax: number;
  postedDaysAgo: number;
  promoted?: boolean;
  thumbnailBg: string;
};

export const PLATFORM_COLORS: Record<Platform, { bg: string; text: string }> = {
  Instagram: { bg: "#E1306C", text: "#fff" },
  TikTok: { bg: "#010101", text: "#fff" },
  YouTube: { bg: "#FF0000", text: "#fff" },
  Facebook: { bg: "#1877F2", text: "#fff" },
  Podcast: { bg: "#8B5CF6", text: "#fff" },
  Blog: { bg: "#6B7280", text: "#fff" },
  "Live Event": { bg: "#059669", text: "#fff" },
};

export const CATEGORIES: { label: Platform; count: number; icon: string }[] = [
  { label: "Instagram", count: 143, icon: "📷" },
  { label: "TikTok", count: 96, icon: "🎵" },
  { label: "YouTube", count: 47, icon: "▶" },
  { label: "Blog", count: 44, icon: "📝" },
  { label: "Podcast", count: 9, icon: "🎙" },
  { label: "Live Event", count: 9, icon: "🎤" },
];

/**
 * Fallback catalog shaped like `mapApiJobToJob` output.
 * Companies match api-dev entrepreneurs (heew / test / Pasit).
 * Listing screens should prefer the jobs API + live flowchart, not this array.
 */
const JOB_THUMBNAILS = [
  "bg-brand-tint",
  "bg-[#ffe8cc]",
  "bg-[#cce4ff]",
  "bg-[#d0f0e8]",
  "bg-[#e8e0ff]",
  "bg-[#fff3cc]",
];

const KNOWN_PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];

function daysAgoFromIso(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function toPlatform(raw: string): Platform {
  const match = KNOWN_PLATFORMS.find(
    (platform) => platform.toLowerCase() === raw.toLowerCase()
  );
  return match ?? "Instagram";
}

type ApiShapedJob = {
  id: number;
  entrepreneurId: number;
  title: string;
  description: string;
  brief: string;
  platform: string;
  deliverables: string[];
  requirements: string[];
  tags: string[];
  location: string;
  duration: string;
  budgetMin: number;
  budgetMax: number;
  status: string;
  promoted: boolean;
  createdAt: string;
  entrepreneur: {
    id: number;
    companyName: string;
    brandDescription?: string | null;
      logoUrl?: string | null;
    };
  };

function mapApiShapedJob(job: ApiShapedJob): Job {
  return {
    id: String(job.id),
    title: job.title,
    company: job.entrepreneur.companyName,
    companyId: String(job.entrepreneur.id),
    companyRating: 0,
    companyReviews: 0,
    platform: toPlatform(job.platform),
    description: job.description,
    brief: job.brief,
    deliverables: job.deliverables,
    requirements: job.requirements,
    aboutBrand: job.entrepreneur.brandDescription ?? job.entrepreneur.companyName,
    website: "",
    verified: true,
    tags: job.tags,
    location: job.location,
    duration: job.duration,
    applied: 0,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    postedDaysAgo: daysAgoFromIso(job.createdAt),
    promoted: job.promoted,
    thumbnailBg: JOB_THUMBNAILS[job.id % JOB_THUMBNAILS.length],
  };
}

const MOCK_API_JOBS: ApiShapedJob[] = [
  {
    id: 1,
    entrepreneurId: 2,
    title: "Instagram Lifestyle Influencer for Premium Skincare Launch",
    description:
      "Looking for a beauty influencer with 50K+ followers to promote our new skincare launch line.",
    brief:
      "Seeking a lifestyle influencer with 50K+ followers to create authentic content showcasing our new premium skincare line. The campaign focuses on daily routines, before/after results, and honest product reviews. Content must feel natural and relatable — not overly promotional.",
    platform: "Instagram",
    deliverables: [
      "3 × Instagram feed posts (high-res, on-brand aesthetic)",
      "5 × Instagram Stories (product in daily routine, before/after)",
      "1 × Instagram Reel (30–60 sec, showing application & results)",
    ],
    requirements: [
      "50,000+ Instagram followers",
      "Engagement rate above 3%",
      "Must be based in Thailand or have a Thai-speaking audience",
    ],
    tags: ["Beauty", "Skincare", "Lifestyle"],
    location: "Bangkok, TH",
    duration: "2 Weeks",
    budgetMin: 35000,
    budgetMax: 50000,
    status: "open",
    promoted: true,
    createdAt: "2026-09-12T00:00:00.000Z",
    entrepreneur: {
      id: 2,
      companyName: "heew",
      brandDescription: null,
      logoUrl: null,
    },
  },
  {
    id: 2,
    entrepreneurId: 1,
    title: "TikTok Food Creator for Restaurant Chain Campaign",
    description:
      "We need a good TikTok creator to produce a series of videos that make people crave our food.",
    brief:
      "Create a series of short-form TikTok videos that highlight our signature dishes, behind-the-scenes kitchen moments, and customer reactions. The tone should be fun, energetic, and mouth-watering.",
    platform: "TikTok",
    deliverables: [
      "4 × TikTok videos (15–60 seconds each)",
      "2 × TikTok Stories or photo carousels",
      "Use campaign hashtag in all posts",
    ],
    requirements: [
      "20,000+ TikTok followers",
      "Strong food or lifestyle content history",
      "Based in Thailand",
    ],
    tags: ["Food", "Viral", "Entertainment"],
    location: "Nationwide",
    duration: "1 Month",
    budgetMin: 20000,
    budgetMax: 50000,
    status: "open",
    promoted: false,
    createdAt: "2026-09-10T00:00:00.000Z",
    entrepreneur: {
      id: 1,
      companyName: "test",
      brandDescription: null,
      logoUrl: null,
    },
  },
  {
    id: 3,
    entrepreneurId: 3,
    title: "YouTube Tech Reviewer — Smartphone Accessories",
    description:
      "Looking for a tech YouTuber with genuine passion for gadgets to produce a detailed review.",
    brief:
      "Produce an in-depth YouTube review of our latest smartphone accessory lineup, covering unboxing, real-world usage, and an honest pros/cons summary for your audience.",
    platform: "YouTube",
    deliverables: [
      "1 × YouTube review video (8–12 minutes)",
      "1 × YouTube Shorts teaser",
      "Include affiliate link in description",
    ],
    requirements: [
      "10,000+ YouTube subscribers",
      "Tech or gadget review niche",
      "English or Thai language content",
    ],
    tags: ["Tech", "Review", "Gadgets"],
    location: "Bangkok, TH",
    duration: "3 Weeks",
    budgetMin: 25000,
    budgetMax: 40000,
    status: "open",
    promoted: false,
    createdAt: "2026-09-08T00:00:00.000Z",
    entrepreneur: {
      id: 3,
      companyName: "Pasit",
      brandDescription: null,
      logoUrl: "",
    },
  },
];

export const MOCK_JOBS: Job[] = MOCK_API_JOBS.map(mapApiShapedJob);

export function getJobById(id: string): Job | undefined {
  return MOCK_JOBS.find((job) => job.id === id);
}

export function getRelatedJobs(job: Job, limit = 1): Job[] {
  return MOCK_JOBS.filter((j) => j.id !== job.id && j.platform === job.platform).slice(0, limit);
}

export function formatBudget(n: number): string {
  if (n >= 1000) return `฿${(n / 1000).toFixed(0)}K`;
  return `฿${n.toLocaleString()}`;
}

export function formatBudgetRange(min: number, max: number): string {
  return `฿${min.toLocaleString()} – ฿${max.toLocaleString()}`;
}

export function formatPosted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
