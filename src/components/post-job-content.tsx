"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import { PLATFORM_COLORS, type Platform } from "@/lib/mock-jobs";
import { useFlowchart } from "@/hooks/use-flowchart";
import { buildPostedJob } from "@/lib/flowchart/builders";
import type { JobVisibility } from "@/lib/flowchart/types";

const PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-[#333] mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#ddd] bg-white px-3.5 py-3 text-[14px] text-[#111] focus:border-[#9d003b] focus:outline-none focus:ring-1 focus:ring-[#9d003b]";

export default function PostJobContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { dispatch } = useFlowchart();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState("");
  const [platform, setPlatform] = useState<Platform>(PLATFORMS[0]);
  const [deliverables, setDeliverables] = useState("");
  const [requirements, setRequirements] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [visibility, setVisibility] = useState<JobVisibility>("public");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && user.role !== "entrepreneur") {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf7f2]">
        <MainHeader />
        <main className="mx-auto flex-1 max-w-2xl px-4 py-16 text-center">
          <p className="text-[15px] text-[#555]">{t("postJob.notEntrepreneur")}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const canSubmit =
    title.trim() !== "" && description.trim() !== "" && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // UI-ONLY: persist locally so the chart can be walked without Job API.
      // API connecting: restore createJob() and drop local dispatch when the
      // marketplace Job mutation is live. RISK: this listing never reaches
      // other users or devices.
      const posted = buildPostedJob({
        entrepreneurId: user!.id,
        companyName: user!.name,
        title: title.trim(),
        description: description.trim(),
        brief: brief.trim(),
        platform,
        deliverables: splitLines(deliverables),
        requirements: splitLines(requirements),
        tags: splitTags(tags),
        location: location.trim(),
        duration: duration.trim(),
        budgetMin: budgetMin.trim() ? Number(budgetMin) : 0,
        budgetMax: budgetMax.trim() ? Number(budgetMax) : 0,
        visibility,
      });
      dispatch({ type: "PUBLISH_JOB", job: posted });
      router.push(visibility === "private" ? "/direct" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f2]">
      <MainHeader />
      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="text-[22px] font-bold text-[#111]">{t("postJob.title")}</h1>
        <p className="mt-1 text-[14px] text-[#777]">{t("postJob.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label={t("postJob.titleLabel")}>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("postJob.titlePlaceholder")}
              required
            />
          </Field>

          <Field label={t("postJob.descriptionLabel")}>
            <textarea
              className={inputClass}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("postJob.descriptionPlaceholder")}
              required
            />
          </Field>

          <Field label={t("postJob.briefLabel")}>
            <textarea
              className={inputClass}
              rows={5}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t("postJob.briefPlaceholder")}
            />
          </Field>

          <Field label={t("postJob.platformLabel")}>
            <select
              className={inputClass}
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field label={t("postJob.deliverablesLabel")}>
            <textarea
              className={inputClass}
              rows={4}
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder={t("postJob.deliverablesPlaceholder")}
            />
          </Field>

          <Field label={t("postJob.requirementsLabel")}>
            <textarea
              className={inputClass}
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder={t("postJob.requirementsPlaceholder")}
            />
          </Field>

          <Field label={t("postJob.tagsLabel")}>
            <input
              className={inputClass}
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={t("postJob.tagsPlaceholder")}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("postJob.locationLabel")}>
              <input
                className={inputClass}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("postJob.locationPlaceholder")}
              />
            </Field>
            <Field label={t("postJob.durationLabel")}>
              <input
                className={inputClass}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t("postJob.durationPlaceholder")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("postJob.budgetMinLabel")}>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </Field>
            <Field label={t("postJob.budgetMaxLabel")}>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1.5 block text-[14px] font-medium text-[#333]">
              {t("postJob.visibilityLabel")}
            </legend>
            <div className="space-y-2">
              {(["public", "private"] as const).map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#eee] bg-white px-3.5 py-3 text-[13px]"
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={value}
                    checked={visibility === value}
                    onChange={() => setVisibility(value)}
                    className="mt-0.5"
                  />
                  <span>
                    {value === "public"
                      ? t("postJob.visibilityPublic")
                      : t("postJob.visibilityPrivate")}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && <p className="text-[13px] text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-[#d7ff2f] px-6 py-3.5 text-[15px] font-extrabold text-[#151515] shadow-[0_6px_20px_rgba(215,255,47,0.4)] transition-colors hover:bg-[#c8f020] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("postJob.submitting") : t("postJob.submit")}
          </button>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
