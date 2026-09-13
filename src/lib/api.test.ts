import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { graphqlRequest, isUnauthenticatedGraphQLError } from "./api";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  isLoggedIn,
  setAuthToken,
  setStoredUser,
} from "./auth";
import type { MockUser } from "./mock-users";

const user: MockUser = {
  id: "1",
  name: "Influ One",
  email: "user@example.com",
  role: "influencer",
  countryCode: "+66",
  phone: "",
  paymentAccount: {
    bankName: "KBank",
    accountNumber: "123",
    accountHolder: "Influ One",
  },
};

function installBrowserStorage() {
  const store: Record<string, string> = {};
  const localStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const key of Object.keys(store)) delete store[key];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };

  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("window", {
    localStorage,
    dispatchEvent: vi.fn(() => true),
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  installBrowserStorage();
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isUnauthenticatedGraphQLError", () => {
  it("matches auth failure codes and exact unauthorized messages", () => {
    expect(
      isUnauthenticatedGraphQLError({
        message: "nope",
        extensions: { code: "UNAUTHENTICATED" },
      })
    ).toBe(true);
    expect(isUnauthenticatedGraphQLError({ message: "Unauthorized" })).toBe(true);
    expect(isUnauthenticatedGraphQLError({ message: "jwt expired" })).toBe(true);
    expect(
      isUnauthenticatedGraphQLError({
        message: "You are not authorized to decline this invite",
      })
    ).toBe(false);
  });
});

describe("graphqlRequest auth failures", () => {
  it("clears the session on HTTP 401 when a token was sent", async () => {
    setStoredUser(user);
    setAuthToken("stale-token");
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ errors: [] }, 401));

    await expect(graphqlRequest("{ version }")).rejects.toThrow(
      "Request failed with status 401"
    );
    expect(isLoggedIn()).toBe(false);
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(USER_STORAGE_KEY)).toBeNull();
  });

  it("clears the session on unauthenticated GraphQL errors when a token was sent", async () => {
    setStoredUser(user);
    setAuthToken("stale-token");
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ errors: [{ message: "Unauthorized" }] })
    );

    await expect(graphqlRequest("{ myJobs }")).rejects.toThrow("Unauthorized");
    expect(isLoggedIn()).toBe(false);
  });

  it("does not clear the session on unrelated GraphQL errors", async () => {
    setStoredUser(user);
    setAuthToken("ok-token");
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ errors: [{ message: "Failed to create job" }] })
    );

    await expect(graphqlRequest("{ createJob }")).rejects.toThrow(
      "Failed to create job"
    );
    expect(isLoggedIn()).toBe(true);
  });

  it("does not clear anything when no token was sent", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ errors: [] }, 401));

    await expect(graphqlRequest("{ version }")).rejects.toThrow(
      "Request failed with status 401"
    );
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});
