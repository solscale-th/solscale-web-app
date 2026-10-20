"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { markMyJobSeen } from "@/lib/seen-my-jobs";
import {
  fetchMyAcceptedJobs,
  logJobList,
  mapApiJobToJob,
  type ApiJob,
} from "@/lib/jobs";
import {
  fetchMyEngagements,
  mapApiEngagementToFlow,
  mapApiWorkStatus,
  type ApiEngagement,
} from "@/lib/engagements";
import {
  canSubmitWork,
  WORK_STATUS_LABELS,
  type WorkStatus,
} from "@/lib/engagements";
import { formatOfferPrice } from "@/lib/job";
import { jobDetailHref } from "@/lib/job-detail-href";

type SortKey = "dateAdded" | "name" | "updatedDate";

type AcceptedJobCard = {
  api: ApiJob;
  job: ReturnType<typeof mapApiJobToJob>;
  acceptedDaysAgo: number;
  updatedDaysAgo: number;
  engagementId?: string;
  workStatus: WorkStatus;
  checkoutPaid: boolean;
};

function daysAgoFromIso(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function formatAccepted(daysAgo: number): string {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo}d ago`;
}

function EngagementCard({
  item,
  isInfluencer,
}: {
  item: AcceptedJobCard;
  isInfluencer: boolean;
}) {
  const { t } = useLanguage();
  const { job, api, acceptedDaysAgo, engagementId, workStatus, checkoutPaid } = item;
  const statusInfo = WORK_STATUS_LABELS[workStatus];
  const readyToDeliver =
    isInfluencer && checkoutPaid && canSubmitWork(workStatus);
  const workPassed = isInfluencer && workStatus === "approved";

  const detailsHref = engagementId
    ? jobDetailHref(job.id, engagementId)
    : `/jobs/${job.id}`;
  const uploadHref = engagementId
    ? `${jobDetailHref(job.id, engagementId)}&tab=upload`
    : `/jobs/${job.id}?tab=upload`;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        <span
          className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isInfluencer && engagementId
              ? statusInfo.className
              : "bg-green-100 text-green-700 capitalize"
          }`}
        >
          {isInfluencer && engagementId ? statusInfo.en : api.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">
          {job.title}
        </h3>
        <p className="text-[12px] text-[#888]">{job.company || "—"}</p>
        <p className="text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-brand">
          {formatOfferPrice(job.budgetMin, job.budgetMax)}
        </p>
        <p className="text-[11px] text-[#999]">
          {t("myJob.acceptedLabel")}: {formatAccepted(acceptedDaysAgo)}
        </p>

        <div className="mt-auto flex flex-col gap-1.5 pt-1">
          {isInfluencer && readyToDeliver && !workPassed && (
            <Link
              href={uploadHref}
              onClick={() => markMyJobSeen(engagementId ?? job.id)}
              className="block w-full rounded-xl bg-brand px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              {t("myJob.submitWork")}
            </Link>
          )}
          <Link
            href={detailsHref}
            onClick={() => markMyJobSeen(engagementId ?? job.id)}
            className={`block w-full rounded-xl px-3.5 py-2 text-center text-[12px] font-semibold transition-colors ${
              isInfluencer && readyToDeliver && !workPassed
                ? "border border-brand text-brand hover:bg-brand/5"
                : "bg-brand text-white hover:bg-brand-hover"
            }`}
          >
            {t("myJob.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}

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
        <span className="hidden text-[#999] sm:inline">{label}:</span>
        {current}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-[#eee] bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-surface ${
                value === opt.key ? "font-semibold text-brand" : "text-[#333]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function engagementsByJobId(engagements: ApiEngagement[]): Map<number, ApiEngagement> {
  const map = new Map<number, ApiEngagement>();
  for (const engagement of engagements) {
    const existing = map.get(engagement.jobId);
    if (!existing || engagement.id > existing.id) {
      map.set(engagement.jobId, engagement);
    }
  }
  return map;
}

export default function MyJobsListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { dispatch } = useFlowchart();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [jobs, setJobs] = useState<AcceptedJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    const isInfluencer = user.role === "influencer";
    const load = isInfluencer
      ? Promise.all([
          fetchMyAcceptedJobs({ signal: controller.signal }),
          fetchMyEngagements(controller.signal),
        ])
      : fetchMyAcceptedJobs({ signal: controller.signal }).then(
          (apiJobs) => [apiJobs, [] as ApiEngagement[]] as const
        );

    load
      .then(([apiJobs, engagements]) => {
        if (controller.signal.aborted) return;
        const byJob = engagementsByJobId(engagements);
        const mapped = apiJobs.map((api) => {
          const engagement = byJob.get(api.id);
          if (engagement && isInfluencer) {
            dispatch({
              type: "SYNC_ENGAGEMENT",
              engagement: mapApiEngagementToFlow(engagement, {
                influencerName: user.name,
                influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
              }),
            });
          }
          return {
            api,
            job: mapApiJobToJob(api),
            acceptedDaysAgo: daysAgoFromIso(
              engagement?.createdAt ?? api.createdAt
            ),
            updatedDaysAgo: daysAgoFromIso(
              engagement?.updatedAt ?? api.updatedAt ?? api.createdAt
            ),
            engagementId: engagement ? String(engagement.id) : undefined,
            workStatus: mapApiWorkStatus(engagement?.workStatus),
            // API engagements are ready to deliver (no checkout step yet).
            checkoutPaid: Boolean(engagement),
          } satisfies AcceptedJobCard;
        });
        setJobs(mapped);
        logJobList("my-jobs:api", {
          role: user.role,
          count: mapped.length,
          jobs: mapped.map((item) => ({
            id: item.job.id,
            title: item.job.title,
            company: item.job.company,
            status: item.api.status,
            engagementId: item.engagementId,
            workStatus: item.workStatus,
          })),
        });
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setJobs([]);
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [user, dispatch]);

  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => {
      if (sortKey === "dateAdded") return a.acceptedDaysAgo - b.acceptedDaysAgo;
      if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
      if (sortKey === "name") return a.job.title.localeCompare(b.job.title);
      return 0;
    });
    return list;
  }, [jobs, sortKey]);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title = isInfluencer ? t("myJob.influencerTitle") : t("myJob.entrepreneurTitle");
  const subtitle = isInfluencer
    ? t("myJob.influencerSubtitle")
    : t("myJob.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded", label: t("myJob.sortDateAdded") },
    { key: "name", label: t("myJob.sortName") },
    { key: "updatedDate", label: t("myJob.sortUpdatedDate") },
  ];

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
            <SortDropdown
              value={sortKey}
              onChange={setSortKey}
              options={sortOptions}
              label={t("myJob.sortBy")}
            />
          </div>

          {loading ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loading")}</p>
          ) : error ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loadFailed")}</p>
          ) : sortedJobs.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("myJob.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedJobs.map((item) => (
                <EngagementCard
                  key={item.job.id}
                  item={item}
                  isInfluencer={isInfluencer}
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
