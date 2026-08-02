import { graphqlRequest } from "./api";

export type ApiEntrepreneur = {
  id: number;
  email?: string | null;
  companyName: string;
  brandDescription?: string | null;
  logoUrl?: string | null;
  bankName?: string | null;
  bankAccountName?: string | null;
  bankAccountNumber?: string | null;
  createdAt?: string | null;
};

/** Public profile fields used by the entrepreneur detail screen (no bank data). */
export type EntrepreneurProfile = {
  id: string;
  companyName: string;
  brandDescription?: string | null;
  logoUrl?: string | null;
  email?: string | null;
  createdAt?: string | null;
  /** Mock-only fallback when logoUrl is absent */
  avatarFallbackClass?: string;
};

export type EntrepreneurCampaign = {
  id: string;
  title: string;
  description: string;
  platform: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  postedDaysAgo?: number;
  createdAt?: string | null;
  promoted?: boolean;
  location?: string | null;
  duration?: string | null;
  thumbnailBg?: string;
};

const ENTREPRENEUR_PUBLIC_FIELDS = /* GraphQL */ `
  id
  email
  companyName
  brandDescription
  logoUrl
  createdAt
`;

const ENTREPRENEUR_DETAIL_QUERY = /* GraphQL */ `
  query EntrepreneursDetail {
    entrepreneurs {
      data {
        id
        email
        companyName
        brandDescription
        logoUrl
        bankName
        bankAccountName
        bankAccountNumber
        createdAt
      }
      status {
        error
      }
    }
  }
`;

const ENTREPRENEUR_BY_ID_QUERY = /* GraphQL */ `
  query Entrepreneur($id: Int!) {
    entrepreneur(id: $id) {
      data {
        ${ENTREPRENEUR_PUBLIC_FIELDS}
      }
      status {
        error
      }
    }
  }
`;

type EntrepreneursDetailResult = {
  entrepreneurs: {
    data: ApiEntrepreneur[] | null;
    status?: { error?: string | null };
  };
};

type EntrepreneurByIdResult = {
  entrepreneur: {
    data: ApiEntrepreneur | null;
    status?: { error?: string | null };
  };
};

export function toEntrepreneurProfile(api: ApiEntrepreneur): EntrepreneurProfile {
  return {
    id: String(api.id),
    companyName: api.companyName,
    brandDescription: api.brandDescription,
    logoUrl: api.logoUrl,
    email: api.email,
    createdAt: api.createdAt,
  };
}

export async function fetchEntrepreneurById(
  id: number,
  signal?: AbortSignal
): Promise<ApiEntrepreneur | null> {
  const result = await graphqlRequest<EntrepreneurByIdResult>(
    ENTREPRENEUR_BY_ID_QUERY,
    { id },
    signal
  );

  const { data, status } = result.entrepreneur;
  if (status?.error) throw new Error(status.error);
  return data;
}

export async function fetchEntrepreneurByEmail(
  email: string,
  signal?: AbortSignal
): Promise<ApiEntrepreneur | null> {
  const result = await graphqlRequest<EntrepreneursDetailResult>(
    ENTREPRENEUR_DETAIL_QUERY,
    undefined,
    signal
  );

  const { data, status } = result.entrepreneurs;
  if (status?.error) throw new Error(status.error);

  const normalized = email.trim().toLowerCase();
  return (
    (data ?? []).find((ent) => ent.email?.toLowerCase() === normalized) ?? null
  );
}
