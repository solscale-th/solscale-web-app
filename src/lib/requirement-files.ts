const liveFiles = new Map<string, string>();

const FILE_RULES = [
  { key: "storyboard", test: /^storyboard\b/i },
  { key: "voiceOver", test: /^voice\s*over\b/i },
  { key: "super", test: /^super\b/i },
  { key: "other", test: /^(other(?:\s+detail)?|อื่นๆ)\b/i },
] as const;

export type RequirementFileKey = (typeof FILE_RULES)[number]["key"];

export type RequirementFile = {
  key: RequirementFileKey;
  filename: string;
  note: string;
};

export function parseRequirementFiles(requirements: string[]): RequirementFile[] {
  const files: RequirementFile[] = [];
  for (const line of requirements) {
    const trimmed = line.trim();
    const rule = FILE_RULES.find((item) => item.test.test(trimmed));
    if (!rule || files.some((item) => item.key === rule.key)) continue;
    const colon = trimmed.indexOf(":");
    if (colon < 0) continue;
    const rest = trimmed.slice(colon + 1).trim();
    const [filename, ...noteParts] = rest.split(" — ");
    const name = filename.trim();
    if (!name) continue;
    files.push({ key: rule.key, filename: name, note: noteParts.join(" — ").trim() });
  }
  return files;
}

export function isRequirementFileLine(line: string): boolean {
  return FILE_RULES.some((item) => item.test.test(line.trim()));
}

/** Keeps a local preview so a file uploaded in this session can be opened. */
export function rememberRequirementFile(file: File): void {
  const existing = liveFiles.get(file.name);
  if (existing) URL.revokeObjectURL(existing);
  liveFiles.set(file.name, URL.createObjectURL(file));
}

export function forgetRequirementFile(name: string): void {
  const existing = liveFiles.get(name);
  if (!existing) return;
  URL.revokeObjectURL(existing);
  liveFiles.delete(name);
}

export function isRequirementImage(name: string): boolean {
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/i.test(name);
}

export function requirementPreviewUrl(name: string): string | null {
  return liveFiles.get(name) ?? null;
}
