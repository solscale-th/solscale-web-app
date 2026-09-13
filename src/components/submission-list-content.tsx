"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import {
  MOCK_SUBMISSIONS,
  MOCK_RECEIVED_SUBMISSIONS,
  formatSubmitted,
  type Submission,
  type ReceivedSubmission,
} from "@/lib/mock-submissions";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import { logJobList } from "@/lib/jobs";
import { getSeenSubmissionIds, markSubmissionSeen, SEEN_SUBMISSION_EVENT } from "@/lib/seen-submissions";
import { resolveJobDetailHref } from "@/lib/job-detail-href";
import type { FlowEngagement } from "@/lib/flowchart/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "dateAdded" | "name" | "updatedDate";

const SUBMITTED_STATUSES = new Set<FlowEngagement["workStatus"]>([
  "submitted",
  "revision_requested",
  "approved",
]);

// ─── Update dot ───────────────────────────────────────────────────────────────

function UpdateDot() {
  return (
    <span className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2d55] opacity-75" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#ff2d55]" />
    </span>
  );
}

// ─── Influencer card: submitted job ──────────────────────────────────────────

function SubmissionCard({
  submission,
  seen,
  detailHref,
}: {
  submission: Submission;
  seen: boolean;
  detailHref: string;
}) {
  const { t } = useLanguage();
  const job = MOCK_JOBS.find((j) => j.id === submission.jobId);
  if (!job) return null;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {submission.hasUpdate && !seen && <UpdateDot />}

      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`} />

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">{job.title}</h3>
        <p className="text-[12px] text-[#888]">{job.company}</p>
        <p className="text-[11px] text-[#999]">
          {t("submission.submittedLabel")}: {formatSubmitted(submission.submittedDaysAgo)}
        </p>

        <div className="mt-auto pt-1">
          <Link
            href={detailHref}
            onClick={() => { if (submission.hasUpdate) markSubmissionSeen(submission.id); }}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("myJob.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Entrepreneur card: received submission ───────────────────────────────────

function ReceivedSubmissionCard({
  item,
  seen,
  detailHref,
}: {
  item: ReceivedSubmission;
  seen: boolean;
  detailHref: string;
}) {
  const { t } = useLanguage();
  const job = MOCK_JOBS.find((j) => j.id === item.jobId);
  if (!job) return null;

  const initials = item.influencerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {item.hasUpdate && !seen && <UpdateDot />}

      <div className={`relative flex h-28 items-center justify-center overflow-hidden rounded-t-2xl ${item.influencerAvatarBg}`}>
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white/80 text-2xl font-black text-[#9d003b]">
          {initials}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div>
          <h3 className="text-[14px] font-bold text-[#111]">{item.influencerName}</h3>
          <p className="text-[12px] text-[#888]">{item.influencerHandle}</p>
        </div>
        <p className="line-clamp-1 text-[11px] text-[#999]">
          {t("submission.submittedTo")}: {job.title}
        </p>
        <p className="text-[11px] text-[#999]">
          {t("submission.submittedLabel")}: {formatSubmitted(item.submittedDaysAgo)}
        </p>

        <div className="mt-auto pt-1">
          <Link
            href={detailHref}
            onClick={() => { if (item.hasUpdate) markSubmissionSeen(item.id); }}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("submission.viewProfile")}
          </Link>
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

export default function SubmissionListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state } = useFlowchart();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setSeenIds(new Set(getSeenSubmissionIds()));
    sync();
    window.addEventListener(SEEN_SUBMISSION_EVENT, sync);
    return () => window.removeEventListener(SEEN_SUBMISSION_EVENT, sync);
  }, []);

  const resolveHref = useMemo(() => {
    if (!user) {
      return () => "/";
    }
    return (jobId: string, influencerId?: string) =>
      resolveJobDetailHref(jobId, state.engagements, {
        userId: user.id,
        role: user.role,
        influencerId,
      });
  }, [user, state.engagements]);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title    = isInfluencer ? t("submission.influencerTitle")    : t("submission.entrepreneurTitle");
  const subtitle = isInfluencer ? t("submission.influencerSubtitle") : t("submission.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded",   label: t("submission.sortDateAdded")   },
    { key: "name",        label: t("submission.sortName")        },
    { key: "updatedDate", label: t("submission.sortUpdatedDate") },
  ];

  const notifFirst = (aHas: boolean, aId: string, bHas: boolean, bId: string) => {
    const aUnseen = aHas && !seenIds.has(aId);
    const bUnseen = bHas && !seenIds.has(bId);
    if (aUnseen && !bUnseen) return -1;
    if (!aUnseen && bUnseen) return  1;
    return 0;
  };

  const liveSubs: Submission[] = isInfluencer
    ? state.engagements
        .filter(
          (eng) =>
            eng.influencerId === user.id &&
            SUBMITTED_STATUSES.has(eng.workStatus)
        )
        .map((eng) => ({
          id: eng.id,
          jobId: eng.jobId,
          submittedDaysAgo: 0,
          updatedDaysAgo: 0,
          hasUpdate: eng.workStatus === "submitted" || eng.workStatus === "revision_requested",
        }))
    : [];

  const seedSubs = isInfluencer
    ? (MOCK_SUBMISSIONS[user.id] ?? MOCK_SUBMISSIONS["1"] ?? [])
    : [];

  const rawSubs = [
    ...liveSubs,
    ...seedSubs.filter(
      (sub) => !liveSubs.some((live) => live.id === sub.id || live.jobId === sub.jobId)
    ),
  ];

  const sortedSubs = [...rawSubs].sort((a, b) => {
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.submittedDaysAgo - b.submittedDaysAgo;
    }
    if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
    if (sortKey === "name") {
      const jobA = MOCK_JOBS.find((j) => j.id === a.jobId);
      const jobB = MOCK_JOBS.find((j) => j.id === b.jobId);
      return (jobA?.title ?? "").localeCompare(jobB?.title ?? "");
    }
    return 0;
  });

  const liveReceived: ReceivedSubmission[] = isInfluencer
    ? []
    : state.engagements
        .filter(
          (eng) =>
            eng.entrepreneurId === user.id &&
            eng.workStatus === "submitted"
        )
        .map((eng) => ({
          id: eng.id,
          jobId: eng.jobId,
          influencerId: eng.influencerId,
          influencerName: eng.influencerName,
          influencerHandle: eng.influencerHandle,
          influencerAvatarBg: eng.influencerAvatarBg,
          submittedDaysAgo: 0,
          updatedDaysAgo: 0,
          hasUpdate: true,
        }));

  const seedReceived = isInfluencer
    ? []
    : (MOCK_RECEIVED_SUBMISSIONS[user.id] ?? MOCK_RECEIVED_SUBMISSIONS["2"] ?? []);

  const rawReceived = [
    ...liveReceived,
    ...seedReceived.filter(
      (item) =>
        !liveReceived.some(
          (live) =>
            live.id === item.id ||
            (live.jobId === item.jobId && live.influencerId === item.influencerId)
        )
    ),
  ];

  const sortedReceived = [...rawReceived].sort((a, b) => {
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.submittedDaysAgo - b.submittedDaysAgo;
    }
    if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
    if (sortKey === "name")        return a.influencerName.localeCompare(b.influencerName);
    return 0;
  });

  const isEmpty = isInfluencer ? sortedSubs.length === 0 : sortedReceived.length === 0;

  logJobList("submission", {
    role: user.role,
    count: isInfluencer ? sortedSubs.length : sortedReceived.length,
    jobs: (isInfluencer ? sortedSubs : sortedReceived).map((item) => {
      const job = MOCK_JOBS.find((entry) => entry.id === item.jobId);
      return {
        id: item.id,
        jobId: item.jobId,
        title: job?.title ?? null,
        company: job?.company ?? null,
      };
    }),
  });

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainHeader />

      <section className="flex-1 px-4 pb-16 pt-10 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-[17px] font-bold text-[#111]">{title}</h1>
              <p className="text-[13px] text-[#888]">{subtitle}</p>
            </div>
            <SortDropdown value={sortKey} onChange={setSortKey} options={sortOptions} label={t("submission.sortBy")} />
          </div>

          {isEmpty ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("submission.empty")}</p>
          ) : isInfluencer ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedSubs.map((sub) => (
                <SubmissionCard
                  key={sub.id}
                  submission={sub}
                  seen={seenIds.has(sub.id)}
                  detailHref={resolveHref(sub.jobId)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedReceived.map((item) => (
                <ReceivedSubmissionCard
                  key={item.id}
                  item={item}
                  seen={seenIds.has(item.id)}
                  detailHref={resolveHref(item.jobId, item.influencerId)}
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
