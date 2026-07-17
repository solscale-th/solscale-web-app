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
};

export type InfluencerListItem = {
  id: string;
  name: string;
  handle: string;
  platform?: Platform;
  categories: InfluencerCategoryKey[];
  languages: string[];
  rating: number;
  reviews: number;
  avatarUrl?: string;
  avatarBg: string;
};

const AVATAR_BACKGROUNDS = [
  "bg-[#fce8ee]",
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

export function mapInfluencer(influencer: ApiInfluencer): InfluencerListItem {
  const name =
    influencer.stageName?.trim() ||
    `${influencer.firstName} ${influencer.lastName}`.trim();

  return {
    id: String(influencer.id),
    name,
    handle: toHandle(influencer),
    platform: toPlatform(influencer.platforms),
    categories: toCategories(influencer.contentCategories),
    languages: influencer.languages ?? [],
    rating: Number(influencer.averageRating ?? 0),
    reviews: influencer.reviewCount ?? 0,
    avatarUrl: influencer.avatarUrl ?? undefined,
    avatarBg: AVATAR_BACKGROUNDS[influencer.id % AVATAR_BACKGROUNDS.length],
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
};

export async function fetchInfluencers(
  params: FetchInfluencersParams = {},
  signal?: AbortSignal
): Promise<InfluencerListItem[]> {
  const { limit, offset, search, categories } = params;

  const result = await graphqlRequest<InfluencersQueryResult>(
    INFLUENCERS_QUERY,
    {
      limit,
      offset,
      search: search?.trim() || undefined,
      filter: categories && categories.length > 0 ? { categories } : undefined,
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

const INFLUENCER_DETAIL_QUERY = /* GraphQL */ `
  query InfluencersDetail {
    influencers {
      data {
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
        bankName
        bankAccountName
        bankAccountNumber
        otherPhotos
        averageRating
        reviewCount
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
