"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import SiteLogo from "./site-logo";

export default function SiteFooter() {
  const { t } = useLanguage();

  const links = [
    { label: t("footer.aboutUs"), href: "#" },
    { label: t("footer.howItWorks"), href: "#" },
    { label: t("footer.pricing"), href: "#" },
    { label: t("footer.privacyPolicy"), href: "#" },
    { label: t("footer.termsOfService"), href: "#" },
    { label: t("footer.contact"), href: "#" },
  ];

  return (
    <footer className="border-t border-black/5 bg-paper px-4 py-8 text-[#8d8d8d] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="shrink-0">
          <SiteLogo size="sm" />
        </Link>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-ink-strong"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <p className="shrink-0 text-sm">{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
