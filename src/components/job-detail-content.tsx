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
  formatOfferPrice,
  formatPosted,
  PLATFORM_COLORS,
  postingDateLabel,
  type Job,
} from "@/lib/mock-jobs";
import type { DirectOfferStatus } from "@/lib/mock-direct";
import { useFlowchart } from "@/hooks/use-flowchart";
import { buildApplication, buildEngagement } from "@/lib/flowchart/builders";
import { escrowAmountForJob } from "@/lib/flowchart/jobs";
import DeliverWorkPanel from "@/components/deliver-work-panel";
import ReviewWorkPanel from "@/components/review-work-panel";
import JobWorkspaceSection from "@/components/job-workspace-section";
import { jobDetailHref } from "@/lib/job-detail-href";
import {
  acceptInvite,
  applyToJob,
  declineInvite,
  fetchMyApplications,
  fetchMyDirectInvites,
  isDuplicateRecordError,
  parseApiId,
  type ApiApplication,
} from "@/lib/applications";
import {
  fetchMyEngagements,
  mapApiEngagementToFlow,
  submitWork,
} from "@/lib/engagements";
import { markMyJobSeen } from "@/lib/seen-my-jobs";
import {
  isRequirementFileLine,
  isRequirementImage,
  parseRequirementFiles,
  requirementPreviewUrl,
  type RequirementFileKey,
} from "@/lib/requirement-files";
import type { FlowEngagement } from "@/lib/flowchart/types";

const PANEL =
  "rounded-[1.25rem] border border-[#ece7e1] bg-white shadow-panel";
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

const REQUIREMENT_FILE_LABEL: Record<RequirementFileKey, string> = {
  storyboard: "myJob.reviewReqStoryboard",
  voiceOver: "myJob.reviewReqVoiceOver",
  super: "myJob.reviewReqSuper",
  other: "myJob.reviewReqOther",
};

function RequirementFileList({ files }: { files: ReturnType<typeof parseRequirementFiles> }) {
  const { t } = useLanguage();
  if (files.length === 0) return null;

  return (
    <ul className="mt-4 space-y-3">
      {files.map((file) => {
        const url = requirementPreviewUrl(file.filename);
        const image = isRequirementImage(file.filename);
        return (
          <li key={file.key} className="rounded-xl border border-[#e7e1d8] bg-white p-3.5">
            <p className="text-[14px] font-semibold text-[#141414]">{t(REQUIREMENT_FILE_LABEL[file.key])}</p>
            {file.note && <p className="mt-1 text-[13px] leading-relaxed text-[#5a5550]">{file.note}</p>}
            <p className="mt-1 truncate text-[12px] text-[#8a8580]">{file.filename}</p>
            {url && image && (
              <img src={url} alt={file.filename} className="mt-3 max-h-56 w-full rounded-lg object-contain bg-surface" />
            )}
            {url && !image && (
              <iframe title={file.filename} src={url} className="mt-3 h-64 w-full rounded-lg border border-[#ece7e1] bg-white" />
            )}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-[13px] font-semibold text-brand hover:underline"
              >
                {t("jobDetail.viewFile")}
              </a>
            )}
          </li>
        );
      })}
    </ul>
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
  const [applyError, setApplyError] = useState("");
  const [apiApplied, setApiApplied] = useState(false);
  const [apiDirectInvite, setApiDirectInvite] = useState<ApiApplication | null>(null);
  const [acceptStatus, setAcceptStatus] = useState<"idle" | "submitting">("idle");
  const [deliverTab, setDeliverTab] = useState<"details" | "upload">(
    searchParams.get("tab") === "upload" || searchParams.get("tab") === "review"
      ? "upload"
      : "details"
  );
  const [delivered, setDelivered] = useState(false);
  const [reviewResult, setReviewResult] = useState<"accepted" | "sent" | null>(null);

  useEffect(() => {
    setApplyStatus("idle");
    setApplyError("");
    setApiApplied(false);
    setApiDirectInvite(null);
    setAcceptStatus("idle");
    setDelivered(false);
    setReviewResult(null);
  }, [job.id]);

  const liveInvite = user
    ? state.invites.find(
        (item) => item.jobId === job.id && item.influencerId === user.id
      )
    : undefined;

  const apiInviteStatus: DirectOfferStatus | null = (() => {
    if (!apiDirectInvite) return null;
    const status = apiDirectInvite.status.toLowerCase();
    if (status === "accepted") return "accepted";
    if (status === "declined" || status === "rejected") return "declined";
    return "pending";
  })();

  const offerStatus: DirectOfferStatus | null =
    liveInvite?.status ?? apiInviteStatus;

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

  const workPassed =
    isInfluencer &&
    engagementForJob?.checkoutPaid === true &&
    engagementForJob.workStatus === "approved";
  const readyToDeliver =
    isInfluencer &&
    engagementForJob?.checkoutPaid === true &&
    (engagementForJob.workStatus === "not_submitted" ||
      engagementForJob.workStatus === "revision_requested");
  const showDeliverTabs = readyToDeliver || delivered;
  const awaitingReview =
    !isInfluencer &&
    engagementForJob?.checkoutPaid === true &&
    engagementForJob.workStatus === "submitted";
  const showReviewTabs = awaitingReview || reviewResult !== null;
  const showWorkTabs = showDeliverTabs || showReviewTabs;
  const isPrivateOffer =
    isInfluencer &&
    (liveInvite?.isPrivate === true ||
      apiDirectInvite !== null ||
      engagementForJob?.checkoutPaid === true);
  const brandPays =
    !isInfluencer &&
    engagementForJob?.source === "invite" &&
    engagementForJob.paymentStatus === "escrowed" &&
    !engagementForJob.checkoutPaid;
  const influencerWaitsForPay =
    isInfluencer &&
    engagementForJob?.source === "invite" &&
    engagementForJob.checkoutPaid !== true;
  const hideApplicants =
    isPrivateOffer || (!isInfluencer && engagementForJob?.source === "invite");
  // Local flowchart invite UI (Accept / Decline). API direct invites use สมัครงาน → acceptInvite.
  const isPendingOffer =
    Boolean(liveInvite) &&
    !apiDirectInvite &&
    offerStatus === "pending" &&
    !hasEngagement;
  const isDeclinedOffer = offerStatus === "declined";
  const isAcceptedOffer = offerStatus === "accepted" || hasEngagement;

  const hasAppliedLocal = useMemo(() => {
    if (user?.role !== "influencer") return false;
    return state.applications.some(
      (app) => app.jobId === job.id && app.influencerId === user.id
    );
  }, [user, job.id, state.applications]);
  const hasApplied = hasAppliedLocal || apiApplied;

  useEffect(() => {
    if (user?.role !== "influencer") {
      setApiApplied(false);
      setApiDirectInvite(null);
      return;
    }
    const jobId = parseApiId(job.id);
    if (!jobId) {
      setApiApplied(false);
      setApiDirectInvite(null);
      return;
    }
    const controller = new AbortController();
    Promise.all([
      fetchMyApplications(controller.signal),
      fetchMyDirectInvites(controller.signal),
      fetchMyEngagements(controller.signal),
    ])
      .then(([apps, invites, engagements]) => {
        if (controller.signal.aborted) return;
        setApiApplied(apps.some((app) => app.jobId === jobId));
        const invite =
          invites.find(
            (item) =>
              item.jobId === jobId &&
              item.source?.toLowerCase() === "invite"
          ) ?? null;
        setApiDirectInvite(invite);
        const apiEngagement = engagements.find((item) => item.jobId === jobId);
        if (apiEngagement) {
          dispatch({
            type: "SYNC_ENGAGEMENT",
            engagement: mapApiEngagementToFlow(apiEngagement, {
              influencerName: user.name,
              influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
            }),
          });
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setApiApplied(false);
        setApiDirectInvite(null);
      });
    return () => controller.abort();
  }, [user, job.id, dispatch]);

  const hasPendingDirectInvite =
    apiDirectInvite?.status.toLowerCase() === "pending" ||
    (liveInvite?.status === "pending" && Boolean(liveInvite));

  /** Marketplace apply, or accept a direct invite via the same CTA. */
  const canApply =
    user?.role === "influencer" &&
    !hasEngagement &&
    !isDeclinedOffer &&
    !isAcceptedOffer &&
    (hasPendingDirectInvite || (!isPendingOffer && !hasApplied));

  const liveRequirements =
    state.postedJobs.find((item) => item.id === job.id)?.requirements ?? job.requirements;
  const platformStyle = PLATFORM_COLORS[job.platform];
  const budget = isPrivateOffer
    ? formatOfferPrice(job.budgetMin, job.budgetMax)
    : formatBudgetRange(job.budgetMin, job.budgetMax);
  const postDate = postingDateLabel(job);
  const applyDone = hasApplied || applyStatus === "done";
  const showMobileApplyBar = canApply && !applyDone;

  function recordLocalApplication(
    applicationId?: string,
    status: "pending" | "accepted" | "rejected" = "pending"
  ) {
    if (!user) return;
    if (hasAppliedLocal) return;
    try {
      dispatch({
        type: "APPLY_TO_JOB",
        application: {
          ...buildApplication({
            jobId: job.id,
            influencerId: user.id,
            entrepreneurId: job.companyId,
            influencerName: user.name,
            influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
            coverMessage: "",
          }),
          ...(applicationId ? { id: applicationId } : {}),
          status,
        },
      });
    } catch {
      // Local ledger may already contain this apply.
    }
  }

  async function completeAcceptInvite(inviteId: string, entrepreneurId: string) {
    if (!user) return;
    const apiInviteId = parseApiId(inviteId);
    if (!apiInviteId) throw new Error(t("jobDetail.applyFailed"));

    await acceptInvite(apiInviteId);

    const localInviteId = liveInvite?.id ?? inviteId;
    if (!liveInvite) {
      dispatch({
        type: "SEND_INVITE",
        invite: {
          id: inviteId,
          jobId: job.id,
          entrepreneurId,
          influencerId: user.id,
          fromCompany: job.company,
          influencerName: user.name,
          isPrivate: true,
          status: "pending",
          createdAt: Date.now(),
        },
      });
    }

    const jobId = parseApiId(job.id);
    const engagements = await fetchMyEngagements();
    const apiEngagement = jobId
      ? engagements.find((item) => item.jobId === jobId)
      : undefined;

    const eng = apiEngagement
      ? mapApiEngagementToFlow(apiEngagement, {
          influencerName: user.name,
          influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
        })
      : {
          ...buildEngagement({
            jobId: job.id,
            influencerId: user.id,
            entrepreneurId,
            influencerName: user.name,
            influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
            escrowAmount: escrowAmountForJob(job),
            source: "invite",
            sourceId: localInviteId,
          }),
          checkoutPaid: true,
        };

    try {
      dispatch({ type: "ACCEPT_INVITE", inviteId: localInviteId, engagement: eng });
    } catch {
      dispatch({ type: "SYNC_ENGAGEMENT", engagement: eng });
    }
    setApiDirectInvite((prev) =>
      prev ? { ...prev, status: "accepted" } : prev
    );
    router.push(jobDetailHref(job.id, eng.id));
  }

  async function handleApply() {
    if (!user || applyStatus === "submitting") return;

    // Direct offer: สมัครงาน accepts the invite instead of creating a second application.
    if (hasPendingDirectInvite) {
      const inviteId = apiDirectInvite
        ? String(apiDirectInvite.id)
        : liveInvite?.id;
      if (!inviteId) {
        setApplyError(t("jobDetail.applyFailed"));
        return;
      }
      setApplyStatus("submitting");
      setApplyError("");
      try {
        await completeAcceptInvite(
          inviteId,
          liveInvite?.entrepreneurId ?? job.companyId
        );
        setApplyStatus("done");
      } catch (err) {
        setApplyStatus("idle");
        setApplyError(
          err instanceof Error && err.message
            ? err.message
            : t("jobDetail.applyFailed")
        );
      }
      return;
    }

    if (hasApplied) return;
    const jobId = parseApiId(job.id);
    if (!jobId) {
      setApplyError(t("jobDetail.applyFailed"));
      return;
    }

    setApplyStatus("submitting");
    setApplyError("");
    try {
      const application = await applyToJob(jobId);
      if (application.jobId !== jobId) {
        setApplyStatus("idle");
        setApplyError(t("jobDetail.applyFailed"));
        return;
      }
      const status: "pending" | "accepted" | "rejected" =
        application.status === "accepted" || application.status === "rejected"
          ? application.status
          : "pending";
      recordLocalApplication(String(application.id), status);
      setApiApplied(true);
      setApplyStatus("done");
    } catch (err) {
      // "Duplicated record" is a 409 for this jobId + influencer already.
      // Keep the apply button available; do not lock the UI as success.
      setApplyStatus("idle");
      if (isDuplicateRecordError(err)) {
        setApplyError("");
        return;
      }
      setApplyError(
        err instanceof Error && err.message
          ? err.message
          : t("jobDetail.applyFailed")
      );
    }
  }

  async function handleAcceptOffer() {
    if (!user || acceptStatus === "submitting") return;
    const inviteId = apiDirectInvite
      ? String(apiDirectInvite.id)
      : liveInvite?.id;
    if (!inviteId) return;

    setAcceptStatus("submitting");
    try {
      await completeAcceptInvite(
        inviteId,
        liveInvite?.entrepreneurId ?? job.companyId
      );
    } catch {
      // Keep local accept available if the API call fails.
      if (liveInvite) {
        const eng = {
          ...buildEngagement({
            jobId: job.id,
            influencerId: user.id,
            entrepreneurId: liveInvite.entrepreneurId,
            influencerName: user.name,
            influencerHandle: `@${user.name.replace(/\s+/g, "").toLowerCase()}`,
            escrowAmount: escrowAmountForJob(job),
            source: "invite",
            sourceId: liveInvite.id,
          }),
          checkoutPaid: true,
        };
        dispatch({ type: "ACCEPT_INVITE", inviteId: liveInvite.id, engagement: eng });
        router.push(jobDetailHref(job.id, eng.id));
      }
    } finally {
      setAcceptStatus("idle");
    }
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

  function handleReview(action: "accept" | "feedback", note: string) {
    if (!engagementForJob || reviewResult) return;
    try {
      if (action === "accept") {
        dispatch({
          type: "APPROVE_WORK",
          engagementId: engagementForJob.id,
          note,
        });
        setReviewResult("accepted");
      } else {
        dispatch({
          type: "REQUEST_REVISION",
          engagementId: engagementForJob.id,
          note,
        });
        setReviewResult("sent");
      }
    } catch {
      // The submission is no longer open for review.
    }
  }

  async function handleDeliver(payload: { files: string[]; links: string[] }) {
    if (!engagementForJob || delivered) return;
    const note = [
      ...payload.links,
      ...payload.files.map((name) => `File: ${name}`),
    ].join("\n");
    const apiEngagementId = parseApiId(engagementForJob.id);
    try {
      if (apiEngagementId) {
        await submitWork({
          engagementId: apiEngagementId,
          links: payload.links,
          note: note || undefined,
        });
      }
      dispatch({
        type: "SUBMIT_WORK",
        engagementId: engagementForJob.id,
        note,
      });
      setDelivered(true);
    } catch {
      // The engagement is no longer open for submission.
    }
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

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-paper">
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
                  <dt className="text-[13px] font-medium text-white/70">
                    {isPrivateOffer ? t("jobDetail.price") : t("jobDetail.budgetRange")}
                  </dt>
                  <dd
                    className={`mt-1 font-semibold tracking-[-0.04em] tabular-nums text-accent ${
                      isPrivateOffer
                        ? "text-[2.4rem] leading-none sm:text-[3rem]"
                        : "text-[26px] sm:text-[30px]"
                    }`}
                  >
                    {budget}
                  </dd>
                </div>
                {isPrivateOffer ? (
                  <div className="col-span-2 sm:border-l sm:border-white/15 sm:pl-7">
                    <dt className="text-[13px] font-medium text-white/70">
                      {t("flow.hirePostingTime")}
                    </dt>
                    <dd className="mt-1 text-[2rem] font-semibold leading-none tracking-[-0.04em] text-white sm:text-[2.4rem]">
                      {postDate}
                    </dd>
                  </div>
                ) : (
                  <>
                    <BandStat label={t("jobDetail.workPeriod")} value={job.duration} />
                    {!hideApplicants && (
                      <BandStat label={t("jobDetail.applicants")} value={String(job.applied)} />
                    )}
                    <BandStat label={t("jobDetail.posted")} value={formatPosted(job.postedDaysAgo)} />
                  </>
                )}
              </dl>
            </motion.div>
          </div>
        </section>

        {/* ── Content, lifted over the band ── */}
        <div className="relative z-10 -mt-20 flex-1">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-8 sm:pb-16">
            {showWorkTabs && (
              <div
                role="tablist"
                aria-label={job.title}
                className="mb-5 flex rounded-2xl border border-[#ece7e1] bg-white p-1 shadow-panel"
              >
                {(["details", "upload"] as const).map((key) => {
                  const selected = deliverTab === key;
                  const label =
                    key === "details"
                      ? t("myJob.deliverTabDetails")
                      : showReviewTabs
                        ? t("myJob.reviewTab")
                        : t("myJob.deliverTabUpload");
                  return (
                    <button
                      key={key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setDeliverTab(key)}
                      className={`flex-1 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                        selected ? "bg-brand text-white" : "text-[#666] hover:text-[#141414]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {showWorkTabs && (
              <div className={deliverTab === "upload" ? "mx-auto max-w-3xl" : "hidden"}>
                {showReviewTabs && engagementForJob ? (
                  <ReviewWorkPanel
                    submissionNote={engagementForJob.submissionNote}
                    requirements={job.requirements}
                    done={reviewResult}
                    onAccept={(note) => handleReview("accept", note)}
                    onFeedback={(note) => handleReview("feedback", note)}
                  />
                ) : (
                  <DeliverWorkPanel
                    submitted={delivered}
                    passed={workPassed}
                    submissionNote={engagementForJob?.submissionNote}
                    feedbackNote={
                      !workPassed &&
                      (engagementForJob?.workStatus === "revision_requested" || delivered)
                        ? engagementForJob?.reviewNote
                        : ""
                    }
                    onSubmit={handleDeliver}
                  />
                )}
              </div>
            )}
            {!(showWorkTabs && deliverTab === "upload") && (
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
              {/* ── Main column ── */}
              <div className="min-w-0">
                {workPassed && engagementForJob && (
                  <div className="mb-5">
                    <DeliverWorkPanel
                      passed
                      submissionNote={engagementForJob.submissionNote}
                      onSubmit={() => {}}
                    />
                  </div>
                )}
                {isInfluencer &&
                hasEngagement &&
                !showDeliverTabs &&
                !workPassed &&
                engagementForJob?.source === "invite" ? (
                  <div className="mb-5 rounded-[1.25rem] border border-[#b7ebc9] bg-[#ecfdf5] px-5 py-4">
                    <p className="text-[13px] font-semibold text-[#0f7b34]">
                      {t("jobDetail.offerAcceptedTitle")}
                    </p>
                    <p className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#141414]">
                      {t("jobDetail.offerAcceptedBody")}
                    </p>
                  </div>
                ) : null}
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
                <div className="mt-5 flex flex-col gap-5">
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
                      {liveRequirements
                        .filter((req) => !(isInfluencer && isPrivateOffer && isRequirementFileLine(req)))
                        .map((req) => (
                        <ListRow key={req} tone="green">
                          {req}
                        </ListRow>
                      ))}
                    </ul>
                    {isInfluencer && isPrivateOffer && (
                      <RequirementFileList files={parseRequirementFiles(liveRequirements)} />
                    )}
                  </motion.section>
                </div>

                {hasEngagement && engagementForJob && user && !showWorkTabs && !workPassed && !(isInfluencer && influencerWaitsForPay) && (
                  <JobWorkspaceSection
                    engagement={engagementForJob}
                    jobId={job.id}
                    isInfluencer={isInfluencer}
                    hideSubmission={brandPays || showWorkTabs || influencerWaitsForPay}
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
                      <>
                        <div className="rounded-xl bg-surface px-3.5 py-4">
                          <p className="text-[13px] font-semibold text-[#3a3530]">
                            {isInfluencer && engagementForJob.source === "invite"
                              ? t("jobDetail.offerAcceptedTitle")
                              : t("flow.jobActive")}
                          </p>
                          {isInfluencer && engagementForJob.source === "invite" && !showDeliverTabs && !workPassed ? (
                            <p className="mt-1 text-[15px] font-semibold leading-relaxed text-[#141414]">
                              {t("jobDetail.offerAcceptedBody")}
                            </p>
                          ) : brandPays || showWorkTabs ? null : engagementForJob.workStatus === "submitted" && !isInfluencer ? (
                            <p className="mt-1 text-[12px] leading-relaxed text-[#7a7570]">
                              {t("myJob.detailWorkSection")}
                            </p>
                          ) : null}
                          {showWorkTabs ? (
                            <button
                              type="button"
                              onClick={() => setDeliverTab("upload")}
                              className={`mt-3 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
                            >
                              {showReviewTabs ? t("myJob.reviewTab") : t("myJob.deliverTabUpload")}
                            </button>
                          ) : null}
                        </div>
                        {brandPays && (
                          <>
                            <button
                              type="button"
                              className={`flex h-12 w-full items-center justify-center rounded-xl border border-brand bg-white text-[15px] font-semibold text-brand transition-colors hover:bg-brand/5 ${FOCUS_RING}`}
                            >
                              {t("jobDetail.viewQuote")}
                            </button>
                            <Link
                              href={`/jobs/${job.id}/pay?engagement=${encodeURIComponent(engagementForJob.id)}`}
                              className={`flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
                            >
                              {t("jobDetail.startPayment")}
                            </Link>
                          </>
                        )}
                      </>
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
                      <div className="space-y-2">
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
                        {applyError ? (
                          <p className="text-center text-[12px] text-[#c0392b]">{applyError}</p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              </aside>
            </div>
            )}
          </div>
        </div>

        {/* Mobile action bar — the sidebar CTA sits below the fold on small screens */}
        {brandPays && engagementForJob && (
          <>
            <div aria-hidden className="h-36 lg:hidden" />
            <div className="fixed inset-x-0 bottom-0 z-40 space-y-2 border-t border-[#ece7e1] bg-white/95 px-4 py-3 shadow-panel-dock backdrop-blur lg:hidden">
              <button
                type="button"
                className={`flex h-12 w-full items-center justify-center rounded-xl border border-brand bg-white text-[15px] font-semibold text-brand transition-colors hover:bg-brand/5 ${FOCUS_RING}`}
              >
                {t("jobDetail.viewQuote")}
              </button>
              <Link
                href={`/jobs/${job.id}/pay?engagement=${encodeURIComponent(engagementForJob.id)}`}
                className={`flex h-12 w-full items-center justify-center rounded-xl bg-brand text-[15px] font-semibold text-white shadow-brand transition-colors hover:bg-brand-hover ${FOCUS_RING}`}
              >
                {t("jobDetail.startPayment")}
              </Link>
            </div>
          </>
        )}

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
              {applyError ? (
                <p className="mt-2 text-center text-[12px] text-[#c0392b]">{applyError}</p>
              ) : null}
            </div>
          </>
        )}

        <SiteFooter />
      </div>
    </MotionConfig>
  );
}
