"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import type {
  EntrepreneurCampaign,
  EntrepreneurProfile,
} from "@/lib/entrepreneurs";
import { formatBudgetRange, formatPosted } from "@/lib/mock-jobs";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-6 w-1 shrink-0 rounded-full bg-brand" />
      <h2 className="text-[17px] sm:text-[18px] font-extrabold tracking-tight text-[#111]">
        {children}
      </h2>
    </div>
  );
}

function BrandAvatar({
  companyName,
  logoUrl,
  fallbackClass,
  size = "lg",
}: {
  companyName: string;
  logoUrl?: string | null;
  fallbackClass?: string;
  size?: "lg" | "md";
}) {
  const dim = size === "lg" ? "h-20 w-20 sm:h-24 sm:w-24 text-2xl sm:text-3xl" : "h-14 w-14 text-xl";
  const initial = companyName.trim().charAt(0).toUpperCase() || "?";

  if (logoUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-2xl bg-brand-tint bg-cover bg-center shadow-sm ring-2 ring-white ${dim}`}
        style={{ backgroundImage: `url(${logoUrl})` }}
        role="img"
        aria-label={companyName}
      />
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl font-bold text-brand shadow-sm ring-2 ring-white ${dim} ${
        fallbackClass ?? "bg-brand-tint"
      }`}
    >
      {initial}
    </div>
  );
}

function formatBudget(min?: number | null, max?: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return formatBudgetRange(min, max);
  if (min != null) return `฿${min.toLocaleString()}+`;
  return `Up to ฿${max!.toLocaleString()}`;
}

function formatMemberSince(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

type Props = {
  entrepreneur: EntrepreneurProfile;
  campaigns: EntrepreneurCampaign[];
};

export default function EntrepreneurDetailContent({
  entrepreneur,
  campaigns,
}: Props) {
  const { t, dictionary } = useLanguage();
  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const sidebarScrollY = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const sidebarShadow = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [
      "0 6px 28px rgba(0,0,0,0.10)",
      "0 12px 36px rgba(0,0,0,0.16)",
      "0 16px 44px rgba(0,0,0,0.20)",
    ]
  );

  const memberSince = formatMemberSince(entrepreneur.createdAt);
  const description =
    entrepreneur.brandDescription?.trim() ||
    t("entrepreneurDetail.noDescription");

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col bg-[#f5f5f3]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 detail-header-wash"
      />

      <MainHeader />

      <div className="relative flex-1">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 pt-5 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#555] hover:bg-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L4 7L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("entrepreneurDetail.back")}
          </Link>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 pb-12 sm:pb-16 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-10 items-start">
            {/* ── Main column ── */}
            <div className="min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
                    {t("entrepreneurDetail.brand")}
                  </span>
                  {campaigns.length > 0 && (
                    <span className="inline-flex items-center rounded-full bg-accent px-3 py-1.5 text-[12px] font-medium leading-none text-[#333]">
                      {t("entrepreneurDetail.openCampaigns", {
                        count: campaigns.length,
                      })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <BrandAvatar
                    companyName={entrepreneur.companyName}
                    logoUrl={entrepreneur.logoUrl}
                    fallbackClass={entrepreneur.avatarFallbackClass}
                  />
                  <div className="min-w-0 pt-1">
                    <h1 className="text-[1.75rem] sm:text-3xl lg:text-[2.45rem] font-extrabold leading-[1.25] tracking-tight text-[#111]">
                      {entrepreneur.companyName}
                    </h1>
                    {entrepreneur.email && (
                      <p className="mt-2 truncate text-[14px] text-[#666]">
                        {entrepreneur.email}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="mt-8 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <SectionHeading>{t("entrepreneurDetail.aboutBrand")}</SectionHeading>
                <p className="text-[15px] leading-[1.85] text-[#333] whitespace-pre-line">
                  {description}
                </p>
              </motion.section>

              <motion.section
                id="active-campaigns"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.4 }}
                className="mt-5 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <SectionHeading>
                  {t("entrepreneurDetail.activeCampaigns")}
                  {campaigns.length > 0 ? ` (${campaigns.length})` : ""}
                </SectionHeading>

                {campaigns.length === 0 ? (
                  <p className="rounded-xl bg-[#f5f5f3] px-4 py-8 text-center text-[14px] text-[#888]">
                    {t("entrepreneurDetail.emptyCampaigns")}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {campaigns.map((campaign, i) => {
                      const budget = formatBudget(
                        campaign.budgetMin,
                        campaign.budgetMax
                      );
                      const posted =
                        campaign.postedDaysAgo != null
                          ? formatPosted(campaign.postedDaysAgo)
                          : null;

                      return (
                        <motion.li
                          key={campaign.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <Link
                            href={`/jobs/${campaign.id}`}
                            className="group flex items-center gap-4 rounded-2xl border border-[#eee] bg-[#fafafa] p-4 transition-all hover:border-brand/25 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                          >
                            <div
                              className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl text-[18px] font-bold text-brand ${
                                campaign.thumbnailBg ?? "bg-brand-tint"
                              }`}
                            >
                              {campaign.promoted ? (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 10 10"
                                  fill="currentColor"
                                  aria-hidden
                                >
                                  <path d="M5 0L6.2 3.8H10L7 6.1L8.2 10L5 7.6L1.8 10L3 6.1L0 3.8H3.8L5 0Z" />
                                </svg>
                              ) : (
                                campaign.title.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-[14px] font-bold text-[#111]">
                                  {campaign.title}
                                </p>
                                {campaign.promoted && (
                                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-[#333]">
                                    {t("jobDetail.promoted")}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-[12px] text-[#888]">
                                {campaign.description}
                              </p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
                                {budget && (
                                  <span className="font-bold text-brand">
                                    {budget}
                                  </span>
                                )}
                                {campaign.platform && (
                                  <>
                                    {budget && (
                                      <span className="text-[#ddd]">·</span>
                                    )}
                                    <span className="text-[#888]">
                                      {campaign.platform}
                                    </span>
                                  </>
                                )}
                                {posted && (
                                  <>
                                    <span className="text-[#ddd]">·</span>
                                    <span className="text-[#888]">{posted}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <svg
                              className="shrink-0 text-[#ccc] transition-colors group-hover:text-brand"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M5 3L10 8L5 13"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                )}
              </motion.section>
            </div>

            {/* ── Sticky sidebar ── */}
            <aside className="self-start lg:sticky lg:top-20 lg:z-10">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
              >
                <motion.div
                  style={{ y: sidebarScrollY, boxShadow: sidebarShadow }}
                  className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-white"
                >
                  <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-5 text-center">
                    <BrandAvatar
                      companyName={entrepreneur.companyName}
                      logoUrl={entrepreneur.logoUrl}
                      fallbackClass={entrepreneur.avatarFallbackClass}
                      size="md"
                    />
                    <div className="min-w-0 w-full">
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-brand">
                        {t("jobDetail.aboutBrand")}
                      </p>
                      <p className="mt-1 truncate text-[16px] font-bold text-[#111]">
                        {entrepreneur.companyName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-[#f0f0f0]">
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("entrepreneurDetail.campaigns")}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-bold text-[#222]">
                        {campaigns.length}
                      </p>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("entrepreneurDetail.memberSince")}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-bold text-[#222]">
                        {memberSince ?? "—"}
                      </p>
                    </div>
                  </div>

                  {entrepreneur.email && (
                    <div className="border-t border-[#f0f0f0] px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("entrepreneurDetail.contact")}
                      </p>
                      <a
                        href={`mailto:${entrepreneur.email}`}
                        className="mt-1 block truncate text-[13px] font-semibold text-brand hover:underline"
                      >
                        {entrepreneur.email}
                      </a>
                    </div>
                  )}

                  <div className="space-y-2.5 border-t border-[#f0f0f0] p-4">
                    {campaigns.length > 0 ? (
                      <motion.a
                        href="#active-campaigns"
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white hover:bg-brand-hover transition-colors"
                      >
                        {t("entrepreneurDetail.browseCampaigns")}
                      </motion.a>
                    ) : null}
                    {entrepreneur.email ? (
                      <motion.a
                        href={`mailto:${entrepreneur.email}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-brand/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-brand hover:text-brand transition-colors"
                      >
                        {t("entrepreneurDetail.contactBrand")}
                      </motion.a>
                    ) : null}
                  </div>
                </motion.div>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
