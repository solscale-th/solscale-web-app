import { getAuthToken } from "./auth";

export const MARKETPLACE_API_URL =
  process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ?? "http://localhost:8000/graphql";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

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

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }

  if (!json.data) {
    throw new Error("Empty response from marketplace service");
  }

  return json.data;
}
