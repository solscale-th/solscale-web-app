"use client";

import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useLanguage } from "@/i18n/language-provider";
import { useLogoPreview } from "@/hooks/use-logo-preview";
import {
  CurrentLockup,
  CurrentMark,
  DESIGN_THEME,
  HERO_BG,
  LOGO_SURFACES,
  LogoLockup,
  LogoMark,
  type LogoColors,
  type LogoSize,
} from "@/components/logo-marks";
import type { LogoChoice } from "@/lib/logo-preview";

const INDEX: { id: LogoChoice; number: string }[] = [
  { id: "current", number: "00" },
  { id: "clasp", number: "01" },
  { id: "twin", number: "02" },
  { id: "course", number: "03" },
  { id: "gilt", number: "04" },
  { id: "pair", number: "05" },
  { id: "grip", number: "06" },
  { id: "sigil", number: "07" },
  { id: "solrise", number: "08" },
  { id: "dawn", number: "09" },
  { id: "match", number: "10" },
];

function SurfaceBoard({
  bg,
  label,
  tall = false,
  children,
}: {
  bg: string;
  label: string;
  tall?: boolean;
  children: React.ReactNode;
}) {
  return (
    <figure className="min-w-0">
      <div
        className={`grid place-items-center overflow-hidden rounded-2xl px-4 ${
          tall ? "min-h-[260px] sm:min-h-[320px]" : "min-h-[140px]"
        }`}
        style={{
          backgroundColor: bg,
          backgroundImage: tall
            ? "radial-gradient(rgba(23,17,23,0.08) 0.7px, transparent 0.7px)"
            : undefined,
          backgroundSize: tall ? "14px 14px" : undefined,
        }}
      >
        {children}
      </div>
      <figcaption className="mt-2 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-[#8a8490]">
        {label}
      </figcaption>
    </figure>
  );
}

function HeaderBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 w-full max-w-md items-center rounded-xl bg-[#8f0035] px-4 shadow-[0_8px_24px_rgba(143,0,53,0.22)]">
      {children}
    </div>
  );
}

function PreviewLockup({
  choice,
  size,
  colors,
}: {
  choice: LogoChoice;
  size: LogoSize;
  colors: LogoColors;
}) {
  if (choice === "current") {
    return <CurrentLockup size={size} colors={colors} />;
  }
  return <LogoLockup id={choice} size={size} colors={colors} />;
}

function PreviewMark({
  choice,
  size,
  colors,
}: {
  choice: LogoChoice;
  size: number;
  colors: LogoColors;
}) {
  if (choice === "current") {
    return <CurrentMark size={size} />;
  }
  return <LogoMark id={choice} size={size} colors={colors} />;
}

function DesignSection({ id }: { id: LogoChoice }) {
  const { t } = useLanguage();
  const intended =
    id === "current"
      ? ({ primary: "#840031", accent: "#d7ff2f", text: "#171117" } as LogoColors)
      : DESIGN_THEME[id];
  const brand = LOGO_SURFACES.brand.colors as LogoColors;
  const dark = LOGO_SURFACES.dark.colors as LogoColors;
  const lime = LOGO_SURFACES.lime.colors as LogoColors;
  const hero = id === "current" ? "#faf8f6" : HERO_BG[id];
  const number = INDEX.find((item) => item.id === id)?.number ?? "";

  return (
    <section className="rounded-[28px] border border-[#ece7e1] bg-white p-5 shadow-[0_1px_2px_rgba(40,20,10,0.04)] sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[#9d003b]">
            {number}
          </p>
          <h2
            className="mt-1.5 text-[32px] font-medium tracking-tight text-[#171117] sm:text-[38px]"
            style={{
              fontFamily: "var(--font-display), var(--font-display-thai), serif",
            }}
          >
            {t(`logoPage.${id}.name`)}
          </h2>
          <span className="mt-3 inline-flex rounded-full border border-[#ead9c8] bg-[#fff8ef] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[#9d003b]">
            {t(`logoPage.${id}.style`)}
          </span>
        </div>
        <div
          className="grid h-20 w-20 place-items-center rounded-2xl ring-1 ring-[#ece7e1]"
          style={{ background: hero }}
        >
          <PreviewMark choice={id} size={48} colors={intended} />
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SurfaceBoard bg={hero} label={t("logoPage.wordmark")} tall>
          <PreviewLockup choice={id} size="lg" colors={intended} />
        </SurfaceBoard>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <SurfaceBoard bg="#8f0035" label={t("logoPage.onBrand")}>
            <PreviewLockup choice={id} size="md" colors={brand} />
          </SurfaceBoard>
          <SurfaceBoard bg="#121417" label={t("logoPage.onDark")}>
            <PreviewLockup
              choice={id}
              size="md"
              colors={
                id === "sigil"
                  ? { ...intended, text: "#ffffff" }
                  : dark
              }
            />
          </SurfaceBoard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <SurfaceBoard bg="#d7ff2f" label={t("logoPage.onLime")}>
          <PreviewLockup choice={id} size="sm" colors={lime} />
        </SurfaceBoard>
        <SurfaceBoard bg="#f4f1f7" label={t("logoPage.icon")}>
          <div className="flex items-center gap-4">
            <PreviewMark choice={id} size={48} colors={intended} />
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#8f0035]">
              <PreviewMark choice={id} size={32} colors={brand} />
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#121417]">
              <PreviewMark choice={id} size={26} colors={dark} />
            </div>
          </div>
        </SurfaceBoard>
        <SurfaceBoard bg="#eeebe3" label={t("logoPage.header")}>
          <HeaderBar>
            <PreviewLockup choice={id} size="sm" colors={brand} />
          </HeaderBar>
        </SurfaceBoard>
      </div>
    </section>
  );
}

function SidebarButton({
  id,
  number,
  active,
  onSelect,
}: {
  id: LogoChoice;
  number: string;
  active: boolean;
  onSelect: (id: LogoChoice) => void;
}) {
  const { t } = useLanguage();
  const colors =
    id === "current"
      ? ({ primary: "#840031", accent: "#d7ff2f", text: "#171117" } as LogoColors)
      : DESIGN_THEME[id];
  const hero = id === "current" ? "#faf8f6" : HERO_BG[id];

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-current={active ? "true" : undefined}
      className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors ${
        active
          ? "bg-[#fff8ef] ring-1 ring-[#9d003b]/25"
          : "hover:bg-[#f7f4ef]"
      }`}
    >
      <div
        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 ring-[#ece7e1]"
        style={{ background: hero }}
      >
        <PreviewMark choice={id} size={28} colors={colors} />
      </div>
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a8490]">
          {number}
        </span>
        <span
          className={`block truncate text-[13px] font-medium ${
            active ? "text-[#9d003b]" : "text-[#171117]"
          }`}
        >
          {t(`logoPage.${id}.name`)}
        </span>
      </span>
    </button>
  );
}

export default function LogoGalleryContent() {
  const { t } = useLanguage();
  const { choice, setChoice } = useLogoPreview();

  return (
    <div className="flex min-h-screen flex-col bg-[#faf8f6]">
      <MainHeader />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:flex-row">
        <aside className="border-b border-[#ece7e1] bg-white lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">
            <div className="px-4 pb-3 pt-6 sm:px-5">
              <p className="hero-kicker">{t("logoPage.kicker")}</p>
              <h1
                className="mt-2 text-[22px] font-medium tracking-tight text-[#171117]"
                style={{
                  fontFamily: "var(--font-display), var(--font-display-thai), serif",
                }}
              >
                {t("logoPage.title")}
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6a646c]">
                {t("logoPage.subtitle")}
              </p>
            </div>
            <nav
              aria-label={t("logoPage.sidebar")}
              className="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-8"
            >
              {INDEX.map((item) => (
                <div key={item.id} className="min-w-[180px] lg:min-w-0">
                  <SidebarButton
                    id={item.id}
                    number={item.number}
                    active={choice === item.id}
                    onSelect={setChoice}
                  />
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">
          <DesignSection id={choice} />
        </main>
      </div>

      <SiteFooter />
    </div>
  );
}
