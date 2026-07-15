"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  MOCK_MY_JOBS_INFLUENCER,
  MOCK_MY_JOBS_ENTREPRENEUR,
  WORK_STATUS_LABELS,
  type JobEngagement,
} from "@/lib/mock-my-jobs";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import { getSeenMyJobIds, markMyJobSeen, SEEN_MY_JOBS_EVENT } from "@/lib/seen-my-jobs";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "dateAdded" | "name" | "updatedDate";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAccepted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}

function UpdateDot() {
  return (
    <span className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2d55] opacity-75" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#ff2d55]" />
    </span>
  );
}

// ─── Engagement card ──────────────────────────────────────────────────────────

function EngagementCard({
  engagement,
  isInfluencer,
  seen,
}: {
  engagement: JobEngagement;
  isInfluencer: boolean;
  seen: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const job = MOCK_JOBS.find((j) => j.id === engagement.jobId);
  if (!job) return null;

  const showDot = engagement.hasUpdate && !seen;
  const statusInfo = WORK_STATUS_LABELS[engagement.workStatus];

  const initials = engagement.influencerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleViewJob() {
    if (engagement.hasUpdate) markMyJobSeen(engagement.id);
    router.push(`/jobs/${engagement.jobId}`);
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {showDot && <UpdateDot />}

      {/* Banner */}
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        {/* Work status chip */}
        <span className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.className}`}>
          {statusInfo.en}
        </span>

        {/* For entrepreneur view: show influencer avatar */}
        {!isInfluencer && (
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
            <div className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black text-[#9d003b] ${engagement.influencerAvatarBg}`}>
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white drop-shadow">{engagement.influencerName}</p>
              <p className="text-[10px] text-white/80 drop-shadow">{engagement.influencerHandle}</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">{job.title}</h3>
        <p className="text-[12px] text-[#888]">{job.company}</p>
        <p className="text-[11px] text-[#999]">
          {t("myJob.acceptedLabel")}: {formatAccepted(engagement.acceptedDaysAgo)}
        </p>

        {/* Action buttons */}
        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          <button
            type="button"
            onClick={handleViewJob}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("myJob.viewDetails")}
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handleViewJob}
              className="rounded-xl border border-[#9d003b] px-2 py-1.5 text-[11px] font-semibold text-[#9d003b] transition-colors hover:bg-[#9d003b]/5"
            >
              {isInfluencer ? t("myJob.submitWork") : t("myJob.reviewWork")}
            </button>
            <button
              type="button"
              onClick={handleViewJob}
              className="rounded-xl border border-[#ccc] px-2 py-1.5 text-[11px] font-medium text-[#555] transition-colors hover:bg-[#fafafa]"
            >
              {t("myJob.askQuestion")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
  options,
  label,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
  options: { key: SortKey; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.key === value)?.label ?? "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-[#eee] bg-white px-3 py-1.5 text-[13px] font-medium text-[#555] transition-colors hover:border-[#ccc]"
      >
        <span className="hidden sm:inline text-[#999]">{label}:</span>
        {current}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-[#eee] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`block w-full px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[#fafafa] ${value === opt.key ? "font-semibold text-[#9d003b]" : "text-[#333]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyJobsListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setSeenIds(new Set(getSeenMyJobIds()));
    sync();
    window.addEventListener(SEEN_MY_JOBS_EVENT, sync);
    return () => window.removeEventListener(SEEN_MY_JOBS_EVENT, sync);
  }, []);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title    = isInfluencer ? t("myJob.influencerTitle")    : t("myJob.entrepreneurTitle");
  const subtitle = isInfluencer ? t("myJob.influencerSubtitle") : t("myJob.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded",   label: t("myJob.sortDateAdded")   },
    { key: "name",        label: t("myJob.sortName")        },
    { key: "updatedDate", label: t("myJob.sortUpdatedDate") },
  ];

  const notifFirst = (aHas: boolean, aId: string, bHas: boolean, bId: string) => {
    const aUnseen = aHas && !seenIds.has(aId);
    const bUnseen = bHas && !seenIds.has(bId);
    if (aUnseen && !bUnseen) return -1;
    if (!aUnseen && bUnseen) return  1;
    return 0;
  };

  const rawList = isInfluencer
    ? (MOCK_MY_JOBS_INFLUENCER[user.id] ?? [])
    : (MOCK_MY_JOBS_ENTREPRENEUR[user.id] ?? []);

  const sortedList = [...rawList].sort((a, b) => {
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.acceptedDaysAgo - b.acceptedDaysAgo;
    }
    if (sortKey === "updatedDate") {
      // Sort by most recently updated messages / work status
      const aLatest = a.messages[a.messages.length - 1]?.sentDaysAgo ?? 999;
      const bLatest = b.messages[b.messages.length - 1]?.sentDaysAgo ?? 999;
      return aLatest - bLatest;
    }
    if (sortKey === "name") {
      const jobA = MOCK_JOBS.find((j) => j.id === a.jobId);
      const jobB = MOCK_JOBS.find((j) => j.id === b.jobId);
      return (jobA?.title ?? "").localeCompare(jobB?.title ?? "");
    }
    return 0;
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainHeader />

      <section className="flex-1 px-4 pb-16 pt-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header row */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-bold text-[#111]">{title}</h1>
              <p className="text-[13px] text-[#888]">{subtitle}</p>
            </div>
            <SortDropdown
              value={sortKey}
              onChange={setSortKey}
              options={sortOptions}
              label={t("myJob.sortBy")}
            />
          </div>

          {sortedList.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("myJob.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedList.map((engagement) => (
                <EngagementCard
                  key={engagement.id}
                  engagement={engagement}
                  isInfluencer={isInfluencer}
                  seen={seenIds.has(engagement.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
