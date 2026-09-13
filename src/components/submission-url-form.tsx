"use client";

import { useEffect, useId, useState, type ClipboardEvent, type FormEvent } from "react";
import { useLanguage } from "@/i18n/language-provider";
import {
  collectUrls,
  formatSubmissionNote,
  looksLikeUrl,
  parseSubmissionNote,
  splitPastedUrls,
} from "@/lib/submission-urls";

const FIELD =
  "w-full rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-2.5 text-[13px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-[#9d003b]/40 focus:ring-2 focus:ring-[#9d003b]/10";

export function SubmittedUrls({ note }: { note: string }) {
  const parsed = parseSubmissionNote(note);
  if (parsed.urls.length === 0 && !parsed.note) return null;

  return (
    <div className="space-y-2">
      {parsed.urls.length > 0 && (
        <ul className="space-y-1.5">
          {parsed.urls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-[13px] font-medium text-[#9d003b] underline-offset-2 hover:underline"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
      {parsed.note ? <p className="text-[13px] text-[#333]">{parsed.note}</p> : null}
    </div>
  );
}

export function SubmissionUrlForm({
  submitLabel,
  onSubmit,
  error,
  autoFocus = false,
}: {
  submitLabel: string;
  onSubmit: (note: string) => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const { t } = useLanguage();
  const labelId = useId();
  const [urls, setUrls] = useState<string[]>([""]);
  const [note, setNote] = useState("");
  const canSend = collectUrls(urls).length > 0;

  function updateUrl(index: number, value: string) {
    setUrls((prev) => prev.map((item, i) => (i === index ? value : item)));
  }

  function addUrl() {
    setUrls((prev) => [...prev, ""]);
  }

  function removeUrl(index: number) {
    setUrls((prev) => (prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const parts = splitPastedUrls(event.clipboardData.getData("text")).filter(looksLikeUrl);
    if (parts.length <= 1) return;
    event.preventDefault();
    setUrls((prev) => {
      const next = [...prev];
      next.splice(index, 1, ...parts);
      if (next[next.length - 1] !== "") next.push("");
      return next;
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    onSubmit(formatSubmissionNote(urls, note));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div>
        <p id={labelId} className="mb-1.5 text-[12px] font-semibold text-[#555]">
          {t("myJob.urlsLabel")}
        </p>
        <div className="space-y-2" role="group" aria-labelledby={labelId}>
          {urls.map((url, index) => (
            <div key={index} className="flex gap-1.5">
              <input
                type="text"
                inputMode="url"
                autoComplete="url"
                value={url}
                autoFocus={autoFocus && index === 0}
                onChange={(event) => updateUrl(index, event.target.value)}
                onPaste={(event) => handlePaste(index, event)}
                placeholder={t("myJob.urlPlaceholder")}
                className={FIELD}
              />
              {urls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl(index)}
                  aria-label={t("myJob.removeUrl")}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#eee] text-[#888] transition-colors hover:border-[#ccc] hover:text-[#9d003b]"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addUrl}
        className="inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-[12px] font-semibold text-[#9d003b] transition-colors hover:bg-[#9d003b]/5"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {t("myJob.addUrl")}
      </button>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder={t("myJob.urlNotePlaceholder")}
        rows={3}
        className={`resize-none ${FIELD}`}
      />

      {error ? <p className="text-[12px] text-[#9d003b]">{error}</p> : null}

      <button
        type="submit"
        disabled={!canSend}
        className="w-full rounded-xl bg-[#9d003b] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#850030] disabled:opacity-40"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export function SendUrlsDialog({
  open,
  title,
  submitLabel,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title?: string;
  submitLabel: string;
  error?: string;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const { t } = useLanguage();
  const headingId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t("myJob.cancel")}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative z-10 w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id={headingId} className="text-[16px] font-bold text-[#111]">
              {t("myJob.sendUrlsTitle")}
            </h2>
            {title ? <p className="mt-0.5 text-[13px] text-[#888]">{title}</p> : null}
            <p className="mt-1 text-[12px] text-[#999]">{t("myJob.sendUrlsSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("myJob.cancel")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#888] hover:bg-[#f5f5f5]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <SubmissionUrlForm submitLabel={submitLabel} onSubmit={onSubmit} error={error} autoFocus />
      </div>
    </div>
  );
}
