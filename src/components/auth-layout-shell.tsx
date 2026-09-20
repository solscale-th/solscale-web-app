"use client";

import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import LanguageSwitcher from "./language-switcher";

export default function AuthLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-surface-auth">
      <header className="flex w-full items-center justify-between px-4 sm:px-10 py-4 sm:py-5">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-black text-brand-mark">
            ⬢
          </div>
          <span className="text-[20px] sm:text-[22px] font-black tracking-tight text-[#111]">
            Solscale
          </span>
        </Link>
        <LanguageSwitcher variant="dark" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        {children}
      </main>

      <footer className="py-5 text-center text-sm text-[#999]">
        © 2026 Solscale ·{" "}
        <Link href="#" className="hover:underline">
          {t("common.privacy")}
        </Link>
        {" · "}
        <Link href="#" className="hover:underline">
          {t("common.terms")}
        </Link>
      </footer>
    </div>
  );
}
