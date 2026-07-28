"use client";

import { useGoogleLogin } from "@react-oauth/google";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import CompleteProfileForm from "@/components/complete-profile-form";
import { useLanguage } from "@/i18n/language-provider";
import { getSafeReturnTo, setAuthToken, setStoredUser } from "@/lib/auth";
import {
  loginEntrepreneur,
  loginEntrepreneurWithGoogle,
  loginInfluencer,
  loginInfluencerWithGoogle,
  updateEntrepreneurProfile,
  updateInfluencerProfile,
} from "@/lib/auth-api";
import type { MockUser } from "@/lib/mock-users";
import {
  buildLineAuthorizeUrl,
  LINE_OAUTH_ROLE_KEY,
  LINE_OAUTH_RETURN_TO_KEY,
  LINE_OAUTH_STATE_KEY,
} from "@/lib/line-auth";

type Role = "influencer" | "entrepreneur";
type LoginStep = 1 | 2;

const stepTransition = { type: "spring" as const, stiffness: 380, damping: 32 };

const stepVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 48 : -48,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -48 : 48,
  }),
};

function RoleSelector({
  role,
  onSelect,
  influencerLabel,
  entrepreneurLabel,
}: {
  role: Role | null;
  onSelect: (role: Role) => void;
  influencerLabel: string;
  entrepreneurLabel: string;
}) {
  return (
    <div className="relative flex rounded-xl bg-[#e3dfd7] p-1">
      {role && (
        <motion.div
          className="absolute inset-y-1 w-[calc(50%-4px)] rounded-lg bg-[#9d003b] shadow-sm"
          initial={false}
          animate={{
            left: role === "influencer" ? 4 : "calc(50%)",
          }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <button
        type="button"
        onClick={() => onSelect("influencer")}
        className={`relative z-10 flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition-colors ${
          role === "influencer" ? "text-white" : "text-[#888] hover:text-[#555]"
        }`}
      >
        {influencerLabel}
      </button>
      <button
        type="button"
        onClick={() => onSelect("entrepreneur")}
        className={`relative z-10 flex-1 rounded-lg py-2.5 text-[14px] font-semibold transition-colors ${
          role === "entrepreneur" ? "text-white" : "text-[#888] hover:text-[#555]"
        }`}
      >
        {entrepreneurLabel}
      </button>
    </div>
  );
}

function StepIndicator({
  step,
  labels,
}: {
  step: LoginStep;
  labels: [string, string];
}) {
  return (
    <div className="mb-8 mx-auto w-[180px]" aria-hidden="true">
      <div className="relative flex items-start justify-between">
        {/* 40px = 32px circle + 8px gap on each side */}
        <div
          className={`absolute left-10 right-10 top-4 h-0.5 -translate-y-1/2 rounded-full transition-colors ${
            step > 1 ? "bg-[#9d003b]" : "bg-[#e8e4dc]"
          }`}
        />
        {labels.map((label, index) => {
          const stepNumber = (index + 1) as LoginStep;
          const isActive = step === stepNumber;
          const isDone = step > stepNumber;

          return (
            <div key={label} className="relative z-10 flex w-8 flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                  isActive || isDone
                    ? "bg-[#9d003b] text-white"
                    : "bg-[#e8e4dc] text-[#999]"
                }`}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7.5l2.5 2.5L11 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={`whitespace-nowrap text-center text-[12px] font-medium ${
                  isActive ? "text-[#9d003b]" : isDone ? "text-[#555]" : "text-[#aaa]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));

  const [step, setStep] = useState<LoginStep>(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingUser, setPendingUser] = useState<MockUser | null>(null);
  const [profileGaps, setProfileGaps] = useState({
    needsEmail: false,
    needsCompanyName: false,
  });
  const [googleLoading, setGoogleLoading] = useState(false);

  const canSubmit =
    email.trim() !== "" && password.trim() !== "" && role !== null && !loading;

  function handleNext() {
    if (!role) {
      setError(t("auth.login.selectRoleFirst"));
      return;
    }
    setError("");
    setStepDirection(1);
    setStep(2);
  }

  function handleBack() {
    setError("");
    setStepDirection(-1);
    setStep(1);
  }

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
          const { token, user } = await loginInfluencerWithGoogle(
            tokenResponse.access_token
          );
          setAuthToken(token);
          setStoredUser(user);
          router.push(returnTo);
        } else {
          const { token, user, needsCompanyName } =
            await loginEntrepreneurWithGoogle(tokenResponse.access_token);
          setAuthToken(token);
          setStoredUser(user);
          if (needsCompanyName) {
            setPendingUser(user);
            setProfileGaps({ needsEmail: false, needsCompanyName: true });
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
    onError: () => setError(t("auth.login.googleLoginFailed")),
  });

  function handleLineLogin() {
    if (!role) {
      setError(t("auth.login.selectRoleFirst"));
      return;
    }

    const state = crypto.randomUUID();
    const redirectUri = `${window.location.origin}/login/line/callback`;
    sessionStorage.setItem(LINE_OAUTH_STATE_KEY, state);
    sessionStorage.setItem(LINE_OAUTH_ROLE_KEY, role);
    sessionStorage.setItem(LINE_OAUTH_RETURN_TO_KEY, returnTo);

    window.location.href = buildLineAuthorizeUrl({
      clientId: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID ?? "",
      redirectUri,
      state,
    });
  }

  async function handleProfileSubmit(values: {
    email?: string;
    companyName?: string;
  }) {
    if (!pendingUser) return;

    if (pendingUser.role === "entrepreneur") {
      await updateEntrepreneurProfile(values);
    } else {
      await updateInfluencerProfile({ email: values.email ?? "" });
    }

    setStoredUser({
      ...pendingUser,
      name: values.companyName || pendingUser.name,
      email: values.email || pendingUser.email,
    });
    router.push(returnTo);
  }

  if (pendingUser) {
    return (
      <CompleteProfileForm
        needsEmail={profileGaps.needsEmail}
        needsCompanyName={profileGaps.needsCompanyName}
        onSubmit={handleProfileSubmit}
      />
    );
  }

  const roleLabel =
    role === "influencer"
      ? t("auth.login.roleInfluencer")
      : role === "entrepreneur"
        ? t("auth.login.roleEntrepreneur")
        : "";

  return (
    <div className="w-full max-w-[460px]">
      <div className="rounded-2xl border border-[#e0ddd5] bg-white p-6 sm:p-8 shadow-[0_8px_32px_rgba(17,17,17,0.08)]">
        <div className="mb-6 text-center">
          <h1 className="text-[32px] font-bold text-[#111] tracking-tight">
            {t("auth.login.title")}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#777]">
            {step === 1 ? t("auth.login.selectRoleSubtitle") : t("auth.login.subtitle")}
          </p>
        </div>

        <p className="mb-3 text-center text-[12px] font-medium text-[#999]">
          {t("auth.login.stepLabel", { current: step, total: 2 })}
        </p>

        <StepIndicator
          step={step}
          labels={[t("auth.login.stepRole"), t("auth.login.stepCredentials")]}
        />

        {/* px/py keep focus rings from being clipped by overflow-hidden during step slides */}
        <div className="overflow-hidden px-0.5 py-0.5 -mx-0.5">
          <AnimatePresence mode="wait" custom={stepDirection}>
          {step === 1 ? (
            <motion.div
              key="step-1"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-[14px] font-medium text-[#333] mb-1.5">
                  {t("auth.login.selectRole")} <span className="text-[#9d003b]">*</span>
                </label>
                <RoleSelector
                  role={role}
                  onSelect={(selectedRole) => {
                    setRole(selectedRole);
                    setError("");
                  }}
                  influencerLabel={t("auth.login.roleInfluencer")}
                  entrepreneurLabel={t("auth.login.roleEntrepreneur")}
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[13px] text-red-600">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!role}
                className="mt-1 flex items-center justify-center gap-2 h-[48px] w-full rounded-xl bg-[#9d003b] text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(157,0,59,0.35)] hover:bg-[#850030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {t("auth.login.next")}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <p className="mt-2 text-center text-[14px] text-[#777]">
                {t("auth.login.noAccount")}{" "}
                <Link href="/signup" className="font-semibold text-[#9d003b] hover:underline">
                  {t("auth.login.signUpFree")}
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              custom={stepDirection}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
            >
              <button
                type="button"
                onClick={handleBack}
                className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#777] hover:text-[#9d003b] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M11 7H3M6 3.5L2.5 7 6 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {t("auth.login.back")}
              </button>

              {role && (
                <p className="mb-4 rounded-xl bg-[#f5f2ec] px-3.5 py-2.5 text-center text-[13px] font-medium text-[#555]">
                  {t("auth.login.signingInAs", { role: roleLabel })}
                </p>
              )}

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
                      autoFocus
                      className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
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
                      className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
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
                  disabled={googleLoading}
                  className="flex items-center justify-center gap-2 h-[44px] rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#333] hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleLineLogin}
                  className="flex items-center justify-center gap-2 h-[44px] rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#333] hover:bg-[#fafafa] transition-colors"
                >
                  <div className="h-5 w-5 rounded-full bg-[#06C755] grid place-items-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M6 1C3.24 1 1 2.94 1 5.33c0 2.11 1.87 3.88 4.4 4.22.17.04.4.11.46.26.05.13.03.33.02.46l-.07.44c-.02.13-.1.52.46.28.56-.24 3.02-1.78 4.12-3.05C11.22 7.04 11 6.21 11 5.33 11 2.94 8.76 1 6 1z" />
                    </svg>
                  </div>
                  LINE
                </button>
              </div>

              <p className="mt-6 text-center text-[14px] text-[#777]">
                {t("auth.login.noAccount")}{" "}
                <Link href="/signup" className="font-semibold text-[#9d003b] hover:underline">
                  {t("auth.login.signUpFree")}
                </Link>
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
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
