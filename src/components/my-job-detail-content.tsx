"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  getEngagementById,
  WORK_STATUS_LABELS,
  type JobEngagement,
  type ChatMessage,
  type WorkStatus,
} from "@/lib/mock-my-jobs";
import { MOCK_JOBS, formatBudgetRange } from "@/lib/mock-jobs";
import { markMyJobSeen } from "@/lib/seen-my-jobs";

// ─── Local mutable state (simulates API) ─────────────────────────────────────
// In a real app this would come from a server. Here we keep a runtime copy.

const engagementRuntime: Map<string, JobEngagement> = new Map();

function getOrInit(id: string): JobEngagement | undefined {
  if (!engagementRuntime.has(id)) {
    const base = getEngagementById(id);
    if (!base) return undefined;
    // Deep-copy messages so mutations don't pollute mock source
    engagementRuntime.set(id, { ...base, messages: [...base.messages] });
  }
  return engagementRuntime.get(id);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusChip({ workStatus }: { workStatus: WorkStatus }) {
  const info = WORK_STATUS_LABELS[workStatus];
  return (
    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${info.className}`}>
      {info.en}
    </span>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <h2 className="mb-3 text-[15px] font-bold text-[#111]">{label}</h2>
  );
}

// ─── Work Submission section ──────────────────────────────────────────────────

function WorkSection({
  engagement,
  isInfluencer,
  onUpdate,
}: {
  engagement: JobEngagement;
  isInfluencer: boolean;
  onUpdate: (next: Partial<JobEngagement>) => void;
}) {
  const { t } = useLanguage();
  const [submitText, setSubmitText] = useState("");
  const [revisionText, setRevisionText] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  function handleSubmit() {
    if (!submitText.trim()) return;
    onUpdate({ workStatus: "submitted", submissionNote: submitText.trim() });
    setSubmitText("");
  }

  function handleApprove() {
    onUpdate({ workStatus: "approved", reviewNote: "Work has been approved." });
  }

  function handleSendRevision() {
    if (!revisionText.trim()) return;
    onUpdate({ workStatus: "revision_requested", reviewNote: revisionText.trim() });
    setRevisionText("");
    setShowRevisionForm(false);
  }

  const { workStatus, submissionNote, reviewNote } = engagement;

  // ── Influencer view ──
  if (isInfluencer) {
    return (
      <div className="rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <SectionHeading label={t("myJob.detailWorkSection")} />
          <StatusChip workStatus={workStatus} />
        </div>

        {/* Revision note from entrepreneur */}
        {workStatus === "revision_requested" && reviewNote && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="mb-1 text-[12px] font-semibold text-amber-700">{t("myJob.detailRevisionNote")}</p>
            <p className="text-[13px] text-amber-900">{reviewNote}</p>
          </div>
        )}

        {/* Approved */}
        {workStatus === "approved" && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3.5">
            <p className="text-[13px] font-semibold text-green-700">{t("myJob.detailApproved")}</p>
            {reviewNote && <p className="mt-1 text-[12px] text-green-600">{reviewNote}</p>}
          </div>
        )}

        {/* Previous submission */}
        {submissionNote && workStatus !== "not_submitted" && (
          <div className="mb-4 rounded-xl bg-[#fafafa] p-3.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#888]">Your submission</p>
            <p className="text-[13px] text-[#333]">{submissionNote}</p>
          </div>
        )}

        {/* Submit / Re-submit form */}
        {(workStatus === "not_submitted" || workStatus === "revision_requested") && (
          <div className="space-y-2.5">
            <textarea
              value={submitText}
              onChange={(e) => setSubmitText(e.target.value)}
              placeholder={t("myJob.detailSubmitPlaceholder")}
              rows={3}
              className="w-full resize-none rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-3 text-[13px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-[#9d003b]/40 focus:ring-2 focus:ring-[#9d003b]/10"
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!submitText.trim()}
              className="w-full rounded-xl bg-[#9d003b] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#850030] disabled:opacity-40"
            >
              {workStatus === "revision_requested"
                ? t("myJob.detailReSubmitBtn")
                : t("myJob.detailSubmitBtn")}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ── Entrepreneur view ──
  return (
    <div className="rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <SectionHeading label={t("myJob.detailWorkSection")} />
        <StatusChip workStatus={workStatus} />
      </div>

      {workStatus === "not_submitted" && (
        <p className="text-[13px] text-[#888]">Waiting for the influencer to submit their work.</p>
      )}

      {workStatus === "submitted" && submissionNote && (
        <>
          <div className="mb-4 rounded-xl bg-[#fafafa] p-3.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#888]">Influencer&apos;s submission</p>
            <p className="text-[13px] text-[#333]">{submissionNote}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApprove}
              className="flex-1 rounded-xl bg-green-600 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-green-700"
            >
              {t("myJob.detailApproveBtn")}
            </button>
            <button
              type="button"
              onClick={() => setShowRevisionForm((v) => !v)}
              className="flex-1 rounded-xl border border-amber-500 py-2.5 text-[13px] font-semibold text-amber-600 transition-colors hover:bg-amber-50"
            >
              {t("myJob.detailRequestRevisionBtn")}
            </button>
          </div>

          {showRevisionForm && (
            <div className="mt-3 space-y-2">
              <textarea
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                placeholder={t("myJob.detailRevisionPlaceholder")}
                rows={3}
                className="w-full resize-none rounded-xl border border-[#eee] bg-[#fafafa] px-4 py-3 text-[13px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <button
                type="button"
                onClick={handleSendRevision}
                disabled={!revisionText.trim()}
                className="w-full rounded-xl bg-amber-500 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-40"
              >
                {t("myJob.detailSendRevision")}
              </button>
            </div>
          )}
        </>
      )}

      {workStatus === "revision_requested" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <p className="mb-1 text-[12px] font-semibold text-amber-700">{t("myJob.detailRevisionNote")}</p>
          <p className="text-[13px] text-amber-900">{reviewNote}</p>
        </div>
      )}

      {workStatus === "approved" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3.5">
          <p className="text-[13px] font-semibold text-green-700">{t("myJob.detailApproved")}</p>
        </div>
      )}
    </div>
  );
}

// ─── Chat section ─────────────────────────────────────────────────────────────

function ChatSection({
  messages,
  isInfluencer,
  onSend,
}: {
  messages: ChatMessage[];
  isInfluencer: boolean;
  onSend: (text: string) => void;
}) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  const myRole = isInfluencer ? "influencer" : "entrepreneur";

  return (
    <div className="rounded-2xl border border-[#f0f0f0] bg-white shadow-sm">
      <div className="border-b border-[#f0f0f0] px-5 py-4">
        <SectionHeading label={t("myJob.detailMessagesSection")} />
      </div>

      {/* Message list */}
      <div className="flex max-h-72 flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[#aaa]">{t("myJob.detailNoMessages")}</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.from === myRole;
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    isMine
                      ? "rounded-br-md bg-[#9d003b] text-white"
                      : "rounded-bl-md bg-[#f4f4f4] text-[#222]"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#bbb]">
                  {msg.sentDaysAgo === 0 ? "Today" : msg.sentDaysAgo === 1 ? "Yesterday" : `${msg.sentDaysAgo}d ago`}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-[#f0f0f0] px-4 py-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={t("myJob.detailMessagePlaceholder")}
          className="flex-1 rounded-xl border border-[#eee] bg-[#fafafa] px-3.5 py-2 text-[13px] text-[#333] outline-none placeholder:text-[#bbb] focus:border-[#9d003b]/40 focus:ring-2 focus:ring-[#9d003b]/10"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!draft.trim()}
          className="rounded-xl bg-[#9d003b] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#850030] disabled:opacity-40"
        >
          {t("myJob.detailSendMessage")}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MyJobDetailContent({ engagementId }: { engagementId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();

  // Local mutable copy of the engagement. Lazy-initialized from the runtime
  // store on mount (the route remounts per engagementId, see `key` in
  // src/app/my-jobs/[id]/page.tsx) so this doesn't need an effect + setState.
  const [engagement, setEngagement] = useState<JobEngagement | null>(() => {
    const eng = getOrInit(engagementId);
    return eng ? { ...eng, messages: [...eng.messages] } : null;
  });

  useEffect(() => {
    markMyJobSeen(engagementId);
  }, [engagementId]);

  if (!user || !engagement) return null;

  const isInfluencer = user.role === "influencer";
  const job = MOCK_JOBS.find((j) => j.id === engagement.jobId);
  if (!job) return null;

  function handleWorkUpdate(next: Partial<JobEngagement>) {
    setEngagement((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...next };
      engagementRuntime.set(engagementId, updated);
      return updated;
    });
  }

  function handleSendMessage(text: string) {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      from: isInfluencer ? "influencer" : "entrepreneur",
      text,
      sentDaysAgo: 0,
    };
    setEngagement((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, messages: [...prev.messages, newMsg] };
      engagementRuntime.set(engagementId, updated);
      return updated;
    });
  }

  const initials = engagement.influencerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      <MainHeader />

      <div className="flex-1 px-4 pb-16 pt-8 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-5">

          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#888] transition-colors hover:text-[#9d003b]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 13L5 8L10 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("myJob.detailBack")}
          </button>

          {/* Job summary card */}
          <div className="overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-sm">
            <div className={`h-24 ${job.thumbnailBg}`} />
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-[16px] font-bold text-[#111]">{job.title}</h1>
                  <p className="mt-0.5 text-[13px] text-[#888]">{job.company}</p>
                </div>
                <StatusChip workStatus={engagement.workStatus} />
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-[#777]">
                <span>{formatBudgetRange(job.budgetMin, job.budgetMax)}</span>
                <span>·</span>
                <span>{job.platform}</span>
                <span>·</span>
                <span>{t("myJob.acceptedLabel")} {engagement.acceptedDaysAgo === 0 ? "today" : `${engagement.acceptedDaysAgo}d ago`}</span>
              </div>

              {/* Influencer info (entrepreneur sees who is working on it) */}
              {!isInfluencer && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#fafafa] px-3.5 py-2.5">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black text-[#9d003b] ${engagement.influencerAvatarBg}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111]">{engagement.influencerName}</p>
                    <p className="text-[12px] text-[#888]">{engagement.influencerHandle}</p>
                  </div>
                  <Link
                    href={`/influencers/${engagement.influencerId}`}
                    className="ml-auto rounded-lg border border-[#eee] px-3 py-1 text-[12px] font-medium text-[#555] transition-colors hover:border-[#ccc]"
                  >
                    {t("myJob.detailInfluencer")}
                  </Link>
                </div>
              )}

              {/* Job details link */}
              <Link
                href={`/jobs/${job.id}`}
                className="mt-3 block text-center text-[12px] font-medium text-[#9d003b] underline-offset-2 hover:underline"
              >
                {t("myJob.viewDetails")} →
              </Link>
            </div>
          </div>

          {/* Work submission section */}
          <WorkSection
            engagement={engagement}
            isInfluencer={isInfluencer}
            onUpdate={handleWorkUpdate}
          />

          {/* Chat section */}
          <ChatSection
            messages={engagement.messages}
            isInfluencer={isInfluencer}
            onSend={handleSendMessage}
          />
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
