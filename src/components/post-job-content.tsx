"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import {
  formatBudgetRange,
  PLATFORM_COLORS,
  type Platform,
} from "@/lib/mock-jobs";
import { useFlowchart } from "@/hooks/use-flowchart";
import { buildInvite, buildPostedJob } from "@/lib/flowchart/builders";
import type { JobVisibility } from "@/lib/flowchart/types";
import {
  fetchInfluencers,
  type InfluencerListItem,
} from "@/lib/influencers";

const PLATFORMS = Object.keys(PLATFORM_COLORS) as Platform[];
const PLATFORM_ANY = "Any" as const;
type PlatformOption = Platform | typeof PLATFORM_ANY;

const PLATFORM_ANY_STYLE = { bg: "#efeae4", text: "#5a5550" };

const CARD =
  "rounded-[1.75rem] bg-white p-5 shadow-[0_8px_32px_rgba(17,17,17,0.08)] sm:p-8";
const FIELD =
  "w-full rounded-xl border border-[#e0dbd5] bg-[#faf8f6] px-3.5 py-3 text-[14px] text-[#2a2622] placeholder-[#b3aca4] outline-none transition-[border-color,background-color,box-shadow] focus:border-[#9d003b] focus:bg-white focus:ring-2 focus:ring-[#9d003b]/25";
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d003b]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

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
  required,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[13px] font-semibold text-[#3a3530]"
      >
        {label}
        {required ? (
          <span className="ml-1 text-[#e11d48]" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-[12px] leading-snug text-[#8a8580]">{hint}</p> : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="h-5 w-1 rounded-full bg-[#9d003b]" aria-hidden />
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-[#141414]">
        {children}
      </h2>
    </div>
  );
}

function PromoteSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-[#9d003b] justify-end" : "bg-[#d9d4ce] justify-start"
      }`}
    >
      <span className="block h-6 w-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]" />
    </span>
  );
}

function PreviewValue({
  value,
  emptyLabel,
}: {
  value: string;
  emptyLabel: string;
}) {
  if (!value.trim()) {
    return <span className="text-[#b3aca4]">{emptyLabel}</span>;
  }
  return <>{value}</>;
}

function RemoveIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SelectedTag({
  label,
  onRemove,
  removeLabel,
  style,
}: {
  label: string;
  onRemove: () => void;
  removeLabel: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
      style={style ?? { backgroundColor: "rgba(157,0,59,0.08)", color: "#9d003b" }}
    >
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`${removeLabel} ${label}`}
        className={`grid h-4 w-4 place-items-center rounded-full opacity-70 transition-opacity hover:opacity-100 ${FOCUS_RING}`}
      >
        <RemoveIcon />
      </button>
    </span>
  );
}

function platformStyle(platform: PlatformOption): { bg: string; text: string } {
  if (platform === PLATFORM_ANY) return PLATFORM_ANY_STYLE;
  return PLATFORM_COLORS[platform];
}

function PlatformAutocomplete({
  selected,
  onChange,
  inputId,
  placeholder,
  emptyLabel,
  removeLabel,
  anyLabel,
}: {
  selected: PlatformOption[];
  onChange: (next: PlatformOption[]) => void;
  inputId: string;
  placeholder: string;
  emptyLabel: string;
  removeLabel: string;
  anyLabel: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const options: PlatformOption[] = [PLATFORM_ANY, ...PLATFORMS];
  const available = options.filter((platform) => !selected.includes(platform));
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = available.filter((platform) => {
    const label =
      platform === PLATFORM_ANY ? anyLabel : platform;
    return (
      label.toLowerCase().includes(normalizedQuery) ||
      platform.toLowerCase().includes(normalizedQuery)
    );
  });

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function addPlatform(platform: PlatformOption) {
    if (selected.includes(platform)) return;
    // "Any" is exclusive — picking it clears specific platforms, and vice versa.
    onChange(platform === PLATFORM_ANY ? [PLATFORM_ANY] : [...selected.filter((item) => item !== PLATFORM_ANY), platform]);
    setQuery("");
    setOpen(false);
  }

  function labelFor(platform: PlatformOption) {
    return platform === PLATFORM_ANY ? anyLabel : platform;
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0 ? 0 : (index + 1) % filtered.length
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0
          ? 0
          : (index - 1 + filtered.length) % filtered.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const choice = filtered[activeIndex];
      if (choice) addPlatform(choice);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && query === "" && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-option-${filtered[activeIndex]}`
            : undefined
        }
        className={FIELD}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-[#ece7e1] bg-white py-1.5 shadow-[0_12px_32px_rgba(17,17,17,0.12)]"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[13px] text-[#8a8580]">{emptyLabel}</li>
          ) : (
            filtered.map((platform, index) => {
              const style = platformStyle(platform);
              const active = index === activeIndex;
              return (
                <li key={platform} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${platform}`}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] ${
                      active ? "bg-[#9d003b]/8 text-[#141414]" : "text-[#333] hover:bg-[#faf8f6]"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addPlatform(platform)}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: style.bg }}
                      aria-hidden
                    />
                    {labelFor(platform)}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
      {selected.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {selected.map((platform) => {
            const style = platformStyle(platform);
            return (
              <SelectedTag
                key={platform}
                label={labelFor(platform)}
                removeLabel={removeLabel}
                style={{ backgroundColor: style.bg, color: style.text }}
                onRemove={() =>
                  onChange(selected.filter((item) => item !== platform))
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function InfluencerAutocomplete({
  selected,
  onChange,
  inputId,
  placeholder,
  emptyLabel,
  loadingLabel,
  removeLabel,
  selectedHeading,
}: {
  selected: InfluencerListItem[];
  onChange: (next: InfluencerListItem[]) => void;
  inputId: string;
  placeholder: string;
  emptyLabel: string;
  loadingLabel: string;
  removeLabel: string;
  selectedHeading: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [results, setResults] = useState<InfluencerListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedIds = new Set(selected.map((item) => item.id));
  const filtered = results.filter((item) => !selectedIds.has(item.id));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    fetchInfluencers(
      { search: debouncedQuery || undefined, limit: 8 },
      controller.signal
    )
      .then((items) => {
        if (!controller.signal.aborted) setResults(items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debouncedQuery, open]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, results, open]);

  function addInfluencer(influencer: InfluencerListItem) {
    if (selectedIds.has(influencer.id)) return;
    onChange([...selected, influencer]);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0 ? 0 : (index + 1) % filtered.length
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        filtered.length === 0
          ? 0
          : (index - 1 + filtered.length) % filtered.length
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const choice = filtered[activeIndex];
      if (choice) addInfluencer(choice);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && query === "" && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={inputId}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-option-${filtered[activeIndex].id}`
            : undefined
        }
        className={FIELD}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-[#ece7e1] bg-white py-1.5 shadow-[0_12px_32px_rgba(17,17,17,0.12)]"
        >
          {loading ? (
            <li className="px-3.5 py-2.5 text-[13px] text-[#8a8580]">
              {loadingLabel}
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-[13px] text-[#8a8580]">{emptyLabel}</li>
          ) : (
            filtered.map((influencer, index) => {
              const active = index === activeIndex;
              return (
                <li key={influencer.id} role="presentation">
                  <button
                    type="button"
                    id={`${listId}-option-${influencer.id}`}
                    role="option"
                    aria-selected={active}
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left ${
                      active ? "bg-[#9d003b]/8" : "hover:bg-[#faf8f6]"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => addInfluencer(influencer)}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full text-[12px] font-semibold text-[#6d0028] ${influencer.avatarBg}`}
                      style={
                        influencer.avatarUrl
                          ? {
                              backgroundImage: `url(${influencer.avatarUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      {influencer.avatarUrl ? null : influencer.name.charAt(0)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#141414]">
                        {influencer.name}
                      </span>
                      <span className="block truncate text-[12px] text-[#8a8580]">
                        {influencer.handle}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      ) : null}
      {selected.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8a8580]">
            {selectedHeading}
          </p>
          <ul className="space-y-2">
            {selected.map((influencer) => (
              <li
                key={influencer.id}
                className="flex items-center gap-3 rounded-2xl border border-[#ece7e1] bg-[#faf8f6] px-3 py-2.5"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-[12px] font-semibold text-[#6d0028] ${influencer.avatarBg}`}
                  style={
                    influencer.avatarUrl
                      ? {
                          backgroundImage: `url(${influencer.avatarUrl})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {influencer.avatarUrl ? null : influencer.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[#141414]">
                    {influencer.name}
                  </span>
                  <span className="block truncate text-[12px] text-[#8a8580]">
                    {influencer.handle}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(selected.filter((item) => item.id !== influencer.id))
                  }
                  aria-label={`${removeLabel} ${influencer.name}`}
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#888] hover:bg-white hover:text-[#9d003b] ${FOCUS_RING}`}
                >
                  <RemoveIcon />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default function PostJobContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { dispatch } = useFlowchart();
  const promoteLabelId = useId();
  const previewHeadingId = useId();
  const platformInputId = useId();
  const influencerInputId = useId();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState("");
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [deliverables, setDeliverables] = useState("");
  const [requirements, setRequirements] = useState("");
  const [tags, setTags] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [visibility, setVisibility] = useState<JobVisibility>("public");
  const [promoted, setPromoted] = useState(false);
  const [invitees, setInvitees] = useState<InfluencerListItem[]>([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (!previewOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setPreviewOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [previewOpen]);

  if (user && user.role !== "entrepreneur") {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf8f6]">
        <MainHeader />
        <main className="mx-auto flex-1 max-w-2xl px-4 py-16 text-center">
          <p className="text-[15px] text-[#555]">{t("postJob.notEntrepreneur")}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const canSubmit =
    title.trim() !== "" &&
    description.trim() !== "" &&
    platforms.length > 0 &&
    !loading;

  const deliverableItems = splitLines(deliverables);
  const requirementItems = splitLines(requirements);
  const tagItems = splitTags(tags);
  const budgetMinValue = budgetMin.trim() ? Number(budgetMin) : 0;
  const budgetMaxValue = budgetMax.trim() ? Number(budgetMax) : 0;
  const primaryPlatform = platforms[0] ?? PLATFORM_ANY;
  const emptyLabel = t("postJob.previewEmpty");
  const anyLabel = t("common.any");

  function platformDisplayLabel(platform: PlatformOption) {
    return platform === PLATFORM_ANY ? anyLabel : platform;
  }

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
        platform: platforms.join(", "),
        deliverables: deliverableItems,
        requirements: requirementItems,
        tags: tagItems,
        location: location.trim(),
        duration: duration.trim(),
        budgetMin: budgetMinValue,
        budgetMax: budgetMaxValue,
        visibility,
        promoted,
      });
      dispatch({ type: "PUBLISH_JOB", job: posted });

      if (visibility === "private") {
        for (const influencer of invitees) {
          dispatch({
            type: "SEND_INVITE",
            invite: buildInvite({
              jobId: posted.id,
              entrepreneurId: user!.id,
              influencerId: influencer.id,
              fromCompany: user!.name,
              influencerName: influencer.name,
              isPrivate: true,
            }),
          });
        }
      }

      router.push(visibility === "private" ? "/direct" : "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post job");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f6]">
      <MainHeader />
      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-10 sm:py-14">
        <h1 className="text-[1.85rem] font-semibold leading-[1.15] tracking-[-0.04em] text-[#141414] sm:text-[2.1rem]">
          {t("postJob.title")}
        </h1>
        <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-[#7a7570]">
          {t("postJob.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className={`mt-8 ${CARD}`}>
          <section>
            <SectionHeading>{t("postJob.sectionBasics")}</SectionHeading>
            <div className="space-y-5">
              <Field label={t("postJob.titleLabel")} required htmlFor="job-title">
                <input
                  id="job-title"
                  className={FIELD}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t("postJob.titlePlaceholder")}
                  required
                />
              </Field>

              <Field
                label={t("postJob.descriptionLabel")}
                required
                htmlFor="job-description"
              >
                <textarea
                  id="job-description"
                  className={FIELD}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("postJob.descriptionPlaceholder")}
                  required
                />
              </Field>

              <Field
                label={t("postJob.platformLabel")}
                required
                htmlFor={platformInputId}
              >
                <PlatformAutocomplete
                  selected={platforms}
                  onChange={setPlatforms}
                  inputId={platformInputId}
                  placeholder={t("postJob.platformPlaceholder")}
                  emptyLabel={t("postJob.platformEmpty")}
                  removeLabel={t("postJob.removeSelected")}
                  anyLabel={anyLabel}
                />
              </Field>
            </div>
          </section>

          <hr className="my-8 border-[#f1ece6]" />

          <section>
            <SectionHeading>{t("postJob.sectionCampaign")}</SectionHeading>
            <div className="space-y-5">
              <Field label={t("postJob.briefLabel")} htmlFor="job-brief">
                <textarea
                  id="job-brief"
                  className={FIELD}
                  rows={5}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder={t("postJob.briefPlaceholder")}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label={t("postJob.deliverablesLabel")} htmlFor="job-deliverables">
                  <textarea
                    id="job-deliverables"
                    className={FIELD}
                    rows={4}
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                    placeholder={t("postJob.deliverablesPlaceholder")}
                  />
                </Field>
                <Field label={t("postJob.requirementsLabel")} htmlFor="job-requirements">
                  <textarea
                    id="job-requirements"
                    className={FIELD}
                    rows={4}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder={t("postJob.requirementsPlaceholder")}
                  />
                </Field>
              </div>

              <Field label={t("postJob.tagsLabel")} htmlFor="job-tags">
                <input
                  id="job-tags"
                  className={FIELD}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder={t("postJob.tagsPlaceholder")}
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label={t("postJob.locationLabel")} htmlFor="job-location">
                  <input
                    id="job-location"
                    className={FIELD}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("postJob.locationPlaceholder")}
                  />
                </Field>
                <Field label={t("postJob.durationLabel")} htmlFor="job-duration">
                  <input
                    id="job-duration"
                    className={FIELD}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder={t("postJob.durationPlaceholder")}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label={t("postJob.budgetMinLabel")} htmlFor="job-budget-min">
                  <input
                    id="job-budget-min"
                    type="number"
                    min={0}
                    className={FIELD}
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                  />
                </Field>
                <Field label={t("postJob.budgetMaxLabel")} htmlFor="job-budget-max">
                  <input
                    id="job-budget-max"
                    type="number"
                    min={0}
                    className={FIELD}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </section>

          <hr className="my-8 border-[#f1ece6]" />

          <section>
            <SectionHeading>{t("postJob.sectionListing")}</SectionHeading>
            <fieldset>
              <legend className="mb-2 block text-[13px] font-semibold text-[#3a3530]">
                {t("postJob.visibilityLabel")}
              </legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(["public", "private"] as const).map((value) => {
                  const selected = visibility === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-[13px] leading-snug transition-colors ${
                        selected
                          ? "border-[#9d003b]/40 bg-[#9d003b]/8 text-[#141414]"
                          : "border-[#ece7e1] bg-[#faf8f6] text-[#555] hover:border-[#ddd6ce]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={value}
                        checked={selected}
                        onChange={() => setVisibility(value)}
                        className="mt-0.5 accent-[#9d003b]"
                      />
                      <span>
                        {value === "public"
                          ? t("postJob.visibilityPublic")
                          : t("postJob.visibilityPrivate")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {visibility === "private" ? (
              <div className="mt-4">
                <Field
                  label={t("postJob.influencersLabel")}
                  hint={t("postJob.influencersHint")}
                  htmlFor={influencerInputId}
                >
                  <InfluencerAutocomplete
                    selected={invitees}
                    onChange={setInvitees}
                    inputId={influencerInputId}
                    placeholder={t("postJob.influencersPlaceholder")}
                    emptyLabel={t("postJob.influencersEmpty")}
                    loadingLabel={t("postJob.influencersLoading")}
                    removeLabel={t("postJob.removeSelected")}
                    selectedHeading={t("postJob.influencersSelected")}
                  />
                </Field>
              </div>
            ) : null}

            <button
              type="button"
              role="switch"
              aria-checked={promoted}
              aria-labelledby={promoteLabelId}
              onClick={() => setPromoted((value) => !value)}
              className={`mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-[#ece7e1] bg-[#faf8f6] px-4 py-3.5 text-left transition-colors hover:border-[#ddd6ce] ${FOCUS_RING}`}
            >
              <span>
                <span
                  id={promoteLabelId}
                  className="block text-[14px] font-semibold text-[#141414]"
                >
                  {t("postJob.promoteLabel")}
                </span>
                <span className="mt-0.5 block text-[12px] leading-snug text-[#8a8580]">
                  {t("postJob.promoteHint")}
                </span>
              </span>
              <PromoteSwitch checked={promoted} />
            </button>
          </section>

          {error && <p className="mt-5 text-[13px] text-red-600">{error}</p>}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className={`flex-1 rounded-2xl border border-[#e0dbd5] bg-white px-6 py-3.5 text-[15px] font-semibold text-[#333] transition-colors hover:border-[#9d003b] hover:text-[#9d003b] ${FOCUS_RING}`}
            >
              {t("postJob.preview")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 rounded-2xl bg-[#d7ff2f] px-6 py-3.5 text-[15px] font-extrabold text-[#151515] shadow-[0_6px_20px_rgba(215,255,47,0.4)] transition-colors hover:bg-[#c8f020] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t("postJob.submitting") : t("postJob.submit")}
            </button>
          </div>
        </form>
      </main>
      <SiteFooter />

      {previewOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label={t("postJob.closePreview")}
            className="absolute inset-0 bg-black/40"
            onClick={() => setPreviewOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={previewHeadingId}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] bg-white p-5 shadow-[0_24px_64px_rgba(17,17,17,0.18)] sm:rounded-[1.75rem] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id={previewHeadingId}
                  className="text-[18px] font-semibold tracking-[-0.02em] text-[#141414]"
                >
                  {t("postJob.previewTitle")}
                </h2>
                <p className="mt-0.5 text-[13px] text-[#8a8580]">
                  {t("postJob.previewListing")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                aria-label={t("postJob.closePreview")}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#888] hover:bg-[#f5f5f5] ${FOCUS_RING}`}
              >
                <RemoveIcon />
              </button>
            </div>

            <article className="overflow-hidden rounded-[1.25rem] border border-[#ebe6e0] bg-white shadow-[0_1px_2px_rgba(40,20,10,0.04)]">
              <div className="relative h-32 overflow-hidden bg-[#9d003b]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {(platforms.length > 0 ? platforms : [primaryPlatform]).map(
                    (platform) => {
                      const style = platformStyle(platform);
                      return (
                        <span
                          key={platform}
                          className="rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                          }}
                        >
                          {platformDisplayLabel(platform)}
                        </span>
                      );
                    }
                  )}
                </div>
                {promoted ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#d7ff2f] px-2 py-0.5 text-[10px] font-semibold text-[#2a1018]">
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
                      <path d="M5 0L6.2 3.8H10L7 6.1L8.2 10L5 7.6L1.8 10L3 6.1L0 3.8H3.8L5 0Z" />
                    </svg>
                    {t("jobDetail.promoted")}
                  </span>
                ) : null}
                <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white">
                  {formatBudgetRange(budgetMinValue, budgetMaxValue)}
                </span>
              </div>
              <div className="space-y-1.5 p-4">
                <h3 className="text-[15px] font-semibold leading-snug text-[#141414]">
                  <PreviewValue value={title} emptyLabel={emptyLabel} />
                </h3>
                <p className="text-[12px] text-[#7a7570]">
                  {user?.name ?? emptyLabel}
                </p>
                <p className="text-[12px] leading-relaxed text-[#555]">
                  <PreviewValue value={description} emptyLabel={emptyLabel} />
                </p>
                <p className="text-[11px] text-[#9a9590]">
                  <PreviewValue
                    value={[location, duration].filter(Boolean).join(" · ")}
                    emptyLabel={emptyLabel}
                  />
                </p>
                <p className="text-[11px] font-medium text-[#8a8580]">
                  {visibility === "public"
                    ? t("postJob.visibilityPublic")
                    : t("postJob.visibilityPrivate")}
                </p>
              </div>
            </article>

            {visibility === "private" && invitees.length > 0 ? (
              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-[#3a3530]">
                  {t("postJob.influencersSelected")}
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {invitees.map((influencer) => (
                    <li key={influencer.id} className="text-[13px] text-[#555]">
                      {influencer.name}{" "}
                      <span className="text-[#8a8580]">{influencer.handle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {(brief.trim() || tagItems.length > 0) && (
              <div className="mt-5">
                <h3 className="text-[13px] font-semibold text-[#3a3530]">
                  {t("jobDetail.campaignBrief")}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#3a3530]">
                  <PreviewValue value={brief} emptyLabel={emptyLabel} />
                </p>
                {tagItems.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagItems.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#9d003b]/8 px-3 py-1.5 text-[12px] font-medium text-[#9d003b]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {deliverableItems.length > 0 || requirementItems.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {deliverableItems.length > 0 ? (
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#3a3530]">
                      {t("jobDetail.deliverables")}
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-[13px] text-[#555]">
                      {deliverableItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {requirementItems.length > 0 ? (
                  <div>
                    <h3 className="text-[13px] font-semibold text-[#3a3530]">
                      {t("jobDetail.requirements")}
                    </h3>
                    <ul className="mt-2 space-y-1.5 text-[13px] text-[#555]">
                      {requirementItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
