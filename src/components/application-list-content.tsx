"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { getSeenIds, markSeen, SEEN_CHANGE_EVENT } from "@/lib/seen-applications";
import {
  MOCK_INFLUENCER_APPLICATIONS,
  MOCK_ENTREPRENEUR_POSTINGS,
  formatApplied,
  type ApplicationStatus,
  type JobPostingStatus,
  type InfluencerApplication,
  type EntrepreneurPosting,
} from "@/lib/mock-applications";
import {
  MOCK_JOBS,
  formatBudgetRange,
  type Job,
} from "@/lib/mock-jobs";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "dateAdded" | "name" | "updatedDate";

// ─── Status styles ────────────────────────────────────────────────────────────

const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending:  "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100   text-red-600",
};

const POSTING_STATUS_STYLES: Record<JobPostingStatus, string> = {
  active: "bg-green-100 text-green-700",
  closed: "bg-gray-100  text-gray-500",
  draft:  "bg-blue-100  text-blue-600",
};

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

// ─── Update dot (pulsing, top-right of the card) ──────────────────────────────

function UpdateDot() {
  return (
    <span className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2d55] opacity-75" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#ff2d55]" />
    </span>
  );
}

// ─── Influencer card ──────────────────────────────────────────────────────────

function InfluencerApplicationCard({
  app,
  job,
  statusLabel,
  seen,
}: {
  app: InfluencerApplication;
  job: Job;
  statusLabel: string;
  seen: boolean;
}) {
  const { t } = useLanguage();
  const showDot = app.hasUpdate && !seen;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {showDot && <UpdateDot />}

      {/* Top banner */}
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        <span className="absolute right-2.5 top-2.5">
          <StatusPill label={statusLabel} className={APPLICATION_STATUS_STYLES[app.status]} />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">{job.title}</h3>
        <p className="text-[12px] text-[#888]">{job.company}</p>

        <p className="text-[11px] text-[#999]">
          {t("applications.appliedLabel")}: {formatApplied(app.appliedDaysAgo)}
        </p>
        <p className="text-[12px] font-semibold text-[#333]">
          {formatBudgetRange(job.budgetMin, job.budgetMax)}
        </p>

        <div className="mt-auto pt-1">
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => { if (app.hasUpdate) markSeen(app.id); }}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("applications.viewJob")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Entrepreneur card ────────────────────────────────────────────────────────

function EntrepreneurPostingCard({
  posting,
  job,
  statusLabel,
  seen,
}: {
  posting: EntrepreneurPosting;
  job: Job;
  statusLabel: string;
  seen: boolean;
}) {
  const { t } = useLanguage();
  const showDot = posting.hasUpdate && !seen;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {showDot && <UpdateDot />}

      {/* Top banner */}
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        <span className="absolute right-2.5 top-2.5">
          <StatusPill label={statusLabel} className={POSTING_STATUS_STYLES[posting.status]} />
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">{job.title}</h3>
        <p className="text-[12px] text-[#888]">📍 {job.location} · {job.duration}</p>

        <p className="text-[11px] text-[#999]">
          {t("applications.postedLabel")}: {formatApplied(posting.postedDaysAgo)}
          &nbsp;·&nbsp;
          <strong className="text-[#555]">{posting.applicants}</strong> {t("applications.applicantsLabel")}
        </p>
        <p className="text-[12px] font-semibold text-[#333]">
          {formatBudgetRange(job.budgetMin, job.budgetMax)}
        </p>

        <div className="mt-auto pt-1">
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => { if (posting.hasUpdate) markSeen(posting.id); }}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("applications.viewJob")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Sort button ──────────────────────────────────────────────────────────────

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
        className="flex items-center gap-1.5 rounded-lg border border-[#eee] bg-white px-3 py-1.5 text-[13px] font-medium text-[#555] hover:border-[#ccc] transition-colors"
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

export default function ApplicationListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  // Stay in sync with localStorage seen state (also handles back-navigation)
  useEffect(() => {
    const sync = () => setSeenIds(new Set(getSeenIds()));
    sync();
    window.addEventListener(SEEN_CHANGE_EVENT, sync);
    return () => window.removeEventListener(SEEN_CHANGE_EVENT, sync);
  }, []);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";

  const title    = isInfluencer ? t("applications.influencerTitle")    : t("applications.entrepreneurTitle");
  const subtitle = isInfluencer ? t("applications.influencerSubtitle") : t("applications.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded",   label: t("applications.sortDateAdded")   },
    { key: "name",        label: t("applications.sortName")        },
    { key: "updatedDate", label: t("applications.sortUpdatedDate") },
  ];

  // Returns -1/0/1: unseen notifications always float to the top first
  const notifFirst = (aHas: boolean, aId: string, bHas: boolean, bId: string) => {
    const aUnseen = aHas && !seenIds.has(aId);
    const bUnseen = bHas && !seenIds.has(bId);
    if (aUnseen && !bUnseen) return -1;
    if (!aUnseen && bUnseen) return  1;
    return 0;
  };

  /* ── Sorted influencer list ── */
  const rawApps = isInfluencer ? (MOCK_INFLUENCER_APPLICATIONS[user.id] ?? MOCK_INFLUENCER_APPLICATIONS["1"] ?? []) : [];
  const sortedApps = [...rawApps].sort((a, b) => {
    // Notification items always come first on the default sort
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.appliedDaysAgo - b.appliedDaysAgo;
    }
    const jobA = MOCK_JOBS.find((j) => j.id === a.jobId);
    const jobB = MOCK_JOBS.find((j) => j.id === b.jobId);
    if (sortKey === "name")        return (jobA?.title ?? "").localeCompare(jobB?.title ?? "");
    if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
    return 0;
  });

  /* ── Sorted entrepreneur list ── */
  const rawPostings = isInfluencer ? [] : (MOCK_ENTREPRENEUR_POSTINGS[user.id] ?? MOCK_ENTREPRENEUR_POSTINGS["2"] ?? []);
  const sortedPostings = [...rawPostings].sort((a, b) => {
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.postedDaysAgo - b.postedDaysAgo;
    }
    const jobA = MOCK_JOBS.find((j) => j.id === a.jobId);
    const jobB = MOCK_JOBS.find((j) => j.id === b.jobId);
    if (sortKey === "name")        return (jobA?.title ?? "").localeCompare(jobB?.title ?? "");
    if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
    return 0;
  });

  const isEmpty = isInfluencer ? sortedApps.length === 0 : sortedPostings.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainHeader />

      <section className="flex-1 px-4 pb-16 pt-10 sm:px-8">
        <div className="mx-auto max-w-7xl">

          {/* Section header + sort */}
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-bold text-[#111]">{title}</h1>
              <p className="text-[13px] text-[#888]">{subtitle}</p>
            </div>
            <SortDropdown
              value={sortKey}
              onChange={setSortKey}
              options={sortOptions}
              label={t("applications.sortBy")}
            />
          </div>

          {/* Grid */}
          {isEmpty ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("applications.empty")}</p>
          ) : isInfluencer ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedApps.map((app) => {
                const job = MOCK_JOBS.find((j) => j.id === app.jobId);
                if (!job) return null;
                const statusLabel =
                  app.status === "pending"  ? t("applications.statusPending")  :
                  app.status === "accepted" ? t("applications.statusAccepted") :
                                              t("applications.statusRejected");
                return (
                  <InfluencerApplicationCard key={app.id} app={app} job={job} statusLabel={statusLabel} seen={seenIds.has(app.id)} />
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedPostings.map((posting) => {
                const job = MOCK_JOBS.find((j) => j.id === posting.jobId);
                if (!job) return null;
                const statusLabel =
                  posting.status === "active" ? t("applications.statusActive") :
                  posting.status === "closed" ? t("applications.statusClosed") :
                                                t("applications.statusDraft");
                return (
                  <EntrepreneurPostingCard key={posting.id} posting={posting} job={job} statusLabel={statusLabel} seen={seenIds.has(posting.id)} />
                );
              })}
            </div>
          )}

        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
