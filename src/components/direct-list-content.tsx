"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { formatSent } from "@/lib/direct";
import { formatOfferPrice, postingDateLabel } from "@/lib/job";
import { markDirectSeen } from "@/lib/seen-direct";
import {
  fetchMyRequestedJobs,
  logJobList,
  mapApiJobToJob,
  type ApiJob,
} from "@/lib/jobs";

type SortKey = "dateAdded" | "name" | "updatedDate";

type RequestedJobCard = {
  api: ApiJob;
  job: ReturnType<typeof mapApiJobToJob>;
  isPrivate: boolean;
  sentDaysAgo: number;
  updatedDaysAgo: number;
};

function daysAgoFromIso(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function DirectOfferCard({ item }: { item: RequestedJobCard }) {
  const { t } = useLanguage();
  const { job, api, isPrivate, sentDaysAgo } = item;
  const posting = postingDateLabel({
    duration: job.duration,
    requirements: job.requirements,
    postingDate: api.postingDate,
  });

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            isPrivate ? "bg-[#111]/70 text-white" : "bg-white/80 text-[#333]"
          }`}
        >
          {isPrivate ? t("direct.badgePrivate") : t("direct.badgeOpen")}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">
          {job.title}
        </h3>
        <p className="text-[12px] text-[#888]">{job.company || "—"}</p>
        {isPrivate ? (
          <>
            <p className="text-[20px] font-semibold tabular-nums tracking-[-0.03em] text-brand">
              {formatOfferPrice(job.budgetMin, job.budgetMax)}
            </p>
            {posting ? (
              <p className="text-[13px] font-semibold text-[#141414]">
                {t("flow.hirePostingTime")}: {posting}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-[11px] text-[#999]">
            {t("direct.offeredLabel")}: {formatSent(sentDaysAgo)}
          </p>
        )}

        <div className="mt-auto pt-1">
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => markDirectSeen(job.id)}
            className="block w-full rounded-xl bg-brand px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {t("direct.viewJob")}
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

export default function DirectListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [jobs, setJobs] = useState<RequestedJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    fetchMyRequestedJobs({ signal: controller.signal })
      .then((apiJobs) => {
        if (controller.signal.aborted) return;
        const mapped = apiJobs.map((api) => ({
          api,
          job: mapApiJobToJob(api),
          isPrivate: (api.visibility ?? "private").toLowerCase() === "private",
          sentDaysAgo: daysAgoFromIso(api.createdAt),
          updatedDaysAgo: daysAgoFromIso(api.updatedAt ?? api.createdAt),
        }));
        setJobs(mapped);
        logJobList("direct:api", {
          role: user.role,
          count: mapped.length,
          jobs: mapped.map((item) => ({
            id: item.job.id,
            title: item.job.title,
            company: item.job.company,
            status: item.api.status,
            visibility: item.api.visibility ?? null,
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
  }, [user]);

  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => {
      if (sortKey === "dateAdded") return a.sentDaysAgo - b.sentDaysAgo;
      if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
      if (sortKey === "name") return a.job.title.localeCompare(b.job.title);
      return 0;
    });
    return list;
  }, [jobs, sortKey]);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title = isInfluencer ? t("direct.influencerTitle") : t("direct.entrepreneurTitle");
  const subtitle = isInfluencer
    ? t("direct.influencerSubtitle")
    : t("direct.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded", label: t("direct.sortDateAdded") },
    { key: "name", label: t("direct.sortName") },
    { key: "updatedDate", label: t("direct.sortUpdatedDate") },
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
              label={t("direct.sortBy")}
            />
          </div>

          {loading ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loading")}</p>
          ) : error ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loadFailed")}</p>
          ) : sortedJobs.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("direct.empty")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedJobs.map((item) => (
                <DirectOfferCard key={item.job.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
