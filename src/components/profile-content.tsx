"use client";

import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { setStoredUser } from "@/lib/auth";
import { fetchEntrepreneurByEmail, type ApiEntrepreneur } from "@/lib/entrepreneurs";
import { fetchInfluencerByEmail, type ApiInfluencer } from "@/lib/influencers";
import { PLATFORM_COLORS } from "@/lib/mock-jobs";
import { INFLUENCER_CATEGORY_KEYS } from "@/lib/mock-influencers";
import { emptyJobProfile, type JobProfile, type MockUser } from "@/lib/mock-users";

// ─── Country data ─────────────────────────────────────────────────────────────

const COUNTRIES = [
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+1",  flag: "🇺🇸", name: "USA / Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
] as const;

// ─── Country code picker ──────────────────────────────────────────────────────

function CountryCodePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = COUNTRIES.find((c) => c.code === value) ?? COUNTRIES[0];

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-full items-center gap-1.5 rounded-l-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#333] transition-colors hover:bg-surface focus:outline-none"
      >
        <span>{selected.flag}</span>
        <span>{selected.code}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#aaa]">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-60 w-56 overflow-y-auto rounded-xl border border-[#eee] bg-white py-1 shadow-lg">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onChange(c.code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-surface ${value === c.code ? "font-semibold text-brand" : "text-[#333]"}`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="flex-1">{c.name}</span>
              <span className="text-[#999]">{c.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Phone field (edit) ───────────────────────────────────────────────────────

function PhoneEditField({
  label,
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
}: {
  label: string;
  countryCode: string;
  phone: string;
  onCountryChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">{label}</span>
      <div className="flex">
        <CountryCodePicker value={countryCode} onChange={onCountryChange} />
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="min-w-0 flex-1 rounded-r-lg border border-l-0 border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none transition-colors focus:border-brand focus:bg-white"
        />
      </div>
    </div>
  );
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  const display = value ?? "";
  return (
    <div className="flex flex-col gap-0.5 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">{label}</span>
      <span className={`text-[14px] font-medium ${display ? "text-[#111]" : "text-[#ccc]"}`}>
        {display || "—"}
      </span>
    </div>
  );
}

// ─── Read-only chips field ────────────────────────────────────────────────────

function ChipsField({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-col gap-1.5 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">{label}</span>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="rounded-full bg-[#f5f5f5] px-2.5 py-0.5 text-[12px] font-medium text-[#555]"
            >
              {v}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[14px] font-medium text-[#ccc]">—</span>
      )}
    </div>
  );
}

// ─── Editable text field ──────────────────────────────────────────────────────

function EditField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none transition-colors focus:border-brand focus:bg-white"
      />
    </div>
  );
}

const PROFILE_LANGUAGES = [
  { id: "th", labelKey: "languageThai" },
  { id: "en", labelKey: "languageEnglish" },
] as const;

const PROFILE_PLATFORMS = Object.keys(PLATFORM_COLORS);

function RequiredMark() {
  return <span className="text-brand"> *</span>;
}

function ChoiceGroup({
  label,
  required,
  options,
  selected,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <div className="flex flex-col gap-1.5 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = selected.includes(option.id);
          return (
            <label
              key={option.id}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[12px] font-medium ${
                checked ? "border-brand bg-brand/10 text-brand" : "border-[#e0e0e0] text-[#555]"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => toggle(option.id)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  required,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={3}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none transition-colors focus:border-brand focus:bg-white"
      />
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#f0f0f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wider text-[#aaa]">{title}</h2>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    job: JobProfile;
  } | null>(null);

  const [apiInfluencer, setApiInfluencer] = useState<ApiInfluencer | null>(null);
  const [apiEntrepreneur, setApiEntrepreneur] =
    useState<ApiEntrepreneur | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);

  const userEmail = user?.email;
  const userRole = user?.role;

  useEffect(() => {
    if (!userEmail || !userRole) return;
    const controller = new AbortController();

    async function loadDetails() {
      setDetailLoading(true);
      setDetailError(false);
      setApiInfluencer(null);
      setApiEntrepreneur(null);
      try {
        if (userRole === "influencer") {
          const data = await fetchInfluencerByEmail(userEmail!, controller.signal);
          if (!controller.signal.aborted) setApiInfluencer(data);
        } else {
          const data = await fetchEntrepreneurByEmail(userEmail!, controller.signal);
          if (!controller.signal.aborted) setApiEntrepreneur(data);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setDetailError(true);
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    loadDetails();

    return () => controller.abort();
  }, [userEmail, userRole]);

  if (!user) return null;

  const savedJob = user.jobProfile;
  const jobDefaults: JobProfile = {
    ...emptyJobProfile(),
    ...(savedJob ?? {}),
    companyName: savedJob ? savedJob.companyName : (apiEntrepreneur?.companyName ?? ""),
    brandDescription: savedJob ? savedJob.brandDescription : (apiEntrepreneur?.brandDescription ?? ""),
    stageName: savedJob ? savedJob.stageName : (apiInfluencer?.stageName || user.name || ""),
    platforms: savedJob ? savedJob.platforms : (apiInfluencer?.platforms ?? []),
    languages: (savedJob ? savedJob.languages : (apiInfluencer?.languages ?? [])).map((item) => {
      const key = item.trim().toLowerCase();
      if (key === "th" || key === "thai" || key === "ไทย") return "th";
      if (key === "en" || key === "english" || key === "อังกฤษ") return "en";
      return item;
    }),
    categories: savedJob ? savedJob.categories : (apiInfluencer?.contentCategories ?? []),
  };

  const currentForm = form ?? {
    name:          user.name              ?? "",
    email:         user.email             ?? "",
    countryCode:   user.countryCode       ?? "+66",
    phone:         user.phone             ?? "",
    bankName:      user.paymentAccount?.bankName       ?? "",
    accountNumber: user.paymentAccount?.accountNumber  ?? "",
    accountHolder: user.paymentAccount?.accountHolder  ?? "",
    job: jobDefaults,
  };

  function handleEdit() {
    setForm(currentForm);
    setEditing(true);
  }

  function handleCancel() {
    setForm(null);
    setEditing(false);
  }

  function handleSave() {
    if (!form || !user) return;
    const updated: MockUser = {
      id:          user.id,
      role:        user.role,
      name:        form.name,
      email:       form.email,
      countryCode: form.countryCode,
      phone:       form.phone,
      paymentAccount: {
        bankName:      form.bankName,
        accountNumber: form.accountNumber,
        accountHolder: form.accountHolder,
      },
      jobProfile: form.job,
    };
    setStoredUser(updated);
    setForm(null);
    setEditing(false);
  }

  function handleSwitchRole() {
    if (!user) return;
    const updated: MockUser = {
      ...user,
      role: user.role === "influencer" ? "entrepreneur" : "influencer",
    };
    setStoredUser(updated);
  }

  const set = (key: "name" | "email" | "countryCode" | "phone" | "bankName" | "accountNumber" | "accountHolder") => (v: string) =>
    setForm((prev) => ({ ...(prev ?? currentForm), [key]: v }));

  function setJob<K extends keyof JobProfile>(key: K, value: JobProfile[K]) {
    setForm((prev) => {
      const base = prev ?? currentForm;
      return { ...base, job: { ...base.job, [key]: value } };
    });
  }

  const languageOptions = PROFILE_LANGUAGES.map((item) => ({
    id: item.id,
    label: t(`profile.${item.labelKey}`),
  }));
  const platformOptions = PROFILE_PLATFORMS.map((item) => ({ id: item, label: item }));
  const categoryOptions = INFLUENCER_CATEGORY_KEYS.map((item) => ({
    id: item,
    label: t(`categories.${item}`),
  }));
  const shownJob = editing ? currentForm.job : jobDefaults;

  const roleLabel =
    user.role === "influencer"
      ? t("profile.roleInfluencer")
      : t("profile.roleEntrepreneur");

  const displayName = editing ? currentForm.name : (user.name ?? "");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const phoneCountry = COUNTRIES.find((c) => c.code === (user.countryCode ?? "+66")) ?? COUNTRIES[0];

  const avatarImage =
    user.role === "influencer" ? apiInfluencer?.avatarUrl : apiEntrepreneur?.logoUrl;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <MainHeader />

      <main className="flex-1 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

            {/* ── Left sidebar ── */}
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-[#f0f0f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] lg:w-56 lg:shrink-0">
              <div
                className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-brand-tint bg-cover bg-center text-3xl font-black text-brand"
                style={
                  avatarImage ? { backgroundImage: `url(${avatarImage})` } : undefined
                }
              >
                {!avatarImage && initials}
              </div>

              <div className="text-center">
                <p className="text-[16px] font-black text-[#111]">
                  {editing ? (currentForm.name || "—") : (user.name || "—")}
                </p>
                <span className="mt-1 inline-flex items-center rounded-full bg-brand/10 px-3 py-0.5 text-[11px] font-semibold text-brand">
                  {roleLabel}
                </span>
              </div>

              {editing ? (
                <div className="flex w-full flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full rounded-xl bg-brand py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-hover"
                  >
                    {t("profile.save")}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full rounded-xl border border-[#e0e0e0] bg-white py-2 text-[13px] font-medium text-[#555] transition-colors hover:bg-[#f5f5f5]"
                  >
                    {t("profile.cancel")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="w-full rounded-xl border border-[#e0e0e0] bg-white py-2 text-[13px] font-medium text-[#555] transition-colors hover:bg-[#f5f5f5]"
                >
                  {t("profile.editProfile")}
                </button>
              )}

              {/* Role switcher */}
              {/* <div className="w-full border-t border-[#f0f0f0] pt-3">
                <button
                  type="button"
                  onClick={handleSwitchRole}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand/5 py-2 text-[12px] font-semibold text-brand transition-colors hover:bg-brand/10"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 5h9M7 2l3 3-3 3M13 9H4M7 12l-3-3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {user.role === "influencer"
                    ? t("profile.switchToEntrepreneur")
                    : t("profile.switchToInfluencer")}
                </button>
              </div> */}
            </div>

            {/* ── Right content ── */}
            <div className="flex flex-1 flex-col gap-4">
              {/* Contact */}
              <Section title={t("profile.sectionContact")}>
                {editing ? (
                  <>
                    <EditField label={t("profile.labelEmail")} value={currentForm.email} onChange={set("email")} type="email" />
                    <PhoneEditField
                      label={t("profile.labelPhone")}
                      countryCode={currentForm.countryCode}
                      phone={currentForm.phone}
                      onCountryChange={set("countryCode")}
                      onPhoneChange={set("phone")}
                    />
                  </>
                ) : (
                  <>
                    <Field label={t("profile.labelEmail")} value={user.email} />
                    {/* Phone with country flag + code */}
                    <div className="flex flex-col gap-0.5 py-3">
                      <span className="text-[11px] font-medium text-[#aaa]">{t("profile.labelPhone")}</span>
                      {user.phone ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] bg-[#f5f5f5] px-2.5 py-1 text-[13px] font-medium text-[#333]">
                            <span>{phoneCountry.flag}</span>
                            <span>{phoneCountry.code}</span>
                          </span>
                          <span className="text-[14px] font-medium text-[#111]">{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[14px] font-medium text-[#ccc]">—</span>
                      )}
                    </div>
                  </>
                )}
              </Section>

              {/* Payment account */}
              <Section title={t("profile.sectionPayment")}>
                {editing ? (
                  <>
                    <EditField label={t("profile.labelBank")}          value={currentForm.bankName}      onChange={set("bankName")}      />
                    <EditField label={t("profile.labelAccountNumber")} value={currentForm.accountNumber} onChange={set("accountNumber")} />
                    <EditField label={t("profile.labelAccountHolder")} value={currentForm.accountHolder} onChange={set("accountHolder")} />
                  </>
                ) : (
                  <>
                    <Field label={t("profile.labelBank")}          value={user.paymentAccount?.bankName} />
                    <Field label={t("profile.labelAccountNumber")} value={user.paymentAccount?.accountNumber} />
                    <Field label={t("profile.labelAccountHolder")} value={user.paymentAccount?.accountHolder} />
                  </>
                )}
              </Section>

              <Section title={t("profile.sectionJob")}>
                <p className="pb-2 text-[13px] text-[#888]">{t("profile.jobHint")}</p>
                {user.role === "entrepreneur" ? (
                  editing ? (
                    <>
                      <EditField label={t("profile.labelCompanyName")} required value={currentForm.job.companyName} onChange={(value) => setJob("companyName", value)} />
                      <EditField label={t("profile.labelLocation")} value={currentForm.job.location} onChange={(value) => setJob("location", value)} />
                      <TextAreaField
                        label={t("profile.labelBrandDescription")}
                        required
                        value={currentForm.job.brandDescription}
                        placeholder=""
                        onChange={(value) => setJob("brandDescription", value)}
                      />
                      <ChoiceGroup
                        label={t("profile.labelLanguages")}
                        required
                        options={languageOptions}
                        selected={currentForm.job.languages}
                        onChange={(value) => setJob("languages", value)}
                      />
                      <div className="flex flex-col gap-3 py-3">
                        <span className="text-[11px] font-medium text-[#aaa]">
                          {t("profile.labelProduct")}
                          <RequiredMark />
                        </span>
                        {currentForm.job.products.map((product, index) => (
                          <div key={index} className="rounded-xl border border-[#eee] p-3">
                          <input
                            value={product.name}
                            placeholder={t("profile.productPlaceholder")}
                            onChange={(event) => {
                              const name = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const products = base.job.products.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, name } : item
                                );
                                return { ...base, job: { ...base.job, products } };
                              });
                            }}
                              className="w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                            />
                            <textarea
                              value={product.description}
                              rows={2}
                              placeholder={t("profile.productDescriptionPlaceholder")}
                            onChange={(event) => {
                              const description = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const products = base.job.products.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, description } : item
                                );
                                return { ...base, job: { ...base.job, products } };
                              });
                            }}
                              className="mt-2 w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setJob("products", currentForm.job.products.filter((_, itemIndex) => itemIndex !== index))}
                              className="mt-2 text-[12px] font-semibold text-[#c0392b]"
                            >
                              {t("profile.removeItem")}
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setJob("products", [...currentForm.job.products, { name: "", description: "" }])}
                          className="self-start rounded-lg border border-brand px-3 py-1.5 text-[12px] font-semibold text-brand"
                        >
                          {t("profile.addProduct")}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Field label={t("profile.labelCompanyName")} value={shownJob.companyName} />
                      <Field label={t("profile.labelLocation")} value={shownJob.location} />
                      <Field label={t("profile.labelBrandDescription")} value={shownJob.brandDescription} />
                      <ChipsField
                        label={t("profile.labelLanguages")}
                        values={shownJob.languages.map((item) => languageOptions.find((option) => option.id === item)?.label ?? item)}
                      />
                      <div className="flex flex-col gap-2 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
                        <span className="text-[11px] font-medium text-[#aaa]">{t("profile.labelProduct")}</span>
                        {shownJob.products.length === 0 ? (
                          <span className="text-[14px] font-medium text-[#ccc]">—</span>
                        ) : (
                          shownJob.products.map((product) => (
                            <div key={`${product.name}-${product.description}`}>
                              <p className="text-[14px] font-medium text-[#111]">{product.name || "—"}</p>
                              {product.description ? (
                                <p className="text-[13px] text-[#666]">{product.description}</p>
                              ) : null}
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )
                ) : editing ? (
                  <>
                    <EditField label={t("profile.labelStageName")} required value={currentForm.job.stageName} onChange={(value) => setJob("stageName", value)} />
                    <ChoiceGroup
                      label={t("profile.labelPlatforms")}
                      required
                      options={platformOptions}
                      selected={currentForm.job.platforms}
                      onChange={(value) => setJob("platforms", value)}
                    />
                    <ChoiceGroup
                      label={t("profile.labelLanguages")}
                      required
                      options={languageOptions}
                      selected={currentForm.job.languages}
                      onChange={(value) => setJob("languages", value)}
                    />
                    <ChoiceGroup
                      label={t("profile.labelCategories")}
                      options={categoryOptions}
                      selected={currentForm.job.categories}
                      onChange={(value) => setJob("categories", value)}
                    />
                    <div className="flex flex-col gap-3 py-3">
                      <span className="text-[11px] font-medium text-[#aaa]">
                        {t("profile.labelPackage")}
                        <RequiredMark />
                      </span>
                      {currentForm.job.packages.map((item, index) => (
                        <div key={index} className="rounded-xl border border-[#eee] p-3">
                          <input
                            value={item.name}
                            placeholder={t("profile.packageNamePlaceholder")}
                            onChange={(event) => {
                              const name = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const packages = base.job.packages.map((pkg, itemIndex) =>
                                  itemIndex === index ? { ...pkg, name } : pkg
                                );
                                return { ...base, job: { ...base.job, packages } };
                              });
                            }}
                            className="w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                          />
                          <input
                            value={item.price}
                            inputMode="decimal"
                            placeholder={t("profile.labelPackagePrice")}
                            onChange={(event) => {
                              const price = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const packages = base.job.packages.map((pkg, itemIndex) =>
                                  itemIndex === index ? { ...pkg, price } : pkg
                                );
                                return { ...base, job: { ...base.job, packages } };
                              });
                            }}
                            className="mt-2 w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                          />
                          <textarea
                            value={item.detail}
                            rows={2}
                            placeholder={t("profile.packageDetailPlaceholder")}
                            onChange={(event) => {
                              const detail = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const packages = base.job.packages.map((pkg, itemIndex) =>
                                  itemIndex === index ? { ...pkg, detail } : pkg
                                );
                                return { ...base, job: { ...base.job, packages } };
                              });
                            }}
                            className="mt-2 w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                          />
                          <div className="mt-2">
                            <ChoiceGroup
                              label={t("profile.labelPlatforms")}
                              options={platformOptions}
                              selected={item.platform ? [item.platform] : []}
                              onChange={(value) => {
                                const platform = value.find((entry) => entry !== item.platform) ?? "";
                                setForm((prev) => {
                                  const base = prev ?? currentForm;
                                  const packages = base.job.packages.map((pkg, itemIndex) =>
                                    itemIndex === index ? { ...pkg, platform } : pkg
                                  );
                                  return { ...base, job: { ...base.job, packages } };
                                });
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setJob("packages", currentForm.job.packages.filter((_, itemIndex) => itemIndex !== index))}
                            className="text-[12px] font-semibold text-[#c0392b]"
                          >
                            {t("profile.removeItem")}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setJob("packages", [
                            ...currentForm.job.packages,
                            { name: "", price: "", detail: "", platform: "" },
                          ])
                        }
                        className="self-start rounded-lg border border-brand px-3 py-1.5 text-[12px] font-semibold text-brand"
                      >
                        {t("profile.addPackage")}
                      </button>
                    </div>
                    <div className="flex flex-col gap-3 py-3">
                      <span className="text-[11px] font-medium text-[#aaa]">{t("profile.labelAddon")}</span>
                      {currentForm.job.addons.map((item, index) => (
                        <div key={index} className="rounded-xl border border-[#eee] p-3">
                          <input
                            value={item.name}
                            placeholder={t("profile.addonNamePlaceholder")}
                            onChange={(event) => {
                              const name = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const addons = base.job.addons.map((addon, itemIndex) =>
                                  itemIndex === index ? { ...addon, name } : addon
                                );
                                return { ...base, job: { ...base.job, addons } };
                              });
                            }}
                            className="w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                          />
                          <input
                            value={item.price}
                            inputMode="decimal"
                            placeholder={t("profile.labelPackagePrice")}
                            onChange={(event) => {
                              const price = event.target.value;
                              setForm((prev) => {
                                const base = prev ?? currentForm;
                                const addons = base.job.addons.map((addon, itemIndex) =>
                                  itemIndex === index ? { ...addon, price } : addon
                                );
                                return { ...base, job: { ...base.job, addons } };
                              });
                            }}
                            className="mt-2 w-full rounded-lg border border-[#e0e0e0] bg-surface px-3 py-2 text-[14px] font-medium text-[#111] outline-none focus:border-brand focus:bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setJob("addons", currentForm.job.addons.filter((_, itemIndex) => itemIndex !== index))}
                            className="mt-2 text-[12px] font-semibold text-[#c0392b]"
                          >
                            {t("profile.removeItem")}
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setJob("addons", [...currentForm.job.addons, { name: "", price: "" }])}
                        className="self-start rounded-lg border border-brand px-3 py-1.5 text-[12px] font-semibold text-brand"
                      >
                        {t("profile.addAddon")}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Field label={t("profile.labelStageName")} value={shownJob.stageName} />
                    <ChipsField label={t("profile.labelPlatforms")} values={shownJob.platforms} />
                    <ChipsField
                      label={t("profile.labelLanguages")}
                      values={shownJob.languages.map((item) => languageOptions.find((option) => option.id === item)?.label ?? item)}
                    />
                    <ChipsField
                      label={t("profile.labelCategories")}
                      values={shownJob.categories.map((item) => categoryOptions.find((option) => option.id === item)?.label ?? item)}
                    />
                    <div className="flex flex-col gap-2 py-3">
                      <span className="text-[11px] font-medium text-[#aaa]">{t("profile.labelPackage")}</span>
                      {shownJob.packages.length === 0 ? (
                        <span className="text-[14px] font-medium text-[#ccc]">—</span>
                      ) : (
                        shownJob.packages.map((item) => (
                          <div key={`${item.name}-${item.price}`}>
                            <p className="text-[14px] font-medium text-[#111]">
                              {item.name || "—"}
                              {item.price ? ` · ฿${item.price}` : ""}
                              {item.platform ? ` · ${item.platform}` : ""}
                            </p>
                            {item.detail ? <p className="text-[13px] text-[#666]">{item.detail}</p> : null}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex flex-col gap-2 py-3">
                      <span className="text-[11px] font-medium text-[#aaa]">{t("profile.labelAddon")}</span>
                      {shownJob.addons.length === 0 ? (
                        <span className="text-[14px] font-medium text-[#ccc]">—</span>
                      ) : (
                        shownJob.addons.map((item) => (
                          <p key={`${item.name}-${item.price}`} className="text-[14px] font-medium text-[#111]">
                            {item.name || "—"}
                            {item.price ? ` · ฿${item.price}` : ""}
                          </p>
                        ))
                      )}
                    </div>
                  </>
                )}
              </Section>

              {/* Extra details from the marketplace API (read-only) */}
              {user.role === "influencer" ? (
                <Section title={t("profile.sectionCreator")}>
                  {detailLoading ? (
                    <p className="py-3 text-[13px] text-[#888]">{t("profile.detailLoading")}</p>
                  ) : detailError ? (
                    <p className="py-3 text-[13px] text-[#c0392b]">{t("profile.detailError")}</p>
                  ) : !apiInfluencer ? (
                    <p className="py-3 text-[13px] text-[#888]">{t("profile.detailEmpty")}</p>
                  ) : (
                    <>
                      <Field label={t("profile.labelFirstName")} value={apiInfluencer.firstName} />
                      <Field label={t("profile.labelLastName")} value={apiInfluencer.lastName} />
                      <Field
                        label={t("profile.labelAge")}
                        value={apiInfluencer.age != null ? String(apiInfluencer.age) : undefined}
                      />
                      <Field
                        label={t("profile.labelRating")}
                        value={t("profile.ratingValue", {
                          rating: Number(apiInfluencer.averageRating ?? 0).toFixed(1),
                          count: apiInfluencer.reviewCount ?? 0,
                        })}
                      />
                      {(apiInfluencer.otherPhotos?.length ?? 0) > 0 && (
                        <div className="flex flex-col gap-1.5 py-3">
                          <span className="text-[11px] font-medium text-[#aaa]">
                            {t("profile.labelOtherPhotos")}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {apiInfluencer.otherPhotos!.map((src) => (
                              <span
                                key={src}
                                className="h-16 w-16 rounded-lg border border-[#eee] bg-cover bg-center"
                                style={{ backgroundImage: `url(${src})` }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </Section>
              ) : null}
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
