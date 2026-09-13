"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { FlowchartError } from "@/lib/flowchart/types";
import { depositFunds } from "@/lib/entrepreneurs";
import { getWalletBalance } from "@/lib/flowchart/reducer";
import { jobDetailHref } from "@/lib/job-detail-href";

function formatThb(amount: number) {
  return amount.toLocaleString("en-TH");
}

export default function DepositContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const params = useSearchParams();
  const engagementId = params.get("engagementId");

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const engagement = useMemo(
    () => state.engagements.find((item) => item.id === engagementId) ?? null,
    [state.engagements, engagementId]
  );

  if (!user) return null;

  const balance = getWalletBalance(state, user.id);
  const needed = engagement?.escrowAmount ?? 0;
  const shortfall = Math.max(0, needed - balance);

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    const value = Number(amount);
    try {
      await depositFunds(value);
    } catch {
      // Demo wallet still credits when the ledger API is unavailable.
    }
    try {
      dispatch({ type: "DEPOSIT", userId: user!.id, amount: value });
      setAmount("");
      setMessage(t("flow.depositSuccess"));
    } catch (err) {
      setError(
        err instanceof FlowchartError && err.code === "INVALID_AMOUNT"
          ? t("flow.insufficient")
          : t("flow.error")
      );
    }
  }

  function handleFund() {
    if (!engagement) return;
    setError("");
    setMessage("");
    try {
      dispatch({
        type: "FUND_ENGAGEMENT",
        engagementId: engagement.id,
        entrepreneurId: user!.id,
      });
      setMessage(t("flow.fundSuccess"));
      router.push(jobDetailHref(engagement.jobId, engagement.id, "workspace"));
    } catch (err) {
      setError(
        err instanceof FlowchartError && err.code === "INSUFFICIENT_FUNDS"
          ? t("flow.insufficient")
          : t("flow.error")
      );
    }
  }

  return (
    <FlowPage
      title={t("flow.depositTitle")}
      subtitle={t("flow.depositSubtitle")}
      backHref="/wallet"
    >
      <FlowCard>
        <p className="text-[12px] text-[#888]">
          {t("flow.available")}:{" "}
          <strong className="tabular-nums text-[#111]">฿{formatThb(balance)}</strong>
        </p>
        {/* UI-ONLY: fake top-up. API must call the payment provider then credit the ledger. */}
        <form onSubmit={handleDeposit} className="mt-4 space-y-3">
          <label className="block text-[13px] font-medium text-[#333]">
            {t("flow.depositAmount")}
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`mt-1.5 ${fieldClass}`}
              required
            />
          </label>
          <button type="submit" className={primaryBtn}>
            {t("flow.depositCta")}
          </button>
        </form>
      </FlowCard>

      {engagement && engagement.paymentStatus === "unfunded" && (
        <FlowCard>
          <p className="text-[13px] font-semibold text-[#111]">
            {t("flow.fundHint", { amount: formatThb(needed) })}
          </p>
          {shortfall > 0 ? (
            <p className="mt-2 text-[13px] text-[#9d003b]">
              {t("flow.fundNeedMore", { amount: formatThb(shortfall) })}
            </p>
          ) : (
            <button type="button" onClick={handleFund} className={`${primaryBtn} mt-4`}>
              {t("flow.fundJob")}
            </button>
          )}
        </FlowCard>
      )}

      {message && <p className="text-[13px] text-[#0f7b34]">{message}</p>}
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}

      <button type="button" onClick={() => router.push("/wallet")} className={secondaryBtn}>
        {t("common.wallet")}
      </button>
    </FlowPage>
  );
}
