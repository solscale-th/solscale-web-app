const STORAGE_KEY = "solscale_seen_my_jobs";

export const SEEN_MY_JOBS_EVENT = "solscale-seen-my-jobs";

export function getSeenMyJobIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markMyJobSeen(id: string): void {
  if (typeof window === "undefined") return;
  const seen = getSeenMyJobIds();
  if (seen.has(id)) return;
  seen.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  window.dispatchEvent(new Event(SEEN_MY_JOBS_EVENT));
}
