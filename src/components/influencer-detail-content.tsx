"use client";

import { useRef, useState } from "react";
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
      <span className="h-6 w-1 shrink-0 rounded-full bg-brand" />
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
        className={`shrink-0 overflow-hidden rounded-2xl bg-brand-tint bg-cover bg-center shadow-sm ring-2 ring-white ${dim}`}
        style={{ backgroundImage: `url(${avatarUrl})` }}
        role="img"
        aria-label={name}
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

function StarIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 11 11"
      fill={muted ? "#E5E0DA" : "#F59E0B"}
      aria-hidden
    >
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

function StarRow({ rating, label }: { rating: number; label: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} muted={index >= filled} />
      ))}
    </span>
  );
}

const PROFILE_TABS = ["package", "portfolio", "review"] as const;
type ProfileTab = (typeof PROFILE_TABS)[number];

function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("en-TH")}`;
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
  const [tab, setTab] = useState<ProfileTab>("package");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
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

  const packages = influencer.packages;
  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? null;
  const selectedAddons = influencer.addons.filter((item) =>
    selectedAddonIds.includes(item.id)
  );
  const selectedTotal =
    (selectedPackage?.price ?? 0) +
    selectedAddons.reduce((sum, item) => sum + item.price, 0);

  function toggleAddon(id: string) {
    setSelectedAddonIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function hireHref(): string {
    const params = new URLSearchParams({
      influencerId: influencer.id,
      name: influencer.name,
    });
    if (selectedPackage) {
      params.set("packageId", selectedPackage.id);
      params.set("packageName", t(`influencerDetail.offers.${selectedPackage.tier}`));
      params.set("packagePrice", String(selectedPackage.price));
      params.set(
        "packageDetail",
        selectedPackage.includes.map((include) => categoryLabel(include)).join(" + ")
      );
    }
    if (selectedAddons.length > 0) {
      params.set(
        "addons",
        JSON.stringify(
          selectedAddons.map((item) => ({
            name: t(`influencerDetail.addonKinds.${item.kind}`),
            price: item.price,
          }))
        )
      );
    }
    if (influencer.avatarUrl) params.set("avatar", influencer.avatarUrl);
    if (influencer.avatarFallbackClass) params.set("avatarBg", influencer.avatarFallbackClass);
    const platform = influencer.platforms[0];
    if (platform) params.set("platform", platform);
    return `/invites/new?${params.toString()}`;
  }

  const portfolioCount =
    influencer.portfolio.length + influencer.otherPhotos.length;
  const reviewTotal = Math.max(influencer.reviewCount, influencer.reviews.length);

  function tabCount(key: ProfileTab): number {
    if (key === "package") return packages.length;
    if (key === "portfolio") return portfolioCount;
    return reviewTotal;
  }

  function onTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const current = PROFILE_TABS.indexOf(tab);
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const next =
      PROFILE_TABS[(current + direction + PROFILE_TABS.length) % PROFILE_TABS.length];
    setTab(next);
    document.getElementById(`influencer-tab-${next}`)?.focus();
  }

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-screen flex-col bg-paper"
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
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand">
                    {t("influencerDetail.role")}
                  </span>
                  {hasRating && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-medium leading-none text-[#333]">
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
                        className="rounded-lg border border-brand/15 bg-brand/5 px-3 py-1.5 text-[12px] font-semibold text-brand"
                      >
                        {categoryLabel(cat)}
                      </span>
                    ))}
                  </div>
                )}
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
                className="mt-5 overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div
                  role="tablist"
                  aria-label={influencer.name}
                  className="flex border-b border-[#f0f0f0] bg-surface"
                >
                  {PROFILE_TABS.map((key) => {
                    const selected = tab === key;
                    const count = tabCount(key);
                    return (
                      <button
                        key={key}
                        id={`influencer-tab-${key}`}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        aria-controls={`influencer-panel-${key}`}
                        tabIndex={selected ? 0 : -1}
                        onClick={() => setTab(key)}
                        onKeyDown={onTabKeyDown}
                        className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 px-3 py-3.5 text-[13px] sm:text-[14px] font-semibold transition-colors ${
                          selected
                            ? "border-b-2 border-brand bg-paper text-brand"
                            : "border-b-2 border-transparent text-[#777] hover:text-[#333]"
                        }`}
                      >
                        <span className="truncate">{t(`influencerDetail.tabs.${key}`)}</span>
                        {count > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                              selected ? "bg-brand/10 text-brand" : "bg-surface text-[#888]"
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div
                  id={`influencer-panel-${tab}`}
                  role="tabpanel"
                  aria-labelledby={`influencer-tab-${tab}`}
                  className="p-5 sm:p-7"
                >
                  {tab === "package" && (
                    <div>
                      <p className="mb-4 text-[14px] leading-relaxed text-[#666]">
                        {t("influencerDetail.packageIntro")}
                      </p>
                      {packages.length === 0 ? (
                        <p className="text-[14px] text-[#888]">
                          {t("influencerDetail.emptyPackages")}
                        </p>
                      ) : (
                        <div className="space-y-6">
                          <div role="radiogroup" aria-label={t("influencerDetail.tabs.package")} className="space-y-3">
                            {packages.map((item) => {
                              const selected = item.id === selectedPackageId;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  role="radio"
                                  aria-checked={selected}
                                  onClick={() => setSelectedPackageId(item.id)}
                                  className={`w-full rounded-xl border px-4 py-3.5 text-left transition-colors ${
                                    selected
                                      ? "border-brand bg-brand/5 ring-1 ring-brand"
                                      : "border-[#ebebeb] bg-surface hover:border-brand/40"
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
                                        {t(`influencerDetail.offers.${item.tier}`)}
                                      </p>
                                      <h3 className="mt-1 text-[15px] font-bold text-[#111]">
                                        {item.includes.map((include) => categoryLabel(include)).join(" + ")}
                                      </h3>
                                    </div>
                                    <p className="shrink-0 text-[15px] font-extrabold text-[#111]">
                                      {formatBaht(item.price)}
                                    </p>
                                  </div>
                                  <ul className="mt-2.5 space-y-1 text-[13px] text-[#555]">
                                    <li>
                                      {item.revisions === 1
                                        ? t("influencerDetail.revisionOne", { count: item.revisions })
                                        : t("influencerDetail.revisionMany", { count: item.revisions })}
                                    </li>
                                    <li>
                                      {t("influencerDetail.turnaroundDays", {
                                        days: item.turnaroundDays,
                                      })}
                                    </li>
                                    {item.platform && <li>{item.platform}</li>}
                                  </ul>
                                </button>
                              );
                            })}
                          </div>

                          {influencer.addons.length > 0 && (
                            <div>
                              <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#999]">
                                {t("influencerDetail.addonsTitle")}
                              </h3>
                              <ul className="mt-3 space-y-2">
                                {influencer.addons.map((addon) => {
                                  const checked = selectedAddonIds.includes(addon.id);
                                  return (
                                    <li key={addon.id}>
                                      <label
                                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                                          checked
                                            ? "border-brand bg-brand/5"
                                            : "border-[#ebebeb] bg-surface"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() => toggleAddon(addon.id)}
                                          className="mt-1 accent-brand"
                                        />
                                        <span className="min-w-0 flex-1">
                                          <span className="flex items-start justify-between gap-3">
                                            <span className="text-[14px] font-bold text-[#111]">
                                              {t(`influencerDetail.addonKinds.${addon.kind}`)}
                                            </span>
                                            <span className="shrink-0 text-[14px] font-bold text-brand">
                                              {formatBaht(addon.price)}
                                            </span>
                                          </span>
                                          <span className="mt-1 block text-[13px] leading-relaxed text-[#666]">
                                            {t(`influencerDetail.addonDescs.${addon.kind}`)}
                                          </span>
                                        </span>
                                      </label>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "portfolio" && (
                    <div>
                      <p className="mb-4 text-[14px] leading-relaxed text-[#666]">
                        {t("influencerDetail.portfolioIntro")}
                      </p>
                      {portfolioCount === 0 ? (
                        <p className="text-[14px] text-[#888]">
                          {t("influencerDetail.emptyPortfolio")}
                        </p>
                      ) : (
                        <div className="space-y-5">
                          {influencer.portfolio.length > 0 && (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {influencer.portfolio.map((item) => (
                                <li
                                  key={item.id}
                                  className="overflow-hidden rounded-xl border border-[#ebebeb] bg-surface"
                                >
                                  {item.imageUrl ? (
                                    <div
                                      className="aspect-[16/9] bg-surface bg-cover bg-center"
                                      style={{ backgroundImage: `url(${item.imageUrl})` }}
                                      role="img"
                                      aria-label={item.title}
                                    />
                                  ) : (
                                    <div className="flex aspect-[16/9] items-end bg-brand-tint px-4 py-3">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
                                        {item.platform || t("influencerDetail.role")}
                                      </span>
                                    </div>
                                  )}
                                  <div className="px-4 py-3.5">
                                    <h3 className="text-[14px] font-bold leading-snug text-[#111]">
                                      {item.title}
                                    </h3>
                                    {item.imageUrl && item.platform && (
                                      <p className="mt-1 text-[12px] font-semibold text-brand">
                                        {item.platform}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                          {influencer.otherPhotos.length > 0 && (
                            <div>
                              <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wider text-[#999]">
                                {t("influencerDetail.photos")}
                              </h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {influencer.otherPhotos.map((photo, index) => (
                                  <div
                                    key={`${photo}-${index}`}
                                    className="aspect-square overflow-hidden rounded-xl bg-surface bg-cover bg-center"
                                    style={{ backgroundImage: `url(${photo})` }}
                                    role="img"
                                    aria-label={`${influencer.name} photo ${index + 1}`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === "review" && (
                    <div>
                      <p className="mb-4 text-[14px] leading-relaxed text-[#666]">
                        {t("influencerDetail.reviewIntro")}
                      </p>
                      {reviewTotal === 0 ? (
                        <p className="text-[14px] text-[#888]">
                          {t("influencerDetail.emptyReviews")}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {hasRating && (
                            <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3">
                              <StarRow
                                rating={influencer.averageRating}
                                label={t("influencerDetail.reviewSummary", {
                                  rating: influencer.averageRating.toFixed(1),
                                  count: reviewTotal,
                                })}
                              />
                              <p className="text-[13px] font-semibold text-[#333]">
                                {t("influencerDetail.reviewSummary", {
                                  rating: influencer.averageRating.toFixed(1),
                                  count: reviewTotal,
                                })}
                              </p>
                            </div>
                          )}
                          {influencer.reviews.length === 0 ? (
                            <p className="text-[14px] text-[#888]">
                              {t("influencerDetail.noWrittenReviews")}
                            </p>
                          ) : (
                            <ul className="space-y-3">
                              {influencer.reviews.map((review) => (
                                <li
                                  key={review.id}
                                  className="rounded-xl border border-[#ebebeb] px-4 py-3.5"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-[14px] font-bold text-[#111]">
                                      {review.author}
                                    </p>
                                    <StarRow
                                      rating={review.rating}
                                      label={`${review.rating}`}
                                    />
                                  </div>
                                  <p className="mt-2 text-[14px] leading-relaxed text-[#444]">
                                    {review.comment}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                          className="flex items-center gap-3 rounded-xl bg-surface px-3.5 py-3"
                        >
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-brand/10 text-[12px] font-bold text-brand">
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
                          className="rounded-xl bg-surface px-3.5 py-2 text-[13px] font-semibold text-[#333]"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.section>
              </div>

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
                      <p className="text-[10px] font-semibold tracking-[0.14em] text-brand">
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
                        className="mt-1 block truncate text-[13px] font-semibold text-brand hover:underline"
                      >
                        {influencer.email}
                      </a>
                    </div>
                  )}

                  <div className="space-y-2.5 border-t border-[#f0f0f0] p-4">
                    {selectedPackage && (
                      <div className="space-y-1.5 px-1 pb-1 text-[13px]">
                        <div className="flex items-center justify-between gap-3 text-[#444]">
                          <span className="truncate">
                            {t(`influencerDetail.offers.${selectedPackage.tier}`)}
                          </span>
                          <span className="shrink-0 font-semibold">
                            {formatBaht(selectedPackage.price)}
                          </span>
                        </div>
                        {selectedAddons.map((addon) => (
                          <div
                            key={addon.id}
                            className="flex items-center justify-between gap-3 text-[#666]"
                          >
                            <span className="truncate">
                              {t(`influencerDetail.addonKinds.${addon.kind}`)}
                            </span>
                            <span className="shrink-0">{formatBaht(addon.price)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-2 font-bold text-[#111]">
                          <span>{t("influencerDetail.selectedTotal")}</span>
                          <span>{formatBaht(selectedTotal)}</span>
                        </div>
                      </div>
                    )}
                    {selectedPackage ? (
                      <Link
                        href={hireHref()}
                        className="flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white hover:bg-brand-hover transition-colors"
                      >
                        {t("influencerDetail.hireInfluencer")}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-[#e7e2dc] text-[14px] font-semibold text-[#9a9590]"
                      >
                        {t("influencerDetail.hireInfluencer")}
                      </button>
                    )}
                    {!selectedPackage && (
                      <p className="text-center text-[12px] leading-relaxed text-[#888]">
                        {t("influencerDetail.selectPackageHint")}
                      </p>
                    )}
                    {influencer.email ? (
                      <motion.a
                        href={`mailto:${influencer.email}`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-brand/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-brand hover:text-brand transition-colors"
                      >
                        {t("influencerDetail.sendMessage")}
                      </motion.a>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center rounded-xl border border-brand/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-brand hover:text-brand transition-colors"
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
