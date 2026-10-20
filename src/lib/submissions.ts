export type Submission = {
  id: string;
  jobId: string;
  submittedDaysAgo: number;
  updatedDaysAgo: number;
  /** true = entrepreneur reviewed/responded since last view */
  hasUpdate: boolean;
};

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

export function formatSubmitted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
