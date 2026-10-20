"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { markSeen } from "@/lib/seen-applications";
import {
  fetchMyApplications,
  type ApiApplication,
} from "@/lib/applications";
import { logJobList, mapApiJobToJob } from "@/lib/jobs";
import { formatBudgetRange, formatPosted, type Job } from "@/lib/job";
import {
  formatApplied,
  type ApplicationStatus,
} from "@/lib/applications";

type SortKey = "dateAdded" | "name" | "updatedDate";

type ListedApplication = {
  app: ApiApplication;
  job: Job | null;
  status: ApplicationStatus;
  appliedDaysAgo: number;
  updatedDaysAgo: number;
};

const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100   text-red-600",
};

function daysAgoFromIso(iso?: string | null): number {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function toApplicationStatus(status: string): ApplicationStatus {
  const key = status.toLowerCase();
  if (key === "accepted") return "accepted";
  if (key === "rejected" || key === "declined" || key === "withdrawn") {
    return "rejected";
  }
  return "pending";
}

function StatusPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function InfluencerApplicationCard({
  item,
  statusLabel,
}: {
  item: ListedApplication;
  statusLabel: string;
}) {
  const { t } = useLanguage();
  const job = item.job;
  if (!job) return null;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        <span className="absolute right-2.5 top-2.5">
          <StatusPill
            label={statusLabel}
            className={APPLICATION_STATUS_STYLES[item.status]}
          />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">
          {job.title}
        </h3>
        <p className="text-[12px] text-[#888]">{job.company || "—"}</p>
        <p className="text-[11px] text-[#999]">
          {t("applications.appliedLabel")}: {formatApplied(item.appliedDaysAgo)}
        </p>
        <p className="text-[12px] font-semibold text-[#333]">
          {formatBudgetRange(job.budgetMin, job.budgetMax)}
        </p>
        <p className="text-[11px] text-[#999]">{formatPosted(job.postedDaysAgo)}</p>

        <div className="mt-auto pt-1">
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => markSeen(String(item.app.id))}
            className="block w-full rounded-xl bg-brand px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-brand-hover"
          >
            {t("applications.viewJob")}
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

export default function ApplicationListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [items, setItems] = useState<ListedApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    if (user.role !== "influencer") {
      setItems([]);
      setLoading(false);
      return;
    }

    fetchMyApplications(controller.signal)
      .then((apps) => {
        if (controller.signal.aborted) return;
        const mapped = apps.map((app) => ({
          app,
          job: app.job
            ? mapApiJobToJob({
                id: app.job.id,
                entrepreneurId: app.job.entrepreneurId,
                title: app.job.title,
                description: app.job.description,
                platform: app.job.platform,
                budgetMin: app.job.budgetMin,
                budgetMax: app.job.budgetMax,
                status: app.job.status,
                promoted: app.job.promoted,
                createdAt: app.job.createdAt,
                entrepreneur: app.job.entrepreneur,
              })
            : null,
          status: toApplicationStatus(app.status),
          appliedDaysAgo: daysAgoFromIso(app.createdAt),
          updatedDaysAgo: daysAgoFromIso(app.updatedAt ?? app.createdAt),
        }));
        setItems(mapped);
        logJobList("applications:api", {
          role: user.role,
          count: mapped.length,
          jobs: mapped.map((item) => ({
            id: item.app.id,
            jobId: item.app.jobId,
            title: item.job?.title ?? null,
            company: item.job?.company ?? null,
            status: item.app.status,
          })),
        });
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setItems([]);
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
  }, [user]);

  const sortedItems = useMemo(() => {
    const list = [...items];
    list.sort((a, b) => {
      if (sortKey === "dateAdded") return a.appliedDaysAgo - b.appliedDaysAgo;
      if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
      if (sortKey === "name") {
        return (a.job?.title ?? "").localeCompare(b.job?.title ?? "");
      }
      return 0;
    });
    return list;
  }, [items, sortKey]);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title = isInfluencer
    ? t("applications.influencerTitle")
    : t("applications.entrepreneurTitle");
  const subtitle = isInfluencer
    ? t("applications.influencerSubtitle")
    : t("applications.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded", label: t("applications.sortDateAdded") },
    { key: "name", label: t("applications.sortName") },
    { key: "updatedDate", label: t("applications.sortUpdatedDate") },
  ];

  const statusLabel = (status: ApplicationStatus) =>
    status === "pending"
      ? t("applications.statusPending")
      : status === "accepted"
        ? t("applications.statusAccepted")
        : t("applications.statusRejected");

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
              label={t("applications.sortBy")}
            />
          </div>

          {loading ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loading")}</p>
          ) : error ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("common.loadFailed")}</p>
          ) : sortedItems.length === 0 ? (
            <p className="py-16 text-center text-[14px] text-[#888]">
              {t("applications.empty")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedItems.map((item) => (
                <InfluencerApplicationCard
                  key={item.app.id}
                  item={item}
                  statusLabel={statusLabel(item.status)}
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
