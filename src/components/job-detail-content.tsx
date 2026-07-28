"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import {
  formatBudgetRange,
  formatPosted,
  type Job,
} from "@/lib/mock-jobs";

const MotionLink = motion.create(Link);

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 11 11" fill="#F59E0B">
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="mt-0.5 shrink-0 text-[#9d003b]">
      <path d="M2.5 7.3L5.3 10.1L11.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#9d003b]">
      {children}
    </p>
  );
}

function Chip({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#555]">
      {text}
    </span>
  );
}

function StatTile({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-[#eee] bg-white px-4 py-3.5 shadow-sm"
    >
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#9d003b]">{label}</p>
      <p className="truncate text-[13px] font-medium text-[#222]">{value}</p>
    </motion.div>
  );
}

type JobDetailContentProps = {
  job: Job;
  relatedJobs: Job[];
};

export default function JobDetailContent({
  job,
  relatedJobs,
}: JobDetailContentProps) {
  const { t, dictionary } = useLanguage();

  const [coverMessage, setCoverMessage] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "done">("idle");

  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "done">("idle");

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
    <div className="min-h-screen bg-[#f5f5f3]">
      <MainHeader />

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#555] hover:bg-[#eee] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t("jobDetail.back")}
          </Link>
          <div className="flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#555] hover:border-[#ccc] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11 1.5L14.5 5V14.5H10.5V10H5.5V14.5H1.5V5L5 1.5H11Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full border border-[#e5e5e5] bg-white text-[#555] hover:border-[#ccc] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
          {/* Title block */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-4"
            >
              {job.promoted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#d7ff2f] px-3 py-1 text-[11px] font-bold text-[#333]">
                  ✦ {t("jobDetail.promoted")}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9d003b]/25 bg-[#9d003b]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#9d003b]">
                {job.platform} · {job.duration}
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="text-2xl sm:text-3xl lg:text-[2.6rem] font-black leading-tight tracking-tight text-[#111]"
            >
              {job.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.24 }}
              className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#666]"
            >
              {job.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap gap-2"
            >
              <Chip text={`📍 ${job.location}`} />
              <Chip text={`⏱ ${job.duration}`} />
              <Chip text={t("jobDetail.applied", { count: job.applied })} />
              <Chip text={formatBudgetRange(job.budgetMin, job.budgetMax)} />
            </motion.div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-2.5">
            <StatTile label={t("jobDetail.budgetRange")} value={formatBudgetRange(job.budgetMin, job.budgetMax)} delay={0.35} />
            <StatTile label={t("jobDetail.workPeriod")} value={job.duration} delay={0.42} />
            <StatTile label={t("jobDetail.applicants")} value={t("jobDetail.applied", { count: job.applied })} delay={0.49} />
            <StatTile label={t("jobDetail.posted")} value={formatPosted(job.postedDaysAgo)} delay={0.56} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="my-8 sm:my-10 h-px bg-gradient-to-r from-transparent via-[#9d003b]/25 to-transparent"
        />
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 pb-10 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left column */}
          <div>
            {job.aboutBrand && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-9"
              >
                <SectionLabel>{t("jobDetail.aboutBrand")}</SectionLabel>
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 rounded-xl bg-[#f0f0f0]" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/entrepreneurs/${job.companyId}`}
                        className="text-[14px] font-bold text-[#111] hover:text-[#9d003b] hover:underline transition-colors"
                      >
                        {job.company}
                      </Link>
                      {job.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-semibold text-[#059669]">
                          ✓ {t("common.verified")}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[#666]">
                      <StarIcon />
                      <span className="font-semibold text-[#111]">{job.companyRating}</span>
                      <span>({job.companyReviews} {t("common.reviews")})</span>
                    </div>
                    <a href={`https://${job.website}`} className="mt-0.5 inline-block truncate text-[12px] text-[#888] hover:text-[#9d003b] transition-colors">
                      🌐 {job.website}
                    </a>
                  </div>
                </div>
                <p className="text-[14px] leading-[1.8] text-[#555]">{job.aboutBrand}</p>
              </motion.div>
            )}

            <div className="mb-9">
              <SectionLabel>{t("jobDetail.campaignBrief")}</SectionLabel>
              <p className="text-[14px] leading-relaxed text-[#555]">{job.brief}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[12px] font-medium text-[#666]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>{t("jobDetail.deliverables")}</SectionLabel>
              <ul className="space-y-3">
                {job.deliverables.map((item, i) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <CheckIcon />
                    <span className="text-[14px] leading-relaxed text-[#555]">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="mb-9">
              <SectionLabel>{t("jobDetail.requirements")}</SectionLabel>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <motion.li
                    key={req}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-[7px] h-[5px] w-[5px] shrink-0 rounded-full bg-[#9d003b]" />
                    <span className="text-[14px] leading-relaxed text-[#555]">{req}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col gap-3"
            >
              <motion.a
                href="#application-form"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] transition-colors"
              >
                {t("jobDetail.applyNow")}
              </motion.a>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#ddd] bg-white text-[14px] font-medium text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                </svg>
                {t("jobDetail.saveForLater")}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Application forms */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submit Application */}
          <motion.section
            id="application-form"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#fce8ee] text-lg">
                📝
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
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-[#ecfdf5] py-6 text-center"
              >
                <span className="text-2xl">🎉</span>
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white hover:bg-[#850030] disabled:opacity-60 transition-colors"
                >
                  {applyStatus === "submitting" ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
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

          {/* Ask for More Information */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="rounded-2xl border border-[#eee] bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f4ff] text-lg">
                💬
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
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-[#eff6ff] py-6 text-center"
              >
                <span className="text-2xl">✅</span>
                <p className="text-[14px] font-bold text-[#2563eb]">
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
                    className="w-full resize-none rounded-xl border border-[#e0e0e0] bg-[#fafafa] px-4 py-3 text-[14px] text-[#333] placeholder-[#bbb] outline-none focus:border-[#2563eb] focus:bg-white transition-colors"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={askStatus === "sending"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2563eb] bg-white text-[14px] font-semibold text-[#2563eb] hover:bg-[#eff6ff] disabled:opacity-60 transition-colors"
                >
                  {askStatus === "sending" ? (
                    <>
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="10" />
                      </svg>
                      {dictionary.jobDetail.askSection.sending}
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M13 2L2 7L6.5 8.5L8.5 13L13 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                      {dictionary.jobDetail.askSection.send}
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.section>
        </div>

        {/* Related jobs */}
        {relatedJobs.length > 0 && (
          <section className="mt-14 sm:mt-16">
            <h2 className="text-[17px] font-bold text-[#111]">
              {t("jobDetail.moreJobs", { platform: job.platform })}
            </h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relatedJobs.map((related, i) => (
                <MotionLink
                  key={related.id}
                  href={`/jobs/${related.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: i * 0.05, duration: 0.35 }}
                  whileHover={{ y: -3 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div className={`h-36 ${related.thumbnailBg}`} />
                  <div className="flex flex-1 flex-col gap-2 p-3.5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-[#eee]" />
                      <span className="truncate text-[12px] font-medium text-[#444]">{related.company}</span>
                    </div>
                    <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-[#111]">{related.title}</h3>
                    <p className="line-clamp-2 text-[11px] leading-relaxed text-[#888]">{related.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {related.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[10px] font-medium text-[#666]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-1">
                      <span className="text-[13px] font-bold text-[#9d003b]">
                        {formatBudgetRange(related.budgetMin, related.budgetMax)}
                      </span>
                      <span className="rounded-xl bg-[#9d003b] px-3.5 py-1.5 text-[12px] font-semibold text-white">
                        {t("jobDetail.applyNow")}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#bbb]">
                      {t("jobDetail.posted")} {formatPosted(related.postedDaysAgo)}
                    </p>
                  </div>
                </MotionLink>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
