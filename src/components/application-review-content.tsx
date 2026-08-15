"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildEngagement } from "@/lib/flowchart/builders";
import { escrowAmountForJob, findJobById } from "@/lib/flowchart/jobs";
import { MOCK_JOB_APPLICANTS } from "@/lib/mock-direct";

export default function ApplicationReviewContent({ applicationId }: { applicationId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();

  const live = state.applications.find((item) => item.id === applicationId);

  const seed = useMemo(() => {
    if (live || !user) return null;
    const list = MOCK_JOB_APPLICANTS[user.id] ?? MOCK_JOB_APPLICANTS["2"] ?? [];
    return list.find((item) => item.id === applicationId) ?? null;
  }, [live, user, applicationId]);

  if (!user) return null;

  const jobId = live?.jobId ?? seed?.jobId;
  const job = jobId ? findJobById(jobId) : undefined;
  const name = live?.influencerName ?? seed?.influencerName ?? "";
  const handle = live?.influencerHandle ?? seed?.influencerHandle ?? "";
  const influencerId = live?.influencerId ?? seed?.influencerId ?? "";
  const status = live?.status ?? seed?.status ?? "pending";

  function ensureLiveId(): string {
    if (live) return live.id;
    if (!seed || !user) return applicationId;
    const created = {
      id: seed.id,
      jobId: seed.jobId,
      influencerId: seed.influencerId,
      entrepreneurId: user.id,
      influencerName: seed.influencerName,
      influencerHandle: seed.influencerHandle,
      influencerAvatarBg: seed.influencerAvatarBg,
      coverMessage: "",
      status: "pending" as const,
      createdAt: Date.now(),
    };
    dispatch({ type: "APPLY_TO_JOB", application: created });
    return created.id;
  }

  function handleReject() {
    const id = ensureLiveId();
    dispatch({ type: "REJECT_APPLICATION", applicationId: id });
    router.push("/applications");
  }

  function handleAccept() {
    if (!user || !job) return;
    const id = ensureLiveId();
    const eng = buildEngagement({
      jobId: job.id,
      influencerId,
      entrepreneurId: user.id,
      influencerName: name,
      influencerHandle: handle,
      influencerAvatarBg: live?.influencerAvatarBg ?? seed?.influencerAvatarBg,
      escrowAmount: escrowAmountForJob(job),
      source: "application",
      sourceId: id,
    });
    dispatch({ type: "ACCEPT_APPLICATION", applicationId: id, engagement: eng });
    router.push(`/wallet/deposit?engagementId=${eng.id}`);
  }

  return (
    <FlowPage
      title={t("flow.reviewAppTitle")}
      subtitle={t("applications.applicantsBody")}
      backHref="/applications"
    >
      <FlowCard>
        <p className="text-[16px] font-semibold text-[#111]">{name}</p>
        <p className="text-[13px] text-[#888]">{handle}</p>
        {job && (
          <p className="mt-3 text-[13px] text-[#555]">
            {job.title} · ฿{job.budgetMax.toLocaleString("en-TH")}
          </p>
        )}
        {live?.coverMessage && (
          <p className="mt-3 rounded-xl bg-[#faf8f6] px-3.5 py-3 text-[13px] text-[#333]">
            {live.coverMessage}
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
