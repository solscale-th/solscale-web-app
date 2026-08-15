"use client";

import Link from "next/link";
import { FlowCard, FlowPage, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { getWalletBalance } from "@/lib/flowchart/reducer";

function formatThb(amount: number) {
  return amount.toLocaleString("en-TH");
}

export default function WalletContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state } = useFlowchart();

  if (!user) return null;

  const balance = getWalletBalance(state, user.id);
  const isInfluencer = user.role === "influencer";
  const pending = state.engagements.filter((eng) =>
    isInfluencer
      ? eng.influencerId === user.id && eng.paymentStatus === "unfunded"
      : eng.entrepreneurId === user.id && eng.paymentStatus === "unfunded"
  );

  return (
    <FlowPage
      title={t("flow.walletTitle")}
      subtitle={
        isInfluencer
          ? t("flow.walletSubtitleInfluencer")
          : t("flow.walletSubtitleEntrepreneur")
      }
    >
      <FlowCard>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999]">
          {t("flow.available")}
        </p>
        <p className="mt-1 text-[32px] font-bold tabular-nums tracking-tight text-[#111]">
          ฿{formatThb(balance)}
          <span className="ml-2 text-[13px] font-medium text-[#888]">
            {t("flow.currency")}
          </span>
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {!isInfluencer && (
            <Link href="/wallet/deposit" className={primaryBtn}>
              {t("flow.deposit")}
            </Link>
          )}
          {isInfluencer && (
            <Link href="/wallet/withdraw" className={primaryBtn}>
              {t("flow.withdraw")}
            </Link>
          )}
          {!isInfluencer && (
            <Link href="/wallet/withdraw" className={secondaryBtn}>
              {t("flow.withdraw")}
            </Link>
          )}
        </div>
      </FlowCard>

      {pending.length > 0 && (
        <FlowCard>
          <p className="text-[13px] font-semibold text-[#111]">
            {t("flow.awaitingDeposit")}
          </p>
          <ul className="mt-3 space-y-2">
            {pending.map((eng) => (
              <li key={eng.id}>
                <Link
                  href={
                    isInfluencer
                      ? `/my-jobs/${eng.id}`
                      : `/wallet/deposit?engagementId=${eng.id}`
                  }
                  className="flex items-center justify-between rounded-xl bg-[#faf8f6] px-3.5 py-3 text-[13px] hover:bg-[#f3eee8]"
                >
                  <span className="font-medium text-[#333]">{eng.influencerName}</span>
                  <span className="tabular-nums text-[#9d003b]">
                    ฿{formatThb(eng.escrowAmount)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FlowCard>
      )}
    </FlowPage>
  );
}
