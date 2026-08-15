"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildInvite } from "@/lib/flowchart/builders";
import { MOCK_JOBS } from "@/lib/mock-jobs";

export default function SendInviteContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const params = useSearchParams();
  const influencerId = params.get("influencerId") ?? "";
  const influencerName = params.get("name") ?? "Influencer";

  const jobs = useMemo(() => {
    const posted = state.postedJobs.filter(
      (job) => user && job.entrepreneurId === user.id
    );
    const postedAsOptions = posted.map((job) => ({
      id: job.id,
      title: job.title,
      visibility: job.visibility,
    }));
    const seed = MOCK_JOBS.slice(0, 6).map((job) => ({
      id: job.id,
      title: job.title,
      visibility: "public" as const,
    }));
    return postedAsOptions.length > 0 ? postedAsOptions : seed;
  }, [state.postedJobs, user]);

  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  if (user.role !== "entrepreneur") {
    return (
      <FlowPage title={t("flow.inviteTitle")} backHref="/">
        <p className="text-[14px] text-[#777]">{t("postJob.notEntrepreneur")}</p>
      </FlowPage>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!jobId) {
      setError(t("flow.inviteNeedJob"));
      return;
    }
    if (!user) return;
    const selected = jobs.find((job) => job.id === jobId);
    try {
      // API connecting: mutation sendInvite(jobId, influencerId). Notify influencer.
      dispatch({
        type: "SEND_INVITE",
        invite: buildInvite({
          jobId,
          entrepreneurId: user.id,
          influencerId,
          fromCompany: user.name,
          influencerName,
          isPrivate: selected?.visibility === "private",
        }),
      });
      setMessage(t("flow.inviteSent"));
      router.push("/direct");
    } catch {
      setError(t("flow.error"));
    }
  }

  return (
    <FlowPage
      title={t("flow.inviteTitle")}
      subtitle={`${t("flow.inviteSubtitle")} · ${influencerName}`}
      backHref={influencerId ? `/influencers/${influencerId}` : "/"}
    >
      {jobs.length === 0 ? (
        <FlowCard>
          <p className="text-[14px] text-[#555]">{t("flow.inviteNeedJob")}</p>
          <a href="/jobs/new" className={`${primaryBtn} mt-4`}>
            {t("hero.postJobCta")}
          </a>
        </FlowCard>
      ) : (
        <FlowCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-[13px] font-medium text-[#333]">
              {t("flow.inviteJob")}
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className={`mt-1.5 ${fieldClass}`}
              >
                <option value="">{t("flow.invitePickJob")}</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className={primaryBtn}>
              {t("flow.inviteCta")}
            </button>
          </form>
        </FlowCard>
      )}
      {message && <p className="text-[13px] text-[#0f7b34]">{message}</p>}
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}
    </FlowPage>
  );
}
