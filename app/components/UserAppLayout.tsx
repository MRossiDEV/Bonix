"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { LogoutButton } from "@/app/components/LogoutButton";

type UserAppLayoutProps = {
  children: React.ReactNode;
  basePath: string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userAvatarUrl?: string;
  hideBottomNav?: boolean;
  topBarHidden?: boolean;
  fullBleed?: boolean;
};

type NavItem = {
  path: string;
  label: string;
  icon: (props: { active: boolean }) => React.ReactNode;
};

const navItems: NavItem[] = [
  {
    path: "/feed",
    label: "Discover",
    icon: ({ active }) => <HomeIcon active={active} />,
  },
  {
    path: "/city",
    label: "My City",
    icon: ({ active }) => <CityIcon active={active} />,
  },
  {
    path: "/promo",
    label: "Promos",
    icon: ({ active }) => <BookmarkIcon active={active} />,
  },
  {
    path: "/wallet",
    label: "Wallet",
    icon: ({ active }) => <WalletIcon active={active} />,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: ({ active }) => <UserIcon active={active} />,
  },
];

const pageTitles: Record<string, string> = {
  "/feed": "",
  "/city": "",
  "/reservations": "Reservations",
  "/wallet": "Wallet",
  "/profile": "Profile",
};

const sideMenuItems = [
  {
    label: "My City",
    path: "/city",
    icon: <CityIcon active={false} />,
  },
  {
    label: "Discover",
    path: "/feed",
    icon: <HomeIcon active={false} />,
  },
  {
    label: "My Reservations",
    path: "/reservations",
    icon: <BookmarkIcon active={false} />,
  },
  {
    label: "Wallet",
    path: "/wallet",
    icon: <WalletIcon active={false} />,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: <UserIcon active={false} />,
  },
];

export default function UserAppLayout({
  children,
  basePath,
  userName = "Aurelia Brooks",
  userEmail = "aurelia@bonix.app",
  userInitials = "AB",
  userAvatarUrl,
  hideBottomNav = false,
  topBarHidden = false,
  fullBleed = false,
}: UserAppLayoutProps) {
  const pathname = usePathname();

  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const normalizedBasePath = basePath.endsWith("/")
    ? basePath.slice(0, -1)
    : basePath;

  const resolvedNavItems = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        href: `${normalizedBasePath}${item.path}`,
      })),
    [normalizedBasePath],
  );

  const resolvedSideMenuItems = useMemo(
    () =>
      sideMenuItems.map((item) => ({
        ...item,
        href: `${normalizedBasePath}${item.path}`,
      })),
    [normalizedBasePath],
  );

  const currentTitle = useMemo(() => {
    if (!pathname) return "";

    const match = Object.keys(pageTitles).find((path) =>
      pathname.startsWith(`${normalizedBasePath}${path}`),
    );

    return match ? pageTitles[match] : "";
  }, [normalizedBasePath, pathname]);

  useEffect(() => {
    const shouldLock = sideMenuOpen || avatarMenuOpen;

    if (shouldLock) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sideMenuOpen, avatarMenuOpen]);

  const prevPathnameRef = useRef(pathname);

  if (prevPathnameRef.current !== pathname) {
    prevPathnameRef.current = pathname;

    if (sideMenuOpen) setSideMenuOpen(false);
    if (avatarMenuOpen) setAvatarMenuOpen(false);
  }

  const handleActiveTabClick = (href: string) => {
    if (pathname && pathname.startsWith(href)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (sideMenuOpen) setSideMenuOpen(false);
    if (avatarMenuOpen) setAvatarMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0F14] text-[#F8FAFC]">

      {/* ============================================================
          AMBIENT BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#22C55E]/8 blur-[120px]" />

        <div className="absolute left-[-120px] top-1/3 h-64 w-64 rounded-full bg-[#14B8A6]/6 blur-[120px]" />

        <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-[#22C55E]/5 blur-[120px]" />
      </div>

      {/* ============================================================
          TOP BAR
      ============================================================ */}

      {topBarHidden ? null : (
        <header className="fixed inset-x-0 top-0 z-40 border-b border-[#1F2937] bg-[#0B0F14]/90 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] w-full max-w-xl items-center justify-between px-4 sm:px-6">

          {/* Menu */}

          <button
            type="button"
            onClick={() => setSideMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1F2937] bg-[#111827] text-[#94A3B8] transition hover:border-[#22C55E]/30 hover:text-white"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Logo / Page */}

          <Link
            href={`${normalizedBasePath}/feed`}
            className="flex flex-col items-center justify-center"
          >
            {currentTitle ? (
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8FAFC]">
                {currentTitle}
              </span>
            ) : (
              <>
                <span className="text-[15px] font-black tracking-[0.28em] text-[#F8FAFC]">
                  BONIX
                </span>

                <span className="mt-0.5 text-[8px] font-semibold uppercase tracking-[0.24em] text-[#64748B]">
                  Your city
                </span>
              </>
            )}
          </Link>

          {/* Avatar */}

          <button
            type="button"
            onClick={() => setAvatarMenuOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#1F2937] bg-[#111827] transition hover:border-[#22C55E]/40"
            aria-label="Open profile menu"
          >
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt="User avatar"
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="text-[11px] font-bold text-[#22C55E]">
                {userInitials}
              </span>
            )}

            {/* Online indicator */}

            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F14] bg-[#22C55E]" />
          </button>
        </div>
      </header>
      )}

      {/* ============================================================
          MAIN
      ============================================================ */}

      <main
        className={`relative z-10 ${
          fullBleed ? "" : "mx-auto w-full max-w-xl"
        } min-h-screen ${
          hideBottomNav
            ? "pb-8"
            : "pb-[calc(108px+env(safe-area-inset-bottom))]"
        } ${topBarHidden ? "pt-0" : "pt-[84px]"}`}
      >
        {children}
      </main>

      {/* ============================================================
          MOBILE BOTTOM NAV
      ============================================================ */}

      {!hideBottomNav ? (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1F2937] bg-[#0B0F14]/95 backdrop-blur-xl">

          <div className="mx-auto flex w-full max-w-xl items-end px-2 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2">

            {resolvedNavItems.map((item) => {
              const isActive = pathname
                ? pathname.startsWith(item.href)
                : false;

              const isCity = item.path === "/city";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleActiveTabClick(item.href)}
                  className="relative flex flex-1 flex-col items-center gap-1"
                >
                  {/* Special City button */}

                  {isCity ? (
                    <div
                      className={`relative -mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#0B0F14] transition ${
                        isActive
                          ? "bg-[#22C55E] text-[#041007] shadow-[0_0_24px_rgba(34,197,94,0.25)]"
                          : "bg-[#111827] text-[#94A3B8]"
                      }`}
                    >
                      {item.icon({ active: isActive })}

                      {/* City activity indicator */}

                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#0B0F14] bg-[#22C55E]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#041007]" />
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                        isActive
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "text-[#64748B]"
                      }`}
                    >
                      {item.icon({ active: isActive })}
                    </div>
                  )}

                  <span
                    className={`text-[10px] font-semibold ${
                      isActive
                        ? "text-[#22C55E]"
                        : "text-[#64748B]"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}

      {/* ============================================================
          SIDE MENU
      ============================================================ */}

      <AnimatePresence>
        {sideMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setSideMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
              }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-full w-[min(86vw,340px)] flex-col border-r border-[#1F2937] bg-[#0F172A] px-5 py-6"
            >

              {/* Profile */}

              <div className="rounded-3xl border border-[#1F2937] bg-[#111827] p-4">

                <div className="flex items-center gap-3">

                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#0B0F14] text-sm font-bold text-[#22C55E]">

                    {userAvatarUrl ? (
                      <Image
                        src={userAvatarUrl}
                        alt="User avatar"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitials
                    )}

                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-[#111827] bg-[#22C55E]" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {userName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#64748B]">
                      {userEmail}
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#22C55E]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                      Bonix Member
                    </div>
                  </div>
                </div>

                {/* City progress */}

                <div className="mt-4 border-t border-[#1F2937] pt-4">

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                      My City
                    </span>

                    <span className="text-[10px] font-semibold text-[#22C55E]">
                      Level 2
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
                    <div className="h-full w-[80%] rounded-full bg-[#22C55E]" />
                  </div>

                  <p className="mt-2 text-[10px] text-[#64748B]">
                    8 / 10 spots unlocked
                  </p>
                </div>
              </div>

              {/* Navigation */}

              <div className="mt-6 flex flex-col gap-1">

                <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
                  Explore
                </p>

                {resolvedSideMenuItems.map((item) => {
                  const isActive = pathname
                    ? pathname.startsWith(item.href)
                    : false;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setSideMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold transition ${
                        isActive
                          ? "bg-[#22C55E]/10 text-[#22C55E]"
                          : "text-[#94A3B8] hover:bg-[#111827] hover:text-[#F8FAFC]"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-[#22C55E]/10"
                            : "bg-[#111827]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.label}</span>

                      {isActive ? (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              {/* Bottom */}

              <div className="mt-auto space-y-3">

                <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                    Bonix
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#94A3B8]">
                    Discover places. Grow your city.
                  </p>
                </div>

                <LogoutButton className="w-full rounded-2xl border border-red-500/10 bg-red-500/5 px-4 py-3.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10">
                  Logout
                </LogoutButton>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ============================================================
          AVATAR QUICK MENU
      ============================================================ */}

      <AnimatePresence>
        {avatarMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => setAvatarMenuOpen(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -8,
                scale: 0.97,
              }}
              transition={{ duration: 0.18 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-4 top-[74px] w-64 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-3 shadow-2xl"
            >

              <div className="border-b border-[#1F2937] px-3 pb-3">
                <p className="text-sm font-bold">
                  {userName}
                </p>

                <p className="mt-0.5 text-xs text-[#64748B]">
                  {userEmail}
                </p>
              </div>

              <div className="mt-3 space-y-1">

                <Link
                  href={`${normalizedBasePath}/city`}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[#94A3B8] transition hover:bg-[#111827] hover:text-white"
                >
                  <span className="text-lg">🏙️</span>
                  My City
                </Link>

                <Link
                  href={`${normalizedBasePath}/profile`}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-[#94A3B8] transition hover:bg-[#111827] hover:text-white"
                >
                  <span className="text-lg">👤</span>
                  View profile
                </Link>

                <Link
                  href={`${normalizedBasePath}/wallet`}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-3 py-3 transition hover:bg-[#111827]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">💳</span>

                    <span className="text-sm font-medium text-[#94A3B8]">
                      Wallet
                    </span>
                  </div>

                  <span className="text-sm font-bold text-[#F8FAFC]">
                    $248.60
                  </span>
                </Link>

                <div className="my-2 border-t border-[#1F2937]" />

                <LogoutButton className="w-full rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/5">
                  Logout
                </LogoutButton>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================
   ICONS
================================================================ */

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="h-5 w-5"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${
        active ? "text-[#22C55E]" : "text-current"
      }`}
    >
      <path d="m3.5 10 8.5-7 8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-6h5v6" />
    </svg>
  );
}

function CityIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-6 w-6 ${
        active ? "text-current" : "text-current"
      }`}
    >
      <path d="M4 20V9l6-3v14" />
      <path d="M10 20V4l6 3v13" />
      <path d="M16 20v-8l4 2v6" />
      <path d="M7 12h1" />
      <path d="M7 15h1" />
      <path d="M13 9h1" />
      <path d="M13 12h1" />
      <path d="M13 15h1" />
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${
        active ? "text-[#22C55E]" : "text-current"
      }`}
    >
      <path d="M6 4h12v16l-6-4-6 4z" />
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${
        active ? "text-[#22C55E]" : "text-current"
      }`}
    >
      <path d="M3 7h18v11H3z" />
      <path d="M17 11h2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h9l3 4" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${
        active ? "text-[#22C55E]" : "text-current"
      }`}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-3.6 5-5 8-5s6.2 1.4 8 5" />
    </svg>
  );
}