import { clearStoredUser, getAuthToken } from "./auth";

export const MARKETPLACE_API_URL =
  process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ?? "http://localhost:8000/graphql";

type GraphQLError = {
  message: string;
  extensions?: { code?: string };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

export function isUnauthenticatedGraphQLError(error: GraphQLError): boolean {
  const code = String(error.extensions?.code ?? "").toUpperCase();
  if (code === "UNAUTHENTICATED" || code === "UNAUTHORIZED") return true;

  const message = error.message.trim().toLowerCase();
  return (
    message === "unauthorized" ||
    message === "unauthenticated" ||
    message === "not authenticated" ||
    message.includes("jwt expired") ||
    message.includes("token expired") ||
    message.includes("invalid token") ||
    message.includes("invalid jwt") ||
    message.includes("jwt malformed")
  );
}

function clearSessionIfAuthenticated(hadToken: boolean): void {
  if (hadToken) clearStoredUser();
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(MARKETPLACE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });

  if (res.status === 401) {
    clearSessionIfAuthenticated(Boolean(token));
  }

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    if (json.errors.some(isUnauthenticatedGraphQLError)) {
      clearSessionIfAuthenticated(Boolean(token));
    }
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new Error("Empty response from marketplace service");
  }

  return json.data;
}
