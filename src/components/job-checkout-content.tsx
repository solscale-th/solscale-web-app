"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { findJobById } from "@/lib/flowchart/jobs";

type PayMethod = "card" | "promptpay" | "bank";

function baht(amount: number): string {
  return `฿${amount.toLocaleString("en-US")}`;
}

function checkoutLines(deliverables: string[]): { label: string; amount: number }[] {
  const lines: { label: string; amount: number }[] = [];
  for (const line of deliverables) {
    if (/^total\b/i.test(line.trim())) continue;
    const match = line.match(/\(฿([\d,]+)\)\s*$/);
    if (!match) continue;
    const amount = Number(match[1].replace(/,/g, ""));
    if (!Number.isFinite(amount)) continue;
    lines.push({
      label: line.replace(/\s*\(฿[\d,]+\)\s*$/, ""),
      amount,
    });
  }
  return lines;
}

export default function JobCheckoutContent({ jobId }: { jobId: string }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const engagementId = searchParams.get("engagement");
  const [method, setMethod] = useState<PayMethod | null>(null);
  const [slip, setSlip] = useState<File | null>(null);
  const [slipError, setSlipError] = useState("");
  const [slipUrl, setSlipUrl] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const slipInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  const engagement = state.engagements.find(
    (item) =>
      item.id === engagementId &&
      item.jobId === jobId &&
      item.entrepreneurId === user?.id &&
      item.source === "invite"
  );
  const job = findJobById(jobId);
  const lines = checkoutLines(job?.deliverables ?? []);
  const subtotal =
    lines.reduce((sum, line) => sum + line.amount, 0) ||
    engagement?.escrowAmount ||
    job?.budgetMax ||
    0;
  const pricedLines =
    lines.length > 0
      ? lines
      : [{ label: job?.title ?? "", amount: subtotal }];
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;

  const methods: { id: PayMethod; label: string }[] = [
    { id: "card", label: t("jobDetail.payCard") },
    { id: "promptpay", label: t("jobDetail.payPromptPay") },
    { id: "bank", label: t("jobDetail.payBank") },
  ];

  useEffect(() => {
    if (paid) dialogRef.current?.focus();
  }, [paid]);

  useEffect(() => {
    return () => {
      if (slipUrl) URL.revokeObjectURL(slipUrl);
    };
  }, [slipUrl]);

  function chooseSlip(list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    const image =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp|heic|heif|avif)$/i.test(file.name);
    if (!image) {
      setSlipError(t("jobDetail.paySlipInvalid"));
      if (slipInputRef.current) slipInputRef.current.value = "";
      return;
    }
    setSlipError("");
    setSlip(file);
    setSlipUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    if (slipInputRef.current) slipInputRef.current.value = "";
  }

  if (!user) return null;

  function handlePay() {
    if (!engagement || !method || !slip || engagement.checkoutPaid) return;
    dispatch({ type: "PAY_JOB", engagementId: engagement.id });
    setPaid(true);
  }

  function closePaid() {
    setPaid(false);
    router.push("/direct");
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <MainHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 px-4 py-10 sm:px-8">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#888] hover:text-brand"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("common.back")}
        </Link>
        <h1 className="text-[22px] font-bold tracking-tight text-[#111]">{t("jobDetail.paySubmit")}</h1>

        <section className="rounded-2xl border border-[#ece7e1] bg-white p-5 shadow-[0_1px_2px_rgba(40,20,10,0.04)]">
          {job && <p className="text-[15px] font-semibold text-[#111]">{job.title}</p>}
          <ul className="mt-4 space-y-3">
            {pricedLines.map((line) => (
              <li key={line.label} className="flex items-start justify-between gap-4 text-[14px]">
                <span className="text-[#3a3530]">{line.label}</span>
                <span className="shrink-0 tabular-nums font-medium text-[#141414]">{baht(line.amount)}</span>
              </li>
            ))}
            <li className="flex items-start justify-between gap-4 text-[14px]">
              <span className="text-[#3a3530]">{t("jobDetail.platformFee")}</span>
              <span className="shrink-0 tabular-nums font-medium text-[#141414]">{baht(fee)}</span>
            </li>
          </ul>
          <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#f0f0f0] pt-4">
            <span className="text-[14px] font-semibold text-[#141414]">{t("jobDetail.payTotal")}</span>
            <span className="text-[28px] font-semibold tabular-nums tracking-[-0.03em] text-brand">
              {baht(total)}
            </span>
          </div>
        </section>

        <fieldset className="rounded-2xl border border-[#ece7e1] bg-white p-5 shadow-[0_1px_2px_rgba(40,20,10,0.04)]">
          <legend className="px-1 text-[14px] font-semibold text-[#141414]">
            {t("jobDetail.payMethod")}
          </legend>
          <div className="mt-3 space-y-2">
            {methods.map((item) => {
              const selected = method === item.id;
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-[14px] ${
                    selected
                      ? "border-brand bg-brand/5 font-semibold text-brand"
                      : "border-[#e7e2dc] text-[#3a3530]"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={item.id}
                    checked={selected}
                    onChange={() => setMethod(item.id)}
                    className="accent-brand"
                  />
                  {item.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <section className="rounded-2xl border border-[#ece7e1] bg-white p-5 shadow-[0_1px_2px_rgba(40,20,10,0.04)]">
          <p className="text-[14px] font-semibold text-[#141414]">{t("jobDetail.paySlip")}</p>
          <p className="mt-1 text-[13px] text-[#8a8580]">{t("jobDetail.paySlipHint")}</p>
          <input
            ref={slipInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => chooseSlip(event.target.files)}
          />
          <button
            type="button"
            onClick={() => slipInputRef.current?.click()}
            className="mt-3 flex h-24 w-full items-center justify-center rounded-xl border border-dashed border-[#d7d0c8] bg-surface text-[14px] font-semibold text-brand hover:border-brand"
          >
            {t("jobDetail.paySlip")}
          </button>
          {slipError && <p className="mt-2 text-[13px] text-[#c0392b]">{slipError}</p>}
          {slip && slipUrl && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-surface px-3.5 py-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slipUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <span className="min-w-0 truncate text-[13px] text-[#3a3530]">{slip.name}</span>
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={handlePay}
          disabled={!method || !slip || !engagement || engagement.checkoutPaid}
          className="flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("jobDetail.paySubmit")}
        </button>
      </main>
      <SiteFooter />

      {paid && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t("jobDetail.paySuccessOk")}
            className="absolute inset-0 bg-black/40"
            onClick={closePaid}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative z-10 w-full max-w-md rounded-t-[1.75rem] bg-white p-6 text-center shadow-[0_24px_64px_rgba(17,17,17,0.18)] outline-none sm:rounded-[1.75rem]"
          >
            <p id={titleId} className="text-[18px] font-semibold tracking-[-0.02em] text-[#141414]">
              {t("jobDetail.paySuccess")}
            </p>
            <button
              type="button"
              onClick={closePaid}
              className="mt-6 flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white hover:bg-brand-hover"
            >
              {t("jobDetail.paySuccessOk")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
