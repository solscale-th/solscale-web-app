"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  defaultLocale,
  LOCALE_STORAGE_KEY,
  translate,
  translations,
  type Locale,
  type TranslationDictionary,
} from "./index";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dictionary: TranslationDictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Same-tab locale changes: native "storage" events only fire in *other* tabs,
// so setLocale dispatches this to notify this tab's own subscribers too.
const LOCALE_CHANGE_EVENT = "solscale-locale-change";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "th" ? stored : defaultLocale;
}

function subscribeToLocale(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_CHANGE_EVENT, callback);
  };
}

function getServerLocale(): Locale {
  return defaultLocale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // useSyncExternalStore renders defaultLocale on the server and during the
  // first client pass (matching, so no hydration mismatch), then re-reads
  // localStorage right after hydration — no effect/setState needed for this.
  const locale = useSyncExternalStore(
    subscribeToLocale,
    readStoredLocale,
    getServerLocale
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dictionary: translations[locale] as TranslationDictionary,
    }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
