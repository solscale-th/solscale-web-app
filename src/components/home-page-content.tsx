"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MainHeader from "@/components/main-header";
import SiteFooter from "@/components/site-footer";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/i18n/language-provider";
import { fetchInfluencers, type InfluencerListItem } from "@/lib/influencers";
import {
  INFLUENCER_CATEGORY_KEYS,
  MOCK_INFLUENCERS,
  type InfluencerCategoryKey,
} from "@/lib/mock-influencers";
import {
  formatBudgetRange,
  MOCK_JOBS,
  PLATFORM_COLORS,
  type Platform,
} from "@/lib/mock-jobs";
import {
  FILTER_COUNTRIES,
  FILTER_PLATFORMS,
  FOLLOWER_RANGES,
  PRICE_RANGES,
  matchesCountry,
  matchesFollowerRange,
  matchesPlatform,
  matchesPriceRange,
  type FilterCountryId,
  type FollowerRangeId,
  type PriceRangeId,
} from "@/lib/search-filters";

function StarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="#F59E0B">
      <path d="M5.5 1L6.9 4.1H10.3L7.7 6.2L8.7 9.4L5.5 7.5L2.3 9.4L3.3 6.2L0.7 4.1H4.1L5.5 1Z" />
    </svg>
  );
}

type OpenFilter =
  | "category"
  | "country"
  | "platform"
  | "followers"
  | "price"
  | null;

function FilterDropdown({
  id,
  label,
  openFilter,
  setOpenFilter,
  hasValue = false,
  children,
}: {
  id: Exclude<OpenFilter, null>;
  label: string;
  openFilter: OpenFilter;
  setOpenFilter: (id: OpenFilter) => void;
  hasValue?: boolean;
  children: React.ReactNode;
}) {
  const open = openFilter === id;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPos(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 256;
      const left = Math.min(
        Math.max(8, rect.left),
        window.innerWidth - menuWidth - 8
      );
      setMenuPos({ top: rect.bottom + 8, left });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpenFilter(open ? null : id)}
        className={`flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
          open || hasValue
            ? "border-white/35 bg-white/25 text-white"
            : "border-white/15 bg-white/10 text-white/85 hover:bg-white/18 hover:text-white"
        }`}
      >
        <span className="max-w-[9rem] truncate sm:max-w-[11rem]">{label}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          className={`shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open &&
        menuPos &&
        createPortal(
          <div
            data-filter-dropdown=""
            role="listbox"
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-[80] max-h-64 w-64 overflow-y-auto rounded-2xl border border-white/20 bg-[#2a1020]/95 py-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            {children}
          </div>,
          document.body
        )}
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-[13px] transition-colors hover:bg-white/10 ${
        active ? "bg-white/12 font-semibold text-[#d7ff2f]" : "text-white/90"
      }`}
    >
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {active && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path
            d="M2.5 7L5.5 10L11.5 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
  removeAria,
}: {
  label: string;
  onRemove: () => void;
  removeAria: string;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[12px] font-medium text-white/90">
      <span className="truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeAria}
        className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/15 hover:text-white"
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

const SCROLL_EASE = [0.22, 1, 0.36, 1] as const;
const SCROLL_VIEWPORT = { once: true, amount: 0.2, margin: "0px 0px -56px 0px" } as const;

export default function HomePageContent() {
  const { t, dictionary } = useLanguage();
  const { user } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const isInfluencer = user?.role === "influencer";
  const isEntrepreneur = user?.role === "entrepreneur";
  const showFollowerRange = !isInfluencer;
  const showPriceRange = !isEntrepreneur;
  const postJobHref = user?.role === "entrepreneur" ? "/jobs/new" : "/signup";

  const sectionReveal = prefersReducedMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: SCROLL_VIEWPORT,
        transition: { duration: 0.5, ease: SCROLL_EASE },
      };

  const cardReveal = (index: number) =>
    prefersReducedMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 30 },
          whileInView: { opacity: 1, y: 0 },
          viewport: SCROLL_VIEWPORT,
          transition: {
            duration: 0.48,
            delay: Math.min(index * 0.06, 0.36),
            ease: SCROLL_EASE,
          },
        };
  const [selectedCategories, setSelectedCategories] = useState<
    InfluencerCategoryKey[]
  >([]);
  const [selectedCountry, setSelectedCountry] = useState<FilterCountryId | null>(
    null
  );
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null
  );
  const [selectedFollowerRange, setSelectedFollowerRange] =
    useState<FollowerRangeId | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRangeId | null>(null);
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [influencers, setInfluencers] = useState<InfluencerListItem[]>([]);
  const [influencersOffset, setInfluencersOffset] = useState(0);
  const [hasMoreInfluencers, setHasMoreInfluencers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMoreInfluencers, setLoadingMoreInfluencers] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [discoveredCategories, setDiscoveredCategories] = useState<
    InfluencerCategoryKey[] | null
  >(null);
  const [discoveredPlatforms, setDiscoveredPlatforms] = useState<
    Platform[] | null
  >(null);

  const INFLUENCERS_PER_PAGE = 8;
  const [visibleCount, setVisibleCount] = useState(INFLUENCERS_PER_PAGE);

  // Role-gated filters stay in state but are ignored when not applicable
  const activeFollowerRange = showFollowerRange ? selectedFollowerRange : null;
  const activePriceRange = showPriceRange ? selectedPriceRange : null;

  // Debounce the search box so we don't re-query on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setVisibleCount(INFLUENCERS_PER_PAGE);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (filtersRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-filter-dropdown]")
      ) {
        return;
      }
      setOpenFilter(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Scroll offset used to drift the hero background shapes in different directions
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const influencerFetchParams = {
    search: search || undefined,
    categories:
      selectedCategories.length > 0 ? selectedCategories : undefined,
    platforms: selectedPlatform ? [selectedPlatform] : undefined,
  };

  useEffect(() => {
    const controller = new AbortController();
    // Resetting loading/error before a new fetch starts is the standard
    // data-fetching effect pattern; deferring it would delay the loading
    // indicator by a frame, so these two are intentionally exempted.
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true);
    setError(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    fetchInfluencers(
      {
        limit: INFLUENCERS_PER_PAGE,
        offset: 0,
        ...influencerFetchParams,
      },
      controller.signal
    )
      .then((data) => {
        if (controller.signal.aborted) return;
        setInfluencers(data);
        setInfluencersOffset(data.length);
        setHasMoreInfluencers(data.length === INFLUENCERS_PER_PAGE);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- params object rebuilt each render; deps listed explicitly
  }, [search, selectedCategories, selectedPlatform, reloadKey]);

  useEffect(() => {
    if (influencers.length === 0) return;

    setDiscoveredCategories((prev) => {
      const next = new Set(prev ?? []);
      for (const influencer of influencers) {
        for (const category of influencer.categories) {
          next.add(category);
        }
      }
      if (next.size === 0) return prev;
      return INFLUENCER_CATEGORY_KEYS.filter((key) => next.has(key));
    });

    setDiscoveredPlatforms((prev) => {
      const next = new Set(prev ?? []);
      for (const influencer of influencers) {
        for (const platform of influencer.platforms) {
          next.add(platform);
        }
      }
      if (next.size === 0) return prev;
      return Array.from(next);
    });
  }, [influencers]);

  async function loadMoreInfluencers() {
    setLoadingMoreInfluencers(true);
    try {
      const more = await fetchInfluencers({
        limit: INFLUENCERS_PER_PAGE,
        offset: influencersOffset,
        ...influencerFetchParams,
      });
      setInfluencers((prev) => [...prev, ...more]);
      setInfluencersOffset((prev) => prev + more.length);
      setHasMoreInfluencers(more.length === INFLUENCERS_PER_PAGE);
    } catch {
      setHasMoreInfluencers(false);
    } finally {
      setLoadingMoreInfluencers(false);
    }
  }

  function retryLoad() {
    setInfluencers([]);
    setLoading(true);
    setError(false);
    setReloadKey((k) => k + 1);
  }

  const categoryLabel = (key: InfluencerCategoryKey) =>
    t(`categories.${key}`);

  const filteredJobs = useMemo(() => {
    return MOCK_JOBS.filter((job) => {
      if (!matchesCountry(job.location, selectedCountry)) return false;
      if (!matchesPlatform(job.platform, undefined, selectedPlatform))
        return false;
      if (
        !matchesPriceRange(job.budgetMin, job.budgetMax, activePriceRange)
      ) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const haystack =
          `${job.title} ${job.company} ${job.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, selectedCountry, selectedPlatform, activePriceRange]);

  const filteredInfluencers = useMemo(() => {
    if (!selectedCountry && !activeFollowerRange) {
      return influencers;
    }

    return influencers.filter((inf) => {
      const mock = MOCK_INFLUENCERS.find(
        (m) =>
          m.name.toLowerCase() === inf.name.toLowerCase() ||
          m.handle === inf.handle
      );
      if (!mock) return true;
      if (!matchesCountry(mock.location, selectedCountry)) return false;
      if (!matchesFollowerRange(mock.followers, activeFollowerRange)) {
        return false;
      }
      return true;
    });
  }, [influencers, selectedCountry, activeFollowerRange]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMoreJobs = visibleCount < filteredJobs.length;

  const availableCategories = useMemo(() => {
    const base = discoveredCategories ?? [...INFLUENCER_CATEGORY_KEYS];
    return base.filter((cat) => !selectedCategories.includes(cat));
  }, [discoveredCategories, selectedCategories]);

  const platformOptions = useMemo(() => {
    if (isInfluencer) {
      const fromJobs = Array.from(
        new Set(MOCK_JOBS.map((job) => job.platform))
      );
      return fromJobs.length > 0 ? fromJobs : FILTER_PLATFORMS;
    }
    return discoveredPlatforms && discoveredPlatforms.length > 0
      ? discoveredPlatforms
      : FILTER_PLATFORMS;
  }, [discoveredPlatforms, isInfluencer]);

  const countryOptions = useMemo(() => {
    const locations = isInfluencer
      ? MOCK_JOBS.map((job) => job.location)
      : MOCK_INFLUENCERS.map((influencer) => influencer.location);

    const available = FILTER_COUNTRIES.filter((country) =>
      locations.some((location) => matchesCountry(location, country.id))
    );
    return available.length > 0 ? available : [...FILTER_COUNTRIES];
  }, [isInfluencer]);

  const followerRangeOptions = useMemo(() => {
    if (!showFollowerRange) return [];
    const available = FOLLOWER_RANGES.filter((range) =>
      MOCK_INFLUENCERS.some((influencer) =>
        matchesFollowerRange(influencer.followers, range.id)
      )
    );
    return available.length > 0 ? available : [...FOLLOWER_RANGES];
  }, [showFollowerRange]);

  const priceRangeOptions = useMemo(() => {
    if (!showPriceRange) return [];
    const available = PRICE_RANGES.filter((range) =>
      MOCK_JOBS.some((job) =>
        matchesPriceRange(job.budgetMin, job.budgetMax, range.id)
      )
    );
    return available.length > 0 ? available : [...PRICE_RANGES];
  }, [showPriceRange]);

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    !!selectedCountry ||
    !!selectedPlatform ||
    !!activeFollowerRange ||
    !!activePriceRange ||
    !!search;

  function resetJobPage() {
    setVisibleCount(INFLUENCERS_PER_PAGE);
  }

  function addCategory(category: InfluencerCategoryKey) {
    setSelectedCategories((prev) => [...prev, category]);
    setOpenFilter(null);
    resetJobPage();
  }

  function removeCategory(category: InfluencerCategoryKey) {
    setSelectedCategories((prev) => prev.filter((c) => c !== category));
    resetJobPage();
  }

  function selectCountry(id: FilterCountryId | null) {
    setSelectedCountry(id);
    setOpenFilter(null);
    resetJobPage();
  }

  function selectPlatform(platform: Platform | null) {
    setSelectedPlatform(platform);
    setOpenFilter(null);
    resetJobPage();
  }

  function selectFollowerRange(id: FollowerRangeId | null) {
    setSelectedFollowerRange(id);
    setOpenFilter(null);
    resetJobPage();
  }

  function selectPriceRange(id: PriceRangeId | null) {
    setSelectedPriceRange(id);
    setOpenFilter(null);
    resetJobPage();
  }

  function clearAllFilters() {
    setSelectedCategories([]);
    setSelectedCountry(null);
    setSelectedPlatform(null);
    setSelectedFollowerRange(null);
    setSelectedPriceRange(null);
    setOpenFilter(null);
    resetJobPage();
  }

  const countryChipLabel = selectedCountry
    ? t(`filterCountries.${selectedCountry}`)
    : null;
  const followerChipLabel = activeFollowerRange
    ? t(`filterFollowerRanges.${activeFollowerRange}`)
    : null;
  const priceChipLabel = activePriceRange
    ? t(`filterPriceRanges.${activePriceRange}`)
    : null;

  const hasSelectedFilters =
    selectedCategories.length > 0 ||
    !!selectedCountry ||
    !!selectedPlatform ||
    !!activeFollowerRange ||
    !!activePriceRange;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainHeader />

      <div className="flex-1">
      {/* Hero */}
      <section className="relative flex min-h-[88dvh] flex-col justify-center overflow-hidden bg-[#520024] pb-20 pt-14 text-white sm:min-h-screen sm:pb-28 sm:pt-20">
        {/* Decorative layer */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-atmosphere absolute inset-[-8%] bg-[radial-gradient(ellipse_at_50%_40%,rgba(157,0,59,0.55)_0%,transparent_55%),radial-gradient(ellipse_at_80%_85%,rgba(37,94,54,0.38)_0%,transparent_45%),radial-gradient(ellipse_at_15%_20%,rgba(215,255,47,0.1)_0%,transparent_40%),linear-gradient(180deg,#7a002f_0%,#520024_48%,#2a1018_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_0%,rgba(0,0,0,0.35)_100%)]" />

          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * -0.1}px, ${scrollY * 0.12}px, 0)` }}
          >
            <div className="hero-glow hero-glow-a absolute left-[8%] top-[30%] h-64 w-64 sm:h-80 sm:w-80" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * 0.1}px, ${scrollY * -0.1}px, 0)` }}
          >
            <div className="hero-glow hero-glow-b absolute right-[6%] top-[18%] h-72 w-72 sm:h-96 sm:w-96" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * -0.08}px, ${scrollY * 0.1}px, 0)` }}
          >
            <div className="hero-shape hero-shape-a absolute -left-24 top-[22%] h-72 w-72 rounded-full border border-white/14 sm:h-96 sm:w-96" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * 0.1}px, ${scrollY * -0.08}px, 0)` }}
          >
            <div className="hero-shape hero-shape-b absolute -right-28 top-[16%] h-80 w-80 rounded-full border border-white/14 sm:h-[26rem] sm:w-[26rem]" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * 0.12}px, ${scrollY * 0.08}px, 0)` }}
          >
            <div className="hero-shape hero-shape-c absolute left-[42%] bottom-[16%] h-40 w-40 rotate-12 border border-white/10 sm:h-52 sm:w-52" />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white/10 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl px-4 text-center sm:max-w-4xl sm:px-6">
          <h1 className="hero-rise mx-auto max-w-3xl text-[1.85rem] font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-[2.85rem] md:text-[3.35rem]">
            {t("hero.titleBefore")}{" "}
            <span className="text-[#d7ff2f]">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="hero-rise hero-rise-delay-1 mx-auto mt-4 max-w-lg text-[14px] leading-relaxed text-white/65 sm:mt-5 sm:text-[15px]">
            {t("hero.titleAfter")}
          </p>

          {/* Search bar with filters */}
          <div ref={filtersRef} className="hero-rise hero-rise-delay-2 mx-auto mt-8 w-full max-w-2xl text-left sm:mt-9">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput.trim());
              }}
              className="rounded-[24px] border border-white/25 bg-white/12 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:rounded-[28px] sm:p-3.5"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-black/20 px-3">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0 text-white/55"
                  aria-hidden
                >
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M10.5 10.5L13 13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("hero.searchPlaceholder")}
                  aria-label={t("hero.searchAria")}
                  className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/40"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setSearch("");
                    }}
                    aria-label={t("hero.clearSearch")}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/45 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  aria-label={t("common.search")}
                  className="hero-submit-pulse grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d7ff2f] text-[#151515] transition-colors hover:bg-[#c8f020]"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M10.5 10.5L13.5 13.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto px-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <FilterDropdown
                    id="category"
                    label={
                      selectedCategories.length > 0
                        ? `${t("common.category")} (${selectedCategories.length})`
                        : t("common.category")
                    }
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    hasValue={selectedCategories.length > 0}
                  >
                    {availableCategories.length === 0 ? (
                      <p className="px-4 py-3 text-[13px] text-white/50">
                        {t("hero.allCategoriesSelected")}
                      </p>
                    ) : (
                      availableCategories.map((category) => (
                        <FilterOption
                          key={category}
                          active={false}
                          onClick={() => addCategory(category)}
                        >
                          {categoryLabel(category)}
                        </FilterOption>
                      ))
                    )}
                  </FilterDropdown>

                  <FilterDropdown
                    id="country"
                    label={
                      selectedCountry
                        ? t(`filterCountries.${selectedCountry}`)
                        : t("common.country")
                    }
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    hasValue={!!selectedCountry}
                  >
                    <FilterOption
                      active={!selectedCountry}
                      onClick={() => selectCountry(null)}
                    >
                      {t("common.any")}
                    </FilterOption>
                    {countryOptions.map((country) => (
                      <FilterOption
                        key={country.id}
                        active={selectedCountry === country.id}
                        onClick={() => selectCountry(country.id)}
                      >
                        {t(`filterCountries.${country.id}`)}
                      </FilterOption>
                    ))}
                  </FilterDropdown>

                  <FilterDropdown
                    id="platform"
                    label={selectedPlatform ?? t("common.platform")}
                    openFilter={openFilter}
                    setOpenFilter={setOpenFilter}
                    hasValue={!!selectedPlatform}
                  >
                    <FilterOption
                      active={!selectedPlatform}
                      onClick={() => selectPlatform(null)}
                    >
                      {t("common.any")}
                    </FilterOption>
                    {platformOptions.map((platform) => (
                      <FilterOption
                        key={platform}
                        active={selectedPlatform === platform}
                        onClick={() => selectPlatform(platform)}
                      >
                        {platform}
                      </FilterOption>
                    ))}
                  </FilterDropdown>

                  {showFollowerRange && (
                    <FilterDropdown
                      id="followers"
                      label={
                        followerChipLabel ?? t("common.followerRange")
                      }
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      hasValue={!!activeFollowerRange}
                    >
                      <FilterOption
                        active={!activeFollowerRange}
                        onClick={() => selectFollowerRange(null)}
                      >
                        {t("common.any")}
                      </FilterOption>
                      {followerRangeOptions.map((range) => (
                        <FilterOption
                          key={range.id}
                          active={activeFollowerRange === range.id}
                          onClick={() => selectFollowerRange(range.id)}
                        >
                          {t(`filterFollowerRanges.${range.id}`)}
                        </FilterOption>
                      ))}
                    </FilterDropdown>
                  )}

                  {showPriceRange && (
                    <FilterDropdown
                      id="price"
                      label={priceChipLabel ?? t("common.priceRange")}
                      openFilter={openFilter}
                      setOpenFilter={setOpenFilter}
                      hasValue={!!activePriceRange}
                    >
                      <FilterOption
                        active={!activePriceRange}
                        onClick={() => selectPriceRange(null)}
                      >
                        {t("common.any")}
                      </FilterOption>
                      {priceRangeOptions.map((range) => (
                        <FilterOption
                          key={range.id}
                          active={activePriceRange === range.id}
                          onClick={() => selectPriceRange(range.id)}
                        >
                          {t(`filterPriceRanges.${range.id}`)}
                        </FilterOption>
                      ))}
                    </FilterDropdown>
                  )}
              </div>

              {hasSelectedFilters && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
                  {selectedCategories.map((category) => (
                    <ActiveFilterChip
                      key={category}
                      label={categoryLabel(category)}
                      onRemove={() => removeCategory(category)}
                      removeAria={t("hero.removeCategory", {
                        category: categoryLabel(category),
                      })}
                    />
                  ))}
                  {selectedCountry && countryChipLabel && (
                    <ActiveFilterChip
                      label={countryChipLabel}
                      onRemove={() => selectCountry(null)}
                      removeAria={t("hero.removeFilter", {
                        filter: countryChipLabel,
                      })}
                    />
                  )}
                  {selectedPlatform && (
                    <ActiveFilterChip
                      label={selectedPlatform}
                      onRemove={() => selectPlatform(null)}
                      removeAria={t("hero.removeFilter", {
                        filter: selectedPlatform,
                      })}
                    />
                  )}
                  {activeFollowerRange && followerChipLabel && (
                    <ActiveFilterChip
                      label={followerChipLabel}
                      onRemove={() => selectFollowerRange(null)}
                      removeAria={t("hero.removeFilter", {
                        filter: followerChipLabel,
                      })}
                    />
                  )}
                  {activePriceRange && priceChipLabel && (
                    <ActiveFilterChip
                      label={priceChipLabel}
                      onRemove={() => selectPriceRange(null)}
                      removeAria={t("hero.removeFilter", {
                        filter: priceChipLabel,
                      })}
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="ml-auto text-[12px] font-medium text-white/70 transition-colors hover:text-white"
                  >
                    {t("common.clearAll")}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* CTA — entrepreneurs and guests only */}
          {!isInfluencer && (
            <div className="hero-rise hero-rise-delay-3 mt-6 sm:mt-7">
              <Link
                href={postJobHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#d7ff2f] px-6 py-3 text-[13px] font-semibold text-[#151515] transition-colors hover:bg-[#c8f020] sm:text-[14px]"
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {t("hero.postJobCta")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Jobs section — shown to logged-in influencers */}
      {isInfluencer ? (
        <section className="bg-[#faf8f6] px-4 pb-20 pt-12 sm:px-8 sm:pt-14">
          <div className="mx-auto max-w-7xl">
            <motion.div
              {...sectionReveal}
              className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ebe6e0] pb-5"
            >
              <div>
                <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#141414] sm:text-[1.5rem]">
                  {t("homeJobs.title")}
                </h2>
                <p className="mt-1 text-[13px] text-[#7a7570]">
                  {t("homeJobs.found", { count: filteredJobs.length })}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#555]">
                <span className="hidden sm:inline text-[#8a8580]">{t("common.sortBy")}</span>
                <button className="flex items-center gap-1.5 rounded-full border border-[#e5e0da] bg-white px-3.5 py-1.5 font-medium text-[#333] transition-colors hover:border-[#cfc8c0]">
                  {t("homeJobs.sortNewest")}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </motion.div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
              {visibleJobs.map((job, index) => {
                const platformStyle = PLATFORM_COLORS[job.platform];
                return (
                  <motion.div key={job.id} {...cardReveal(index)} className="h-full">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#ebe6e0] bg-white shadow-[0_1px_2px_rgba(40,20,10,0.04)] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[#ddd6ce] hover:shadow-[0_14px_32px_rgba(40,20,10,0.1)]"
                  >
                    <div className={`relative h-32 overflow-hidden ${job.thumbnailBg}`}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                      <span
                        className="absolute left-3 top-3 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                        style={{ backgroundColor: platformStyle.bg, color: platformStyle.text }}
                      >
                        {job.platform}
                      </span>
                      <span className="absolute bottom-3 left-3 text-[12px] font-semibold text-white">
                        {formatBudgetRange(job.budgetMin, job.budgetMax)}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#141414]">
                        {job.title}
                      </h3>
                      <p className="truncate text-[12px] text-[#7a7570]">{job.company}</p>
                      <p className="truncate text-[11px] text-[#9a9590]">{job.location}</p>

                      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[12px] font-semibold text-[#9d003b] transition-colors group-hover:text-[#850030]">
                        {t("homeJobs.viewJob")}
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                  </motion.div>
                );
              })}
            </div>

            {filteredJobs.length === 0 && (
              <p className="mt-10 text-center text-[14px] text-[#7a7570]">
                {hasActiveFilters ? t("homeJobs.empty") : t("homeJobs.none")}
              </p>
            )}

            {hasMoreJobs && (
              <motion.div {...sectionReveal} className="mt-10 flex justify-center">
                <button
                  onClick={() =>
                    setVisibleCount((count) => count + INFLUENCERS_PER_PAGE)
                  }
                  className="flex items-center gap-2 rounded-full border border-[#e0dbd5] bg-white px-7 py-2.5 text-[13px] font-semibold text-[#444] transition-colors hover:border-[#9d003b] hover:text-[#9d003b]"
                >
                  {t("homeJobs.loadMore")}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
        </section>
      ) : (
      /* Influencers section */
      <section className="bg-[#faf8f6] px-4 pb-20 pt-12 sm:px-8 sm:pt-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            {...sectionReveal}
            className="flex flex-wrap items-end justify-between gap-4 border-b border-[#ebe6e0] pb-5"
          >
            <div>
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.03em] text-[#141414] sm:text-[1.5rem]">
                {t("influencers.title")}
              </h2>
              <p className="mt-1 text-[13px] text-[#7a7570]">
                {t("influencers.found", { count: filteredInfluencers.length })}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#555]">
              <span className="hidden sm:inline text-[#8a8580]">{t("common.sortBy")}</span>
              <button className="flex items-center gap-1.5 rounded-full border border-[#e5e0da] bg-white px-3.5 py-1.5 font-medium text-[#333] transition-colors hover:border-[#cfc8c0]">
                {t("influencers.sortPopular")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.div>

          {loading ? (
            <p className="mt-10 text-center text-[14px] text-[#7a7570]">
              {t("influencers.loading")}
            </p>
          ) : error ? (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-center text-[14px] text-[#c0392b]">
                {t("influencers.error")}
              </p>
              <button
                onClick={retryLoad}
                className="rounded-full border border-[#e0dbd5] bg-white px-5 py-2 text-[13px] font-semibold text-[#555] transition-colors hover:border-[#9d003b] hover:text-[#9d003b]"
              >
                {t("influencers.retry")}
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-5">
              {filteredInfluencers.map((influencer, index) => (
                <motion.div key={influencer.id} {...cardReveal(index)} className="h-full">
                <Link
                  href={`/influencers/${influencer.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-[#ebe6e0] bg-white shadow-[0_1px_2px_rgba(40,20,10,0.04)] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-[#ddd6ce] hover:shadow-[0_14px_32px_rgba(40,20,10,0.1)]"
                >
                  <div
                    className={`relative h-28 ${influencer.avatarBg} bg-cover bg-center`}
                    style={
                      influencer.avatarUrl
                        ? { backgroundImage: `url(${influencer.avatarUrl})` }
                        : undefined
                    }
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <div className="relative flex flex-1 flex-col gap-2.5 px-4 pb-4 pt-0">
                    <div className="-mt-8 mb-1 flex items-end gap-3">
                      <div
                        className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-cover bg-center text-lg font-semibold text-[#9d003b] shadow-sm ${influencer.avatarBg}`}
                        style={
                          influencer.avatarUrl
                            ? { backgroundImage: `url(${influencer.avatarUrl})` }
                            : undefined
                        }
                      >
                        {!influencer.avatarUrl && influencer.name.charAt(0)}
                      </div>
                      {influencer.platform && (
                        <span
                          className="mb-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                          style={{
                            backgroundColor: PLATFORM_COLORS[influencer.platform].bg,
                            color: PLATFORM_COLORS[influencer.platform].text,
                          }}
                        >
                          {influencer.platform}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="truncate text-[14px] font-semibold text-[#141414]">
                        {influencer.name}
                      </h3>
                      <p className="truncate text-[12px] text-[#7a7570]">{influencer.handle}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[12px] text-[#7a7570]">
                      <StarIcon />
                      <span className="font-semibold text-[#333]">
                        {influencer.rating.toFixed(1)}
                      </span>
                      <span>({influencer.reviews} {t("common.reviews")})</span>
                    </div>

                    {influencer.categories.length > 0 && (
                      <p className="truncate text-[11px] text-[#9a9590]">
                        {influencer.categories
                          .slice(0, 2)
                          .map((key) => categoryLabel(key))
                          .join(" · ")}
                      </p>
                    )}

                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[12px] font-semibold text-[#9d003b] transition-colors group-hover:text-[#850030]">
                      {t("influencers.viewProfile")}
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                        <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filteredInfluencers.length === 0 && (
            <p className="mt-10 text-center text-[14px] text-[#7a7570]">
              {hasActiveFilters
                ? t("influencers.empty")
                : t("influencers.none")}
            </p>
          )}

          {!loading && !error && hasMoreInfluencers && filteredInfluencers.length > 0 && (
            <motion.div {...sectionReveal} className="mt-10 flex justify-center">
              <button
                onClick={loadMoreInfluencers}
                disabled={loadingMoreInfluencers}
                className="flex items-center gap-2 rounded-full border border-[#e0dbd5] bg-white px-7 py-2.5 text-[13px] font-semibold text-[#444] transition-colors hover:border-[#9d003b] hover:text-[#9d003b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingMoreInfluencers ? t("influencers.loading") : t("influencers.loadMore")}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </section>
      )}

      {/* How Solscale Works */}
      <section className="bg-[#f0ede5] px-4 sm:px-6 py-12 sm:py-16 text-[#141414]">
        <div className="mx-auto max-w-5xl">
          <motion.div {...sectionReveal}>
            <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-[-0.02em]">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-2 text-center text-[15px] text-[#666]">
              {t("howItWorks.subtitle")}
            </p>
          </motion.div>

          {/* 1 col on mobile, 2 col on md+ */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.article
              {...cardReveal(0)}
              className="rounded-3xl bg-white px-6 sm:px-8 py-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
            >
              <span className="inline-flex rounded-full bg-[#9d003b] px-3.5 py-1 text-[13px] font-semibold text-white">
                {t("howItWorks.forInfluencers")}
              </span>
              <ol className="mt-6 space-y-6">
                {dictionary.howItWorks.influencerSteps.map((step, idx) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#e8e38d] text-[13px] font-semibold text-[#9d003b]">
                      {`0${idx + 1}`}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold leading-snug">{step.title}</h3>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-[#777]">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.article>

            <motion.article
              {...cardReveal(1)}
              className="rounded-3xl bg-white px-6 sm:px-8 py-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
            >
              <span className="inline-flex rounded-full bg-[#0f7b34] px-3.5 py-1 text-[13px] font-semibold text-white">
                {t("howItWorks.forEntrepreneurs")}
              </span>
              <ol className="mt-6 space-y-6">
                {dictionary.howItWorks.entrepreneurSteps.map((step, idx) => (
                  <li key={step.title} className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#8bf0a8] text-[13px] font-semibold text-[#0f7b34]">
                      {`0${idx + 1}`}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold leading-snug">{step.title}</h3>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-[#777]">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.article>
          </div>
        </div>
      </section>
      </div>

      <SiteFooter />
    </div>
  );
}
