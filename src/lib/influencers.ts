import { graphqlRequest } from "./api";
import {
  INFLUENCER_CATEGORY_KEYS,
  type InfluencerCategoryKey,
} from "./mock-influencers";
import { PLATFORM_COLORS, type Platform } from "./mock-jobs";

export type ApiInfluencer = {
  id: number;
  email?: string | null;
  firstName: string;
  lastName: string;
  stageName?: string | null;
  age?: number | null;
  avatarUrl?: string | null;
  platforms?: string[] | null;
  contentCategories?: string[] | null;
  languages?: string[] | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  otherPhotos?: string[] | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  createdAt?: string | null;
};

export const PACKAGE_TIERS = ["starter", "standard", "campaign"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const ADDON_KINDS = ["revision", "rush", "usage", "crosspost"] as const;
export type AddonKind = (typeof ADDON_KINDS)[number];

/** A hireable package this influencer offers. */
export type InfluencerPackage = {
  id: string;
  tier: PackageTier;
  platform?: string | null;
  price: number;
  includes: string[];
  revisions: number;
  turnaroundDays: number;
};

/** An optional extra that can be added to a package. */
export type InfluencerAddon = {
  id: string;
  kind: AddonKind;
  price: number;
};

/** An example of completed work. */
export type InfluencerPortfolioItem = {
  id: string;
  title: string;
  platform?: string | null;
  imageUrl?: string | null;
};

/** A written review left by someone who hired this influencer. */
export type InfluencerReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
};

/** Public profile fields used by the influencer detail screen (no bank data). */
export type InfluencerProfile = {
  id: string;
  name: string;
  handle: string;
  email?: string | null;
  age?: number | null;
  avatarUrl?: string | null;
  platforms: string[];
  contentCategories: string[];
  languages: string[];
  otherPhotos: string[];
  averageRating: number;
  reviewCount: number;
  createdAt?: string | null;
  /** Optional bio when available from mock data */
  about?: string | null;
  /** Mock-only fallback when avatarUrl is absent */
  avatarFallbackClass?: string;
  packages: InfluencerPackage[];
  addons: InfluencerAddon[];
  portfolio: InfluencerPortfolioItem[];
  reviews: InfluencerReview[];
};

export type InfluencerListItem = {
  id: string;
  name: string;
  handle: string;
  platform?: Platform;
  platforms: Platform[];
  categories: InfluencerCategoryKey[];
  languages: string[];
  rating: number;
  reviews: number;
  avatarUrl?: string;
  avatarBg: string;
};

const AVATAR_BACKGROUNDS = [
  "bg-brand-tint",
  "bg-[#ffe8cc]",
  "bg-[#cce4ff]",
  "bg-[#d0f0e8]",
  "bg-[#e8e0ff]",
  "bg-[#d4e8d0]",
  "bg-[#f0e6ff]",
  "bg-[#fff3cc]",
];

const KNOWN_CATEGORIES = new Set<string>(INFLUENCER_CATEGORY_KEYS);
const KNOWN_PLATFORMS = new Set<string>(Object.keys(PLATFORM_COLORS));

function toHandle(influencer: ApiInfluencer): string {
  const base =
    influencer.stageName?.trim() ||
    `${influencer.firstName} ${influencer.lastName}`;
  return `@${base.toLowerCase().replace(/\s+/g, ".")}`;
}

function toCategories(raw?: string[] | null): InfluencerCategoryKey[] {
  if (!raw) return [];
  return raw
    .map((c) => c.toLowerCase())
    .filter((c): c is InfluencerCategoryKey => KNOWN_CATEGORIES.has(c));
}

function toPlatform(raw?: string[] | null): Platform | undefined {
  const first = raw?.find((p) => KNOWN_PLATFORMS.has(p));
  return first as Platform | undefined;
}

function toPlatforms(raw?: string[] | null): Platform[] {
  if (!raw) return [];
  return raw.filter((p): p is Platform => KNOWN_PLATFORMS.has(p));
}

export function mapInfluencer(influencer: ApiInfluencer): InfluencerListItem {
  const name =
    influencer.stageName?.trim() ||
    `${influencer.firstName} ${influencer.lastName}`.trim();
  const platforms = toPlatforms(influencer.platforms);

  return {
    id: String(influencer.id),
    name,
    handle: toHandle(influencer),
    platform: platforms[0] ?? toPlatform(influencer.platforms),
    platforms,
    categories: toCategories(influencer.contentCategories),
    languages: influencer.languages ?? [],
    rating: Number(influencer.averageRating ?? 0),
    reviews: influencer.reviewCount ?? 0,
    avatarUrl: influencer.avatarUrl ?? undefined,
    avatarBg: AVATAR_BACKGROUNDS[influencer.id % AVATAR_BACKGROUNDS.length],
  };
}

export function toInfluencerProfile(influencer: ApiInfluencer): InfluencerProfile {
  const name =
    influencer.stageName?.trim() ||
    `${influencer.firstName} ${influencer.lastName}`.trim();

  return {
    id: String(influencer.id),
    name,
    handle: toHandle(influencer),
    email: influencer.email,
    age: influencer.age,
    avatarUrl: influencer.avatarUrl,
    platforms: influencer.platforms ?? [],
    contentCategories: influencer.contentCategories ?? [],
    languages: influencer.languages ?? [],
    otherPhotos: influencer.otherPhotos ?? [],
    averageRating: Number(influencer.averageRating ?? 0),
    reviewCount: influencer.reviewCount ?? 0,
    createdAt: influencer.createdAt,
    avatarFallbackClass:
      AVATAR_BACKGROUNDS[influencer.id % AVATAR_BACKGROUNDS.length],
    packages: [],
    addons: [],
    portfolio: [],
    reviews: [],
  };
}

function roundBaht(amount: number): number {
  return Math.max(500, Math.round(amount / 100) * 100);
}

export function basePriceFromFollowers(followers: number): number {
  return Math.max(3500, Math.round(followers / 25));
}

function basePriceFromId(id: string): number {
  const numeric = Number(id);
  const seed = Number.isFinite(numeric)
    ? numeric
    : id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return 4500 + (Math.abs(seed) % 8) * 1200;
}

/** Priced packages and add-ons used until the marketplace API returns them. */
export function withMockHireOffer(
  profile: InfluencerProfile,
  options?: { includes?: string[]; basePrice?: number }
): InfluencerProfile {
  if (profile.packages.length > 0 && profile.addons.length > 0) return profile;

  const includes = (
    options?.includes?.filter((item) => item.trim()) ??
    (profile.contentCategories.length > 0
      ? profile.contentCategories
      : profile.platforms)
  ).slice(0, 4);
  const work = includes.length > 0 ? includes : ["Content"];
  const base = roundBaht(options?.basePrice ?? basePriceFromId(profile.id));
  const platform = profile.platforms[0] ?? null;

  const tiers: {
    tier: PackageTier;
    count: number;
    revisions: number;
    days: number;
    multiplier: number;
  }[] = [
    { tier: "starter", count: 1, revisions: 1, days: 7, multiplier: 1 },
    { tier: "standard", count: Math.min(2, work.length), revisions: 2, days: 10, multiplier: 1.8 },
    { tier: "campaign", count: work.length, revisions: 3, days: 14, multiplier: 2.8 },
  ];

  return {
    ...profile,
    packages: tiers.map((tier) => ({
      id: `${profile.id}-pkg-${tier.tier}`,
      tier: tier.tier,
      platform,
      price: roundBaht(base * tier.multiplier),
      includes: work.slice(0, tier.count),
      revisions: tier.revisions,
      turnaroundDays: tier.days,
    })),
    addons: [
      { id: `${profile.id}-addon-revision`, kind: "revision", price: roundBaht(base * 0.15) },
      { id: `${profile.id}-addon-rush`, kind: "rush", price: roundBaht(base * 0.22) },
      { id: `${profile.id}-addon-usage`, kind: "usage", price: roundBaht(base * 0.4) },
      { id: `${profile.id}-addon-crosspost`, kind: "crosspost", price: roundBaht(base * 0.28) },
    ],
  };
}

const INFLUENCERS_QUERY = /* GraphQL */ `
  query Influencers($limit: Int, $offset: Int, $search: String, $filter: InfluencerFilterInput) {
    influencers(limit: $limit, offset: $offset, search: $search, filter: $filter) {
      data {
        id
        firstName
        lastName
        stageName
        avatarUrl
        platforms
        contentCategories
        languages
        averageRating
        reviewCount
      }
      status {
        code
        message
        error
      }
    }
  }
`;

type InfluencersQueryResult = {
  influencers: {
    data: ApiInfluencer[] | null;
    status?: { code?: string | null; message?: string | null; error?: string | null };
  };
};

export type FetchInfluencersParams = {
  limit?: number;
  offset?: number;
  search?: string;
  categories?: string[];
  platforms?: string[];
};

export async function fetchInfluencers(
  params: FetchInfluencersParams = {},
  signal?: AbortSignal
): Promise<InfluencerListItem[]> {
  const { limit, offset, search, categories, platforms } = params;

  const filter =
    (categories && categories.length > 0) || (platforms && platforms.length > 0)
      ? {
          ...(categories && categories.length > 0 ? { categories } : {}),
          ...(platforms && platforms.length > 0 ? { platforms } : {}),
        }
      : undefined;

  const result = await graphqlRequest<InfluencersQueryResult>(
    INFLUENCERS_QUERY,
    {
      limit,
      offset,
      search: search?.trim() || undefined,
      filter,
    },
    signal
  );

  const { data, status } = result.influencers;

  if (status?.error) {
    throw new Error(status.error);
  }

  return (data ?? []).map(mapInfluencer);
}

export function filterInfluencersByCategories(
  influencers: InfluencerListItem[],
  selected: InfluencerCategoryKey[]
): InfluencerListItem[] {
  if (selected.length === 0) return influencers;
  return influencers.filter((inf) =>
    inf.categories.some((cat) => selected.includes(cat))
  );
}

const INFLUENCER_PUBLIC_FIELDS = /* GraphQL */ `
  id
  email
  firstName
  lastName
  stageName
  age
  avatarUrl
  platforms
  contentCategories
  languages
  otherPhotos
  averageRating
  reviewCount
  createdAt
`;

const INFLUENCER_DETAIL_QUERY = /* GraphQL */ `
  query InfluencersDetail {
    influencers {
      data {
        ${INFLUENCER_PUBLIC_FIELDS}
        bankName
        bankAccountName
        bankAccountNumber
      }
      status {
        error
      }
    }
  }
`;

const INFLUENCER_BY_ID_QUERY = /* GraphQL */ `
  query Influencer($id: Int!) {
    influencer(id: $id) {
      data {
        ${INFLUENCER_PUBLIC_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

type InfluencersDetailResult = {
  influencers: {
    data: ApiInfluencer[] | null;
    status?: { error?: string | null };
  };
};

type InfluencerByIdResult = {
  influencer: {
    data: ApiInfluencer | null;
    status?: { error?: string | null };
  };
};

export async function fetchInfluencerById(
  id: number,
  signal?: AbortSignal
): Promise<ApiInfluencer | null> {
  const result = await graphqlRequest<InfluencerByIdResult>(
    INFLUENCER_BY_ID_QUERY,
    { id },
    signal
  );

  const { data, status } = result.influencer;
  if (status?.error) throw new Error(status.error);
  return data;
}

export async function fetchInfluencerByEmail(
  email: string,
  signal?: AbortSignal
): Promise<ApiInfluencer | null> {
  const result = await graphqlRequest<InfluencersDetailResult>(
    INFLUENCER_DETAIL_QUERY,
    undefined,
    signal
  );

  const { data, status } = result.influencers;
  if (status?.error) throw new Error(status.error);

  const normalized = email.trim().toLowerCase();
  return (
    (data ?? []).find((inf) => inf.email?.toLowerCase() === normalized) ?? null
  );
}
