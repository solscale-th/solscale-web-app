import { graphqlRequest } from "./api";
import { PLATFORM_COLORS, type Platform } from "./job";

export const INFLUENCER_CATEGORY_KEYS = [
  "beauty",
  "fashion",
  "food",
  "tech",
  "fitness",
  "travel",
  "finance",
  "gaming",
  "parenting",
  "home",
] as const;

export type InfluencerCategoryKey = (typeof INFLUENCER_CATEGORY_KEYS)[number];

export type ApiInfluencerPackage = {
  id: number;
  tier?: string | null;
  platform?: string | null;
  price?: number | null;
  includes?: string[] | null;
  revisions?: number | null;
  turnaroundDays?: number | null;
};

export type ApiInfluencerAddon = {
  id: number;
  kind?: string | null;
  price?: number | null;
};

export type ApiInfluencerPortfolioItem = {
  id: number;
  title?: string | null;
  platform?: string | null;
  imageUrl?: string | null;
};

export type ApiInfluencerReview = {
  id: number;
  rating?: number | null;
  comment?: string | null;
  entrepreneur?: { companyName?: string | null } | null;
};

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
  countryCode?: string | null;
  phone?: string | null;
  bio?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  createdAt?: string | null;
  packages?: ApiInfluencerPackage[] | null;
  addons?: ApiInfluencerAddon[] | null;
  portfolio?: ApiInfluencerPortfolioItem[] | null;
  reviews?: ApiInfluencerReview[] | null;
};

export const PACKAGE_TIERS = ["starter", "standard", "campaign"] as const;
export type PackageTier = (typeof PACKAGE_TIERS)[number];

export const ADDON_KINDS = ["revision", "rush", "usage", "crosspost"] as const;
export type AddonKind = (typeof ADDON_KINDS)[number];

/** A hireable package this influencer offers. `tier` is the API string. */
export type InfluencerPackage = {
  id: string;
  tier: string;
  platform?: string | null;
  price: number;
  includes: string[];
  revisions: number;
  turnaroundDays: number;
};

/** An optional extra on the influencer's catalog. `kind` is the API string. */
export type InfluencerAddon = {
  id: string;
  kind: string;
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
  /** Optional bio when the API provides one */
  about?: string | null;
  /** Color behind the initial when avatarUrl is absent */
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

function mapPackages(raw?: ApiInfluencerPackage[] | null): InfluencerPackage[] {
  if (!raw) return [];
  return raw.flatMap((item) => {
    if (item.id == null) return [];
    return [
      {
        id: String(item.id),
        tier: item.tier?.trim() ?? "",
        platform: item.platform,
        price: item.price ?? 0,
        includes: item.includes ?? [],
        revisions: item.revisions ?? 0,
        turnaroundDays: item.turnaroundDays ?? 0,
      },
    ];
  });
}

function mapAddons(raw?: ApiInfluencerAddon[] | null): InfluencerAddon[] {
  if (!raw) return [];
  return raw.flatMap((item) => {
    if (item.id == null) return [];
    return [
      {
        id: String(item.id),
        kind: item.kind?.trim() ?? "",
        price: item.price ?? 0,
      },
    ];
  });
}

function mapPortfolio(raw?: ApiInfluencerPortfolioItem[] | null): InfluencerPortfolioItem[] {
  if (!raw) return [];
  return raw.flatMap((item) => {
    if (item.id == null) return [];
    return [
      {
        id: String(item.id),
        title: item.title?.trim() ?? "",
        platform: item.platform,
        imageUrl: item.imageUrl,
      },
    ];
  });
}

function mapReviews(raw?: ApiInfluencerReview[] | null): InfluencerReview[] {
  if (!raw) return [];
  return raw.flatMap((item) => {
    if (item.id == null) return [];
    return [
      {
        id: String(item.id),
        author: item.entrepreneur?.companyName?.trim() ?? "",
        rating: item.rating ?? 0,
        comment: item.comment ?? "",
      },
    ];
  });
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
    about: influencer.bio,
    avatarFallbackClass:
      AVATAR_BACKGROUNDS[influencer.id % AVATAR_BACKGROUNDS.length],
    packages: mapPackages(influencer.packages),
    addons: mapAddons(influencer.addons),
    portfolio: mapPortfolio(influencer.portfolio),
    reviews: mapReviews(influencer.reviews),
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
        bio
        packages {
          id
          tier
          platform
          price
          includes
          revisions
          turnaroundDays
        }
        addons {
          id
          kind
          price
        }
        portfolio {
          id
          title
          platform
          imageUrl
        }
        reviews {
          id
          rating
          comment
          entrepreneur {
            companyName
          }
        }
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

const INFLUENCER_ACCOUNT_QUERY = /* GraphQL */ `
  query InfluencerAccount($id: Int!) {
    influencer(id: $id) {
      data {
        ${INFLUENCER_PUBLIC_FIELDS}
        bio
        countryCode
        phone
        bankName
        bankAccountName
        bankAccountNumber
        packages {
          id
          tier
          platform
          price
          includes
          revisions
          turnaroundDays
        }
        addons {
          id
          kind
          price
        }
      }
      status {
        error
      }
    }
  }
`;

/** Logged-in account fields, including bank details and the hire catalog. */
export async function fetchInfluencerAccount(
  id: number,
  signal?: AbortSignal
): Promise<ApiInfluencer | null> {
  const result = await graphqlRequest<InfluencerByIdResult>(
    INFLUENCER_ACCOUNT_QUERY,
    { id },
    signal
  );

  const { data, status } = result.influencer;
  if (status?.error) throw new Error(status.error);
  return data;
}

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
