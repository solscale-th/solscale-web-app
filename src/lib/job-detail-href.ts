import type { FlowEngagement } from "@/lib/flowchart/types";

/** Hash targets on the job detail page. */
export type JobDetailSection = "submit-work" | "ask" | "workspace";

const SECTION_HASH: Record<JobDetailSection, string> = {
  "submit-work": "job-submit-work",
  ask: "job-ask",
  workspace: "job-workspace",
};

export function jobDetailHref(
  jobId: string,
  engagementId?: string,
  section?: JobDetailSection
) {
  const base = `/jobs/${jobId}`;
  const query = engagementId
    ? `?engagement=${encodeURIComponent(engagementId)}`
    : "";
  const hash = section ? `#${SECTION_HASH[section]}` : "";
  return `${base}${query}${hash}`;
}

export function resolveJobDetailHref(
  jobId: string,
  liveEngagements: FlowEngagement[],
  options: {
    userId: string;
    role: "influencer" | "entrepreneur";
    influencerId?: string;
    section?: JobDetailSection;
  }
): string {
  const live = liveEngagements.find((eng) => {
    if (eng.jobId !== jobId) return false;
    if (options.role === "influencer") {
      return eng.influencerId === options.userId;
    }
    if (options.influencerId) {
      return (
        eng.entrepreneurId === options.userId &&
        eng.influencerId === options.influencerId
      );
    }
    return eng.entrepreneurId === options.userId;
  });
  if (live) {
    return jobDetailHref(jobId, live.id, options.section ?? "submit-work");
  }

  return jobDetailHref(jobId, undefined, options.section);
}

export function jobDetailHrefFromEngagement(
  engagementId: string,
  liveEngagements: FlowEngagement[],
  section: JobDetailSection = "workspace"
): string | null {
  const live = liveEngagements.find((item) => item.id === engagementId);
  if (live) return jobDetailHref(live.jobId, live.id, section);

  return null;
}
