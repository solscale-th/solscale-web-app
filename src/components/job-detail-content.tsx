"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import {
  MOCK_DIRECT_OFFERS,
  type DirectOfferStatus,
} from "@/lib/mock-direct";
import { MOCK_INFLUENCER_APPLICATIONS } from "@/lib/mock-applications";
import { useFlowchart } from "@/hooks/use-flowchart";
import { buildApplication, buildEngagement, buildInvite } from "@/lib/flowchart/builders";
import { escrowAmountForJob } from "@/lib/flowchart/jobs";

const LIME = "#d7ff2f";

const PANEL =
  "rounded-[1.25rem] border border-[#ece7e1] bg-white shadow-[0_1px_2px_rgba(40,20,10,0.04),0_18px_36px_-26px_rgba(74,0,27,0.45)]";
const FIELD =
  "w-full rounded-lg border border-[#e0dbd5] bg-[#faf8f6] px-4 py-3 text-[14px] text-[#2a2622] placeholder-[#b3aca4] outline-none transition-[border-color,background-color,box-shadow] focus:border-[#9d003b] focus:bg-white focus:ring-2 focus:ring-[#9d003b]/25";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d003b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f6]";
const FOCUS_RING_ON_DARK =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d7ff2f]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#6d0028]";

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

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 2.5H12V13.5L8 10.5L4 13.5V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

const TONES = {
  brand: { tile: "bg-[#9d003b]/10 text-[#9d003b]", mark: "text-[#9d003b]" },
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
    <li className="flex items-start gap-3 rounded-xl bg-[#faf8f6] px-3.5 py-3">
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

  const [coverMessage, setCoverMessage] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [applyStatus, setApplyStatus] = useState<"idle" | "submitting" | "done">("idle");

  const [question, setQuestion] = useState("");
  const [askStatus, setAskStatus] = useState<"idle" | "sending" | "done">("idle");

  const seedOffer = useMemo(() => {
    if (user?.role !== "influencer") return null;
    const offers = MOCK_DIRECT_OFFERS[user.id] ?? MOCK_DIRECT_OFFERS["1"] ?? [];
    return offers.find((o) => o.jobId === job.id) ?? null;
  }, [user, job.id]);

  const liveInvite = user
    ? state.invites.find(
        (item) => item.jobId === job.id && item.influencerId === user.id
      )
    : undefined;

  const offerStatus: DirectOfferStatus | null =
    liveInvite?.status ?? seedOffer?.status ?? null;

  const engagementForJob = user
    ? state.engagements.find(
        (item) =>
          item.jobId === job.id &&
          (item.influencerId === user.id || item.entrepreneurId === user.id)
      )
    : undefined;

  const isPendingOffer = offerStatus === "pending";
  const isDeclinedOffer = offerStatus === "declined";
  const isAcceptedOffer = offerStatus === "accepted";

  const hasApplied = useMemo(() => {
    if (user?.role !== "influencer") return false;
    const live = state.applications.some(
      (app) => app.jobId === job.id && app.influencerId === user.id
    );
    if (live) return true;
    const apps =
      MOCK_INFLUENCER_APPLICATIONS[user.id] ?? MOCK_INFLUENCER_APPLICATIONS["1"] ?? [];
    return apps.some((app) => app.jobId === job.id);
  }, [user, job.id, state.applications]);

  /** Chart: apply only on the marketplace path — not after accepting an invite. */
  const showApplicationSection =
    user?.role === "influencer" &&
    !isPendingOffer &&
    !isDeclinedOffer &&
    !isAcceptedOffer;

  const platformStyle = PLATFORM_COLORS[job.platform];
  const budget = formatBudgetRange(job.budgetMin, job.budgetMax);
  const showMobileApplyBar =
    showApplicationSection && !hasApplied && applyStatus !== "done";

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
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
          coverMessage: [coverMessage.trim(), portfolioUrl.trim()]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      setApplyStatus("done");
    } catch {
      setApplyStatus("idle");
    }
  }

  function handleAcceptOffer() {
    if (!user) return;
    const invite =
      liveInvite ??
      buildInvite({
        jobId: job.id,
        entrepreneurId: job.companyId,
        influencerId: user.id,
        fromCompany: seedOffer?.fromCompany ?? job.company,
        influencerName: user.name,
        isPrivate: seedOffer?.isPrivate ?? true,
      });
    if (!liveInvite) {
      dispatch({
        type: "SEND_INVITE",
        invite: { ...invite, id: seedOffer?.id ?? invite.id, status: "pending" },
      });
    }
    const inviteId = liveInvite?.id ?? seedOffer?.id ?? invite.id;
    const eng = buildEngagement({
      jobId: job.id,
      influencerId: user.id,
      entrepreneurId: liveInvite?.entrepreneurId ?? (seedOffer ? "2" : job.companyId),
      influencerName: user.name,
      influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
      escrowAmount: escrowAmountForJob(job),
      source: "invite",
      sourceId: inviteId,
    });
    dispatch({ type: "ACCEPT_INVITE", inviteId, engagement: eng });
    router.push(`/my-jobs/${eng.id}`);
  }

  function handleDeclineOffer() {
    if (!user) return;
    const invite =
      liveInvite ??
      buildInvite({
        jobId: job.id,
        entrepreneurId: job.companyId,
        influencerId: user.id,
        fromCompany: seedOffer?.fromCompany ?? job.company,
        influencerName: user.name,
        isPrivate: seedOffer?.isPrivate ?? true,
      });
    if (!liveInvite) {
      dispatch({
        type: "SEND_INVITE",
        invite: { ...invite, id: seedOffer?.id ?? invite.id, status: "pending" },
      });
    }
    dispatch({
      type: "DECLINE_INVITE",
      inviteId: liveInvite?.id ?? seedOffer?.id ?? invite.id,
    });
  }

  function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setAskStatus("sending");
    setTimeout(() => setAskStatus("done"), 1000);
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-[#faf8f6]">
        <MainHeader />

        {/* ── Colored hero band ── */}
        <section className="relative overflow-hidden bg-[#6d0028] text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_12%_0%,rgba(157,0,59,0.85)_0%,transparent_55%),radial-gradient(ellipse_at_88%_25%,rgba(37,94,54,0.35)_0%,transparent_50%),linear-gradient(160deg,#8f0035_0%,#6d0028_52%,#48001a_100%)]" />
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
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7ff2f] px-3 py-1.5 text-[12px] font-semibold leading-none text-[#2a1018]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden className="shrink-0">
                      <path d="M5 0L6.2 3.8H10L7 6.1L8.2 10L5 7.6L1.8 10L3 6.1L0 3.8H3.8L5 0Z" />
                    </svg>
                    {t("jobDetail.promoted")}
                  </span>
                )}
                {offerStatus === "accepted" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f7b34] px-3 py-1.5 text-[12px] font-semibold leading-none text-white">
                    <CheckIcon />
                    {t("jobDetail.offerAcceptedBadge")}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-3xl text-[1.85rem] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:text-[2.35rem] lg:text-[2.75rem]">
                {job.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-white/70">
                <span className="inline-flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#d7ff2f] text-[12px] font-semibold text-[#6d0028]">
                    {job.company.charAt(0)}
                  </span>
                  <span className="font-medium text-white">{job.company}</span>
                  {job.verified && (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-label={t("common.verified")}>
                      <circle cx="8" cy="8" r="7" fill="#d7ff2f" />
                      <path d="M4.8 8.1L7 10.2L11.2 5.8" stroke="#2a1018" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span aria-hidden className="text-white/25">·</span>
                <span>{job.location}</span>
              </div>

              <dl className="mt-9 grid grid-cols-2 gap-y-6 border-t border-white/15 pt-7 sm:flex sm:flex-wrap sm:items-end sm:gap-x-7">
                <div className="col-span-2 sm:pr-1">
                  <dt className="text-[12px] text-white/55">{t("jobDetail.budgetRange")}</dt>
                  <dd
                    className="mt-1 text-[26px] font-semibold tracking-[-0.035em] tabular-nums sm:text-[30px]"
                    style={{ color: LIME }}
                  >
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
                          className="rounded-full bg-[#9d003b]/8 px-3 py-1.5 text-[12px] font-medium text-[#9d003b]"
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

                {/* Forms — Ask first; Apply stacks below when available */}
                <div className="mt-10 grid grid-cols-1 gap-5">
                  <motion.section
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
                        className="mt-5 flex flex-col items-center gap-2 rounded-xl bg-[#faf8f6] py-7 text-center"
                      >
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#9d003b]/10 text-[#9d003b]">
                          <CheckIcon />
                        </span>
                        <p className="text-[14px] font-semibold text-[#9d003b]">
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
                            <span className="ml-1 text-[#9d003b]">*</span>
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

                  {showApplicationSection && (
                    <motion.section
                      id="work-submission-form"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 0.4, delay: 0.06 }}
                      className={`overflow-hidden ${PANEL}`}
                    >
                      <div className="h-1 w-full bg-gradient-to-r from-[#9d003b] via-[#c8004c] to-[#d7ff2f]" />
                      <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#9d003b] text-white">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
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
                            <h3 className="text-[16px] font-semibold text-[#141414]">
                              {dictionary.jobDetail.applySection.title}
                            </h3>
                            <p className="mt-0.5 text-[13px] text-[#8a8580]">
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
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0f7b34] text-white">
                              <CheckIcon />
                            </span>
                            <p className="text-[14px] font-semibold text-[#0f7b34]">
                              {dictionary.jobDetail.applySection.successTitle}
                            </p>
                            <p className="max-w-xs text-[13px] text-[#5a5550]">
                              {dictionary.jobDetail.applySection.successBody}
                            </p>
                          </motion.div>
                        ) : (
                          <form onSubmit={handleApply} className="mt-5 space-y-4">
                            <div>
                              <label
                                htmlFor="job-cover-message"
                                className="mb-1.5 block text-[13px] font-semibold text-[#3a3530]"
                              >
                                {dictionary.jobDetail.applySection.coverLabel}
                                <span className="ml-1 text-[#9d003b]">*</span>
                              </label>
                              <textarea
                                id="job-cover-message"
                                required
                                rows={5}
                                value={coverMessage}
                                onChange={(e) => setCoverMessage(e.target.value)}
                                placeholder={dictionary.jobDetail.applySection.coverPlaceholder}
                                className={`resize-none ${FIELD}`}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="job-portfolio-url"
                                className="mb-1.5 block text-[13px] font-semibold text-[#3a3530]"
                              >
                                {dictionary.jobDetail.applySection.portfolioLabel}
                              </label>
                              <input
                                id="job-portfolio-url"
                                type="url"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                placeholder={dictionary.jobDetail.applySection.portfolioPlaceholder}
                                className={FIELD}
                              />
                            </div>
                            <motion.button
                              type="submit"
                              disabled={applyStatus === "submitting" || !coverMessage.trim()}
                              whileHover={coverMessage.trim() && applyStatus !== "submitting" ? { y: -1 } : undefined}
                              whileTap={coverMessage.trim() && applyStatus !== "submitting" ? { scale: 0.99 } : undefined}
                              className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white transition-colors hover:bg-[#850030] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#9d003b] ${FOCUS_RING}`}
                            >
                              {applyStatus === "submitting" ? (
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
                                  {dictionary.jobDetail.applySection.submitting}
                                </>
                              ) : (
                                dictionary.jobDetail.applySection.submit
                              )}
                            </motion.button>
                          </form>
                        )}
                      </div>
                    </motion.section>
                  )}
                </div>
              </div>

              {/* ── Sticky action panel ── */}
              <aside className="self-start lg:sticky lg:top-20 lg:z-10">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`overflow-hidden ${PANEL}`}
                >
                  <div className="flex w-full items-center gap-3.5 bg-[#faf8f6] px-5 py-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#9d003b] text-[16px] font-semibold text-white">
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
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#9d003b] shadow-sm transition-colors hover:bg-[#9d003b] hover:text-white ${FOCUS_RING}`}
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
                        <div className="mb-1 rounded-xl bg-[#9d003b]/6 px-3.5 py-3">
                          <p className="text-[13px] font-semibold text-[#141414]">
                            {t("jobDetail.offerPendingTitle")}
                          </p>
                          <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                            {t("jobDetail.offerPendingBody")}
                          </p>
                        </div>
                        <motion.button
                          type="button"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleAcceptOffer}
                          className={`flex h-11 w-full items-center justify-center rounded-xl bg-[#d7ff2f] text-[14px] font-semibold text-[#2a1018] transition-colors hover:bg-[#c8f020] ${FOCUS_RING}`}
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
                    ) : isAcceptedOffer ? (
                      <div className="rounded-xl bg-[#faf8f6] px-3.5 py-4">
                        <p className="text-[13px] font-semibold text-[#3a3530]">
                          {t("jobDetail.offerAcceptedTitle")}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                          {t("jobDetail.offerAcceptedBody")}
                        </p>
                        {engagementForJob && (
                          <Link
                            href={`/my-jobs/${engagementForJob.id}`}
                            className={`mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-[#d7ff2f] text-[14px] font-semibold text-[#2a1018] ${FOCUS_RING}`}
                          >
                            {t("jobDetail.viewActiveJob")}
                          </Link>
                        )}
                      </div>
                    ) : isDeclinedOffer ? (
                      <div className="rounded-xl bg-[#faf8f6] px-3.5 py-4 text-center">
                        <p className="text-[13px] font-semibold text-[#3a3530]">
                          {t("jobDetail.offerDeclinedTitle")}
                        </p>
                        <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                          {t("jobDetail.offerDeclinedBody")}
                        </p>
                      </div>
                    ) : (
                      <>
                        {!hasApplied && (
                          <motion.a
                            href="#work-submission-form"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex h-11 w-full items-center justify-center rounded-xl bg-[#9d003b] text-[14px] font-semibold text-white transition-colors hover:bg-[#850030] ${FOCUS_RING}`}
                          >
                            {t("jobDetail.applyNow")}
                          </motion.a>
                        )}
                        {offerStatus !== "accepted" && (
                          <button
                            type="button"
                            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dcd6cf] bg-white text-[14px] text-[#5a5550] transition-colors hover:border-[#b9b1a8] hover:text-[#2a2622] ${FOCUS_RING}`}
                          >
                            <BookmarkIcon />
                            {t("jobDetail.saveForLater")}
                          </button>
                        )}
                      </>
                    )}
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
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ece7e1] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(74,0,27,0.12)] backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-md items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#9a9590]">{t("jobDetail.budgetRange")}</p>
                  <p className="truncate text-[15px] font-semibold tabular-nums text-[#141414]">
                    {budget}
                  </p>
                </div>
                <a
                  href="#work-submission-form"
                  className={`flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#9d003b] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#850030] ${FOCUS_RING}`}
                >
                  {t("jobDetail.applyNow")}
                </a>
              </div>
            </div>
          </>
        )}

        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
