"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { LogoutButton } from "@/app/components/LogoutButton";

type UserAppLayoutProps = {
  children: React.ReactNode;
  basePath: string;
  userName?: string;
  userEmail?: string;
  userInitials?: string;
  userAvatarUrl?: string;
};

type NavItem = {
  path: string;
  label: string;
  icon: (props: { active: boolean }) => React.ReactNode;
};

const navItems: NavItem[] = [
  {
    path: "/feed",
    label: "Feed",
    icon: ({ active }) => <HomeIcon active={active} />,
  },
  {
    path: "/reservations",
    label: "Reservations",
    icon: ({ active }) => <BookmarkIcon active={active} />,
  },
  {
    path: "/wallet",
    label: "Wallet",
    icon: ({ active }) => <WalletIcon active={active} />,
  },
  {
    path: "/nearby",
    label: "Nearby",
    icon: ({ active }) => <MapPinIcon active={active} />,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: ({ active }) => <UserIcon active={active} />,
  },
];

const pageTitles: Record<string, string> = {
  "/feed": "",
  "/reservations": "Reservations",
  "/wallet": "Wallet",
  "/nearby": "Nearby",
  "/profile": "Profile",
};

const sideMenuItems = [
  { label: "Profile", path: "/profile" },
  { label: "Wallet", path: "/wallet" },
  { label: "My Reservations", path: "/reservations" },
  { label: "Settings", path: "/profile" },
  { label: "Help / Support", path: "/profile" },
];

export default function UserAppLayout({
  children,
  basePath,
  userName = "Aurelia Brooks",
  userEmail = "aurelia@bonix.app",
  userInitials = "AB",
  userAvatarUrl,
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

  useEffect(() => {
    if (sideMenuOpen) setSideMenuOpen(false);
    if (avatarMenuOpen) setAvatarMenuOpen(false);
  }, [pathname]);

  const handleActiveTabClick = (href: string) => {
    if (pathname && pathname.startsWith(href)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (sideMenuOpen) setSideMenuOpen(false);
    if (avatarMenuOpen) setAvatarMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#121212] text-[#FAFAFA]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#FF7A00]/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-[#00E5A8]/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#7B61FF]/20 blur-[120px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#2A2A2A] bg-[#121212]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setSideMenuOpen(true)}
            className="rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] p-2"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="flex-1 text-center">
            {currentTitle ? (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#9CA3AF]">
                {currentTitle}
              </p>
            ) : (
              <p className="text-sm uppercase tracking-[0.4em] text-[#9CA3AF]">
                bonix
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAvatarMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#1E1E1E]"
            aria-label="Open profile menu"
          >
            {userAvatarUrl ? (
              <Image
                src={userAvatarUrl}
                alt="User avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-[#FF7A00]">
                {userInitials}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-xl pb-[calc(112px+env(safe-area-inset-bottom))] pt-20">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2A2A2A] bg-[#121212]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
          {resolvedNavItems.map((item) => {
            const isActive = pathname ? pathname.startsWith(item.href) : false;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleActiveTabClick(item.href)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium transition ${
                  isActive
                    ? "text-[#FF7A00]"
                    : "text-[#9CA3AF] hover:text-[#FAFAFA]"
                }`}
              >
                {item.icon({ active: isActive })}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {sideMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setSideMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-full w-72 flex-col gap-6 border-r border-[#2A2A2A] bg-[#1E1E1E] px-6 py-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#121212] text-sm font-semibold text-[#FF7A00]">
                  {userAvatarUrl ? (
                    <Image
                      src={userAvatarUrl}
                      alt="User avatar"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#9CA3AF]">
                    Bonix
                  </p>
                  <p className="mt-1 text-lg font-semibold">{userName}</p>
                  <p className="text-sm text-[#9CA3AF]">{userEmail}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {resolvedSideMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setSideMenuOpen(false)}
                    className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <LogoutButton className="mt-auto rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FF7A00]">
                Logout
              </LogoutButton>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-4 top-16 w-64 rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-4"
            >
              <p className="text-sm font-semibold">Quick menu</p>
              <div className="mt-4 space-y-2">
                <Link
                  href={`${normalizedBasePath}/profile`}
                  onClick={() => setAvatarMenuOpen(false)}
                  className="block rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
                >
                  View profile
                </Link>
                <div className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                    Wallet balance
                  </p>
                  <p className="mt-2 text-lg font-semibold">$248.60</p>
                </div>
                <LogoutButton className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#FF7A00]">
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

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[#FAFAFA]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
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
      className={`h-5 w-5 ${active ? "text-[#FF7A00]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

function BookmarkIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#FF7A00]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
      className={`h-5 w-5 ${active ? "text-[#FF7A00]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7h18v10H3z" />
      <path d="M17 11h2" />
      <path d="M3 7l3-3h12l3 3" />
    </svg>
  );
}

function MapPinIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#FF7A00]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#FF7A00]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-3.6 5.2-5 8-5s6.2 1.4 8 5" />
    </svg>
  );
}
