export type Platform =
  | "Instagram"
  | "TikTok"
  | "YouTube"
  | "Facebook"
  | "Podcast"
  | "Blog"
  | "Live Event";

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

export function formatBudget(n: number): string {
  if (n >= 1000) return `฿${(n / 1000).toFixed(0)}K`;
  return `฿${n.toLocaleString()}`;
}

export function formatBudgetRange(min: number, max: number): string {
  return `฿${min.toLocaleString()} – ฿${max.toLocaleString()}`;
}

/** A fixed private offer shows one price. Open jobs keep the range. */
export function formatOfferPrice(min: number, max: number): string {
  if (min === max) return `฿${min.toLocaleString()}`;
  return formatBudgetRange(min, max);
}

/** Posting day from the hire brief. Falls back to the job duration. */
export function postingDateLabel(job: {
  duration: string;
  requirements: string[];
  postingDate?: string | null;
}): string {
  if (job.postingDate) return job.postingDate;
  const line = job.requirements.find((req) => /^posting date:/i.test(req));
  if (line) return line.replace(/^[^:]+:\s*/, "");
  return job.duration.replace(/^post on\s+/i, "");
}

export function formatPosted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
