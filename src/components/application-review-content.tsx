"use client";

import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildEngagement } from "@/lib/flowchart/builders";
import { escrowAmountForJob, findJobById } from "@/lib/flowchart/jobs";
import { jobDetailHref } from "@/lib/job-detail-href";

export default function ApplicationReviewContent({ applicationId }: { applicationId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();

  const live = state.applications.find((item) => item.id === applicationId);

  if (!user) return null;

  if (!live) {
    return (
      <FlowPage
        title={t("flow.reviewAppTitle")}
        subtitle={t("applications.applicantsBody")}
        backHref="/applications"
      >
        <p className="text-[14px] text-[#888]">{t("applications.empty")}</p>
      </FlowPage>
    );
  }

  const application = live;
  const job = findJobById(application.jobId);
  const status = application.status;

  function handleReject() {
    dispatch({ type: "REJECT_APPLICATION", applicationId: application.id });
    router.push("/applications");
  }

  function handleAccept() {
    if (!user || !job) return;
    const eng = buildEngagement({
      jobId: job.id,
      influencerId: application.influencerId,
      entrepreneurId: user.id,
      influencerName: application.influencerName,
      influencerHandle: application.influencerHandle,
      influencerAvatarBg: application.influencerAvatarBg,
      escrowAmount: escrowAmountForJob(job),
      source: "application",
      sourceId: application.id,
    });
    dispatch({ type: "ACCEPT_APPLICATION", applicationId: application.id, engagement: eng });
    router.push(jobDetailHref(job.id, eng.id, "workspace"));
  }

  return (
    <FlowPage
      title={t("flow.reviewAppTitle")}
      subtitle={t("applications.applicantsBody")}
      backHref="/applications"
    >
      <FlowCard>
        <p className="text-[16px] font-semibold text-[#111]">{application.influencerName}</p>
        <p className="text-[13px] text-[#888]">{application.influencerHandle}</p>
        {job && (
          <p className="mt-3 text-[13px] text-[#555]">
            {job.title} · ฿{job.budgetMax.toLocaleString("en-TH")}
          </p>
        )}
        {application.coverMessage && (
          <p className="mt-3 rounded-xl bg-surface px-3.5 py-3 text-[13px] text-[#333]">
            {application.coverMessage}
          </p>
        )}
        {status === "pending" ? (
          <div className="mt-5 space-y-2">
            <p className="text-[12px] text-[#888]">{t("flow.acceptHint")}</p>
            <button type="button" onClick={handleAccept} className={primaryBtn}>
              {t("flow.acceptCta")}
            </button>
            <button type="button" onClick={handleReject} className={secondaryBtn}>
              {t("flow.rejectCta")}
            </button>
          </div>
        ) : (
          <p className="mt-4 text-[13px] font-medium text-[#555]">{status}</p>
        )}
      </FlowCard>
    </FlowPage>
  );
}
