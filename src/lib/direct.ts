export type DirectOfferStatus = "pending" | "accepted" | "declined";

export function formatSent(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}
