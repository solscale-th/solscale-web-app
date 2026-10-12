"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import { createJob } from "@/lib/jobs";
import { PLATFORM_COLORS, type Platform } from "@/lib/mock-jobs";
import { getInfluencerById } from "@/lib/mock-influencers";
import { forgetRequirementFile, rememberRequirementFile } from "@/lib/requirement-files";

type AddonLine = { name: string; price: number };

const HIRE_STEPS = ["hireStepOrder", "hireStepBrief", "hireStepRequirements", "hireStepConfirm"] as const;

const JOB_FILES = [
  { key: "storyboard", required: true, titleKey: "hireFileStoryboard", hintKey: "hireFileStoryboardHint" },
  { key: "voiceOver", required: false, titleKey: "hireFileVoiceOver", hintKey: "hireFileVoiceOverHint" },
  { key: "super", required: true, titleKey: "hireFileSuper", hintKey: "hireFileSuperHint" },
  { key: "others", required: false, titleKey: "hireFileOthers", hintKey: "hireFileOthersHint" },
] as const;

type JobFileKey = (typeof JOB_FILES)[number]["key"];

const FILE_ACCEPT = "image/*,application/pdf,.pdf";

function isJobFile(file: File): boolean {
  if (file.type.startsWith("image/") || file.type === "application/pdf") return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/.test(name);
}

const PRODUCTS = [
  "Glow Serum 30ml",
  "Glow Lab Daily SPF 50",
  "Glow Lab Night Repair Cream",
  "ColorBoom Velvet Lip",
  "ColorBoom Brow Gel",
  "LeanFuel Whey Vanilla",
  "LeanFuel Plant Protein",
  "Casa Lounge Chair",
  "Casa Linen Throw",
  "PeakForm Training Tee",
  "NaturePure Vitamin C",
  "StockDee Starter Plan",
];

type HireLanguage = "th" | "en" | "all";

const LANGUAGE_OPTIONS: { id: HireLanguage; labelKey: string }[] = [
  { id: "th", labelKey: "hireLanguageThai" },
  { id: "en", labelKey: "hireLanguageEnglish" },
  { id: "all", labelKey: "hireLanguageAll" },
];

function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("en-TH")}`;
}

function parseAddons(raw: string): AddonLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name : "";
      const price = Number(record.price);
      if (!name || !Number.isFinite(price)) return [];
      return [{ name, price }];
    });
  } catch {
    return [];
  }
}

function minPostingValue(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function safeAvatarBg(value: string | null, fallback?: string): string {
  const allowed = /^(bg-brand-tint|bg-\[#[0-9a-fA-F]{3,8}\])$/;
  if (value && allowed.test(value)) return value;
  if (fallback && allowed.test(fallback)) return fallback;
  return "bg-brand-tint";
}

function knownPlatform(value: string | null | undefined): Platform | null {
  if (value && value in PLATFORM_COLORS) return value as Platform;
  return null;
}

function RequiredMark() {
  return (
    <span className="text-[#c0392b]" aria-hidden>
      {" "}
      *
    </span>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-[#f0f0f0] pt-3 first:border-t-0 first:pt-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">{label}</p>
      <p className="mt-1 whitespace-pre-line break-words text-[14px] leading-relaxed text-[#222]">{value}</p>
    </div>
  );
}

export function HireSteps({ step }: { step: number }) {
  const { t } = useLanguage();
  const labels = HIRE_STEPS.map((key) => t(`flow.${key}`));
  const progress = ((step - 1) / (labels.length - 1)) * 75;

  return (
    <div>
      <p className="text-center text-[12px] font-semibold tracking-wide text-[#999]">
        {t("flow.hireStepLabel", { current: step, total: labels.length })}
      </p>
      <ol aria-label={t("flow.hireStepsLabel")} className="relative mt-4 grid grid-cols-4">
        <div
          aria-hidden
          className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 -translate-y-1/2 rounded-full bg-[#e8e4dc]"
        />
        <div
          aria-hidden
          className="absolute left-[12.5%] top-4 h-0.5 -translate-y-1/2 rounded-full bg-brand"
          style={{ width: `${progress}%` }}
        />
        {labels.map((label, index) => {
          const number = index + 1;
          const active = number === step;
          const done = number < step;
          return (
            <li
              key={HIRE_STEPS[index]}
              aria-current={active ? "step" : undefined}
              className="relative z-10 flex flex-col items-center gap-1.5"
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-full text-[13px] font-semibold ${
                  active || done ? "bg-brand text-white" : "bg-[#e8e4dc] text-[#999]"
                }`}
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                      d="M3 7.5l2.5 2.5L11 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  number
                )}
              </span>
              <span
                className={`px-1 text-center text-[11px] font-medium leading-tight sm:text-[12px] ${
                  active ? "text-brand" : done ? "text-[#555]" : "text-[#aaa]"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProductAutocomplete({
  value,
  onChange,
  placeholder,
  emptyLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  emptyLabel: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = PRODUCTS.filter((product) =>
    product.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (value) setQuery(value);
  }, [value]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function choose(product: string) {
    onChange(product);
    setQuery(product);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      event.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (filtered.length === 0 ? 0 : (index + 1) % filtered.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0 ? 0 : (index - 1 + filtered.length) % filtered.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const choice = filtered[activeIndex];
      if (choice) choose(choice);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id="hire-product"
        role="combobox"
        aria-required="true"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex] ? `${listId}-option-${activeIndex}` : undefined
        }
        className={`mt-1.5 ${fieldClass}`}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          if (next !== value) onChange("");
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-[#ece7e1] bg-white py-1.5 shadow-[0_12px_32px_rgba(17,17,17,0.12)]"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[13px] text-[#8a8580]">{emptyLabel}</li>
          ) : (
            filtered.map((product, index) => {
              const active = index === activeIndex;
              return (
                <li key={product} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full px-3.5 py-2.5 text-left text-[13px] ${
                      active ? "bg-brand/8 text-[#141414]" : "text-[#333] hover:bg-surface"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(product)}
                  >
                    {product}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default function SendInviteContent() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const params = useSearchParams();
  const influencerId = params.get("influencerId") ?? "";
  const influencerName = params.get("name") ?? "Influencer";
  const packageName = params.get("packageName") ?? "";
  const packageDetail = params.get("packageDetail") ?? "";
  const packagePrice = Number(params.get("packagePrice") ?? "");
  const addons = useMemo(() => parseAddons(params.get("addons") ?? ""), [params]);
  const hasPackagePrice = Number.isFinite(packagePrice);
  const addonTotal = addons.reduce((sum, item) => sum + item.price, 0);
  const total = (hasPackagePrice ? packagePrice : 0) + addonTotal;
  const profile = useMemo(() => getInfluencerById(influencerId), [influencerId]);
  const avatarUrl = params.get("avatar");
  const avatarBg = safeAvatarBg(params.get("avatarBg"), profile?.avatarBg);
  const platform = knownPlatform(params.get("platform") ?? profile?.platform);
  const verified = profile?.verified === true;

  const [step, setStep] = useState(1);
  const [postingAt, setPostingAt] = useState("");
  const [confirmedPosting, setConfirmedPosting] = useState("");
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [languages, setLanguages] = useState<HireLanguage[]>([]);
  const [subtitle, setSubtitle] = useState("");
  const [jobFiles, setJobFiles] = useState<Partial<Record<JobFileKey, File>>>({});
  const [fileErrors, setFileErrors] = useState<Partial<Record<JobFileKey, string>>>({});
  const [requiredMessage, setRequiredMessage] = useState("");
  const [forbiddenMessage, setForbiddenMessage] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const earliest = useMemo(() => minPostingValue(), []);
  const briefReady = Boolean(product) && description.trim().length > 0 && languages.length > 0;
  const requirementsReady =
    Boolean(jobFiles.storyboard && jobFiles.super) &&
    requiredMessage.trim().length > 0 &&
    forbiddenMessage.trim().length > 0;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!user) return null;

  const backHref = influencerId ? `/influencers/${influencerId}` : "/";

  if (user.role !== "entrepreneur") {
    return (
      <FlowPage title={t("flow.hireTitle")} backHref={backHref}>
        <p className="text-[14px] text-[#777]">{t("postJob.notEntrepreneur")}</p>
      </FlowPage>
    );
  }

  function formatPosting(value: string): string {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return value;
    return new Date(year, month - 1, day).toLocaleDateString(locale === "th" ? "th-TH" : "en-GB", {
      dateStyle: "medium",
    });
  }

  function toggleLanguage(language: HireLanguage) {
    setLanguages((current) => {
      if (language === "all") return current.includes("all") ? [] : ["all"];
      const withoutAll = current.filter((item) => item !== "all");
      return withoutAll.includes(language)
        ? withoutAll.filter((item) => item !== language)
        : [...withoutAll, language];
    });
  }

  function handleContinue(event: React.FormEvent) {
    event.preventDefault();
    if (!postingAt) return;
    setConfirmedPosting(postingAt);
    setStep(2);
  }

  function handleBrief(event: React.FormEvent) {
    event.preventDefault();
    if (!briefReady) return;
    setStep(3);
  }

  function setJobFile(key: JobFileKey, file: File | undefined) {
    setJobFiles((current) => {
      const previous = current[key];
      if (previous && previous.name !== file?.name) forgetRequirementFile(previous.name);
      const next = { ...current };
      if (file) {
        next[key] = file;
        rememberRequirementFile(file);
      } else {
        delete next[key];
      }
      return next;
    });
  }

  async function handleSendRequest(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSubmitError("");
    setSending(true);
    try {
      const postingLabel = formatPosting(confirmedPosting || postingAt);
      const languageLabel = languages
        .map((id) => {
          const option = LANGUAGE_OPTIONS.find((item) => item.id === id);
          return option ? t(`flow.${option.labelKey}`) : id;
        })
        .join(", ");
      const deliverables = [
        [packageName, packageDetail, hasPackagePrice ? formatBaht(packagePrice) : ""]
          .filter(Boolean)
          .join(" — "),
        ...addons.map((item) => `${item.name} — ${formatBaht(item.price)}`),
      ].filter(Boolean);
      const requirements = [
        `${t("flow.hirePostingTime")}: ${postingLabel}`,
        `${t("flow.hireProduct")}: ${product}`,
        `${t("flow.hireLanguages")}: ${languageLabel}`,
        subtitle.trim() ? `${t("flow.hireCaption")}: ${subtitle.trim()}` : "",
        ...JOB_FILES.flatMap((item) => {
          const file = jobFiles[item.key];
          return file ? [`${t(`flow.${item.titleKey}`)}: ${file.name}`] : [];
        }),
        `${t("flow.hireRequiredMessage")}: ${requiredMessage.trim()}`,
        `${t("flow.hireForbiddenMessage")}: ${forbiddenMessage.trim()}`,
      ].filter(Boolean);

      await createJob({
        title: `${product} — ${packageName}`,
        description: description.trim(),
        brief: [
          `${t("flow.hireSubtitle", { name: influencerName })}`,
          ...deliverables,
          `${t("flow.hirePostingTime")}: ${postingLabel}`,
          `${t("flow.hireLanguages")}: ${languageLabel}`,
          subtitle.trim() ? `${t("flow.hireCaption")}: ${subtitle.trim()}` : "",
          `${t("flow.hireRequiredMessage")}: ${requiredMessage.trim()}`,
          `${t("flow.hireForbiddenMessage")}: ${forbiddenMessage.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
        platform: platform ?? "Instagram",
        deliverables,
        requirements,
        duration: postingLabel,
        budgetMin: Math.round(total),
        budgetMax: Math.round(total),
      });
      setRequestSent(true);
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : t("flow.hireSubmitFailed"));
    } finally {
      setSending(false);
    }
  }

  function onJobFile(key: JobFileKey, list: FileList | null) {
    const file = list?.[0];
    if (!file) return;
    if (!isJobFile(file)) {
      setFileErrors((current) => ({ ...current, [key]: t("flow.hireFileInvalid") }));
      setJobFile(key, undefined);
      return;
    }
    setFileErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setJobFile(key, file);
  }

  return (
    <FlowPage
      title={
        step === 4
          ? t("flow.hireConfirmTitle")
          : step === 3
            ? t("flow.hireRequirementsTitle")
            : step === 2
              ? t("flow.hireBriefTitle")
              : t("flow.hireTitle")
      }
      subtitle={
        step === 4
          ? t("flow.hireConfirmSubtitle", { name: influencerName })
          : step === 3
            ? t("flow.hireRequirementsSubtitle")
            : step === 2
              ? t("flow.hireBriefSubtitle")
              : t("flow.hireSubtitle", { name: influencerName })
      }
      backHref={backHref}
      leading={<HireSteps step={step} />}
    >
      {!packageName ? (
        <FlowCard>
          <p className="text-[14px] text-[#555]">{t("flow.hireMissingPackage")}</p>
        </FlowCard>
      ) : step === 4 ? (
        <FlowCard>
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <div
                className="h-14 w-14 shrink-0 rounded-2xl bg-cover bg-center shadow-sm ring-2 ring-white"
                style={{ backgroundImage: `url(${avatarUrl})` }}
                role="img"
                aria-label={influencerName}
              />
            ) : (
              <div
                className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-bold text-brand shadow-sm ring-2 ring-white ${avatarBg}`}
              >
                {influencerName.trim().charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[16px] font-bold text-[#111]">{influencerName}</p>
                {verified && (
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0" aria-label={t("common.verified")}>
                    <circle cx="8" cy="8" r="7" fill="var(--color-accent)" />
                    <path d="M4.8 8.1L7 10.2L11.2 5.8" stroke="var(--color-on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {platform ? (
                <span
                  className="mt-1.5 inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    backgroundColor: PLATFORM_COLORS[platform].bg,
                    color: PLATFORM_COLORS[platform].text,
                  }}
                >
                  {platform}
                </span>
              ) : (
                <span className="mt-1.5 inline-flex rounded-full border border-brand/20 bg-brand/8 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                  {t("influencerDetail.role")}
                </span>
              )}
            </div>
            <p className="shrink-0 text-[18px] font-extrabold text-brand">{formatBaht(total)}</p>
          </div>

          <div className="mt-5 space-y-3">
            <SummaryField
              label={t("flow.invitePackage")}
              value={[packageName, packageDetail, hasPackagePrice ? formatBaht(packagePrice) : ""]
                .filter(Boolean)
                .join("\n")}
            />
            {addons.length > 0 && (
              <SummaryField
                label={t("flow.inviteAddons")}
                value={addons.map((item) => `${item.name} · ${formatBaht(item.price)}`).join("\n")}
              />
            )}
            <SummaryField label={t("flow.hirePostingTime")} value={formatPosting(confirmedPosting || postingAt)} />
            <SummaryField label={t("flow.hireProduct")} value={product} />
            <SummaryField label={t("flow.hireProductDescription")} value={description.trim()} />
            <SummaryField
              label={t("flow.hireLanguages")}
              value={languages
                .map((id) => {
                  const option = LANGUAGE_OPTIONS.find((item) => item.id === id);
                  return option ? t(`flow.${option.labelKey}`) : id;
                })
                .join(", ")}
            />
            {subtitle.trim() && <SummaryField label={t("flow.hireCaption")} value={subtitle.trim()} />}
            {JOB_FILES.map((item) => {
              const file = jobFiles[item.key];
              if (!file) return null;
              return <SummaryField key={item.key} label={t(`flow.${item.titleKey}`)} value={file.name} />;
            })}
            <SummaryField label={t("flow.hireRequiredMessage")} value={requiredMessage.trim()} />
            <SummaryField label={t("flow.hireForbiddenMessage")} value={forbiddenMessage.trim()} />
          </div>

          {requestSent ? (
            <p className="mt-5 rounded-xl border border-[#d7ead3] bg-[#f3faf2] px-3.5 py-3 text-[13px] leading-relaxed text-[#24612a]">
              {t("flow.hireSent", { name: influencerName })}
            </p>
          ) : (
            <form className="mt-5 space-y-3" onSubmit={handleSendRequest}>
              <p className="rounded-xl border border-[#f0d3a8] bg-[#fff6e8] px-3.5 py-3 text-[13px] leading-relaxed text-[#7a4e12]">
                {t("flow.hireLockWarning")}
              </p>
              {submitError && <p className="text-[13px] text-[#c0392b]">{submitError}</p>}
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`${secondaryBtn} sm:flex-1`}
                  disabled={sending}
                >
                  {t("flow.hireBack")}
                </button>
                <button type="submit" className={`${primaryBtn} sm:flex-1`} disabled={sending}>
                  {sending ? t("flow.hireSending") : t("flow.hireSubmit")}
                </button>
              </div>
            </form>
          )}
        </FlowCard>
      ) : step === 3 ? (
        <FlowCard>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!requirementsReady) return;
              setStep(4);
            }}
            className="space-y-4"
          >
            {JOB_FILES.map((item) => {
              const file = jobFiles[item.key];
              const error = fileErrors[item.key];
              return (
                <div key={item.key} className="rounded-xl border border-[#ebebeb] bg-surface p-4">
                  <p className="text-[14px] font-bold text-[#111]">
                    {t(`flow.${item.titleKey}`)}
                    {item.required && <RequiredMark />}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#666]">
                    {t(`flow.${item.hintKey}`)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-brand/25 bg-white px-4 text-[13px] font-semibold text-brand hover:border-brand">
                      {file ? t("flow.hireFileReplace") : t("flow.hireFileUpload")}
                      <input
                        type="file"
                        accept={FILE_ACCEPT}
                        className="sr-only"
                        aria-required={item.required}
                        onChange={(event) => {
                          onJobFile(item.key, event.target.files);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    {file && (
                      <>
                        <span className="min-w-0 truncate text-[13px] text-[#333]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => setJobFile(item.key, undefined)}
                          className="text-[13px] font-medium text-[#888] hover:text-brand"
                        >
                          {t("flow.hireFileRemove")}
                        </button>
                      </>
                    )}
                  </div>
                  {error && <p className="mt-2 text-[13px] text-[#c0392b]">{error}</p>}
                </div>
              );
            })}

            <label className="block text-[13px] font-medium text-[#333]" htmlFor="hire-required-message">
              {t("flow.hireRequiredMessage")}
              <RequiredMark />
              <textarea
                id="hire-required-message"
                aria-required="true"
                rows={3}
                value={requiredMessage}
                onChange={(event) => setRequiredMessage(event.target.value)}
                placeholder={t("flow.hireRequiredMessagePlaceholder")}
                className={`mt-1.5 resize-y ${fieldClass}`}
              />
            </label>

            <label className="block text-[13px] font-medium text-[#333]" htmlFor="hire-forbidden-message">
              {t("flow.hireForbiddenMessage")}
              <RequiredMark />
              <textarea
                id="hire-forbidden-message"
                aria-required="true"
                rows={3}
                value={forbiddenMessage}
                onChange={(event) => setForbiddenMessage(event.target.value)}
                placeholder={t("flow.hireForbiddenMessagePlaceholder")}
                className={`mt-1.5 resize-y ${fieldClass}`}
              />
            </label>

            <div className="flex flex-col-reverse gap-2.5 pt-1 sm:flex-row">
              <button type="button" onClick={() => setStep(2)} className={`${secondaryBtn} sm:flex-1`}>
                {t("flow.hireBack")}
              </button>
              <button type="submit" className={`${primaryBtn} sm:flex-1`} disabled={!requirementsReady}>
                {t("flow.hireContinue")}
              </button>
            </div>
          </form>
        </FlowCard>
      ) : step === 2 ? (
        <FlowCard>
          <form onSubmit={handleBrief} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-[#333]" htmlFor="hire-product">
                {t("flow.hireProduct")}
                <RequiredMark />
              </label>
              <ProductAutocomplete
                value={product}
                onChange={setProduct}
                placeholder={t("flow.hireProductPlaceholder")}
                emptyLabel={t("flow.hireProductEmpty")}
              />
            </div>

            <label className="block text-[13px] font-medium text-[#333]" htmlFor="hire-description">
              {t("flow.hireProductDescription")}
              <RequiredMark />
              <textarea
                id="hire-description"
                aria-required="true"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("flow.hireProductDescriptionPlaceholder")}
                className={`mt-1.5 resize-y ${fieldClass}`}
              />
            </label>

            <fieldset aria-required="true">
              <legend className="text-[13px] font-medium text-[#333]">
                {t("flow.hireLanguages")}
                <RequiredMark />
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((option) => {
                  const checked = languages.includes(option.id);
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${
                        checked
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-[#ebebeb] bg-surface text-[#333]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLanguage(option.id)}
                        className="accent-brand"
                      />
                      {t(`flow.${option.labelKey}`)}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <label className="block text-[13px] font-medium text-[#333]" htmlFor="hire-subtitle">
              {t("flow.hireCaption")}
              <input
                id="hire-subtitle"
                type="text"
                value={subtitle}
                onChange={(event) => setSubtitle(event.target.value)}
                placeholder={t("flow.hireCaptionPlaceholder")}
                className={`mt-1.5 ${fieldClass}`}
              />
            </label>

            <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
              <button type="button" onClick={() => setStep(1)} className={`${secondaryBtn} sm:flex-1`}>
                {t("flow.hireBack")}
              </button>
              <button type="submit" className={`${primaryBtn} sm:flex-1`} disabled={!briefReady}>
                {t("flow.hireContinue")}
              </button>
            </div>
          </form>
        </FlowCard>
      ) : (
        <>
          <FlowCard>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                  {t("flow.invitePackage")}
                </p>
                <p className="mt-1 text-[15px] font-bold text-[#111]">{packageName}</p>
                {packageDetail && (
                  <p className="mt-1 text-[13px] leading-relaxed text-[#666]">{packageDetail}</p>
                )}
              </div>
              {hasPackagePrice && (
                <p className="shrink-0 text-[15px] font-extrabold text-[#111]">
                  {formatBaht(packagePrice)}
                </p>
              )}
            </div>

            {addons.length > 0 && (
              <div className="mt-4 border-t border-[#f0f0f0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                  {t("flow.inviteAddons")}
                </p>
                <ul className="mt-2 space-y-2">
                  {addons.map((addon) => (
                    <li key={addon.name} className="flex items-center justify-between gap-3 text-[14px]">
                      <span className="text-[#333]">{addon.name}</span>
                      <span className="shrink-0 font-semibold text-[#111]">{formatBaht(addon.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-4">
              <span className="text-[14px] font-bold text-[#111]">{t("influencerDetail.selectedTotal")}</span>
              <span className="text-[18px] font-extrabold text-brand">{formatBaht(total)}</span>
            </div>

            {confirmedPosting && (
              <p className="mt-3 text-[13px] text-[#555]">
                <span className="font-semibold text-[#111]">{t("flow.hirePostingTime")}: </span>
                {formatPosting(confirmedPosting)}
              </p>
            )}
          </FlowCard>

          <FlowCard>
            <form onSubmit={handleContinue} className="space-y-4">
              <label className="block text-[13px] font-medium text-[#333]" htmlFor="posting-time">
                {t("flow.hirePostingTime")}
                <input
                  id="posting-time"
                  type="date"
                  required
                  min={earliest}
                  value={postingAt}
                  onChange={(event) => {
                    setPostingAt(event.target.value);
                    setConfirmedPosting("");
                  }}
                  className={`mt-1.5 ${fieldClass}`}
                />
              </label>
              <p className="text-[12px] leading-relaxed text-[#888]">{t("flow.hirePostingHint")}</p>
              <button type="submit" className={primaryBtn} disabled={!postingAt}>
                {t("flow.hireContinue")}
              </button>
            </form>
          </FlowCard>
        </>
      )}
    </FlowPage>
  );
}
