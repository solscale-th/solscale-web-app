"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { setAuthToken, setStoredUser } from "@/lib/auth";
import {
  loginEntrepreneur,
  loginInfluencer,
  signupEntrepreneur,
  signupInfluencer,
} from "@/lib/auth-api";

type Role = "influencer" | "entrepreneur";
type SignupStep = 1 | 2;

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

// ─── Shared field components ──────────────────────────────────────────────────

function InputField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#333] mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-2.5 rounded-xl border border-[#ddd] bg-white px-3.5 py-3 focus-within:border-[#9d003b] focus-within:ring-1 focus-within:ring-[#9d003b]">
        {icon}
        {children}
      </div>
    </div>
  );
}

const PersonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 13.5C2 11 4.686 9 8 9s6 2 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1 5.5L8 10L15 5.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
    <rect x="4" y="6" width="8" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5.5 6V4.5a2.5 2.5 0 015 0V6" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const EyeIcon = ({ off }: { off?: boolean }) =>
  off ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 10M1 8C2.5 4.5 5 3 8 3c1.1 0 2.1.25 3 .7M15 8c-.8 1.9-2.2 3.3-4 4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8C2.5 4.5 5 3 8 3s5.5 1.5 7 5c-1.5 3.5-4 5-7 5S2.5 11.5 1 8z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );

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
  step: SignupStep;
  labels: [string, string];
}) {
  return (
    <div className="mb-8" aria-hidden="true">
      <div className="flex items-center">
        {labels.map((label, index) => {
          const stepNumber = (index + 1) as SignupStep;
          const isActive = step === stepNumber;
          const isDone = step > stepNumber;

          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
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
                  className={`text-[12px] font-medium ${
                    isActive ? "text-[#9d003b]" : isDone ? "text-[#555]" : "text-[#aaa]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < labels.length - 1 && (
                <div
                  className={`mx-3 mb-5 h-0.5 flex-1 rounded-full transition-colors ${
                    isDone ? "bg-[#9d003b]" : "bg-[#e8e4dc]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [step, setStep] = useState<SignupStep>(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [role, setRole] = useState<Role | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    role !== null &&
    email.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    agreed &&
    !loading &&
    (role === "influencer"
      ? firstName.trim() !== "" && lastName.trim() !== ""
      : companyName.trim() !== "");

  function handleNext() {
    if (!role) {
      setError(t("auth.signup.selectRoleFirst"));
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

    if (password !== confirmPassword) {
      setError(t("auth.signup.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (role === "influencer") {
        await signupInfluencer({ email, password, firstName, lastName });
      } else {
        await signupEntrepreneur({ email, password, companyName });
      }

      const { token, user } =
        role === "influencer"
          ? await loginInfluencer(email, password)
          : await loginEntrepreneur(email, password);
      setAuthToken(token);
      setStoredUser(user);
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isDuplicate =
        msg.toLowerCase().includes("duplicat") ||
        msg.toLowerCase().includes("409");
      setError(
        isDuplicate
          ? t("auth.signup.errorDuplicate")
          : t("auth.signup.errorGeneric")
      );
      setLoading(false);
    }
  }

  const roleLabel =
    role === "influencer"
      ? t("auth.signup.roleInfluencer")
      : role === "entrepreneur"
        ? t("auth.signup.roleEntrepreneur")
        : "";

  return (
    <div className="w-full max-w-[460px]">
      <div className="rounded-2xl border border-[#e0ddd5] bg-white p-6 sm:p-8 shadow-[0_8px_32px_rgba(17,17,17,0.08)]">
        <div className="mb-6 text-center">
          <h1 className="text-[32px] font-bold text-[#111] tracking-tight">
            {t("auth.signup.title")}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#777]">
            {step === 1 ? t("auth.signup.selectRoleSubtitle") : t("auth.signup.subtitle")}
          </p>
        </div>

        <p className="mb-3 text-center text-[12px] font-medium text-[#999]">
          {t("auth.signup.stepLabel", { current: step, total: 2 })}
        </p>

        <StepIndicator
          step={step}
          labels={[t("auth.signup.stepRole"), t("auth.signup.stepDetails")]}
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
                    {t("auth.signup.selectRole")} <span className="text-[#9d003b]">*</span>
                  </label>
                  <RoleSelector
                    role={role}
                    onSelect={(selectedRole) => {
                      setRole(selectedRole);
                      setError("");
                    }}
                    influencerLabel={t("auth.signup.roleInfluencer")}
                    entrepreneurLabel={t("auth.signup.roleEntrepreneur")}
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
                  {t("auth.signup.next")}
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
                  {t("auth.signup.hasAccount")}{" "}
                  <Link href="/login" className="font-semibold text-[#9d003b] hover:underline">
                    {t("auth.signup.signIn")}
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
                  {t("auth.signup.back")}
                </button>

                {role && (
                  <p className="mb-4 rounded-xl bg-[#f5f2ec] px-3.5 py-2.5 text-center text-[13px] font-medium text-[#555]">
                    {t("auth.signup.signingUpAs", { role: roleLabel })}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {role === "influencer" ? (
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label={t("auth.signup.firstName")} icon={<PersonIcon />}>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t("auth.signup.firstNamePlaceholder")}
                          required
                          autoFocus
                          className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                        />
                      </InputField>
                      <InputField label={t("auth.signup.lastName")} icon={<PersonIcon />}>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t("auth.signup.lastNamePlaceholder")}
                          required
                          className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                        />
                      </InputField>
                    </div>
                  ) : (
                    <InputField label={t("auth.signup.companyName")} icon={<PersonIcon />}>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={t("auth.signup.companyNamePlaceholder")}
                        required
                        autoFocus
                        className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                      />
                    </InputField>
                  )}

                  <InputField label={t("auth.signup.email")} icon={<EmailIcon />}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("auth.login.emailPlaceholder")}
                      required
                      className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                    />
                  </InputField>

                  <InputField label={t("auth.signup.password")} icon={<LockIcon />}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("auth.signup.passwordPlaceholder")}
                      required
                      className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-[#aaa] hover:text-[#777]"
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </InputField>

                  <InputField label={t("auth.signup.confirmPassword")} icon={<LockIcon />}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                      required
                      className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="text-[#aaa] hover:text-[#777]"
                    >
                      <EyeIcon off={showConfirmPassword} />
                    </button>
                  </InputField>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#ccc] accent-[#9d003b] shrink-0"
                    />
                    <span className="text-[13px] text-[#666] leading-relaxed">
                      {t("auth.signup.agreeTerms")}{" "}
                      <Link href="#" className="text-[#9d003b] underline hover:no-underline">
                        {t("auth.signup.termsOfService")}
                      </Link>{" "}
                      {t("auth.signup.and")}{" "}
                      <Link href="#" className="text-[#9d003b] underline hover:no-underline">
                        {t("auth.signup.privacyPolicy")}
                      </Link>
                    </span>
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
                    {loading ? t("auth.signup.submitting") : (
                      <>
                        {t("auth.signup.submit")}
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-[14px] text-[#777]">
                  {t("auth.signup.hasAccount")}{" "}
                  <Link href="/login" className="font-semibold text-[#9d003b] hover:underline">
                    {t("auth.signup.signIn")}
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
