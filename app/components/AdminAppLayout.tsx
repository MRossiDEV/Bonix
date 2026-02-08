"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type AdminAppLayoutProps = {
  children: React.ReactNode;
  basePath: string;
  adminName?: string;
  adminEmail?: string;
  adminInitials?: string;
};

type NavItem = {
  path: string;
  label: string;
  icon: (props: { active: boolean }) => React.ReactNode;
};

const navItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: ({ active }) => <GridIcon active={active} />,
  },
  {
    path: "/users",
    label: "Users",
    icon: ({ active }) => <UsersIcon active={active} />,
  },
  {
    path: "/merchants",
    label: "Merchants",
    icon: ({ active }) => <StoreIcon active={active} />,
  },
  {
    path: "/promos",
    label: "Promos",
    icon: ({ active }) => <TagIcon active={active} />,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: ({ active }) => <UserIcon active={active} />,
  },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/merchants": "Merchants",
  "/promos": "Promos",
  "/profile": "Profile",
};

const sideMenuItems = [
  { label: "Admin profile", path: "/profile" },
  { label: "Policy center", path: "/dashboard" },
  { label: "Risk monitor", path: "/dashboard" },
  { label: "Settings", path: "/profile" },
  { label: "Support", path: "/profile" },
];

export default function AdminAppLayout({
  children,
  basePath,
  adminName = "Bonix Admin",
  adminEmail = "admin@bonix.app",
  adminInitials = "BA",
}: AdminAppLayoutProps) {
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
    setSideMenuOpen(false);
    setAvatarMenuOpen(false);
  }, [pathname]);

  const handleActiveTabClick = (href: string) => {
    if (pathname && pathname.startsWith(href)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B0F14] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#22C55E]/18 blur-[120px]" />
        <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-[#14B8A6]/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#84CC16]/15 blur-[120px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#1F2937] bg-[#0B0F14]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setSideMenuOpen(true)}
            className="rounded-2xl border border-[#1F2937] bg-[#0F172A] p-2"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="flex-1 text-center">
            {currentTitle ? (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#94A3B8]">
                {currentTitle}
              </p>
            ) : (
              <p className="text-sm uppercase tracking-[0.4em] text-[#94A3B8]">
                bonix admin
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAvatarMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1F2937] bg-[#0F172A]"
            aria-label="Open admin menu"
          >
            <span className="text-xs font-semibold text-[#22C55E]">
              {adminInitials}
            </span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-xl pb-[calc(112px+env(safe-area-inset-bottom))] pt-20">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1F2937] bg-[#0B0F14]/95 backdrop-blur">
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
                    ? "text-[#22C55E]"
                    : "text-[#94A3B8] hover:text-[#F8FAFC]"
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
              className="flex h-full w-72 flex-col gap-6 border-r border-[#1F2937] bg-[#0F172A] px-6 py-8"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">
                  Bonix Admin
                </p>
                <p className="mt-3 text-lg font-semibold">{adminName}</p>
                <p className="text-sm text-[#94A3B8]">{adminEmail}</p>
              </div>

              <div className="flex flex-col gap-2">
                {resolvedSideMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                type="button"
                className="mt-auto rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#22C55E]"
              >
                Logout
              </button>
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
              className="absolute right-4 top-16 w-64 rounded-3xl border border-[#1F2937] bg-[#0F172A] p-4"
            >
              <p className="text-sm font-semibold">Quick menu</p>
              <div className="mt-4 space-y-2">
                <Link
                  href={`${normalizedBasePath}/profile`}
                  className="block rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
                >
                  View profile
                </Link>
                <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                    Active alerts
                  </p>
                  <p className="mt-2 text-lg font-semibold">7</p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#22C55E]"
                >
                  Logout
                </button>
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
      className="h-5 w-5 text-[#F8FAFC]"
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

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#22C55E]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#22C55E]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 11a4 4 0 10-8 0" />
      <path d="M2 20c1.8-3.6 5.2-5 8-5" />
      <circle cx="17" cy="8" r="3" />
      <path d="M16 19c1-2 2.9-3.5 5-4" />
    </svg>
  );
}

function StoreIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#22C55E]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l1.5-4.5h15L21 9" />
      <path d="M4 9v10h16V9" />
      <path d="M9 19v-6h6v6" />
    </svg>
  );
}

function TagIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#22C55E]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12l9 9 9-9-9-9H3v9z" />
      <circle cx="7" cy="7" r="1.5" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#22C55E]" : "text-current"}`}
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
