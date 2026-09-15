import { isDesignId, type DesignId } from "@/components/logo-marks";

export type LogoChoice = "current" | DesignId;

export const LOGO_PREVIEW_KEY = "solscale_logo_preview";
export const LOGO_PREVIEW_EVENT = "solscale-logo-preview";

export function parseLogoChoice(value: string | null | undefined): LogoChoice {
  if (value === "current" || (value && isDesignId(value))) return value;
  return "current";
}

export function getLogoChoice(): LogoChoice {
  if (typeof window === "undefined") return "current";
  return parseLogoChoice(localStorage.getItem(LOGO_PREVIEW_KEY));
}

export function setLogoChoice(choice: LogoChoice): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOGO_PREVIEW_KEY, choice);
  window.dispatchEvent(new Event(LOGO_PREVIEW_EVENT));
}
