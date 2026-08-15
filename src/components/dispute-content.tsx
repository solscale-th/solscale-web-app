"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildDispute } from "@/lib/flowchart/builders";
import { FlowchartError } from "@/lib/flowchart/types";

export default function DisputeContent({ engagementId }: { engagementId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { dispatch } = useFlowchart();
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      // API connecting: create a moderation ticket; freeze escrow on the ledger.
      dispatch({
        type: "RAISE_DISPUTE",
        dispute: buildDispute({
          engagementId,
          raisedBy: user!.id,
          reason: reason.trim(),
        }),
      });
      router.push(`/my-jobs/${engagementId}`);
    } catch (err) {
      setError(err instanceof FlowchartError ? err.code : t("flow.error"));
    }
  }

  return (
    <FlowPage
      title={t("flow.disputeTitle")}
      subtitle={t("flow.disputeSubtitle")}
      backHref={`/my-jobs/${engagementId}`}
    >
      <FlowCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-[13px] font-medium text-[#333]">
            {t("flow.disputeReason")}
            <textarea
              required
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={`mt-1.5 resize-none ${fieldClass}`}
            />
          </label>
          <button type="submit" className={primaryBtn}>
            {t("flow.disputeCta")}
          </button>
        </form>
      </FlowCard>
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}
    </FlowPage>
  );
}
