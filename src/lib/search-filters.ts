import { PLATFORM_COLORS, type Platform } from "./mock-jobs";

export const FILTER_PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];

export const FILTER_COUNTRIES = [
  { id: "TH", match: [", TH", "thailand", "nationwide"] },
  { id: "SG", match: [", SG", "singapore"] },
  { id: "MY", match: [", MY", "malaysia"] },
  { id: "ID", match: [", ID", "indonesia"] },
  { id: "VN", match: [", VN", "vietnam"] },
  { id: "PH", match: [", PH", "philippines"] },
  { id: "Remote", match: ["remote"] },
] as const;

export type FilterCountryId = (typeof FILTER_COUNTRIES)[number]["id"];

export const FOLLOWER_RANGES = [
  { id: "under10k", min: 0, max: 10_000 },
  { id: "10k50k", min: 10_000, max: 50_000 },
  { id: "50k100k", min: 50_000, max: 100_000 },
  { id: "100k500k", min: 100_000, max: 500_000 },
  { id: "500kPlus", min: 500_000, max: Number.POSITIVE_INFINITY },
] as const;

export type FollowerRangeId = (typeof FOLLOWER_RANGES)[number]["id"];

export const PRICE_RANGES = [
  { id: "under10k", min: 0, max: 10_000 },
  { id: "10k20k", min: 10_000, max: 20_000 },
  { id: "20k50k", min: 20_000, max: 50_000 },
  { id: "50kPlus", min: 50_000, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceRangeId = (typeof PRICE_RANGES)[number]["id"];

export function matchesCountry(
  location: string | null | undefined,
  countryId: FilterCountryId | null
): boolean {
  if (!countryId) return true;
  if (!location) return false;
  const normalized = location.toLowerCase();
  const country = FILTER_COUNTRIES.find((c) => c.id === countryId);
  if (!country) return true;
  return country.match.some((token) => normalized.includes(token.toLowerCase()));
}

export function matchesFollowerRange(
  followers: number | null | undefined,
  rangeId: FollowerRangeId | null
): boolean {
  if (!rangeId) return true;
  if (followers == null) return true;
  const range = FOLLOWER_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;
  return followers >= range.min && followers < range.max;
}

/** True when a budget range overlaps the selected price band. */
export function matchesPriceRange(
  budgetMin: number | null | undefined,
  budgetMax: number | null | undefined,
  rangeId: PriceRangeId | null
): boolean {
  if (!rangeId) return true;
  const range = PRICE_RANGES.find((r) => r.id === rangeId);
  if (!range) return true;
  const min = budgetMin ?? budgetMax ?? 0;
  const max = budgetMax ?? budgetMin ?? 0;
  return min < range.max && max >= range.min;
}

export function matchesPlatform(
  platform: string | null | undefined,
  platforms: string[] | null | undefined,
  selected: Platform | null
): boolean {
  if (!selected) return true;
  if (platform === selected) return true;
  if (platforms?.includes(selected)) return true;
  return false;
}
