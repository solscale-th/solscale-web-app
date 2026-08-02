"use client";

import Link from "next/link";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import {
  formatAvgViews,
  formatFollowers,
  type Influencer,
  type InfluencerCategoryKey,
} from "@/lib/mock-influencers";
import { PLATFORM_COLORS, type Platform } from "@/lib/mock-jobs";

function PlatformBadge({ platform }: { platform: Platform }) {
  const c = PLATFORM_COLORS[platform];
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {platform}
    </span>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 11 11" fill="#F59E0B">
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

type InfluencerDetailContentProps = {
  influencer: Influencer;
  relatedInfluencers: Influencer[];
};

export default function InfluencerDetailContent({
  influencer,
  relatedInfluencers,
}: InfluencerDetailContentProps) {
  const { t, dictionary } = useLanguage();

  const categoryLabel = (key: InfluencerCategoryKey) => t(`categories.${key}`);
  const whyHireIcons = ["✓", "🔒", "💬", "📊"];

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f3]">
      <MainHeader />

      <div className="flex-1">
      {/* Hero */}
      <section className={`relative h-[280px] sm:h-[380px] ${influencer.avatarBg}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.65)_100%)]" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-between px-4 sm:px-8 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-black/40 px-3 sm:px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/55 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("influencerDetail.back")}
            </Link>
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11 1.5L14.5 5V14.5H10.5V10H5.5V14.5H1.5V5L5 1.5H11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 transition-colors">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            {influencer.featured && (
              <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-[#d7ff2f] px-3 py-1 text-[12px] font-bold text-[#333]">
                ✦ {t("influencerDetail.featured")}
              </span>
            )}
            <div className="flex items-end gap-3 sm:gap-4">
              <div className="grid h-16 w-16 sm:h-20 sm:w-20 place-items-center rounded-full bg-white/90 text-2xl sm:text-3xl font-bold text-[#9d003b] shadow-lg shrink-0">
                {influencer.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight text-white">
                    {influencer.name}
                  </h1>
                  {influencer.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                      ✓ {t("common.verified")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[14px] sm:text-[15px] text-white/80">{influencer.handle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-8">
        {/* Sidebar stacks below on mobile, floats right on lg */}
        <div className="flex flex-col-reverse lg:flex-row gap-6 lg:gap-8">

          {/* Left column */}
          <div className="min-w-0 flex-1 space-y-4 sm:space-y-5">
            {/* Profile card */}
            <div className="rounded-2xl border border-[#eee] bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-xl text-xl font-bold text-[#9d003b] ${influencer.avatarBg}`}>
                    {influencer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-[15px] sm:text-[16px] font-bold text-[#111]">{influencer.name}</h2>
                      {influencer.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-semibold text-[#059669]">
                          ✓ {t("common.verified")}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[13px] text-[#666]">
                      <StarIcon />
                      <span className="font-semibold text-[#111]">{influencer.rating}</span>
                      <span>({influencer.reviews} {t("common.reviews")})</span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-[#888]">{influencer.handle}</p>
                  </div>
                </div>
                <PlatformBadge platform={influencer.platform} />
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              {[
                `📍 ${influencer.location}`,
                `${formatFollowers(influencer.followers)} ${t("common.followers")}`,
                `${influencer.engagementRate}% engagement`,
                t("influencerDetail.completedCampaigns", {
                  count: influencer.collaborations,
                }),
              ].map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#555]"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* About */}
            <section className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#111]">{t("influencerDetail.about")}</h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#555]">{influencer.about}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {influencer.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[12px] font-medium text-[#666]"
                  >
                    {categoryLabel(cat)}
                  </span>
                ))}
              </div>
            </section>

            {/* Content Types */}
            <section className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#111]">{t("influencerDetail.contentTypes")}</h3>
              <ol className="mt-4 space-y-3">
                {influencer.contentTypes.map((item, idx) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#fce8ee] text-[12px] font-bold text-[#9d003b]">
                      {idx + 1}
                    </span>
                    <span className="text-[14px] leading-relaxed text-[#555]">{item}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Highlights */}
            <section className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#111]">{t("influencerDetail.highlights")}</h3>
              <ul className="mt-4 space-y-2.5">
                {influencer.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[14px] text-[#555]">
                    <span className="mt-0.5 text-[#059669]">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Audience */}
            <section className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-[16px] font-bold text-[#111]">{t("influencerDetail.audience")}</h3>
              <ul className="mt-4 space-y-2.5">
                {influencer.audienceNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2.5 text-[14px] text-[#555]">
                    <span className="mt-0.5 text-[#9d003b]">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="w-full lg:w-[300px] lg:shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-[#eee] bg-white p-5 shadow-sm">
                <p className="text-[12px] font-medium text-[#888]">{t("influencerDetail.followers")}</p>
                <p className="mt-1 text-[22px] font-black text-[#9d003b]">
                  {formatFollowers(influencer.followers)}
                </p>

                <dl className="mt-4 space-y-2.5 text-[13px]">
                  {[
                    [t("influencerDetail.engagementRate"), `${influencer.engagementRate}%`],
                    [t("influencerDetail.avgViews"), formatAvgViews(influencer.avgViews)],
                    [t("influencerDetail.responseTime"), influencer.responseTime],
                    [
                      t("influencerDetail.collaborations"),
                      t("influencerDetail.completedCampaigns", {
                        count: influencer.collaborations,
                      }),
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-[#888]">{label}</dt>
                      <dd className="font-medium text-[#333] text-right">{value}</dd>
                    </div>
                  ))}
                </dl>

                <button className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] transition-colors">
                  {t("influencerDetail.hireInfluencer")}
                </button>
                <button className="mt-2 flex h-11 w-full items-center justify-center rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors">
                  {t("influencerDetail.sendMessage")}
                </button>
                <button className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  {t("influencerDetail.saveForLater")}
                </button>
              </div>

              <div className="rounded-2xl border border-[#e8e4da] bg-[#faf8f3] p-5">
                <p className="text-[13px] font-bold text-[#333]">{t("influencerDetail.whyHireTitle")}</p>
                <ul className="mt-3 space-y-2.5 text-[12px] text-[#666]">
                  {dictionary.influencerDetail.whyHireItems.map((text, index) => (
                    <li key={text} className="flex items-start gap-2">
                      <span>{whyHireIcons[index]}</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Related influencers */}
        {relatedInfluencers.length > 0 && (
          <section className="mt-10 sm:mt-12">
            <h2 className="text-[17px] font-bold text-[#111]">
              {t("influencerDetail.moreInfluencers", { platform: influencer.platform })}
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedInfluencers.map((related) => (
                <Link
                  key={related.id}
                  href={`/influencers/${related.id}`}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div className={`relative h-36 ${related.avatarBg} flex items-center justify-center`}>
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white/80 text-2xl font-bold text-[#9d003b]">
                      {related.name.charAt(0)}
                    </div>
                    <span className="absolute right-2.5 top-2.5">
                      <PlatformBadge platform={related.platform} />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate text-[13px] font-bold text-[#111]">{related.name}</h3>
                      {related.verified && (
                        <span className="text-[10px] font-semibold text-[#059669]">✓</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#888]">{related.handle}</p>
                    <div className="flex items-center gap-1 text-[11px] text-[#888]">
                      <StarIcon />
                      <span className="font-semibold text-[#333]">{related.rating}</span>
                      <span className="mx-1">·</span>
                      <span>{formatFollowers(related.followers)}</span>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-[#888]">{related.bio}</p>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#999]">📍 {related.location}</span>
                      <span className="rounded-xl bg-[#9d003b] px-3 py-1.5 text-[11px] font-semibold text-white">
                        {t("influencerDetail.viewProfile")}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      </div>

      <SiteFooter />
    </div>
  );
}
