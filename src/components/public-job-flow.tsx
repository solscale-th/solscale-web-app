"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FlowCard, FlowPage, fieldClass, primaryBtn, secondaryBtn } from "@/components/flow-page-shell";
import { HireSteps, ProductAutocomplete } from "@/components/send-invite-content";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import { useLanguage } from "@/i18n/language-provider";
import { buildPostedJob } from "@/lib/flowchart/builders";
import { forgetRequirementFile, rememberRequirementFile } from "@/lib/requirement-files";

type AddonDraft = { name: string; price: string };

const JOB_FILES = [
  { key: "storyboard", required: true, titleKey: "hireFileStoryboard", hintKey: "hireFileStoryboardHint" },
  { key: "voiceOver", required: false, titleKey: "hireFileVoiceOver", hintKey: "hireFileVoiceOverHint" },
  { key: "super", required: true, titleKey: "hireFileSuper", hintKey: "hireFileSuperHint" },
  { key: "others", required: false, titleKey: "hireFileOthers", hintKey: "hireFileOthersHint" },
] as const;

type JobFileKey = (typeof JOB_FILES)[number]["key"];

const FILE_ACCEPT = "image/*,application/pdf,.pdf";

type HireLanguage = "th" | "en" | "all";

const LANGUAGE_OPTIONS: { id: HireLanguage; labelKey: string }[] = [
  { id: "th", labelKey: "hireLanguageThai" },
  { id: "en", labelKey: "hireLanguageEnglish" },
  { id: "all", labelKey: "hireLanguageAll" },
];

function isJobFile(file: File): boolean {
  if (file.type.startsWith("image/") || file.type === "application/pdf") return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || /\.(png|jpe?g|gif|webp|bmp|svg|heic|heif|avif)$/.test(name);
}

function minPostingValue(): string {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parsePrice(value: string): number {
  const amount = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("en-TH")}`;
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

export default function PublicJobFlow() {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const { dispatch } = useFlowchart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [need, setNeed] = useState("");
  const [price, setPrice] = useState("");
  const [addons, setAddons] = useState<AddonDraft[]>([]);
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
  const [posted, setPosted] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const earliest = useMemo(() => minPostingValue(), []);

  const needReady = need.trim().length > 0;
  const orderReady = needReady && postingAt.length > 0;
  const briefReady = Boolean(product) && description.trim().length > 0 && languages.length > 0;
  const requirementsReady =
    Boolean(jobFiles.storyboard && jobFiles.super) &&
    requiredMessage.trim().length > 0 &&
    forbiddenMessage.trim().length > 0;
  const basePrice = parsePrice(price);
  const addonTotal = addons.reduce((sum, item) => sum + parsePrice(item.price), 0);
  const total = basePrice + addonTotal;
  const filledAddons = addons.filter((item) => item.name.trim() || parsePrice(item.price) > 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!user) return null;

  if (user.role !== "entrepreneur") {
    return (
      <FlowPage title={t("postJob.title")} backHref="/">
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

  function updateAddon(index: number, patch: Partial<AddonDraft>) {
    setAddons((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    );
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

  function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    if (sending || !user) return;
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
        need.trim(),
        basePrice > 0 ? formatBaht(basePrice) : "",
        ...filledAddons.map((item) => {
          const amount = parsePrice(item.price);
          return [item.name.trim(), amount > 0 ? formatBaht(amount) : ""].filter(Boolean).join(" — ");
        }),
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

      const job = buildPostedJob({
        entrepreneurId: user.id,
        companyName: user.name,
        title: product || need.trim().slice(0, 80),
        description: description.trim(),
        brief: [need.trim(), ...requirements].filter(Boolean).join("\n"),
        platform: "Any",
        deliverables,
        requirements,
        tags: [],
        location: "",
        duration: postingLabel,
        budgetMin: Math.round(total),
        budgetMax: Math.round(total),
        visibility: "public",
      });
      dispatch({ type: "PUBLISH_JOB", job });
      setPosted(true);
    } catch (err) {
      setSubmitError(err instanceof Error && err.message ? err.message : t("flow.hireSubmitFailed"));
    } finally {
      setSending(false);
    }
  }

  const pageTitle =
    step === 4
      ? t("flow.hireConfirmTitle")
      : step === 3
        ? t("flow.hireRequirementsTitle")
        : step === 2
          ? t("flow.hireBriefTitle")
          : t("flow.hireTitle");
  const pageSubtitle =
    step === 4
      ? t("flow.publicConfirmSubtitle")
      : step === 3
        ? t("flow.hireRequirementsSubtitle")
        : step === 2
          ? t("flow.hireBriefSubtitle")
          : t("flow.publicOrderSubtitle");

  return (
    <FlowPage title={pageTitle} subtitle={pageSubtitle} backHref="/" leading={<HireSteps step={step} />}>
      {step === 4 ? (
        <FlowCard>
          <div className="space-y-3">
            <SummaryField label={t("flow.publicNeed")} value={need.trim()} />
            {basePrice > 0 && <SummaryField label={t("flow.publicPrice")} value={formatBaht(basePrice)} />}
            {filledAddons.length > 0 && (
              <SummaryField
                label={t("flow.inviteAddons")}
                value={filledAddons
                  .map((item) => {
                    const amount = parsePrice(item.price);
                    return [item.name.trim() || "—", amount > 0 ? formatBaht(amount) : ""].filter(Boolean).join(" · ");
                  })
                  .join("\n")}
              />
            )}
            {total > 0 && (
              <SummaryField label={t("influencerDetail.selectedTotal")} value={formatBaht(total)} />
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

          {posted ? (
            <div className="mt-5 space-y-3">
              <p className="rounded-xl border border-[#d7ead3] bg-[#f3faf2] px-3.5 py-3 text-[13px] leading-relaxed text-[#24612a]">
                {t("flow.publicSent")}
              </p>
              <button type="button" onClick={() => router.push("/")} className={primaryBtn}>
                {t("common.back")}
              </button>
            </div>
          ) : (
            <form className="mt-5 space-y-3" onSubmit={handlePublish}>
              <p className="rounded-xl border border-[#f0d3a8] bg-[#fff6e8] px-3.5 py-3 text-[13px] leading-relaxed text-[#7a4e12]">
                {t("flow.hireLockWarning")}
              </p>
              {submitError && <p className="text-[13px] text-[#c0392b]">{submitError}</p>}
              <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
                <button type="button" onClick={() => setStep(3)} className={`${secondaryBtn} sm:flex-1`} disabled={sending}>
                  {t("flow.hireBack")}
                </button>
                <button type="submit" className={`${primaryBtn} sm:flex-1`} disabled={sending}>
                  {sending ? t("postJob.submitting") : t("postJob.submit")}
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
                  <p className="mt-1 text-[13px] leading-relaxed text-[#666]">{t(`flow.${item.hintKey}`)}</p>
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

            <label className="block text-[13px] font-medium text-[#333]" htmlFor="public-required-message">
              {t("flow.hireRequiredMessage")}
              <RequiredMark />
              <textarea
                id="public-required-message"
                aria-required="true"
                rows={3}
                value={requiredMessage}
                onChange={(event) => setRequiredMessage(event.target.value)}
                placeholder={t("flow.hireRequiredMessagePlaceholder")}
                className={`mt-1.5 resize-y ${fieldClass}`}
              />
            </label>
            <label className="block text-[13px] font-medium text-[#333]" htmlFor="public-forbidden-message">
              {t("flow.hireForbiddenMessage")}
              <RequiredMark />
              <textarea
                id="public-forbidden-message"
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
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!briefReady) return;
              setStep(3);
            }}
            className="space-y-5"
          >
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
            <label className="block text-[13px] font-medium text-[#333]" htmlFor="public-description">
              {t("flow.hireProductDescription")}
              <RequiredMark />
              <textarea
                id="public-description"
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
                        checked ? "border-brand bg-brand/5 text-brand" : "border-[#ebebeb] bg-surface text-[#333]"
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
            <label className="block text-[13px] font-medium text-[#333]" htmlFor="public-subtitle">
              {t("flow.hireCaption")}
              <input
                id="public-subtitle"
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
            <label className="block" htmlFor="public-need">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                {t("flow.publicNeed")}
                <RequiredMark />
              </span>
              <textarea
                id="public-need"
                aria-required="true"
                rows={4}
                value={need}
                onChange={(event) => setNeed(event.target.value)}
                placeholder={t("flow.publicNeedPlaceholder")}
                className={`mt-2 resize-y ${fieldClass}`}
              />
            </label>

            <label className="mt-4 block" htmlFor="public-price">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                {t("flow.publicPrice")}
              </span>
              <input
                id="public-price"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0"
                className={`mt-2 ${fieldClass}`}
              />
            </label>

            <div className="mt-4 border-t border-[#f0f0f0] pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#999]">
                {t("flow.inviteAddons")}
              </p>
              <div className="mt-2 space-y-2">
                {addons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={item.name}
                      onChange={(event) => updateAddon(index, { name: event.target.value })}
                      placeholder={t("flow.publicAddonName")}
                      aria-label={t("flow.publicAddonName")}
                      className={fieldClass}
                    />
                    <input
                      value={item.price}
                      inputMode="decimal"
                      onChange={(event) => updateAddon(index, { price: event.target.value })}
                      placeholder={t("flow.publicPrice")}
                      aria-label={t("flow.publicPrice")}
                      className={`${fieldClass} max-w-[8.5rem]`}
                    />
                    <button
                      type="button"
                      onClick={() => setAddons((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="shrink-0 text-[12px] font-semibold text-[#c0392b]"
                    >
                      {t("profile.removeItem")}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setAddons((current) => [...current, { name: "", price: "" }])}
                className="mt-3 rounded-lg border border-brand px-3 py-1.5 text-[12px] font-semibold text-brand"
              >
                {t("flow.publicAddAddon")}
              </button>
            </div>

            {total > 0 && (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f0f0] pt-4">
                <span className="text-[14px] font-bold text-[#111]">{t("influencerDetail.selectedTotal")}</span>
                <span className="text-[18px] font-extrabold text-brand">{formatBaht(total)}</span>
              </div>
            )}
          </FlowCard>

          <FlowCard>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!orderReady) return;
                setConfirmedPosting(postingAt);
                setStep(2);
              }}
              className="space-y-4"
            >
              <label className="block text-[13px] font-medium text-[#333]" htmlFor="public-posting-time">
                {t("flow.hirePostingTime")}
                <RequiredMark />
                <input
                  id="public-posting-time"
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
              <button type="submit" className={primaryBtn} disabled={!orderReady}>
                {t("flow.hireContinue")}
              </button>
            </form>
          </FlowCard>
        </>
      )}
    </FlowPage>
  );
}
