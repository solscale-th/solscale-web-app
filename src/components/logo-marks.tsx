"use client";

import { useId, type ReactNode } from "react";

export type LogoColors = {
  primary: string;
  accent: string;
  text: string;
  spark?: string;
};

export type LogoSize = "sm" | "md" | "lg";

export type DesignId =
  | "clasp"
  | "twin"
  | "course"
  | "gilt"
  | "pair"
  | "grip"
  | "sigil"
  | "solrise"
  | "dawn";

type LockupLayout = "right" | "left" | "stacked" | "end" | "top";

type MarkProps = {
  size?: number;
  primary?: string;
  accent?: string;
  spark?: string;
  className?: string;
};

const LIGHT: LogoColors = {
  primary: "#840031",
  accent: "#d7ff2f",
  text: "#171117",
};

const LOCKUP = {
  sm: { mark: 28, text: "text-[12px] leading-none", gap: "gap-2" },
  md: { mark: 48, text: "text-[20px] leading-none", gap: "gap-3" },
  lg: { mark: 80, text: "text-[30px] leading-none", gap: "gap-4" },
} as const;

export const LOGO_SURFACES = {
  light: { bg: "#faf8f6", colors: LIGHT },
  brand: {
    bg: "#8f0035",
    colors: { primary: "#d7ff2f", accent: "#ffffff", text: "#ffffff" },
  },
  dark: {
    bg: "#121417",
    colors: { primary: "#d7ff2f", accent: "#ffffff", text: "#ffffff" },
  },
  lime: {
    bg: "#d7ff2f",
    colors: { primary: "#840031", accent: "#171117", text: "#840031" },
  },
} as const;

export const DESIGN_THEME: Record<DesignId, LogoColors> = {
  clasp: { primary: "#840031", accent: "#d7ff2f", text: "#171117" },
  twin: { primary: "#6e0029", accent: "#d7ff2f", text: "#6e0029" },
  course: { primary: "#840031", accent: "#d7ff2f", text: "#840031" },
  gilt: {
    primary: "#c9ae7c",
    accent: "#1a1612",
    spark: "#e8d5a8",
    text: "#c9ae7c",
  },
  pair: { primary: "#840031", accent: "#d7ff2f", text: "#840031" },
  grip: { primary: "#840031", accent: "#d7ff2f", text: "#171117" },
  sigil: {
    primary: "#840031",
    accent: "#d7ff2f",
    spark: "#ff4d8d",
    text: "#171117",
  },
  solrise: { primary: "#840031", accent: "#e8940f", text: "#171117" },
  dawn: { primary: "#840031", accent: "#e8940f", text: "#171117" },
};

export const HERO_BG: Record<DesignId, string> = {
  clasp: "#faf8f6",
  twin: "#f4efe6",
  course: "#ffffff",
  gilt: "#14110f",
  pair: "#fbf7f2",
  grip: "#f3f6ef",
  sigil: "#f6f3ff",
  solrise: "#fff6e4",
  dawn: "#fff1d6",
};

const LAYOUT: Record<DesignId, LockupLayout> = {
  clasp: "right",
  twin: "right",
  course: "stacked",
  gilt: "stacked",
  pair: "stacked",
  grip: "right",
  sigil: "right",
  solrise: "stacked",
  dawn: "stacked",
};

export function CurrentMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-lg bg-[#d7ff2f] font-black text-[#840031] ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      ⬢
    </div>
  );
}

export function CurrentLockup({
  size = "md",
  colors,
}: {
  size?: LogoSize;
  colors?: LogoColors;
}) {
  const spec = LOCKUP[size];
  return (
    <span className={`inline-flex items-center ${spec.gap}`}>
      <CurrentMark size={spec.mark} />
      <span
        className={`${spec.text} font-black tracking-tight`}
        style={{ color: colors?.text ?? LIGHT.text }}
      >
        Solscale
      </span>
    </span>
  );
}

export function ClaspMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  const rawId = useId();
  const clipId = `clasp-${rawId.replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="25" cy="25" r="16.5" />
        </clipPath>
      </defs>
      <circle cx="25" cy="25" r="16.5" fill={primary} />
      <circle cx="39" cy="39" r="16.5" fill={primary} />
      <circle cx="39" cy="39" r="16.5" fill={accent} clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export function TwinMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M26 14A18 18 0 0 0 26 50"
        stroke={primary}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M38 14A18 18 0 0 1 38 50"
        stroke={primary}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="32" cy="32" r="5.2" fill={accent} />
    </svg>
  );
}

export function CourseMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 42A22 22 0 1 1 46 16"
        stroke={primary}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="46" cy="16" r="5.8" fill={accent} />
    </svg>
  );
}

export function GiltMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <path d="M32 5L55 18.5V45.5L32 59L9 45.5V18.5Z" fill={primary} />
      <path d="M32 16L45 23.5V40.5L32 48L19 40.5V23.5Z" fill={accent} />
    </svg>
  );
}

export function PairMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect x="6" y="20" width="34" height="34" rx="9" fill={primary} />
      <rect x="24" y="8" width="34" height="34" rx="9" fill={accent} />
    </svg>
  );
}

export function GripMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <g transform="rotate(-18 32 32)">
        <rect x="4" y="15" width="16" height="34" rx="8" fill={primary} />
        <rect x="44" y="15" width="16" height="34" rx="8" fill={accent} />
        <rect x="12" y="17" width="40" height="7.2" rx="3.6" fill={primary} />
        <rect x="12" y="28.4" width="40" height="7.2" rx="3.6" fill={accent} />
        <rect x="12" y="39.8" width="40" height="7.2" rx="3.6" fill={primary} />
        <path
          d="M16 48c2 8 12 10 18 4"
          stroke={primary}
          strokeWidth="6.2"
          strokeLinecap="round"
        />
        <path
          d="M48 48c-2 8-12 10-18 4"
          stroke={accent}
          strokeWidth="6.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function SigilMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  spark,
  className,
}: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const flare = spark ?? accent;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`sigil-body-${uid}`} x1="0.12" y1="0" x2="0.92" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="38%" stopColor={flare} />
          <stop offset="100%" stopColor={primary} />
        </linearGradient>
        <linearGradient id={`sigil-edge-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <path
        d="M18 54c2 4 10 6 18 4"
        stroke={flare}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M14 10c8-4 22-3 28 4"
        stroke={accent}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />

      <path
        d="M47 14.5C39.5 8 18 10 16.5 23.5C15 36.5 46 35 47.5 47C49 59 26 63 14 54.5"
        stroke={`url(#sigil-body-${uid})`}
        strokeWidth="9.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M45.5 16C39 11 21 12.5 19.5 24C18.2 35 44.5 35.5 46 47C47.2 56.5 29 59.5 18 53"
        stroke={`url(#sigil-edge-${uid})`}
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.85"
      />

      <circle cx="47.2" cy="14.2" r="3.1" fill={accent} />
      <circle cx="14.2" cy="54.4" r="2.5" fill={primary} />
      <path
        d="M47.2 9.2V6.4M51.4 14.2H54.2M43 14.2H40.2M47.2 19.2V16.8"
        stroke={accent}
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SolriseMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="46" cy="16" r="13" fill={accent} fillOpacity="0.28" />
      <circle cx="46" cy="16" r="8.2" fill={accent} />
      <path
        d="M46 5.5V8.4M55.4 16H52.5M52.6 8.8L50.6 10.8M52.6 23.2L50.6 21.2"
        stroke={accent}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 54H22V42H34V30H44V20"
        stroke={primary}
        strokeWidth="6.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <circle cx="44" cy="20" r="3.2" fill={primary} />
    </svg>
  );
}

export function DawnMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  className,
}: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const clipId = `dawn-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="4" width="64" height="37" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle
          cx="32"
          cy="41"
          r="26"
          fill="none"
          stroke={primary}
          strokeWidth="2.3"
          opacity="0.35"
        />
        <circle
          cx="32"
          cy="41"
          r="19.5"
          fill="none"
          stroke={primary}
          strokeWidth="2.5"
          opacity="0.7"
        />
        <circle cx="32" cy="41" r="12.5" fill={accent} />
      </g>
      <path
        d="M7 41H57"
        stroke={primary}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoMark({
  id,
  size = 40,
  colors = LIGHT,
  className,
}: {
  id: DesignId;
  size?: number;
  colors?: LogoColors;
  className?: string;
}) {
  const props: MarkProps = {
    size,
    primary: colors.primary,
    accent: colors.accent,
    spark: colors.spark ?? colors.accent,
    className,
  };

  switch (id) {
    case "clasp":
      return <ClaspMark {...props} />;
    case "twin":
      return <TwinMark {...props} />;
    case "course":
      return <CourseMark {...props} />;
    case "gilt":
      return <GiltMark {...props} />;
    case "pair":
      return <PairMark {...props} />;
    case "grip":
      return <GripMark {...props} />;
    case "sigil":
      return <SigilMark {...props} />;
    case "solrise":
      return <SolriseMark {...props} />;
    case "dawn":
      return <DawnMark {...props} />;
  }
}

function Wordmark({
  id,
  size,
  colors,
}: {
  id: DesignId;
  size: LogoSize;
  colors: LogoColors;
}) {
  const type = LOCKUP[size].text;

  if (id === "twin") {
    return (
      <span
        className={`${type} font-medium uppercase tracking-[0.2em]`}
        style={{ color: colors.text }}
      >
        SOLSCALE
      </span>
    );
  }

  if (id === "course") {
    return (
      <span
        className={`${type} font-black uppercase tracking-[-0.04em]`}
        style={{ color: colors.text }}
      >
        SOLSCALE
      </span>
    );
  }

  if (id === "gilt") {
    return (
      <span
        className={`${type} font-medium uppercase tracking-[0.4em]`}
        style={{ color: colors.text }}
      >
        SOLSCALE
      </span>
    );
  }

  return (
    <span
      className={`${type} font-medium uppercase tracking-[0.28em]`}
      style={{ color: colors.text }}
    >
      SOLSCALE
    </span>
  );
}

export function LogoLockup({
  id,
  size = "md",
  colors = LIGHT,
  layout,
}: {
  id: DesignId;
  size?: LogoSize;
  colors?: LogoColors;
  layout?: LockupLayout;
}) {
  const spec = LOCKUP[size];
  const resolved: LockupLayout =
    layout ?? (size === "sm" && LAYOUT[id] === "stacked" ? "right" : LAYOUT[id]);
  const wordmark: ReactNode = <Wordmark id={id} size={size} colors={colors} />;
  const mark = <LogoMark id={id} size={spec.mark} colors={colors} />;

  if (resolved === "top") {
    return (
      <span className="inline-flex flex-col items-center gap-2.5">
        {wordmark}
        {mark}
      </span>
    );
  }

  if (resolved === "left") {
    return (
      <span className={`inline-flex items-center ${spec.gap}`}>
        {wordmark}
        {mark}
      </span>
    );
  }

  if (resolved === "stacked") {
    return (
      <span
        className="inline-flex flex-col items-center gap-3"
      >
        {mark}
        {wordmark}
      </span>
    );
  }

  if (resolved === "end") {
    return (
      <span className={`inline-flex items-end ${spec.gap}`}>
        {mark}
        <span className="mb-[0.15em]">{wordmark}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center ${spec.gap}`}>
      {mark}
      {wordmark}
    </span>
  );
}

export const DESIGN_IDS: DesignId[] = [
  "clasp",
  "twin",
  "course",
  "gilt",
  "pair",
  "grip",
  "sigil",
  "solrise",
  "dawn",
];

export function isDesignId(value: string): value is DesignId {
  return (DESIGN_IDS as string[]).includes(value);
}
