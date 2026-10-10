"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { jobFormHref } from "@/components/job-audience-modal";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import {
  fetchInfluencers,
  type InfluencerListItem,
} from "@/lib/influencers";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

function Avatar({ influencer }: { influencer: InfluencerListItem }) {
  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-[14px] font-semibold text-brand-deep ${influencer.avatarBg}`}
      style={
        influencer.avatarUrl
          ? {
              backgroundImage: `url(${influencer.avatarUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {influencer.avatarUrl ? null : influencer.name.charAt(0)}
    </span>
  );
}

export default function PickInfluencerContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<InfluencerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<InfluencerListItem[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetchInfluencers(
      { search: debouncedQuery || undefined, limit: 20 },
      controller.signal
    )
      .then((items) => {
        if (!controller.signal.aborted) setResults(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResults([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, reloadKey]);

  if (user && user.role !== "entrepreneur") {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <MainHeader />
        <main className="mx-auto flex-1 max-w-2xl px-4 py-16 text-center">
          <p className="text-[15px] text-[#555]">{t("postJob.notEntrepreneur")}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const selectedIds = new Set(selected.map((item) => item.id));

  function toggle(influencer: InfluencerListItem) {
    setSelected((current) =>
      current.some((item) => item.id === influencer.id)
        ? current.filter((item) => item.id !== influencer.id)
        : [...current, influencer]
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <MainHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:py-14">
        <button
          type="button"
          onClick={() => router.back()}
          className={`mb-4 inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-[#7a7570] hover:text-brand ${FOCUS_RING}`}
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M7.5 2.5L4 6l3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("postJob.pickInfluencerBack")}
        </button>

        <h1 className="text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.04em] text-[#141414] sm:text-[2.1rem]">
          {t("postJob.pickInfluencerTitle")}
        </h1>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[#7a7570]">
          {t("postJob.pickInfluencerSubtitle")}
        </p>

        <label className="relative mt-8 block">
          <span className="sr-only">{t("postJob.pickInfluencerSearch")}</span>
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a8580]"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("postJob.pickInfluencerSearch")}
            className={`w-full rounded-2xl border border-[#e0dbd5] bg-white py-3.5 pl-10 pr-4 text-[15px] text-[#2a2622] placeholder-[#b3aca4] shadow-[0_8px_32px_rgba(17,17,17,0.06)] outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/25`}
          />
        </label>

        {selected.length > 0 ? (
          <div className="mt-4">
            <p className="text-[13px] font-semibold text-brand">
              {t("postJob.pickInfluencerSelectedCount", { count: selected.length })}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {selected.map((influencer) => (
                <li key={influencer.id}>
                  <button
                    type="button"
                    onClick={() => toggle(influencer)}
                    className={`inline-flex items-center gap-1.5 rounded-full bg-brand/8 px-3 py-1.5 text-[12px] font-semibold text-brand ${FOCUS_RING}`}
                  >
                    {influencer.name}
                    <span className="text-[11px]" aria-hidden>
                      ×
                    </span>
                    <span className="sr-only">{t("postJob.removeSelected")}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 flex-1">
          {loading ? (
            <p className="px-1 py-6 text-[14px] text-[#8a8580]">
              {t("postJob.influencersLoading")}
            </p>
          ) : error ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-[14px] text-[#c0392b]">{t("influencers.error")}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className={`rounded-full border border-[#e0dbd5] bg-white px-5 py-2 text-[13px] font-semibold text-[#555] hover:border-brand hover:text-brand ${FOCUS_RING}`}
              >
                {t("influencers.retry")}
              </button>
            </div>
          ) : results.length === 0 ? (
            <p className="px-1 py-6 text-[14px] text-[#8a8580]">
              {t("postJob.influencersEmpty")}
            </p>
          ) : (
            <ul className="space-y-2">
              {results.map((influencer) => {
                const isSelected = selectedIds.has(influencer.id);
                return (
                  <li key={influencer.id}>
                    <button
                      type="button"
                      onClick={() => toggle(influencer)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                        isSelected
                          ? "border-brand/40 bg-brand/8"
                          : "border-[#ece7e1] bg-white hover:border-[#ddd6ce]"
                      } ${FOCUS_RING}`}
                    >
                      <Avatar influencer={influencer} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-[#141414]">
                          {influencer.name}
                        </span>
                        <span className="mt-0.5 block truncate text-[13px] text-[#8a8580]">
                          {influencer.handle}
                          {influencer.platform ? ` · ${influencer.platform}` : ""}
                        </span>
                      </span>
                      <span
                        aria-hidden
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                          isSelected
                            ? "border-brand bg-brand text-white"
                            : "border-[#d9d4ce] bg-white text-transparent"
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6.2L4.7 8.4L9.5 3.6"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="sticky bottom-0 mt-6 bg-paper pb-2 pt-3">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={() => router.push(jobFormHref(selected.map((item) => item.id)))}
            className="w-full rounded-2xl bg-accent px-6 py-3.5 text-[15px] font-extrabold text-on-accent shadow-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("postJob.pickInfluencerContinue")}
          </button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
