"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { isVideoName, submissionPreviewUrl } from "@/lib/submission-media";
import { encodeWorkFeedback, type FeedbackKey } from "@/lib/work-feedback";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2";

const REQUIREMENT_RULES = [
  { key: "storyboard", test: /^storyboard\b/i, labelKey: "myJob.reviewReqStoryboard" },
  { key: "voiceOver", test: /^voice\s*over\b/i, labelKey: "myJob.reviewReqVoiceOver" },
  { key: "super", test: /^super\b/i, labelKey: "myJob.reviewReqSuper" },
  { key: "other", test: /^other\b/i, labelKey: "myJob.reviewReqOther" },
] as const;

type RequirementKey = (typeof REQUIREMENT_RULES)[number]["key"];

function parseSubmission(note: string): { files: string[]; links: string[] } {
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

function uploadedRequirements(requirements: string[]) {
  const found: { key: RequirementKey; labelKey: string; detail: string }[] = [];
  for (const line of requirements) {
    const rule = REQUIREMENT_RULES.find((item) => item.test.test(line.trim()));
    if (!rule || found.some((item) => item.key === rule.key)) continue;
    const detail = line.includes(":") ? line.slice(line.indexOf(":") + 1).trim() : "";
    found.push({ key: rule.key, labelKey: rule.labelKey, detail });
  }
  return found;
}

export default function ReviewWorkPanel({
  submissionNote,
  requirements,
  done,
  onAccept,
  onFeedback,
}: {
  submissionNote: string;
  requirements: string[];
  done: "accepted" | "sent" | null;
  onAccept: (note: string) => void;
  onFeedback: (note: string) => void;
}) {
  const { t } = useLanguage();
  const { files, links } = parseSubmission(submissionNote);
  const items = uploadedRequirements(requirements);
  const [scores, setScores] = useState<Partial<Record<RequirementKey, number>>>({});
  const [comments, setComments] = useState<Partial<Record<RequirementKey, string>>>({});
  const [overall, setOverall] = useState("");

  const scored = items.every((item) => scores[item.key] != null);
  const canSend = scored && overall.trim().length > 0;

  function composeNote(): string {
    return encodeWorkFeedback({
      items: items.flatMap((item) => {
        const score = scores[item.key];
        if (!score) return [];
        return [
          {
            key: item.key as FeedbackKey,
            score,
            comment: comments[item.key]?.trim() ?? "",
          },
        ];
      }),
      overall: overall.trim(),
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.25rem] border border-[#ece7e1] bg-white p-5 shadow-panel sm:p-7">
        <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.reviewFiles")}</p>
        {files.length === 0 ? (
          <p className="mt-2 text-[13px] text-[#8a8580]">{t("myJob.reviewEmptyFiles")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {files.map((file) => {
              const src = isVideoName(file) ? submissionPreviewUrl(file) : null;
              return (
                <li
                  key={file}
                  className="rounded-xl bg-surface px-3.5 py-2.5 text-[13px] text-[#3a3530]"
                >
                  {src && (
                    <video
                      src={src}
                      controls
                      playsInline
                      preload="metadata"
                      className="mb-2 aspect-video w-full rounded-lg bg-black"
                    />
                  )}
                  <p className="truncate">{file}</p>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-[14px] font-semibold text-[#141414]">{t("myJob.reviewLinks")}</p>
        {links.length === 0 ? (
          <p className="mt-2 text-[13px] text-[#8a8580]">{t("myJob.reviewEmptyLinks")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {links.map((link) => (
              <li key={link}>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-[13px] font-medium text-brand hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {done ? (
        <div className="rounded-[1.25rem] border border-[#b7ebc9] bg-[#ecfdf5] px-5 py-8 text-center">
          <p className="text-[18px] font-semibold text-[#141414]">
            {done === "accepted" ? t("myJob.reviewAccepted") : t("myJob.reviewSent")}
          </p>
        </div>
      ) : (
        <section className="rounded-[1.25rem] border border-[#ece7e1] bg-white p-5 shadow-panel sm:p-7">
          <p className="text-[14px] font-semibold text-[#141414]">{t("myJob.reviewFeedback")}</p>
          <div className="mt-4 space-y-5">
            {items.map((item) => (
              <div key={item.key} className="rounded-xl border border-[#f0ebe6] p-4">
                <p className="text-[14px] font-semibold text-[#141414]">{t(item.labelKey)}</p>
                {item.detail && <p className="mt-1 text-[12px] text-[#8a8580]">{item.detail}</p>}
                <p className="mt-3 text-[12px] font-semibold text-[#666]">{t("myJob.reviewScore")}</p>
                <div className="mt-2 flex gap-2" role="radiogroup" aria-label={t(item.labelKey)}>
                  {[1, 2, 3, 4, 5].map((score) => {
                    const selected = scores[item.key] === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setScores((current) => ({ ...current, [item.key]: score }))}
                        className={`grid h-10 w-10 place-items-center rounded-xl text-[14px] font-semibold ${
                          selected
                            ? "bg-brand text-white"
                            : "border border-[#e0dbd5] bg-surface text-[#3a3530] hover:border-brand"
                        } ${FOCUS_RING}`}
                      >
                        {score}
                      </button>
                    );
                  })}
                </div>
                <label className="mt-3 block text-[12px] font-semibold text-[#666]">
                  {t("myJob.reviewComment")}
                  <textarea
                    value={comments[item.key] ?? ""}
                    onChange={(event) =>
                      setComments((current) => ({ ...current, [item.key]: event.target.value }))
                    }
                    rows={2}
                    placeholder={t("myJob.reviewCommentPlaceholder")}
                    className={`mt-1.5 w-full resize-y rounded-xl border border-[#e0dbd5] bg-surface px-3.5 py-2.5 text-[14px] text-[#141414] outline-none focus:border-brand focus:bg-white ${FOCUS_RING}`}
                  />
                </label>
              </div>
            ))}
          </div>

          <label className="mt-5 block text-[14px] font-semibold text-[#141414]">
            {t("myJob.reviewOverall")}
            <textarea
              value={overall}
              onChange={(event) => setOverall(event.target.value)}
              rows={3}
              placeholder={t("myJob.reviewOverallPlaceholder")}
              className={`mt-2 w-full resize-y rounded-xl border border-[#e0dbd5] bg-surface px-3.5 py-2.5 text-[14px] font-normal text-[#141414] outline-none focus:border-brand focus:bg-white ${FOCUS_RING}`}
            />
          </label>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onAccept(composeNote())}
              className={`flex h-12 items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
            >
              {t("myJob.reviewAccept")}
            </button>
            <button
              type="button"
              disabled={!canSend}
              onClick={() => onFeedback(composeNote())}
              className={`flex h-12 items-center justify-center rounded-xl border border-brand text-[15px] font-semibold text-brand transition-colors hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING}`}
            >
              {t("myJob.reviewSend")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
