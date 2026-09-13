import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  clearStoredUser,
  getAuthToken,
  getStoredUser,
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

beforeEach(() => {
  installBrowserStorage();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("session storage", () => {
  it("is logged in only when both token and user are present", () => {
    expect(isLoggedIn()).toBe(false);

    setStoredUser(user);
    expect(isLoggedIn()).toBe(false);

    setAuthToken("jwt-token");
    expect(isLoggedIn()).toBe(true);
    expect(getAuthToken()).toBe("jwt-token");
    expect(getStoredUser()).toEqual(user);
  });

  it("does not persist a password field", () => {
    setStoredUser({
      ...user,
      password: "Password123",
    } as MockUser & { password: string });

    const stored = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? "{}");
    expect(stored.password).toBeUndefined();
    expect(getStoredUser()).toEqual(user);
  });

  it("strips a leftover password from an existing localStorage session", () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, "jwt-token");
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify({ ...user, password: "Password123" })
    );

    expect(getStoredUser()).toEqual(user);
    expect(JSON.parse(localStorage.getItem(USER_STORAGE_KEY) ?? "{}").password).toBeUndefined();
    expect(isLoggedIn()).toBe(true);
  });

  it("clears both token and user on logout", () => {
    setStoredUser(user);
    setAuthToken("jwt-token");
    clearStoredUser();

    expect(isLoggedIn()).toBe(false);
    expect(getAuthToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });
});
