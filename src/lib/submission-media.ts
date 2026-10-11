const MOCK_PREVIEW = "/samples/delivery-preview.mp4";

const MOCK_VIDEOS = new Set([
  "sunscreen-reel.mp4",
  "matcha-whisk.mp4",
  "sprint-reel.mp4",
  "speaker-desk.mp4",
  "serum-reel.mp4",
  "coffee-pour.mp4",
  "hat-street.mp4",
  "candle-desk.mp4",
]);

const liveFiles = new Map<string, { file: File; url: string }>();

export function isVideoName(name: string): boolean {
  return /\.(mp4|mov|webm|m4v)$/i.test(name);
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/") || isVideoName(file.name);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(file.name);
}

/** Keeps a local preview URL so the brand can play a file from this session. */
export function rememberSubmissionFile(file: File): string {
  const existing = liveFiles.get(file.name);
  if (existing?.file === file) return existing.url;
  if (existing) URL.revokeObjectURL(existing.url);
  const url = URL.createObjectURL(file);
  liveFiles.set(file.name, { file, url });
  return url;
}

export function forgetSubmissionFile(file: File): void {
  const existing = liveFiles.get(file.name);
  if (!existing || existing.file !== file) return;
  URL.revokeObjectURL(existing.url);
  liveFiles.delete(file.name);
}

export function submissionPreviewUrl(name: string): string | null {
  const live = liveFiles.get(name);
  if (live) return live.url;
  if (MOCK_VIDEOS.has(name)) return MOCK_PREVIEW;
  return null;
}
