"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import type { InfluencerProfile } from "@/lib/influencers";
import {
  INFLUENCER_CATEGORY_KEYS,
  type InfluencerCategoryKey,
} from "@/lib/mock-influencers";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-6 w-1 shrink-0 rounded-full bg-[#9d003b]" />
      <h2 className="text-[17px] sm:text-[18px] font-extrabold tracking-tight text-[#111]">
        {children}
      </h2>
    </div>
  );
}

function ProfileAvatar({
  name,
  avatarUrl,
  fallbackClass,
  size = "lg",
}: {
  name: string;
  avatarUrl?: string | null;
  fallbackClass?: string;
  size?: "lg" | "md";
}) {
  const dim =
    size === "lg"
      ? "h-20 w-20 sm:h-24 sm:w-24 text-2xl sm:text-3xl"
      : "h-14 w-14 text-xl";
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-2xl bg-[#fce8ee] bg-cover bg-center shadow-sm ring-2 ring-white ${dim}`}
        style={{ backgroundImage: `url(${avatarUrl})` }}
        role="img"
        aria-label={name}
      />
    );
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-2xl font-bold text-[#9d003b] shadow-sm ring-2 ring-white ${dim} ${
        fallbackClass ?? "bg-[#fce8ee]"
      }`}
    >
      {initial}
    </div>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 11 11" fill="#F59E0B" aria-hidden>
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

function formatMemberSince(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

const KNOWN_CATEGORIES = new Set<string>(INFLUENCER_CATEGORY_KEYS);

type Props = {
  influencer: InfluencerProfile;
};

export default function InfluencerDetailContent({ influencer }: Props) {
  const { t } = useLanguage();
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

  const memberSince = formatMemberSince(influencer.createdAt);
  const hasRating = influencer.averageRating > 0 || influencer.reviewCount > 0;
  const about =
    influencer.about?.trim() || t("influencerDetail.noDescription");

  function categoryLabel(raw: string): string {
    const key = raw.toLowerCase();
    if (KNOWN_CATEGORIES.has(key)) {
      return t(`categories.${key as InfluencerCategoryKey}`);
    }
    return raw;
  }

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col bg-[#f5f5f3]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(157,0,59,0.10)_0%,rgba(157,0,59,0.05)_25%,rgba(157,0,59,0.03)_40%,rgba(214,238,58,0.08)_55%,rgba(214,238,58,0.14)_100%)]"
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
            {t("influencerDetail.back")}
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9d003b]/20 bg-[#9d003b]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9d003b]">
                    {t("influencerDetail.role")}
                  </span>
                  {hasRating && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff2f] px-3 py-1.5 text-[12px] font-medium leading-none text-[#333]">
                      <StarIcon />
                      {influencer.averageRating.toFixed(1)}
                      {influencer.reviewCount > 0 && (
                        <span className="text-[#666]">
                          ({influencer.reviewCount})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <ProfileAvatar
                    name={influencer.name}
                    avatarUrl={influencer.avatarUrl}
                    fallbackClass={influencer.avatarFallbackClass}
                  />
                  <div className="min-w-0 pt-1">
                    <h1 className="text-[1.75rem] sm:text-3xl lg:text-[2.45rem] font-extrabold leading-[1.25] tracking-tight text-[#111]">
                      {influencer.name}
                    </h1>
                    <p className="mt-2 truncate text-[14px] text-[#666]">
                      {influencer.handle}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4 }}
                className="mt-8 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <SectionHeading>{t("influencerDetail.about")}</SectionHeading>
                <p className="text-[15px] leading-[1.85] text-[#333] whitespace-pre-line">
                  {about}
                </p>
                {influencer.contentCategories.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {influencer.contentCategories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-lg border border-[#9d003b]/15 bg-[#9d003b]/5 px-3 py-1.5 text-[12px] font-semibold text-[#9d003b]"
                      >
                        {categoryLabel(cat)}
                      </span>
                    ))}
                  </div>
                )}
              </motion.section>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.4 }}
                  className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <SectionHeading>
                    {t("influencerDetail.platforms")}
                  </SectionHeading>
                  {influencer.platforms.length === 0 ? (
                    <p className="text-[14px] text-[#888]">
                      {t("influencerDetail.emptyPlatforms")}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {influencer.platforms.map((platform, i) => (
                        <motion.li
                          key={platform}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.28 + i * 0.05 }}
                          className="flex items-center gap-3 rounded-xl bg-[#f5f5f3] px-3.5 py-3"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#9d003b]/10 text-[12px] font-bold text-[#9d003b]">
                            {i + 1}
                          </span>
                          <span className="text-[14px] font-medium text-[#333]">
                            {platform}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <SectionHeading>
                    {t("influencerDetail.languages")}
                  </SectionHeading>
                  {influencer.languages.length === 0 ? (
                    <p className="text-[14px] text-[#888]">
                      {t("influencerDetail.emptyLanguages")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {influencer.languages.map((lang) => (
                        <span
                          key={lang}
                          className="rounded-xl bg-[#f5f5f3] px-3.5 py-2 text-[13px] font-semibold text-[#333]"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.section>
              </div>

              {influencer.otherPhotos.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.4 }}
                  className="mt-5 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                >
                  <SectionHeading>
                    {t("influencerDetail.photos")}
                  </SectionHeading>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {influencer.otherPhotos.map((photo, i) => (
                      <div
                        key={`${photo}-${i}`}
                        className="aspect-square overflow-hidden rounded-xl bg-[#f5f5f3] bg-cover bg-center"
                        style={{ backgroundImage: `url(${photo})` }}
                        role="img"
                        aria-label={`${influencer.name} photo ${i + 1}`}
                      />
                    ))}
                  </div>
                </motion.section>
              )}
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
                    <ProfileAvatar
                      name={influencer.name}
                      avatarUrl={influencer.avatarUrl}
                      fallbackClass={influencer.avatarFallbackClass}
                      size="md"
                    />
                    <div className="min-w-0 w-full">
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9d003b]">
                        {t("influencerDetail.role")}
                      </p>
                      <p className="mt-1 truncate text-[16px] font-bold text-[#111]">
                        {influencer.name}
                      </p>
                      <p className="mt-0.5 truncate text-[13px] text-[#888]">
                        {influencer.handle}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-[#f0f0f0]">
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("influencerDetail.rating")}
                      </p>
                      <p className="mt-1 flex items-center gap-1 truncate text-[13px] font-bold text-[#222]">
                        {hasRating ? (
                          <>
                            <StarIcon />
                            {influencer.averageRating.toFixed(1)}
                          </>
                        ) : (
                          "—"
                        )}
                      </p>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("common.reviews")}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-bold text-[#222]">
                        {influencer.reviewCount}
                      </p>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("influencerDetail.age")}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-bold text-[#222]">
                        {influencer.age ?? "—"}
                      </p>
                    </div>
                    <div className="px-4 py-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("influencerDetail.memberSince")}
                      </p>
                      <p className="mt-1 truncate text-[13px] font-bold text-[#222]">
                        {memberSince ?? "—"}
                      </p>
                    </div>
                  </div>

                  {influencer.email && (
                    <div className="border-t border-[#f0f0f0] px-5 py-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                        {t("influencerDetail.contact")}
                      </p>
                      <a
                        href={`mailto:${influencer.email}`}
                        className="mt-1 block truncate text-[13px] font-semibold text-[#9d003b] hover:underline"
                      >
                        {influencer.email}
                      </a>
                    </div>
                  )}

                  <div className="space-y-2.5 border-t border-[#f0f0f0] p-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        window.location.href = `/invites/new?influencerId=${encodeURIComponent(influencer.id)}&name=${encodeURIComponent(influencer.name)}`;
                      }}
                      className="flex h-11 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] transition-colors"
                    >
                      {t("influencerDetail.hireInfluencer")}
                    </motion.button>
                    {influencer.email ? (
                      <motion.a
                        href={`mailto:${influencer.email}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-[#9d003b]/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
                      >
                        {t("influencerDetail.sendMessage")}
                      </motion.a>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-[#9d003b]/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
                      >
                        {t("influencerDetail.sendMessage")}
                      </motion.button>
                    )}
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
