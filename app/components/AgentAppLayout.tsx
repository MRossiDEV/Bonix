"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

type AgentAppLayoutProps = {
  children: React.ReactNode;
  basePath: string;
  agentName?: string;
  agentEmail?: string;
  agentInitials?: string;
  agentAvatarUrl?: string;
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
    path: "/queue",
    label: "Queue",
    icon: ({ active }) => <InboxIcon active={active} />,
  },
  {
    path: "/audits",
    label: "Audits",
    icon: ({ active }) => <ClipboardIcon active={active} />,
  },
  {
    path: "/reports",
    label: "Reports",
    icon: ({ active }) => <ChartIcon active={active} />,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: ({ active }) => <UserIcon active={active} />,
  },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/queue": "Queue",
  "/audits": "Audits",
  "/reports": "Reports",
  "/profile": "Profile",
};

const sideMenuItems = [
  { label: "Agent profile", path: "/profile" },
  { label: "Escalations", path: "/queue" },
  { label: "Audit log", path: "/audits" },
  { label: "Settings", path: "/profile" },
  { label: "Support", path: "/profile" },
];

export default function AgentAppLayout({
  children,
  basePath,
  agentName = "Bonix Agent",
  agentEmail = "agent@bonix.app",
  agentInitials = "BA",
  agentAvatarUrl,
}: AgentAppLayoutProps) {
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#111827] text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#38BDF8]/20 blur-[120px]" />
        <div className="absolute top-1/3 -left-24 h-56 w-56 rounded-full bg-[#6366F1]/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#22D3EE]/15 blur-[120px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#1F2937] bg-[#0F172A]/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setSideMenuOpen(true)}
            className="rounded-2xl border border-[#1F2937] bg-[#111827] p-2"
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
                bonix agent
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setAvatarMenuOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1F2937] bg-[#111827]"
            aria-label="Open agent menu"
          >
            {agentAvatarUrl ? (
              <img
                src={agentAvatarUrl}
                alt="Agent avatar"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-[#38BDF8]">
                {agentInitials}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-xl pb-[calc(112px+env(safe-area-inset-bottom))] pt-20">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1F2937] bg-[#0F172A]/95 backdrop-blur">
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
                    ? "text-[#38BDF8]"
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
              className="flex h-full w-72 flex-col gap-6 border-r border-[#1F2937] bg-[#111827] px-6 py-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#0F172A] text-sm font-semibold text-[#38BDF8]">
                  {agentAvatarUrl ? (
                    <img
                      src={agentAvatarUrl}
                      alt="Agent avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    agentInitials
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[#94A3B8]">
                    Bonix Agent
                  </p>
                  <p className="mt-1 text-lg font-semibold">{agentName}</p>
                  <p className="text-sm text-[#94A3B8]">{agentEmail}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {resolvedSideMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <button
                type="button"
                className="mt-auto rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#38BDF8]"
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
              className="absolute right-4 top-16 w-64 rounded-3xl border border-[#1F2937] bg-[#111827] p-4"
            >
              <p className="text-sm font-semibold">Quick menu</p>
              <div className="mt-4 space-y-2">
                <Link
                  href={`${normalizedBasePath}/profile`}
                  className="block rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm"
                >
                  View profile
                </Link>
                <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                    Active queue
                  </p>
                  <p className="mt-2 text-lg font-semibold">18 cases</p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm text-[#38BDF8]"
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
      className={`h-5 w-5 ${active ? "text-[#38BDF8]" : "text-current"}`}
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

function InboxIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#38BDF8]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-5l-2 3H9l-2-3H2" />
      <path d="M5 6h14a2 2 0 012 2v8" />
      <path d="M3 14V8a2 2 0 012-2" />
    </svg>
  );
}

function ClipboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#38BDF8]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3h6a2 2 0 012 2v1h-2a2 2 0 01-2-2H11a2 2 0 01-2 2H7V5a2 2 0 012-2z" />
      <rect x="5" y="7" width="14" height="14" rx="2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#38BDF8]" : "text-current"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" />
      <rect x="12" y="7" width="3" height="10" />
      <rect x="17" y="9" width="3" height="8" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 ${active ? "text-[#38BDF8]" : "text-current"}`}
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
