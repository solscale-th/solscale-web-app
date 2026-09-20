"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, MotionConfig } from "motion/react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  formatBudgetRange,
  formatPosted,
  PLATFORM_COLORS,
  type Job,
} from "@/lib/mock-jobs";
import type { DirectOfferStatus } from "@/lib/mock-direct";
import { useFlowchart } from "@/hooks/use-flowchart";
import { buildApplication, buildEngagement } from "@/lib/flowchart/builders";
import { escrowAmountForJob } from "@/lib/flowchart/jobs";
import JobWorkspaceSection from "@/components/job-workspace-section";
import { jobDetailHref } from "@/lib/job-detail-href";
import { acceptInvite, declineInvite, parseApiId } from "@/lib/applications";
import { markMyJobSeen } from "@/lib/seen-my-jobs";
import type { FlowEngagement } from "@/lib/flowchart/types";

const PANEL =
  "rounded-[1.25rem] border border-[#ece7e1] bg-white shadow-panel";
const FIELD =
  "w-full rounded-lg border border-[#e0dbd5] bg-surface px-4 py-3 text-[14px] text-[#2a2622] placeholder-[#b3aca4] outline-none transition-[border-color,background-color,box-shadow] focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/25";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
const FOCUS_RING_ON_DARK =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep";

function CheckIcon({ className = "shrink-0" }: { className?: string }) {
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

const TONES = {
  brand: { tile: "bg-brand/10 text-brand", mark: "text-brand" },
  green: { tile: "bg-[#0f7b34]/10 text-[#0f7b34]", mark: "text-[#0f7b34]" },
} as const;

type Tone = keyof typeof TONES;

function PanelHeading({
  icon,
  tone = "brand",
  children,
}: {
  icon: React.ReactNode;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b border-[#f1ece6] pb-4">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[0.6rem] ${TONES[tone].tile}`}>
        {icon}
      </span>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#141414]">{children}</h2>
    </div>
  );
}

/** Unordered list row — no index badge; these items have no sequence. */
function ListRow({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-surface px-3.5 py-3">
      <CheckIcon className={`mt-[3px] shrink-0 ${TONES[tone].mark}`} />
      <span className="text-[14px] leading-snug text-[#3a3530]">{children}</span>
    </li>
  );
}

function BandStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-white/15 sm:border-l sm:pl-7">
      <dt className="text-[12px] text-white/55">{label}</dt>
      <dd className="mt-1 text-[15px] font-semibold tabular-nums text-white">{value}</dd>
    </div>
  );
}

type JobDetailContentProps = {
  job: Job;
};

export default function JobDetailContent({ job }: JobDetailContentProps) {
  const { t, dictionary } = useLanguage();
  const { user } = useAuth();
  const { state, dispatch } = useFlowchart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const engagementIdParam = searchParams.get("engagement");

  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [acceptStatus, setAcceptStatus] = useState<"idle" | "submitting">("idle");

  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "done">("idle");

  const liveInvite = user
    ? state.invites.find(
        (item) => item.jobId === job.id && item.influencerId === user.id
      )
    : undefined;

  const offerStatus: DirectOfferStatus | null = liveInvite?.status ?? null;

  const userEngagements = useMemo((): FlowEngagement[] => {
    if (!user) return [];
    return state.engagements.filter(
      (item) =>
        item.jobId === job.id &&
        (item.influencerId === user.id || item.entrepreneurId === user.id)
    );
  }, [user, job.id, state.engagements]);

  const engagementForJob = useMemo((): FlowEngagement | undefined => {
    if (userEngagements.length === 0) return undefined;
    if (engagementIdParam) {
      return (
        userEngagements.find((item) => item.id === engagementIdParam) ??
        userEngagements[0]
      );
    }
    return userEngagements[0];
  }, [userEngagements, engagementIdParam]);

  useEffect(() => {
    if (engagementForJob) markMyJobSeen(engagementForJob.id);
  }, [engagementForJob?.id]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    function scrollToHash() {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // Workspace mounts after engagement resolves; retry once on the next frame.
    scrollToHash();
    const t1 = window.setTimeout(scrollToHash, 100);
    const t2 = window.setTimeout(scrollToHash, 350);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [engagementForJob?.id, engagementIdParam]);

  const isInfluencer = user?.role === "influencer";
  const hasEngagement = Boolean(engagementForJob && user);

  const isPendingOffer = offerStatus === "pending" && !hasEngagement;
  const isDeclinedOffer = offerStatus === "declined";
  const isAcceptedOffer = offerStatus === "accepted" || hasEngagement;

  const hasApplied = useMemo(() => {
    if (user?.role !== "influencer") return false;
    return state.applications.some(
      (app) => app.jobId === job.id && app.influencerId === user.id
    );
  }, [user, job.id, state.applications]);

  /** Chart: apply only on the marketplace path — not after match or invite. */
  const canApply =
    user?.role === "influencer" &&
    !hasEngagement &&
    !isPendingOffer &&
    !isDeclinedOffer &&
    !isAcceptedOffer;

  const platformStyle = PLATFORM_COLORS[job.platform];
  const budget = formatBudgetRange(job.budgetMin, job.budgetMax);
  const applyDone = hasApplied || applyStatus === "done";
  const showMobileApplyBar = canApply && !applyDone;

  function handleApply() {
    if (!user || applyStatus === "submitting" || hasApplied) return;
    setApplyStatus("submitting");
    try {
      // API connecting: mutation applyToJob(jobId, cover, portfolio).
      dispatch({
        type: "APPLY_TO_JOB",
        application: buildApplication({
          jobId: job.id,
          influencerId: user.id,
          entrepreneurId: job.companyId,
          influencerName: user.name,
          influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
          coverMessage: "",
        }),
      });
      setApplyStatus("done");
    } catch {
      setApplyStatus("idle");
    }
  }

  async function handleAcceptOffer() {
    if (!user || !liveInvite || acceptStatus === "submitting") return;
    const inviteId = liveInvite.id;
    const apiInviteId = parseApiId(inviteId);
    setAcceptStatus("submitting");
    if (apiInviteId) {
      try {
        await acceptInvite(apiInviteId);
      } catch {
        // Local flowchart still records the accept so the job can go active.
      }
    }
    const eng = buildEngagement({
      jobId: job.id,
      influencerId: user.id,
      entrepreneurId: liveInvite.entrepreneurId,
      influencerName: user.name,
      influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
      escrowAmount: escrowAmountForJob(job),
      source: "invite",
      sourceId: inviteId,
    });
    dispatch({ type: "ACCEPT_INVITE", inviteId, engagement: eng });
    setAcceptStatus("idle");
    router.push(jobDetailHref(job.id, eng.id, "workspace"));
  }

  async function handleDeclineOffer() {
    if (!user || !liveInvite) return;
    const inviteId = liveInvite.id;
    const apiInviteId = parseApiId(inviteId);
    if (apiInviteId) {
      try {
        await declineInvite(apiInviteId);
      } catch {
        // Fall through to local decline.
      }
    }
    dispatch({
      type: "DECLINE_INVITE",
      inviteId,
    });
  }

  function handleWorkUpdate(next: {
    workStatus?: FlowEngagement["workStatus"];
    submissionNote?: string;
    reviewNote?: string;
  }) {
    if (!engagementForJob) return;
    if (next.workStatus === "submitted" && next.submissionNote) {
      dispatch({
        type: "SUBMIT_WORK",
        engagementId: engagementForJob.id,
        note: next.submissionNote,
      });
    } else if (next.workStatus === "revision_requested" && next.reviewNote) {
      dispatch({
        type: "REQUEST_REVISION",
        engagementId: engagementForJob.id,
        note: next.reviewNote,
      });
    } else if (next.workStatus === "approved") {
      dispatch({ type: "APPROVE_WORK", engagementId: engagementForJob.id });
    }
  }

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setAskStatus("sending");
    setTimeout(() => setAskStatus("done"), 1000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-surface">
        <MainHeader />

        {/* ── Colored hero band ── */}
        <section className="relative overflow-hidden bg-brand-deep text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="job-hero-wash absolute inset-0" />
            <div className="hero-glow hero-glow-a absolute -left-16 top-[-30%] h-72 w-72" />
            <div className="hero-glow hero-glow-b absolute right-[-6%] top-[10%] h-80 w-80" />
            <div className="hero-shape hero-shape-a absolute -left-32 bottom-[-60%] h-80 w-80 rounded-full border border-white/12" />
            <div className="hero-shape hero-shape-b absolute -right-24 top-[-40%] h-72 w-72 rounded-full border border-white/12" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-8">
            <Link
              href="/"
              className={`-ml-3 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white ${FOCUS_RING_ON_DARK}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t("jobDetail.back")}
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1.5 text-[12px] font-semibold leading-none"
                  style={{ backgroundColor: platformStyle.bg, color: platformStyle.text }}
                >
                  {job.platform}
                </span>
                {job.promoted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-[12px] font-semibold leading-none text-on-accent">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden className="shrink-0">
                      <path d="M5 0L6.2 3.8H10L7 6.1L8.2 10L5 7.6L1.8 10L3 6.1L0 3.8H3.8L5 0Z" />
                    </svg>
                    {t("jobDetail.promoted")}
                  </span>
                )}
                {offerStatus === "accepted" || hasEngagement ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7b34] px-3 py-1.5 text-[12px] font-semibold leading-none text-white">
                    <CheckIcon />
                    {t("jobDetail.offerAcceptedBadge")}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 max-w-3xl text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-[2.35rem] lg:text-[2.75rem]">
                {job.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent text-[12px] font-semibold text-brand-deep">
                    {job.company.charAt(0)}
                  </span>
                  <span className="font-medium text-white">{job.company}</span>
                  {job.verified && (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-label={t("common.verified")}>
                      <circle cx="8" cy="8" r="7" fill="var(--color-accent)" />
                      <path d="M4.8 8.1L7 10.2L11.2 5.8" stroke="var(--color-on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span aria-hidden className="text-white/25">·</span>
                <span>{job.location}</span>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-y-6 border-t border-white/15 pt-7 sm:flex sm:flex-wrap sm:items-end sm:gap-x-7">
                <div className="col-span-2 sm:pr-1">
                  <dt className="text-[12px] text-white/55">{t("jobDetail.budgetRange")}</dt>
                  <dd className="mt-1 text-[26px] font-semibold tracking-[-0.035em] tabular-nums text-accent sm:text-[30px]">
                    {budget}
                  </dd>
                </div>
                <BandStat label={t("jobDetail.workPeriod")} value={job.duration} />
                <BandStat label={t("jobDetail.applicants")} value={String(job.applied)} />
                <BandStat label={t("jobDetail.posted")} value={formatPosted(job.postedDaysAgo)} />
              </dl>
            </motion.div>
          </div>
        </section>

        {/* ── Content, lifted over the band ── */}
        <div className="relative z-10 -mt-20 flex-1">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-8 sm:pb-16">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
              {/* ── Main column ── */}
              <div className="min-w-0">
                {/* Brief */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`p-5 sm:p-7 ${PANEL}`}
                >
                  <PanelHeading
                    icon={
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M4 2.5H12V13.5H4V2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        <path d="M6.2 6H9.8M6.2 9H9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    }
                  >
                    {t("jobDetail.campaignBrief")}
                  </PanelHeading>

                  <p className="text-[15px] leading-[1.8] text-[#3a3530]">{job.brief}</p>

                  {job.tags.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {job.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-brand/8 px-3 py-1.5 text-[12px] font-medium text-brand"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.section>

                {/* Deliverables + Requirements */}
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-5 sm:p-7 ${PANEL}`}
                  >
                    <PanelHeading
                      tone="brand"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M2.5 5.2L8 2.5L13.5 5.2V10.8L8 13.5L2.5 10.8V5.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                          <path d="M2.5 5.2L8 8L13.5 5.2M8 8V13.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                        </svg>
                      }
                    >
                      {t("jobDetail.deliverables")}
                    </PanelHeading>
                    <ul className="space-y-2.5">
                      {job.deliverables.map((item) => (
                        <ListRow key={item} tone="brand">
                          {item}
                        </ListRow>
                      ))}
                    </ul>
                  </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className={`p-5 sm:p-7 ${PANEL}`}
                  >
                    <PanelHeading
                      tone="green"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <path d="M3 4.2H13M3 8H13M3 11.8H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      }
                    >
                      {t("jobDetail.requirements")}
                    </PanelHeading>
                    <ul className="space-y-2.5">
                      {job.requirements.map((req) => (
                        <ListRow key={req} tone="green">
                          {req}
                        </ListRow>
                      ))}
                    </ul>
                  </motion.section>
                </div>

                {/* Ask for more information */}
                <div className="mt-10 grid grid-cols-1 gap-5">
                  <motion.section
                    id="job-ask"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.4 }}
                    className={`p-5 sm:p-6 ${PANEL}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f4f0eb] text-[#6a6560]">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                          <path
                            d="M3 4H15V12H9L5 15.5V12H3V4Z"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#141414]">
                          {dictionary.jobDetail.askSection.title}
                        </h3>
                        <p className="mt-0.5 text-[13px] text-[#8a8580]">
                          {dictionary.jobDetail.askSection.subtitle}
                        </p>
                      </div>
                    </div>

                    {askStatus === "done" ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-surface py-7 text-center"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                          <CheckIcon />
                        </span>
                        <p className="text-[14px] font-semibold text-brand">
                          {dictionary.jobDetail.askSection.successTitle}
                        </p>
                        <p className="max-w-xs text-[13px] text-[#5a5550]">
                          {dictionary.jobDetail.askSection.successBody}
                        </p>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleAsk} className="mt-5 space-y-4">
                        <div>
                          <label
                            htmlFor="job-question"
                            className="mb-1.5 block text-[13px] font-semibold text-[#3a3530]"
                          >
                            {dictionary.jobDetail.askSection.questionLabel}
                            <span className="ml-1 text-brand">*</span>
                          </label>
                          <textarea
                            id="job-question"
                            required
                            rows={4}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder={dictionary.jobDetail.askSection.questionPlaceholder}
                            className={`resize-none ${FIELD}`}
                          />
                        </div>
                        <motion.button
                          type="submit"
                          disabled={askStatus === "sending" || !question.trim()}
                          whileHover={question.trim() && askStatus !== "sending" ? { y: -1 } : undefined}
                          whileTap={question.trim() && askStatus !== "sending" ? { scale: 0.99 } : undefined}
                          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dcd6cf] bg-white text-[14px] font-semibold text-[#3a3530] transition-colors hover:border-[#b9b1a8] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#dcd6cf] ${FOCUS_RING}`}
                        >
                          {askStatus === "sending" ? (
                            <>
                              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
                </div>

                {hasEngagement && engagementForJob && user && (
                  <JobWorkspaceSection
                    engagement={engagementForJob}
                    jobId={job.id}
                    isInfluencer={isInfluencer}
                    onWorkUpdate={handleWorkUpdate}
                  />
                )}
              </div>

              {/* ── Sticky action panel ── */}
              <aside className="self-start lg:sticky lg:top-20 lg:z-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`overflow-hidden ${PANEL}`}
                >
                  <div className="flex w-full items-center gap-3.5 bg-surface px-5 py-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-[16px] font-semibold text-white">
                      {job.company.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-[12px] text-[#9a9590]">{t("jobDetail.aboutBrand")}</p>
                      <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[15px] font-semibold text-[#141414]">
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
                            <circle cx="8" cy="8" r="7" fill="#0f7b34" />
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
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-brand shadow-sm transition-colors hover:bg-brand hover:text-white ${FOCUS_RING}`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                        <path
                          d="M5 2L10 7L5 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>

                  <div className="space-y-2.5 border-t border-[#f1ece6] p-4">
                    {isPendingOffer ? (
                      <>
                        <div className="mb-1 rounded-xl bg-brand/6 px-3.5 py-3">
                          <p className="text-[13px] font-semibold text-[#141414]">
                            {t("jobDetail.offerPendingTitle")}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                            {t("jobDetail.offerPendingBody")}
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={acceptStatus === "submitting" ? undefined : { y: -1 }}
                          whileTap={acceptStatus === "submitting" ? undefined : { scale: 0.99 }}
                          onClick={handleAcceptOffer}
                          disabled={acceptStatus === "submitting"}
                          className={`flex h-11 w-full items-center justify-center rounded-xl bg-accent text-[14px] font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-60 ${FOCUS_RING}`}
                        >
                          {t("jobDetail.acceptOffer")}
                        </motion.button>
                        <button
                          type="button"
                          onClick={handleDeclineOffer}
                          className={`flex h-11 w-full items-center justify-center rounded-xl border border-[#dcd6cf] bg-white text-[14px] text-[#5a5550] transition-colors hover:border-[#b9b1a8] hover:text-[#2a2622] ${FOCUS_RING}`}
                        >
                          {t("jobDetail.declineOffer")}
                        </button>
                      </>
                    ) : hasEngagement && engagementForJob ? (
                      <div className="rounded-xl bg-surface px-3.5 py-4">
                        <p className="text-[13px] font-semibold text-[#3a3530]">
                          {t("flow.jobActive")}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                          {engagementForJob.workStatus === "submitted" && !isInfluencer
                            ? t("myJob.detailWorkSection")
                            : t("jobDetail.viewActiveJob")}
                        </p>
                        <a
                          href="#job-workspace"
                          className={`mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-accent text-[14px] font-semibold text-on-accent ${FOCUS_RING}`}
                        >
                          {t("jobDetail.viewActiveJob")}
                        </a>
                      </div>
                    ) : isDeclinedOffer ? (
                      <div className="rounded-xl bg-surface px-3.5 py-4 text-center">
                        <p className="text-[13px] font-semibold text-[#3a3530]">
                          {t("jobDetail.offerDeclinedTitle")}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                          {t("jobDetail.offerDeclinedBody")}
                        </p>
                      </div>
                    ) : canApply && applyDone ? (
                      <div className="rounded-xl bg-[#ecfdf5] px-3.5 py-4 text-center">
                        <p className="text-[13px] font-semibold text-[#0f7b34]">
                          {dictionary.jobDetail.applySection.successTitle}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#5a5550]">
                          {dictionary.jobDetail.applySection.successBody}
                        </p>
                      </div>
                    ) : canApply ? (
                      <motion.button
                        type="button"
                        onClick={handleApply}
                        disabled={applyStatus === "submitting"}
                        whileHover={applyStatus === "submitting" ? undefined : { y: -1 }}
                        whileTap={applyStatus === "submitting" ? undefined : { scale: 0.99 }}
                        className={`flex h-11 w-full items-center justify-center rounded-xl bg-brand text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60 ${FOCUS_RING}`}
                      >
                        {applyStatus === "submitting"
                          ? dictionary.jobDetail.applySection.submitting
                          : t("jobDetail.applyNow")}
                      </motion.button>
                    ) : null}
                  </div>
                </motion.div>
              </aside>
            </div>
          </div>
        </div>

        {/* Mobile action bar — the sidebar CTA sits below the fold on small screens */}
        {showMobileApplyBar && (
          <>
            <div aria-hidden className="h-20 lg:hidden" />
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ece7e1] bg-white/95 px-4 py-3 shadow-panel-dock backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-md items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#9a9590]">{t("jobDetail.budgetRange")}</p>
                  <p className="truncate text-[15px] font-semibold tabular-nums text-[#141414]">
                    {budget}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applyStatus === "submitting"}
                  className={`flex h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-6 text-[14px] font-semibold text-white transition-colors hover:bg-brand-hover disabled:opacity-60 ${FOCUS_RING}`}
                >
                  {applyStatus === "submitting"
                    ? dictionary.jobDetail.applySection.submitting
                    : t("jobDetail.applyNow")}
                </button>
              </div>
            </div>
          </>
        )}

        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
