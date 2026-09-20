"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-provider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 700);
  }

  return (
    <div className="w-full max-w-[460px]">
      <Link
        href="/login"
        className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-[#777] hover:text-[#333] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t("auth.forgotPassword.backToLogin")}
      </Link>

      <h1 className="text-[28px] font-bold text-[#111] tracking-tight">
        {t("auth.forgotPassword.title")}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#777]">
        {t("auth.forgotPassword.subtitle")}
      </p>

      {submitted ? (
        <div className="mt-8 rounded-2xl border border-brand/20 bg-brand-tint px-5 py-5 text-center">
          <p className="text-[15px] font-semibold text-brand">
            {t("auth.forgotPassword.successTitle")}
          </p>
          <p className="mt-1 text-[13px] text-[#777]">
            {t("auth.forgotPassword.successMessage", { email })}{" "}
            <span className="font-medium">{t("auth.forgotPassword.successExpiry")}</span>.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center justify-center gap-2 h-[44px] w-full rounded-xl bg-brand text-[14px] font-semibold text-white hover:bg-brand-hover transition-colors"
          >
            {t("auth.forgotPassword.backToSignIn")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <div>
            <label className="block text-[14px] font-medium text-[#333] mb-1.5">
              {t("auth.forgotPassword.email")}
            </label>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#ddd] bg-white px-3.5 py-3 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#aaa]">
                <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M1 5.5L8 10L15 5.5" stroke="currentColor" strokeWidth="1.4" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.forgotPassword.emailPlaceholder")}
                required
                className="flex-1 bg-transparent text-[14px] text-[#111] outline-none placeholder:text-[#bbb]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 h-[48px] w-full rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? t("auth.forgotPassword.submitting") : (
              <>
                {t("auth.forgotPassword.submit")}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>

          <div className="flex items-start gap-3 rounded-xl border border-[#e8e4da] bg-[#faf8f3] px-4 py-3">
            <span className="text-base leading-none mt-0.5">💡</span>
            <p className="text-[13px] leading-relaxed text-[#666]">
              {t("auth.forgotPassword.tip")}{" "}
              <span className="font-semibold text-[#333]">
                {t("auth.forgotPassword.tipExpiry")}
              </span>.
            </p>
          </div>
        </form>
      )}

      <p className="mt-7 text-center text-[14px] text-[#777]">
        {t("auth.forgotPassword.remembered")}{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {t("auth.forgotPassword.signIn")}
        </Link>
      </p>
    </div>
  );
}
