"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/language-provider";

type Props = {
  needsEmail: boolean;
  needsCompanyName: boolean;
  onSubmit: (values: { email?: string; companyName?: string }) => Promise<void>;
};

export default function CompleteProfileForm({
  needsEmail,
  needsCompanyName,
  onSubmit,
}: Props) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    (!needsEmail || email.trim() !== "") &&
    (!needsCompanyName || companyName.trim() !== "") &&
    !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    try {
      await onSubmit({
        email: needsEmail ? email.trim() : undefined,
        companyName: needsCompanyName ? companyName.trim() : undefined,
      });
    } catch {
      setError(t("auth.login.profileSaveFailed"));
      setLoading(false);
    }
  }

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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {needsEmail && (
          <div>
            <label className="block text-[14px] font-medium text-[#333] mb-1.5">
              {t("auth.login.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.login.emailPlaceholder")}
              required
              className="w-full rounded-xl border border-[#ddd] bg-white px-3.5 py-3 text-[14px] text-[#111] outline-none focus:border-[#9d003b] focus:ring-1 focus:ring-[#9d003b]"
            />
          </div>
        )}

        {needsCompanyName && (
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
        )}

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
          {loading ? t("auth.login.submitting") : t("auth.login.continueButton")}
        </button>
      </form>
    </div>
  );
}
