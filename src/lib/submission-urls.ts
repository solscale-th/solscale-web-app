const HAS_PROTOCOL = /^[a-z][a-z0-9+.-]*:\/\//i;

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return HAS_PROTOCOL.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function looksLikeUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(normalizeUrl(trimmed));
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function collectUrls(inputs: string[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const raw of inputs) {
    if (!looksLikeUrl(raw)) continue;
    const normalized = normalizeUrl(raw);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    urls.push(normalized);
  }
  return urls;
}

export function formatSubmissionNote(urls: string[], note: string): string {
  const cleanUrls = collectUrls(urls);
  const cleanNote = note.trim();
  if (cleanUrls.length === 0) return cleanNote;
  if (!cleanNote) return cleanUrls.join("\n");
  return `${cleanUrls.join("\n")}\n\n${cleanNote}`;
}

export function parseSubmissionNote(value: string): { urls: string[]; note: string } {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const urls: string[] = [];
  const otherLines: string[] = [];
  for (const line of lines) {
    if (looksLikeUrl(line)) {
      const normalized = normalizeUrl(line);
      if (!urls.includes(normalized)) urls.push(normalized);
    } else {
      otherLines.push(line);
    }
  }
  return { urls, note: otherLines.join("\n").trim() };
}

export function splitPastedUrls(text: string): string[] {
  return text
    .split(/[\s,]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}
