"use client";

import { useMemo, useRef, useState } from "react";
import { useLanguage } from "@/i18n/language-provider";
import {
  forgetSubmissionFile,
  isImageFile,
  isVideoFile,
  isVideoName,
  rememberSubmissionFile,
  submissionPreviewUrl,
} from "@/lib/submission-media";
import { parseWorkFeedback, type FeedbackKey, type WorkFeedback } from "@/lib/work-feedback";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2";

function isMediaFile(file: File): boolean {
  return isImageFile(file) || isVideoFile(file);
}

const FEEDBACK_LABEL: Record<FeedbackKey, string> = {
  storyboard: "myJob.reviewReqStoryboard",
  voiceOver: "myJob.reviewReqVoiceOver",
  super: "myJob.reviewReqSuper",
  other: "myJob.reviewReqOther",
};

function FeedbackBox({ note }: { note: string }) {
  const { t } = useLanguage();
  const feedback: WorkFeedback | null = parseWorkFeedback(note);

  return (
    <section className="rounded-[1.25rem] border border-[#f3d7a1] bg-[#fff8eb] p-5">
      <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.fixFeedbackTitle")}</p>
      {feedback ? (
        <ul className="mt-3 space-y-3">
          {feedback.items.map((item) => (
            <li key={item.key} className="rounded-xl bg-white px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold text-[#141414]">{t(FEEDBACK_LABEL[item.key])}</p>
                <p className="text-[14px] font-semibold tabular-nums text-brand">{item.score}/5</p>
              </div>
              {item.comment && <p className="mt-1 text-[13px] leading-relaxed text-[#3a3530]">{item.comment}</p>}
            </li>
          ))}
          {feedback.overall && (
            <li className="rounded-xl bg-white px-3.5 py-3">
              <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.reviewOverall")}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#3a3530]">{feedback.overall}</p>
            </li>
          )}
        </ul>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-[#3a3530]">{note}</p>
      )}
    </section>
  );
}

function UploadPreview({ file }: { file: File }) {
  const src = useMemo(() => rememberSubmissionFile(file), [file]);
  if (isVideoFile(file)) {
    return (
      <video
        src={src}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full rounded-lg bg-black"
      />
    );
  }
  if (isImageFile(file)) {
    return <img src={src} alt="" className="max-h-64 w-full rounded-lg object-contain bg-black" />;
  }
  return null;
}

function parseSubmissionNote(note: string): { files: string[]; links: string[] } {
  const files: string[] = [];
  const links: string[] = [];
  for (const line of note.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("File: ")) files.push(trimmed.slice("File: ".length));
    else links.push(trimmed);
  }
  return { files, links };
}

function isPhotoOrPdf(file: File): boolean {
  return isImageFile(file) || file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function ReleaseCalendar() {
  const { locale } = useLanguage();
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate();
  const leading = first.getDay();
  const intlLocale = locale === "th" ? "th-TH-u-ca-gregory" : "en-US";
  const monthLabel = new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(first);
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(intlLocale, { weekday: "narrow" }).format(new Date(2026, 0, 4 + index))
  );
  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="mx-auto mt-8 max-w-sm text-center">
      <p className="text-[15px] font-semibold text-[#141414]">{monthLabel}</p>
      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {weekdays.map((label, index) => (
          <div key={`${label}-${index}`} className="py-1 text-[11px] font-semibold text-[#8a8580]">
            {label}
          </div>
        ))}
        {cells.map((day, index) => {
          const release = day === 10;
          return (
            <div
              key={index}
              className={`grid h-9 place-items-center rounded-lg text-[13px] font-semibold tabular-nums ${
                release
                  ? "bg-brand text-white ring-2 ring-brand ring-offset-1"
                  : day
                    ? "bg-surface text-[#3a3530]"
                    : ""
              }`}
            >
              {day ?? ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReleaseScreen() {
  const { t } = useLanguage();

  return (
    <section className="rounded-[1.25rem] border border-[#ece7e1] bg-white px-5 py-10 text-center shadow-panel sm:px-8">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-brand/10 text-brand">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden>
          <circle cx="26" cy="26" r="20" stroke="currentColor" strokeWidth="2.4" />
          <path d="M26 14V27L34 31" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="mt-6 text-[18px] font-semibold text-[#141414]">{t("myJob.releaseAuto")}</p>
      <p className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.03em] text-brand sm:text-[36px]">
        {t("myJob.releaseWithin")}
      </p>
      <ReleaseCalendar />
    </section>
  );
}

export default function DeliverWorkPanel({
  submitted = false,
  feedbackNote = "",
  passed = false,
  submissionNote = "",
  onSubmit,
}: {
  submitted?: boolean;
  feedbackNote?: string;
  passed?: boolean;
  submissionNote?: string;
  onSubmit: (payload: { files: string[]; links: string[] }) => void;
}) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [sent, setSent] = useState(false);
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [afterPayOpen, setAfterPayOpen] = useState(false);
  const [docs, setDocs] = useState<File[]>([]);
  const [docError, setDocError] = useState("");
  const locked = passed ? parseSubmissionNote(submissionNote) : null;

  const hasFile = files.length > 0;
  const hasLink = links.some((link) => link.trim().length > 0);
  const canSend = hasFile && hasLink;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: File[] = [];
    let invalid = false;
    for (const file of Array.from(list)) {
      if (isMediaFile(file)) next.push(file);
      else invalid = true;
    }
    setFileError(invalid ? t("myJob.deliverFileInvalid") : "");
    if (next.length > 0) {
      setFiles((current) => [...current, ...next]);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function addDocs(list: FileList | null) {
    if (!list) return;
    const next: File[] = [];
    let invalid = false;
    for (const file of Array.from(list)) {
      if (isPhotoOrPdf(file)) next.push(file);
      else invalid = true;
    }
    setDocError(invalid ? t("myJob.afterPayInvalid") : "");
    if (next.length > 0) setDocs((current) => [...current, ...next]);
    if (docInputRef.current) docInputRef.current.value = "";
  }

  if (passed && releaseOpen) {
    return <ReleaseScreen />;
  }

  function handleSend() {
    if (!canSend) return;
    onSubmit({
      files: files.map((file) => file.name),
      links: links.map((link) => link.trim()).filter(Boolean),
    });
    setSent(true);
  }

  if (submitted || sent) {
    return (
      <div className="space-y-5">
        {feedbackNote && <FeedbackBox note={feedbackNote} />}
        <div className="rounded-[1.25rem] border border-[#b7ebc9] bg-[#ecfdf5] px-5 py-8">
        <p className="text-center text-[18px] font-semibold text-[#141414]">{t("myJob.deliverSent")}</p>
        {files.some(isVideoFile) && (
          <ul className="mt-5 space-y-3">
            {files.filter(isVideoFile).map((file, index) => (
              <li key={`${file.name}-${index}`}>
                <UploadPreview file={file} />
                <p className="mt-1.5 truncate text-[13px] text-[#3a3530]">{file.name}</p>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedbackNote && <FeedbackBox note={feedbackNote} />}
      <div className="rounded-[1.25rem] border border-[#ece7e1] bg-white p-5 shadow-panel sm:p-7">
      {passed && (
        <div className="mb-6 rounded-xl border border-[#b7ebc9] bg-[#ecfdf5] px-4 py-4">
          <p className="text-[16px] font-semibold text-[#141414]">{t("myJob.passTitle")}</p>
        </div>
      )}
      <div>
        <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.deliverFilesLabel")}</p>
        {!passed && <p className="mt-1 text-[13px] text-[#8a8580]">{t("myJob.deliverFilesHint")}</p>}
        {!passed && (
        <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={(event) => addFiles(event.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`mt-3 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-[#d7d0c8] bg-surface text-[14px] font-semibold text-brand hover:border-brand ${FOCUS_RING}`}
        >
          {t("myJob.deliverFilesLabel")}
        </button>
        </>
        )}
        {fileError && <p className="mt-2 text-[13px] text-[#c0392b]">{fileError}</p>}
        {locked && locked.files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {locked.files.map((name) => {
              const preview = isVideoName(name) ? submissionPreviewUrl(name) : null;
              return (
                <li key={name} className="rounded-xl bg-surface px-3.5 py-2.5 text-[13px]">
                  {preview && (
                    <video
                      src={preview}
                      controls
                      playsInline
                      preload="metadata"
                      className="mb-2 aspect-video w-full rounded-lg bg-black"
                    />
                  )}
                  <input
                    value={name}
                    readOnly
                    disabled
                    className="h-11 w-full rounded-xl border border-[#e0dbd5] bg-white px-3.5 text-[14px] text-[#141414] disabled:cursor-not-allowed"
                  />
                </li>
              );
            })}
          </ul>
        )}
        {!locked && files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="rounded-xl bg-surface px-3.5 py-2.5 text-[13px]"
              >
                <UploadPreview file={file} />
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[#3a3530]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      forgetSubmissionFile(file);
                      setFiles((current) => current.filter((_, item) => item !== index));
                    }}
                    className="shrink-0 font-semibold text-[#888] hover:text-[#141414]"
                  >
                    {t("myJob.deliverRemoveLink")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6">
        <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.deliverLinkLabel")}</p>
        <div className="mt-3 space-y-2">
          {(locked ? locked.links : links).map((link, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={link}
                readOnly={passed}
                disabled={passed}
                onChange={(event) =>
                  setLinks((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? event.target.value : item
                    )
                  )
                }
                placeholder={t("myJob.deliverLinkPlaceholder")}
                className={`h-11 min-w-0 flex-1 rounded-xl border border-[#e0dbd5] bg-surface px-3.5 text-[14px] text-[#141414] outline-none focus:border-brand focus:bg-white disabled:cursor-not-allowed disabled:bg-[#f6f4f1] disabled:text-[#3a3530] ${FOCUS_RING}`}
              />
              {!passed && links.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLinks((current) => current.filter((_, item) => item !== index))}
                  className={`h-11 shrink-0 rounded-xl border border-[#e0dbd5] px-3 text-[13px] font-semibold text-[#666] hover:text-[#141414] ${FOCUS_RING}`}
                >
                  {t("myJob.deliverRemoveLink")}
                </button>
              )}
            </div>
          ))}
        </div>
        {!passed && (
        <button
          type="button"
          onClick={() => setLinks((current) => [...current, ""])}
          className={`mt-3 text-[13px] font-semibold text-brand hover:underline ${FOCUS_RING}`}
        >
          {t("myJob.deliverAddLink")}
        </button>
        )}
      </div>

      {passed ? (
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => setReleaseOpen(true)}
            className={`flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
          >
            {t("myJob.releaseSchedule")}
          </button>
          <button
            type="button"
            onClick={() => setAfterPayOpen(true)}
            className={`flex h-12 w-full items-center justify-center rounded-xl border border-brand text-[15px] font-semibold text-brand hover:bg-brand/5 ${FOCUS_RING}`}
          >
            {t("myJob.afterPay")}
          </button>
          {afterPayOpen && (
            <div className="rounded-xl border border-[#ece7e1] bg-surface p-4">
              <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.afterPay")}</p>
              <p className="mt-1 text-[13px] text-[#8a8580]">{t("myJob.afterPayHint")}</p>
              <input
                ref={docInputRef}
                type="file"
                accept="image/*,.pdf,application/pdf"
                multiple
                className="sr-only"
                onChange={(event) => addDocs(event.target.files)}
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className={`mt-3 flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-[#d7d0c8] bg-white text-[14px] font-semibold text-brand hover:border-brand ${FOCUS_RING}`}
              >
                {t("myJob.afterPay")}
              </button>
              {docError && <p className="mt-2 text-[13px] text-[#c0392b]">{docError}</p>}
              {docs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {docs.map((file, index) => (
                    <li
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-[13px]"
                    >
                      <span className="min-w-0 truncate text-[#3a3530]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setDocs((current) => current.filter((_, item) => item !== index))}
                        className="shrink-0 font-semibold text-[#888] hover:text-[#141414]"
                      >
                        {t("myJob.deliverRemoveLink")}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
      <button
        type="button"
        disabled={!canSend}
        onClick={handleSend}
        className={`mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none ${FOCUS_RING}`}
      >
        {t("myJob.deliverSubmit")}
      </button>
      )}
      </div>
    </div>
  );
}
