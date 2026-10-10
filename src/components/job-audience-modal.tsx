"use client";

import { useEffect, useId, useRef } from "react";
import { useLanguage } from "@/i18n/language-provider";

export type JobAudience = "specific" | "open";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export function parseJobAudience(value: string | null): JobAudience | null {
  if (value === "specific" || value === "open") return value;
  return null;
}

export function jobCreateHref(audience: JobAudience): string {
  if (audience === "specific") return "/jobs/new/influencer";
  return "/jobs/new?audience=open";
}

export function jobFormHref(influencerIds: string[]): string {
  const ids = influencerIds.filter(Boolean).join(",");
  return `/jobs/new?audience=specific&influencers=${encodeURIComponent(ids)}`;
}

function CloseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function JobAudienceModal({
  open,
  onSelect,
  onDismiss,
}: {
  open: boolean;
  onSelect: (audience: JobAudience) => void;
  onDismiss: () => void;
}) {
  const { t } = useLanguage();
  const headingId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDismissRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t("postJob.audienceClose")}
        className="absolute inset-0 bg-black/40"
        onClick={onDismiss}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-t-[1.75rem] bg-white p-5 shadow-[0_24px_64px_rgba(17,17,17,0.18)] outline-none sm:rounded-[1.75rem] sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              id={headingId}
              className="text-[18px] font-semibold tracking-[-0.02em] text-[#141414]"
            >
              {t("postJob.audienceTitle")}
            </h2>
            <p id={descriptionId} className="mt-1 text-[13px] leading-relaxed text-[#7a7570]">
              {t("postJob.audienceSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("postJob.audienceClose")}
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#888] hover:bg-[#f5f5f5] ${FOCUS_RING}`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={() => onSelect("specific")}
            className={`flex w-full items-start gap-3 rounded-2xl border border-[#ece7e1] bg-surface px-4 py-4 text-left transition-colors hover:border-brand/40 hover:bg-brand/8 ${FOCUS_RING}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-[0_1px_2px_rgba(40,20,10,0.06)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M6.5 18.5c.8-2.6 2.8-4 5.5-4s4.7 1.4 5.5 4"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-[#141414]">
                {t("postJob.audienceSpecific")}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[#7a7570]">
                {t("postJob.audienceSpecificHint")}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelect("open")}
            className={`flex w-full items-start gap-3 rounded-2xl border border-[#ece7e1] bg-surface px-4 py-4 text-left transition-colors hover:border-brand/40 hover:bg-brand/8 ${FOCUS_RING}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-[0_1px_2px_rgba(40,20,10,0.06)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M12 4.75c1.8 1.9 2.75 4.4 2.75 7.25S13.8 17.35 12 19.25C10.2 17.35 9.25 14.85 9.25 12S10.2 6.65 12 4.75Z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                />
                <path d="M5 12h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-[#141414]">
                {t("postJob.audienceOpen")}
              </span>
              <span className="mt-1 block text-[13px] leading-snug text-[#7a7570]">
                {t("postJob.audienceOpenHint")}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
