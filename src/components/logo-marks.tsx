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
  | "dawn"
  | "match";

type LockupLayout = "right" | "left" | "stacked" | "end" | "top" | "word";

type MarkProps = {
  size?: number;
  primary?: string;
  accent?: string;
  spark?: string;
  className?: string;
};

const LIGHT: LogoColors = {
  primary: "var(--color-brand-mark)",
  accent: "var(--color-accent)",
  text: "var(--color-ink-strong)",
};

const LOCKUP = {
  sm: { mark: 28, text: "text-[12px] leading-none", gap: "gap-2" },
  md: { mark: 48, text: "text-[20px] leading-none", gap: "gap-3" },
  lg: { mark: 80, text: "text-[30px] leading-none", gap: "gap-4" },
} as const;

export const LOGO_SURFACES = {
  light: { bg: "var(--color-surface)", colors: LIGHT },
  brand: {
    bg: "var(--color-brand-header)",
    colors: { primary: "var(--color-accent)", accent: "#ffffff", text: "#ffffff" },
  },
  dark: {
    bg: "var(--color-footer)",
    colors: { primary: "var(--color-accent)", accent: "#ffffff", text: "#ffffff" },
  },
  lime: {
    bg: "var(--color-accent)",
    colors: { primary: "var(--color-brand-mark)", accent: "var(--color-ink-strong)", text: "var(--color-brand-mark)" },
  },
} as const;

export const DESIGN_THEME: Record<DesignId, LogoColors> = {
  clasp: { primary: "var(--color-brand-mark)", accent: "var(--color-accent)", text: "var(--color-ink-strong)" },
  twin: { primary: "var(--color-brand-deep)", accent: "var(--color-accent)", text: "var(--color-brand-deep)" },
  course: { primary: "var(--color-brand-mark)", accent: "var(--color-accent)", text: "var(--color-brand-mark)" },
  gilt: {
    primary: "#c9ae7c",
    accent: "#1a1612",
    spark: "#e8d5a8",
    text: "#c9ae7c",
  },
  pair: { primary: "var(--color-brand-mark)", accent: "var(--color-accent)", text: "var(--color-brand-mark)" },
  grip: { primary: "var(--color-brand-mark)", accent: "var(--color-accent)", text: "var(--color-ink-strong)" },
  sigil: {
    primary: "var(--color-brand-mark)",
    accent: "var(--color-accent)",
    spark: "#ff4d8d",
    text: "var(--color-ink-strong)",
  },
  solrise: { primary: "var(--color-brand-mark)", accent: "#e8940f", text: "var(--color-ink-strong)" },
  dawn: { primary: "var(--color-brand-mark)", accent: "var(--color-accent)", text: "var(--color-ink-strong)" },
  match: {
    primary: "var(--color-brand-mark)",
    accent: "#e8940f",
    spark: "#e8940f",
    text: "var(--color-ink-strong)",
  },
};

export const HERO_BG: Record<DesignId, string> = {
  clasp: "var(--color-surface)",
  twin: "#f4efe6",
  course: "#ffffff",
  gilt: "#14110f",
  pair: "#fbf7f2",
  grip: "#f3f6ef",
  sigil: "#f6f3ff",
  solrise: "#fff6e4",
  dawn: "#f4f5f7",
  match: "#f3f5f8",
};

const LAYOUT: Record<DesignId, LockupLayout> = {
  clasp: "right",
  twin: "right",
  course: "stacked",
  gilt: "stacked",
  pair: "stacked",
  grip: "right",
  sigil: "stacked",
  solrise: "stacked",
  dawn: "word",
  match: "right",
};

export function CurrentMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <div
      className={`grid place-items-center rounded-lg bg-accent font-black text-brand-mark ${className ?? ""}`}
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
        d="M14 46A21 21 0 1 1 48 18"
        stroke={primary}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="48" cy="18" r="5.8" fill={accent} />
    </svg>
  );
}

export function GiltMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  spark,
  className,
}: MarkProps) {
  const ray = spark ?? primary;
  const pt = (deg: number, r: number) => {
    const a = (deg * Math.PI) / 180;
    return [32 + r * Math.cos(a), 32 - r * Math.sin(a)] as const;
  };
  const wedge = (deg: number, inner: number, outer: number, spread: number) => {
    const [tx, ty] = pt(deg, outer);
    const [ax, ay] = pt(deg - spread, inner);
    const [bx, by] = pt(deg + spread, inner);
    return `M${tx} ${ty}L${ax} ${ay}L${bx} ${by}Z`;
  };
  const longDeg = [90, 30, -30, -90, -150, 150];
  const shortDeg = [60, 0, -60, -120, 180, 120];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      {longDeg.map((deg) => (
        <path key={`l${deg}`} d={wedge(deg, 19, 31.4, 6.2)} fill={ray} />
      ))}
      {shortDeg.map((deg) => (
        <path key={`s${deg}`} d={wedge(deg, 19, 26.4, 4.4)} fill={ray} />
      ))}
      <path d="M32 14.5L47.2 23.25V40.75L32 49.5L16.8 40.75V23.25Z" fill={primary} />
      <path d="M32 21.5L41.1 26.75V37.25L32 42.5L22.9 37.25V26.75Z" fill={accent} />
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
      <path
        d="M50 50V24c0-9-7-15-17-15"
        stroke={accent}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M46 28c0-12-10-16-18-14"
        stroke={accent}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 14v26c0 9 7 15 17 15"
        stroke={primary}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M18 36c0 12 10 16 18 14"
        stroke={primary}
        strokeWidth="6.5"
        strokeLinecap="round"
        fill="none"
      />
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
        <linearGradient id={`sigil-body-${uid}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={primary} />
          <stop offset="45%" stopColor={flare} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>
      <path
        d="M18 50C18 42 46 46 46 38C46 30 18 34 18 26C18 18 46 22 46 15"
        stroke={`url(#sigil-body-${uid})`}
        strokeWidth="4.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="46" cy="15" r="5.8" fill={accent} />
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

function SunDot({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <circle cx="8" cy="8" r="4.35" fill={color} />
      <path
        d="M8 1.55V2.85M8 13.15V14.45M1.55 8H2.85M13.15 8H14.45M2.7 2.7 3.65 3.65M12.35 12.35 13.3 13.3M13.3 2.7 12.35 3.65M3.65 12.35 2.7 13.3"
        stroke={color}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DawnMark({
  size = 40,
  primary = LIGHT.primary,
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
      <text
        x="16"
        y="28"
        textAnchor="middle"
        fill={primary}
        fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
        fontSize="15"
        fontWeight={600}
      >
        S
      </text>
      <g transform="translate(32 22.4)">
        <circle r="4.35" fill={primary} />
        <path
          d="M0-6.45V-5.15M0 5.15V6.45M-6.45 0H-5.15M5.15 0H6.45M-5.3-5.3-4.35-4.35M4.35 4.35 5.3 5.3M5.3-5.3 4.35-4.35M-4.35 4.35-5.3 5.3"
          stroke={primary}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </g>
      <text
        x="48"
        y="28"
        textAnchor="middle"
        fill={primary}
        fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
        fontSize="15"
        fontWeight={600}
      >
        L
      </text>
      <text
        x="32"
        y="48"
        textAnchor="middle"
        fill={primary}
        fontFamily="var(--font-geist-sans), ui-sans-serif, sans-serif"
        fontSize="13"
        fontWeight={400}
        letterSpacing="1.1"
      >
        SCALE
      </text>
    </svg>
  );
}

function DawnWordmark({
  size,
  colors,
}: {
  size: LogoSize;
  colors: LogoColors;
}) {
  const type = {
    sm: "text-[15px] leading-none",
    md: "text-[22px] leading-none",
    lg: "text-[38px] leading-none",
  }[size];

  return (
    <span
      className={`${type} inline-flex items-center uppercase`}
      style={{ color: colors.text }}
    >
      <span className="inline-grid grid-cols-[1em_0.86em_1em] items-center justify-items-center font-extrabold tracking-normal">
        <span>S</span>
        <SunDot
          color={colors.text}
          className="h-[0.86em] w-[0.86em] shrink-0"
        />
        <span>L</span>
      </span>
      <span className="font-normal tracking-[0.04em]">SCALE</span>
    </span>
  );
}

export function MatchMark({
  size = 40,
  primary = LIGHT.primary,
  accent = LIGHT.accent,
  spark,
  className,
}: MarkProps) {
  const fill = (spark ?? accent).toLowerCase();
  const inner =
    fill === "#ffffff" || fill === "#fff" ? "var(--color-brand-mark)" : spark ?? accent;

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
        d="M10 47Q32 59 54 47"
        stroke={primary}
        strokeWidth="4.4"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="5" y="16" width="18" height="24" rx="3.5" fill={primary} />
      <path
        d="M9.5 23.5H18.5M9.5 29H16"
        stroke={inner}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M23 28C26 16 30 16 32 28C34 40 38 40 40.5 28"
        stroke={accent}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="51" cy="28" r="10.5" fill={primary} />
      <circle cx="51" cy="28" r="4" fill={inner} />
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
    case "match":
      return <MatchMark {...props} />;
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

  if (id === "course" || id === "sigil") {
    return (
      <span
        className={`${type} font-black uppercase tracking-[-0.04em]`}
        style={{ color: colors.text }}
      >
        SOLSCALE
      </span>
    );
  }

  if (id === "dawn") {
    return <DawnWordmark size={size} colors={colors} />;
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

  if (resolved === "word") {
    return <span className="inline-flex items-center">{wordmark}</span>;
  }

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
  "match",
];

export function isDesignId(value: string): value is DesignId {
  return (DESIGN_IDS as string[]).includes(value);
}
