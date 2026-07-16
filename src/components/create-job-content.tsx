"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import { PLATFORM_COLORS, type Platform } from "@/lib/mock-jobs";

const PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];

const inputClass =
  "w-full rounded-xl border border-[#ddd] bg-white px-3.5 py-3 text-[14px] text-[#111] outline-none placeholder:text-[#bbb] focus:border-[#9d003b] focus:ring-1 focus:ring-[#9d003b]";
const labelClass = "block text-[14px] font-medium text-[#333] mb-1.5";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className={labelClass}>{label}</label>
        {hint && <span className="text-[12px] text-[#aaa]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e8e4de] bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-[15px] font-bold text-[#111]">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function CreateJobContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Only entrepreneurs may post jobs. Influencers get bounced home.
  useEffect(() => {
    if (user && user.role !== "entrepreneur") {
      router.replace("/");
    }
  }, [user, router]);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<Platform>("Instagram");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [brief, setBrief] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [requirements, setRequirements] = useState("");
  const [tags, setTags] = useState("");
  const [website, setWebsite] = useState("");
  const [aboutBrand, setAboutBrand] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit =
    title.trim() !== "" &&
    description.trim() !== "" &&
    budgetMin.trim() !== "" &&
    budgetMax.trim() !== "" &&
    location.trim() !== "" &&
    duration.trim() !== "" &&
    !submitting;

  function resetForm() {
    setTitle("");
    setPlatform("Instagram");
    setDescription("");
    setBudgetMin("");
    setBudgetMax("");
    setLocation("");
    setDuration("");
    setBrief("");
    setDeliverables("");
    setRequirements("");
    setTags("");
    setWebsite("");
    setAboutBrand("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const min = Number(budgetMin);
    const max = Number(budgetMax);
    if (Number.isFinite(min) && Number.isFinite(max) && max < min) {
      setError(t("createJob.budgetError"));
      return;
    }

    setSubmitting(true);
    // Mock persistence — in a real app this would POST to the API.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf9f7]">
        <MainHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-16">
          <div className="w-full rounded-2xl border border-[#e8e4de] bg-white p-8 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#e7f8e0]">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M7 15.5L12.5 21L23 9"
                  stroke="#16a34a"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="text-[24px] font-bold text-[#111]">
              {t("createJob.successTitle")}
            </h1>
            <p className="mt-2 text-[15px] text-[#777]">
              {t("createJob.successMessage")}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/my-jobs"
                className="inline-flex h-[46px] items-center justify-center rounded-xl bg-[#9d003b] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(157,0,59,0.35)] transition-colors hover:bg-[#850030]"
              >
                {t("createJob.viewMyJobs")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSuccess(false);
                }}
                className="inline-flex h-[46px] items-center justify-center rounded-xl border border-[#ddd] bg-white px-6 text-[15px] font-semibold text-[#333] transition-colors hover:bg-[#fafafa]"
              >
                {t("createJob.postAnother")}
              </button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f7]">
      <MainHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-12">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold tracking-tight text-[#111]">
            {t("createJob.title")}
          </h1>
          <p className="mt-1.5 text-[15px] text-[#777]">{t("createJob.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <SectionCard title={t("createJob.sectionBasics")}>
            <Field label={t("createJob.jobTitleLabel")}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("createJob.jobTitlePlaceholder")}
                required
                className={inputClass}
              />
            </Field>

            <Field label={t("createJob.platformLabel")}>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22 fill=%22none%22><path d=%22M2 4.5L6 8.5L10 4.5%22 stroke=%22%23999%22 stroke-width=%221.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t("createJob.descriptionLabel")}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("createJob.descriptionPlaceholder")}
                required
                rows={2}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </SectionCard>

          <SectionCard title={t("createJob.sectionBudget")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("createJob.budgetMinLabel")}>
                <input
                  type="number"
                  min={0}
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  placeholder="10000"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label={t("createJob.budgetMaxLabel")}>
                <input
                  type="number"
                  min={0}
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  placeholder="50000"
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t("createJob.locationLabel")}>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("createJob.locationPlaceholder")}
                  required
                  className={inputClass}
                />
              </Field>
              <Field label={t("createJob.durationLabel")}>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder={t("createJob.durationPlaceholder")}
                  required
                  className={inputClass}
                />
              </Field>
            </div>
          </SectionCard>

          <SectionCard title={t("createJob.sectionDetails")}>
            <Field label={t("createJob.briefLabel")}>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder={t("createJob.briefPlaceholder")}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field
              label={t("createJob.deliverablesLabel")}
              hint={t("createJob.deliverablesHint")}
            >
              <textarea
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder={t("createJob.deliverablesPlaceholder")}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field
              label={t("createJob.requirementsLabel")}
              hint={t("createJob.requirementsHint")}
            >
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={t("createJob.requirementsPlaceholder")}
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field label={t("createJob.tagsLabel")} hint={t("createJob.tagsHint")}>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t("createJob.tagsPlaceholder")}
                className={inputClass}
              />
            </Field>

            <Field label={t("createJob.websiteLabel")}>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder={t("createJob.websitePlaceholder")}
                className={inputClass}
              />
            </Field>

            <Field label={t("createJob.aboutBrandLabel")}>
              <textarea
                value={aboutBrand}
                onChange={(e) => setAboutBrand(e.target.value)}
                placeholder={t("createJob.aboutBrandPlaceholder")}
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </SectionCard>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-600">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/"
              className="inline-flex h-[48px] items-center justify-center rounded-xl border border-[#ddd] bg-white px-6 text-[15px] font-semibold text-[#333] transition-colors hover:bg-[#fafafa]"
            >
              {t("createJob.cancel")}
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex h-[48px] items-center justify-center rounded-xl bg-[#9d003b] px-8 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(157,0,59,0.35)] transition-colors hover:bg-[#850030] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t("createJob.submitting") : t("createJob.submit")}
            </button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
