"use client";

import { useLanguage } from "@/i18n/language-provider";
import { useLogoPreview } from "@/hooks/use-logo-preview";
import { LOGO_SURFACES, LogoLockup, type LogoColors } from "@/components/logo-marks";

export default function SiteFooter() {
  const { t } = useLanguage();
  const { choice } = useLogoPreview();
  const dark = LOGO_SURFACES.dark.colors as LogoColors;

  const links = [
    { label: t("footer.aboutUs"), href: "#" },
    { label: t("footer.howItWorks"), href: "#" },
    { label: t("footer.pricing"), href: "#" },
    { label: t("footer.privacyPolicy"), href: "#" },
    { label: t("footer.termsOfService"), href: "#" },
    { label: t("footer.contact"), href: "#" },
  ];

  return (
    <footer className="bg-[#121417] px-4 sm:px-8 py-8 text-[#8d8d8d]">
      <div className="mx-auto max-w-7xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {choice === "current" ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="grid h-6 w-6 place-items-center rounded-md bg-[#d7ff2f] text-[10px] text-[#840031]">
              ⬢
            </div>
            <span className="text-[15px] font-semibold text-white">Solscale</span>
          </div>
        ) : (
          <LogoLockup id={choice} size="sm" colors={dark} />
        )}

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="text-sm shrink-0">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
