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
};

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
