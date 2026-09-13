"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import {
  canSubmitWork,
  WORK_STATUS_LABELS,
  type WorkStatus,
} from "@/lib/mock-my-jobs";
import type { FlowEngagement } from "@/lib/flowchart/types";
import { SubmissionUrlForm, SubmittedUrls } from "@/components/submission-url-form";

export { jobDetailHref } from "@/lib/job-detail-href";

const PANEL =
  "rounded-[1.25rem] border border-[#ece7e1] bg-white shadow-[0_1px_2px_rgba(40,20,10,0.04),0_18px_36px_-26px_rgba(74,0,27,0.45)]";

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

function WorkPanel({
  engagement,
  isInfluencer,
  onUpdate,
}: {
  engagement: Pick<
    FlowEngagement,
    "workStatus" | "submissionNote" | "reviewNote"
  >;
  isInfluencer: boolean;
  onUpdate: (next: {
    workStatus?: WorkStatus;
    submissionNote?: string;
    reviewNote?: string;
  }) => void;
}) {
  const { t } = useLanguage();
  const [revisionText, setRevisionText] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  function handleSubmit(note: string) {
    onUpdate({ workStatus: "submitted", submissionNote: note });
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

  if (isInfluencer) {
    return (
      <div className={`p-5 sm:p-7 ${PANEL}`}>
        <div className="mb-3 flex items-center gap-3">
          <SectionHeading label={t("myJob.detailWorkSection")} />
          <StatusChip workStatus={workStatus} />
        </div>

        {workStatus === "revision_requested" && reviewNote && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="mb-1 text-[12px] font-semibold text-amber-700">
              {t("myJob.detailRevisionNote")}
            </p>
            <p className="text-[13px] text-amber-900">{reviewNote}</p>
          </div>
        )}

        {workStatus === "approved" && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3.5">
            <p className="text-[13px] font-semibold text-green-700">
              {t("myJob.detailApproved")}
            </p>
            {reviewNote && (
              <p className="mt-1 text-[12px] text-green-600">{reviewNote}</p>
            )}
          </div>
        )}

        {submissionNote && workStatus !== "not_submitted" && (
          <div className="mb-4 rounded-xl bg-[#fafafa] p-3.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#888]">
              Your submission
            </p>
            <SubmittedUrls note={submissionNote} />
          </div>
        )}

        {canSubmitWork(workStatus) && (
          <SubmissionUrlForm
            submitLabel={
              workStatus === "revision_requested"
                ? t("myJob.detailReSubmitBtn")
                : t("myJob.sendUrls")
            }
            onSubmit={handleSubmit}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`p-5 sm:p-7 ${PANEL}`}>
      <div className="mb-3 flex items-center gap-3">
        <SectionHeading label={t("myJob.detailWorkSection")} />
        <StatusChip workStatus={workStatus} />
      </div>

      {workStatus === "not_submitted" && (
        <p className="text-[13px] text-[#888]">
          Waiting for the influencer to submit their work.
        </p>
      )}

      {workStatus === "submitted" && submissionNote && (
        <>
          <div className="mb-4 rounded-xl bg-[#fafafa] p-3.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-[#888]">
              Influencer&apos;s submission
            </p>
            <SubmittedUrls note={submissionNote} />
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
          <p className="mb-1 text-[12px] font-semibold text-amber-700">
            {t("myJob.detailRevisionNote")}
          </p>
          <p className="text-[13px] text-amber-900">{reviewNote}</p>
        </div>
      )}

      {workStatus === "approved" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3.5">
          <p className="text-[13px] font-semibold text-green-700">
            {t("myJob.detailApproved")}
          </p>
        </div>
      )}
    </div>
  );
}

export type JobWorkspaceSectionProps = {
  engagement: FlowEngagement;
  jobId: string;
  isInfluencer: boolean;
  onWorkUpdate: (next: {
    workStatus?: WorkStatus;
    submissionNote?: string;
    reviewNote?: string;
  }) => void;
};

export default function JobWorkspaceSection({
  engagement,
  jobId,
  isInfluencer,
  onWorkUpdate,
}: JobWorkspaceSectionProps) {
  const { t } = useLanguage();

  const initials = engagement.influencerName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div id="job-workspace" className="mt-10 space-y-5">
      {!isInfluencer && (
        <div className={`p-5 sm:p-7 ${PANEL}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">
            {t("myJob.detailInfluencer")}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black text-[#9d003b] ${engagement.influencerAvatarBg}`}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-[#111]">
                {engagement.influencerName}
              </p>
              <p className="text-[12px] text-[#888]">{engagement.influencerHandle}</p>
            </div>
            <Link
              href={`/influencers/${engagement.influencerId}`}
              className="shrink-0 rounded-lg border border-[#eee] px-3 py-1.5 text-[12px] font-medium text-[#555] transition-colors hover:border-[#ccc]"
            >
              {t("myJob.detailInfluencer")}
            </Link>
          </div>
        </div>
      )}

      {engagement.paymentStatus === "unfunded" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-[14px] font-semibold text-amber-800">
            {t("myJob.awaitingDeposit")}
          </p>
          {!isInfluencer && (
            <Link
              href={`/wallet/deposit?engagementId=${engagement.id}`}
              className="mt-3 inline-flex h-11 items-center rounded-xl bg-[#9d003b] px-5 text-[13px] font-semibold text-white"
            >
              {t("myJob.fundJob")}
            </Link>
          )}
        </div>
      )}

      <div id="job-submit-work">
        {engagement.paymentStatus === "unfunded" ? (
          <div className={`p-5 sm:p-7 ${PANEL}`}>
            <p className="text-[13px] text-[#888]">
              {isInfluencer
                ? t("jobDetail.offerAcceptedBody")
                : t("myJob.awaitingDeposit")}
            </p>
          </div>
        ) : (
          <WorkPanel
            engagement={engagement}
            isInfluencer={isInfluencer}
            onUpdate={onWorkUpdate}
          />
        )}
      </div>

      {!isInfluencer &&
        engagement.workStatus === "approved" &&
        engagement.paymentStatus === "escrowed" && (
          <Link
            href={`/my-jobs/${engagement.id}/pay`}
            className="flex h-11 items-center justify-center rounded-xl bg-[#d7ff2f] text-[14px] font-semibold text-[#2a1018]"
          >
            {t("myJob.releasePay")}
          </Link>
        )}

      {!isInfluencer &&
        engagement.paymentStatus === "escrowed" &&
        engagement.workStatus === "submitted" && (
          <Link
            href={`/my-jobs/${engagement.id}/dispute`}
            className="flex h-11 items-center justify-center rounded-xl border border-[#dcd6cf] bg-white text-[14px] font-medium text-[#555]"
          >
            {t("myJob.raiseDispute")}
          </Link>
        )}

      {engagement.paymentStatus === "released" && (
        <Link
          href={`/my-jobs/${engagement.id}/rate`}
          className="flex h-11 items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white"
        >
          {t("myJob.leaveRating")}
        </Link>
      )}
    </div>
  );
}
