"use client";

import Link from "next/link";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { formatBudgetRange, formatPosted } from "@/lib/mock-jobs";
import type { Entrepreneur } from "@/lib/mock-entrepreneurs";
import type { Job } from "@/lib/mock-jobs";

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 11 11" fill="#F59E0B">
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

type Props = {
  entrepreneur: Entrepreneur;
  jobs: Job[];
};

export default function EntrepreneurDetailContent({ entrepreneur, jobs }: Props) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f5f5f3]">
      <MainHeader />

      {/* Top bar */}
      <div className="mx-auto max-w-5xl px-4 sm:px-8 pt-5 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#555] hover:bg-[#eee] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("jobDetail.back")}
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-8 py-4 sm:py-6 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-[#eee] bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <div className={`h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl ${entrepreneur.avatarBg}`} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[20px] sm:text-[22px] font-black text-[#111]">
                  {entrepreneur.name}
                </h1>
                {entrepreneur.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[11px] font-semibold text-[#059669]">
                    ✓ {t("common.verified")}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#666]">
                <StarIcon />
                <span className="font-semibold text-[#111]">{entrepreneur.rating}</span>
                <span>({entrepreneur.reviews} {t("common.reviews")})</span>
              </div>
              <a
                href={`https://${entrepreneur.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[13px] text-[#888] hover:text-[#9d003b]"
              >
                🌐 {entrepreneur.website}
              </a>
            </div>
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-[#555]">{entrepreneur.about}</p>

          <a
            href={`https://${entrepreneur.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-[#9d003b] hover:underline"
          >
            {t("jobDetail.visitWebsite")}
          </a>
        </div>

        {/* Active jobs */}
        {jobs.length > 0 && (
          <section>
            <h2 className="text-[16px] font-bold text-[#111] mb-3">
              Active Campaigns ({jobs.length})
            </h2>
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-[#eee] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`h-14 w-14 shrink-0 rounded-xl ${job.thumbnailBg}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-bold text-[#111]">{job.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-[12px] text-[#888]">{job.description}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px]">
                      <span className="font-bold text-[#9d003b]">
                        {formatBudgetRange(job.budgetMin, job.budgetMax)}
                      </span>
                      <span className="text-[#aaa]">·</span>
                      <span className="text-[#888]">{job.platform}</span>
                      <span className="text-[#aaa]">·</span>
                      <span className="text-[#888]">{formatPosted(job.postedDaysAgo)}</span>
                    </div>
                  </div>
                  <svg className="shrink-0 text-[#ccc]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3L10 8L5 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
