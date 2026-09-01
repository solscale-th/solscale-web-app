"use client";

import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, primaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { findJobById } from "@/lib/flowchart/jobs";
import { jobDetailHref, jobDetailHrefFromEngagement } from "@/lib/job-detail-href";
import { FlowchartError } from "@/lib/flowchart/types";
import { useState } from "react";

export default function ReleasePaymentContent({ engagementId }: { engagementId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const [error, setError] = useState("");

  const engagement = state.engagements.find((item) => item.id === engagementId);
  const job = engagement ? findJobById(engagement.jobId) : undefined;
  const jobHref =
    jobDetailHrefFromEngagement(engagementId, state.engagements) ??
    `/jobs`;

  if (!user) return null;

  function handleRelease() {
    setError("");
    try {
      // RISK: must be idempotent on the API. Double-click here can be retried
      // because the reducer rejects ALREADY_RELEASED; a real ledger cannot.
      dispatch({ type: "RELEASE_PAYMENT", engagementId });
      router.push(`/my-jobs/${engagementId}/rate`);
    } catch (err) {
      setError(err instanceof FlowchartError ? err.code : t("flow.error"));
    }
  }

  return (
    <FlowPage
      title={t("flow.payTitle")}
      subtitle={t("flow.paySubtitle")}
      backHref={jobHref}
    >
      <FlowCard>
        <p className="text-[15px] font-semibold text-[#111]">{job?.title}</p>
        <p className="mt-1 text-[13px] text-[#888]">{engagement?.influencerName}</p>
        <p className="mt-4 text-[22px] font-bold tabular-nums text-[#111]">
          ฿{(engagement?.escrowAmount ?? 0).toLocaleString("en-TH")}
        </p>
        {engagement?.paymentStatus === "released" ? (
          <p className="mt-4 text-[13px] text-[#0f7b34]">{t("flow.payDone")}</p>
        ) : (
          <button type="button" onClick={handleRelease} className={`${primaryBtn} mt-5`}>
            {t("flow.payCta")}
          </button>
        )}
      </FlowCard>
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}
    </FlowPage>
  );
}
