"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  formatBudgetRange,
  formatPosted,
  type Job,
} from "@/lib/mock-jobs";
import {
  MOCK_DIRECT_OFFERS,
  type DirectOfferStatus,
} from "@/lib/mock-direct";

function CheckIcon({ className = "mt-0.5 shrink-0 text-[#9d003b]" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path
        d="M2.5 7.3L5.3 10.1L11.5 3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-6 w-1 shrink-0 rounded-full bg-[#9d003b]" />
      <h2 className="text-[17px] sm:text-[18px] font-extrabold tracking-tight text-[#111]">
        {children}
      </h2>
    </div>
  );
}

type JobDetailContentProps = {
  job: Job;
};

export default function JobDetailContent({ job }: JobDetailContentProps) {
  const { t, dictionary } = useLanguage();
  const { user } = useAuth();

  const [coverMessage, setCoverMessage] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "done">("idle");

  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "done">("idle");

  const initialOfferStatus = useMemo((): DirectOfferStatus | null => {
    if (user?.role !== "influencer") return null;
    const offers = MOCK_DIRECT_OFFERS[user.id] ?? MOCK_DIRECT_OFFERS["1"] ?? [];
    return offers.find((o) => o.jobId === job.id)?.status ?? null;
  }, [user, job.id]);

  const [offerStatus, setOfferStatus] = useState<DirectOfferStatus | null>(initialOfferStatus);

  useEffect(() => {
    setOfferStatus(initialOfferStatus);
  }, [initialOfferStatus]);

  /** Application form only when there is no invite, or the invite was accepted. */
  const showApplicationSection = offerStatus === null || offerStatus === "accepted";
  const isPendingOffer = offerStatus === "pending";
  const isDeclinedOffer = offerStatus === "declined";

  const pageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"],
  });
  const sidebarScrollY = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const sidebarShadow = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [
      "0 4px 24px rgba(0,0,0,0.05)",
      "0 10px 32px rgba(157,0,59,0.12)",
      "0 14px 36px rgba(157,0,59,0.14)",
    ]
  );

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setApplyStatus("submitting");
    setTimeout(() => setApplyStatus("done"), 1200);
  }

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setAskStatus("sending");
    setTimeout(() => setAskStatus("done"), 1000);
  }

  return (
    <div ref={pageRef} className="relative min-h-screen bg-[#f5f5f3]">
      {/* Soft atmospheric wash — same palette, no new hues */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(157,0,59,0.07),transparent_70%)]"
      />

      <MainHeader />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#555] hover:bg-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("jobDetail.back")}
          </Link>
          {/* <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e8e8e8] bg-white text-[#555] shadow-sm hover:border-[#9d003b]/30 hover:text-[#9d003b] transition-colors"
            aria-label={t("jobDetail.saveForLater")}
          >
            <BookmarkIcon />
          </button> */}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 pb-12 sm:pb-16 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8 lg:gap-10 items-start">
          {/* ── Main column ── */}
          <div className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {job.promoted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff2f] px-3 py-1.5 text-[12px] font-medium leading-none text-[#333]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden className="shrink-0">
                      <path d="M5 0L6.2 3.8H10L7 6.1L8.2 10L5 7.6L1.8 10L3 6.1L0 3.8H3.8L5 0Z" />
                    </svg>
                    {t("jobDetail.promoted")}
                  </span>
                )}
                {/* <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9d003b]/20 bg-[#9d003b]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9d003b]">
                  {job.platform}
                </span> */}
                {offerStatus === "accepted" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-3 py-1 text-[11px] font-semibold text-[#059669]">
                    <CheckIcon className="text-[#059669]" />
                    {t("jobDetail.offerAcceptedBadge")}
                  </span>
                )}
              </div>

              <h1 className="text-[1.75rem] sm:text-3xl lg:text-[2.45rem] font-extrabold leading-[1.25] tracking-tight text-[#111]">
                {job.title}
              </h1>

              {/* <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#666]">
                {job.description}
              </p> */}

            </motion.div>

            {/* Brief */}
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="mt-8 rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            >
              <SectionHeading>{t("jobDetail.campaignBrief")}</SectionHeading>
              <p className="text-[15px] leading-[1.85] text-[#333]">{job.brief}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-[#9d003b]/15 bg-[#9d003b]/5 px-3 py-1.5 text-[12px] font-semibold text-[#9d003b]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.section>

            {/* Deliverables + Requirements */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.4 }}
                className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <SectionHeading>{t("jobDetail.deliverables")}</SectionHeading>
                <ul className="space-y-3.5">
                  {job.deliverables.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.28 + i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl bg-[#f5f5f3] px-3.5 py-3"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#9d003b]/10 text-[12px] font-bold text-[#9d003b]">
                        {i + 1}
                      </span>
                      <span className="text-[14px] leading-snug font-medium text-[#333]">{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <SectionHeading>{t("jobDetail.requirements")}</SectionHeading>
                <ul className="space-y-3.5">
                  {job.requirements.map((req, i) => (
                    <motion.li
                      key={req}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.34 + i * 0.05 }}
                      className="flex items-center gap-3 rounded-xl bg-[#f5f5f3] px-3.5 py-3"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#9d003b]/10 text-[12px] font-bold text-[#9d003b]">
                        {i + 1}
                      </span>
                      <span className="text-[14px] leading-snug font-medium text-[#333]">{req}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.section>
            </div>

            {/* Forms — Ask first; Apply stacks below when available */}
            <div className="mt-12 grid grid-cols-1 gap-5">
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#9d003b]/10 text-[#9d003b]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path
                        d="M3 4H15V12H9L5 15.5V12H3V4Z"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111]">
                      {dictionary.jobDetail.askSection.title}
                    </h3>
                    <p className="mt-0.5 text-[13px] text-[#888]">
                      {dictionary.jobDetail.askSection.subtitle}
                    </p>
                  </div>
                </div>

                {askStatus === "done" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-[#f5f5f3] py-7 text-center"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#9d003b]/10 text-[#9d003b]">
                      <CheckIcon />
                    </span>
                    <p className="text-[14px] font-bold text-[#9d003b]">
                      {dictionary.jobDetail.askSection.successTitle}
                    </p>
                    <p className="max-w-xs text-[13px] text-[#555]">
                      {dictionary.jobDetail.askSection.successBody}
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleAsk} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                        {dictionary.jobDetail.askSection.questionLabel}
                        <span className="ml-1 text-[#9d003b]">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder={dictionary.jobDetail.askSection.questionPlaceholder}
                        className="w-full resize-none rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#333] placeholder-[#bbb] outline-none focus:border-[#9d003b] focus:bg-white transition-colors"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={askStatus === "sending"}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#9d003b] bg-white text-[14px] font-semibold text-[#9d003b] hover:bg-[#9d003b]/5 disabled:opacity-60 transition-colors"
                    >
                      {askStatus === "sending" ? (
                        <>
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeDasharray="28"
                              strokeDashoffset="10"
                            />
                          </svg>
                          {dictionary.jobDetail.askSection.sending}
                        </>
                      ) : (
                        dictionary.jobDetail.askSection.send
                      )}
                    </motion.button>
                  </form>
                )}
              </motion.section>

              {showApplicationSection && (
                <motion.section
                  id="work-submission-form"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: 0.06 }}
                  className="rounded-2xl border border-[#ebebeb] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#9d003b]/10 text-[#9d003b]">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M3 4.5H15V14.5H3V4.5Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path d="M3 4.5L9 9.5L15 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111]">
                        {dictionary.jobDetail.applySection.title}
                      </h3>
                      <p className="mt-0.5 text-[13px] text-[#888]">
                        {dictionary.jobDetail.applySection.subtitle}
                      </p>
                    </div>
                  </div>

                  {applyStatus === "done" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-[#ecfdf5] py-7 text-center"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#059669]/15 text-[#059669]">
                        <CheckIcon className="text-[#059669]" />
                      </span>
                      <p className="text-[14px] font-bold text-[#059669]">
                        {dictionary.jobDetail.applySection.successTitle}
                      </p>
                      <p className="max-w-xs text-[13px] text-[#555]">
                        {dictionary.jobDetail.applySection.successBody}
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleApply} className="mt-5 space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                          {dictionary.jobDetail.applySection.coverLabel}
                          <span className="ml-1 text-[#9d003b]">*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={coverMessage}
                          onChange={(e) => setCoverMessage(e.target.value)}
                          placeholder={dictionary.jobDetail.applySection.coverPlaceholder}
                          className="w-full resize-none rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#333] placeholder-[#bbb] outline-none focus:border-[#9d003b] focus:bg-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold text-[#333]">
                          {dictionary.jobDetail.applySection.portfolioLabel}
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          placeholder={dictionary.jobDetail.applySection.portfolioPlaceholder}
                          className="w-full rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#333] placeholder-[#bbb] outline-none focus:border-[#9d003b] focus:bg-white transition-colors"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={applyStatus === "submitting"}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] disabled:opacity-60 transition-colors"
                      >
                        {applyStatus === "submitting" ? (
                          <>
                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <circle
                                cx="8"
                                cy="8"
                                r="6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="28"
                                strokeDashoffset="10"
                              />
                            </svg>
                            {dictionary.jobDetail.applySection.submitting}
                          </>
                        ) : (
                          dictionary.jobDetail.applySection.submit
                        )}
                      </motion.button>
                    </form>
                  )}
                </motion.section>
              )}
            </div>
          </div>

          {/* ── Sticky sidebar (plain aside — motion transforms on child only) ── */}
          <aside className="self-start lg:sticky lg:top-20 lg:z-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              <motion.div
                style={{ y: sidebarScrollY, boxShadow: sidebarShadow }}
                className="overflow-hidden rounded-2xl border border-[#ebebeb] bg-[linear-gradient(135deg,rgba(157,0,59,0.10)_0%,rgba(157,0,59,0.05)_25%,rgba(157,0,59,0.02)_40%,rgba(214,238,58,0.08)_60%,rgba(214,238,58,0.14)_100%)]"
              >
              {/* Entrepreneur — only the › button navigates to profile */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="flex w-full items-center gap-3.5 px-4 py-4"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#9d003b] text-[16px] font-bold text-white shadow-sm ring-2 ring-white">
                  {job.company.charAt(0)}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-[#9d003b]">
                    {t("jobDetail.aboutBrand")}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
                    <span className="truncate text-[15px] font-bold text-[#111]">
                      {job.company}
                    </span>
                    {job.verified && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="shrink-0"
                        aria-label={t("common.verified")}
                      >
                        <circle cx="8" cy="8" r="7" fill="#059669" />
                        <path
                          d="M4.8 8.1L7 10.2L11.2 5.8"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <Link
                  href={`/entrepreneurs/${job.companyId}`}
                  aria-label={t("jobDetail.aboutBrand")}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#9d003b]/10 text-[#9d003b] transition-colors hover:bg-[#9d003b] hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M5 2L10 7L5 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: 0.12 }}
                className="px-5 pb-5"
              >
                <p className="text-[10px] font-semibold tracking-widest text-[#9d003b]">
                  {t("jobDetail.budgetRange")}
                </p>
                <p className="mt-1.5 text-[22px] font-extrabold tracking-tight text-[#111]">
                  {formatBudgetRange(job.budgetMin, job.budgetMax)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: 0.18 }}
                className="grid grid-cols-2"
              >
                {[
                  { label: t("jobDetail.workPeriod"), value: job.duration },
                  { label: t("jobDetail.applicants"), value: String(job.applied) },
                  { label: t("jobDetail.location"), value: job.location },
                  { label: t("jobDetail.posted"), value: formatPosted(job.postedDaysAgo) },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.3, delay: 0.22 + i * 0.05 }}
                    className="px-4 py-3.5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#999]">
                      {stat.label}
                    </p>
                    <p className="mt-1 truncate text-[13px] font-bold text-[#222]">{stat.value}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35, delay: 0.28 }}
                className="space-y-2.5 p-4"
              >
                {isPendingOffer ? (
                  <>
                    <div className="mb-1 rounded-xl border border-[#9d003b]/10 bg-[#9d003b]/5 px-3.5 py-3">
                      <p className="text-[13px] font-bold text-[#111]">
                        {t("jobDetail.offerPendingTitle")}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#666]">
                        {t("jobDetail.offerPendingBody")}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setOfferStatus("accepted")}
                      className="flex h-11 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] transition-colors"
                    >
                      {t("jobDetail.acceptOffer")}
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setOfferStatus("declined")}
                      className="flex h-11 w-full items-center justify-center rounded-xl border border-[#9d003b]/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-[#9d003b]/40 transition-colors"
                    >
                      {t("jobDetail.declineOffer")}
                    </motion.button>
                  </>
                ) : isDeclinedOffer ? (
                  <div className="rounded-xl border border-[#9d003b]/10 bg-[#9d003b]/5 px-3.5 py-4 text-center">
                    <p className="text-[13px] font-bold text-[#333]">
                      {t("jobDetail.offerDeclinedTitle")}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#666]">
                      {t("jobDetail.offerDeclinedBody")}
                    </p>
                  </div>
                ) : (
                  <>
                    <motion.a
                      href="#work-submission-form"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex h-11 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] transition-colors"
                    >
                      {t("jobDetail.applyNow")}
                    </motion.a>
                    {offerStatus !== "accepted" && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#9d003b]/20 bg-white/60 text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
                      >
                        <BookmarkIcon />
                        {t("jobDetail.saveForLater")}
                      </motion.button>
                    )}
                  </>
                )}
              </motion.div>
              </motion.div>
            </motion.div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
