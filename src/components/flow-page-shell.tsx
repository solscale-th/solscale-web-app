"use client";

import Link from "next/link";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";

export function DemoBanner() {
  const { t } = useLanguage();
  return (
    <p className="rounded-xl border border-[#ead9c8] bg-[#fff8ef] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#6a5a4a]">
      {t("flow.demoBanner")}
    </p>
  );
}

export function FlowPage({
  title,
  subtitle,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <MainHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-10 sm:px-8">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#888] hover:text-brand"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("common.back")}
          </Link>
        )}
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#111]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] text-[#777]">{subtitle}</p>}
        </div>
        <DemoBanner />
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function FlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#ece7e1] bg-white p-5 shadow-[0_1px_2px_rgba(40,20,10,0.04)]">
      {children}
    </div>
  );
}

export const fieldClass =
  "w-full rounded-xl border border-[#ddd] bg-white px-3.5 py-3 text-[14px] text-[#111] outline-none focus:border-brand focus:ring-1 focus:ring-brand";

export const primaryBtn =
  "flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40";

export const secondaryBtn =
  "flex h-11 w-full items-center justify-center rounded-xl border border-[#dcd6cf] bg-white text-[14px] font-medium text-[#3a3530] transition-colors hover:border-[#b9b1a8]";
