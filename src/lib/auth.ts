import type { MockUser } from "./mock-users";

export const USER_STORAGE_KEY = "solscale_user";
export const TOKEN_STORAGE_KEY = "solscale_token";

export const AUTH_CHANGE_EVENT = "solscale-auth-change";

function readToken(): string | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token?.trim() ? token : null;
}

export function normalizeStoredUser(value: unknown): MockUser | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" && typeof raw.id !== "number") return null;
  if (raw.role !== "influencer" && raw.role !== "entrepreneur") return null;

  const payment =
    raw.paymentAccount && typeof raw.paymentAccount === "object"
      ? (raw.paymentAccount as Record<string, unknown>)
      : {};

  return {
    id: String(raw.id),
    name: typeof raw.name === "string" ? raw.name : "",
    email: typeof raw.email === "string" ? raw.email : "",
    role: raw.role,
    countryCode: typeof raw.countryCode === "string" ? raw.countryCode : "",
    phone: typeof raw.phone === "string" ? raw.phone : "",
    paymentAccount: {
      bankName: typeof payment.bankName === "string" ? payment.bankName : "",
      accountNumber:
        typeof payment.accountNumber === "string" ? payment.accountNumber : "",
      accountHolder:
        typeof payment.accountHolder === "string" ? payment.accountHolder : "",
    },
  };
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return readToken();
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getStoredUser(): MockUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    const user = normalizeStoredUser(JSON.parse(raw));
    if (!user) return null;

    const serialized = JSON.stringify(user);
    if (serialized !== raw) {
      localStorage.setItem(USER_STORAGE_KEY, serialized);
    }

    return user;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null && getStoredUser() !== null;
}

export function getSafeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export function buildLoginUrl(returnTo: string): string {
  return `/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export function setStoredUser(user: MockUser): void {
  if (typeof window === "undefined") return;
  const normalized = normalizeStoredUser(user);
  if (!normalized) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}
