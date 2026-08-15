"use client";

import { useState } from "react";
import { FlowCard, FlowPage, fieldClass, primaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { FlowchartError } from "@/lib/flowchart/types";
import { getWalletBalance } from "@/lib/flowchart/reducer";

export default function WithdrawContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user) return null;

  const balance = getWalletBalance(state, user.id);
  const hasBank = Boolean(user.paymentAccount?.accountNumber);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!hasBank) {
      setError(t("flow.noBank"));
      return;
    }
    try {
      // RISK: real withdraw needs KYC, payout provider, and a pending→settled state.
      dispatch({ type: "WITHDRAW", userId: user!.id, amount: Number(amount) });
      setAmount("");
      setMessage(t("flow.withdrawSuccess"));
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
      title={t("flow.withdrawTitle")}
      subtitle={t("flow.withdrawSubtitle")}
      backHref="/wallet"
    >
      <FlowCard>
        <p className="text-[12px] text-[#888]">
          {t("flow.available")}:{" "}
          <strong className="tabular-nums text-[#111]">
            ฿{balance.toLocaleString("en-TH")}
          </strong>
        </p>
        {user.paymentAccount?.bankName && (
          <p className="mt-2 text-[13px] text-[#555]">
            {user.paymentAccount.bankName} · {user.paymentAccount.accountNumber}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block text-[13px] font-medium text-[#333]">
            {t("flow.depositAmount")}
            <input
              type="number"
              min={1}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`mt-1.5 ${fieldClass}`}
              required
            />
          </label>
          <button type="submit" disabled={!hasBank} className={primaryBtn}>
            {t("flow.withdrawCta")}
          </button>
        </form>
      </FlowCard>
      {message && <p className="text-[13px] text-[#0f7b34]">{message}</p>}
      {error && <p className="text-[13px] text-[#c0392b]">{error}</p>}
    </FlowPage>
  );
}
