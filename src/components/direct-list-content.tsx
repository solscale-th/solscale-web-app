"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  formatSent,
  type DirectOffer,
} from "@/lib/mock-direct";
import { MOCK_JOBS } from "@/lib/mock-jobs";
import { getSeenDirectIds, markDirectSeen, SEEN_DIRECT_EVENT } from "@/lib/seen-direct";
import { useFlowchart } from "@/hooks/use-flowchart";
import { findJobById } from "@/lib/flowchart/jobs";
import { logJobList } from "@/lib/jobs";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "dateAdded" | "name" | "updatedDate";


function UpdateDot() {
  return (
    <span className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff2d55] opacity-75" />
      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#ff2d55]" />
    </span>
  );
}

// ─── Influencer card: direct offer ───────────────────────────────────────────

function DirectOfferCard({
  offer,
  seen,
}: {
  offer: DirectOffer;
  seen: boolean;
}) {
  const { t } = useLanguage();
  const job = findJobById(offer.jobId) ?? MOCK_JOBS.find((j) => j.id === offer.jobId);
  if (!job) return null;

  const showDot = offer.hasUpdate && !seen;

  return (
    <div className="relative flex flex-col rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)]">
      {showDot && <UpdateDot />}

      {/* Coloured banner */}
      <div className={`relative h-28 overflow-hidden rounded-t-2xl ${job.thumbnailBg}`}>
        {/* Job type badge – top left */}
        <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${offer.isPrivate ? "bg-[#111]/70 text-white" : "bg-white/80 text-[#333]"}`}>
          {offer.isPrivate ? t("direct.badgePrivate") : t("direct.badgeOpen")}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">{job.title}</h3>
        <p className="text-[12px] text-[#888]">{offer.fromCompany}</p>
        <p className="text-[11px] text-[#999]">
          {t("direct.offeredLabel")}: {formatSent(offer.sentDaysAgo)}
        </p>

        <div className="mt-auto pt-1">
          <Link
            href={`/jobs/${job.id}`}
            onClick={() => { if (offer.hasUpdate) markDirectSeen(offer.id); }}
            className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white transition-colors hover:bg-[#850030]"
          >
            {t("direct.viewJob")}
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

export default function DirectListContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state } = useFlowchart();
  const [sortKey, setSortKey] = useState<SortKey>("dateAdded");
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const sync = () => setSeenIds(new Set(getSeenDirectIds()));
    sync();
    window.addEventListener(SEEN_DIRECT_EVENT, sync);
    return () => window.removeEventListener(SEEN_DIRECT_EVENT, sync);
  }, []);

  if (!user) return null;

  const isInfluencer = user.role === "influencer";
  const title    = isInfluencer ? t("direct.influencerTitle")    : t("direct.entrepreneurTitle");
  const subtitle = isInfluencer ? t("direct.influencerSubtitle") : t("direct.entrepreneurSubtitle");

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "dateAdded",   label: t("direct.sortDateAdded")   },
    { key: "name",        label: t("direct.sortName")        },
    { key: "updatedDate", label: t("direct.sortUpdatedDate") },
  ];

  // Notification-first comparator (only used on dateAdded sort)
  const notifFirst = (aHas: boolean, aId: string, bHas: boolean, bId: string) => {
    const aUnseen = aHas && !seenIds.has(aId);
    const bUnseen = bHas && !seenIds.has(bId);
    if (aUnseen && !bUnseen) return -1;
    if (!aUnseen && bUnseen) return  1;
    return 0;
  };

  /* ── Influencer: private invites (seed + live) ── */
  const liveOffers = isInfluencer
    ? state.invites
        .filter((inv) => inv.influencerId === user.id)
        .map((inv) => ({
          id: inv.id,
          jobId: inv.jobId,
          fromCompany: inv.fromCompany,
          sentDaysAgo: 0,
          updatedDaysAgo: 0,
          isPrivate: inv.isPrivate,
          status: inv.status,
          hasUpdate: inv.status === "pending",
        }))
    : [];
  const sortedOffers = [...liveOffers].sort((a, b) => {
    if (sortKey === "dateAdded") {
      const n = notifFirst(a.hasUpdate, a.id, b.hasUpdate, b.id);
      if (n !== 0) return n;
      return a.sentDaysAgo - b.sentDaysAgo;
    }
    if (sortKey === "updatedDate") return a.updatedDaysAgo - b.updatedDaysAgo;
    if (sortKey === "name") {
      const jobA = findJobById(a.jobId) ?? MOCK_JOBS.find((j) => j.id === a.jobId);
      const jobB = findJobById(b.jobId) ?? MOCK_JOBS.find((j) => j.id === b.jobId);
      return (jobA?.title ?? "").localeCompare(jobB?.title ?? "");
    }
    return 0;
  });

  /* ── Entrepreneur: invites they sent ── */
  const sentOffers = isInfluencer
    ? []
    : state.invites
        .filter((inv) => inv.entrepreneurId === user.id)
        .map((inv) => ({
          id: inv.id,
          jobId: inv.jobId,
          fromCompany: inv.influencerName,
          sentDaysAgo: 0,
          updatedDaysAgo: 0,
          isPrivate: inv.isPrivate,
          status: inv.status,
          hasUpdate: inv.status === "pending",
        }));
  const isEmpty = isInfluencer ? sortedOffers.length === 0 : sentOffers.length === 0;

  logJobList("direct", {
    role: user.role,
    count: isInfluencer ? sortedOffers.length : sentOffers.length,
    jobs: (isInfluencer ? sortedOffers : sentOffers).map((offer) => {
      const job = findJobById(offer.jobId) ?? MOCK_JOBS.find((item) => item.id === offer.jobId);
      return {
        id: offer.id,
        jobId: offer.jobId,
        title: job?.title ?? null,
        company: offer.fromCompany,
        status: offer.status,
      };
    }),
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
              label={t("direct.sortBy")}
            />
          </div>

          {isEmpty ? (
            <p className="py-16 text-center text-[14px] text-[#888]">{t("direct.empty")}</p>
          ) : isInfluencer ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedOffers.map((offer) => (
                <DirectOfferCard key={offer.id} offer={offer} seen={seenIds.has(offer.id)} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sentOffers.map((offer) => (
                <DirectOfferCard key={offer.id} offer={offer} seen={seenIds.has(offer.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
