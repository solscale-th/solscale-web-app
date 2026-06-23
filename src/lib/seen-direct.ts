const STORAGE_KEY = "solscale_seen_direct";

export const SEEN_DIRECT_EVENT = "solscale-seen-direct";

export function getSeenDirectIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markDirectSeen(id: string): void {
  if (typeof window === "undefined") return;
  const seen = getSeenDirectIds();
  if (seen.has(id)) return;
  seen.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
  window.dispatchEvent(new Event(SEEN_DIRECT_EVENT));
}
