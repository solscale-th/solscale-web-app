"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getLogoChoice,
  LOGO_PREVIEW_EVENT,
  setLogoChoice,
  type LogoChoice,
} from "@/lib/logo-preview";

function subscribe(callback: () => void) {
  window.addEventListener(LOGO_PREVIEW_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOGO_PREVIEW_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerChoice(): LogoChoice {
  return "current";
}

export function useLogoPreview() {
  const choice = useSyncExternalStore(subscribe, getLogoChoice, getServerChoice);
  const setChoice = useCallback((next: LogoChoice) => {
    setLogoChoice(next);
  }, []);

  return { choice, setChoice };
}
