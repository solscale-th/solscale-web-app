"use client";

import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { getSafeReturnTo, setAuthToken, setStoredUser } from "@/lib/auth";
import {
  loginEntrepreneur,
  loginEntrepreneurWithGoogle,
  loginInfluencer,
  loginInfluencerWithGoogle,
  updateEntrepreneurCompanyName,
} from "@/lib/auth-api";
import type { MockUser } from "@/lib/mock-users";

type Role = "influencer" | "entrepreneur";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingGoogleUser, setPendingGoogleUser] = useState<MockUser | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const canSubmit =
    email.trim() !== "" && password.trim() !== "" && role !== null && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError("");
    setLoading(true);

    try {
      const { token, user } =
        role === "influencer"
          ? await loginInfluencer(email, password)
          : await loginEntrepreneur(email, password);
      setAuthToken(token);
      setStoredUser(user);
      router.push(returnTo);
    } catch {
      setError(t("auth.login.invalidCredentials"));
      setLoading(false);
    }
  }

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!role) {
        setError(t("auth.login.selectRoleFirst"));
        return;
      }
      setError("");
      setGoogleLoading(true);
      try {
        if (role === "influencer") {
          const { token, user } = await loginInfluencerWithGoogle(tokenResponse.access_token);
          setAuthToken(token);
          setStoredUser(user);
          router.push(returnTo);
        } else {
          const { token, user, needsCompanyName } =
            await loginEntrepreneurWithGoogle(tokenResponse.access_token);
          setAuthToken(token);
          setStoredUser(user);
          if (needsCompanyName) {
            setPendingGoogleUser(user);
            setGoogleLoading(false);
          } else {
            router.push(returnTo);
          }
        }
      } catch {
        setError(t("auth.login.googleLoginFailed"));
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setError(t("auth.login.googleLoginFailed"));
    },
    flow: "implicit",
  });

  async function handleCompanyNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingGoogleUser || !companyName.trim()) return;
    setError("");
    setGoogleLoading(true);

    try {
      await updateEntrepreneurCompanyName(companyName.trim());
      setStoredUser({ ...pendingGoogleUser, name: companyName.trim() });
      router.push(returnTo);
    } catch {
      setError(t("auth.login.companyNameSaveFailed"));
      setGoogleLoading(false);
    }
  }

  if (pendingGoogleUser) {
    return (
      <div className="w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <h1 className="text-[32px] font-bold text-[#111] tracking-tight">
            {t("auth.login.completeProfileTitle")}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#777]">
            {t("auth.login.completeProfileSubtitle")}
          </p>
        </div>

        <form onSubmit={handleCompanyNameSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-medium text-[#333] mb-1.5">
              {t("auth.signup.companyName")}
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t("auth.signup.companyNamePlaceholder")}
              required
              className="w-full rounded-xl border border-[#ddd] bg-white px-3.5 py-3 text-[14px] text-[#111] outline-none focus:border-[#9d003b] focus:ring-1 focus:ring-[#9d003b]"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={googleLoading || !companyName.trim()}
            className="mt-1 flex items-center justify-center gap-2 h-[48px] w-full rounded-xl bg-[#9d003b] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(157,0,59,0.35)] hover:bg-[#850030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? t("auth.login.submitting") : t("auth.login.continueButton")}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[460px]">
      <div className="mb-8 text-center">
        <h1 className="text-[32px] font-bold text-[#111] tracking-tight">
          {t("auth.login.title")}
        </h1>
        <p className="mt-1.5 text-[15px] text-[#777]">{t("auth.login.subtitle")}</p>
      </div>

      {/* Step 1: Role selection */}
      <div className="mb-6 rounded-2xl border border-[#e8e4de] bg-[#faf9f7] p-5">
        <p className="mb-3 text-center text-[12px] font-semibold text-[#111]">
          {t("auth.login.selectRoleHint")}
        </p>
        <div className="flex rounded-xl bg-[#e3dfd7] p-1">
          <button
            type="button"
            onClick={() => setRole("influencer")}
            className={`flex-1 rounded-lg py-3 text-[14px] font-semibold transition-all ${
              role === "influencer"
                ? "bg-[#9d003b] text-white shadow-sm"
                : "text-[#888] hover:bg-[#9d003b]/15 hover:text-[#9d003b]"
            }`}
          >
            {t("auth.login.roleInfluencer")}
          </button>
          <button
            type="button"
            onClick={() => setRole("entrepreneur")}
            className={`flex-1 rounded-lg py-3 text-[14px] font-semibold transition-all ${
              role === "entrepreneur"
                ? "bg-[#9d003b] text-white shadow-sm"
                : "text-[#888] hover:bg-[#9d003b]/15 hover:text-[#9d003b]"
            }`}
          >
            {t("auth.login.roleEntrepreneur")}
          </button>
        </div>
        {/* {!role && (
          <p className="mt-2.5 text-center text-[12px] text-[#bbb]">
            {t("auth.login.selectRoleHint")}
          </p>
        )} */}
      </div>

      {/* Step 2: Credentials — revealed after role is chosen */}
      <div
        className={`rounded-2xl border border-[#e8e4de] p-5 transition-all duration-300 ${
          role ? "opacity-100 translate-y-0" : "pointer-events-none opacity-30 translate-y-2"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-medium text-[#333] mb-1.5">
              {t("auth.login.email")}
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#ddd] bg-white px-3.5 py-3 focus-within:border-[#9d003b] focus-within:ring-1 focus-within:ring-[#9d003b]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1 5.5L8 10L15 5.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                required
                disabled={!role}
                className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb] disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[14px] font-medium text-[#333]">
                {t("auth.login.password")}
              </label>
              <Link href="/forgot-password" className="text-[13px] font-medium text-[#9d003b] hover:underline">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#ddd] bg-white px-3.5 py-3 focus-within:border-[#9d003b] focus-within:ring-1 focus-within:ring-[#9d003b]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
                <rect x="4" y="6" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.login.passwordPlaceholder")}
                required
                disabled={!role}
                className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb] disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#aaa] hover:text-[#777]"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 10M1 8C2.5 4.5 5 3 8 3c1.1 0 2.1.25 3 .7M15 8c-.8 1.9-2.2 3.3-4 4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8C2.5 4.5 5 3 8 3s5.5 1.5 7 5c-1.5 3.5-4 5-7 5S2.5 11.5 1 8z" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded border-[#ccc] accent-[#9d003b]" />
            <span className="text-[14px] text-[#555]">{t("auth.login.rememberMe")}</span>
          </label>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-1 flex items-center justify-center gap-2 h-[48px] w-full rounded-xl bg-[#9d003b] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(157,0,59,0.35)] hover:bg-[#850030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.login.submitting") : (
              <>
                {t("auth.login.submit")}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#ddd]" />
          <span className="text-[13px] text-[#aaa]">{t("auth.login.orContinue")}</span>
          <div className="flex-1 h-px bg-[#ddd]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => triggerGoogleLogin()}
            disabled={!role || googleLoading}
            className="flex items-center justify-center gap-2 h-[44px] rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#333] hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            disabled={!role}
            className="flex items-center justify-center gap-2 h-[44px] rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#333] hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="h-[18px] w-[18px] rounded-full bg-[#06C755] grid place-items-center">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="white">
                <path d="M6 1C3.24 1 1 2.94 1 5.33c0 2.11 1.87 3.88 4.4 4.22.17.04.4.11.46.26.05.13.03.33.02.46l-.07.44c-.02.13-.1.52.46.28.56-.24 3.02-1.78 4.12-3.05C11.22 7.04 11 6.21 11 5.33 11 2.94 8.76 1 6 1z" />
              </svg>
            </div>
            LINE
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-[14px] text-[#777]">
        {t("auth.login.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-[#9d003b] hover:underline">
          {t("auth.login.signUpFree")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
