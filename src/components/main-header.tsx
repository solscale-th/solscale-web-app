"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";
import { useAuth } from "@/hooks/use-auth";
import { useFlowchart } from "@/hooks/use-flowchart";
import {
  liveApplicationBadgeCount,
  liveDirectBadgeCount,
  liveMyJobBadgeCount,
  liveSubmissionBadgeCount,
} from "@/lib/flowchart/badges";
import { getSeenIds, SEEN_CHANGE_EVENT } from "@/lib/seen-applications";
import { getSeenDirectIds, SEEN_DIRECT_EVENT } from "@/lib/seen-direct";
import { getSeenSubmissionIds, SEEN_SUBMISSION_EVENT } from "@/lib/seen-submissions";
import { getSeenMyJobIds, SEEN_MY_JOBS_EVENT } from "@/lib/seen-my-jobs";
import LanguageSwitcher from "./language-switcher";

function UserAvatar({ name }: { name: string }) {
  return (
    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d7ff2f] text-[13px] font-black text-[#840031] select-none">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function AuthLinks({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  return (
    <>
      <Link
        href="/login"
        className={`flex h-9 items-center rounded-lg text-sm font-medium whitespace-nowrap transition-colors hover:bg-white/10 ${
          compact ? "px-2.5" : "px-4"
        }`}
      >
        {t("common.logIn")}
      </Link>
      <Link
        href="/signup"
        className={`flex h-9 items-center rounded-lg bg-[#d7ff2f] text-sm font-semibold whitespace-nowrap text-[#121212] transition-colors hover:bg-[#c8f020] ${
          compact ? "px-3" : "px-5"
        }`}
      >
        {t("common.signUp")}
      </Link>
    </>
  );
}

export default function MainHeader() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, isLoggedIn, logout } = useAuth();
  const { state } = useFlowchart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [seenDirectIds, setSeenDirectIds] = useState<Set<string>>(new Set());
  const [seenSubmissionIds, setSeenSubmissionIds] = useState<Set<string>>(new Set());
  const [seenMyJobIds, setSeenMyJobIds] = useState<Set<string>>(new Set());

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync application seen IDs
  useEffect(() => {
    const sync = () => setSeenIds(getSeenIds());
    sync();
    window.addEventListener(SEEN_CHANGE_EVENT, sync);
    return () => window.removeEventListener(SEEN_CHANGE_EVENT, sync);
  }, []);

  // Sync direct seen IDs
  useEffect(() => {
    const sync = () => setSeenDirectIds(new Set(getSeenDirectIds()));
    sync();
    window.addEventListener(SEEN_DIRECT_EVENT, sync);
    return () => window.removeEventListener(SEEN_DIRECT_EVENT, sync);
  }, []);

  // Sync submission seen IDs
  useEffect(() => {
    const sync = () => setSeenSubmissionIds(new Set(getSeenSubmissionIds()));
    sync();
    window.addEventListener(SEEN_SUBMISSION_EVENT, sync);
    return () => window.removeEventListener(SEEN_SUBMISSION_EVENT, sync);
  }, []);

  // Sync my-jobs seen IDs
  useEffect(() => {
    const sync = () => setSeenMyJobIds(new Set(getSeenMyJobIds()));
    sync();
    window.addEventListener(SEEN_MY_JOBS_EVENT, sync);
    return () => window.removeEventListener(SEEN_MY_JOBS_EVENT, sync);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applicationBadge = user
    ? liveApplicationBadgeCount(state, user.id, user.role, seenIds)
    : 0;
  const directBadge = user
    ? liveDirectBadgeCount(state, user.id, user.role, seenDirectIds)
    : 0;
  const myJobBadge = user
    ? liveMyJobBadgeCount(state, user.id, user.role, seenMyJobIds)
    : 0;
  const submissionBadge = user
    ? liveSubmissionBadgeCount(state, user.id, user.role, seenSubmissionIds)
    : 0;

  const navItems = [
    { label: t("nav.application"), href: "/applications", badge: applicationBadge },
    { label: t("nav.direct"),      href: "/direct",       badge: directBadge      },
    { label: t("nav.myJob"),       href: "/my-jobs",      badge: myJobBadge       },
    { label: t("nav.submission"),  href: "/submission",   badge: submissionBadge  },
    { label: t("nav.wallet"),      href: "/wallet",       badge: 0 },
  ];

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#8f0035] text-white shadow-md">
      {/* ── Main bar ── */}
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-8">

        {/* Logo – left column */}
        <Link href="/" className="flex items-center gap-2 shrink-0 col-start-1">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#d7ff2f] text-xs font-black text-[#840031]">
            ⬢
          </div>
          <span className="text-xl font-black tracking-tight max-[380px]:hidden">Solscale</span>
        </Link>

        {/* Desktop nav – centre column (logged-in only) */}
        {isLoggedIn && (
          <nav className="hidden md:flex col-start-2 items-center gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative flex items-center gap-2 rounded-lg px-4 py-2 transition-colors hover:bg-white/10"
              >
                {item.label}
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d7ff2f] px-1.5 text-[11px] font-black leading-none text-[#840031]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>
        )}

        {/* Desktop right actions – right column */}
        <div className="hidden md:flex col-start-3 items-center gap-2 justify-self-end">
          <LanguageSwitcher variant="light" />

          {isLoggedIn && user ? (
            /* ── User avatar + dropdown ── */
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/10"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <UserAvatar name={user.name} />
                <span className="max-w-[120px] truncate text-sm font-medium">{user.name}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-[#eee] bg-white py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.15)]">
                  {/* User info header */}
                  <div className="flex items-center gap-3 border-b border-[#f0f0f0] px-4 pb-3 pt-2.5">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#fce8ee] text-sm font-black text-[#9d003b]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-[#111]">{user.name}</p>
                      <p className="truncate text-[11px] text-[#888]">{user.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] transition-colors hover:bg-[#fafafa]"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#888]">
                        <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      {t("common.myProfile")}
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#333] transition-colors hover:bg-[#fafafa]"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#888]">
                        <rect x="2" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h11" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      {t("common.wallet")}
                    </Link>
                  </div>

                  {/* Divider + Logout */}
                  <div className="border-t border-[#f0f0f0] py-1">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#d00] transition-colors hover:bg-[#fff5f5]"
                    >
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#d00]">
                        <path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5L13.5 7.5 10 4.5M5.5 7.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t("common.logOut")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <AuthLinks />
          )}
        </div>

        {/* Mobile right: lang + auth CTAs, or lang + hamburger when logged in */}
        <div className="flex md:hidden col-start-3 items-center gap-1.5 justify-self-end">
          <LanguageSwitcher variant="light" />
          {isLoggedIn ? (
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg transition-colors hover:bg-white/10"
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          ) : (
            <AuthLinks compact />
          )}
        </div>
      </div>

      {/* ── Mobile dropdown menu (logged-in only) ── */}
      {isLoggedIn && user && mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#8f0035] px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
              >
                {item.label}
                {item.badge > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d7ff2f] px-1.5 text-[11px] font-black leading-none text-[#840031]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5 mb-1">
                <UserAvatar name={user.name} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold">{user.name}</p>
                  <p className="truncate text-[11px] text-white/60">{user.email}</p>
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="opacity-70">
                  <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {t("common.myProfile")}
              </Link>

              <Link
                href="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="opacity-70">
                  <rect x="2" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 7h11" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {t("common.wallet")}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[#ffaaaa] transition-colors hover:bg-white/10"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#ffaaaa]">
                  <path d="M5.5 13H3a1 1 0 01-1-1V3a1 1 0 011-1h2.5M10 10.5L13.5 7.5 10 4.5M5.5 7.5h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("common.logOut")}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
