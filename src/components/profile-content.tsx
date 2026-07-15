"use client";

import { useEffect, useState } from "react";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { setStoredUser } from "@/lib/auth";
import { fetchEntrepreneurByEmail, type ApiEntrepreneur } from "@/lib/entrepreneurs";
import { fetchInfluencerByEmail, type ApiInfluencer } from "@/lib/influencers";
import type { MockUser } from "@/lib/mock-users";

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
        className="flex h-full items-center gap-1.5 rounded-l-lg border border-[#e0e0e0] bg-[#fafafa] px-3 py-2 text-[14px] font-medium text-[#333] transition-colors hover:bg-[#f0f0f0] focus:outline-none"
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
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-[#fafafa] ${value === c.code ? "font-semibold text-[#9d003b]" : "text-[#333]"}`}
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
          className="min-w-0 flex-1 rounded-r-lg border border-l-0 border-[#e0e0e0] bg-[#fafafa] px-3 py-2 text-[14px] font-medium text-[#111] outline-none transition-colors focus:border-[#9d003b] focus:bg-white"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-[#f5f5f5]">
      <span className="text-[11px] font-medium text-[#aaa]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[#e0e0e0] bg-[#fafafa] px-3 py-2 text-[14px] font-medium text-[#111] outline-none transition-colors focus:border-[#9d003b] focus:bg-white"
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

  const currentForm = form ?? {
    name:          user.name              ?? "",
    email:         user.email             ?? "",
    countryCode:   user.countryCode       ?? "+66",
    phone:         user.phone             ?? "",
    bankName:      user.paymentAccount?.bankName       ?? "",
    accountNumber: user.paymentAccount?.accountNumber  ?? "",
    accountHolder: user.paymentAccount?.accountHolder  ?? "",
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
      password:    user.password,
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
    };
    setStoredUser(updated);
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

  const set = (key: keyof typeof currentForm) => (v: string) =>
    setForm((prev) => ({ ...(prev ?? currentForm), [key]: v }));

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
    <div className="flex min-h-screen flex-col bg-[#f5f5f3]">
      <MainHeader />

      <main className="flex-1 px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">

            {/* ── Left sidebar ── */}
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-[#f0f0f0] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] lg:w-56 lg:shrink-0">
              <div
                className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-[#fce8ee] bg-cover bg-center text-3xl font-black text-[#9d003b]"
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
                <span className="mt-1 inline-flex items-center rounded-full bg-[#9d003b]/10 px-3 py-0.5 text-[11px] font-semibold text-[#9d003b]">
                  {roleLabel}
                </span>
              </div>

              {editing ? (
                <div className="flex w-full flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="w-full rounded-xl bg-[#9d003b] py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#850030]"
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
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#9d003b]/40 bg-[#9d003b]/5 py-2 text-[12px] font-semibold text-[#9d003b] transition-colors hover:bg-[#9d003b]/10"
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
                      <Field label={t("profile.labelStageName")} value={apiInfluencer.stageName} />
                      <Field label={t("profile.labelFirstName")} value={apiInfluencer.firstName} />
                      <Field label={t("profile.labelLastName")} value={apiInfluencer.lastName} />
                      <Field
                        label={t("profile.labelAge")}
                        value={apiInfluencer.age != null ? String(apiInfluencer.age) : undefined}
                      />
                      <ChipsField label={t("profile.labelPlatforms")} values={apiInfluencer.platforms ?? []} />
                      <ChipsField label={t("profile.labelCategories")} values={apiInfluencer.contentCategories ?? []} />
                      <ChipsField label={t("profile.labelLanguages")} values={apiInfluencer.languages ?? []} />
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
              ) : (
                <Section title={t("profile.sectionBusiness")}>
                  {detailLoading ? (
                    <p className="py-3 text-[13px] text-[#888]">{t("profile.detailLoading")}</p>
                  ) : detailError ? (
                    <p className="py-3 text-[13px] text-[#c0392b]">{t("profile.detailError")}</p>
                  ) : !apiEntrepreneur ? (
                    <p className="py-3 text-[13px] text-[#888]">{t("profile.detailEmpty")}</p>
                  ) : (
                    <>
                      <Field label={t("profile.labelCompanyName")} value={apiEntrepreneur.companyName} />
                      <Field label={t("profile.labelBrandDescription")} value={apiEntrepreneur.brandDescription} />
                    </>
                  )}
                </Section>
              )}
            </div>

          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
