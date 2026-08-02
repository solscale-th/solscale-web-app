"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpenFilter(open ? null : id)}
        className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-medium transition-colors ${
          open || hasValue
            ? "bg-[#fce8ee] text-[#9d003b]"
            : "text-[#555] hover:bg-[#f5f5f5]"
        }`}
      >
        {label}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-52 overflow-y-auto rounded-xl border border-[#eee] bg-white py-1 shadow-lg sm:left-auto sm:right-0">
          {children}
        </div>
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
      onClick={onClick}
      className={`block w-full px-4 py-2.5 text-left text-[13px] hover:bg-[#fafafa] ${
        active ? "font-semibold text-[#9d003b]" : "text-[#333]"
      }`}
    >
      {children}
    </button>
  );
}

export default function HomePageContent() {
  const { t, dictionary } = useLanguage();
  const { user } = useAuth();
  const isInfluencer = user?.role === "influencer";
  const isEntrepreneur = user?.role === "entrepreneur";
  const showFollowerRange = !isInfluencer;
  const showPriceRange = !isEntrepreneur;
  const postJobHref = user?.role === "entrepreneur" ? "/jobs/new" : "/signup";
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
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setOpenFilter(null);
      }
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

  const availableCategories = INFLUENCER_CATEGORY_KEYS.filter(
    (cat) => !selectedCategories.includes(cat)
  );

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

  const countryChipLabel = selectedCountry
    ? t(`filterCountries.${selectedCountry}`)
    : null;
  const followerChipLabel = activeFollowerRange
    ? t(`filterFollowerRanges.${activeFollowerRange}`)
    : null;
  const priceChipLabel = activePriceRange
    ? t(`filterPriceRanges.${activePriceRange}`)
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <MainHeader />

      <div className="flex-1">
      {/* Hero */}
      <section className="relative bg-[#5e0029] pb-20 pt-20 text-white sm:pb-28 sm:pt-28">
        {/* Decorative layer – overflow-hidden scoped here so the dropdown isn't clipped */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_90%,rgba(37,94,54,0.7),transparent_45%),linear-gradient(120deg,#8c0034_0%,#5d0028_55%,#2a1020_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.4))]" />
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * -0.12}px, ${scrollY * 0.25}px, 0)` }}
          >
            <div className="hero-shape hero-shape-a absolute -left-16 top-8 h-56 w-56 rounded-full border border-white/10" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * 0.15}px, ${scrollY * -0.2}px, 0)` }}
          >
            <div className="hero-shape hero-shape-b absolute -right-16 top-12 h-56 w-56 rounded-full border border-white/10" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * 0.28}px, ${scrollY * 0.18}px, 0)` }}
          >
            <div className="hero-shape hero-shape-c absolute right-40 top-16 h-40 w-40 rotate-12 border border-white/8" />
          </div>
          <div
            className="absolute inset-0"
            style={{ transform: `translate3d(${scrollY * -0.22}px, ${scrollY * -0.3}px, 0)` }}
          >
            <div className="hero-shape hero-shape-d absolute left-1/4 top-20 h-44 w-44 -rotate-12 border border-white/8" />
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <h1 className="text-2xl font-medium leading-[1.08] tracking-[-0.03em] sm:text-4l md:text-4xl">
            {t("hero.titleBefore")}{" "}
            <span className="text-[#d7ff2f]">{t("hero.titleHighlight")}</span>
            <br className="hidden sm:block" />
            <span className="mt-3 inline-block">{t("hero.titleAfter")}</span>
          </h1>

          {/* Search bar with filters */}
          <div ref={filtersRef} className="mx-auto mt-6 sm:mt-8 max-w-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(searchInput.trim());
              }}
              className="flex items-center rounded-2xl bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1 shrink-0 text-[#9a003b]">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("hero.searchPlaceholder")}
                aria-label={t("hero.searchAria")}
                className="mx-2 h-11 flex-1 bg-transparent text-sm text-[#333] outline-none placeholder:text-[#aaa]"
              />

              <button
                type="submit"
                className="h-9 shrink-0 rounded-xl bg-[#9d003b] px-4 sm:px-5 text-sm font-semibold text-white transition-colors hover:bg-[#850030]"
              >
                {t("common.search")}
              </button>
            </form>

            {/* Filter row */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-white p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.2)] sm:gap-1.5 sm:p-2">
              <FilterDropdown
                id="category"
                label={t("common.category")}
                openFilter={openFilter}
                setOpenFilter={setOpenFilter}
                hasValue={selectedCategories.length > 0}
              >
                {availableCategories.length === 0 ? (
                  <p className="px-4 py-3 text-[13px] text-[#888]">
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

              <span className="hidden h-5 w-px shrink-0 bg-[#eee] sm:block" />

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
                {FILTER_COUNTRIES.map((country) => (
                  <FilterOption
                    key={country.id}
                    active={selectedCountry === country.id}
                    onClick={() => selectCountry(country.id)}
                  >
                    {t(`filterCountries.${country.id}`)}
                  </FilterOption>
                ))}
              </FilterDropdown>

              <span className="hidden h-5 w-px shrink-0 bg-[#eee] sm:block" />

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
                {FILTER_PLATFORMS.map((platform) => (
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
                <>
                  <span className="hidden h-5 w-px shrink-0 bg-[#eee] sm:block" />
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
                    {FOLLOWER_RANGES.map((range) => (
                      <FilterOption
                        key={range.id}
                        active={activeFollowerRange === range.id}
                        onClick={() => selectFollowerRange(range.id)}
                      >
                        {t(`filterFollowerRanges.${range.id}`)}
                      </FilterOption>
                    ))}
                  </FilterDropdown>
                </>
              )}

              {showPriceRange && (
                <>
                  <span className="hidden h-5 w-px shrink-0 bg-[#eee] sm:block" />
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
                    {PRICE_RANGES.map((range) => (
                      <FilterOption
                        key={range.id}
                        active={activePriceRange === range.id}
                        onClick={() => selectPriceRange(range.id)}
                      >
                        {t(`filterPriceRanges.${range.id}`)}
                      </FilterOption>
                    ))}
                  </FilterDropdown>
                </>
              )}
            </div>

            {/* Active filter chips */}
            {(selectedCategories.length > 0 ||
              selectedCountry ||
              selectedPlatform ||
              activeFollowerRange ||
              activePriceRange) && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {selectedCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm"
                  >
                    {categoryLabel(category)}
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      aria-label={t("hero.removeCategory", {
                        category: categoryLabel(category),
                      })}
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] hover:bg-white/30"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedCountry && countryChipLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
                    {countryChipLabel}
                    <button
                      type="button"
                      onClick={() => selectCountry(null)}
                      aria-label={t("hero.removeFilter", {
                        filter: countryChipLabel,
                      })}
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] hover:bg-white/30"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedPlatform && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
                    {selectedPlatform}
                    <button
                      type="button"
                      onClick={() => selectPlatform(null)}
                      aria-label={t("hero.removeFilter", {
                        filter: selectedPlatform,
                      })}
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] hover:bg-white/30"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activeFollowerRange && followerChipLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
                    {followerChipLabel}
                    <button
                      type="button"
                      onClick={() => selectFollowerRange(null)}
                      aria-label={t("hero.removeFilter", {
                        filter: followerChipLabel,
                      })}
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] hover:bg-white/30"
                    >
                      ×
                    </button>
                  </span>
                )}
                {activePriceRange && priceChipLabel && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
                    {priceChipLabel}
                    <button
                      type="button"
                      onClick={() => selectPriceRange(null)}
                      aria-label={t("hero.removeFilter", {
                        filter: priceChipLabel,
                      })}
                      className="grid h-4 w-4 place-items-center rounded-full bg-white/20 text-[10px] hover:bg-white/30"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* CTA — entrepreneurs and guests only */}
          {!isInfluencer && (
            <div className="mt-6 sm:mt-7">
              <Link
                href={postJobHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#d7ff2f] px-6 sm:px-8 py-3.5 text-[14px] sm:text-[15px] font-extrabold text-[#151515] shadow-[0_6px_20px_rgba(215,255,47,0.4)] hover:bg-[#c8f020] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M9 5.5V12.5M5.5 9H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {t("hero.postJobCta")}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Jobs section — shown to logged-in influencers */}
      {isInfluencer ? (
        <section className="bg-white px-4 sm:px-8 pb-16 pt-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-[17px] font-bold text-[#111]">
                  {t("homeJobs.title")}
                </h2>
                <p className="text-[13px] text-[#888]">
                  {t("homeJobs.found", { count: filteredJobs.length })}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#555]">
                <span className="hidden sm:inline">{t("common.sortBy")}</span>
                <button className="flex items-center gap-1 rounded-lg border border-[#eee] bg-white px-3 py-1.5 font-medium hover:border-[#ccc] transition-colors">
                  {t("homeJobs.sortNewest")}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Job cards: 1 col → 2 col → 3 col → 4 col */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div className={`h-28 ${job.thumbnailBg}`} />

                  <div className="flex flex-1 flex-col gap-2 p-3.5">
                    <h3 className="line-clamp-2 text-[14px] font-bold leading-snug text-[#111]">
                      {job.title}
                    </h3>
                    <p className="text-[12px] text-[#888]">{job.company}</p>
                    <p className="text-[12px] font-semibold text-[#333]">
                      {formatBudgetRange(job.budgetMin, job.budgetMax)}
                    </p>

                    <div className="mt-auto pt-1">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white hover:bg-[#850030] transition-colors"
                      >
                        {t("homeJobs.viewJob")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <p className="mt-8 text-center text-[14px] text-[#888]">
                {hasActiveFilters ? t("homeJobs.empty") : t("homeJobs.none")}
              </p>
            )}

            {hasMoreJobs && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() =>
                    setVisibleCount((count) => count + INFLUENCERS_PER_PAGE)
                  }
                  className="flex items-center gap-2 rounded-2xl border border-[#ddd] bg-white px-8 py-3 text-[14px] font-semibold text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
                >
                  {t("homeJobs.loadMore")}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      ) : (
      /* Influencers section */
      <section className="bg-white px-4 sm:px-8 pb-16 pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-[17px] font-bold text-[#111]">
                {t("influencers.title")}
              </h2>
              <p className="text-[13px] text-[#888]">
                {t("influencers.found", { count: filteredInfluencers.length })}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-[#555]">
              <span className="hidden sm:inline">{t("common.sortBy")}</span>
              <button className="flex items-center gap-1 rounded-lg border border-[#eee] bg-white px-3 py-1.5 font-medium hover:border-[#ccc] transition-colors">
                {t("influencers.sortPopular")}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Influencer cards: 1 col → 2 col → 3 col → 4 col */}
          {loading ? (
            <p className="mt-8 text-center text-[14px] text-[#888]">
              {t("influencers.loading")}
            </p>
          ) : error ? (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-center text-[14px] text-[#c0392b]">
                {t("influencers.error")}
              </p>
              <button
                onClick={retryLoad}
                className="rounded-xl border border-[#ddd] bg-white px-5 py-2 text-[13px] font-semibold text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors"
              >
                {t("influencers.retry")}
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredInfluencers.map((influencer) => (
                <div
                  key={influencer.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div
                    className={`relative h-28 ${influencer.avatarBg} flex items-center justify-center bg-cover bg-center`}
                    style={
                      influencer.avatarUrl
                        ? { backgroundImage: `url(${influencer.avatarUrl})` }
                        : undefined
                    }
                  >
                    {!influencer.avatarUrl && (
                      <div className="grid h-16 w-16 place-items-center rounded-full bg-white/80 text-2xl font-bold text-[#9d003b]">
                        {influencer.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-[14px] font-bold text-[#111]">
                          {influencer.name}
                        </h3>
                      </div>
                      <p className="text-[12px] text-[#888]">{influencer.handle}</p>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#888]">
                      <StarIcon />
                      <span className="font-semibold text-[#333]">
                        {influencer.rating.toFixed(1)}
                      </span>
                      <span>({influencer.reviews})</span>
                    </div>

                    <div className="mt-auto pt-1">
                      <Link
                        href={`/influencers/${influencer.id}`}
                        className="block w-full rounded-xl bg-[#9d003b] px-3.5 py-2 text-center text-[12px] font-semibold text-white hover:bg-[#850030] transition-colors"
                      >
                        {t("influencers.viewProfile")}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && filteredInfluencers.length === 0 && (
            <p className="mt-8 text-center text-[14px] text-[#888]">
              {hasActiveFilters
                ? t("influencers.empty")
                : t("influencers.none")}
            </p>
          )}

          {!loading && !error && hasMoreInfluencers && filteredInfluencers.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMoreInfluencers}
                disabled={loadingMoreInfluencers}
                className="flex items-center gap-2 rounded-2xl border border-[#ddd] bg-white px-8 py-3 text-[14px] font-semibold text-[#555] hover:border-[#9d003b] hover:text-[#9d003b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMoreInfluencers ? t("influencers.loading") : t("influencers.loadMore")}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
      )}

      {/* How Solscale Works */}
      <section className="bg-[#f0ede5] px-4 sm:px-6 py-12 sm:py-16 text-[#141414]">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold tracking-[-0.02em]">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-2 text-center text-[15px] text-[#666]">
            {t("howItWorks.subtitle")}
          </p>

          {/* 1 col on mobile, 2 col on md+ */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-3xl bg-white px-6 sm:px-8 py-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
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
            </article>

            <article className="rounded-3xl bg-white px-6 sm:px-8 py-7 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
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
            </article>
          </div>
        </div>
      </section>
      </div>

      <SiteFooter />
    </div>
  );
}
