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
  return liveFiles.get(name)?.url ?? null;
}
