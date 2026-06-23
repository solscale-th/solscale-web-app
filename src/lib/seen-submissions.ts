const STORAGE_KEY = "solscale_seen_submissions";

export const SEEN_SUBMISSION_EVENT = "solscale-seen-submission";

export function getSeenSubmissionIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markSubmissionSeen(id: string): void {
  if (typeof window === "undefined") return;
  const seen = getSeenSubmissionIds();
  if (seen.has(id)) return;
  seen.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  window.dispatchEvent(new Event(SEEN_SUBMISSION_EVENT));
}
