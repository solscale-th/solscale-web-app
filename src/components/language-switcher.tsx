"use client";

import { useLanguage } from "@/i18n/language-provider";
import type { Locale } from "@/i18n";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export default function LanguageSwitcher({
  variant = "light",
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  const isLight = variant === "light";

  return (
    <div
      className={`flex items-center rounded-lg p-0.5 text-xs font-semibold ${
        isLight
          ? "border border-white/20 bg-white/10"
          : "border border-[#ddd] bg-white"
      }`}
      role="group"
      aria-label="Language"
    >
      {(["en", "th"] as Locale[]).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={`rounded-md px-2.5 py-1 transition-colors ${
              active
                ? isLight
                  ? "bg-white text-brand-header"
                  : "bg-brand text-white"
                : isLight
                  ? "text-white/80 hover:text-white"
                  : "text-[#666] hover:text-[#333]"
            }`}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
