"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";


import { LogoutButton } from "@/app/components/LogoutButton";

type AdminAppLayoutProps = {
  children: React.ReactNode;
  basePath: string;
  adminName?: string;
  adminEmail?: string;
  adminInitials?: string;
  adminAvatarUrl?: string;
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
    path: "/agents",
    label: "Agents",
    icon: ({ active }) => <AgentsIcon active={active} />,
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
  {
    path: "/settings",
    label: "Settings",
    icon: ({ active }) => <SettingsIcon active={active} />,
  },
];

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/users": "Users",
  "/merchants": "Merchants",
  "/agents": "Agents",
  "/promos": "Promos",
  "/profile": "Profile",
  "/settings": "Settings",
};

const workspaceItems = [
  { label: "Approvals", path: "/approvals", icon: <ApprovalIcon /> },
  { label: "Content & Categories", path: "/content", icon: <ContentIcon /> },
  { label: "Reports", path: "/reports", icon: <ReportIcon /> },
  { label: "System", path: "/system", icon: <SystemIcon /> },
  { label: "Audit Logs", path: "/audit-logs", icon: <AuditIcon /> },
];

export default function AdminAppLayout({
  children,
  basePath,
  adminName = "Bonix Admin",
  adminEmail = "admin@bonix.app",
  adminInitials = "BA",
  adminAvatarUrl,
}: AdminAppLayoutProps) {
  const pathname = usePathname();

  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const resolvedWorkspaceItems = useMemo(
    () =>
      workspaceItems.map((item) => ({
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
    if (avatarMenuOpen || sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [avatarMenuOpen, sidebarOpen]);

  const handleNavigation = (href: string) => {
    if (pathname?.startsWith(href)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    setSidebarOpen(false);
    setAvatarMenuOpen(false);
  };

  return (
    <div className="bonix-admin-shell">
      {/* Ambient background */}
      <div className="bonix-admin-background" aria-hidden="true">
        <div className="bonix-orb bonix-orb--lime" />
        <div className="bonix-orb bonix-orb--purple" />
        <div className="bonix-orb bonix-orb--blue" />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="bonix-mobile-overlay"
          />
        )}
      </AnimatePresence>

      {/* Desktop / mobile sidebar */}
      <aside
        className={`bonix-sidebar ${
          sidebarOpen ? "bonix-sidebar--open" : ""
        }`}
      >
        {/* Brand */}
        <div className="bonix-sidebar__brand">
          <Link
            href={`${normalizedBasePath}/dashboard`}
            onClick={() =>
              handleNavigation(`${normalizedBasePath}/dashboard`)
            }
            className="bonix-brand"
          >
            <span className="bonix-brand__mark">
              <span>B</span>
            </span>

            <span className="bonix-brand__copy">
              <span className="bonix-brand__name">BONIX</span>
              <span className="bonix-brand__label">Admin workspace</span>
            </span>
          </Link>

          <button
            type="button"
            className="bonix-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Main navigation */}
        <div className="bonix-sidebar__section">
          <p className="bonix-sidebar__eyebrow">Main</p>

          <nav className="bonix-navigation">
            {resolvedNavItems.map((item) => {
              const isActive = pathname
                ? pathname.startsWith(item.href)
                : false;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`bonix-nav-item ${
                    isActive ? "bonix-nav-item--active" : ""
                  }`}
                >
                  <span className="bonix-nav-item__icon">
                    {item.icon({ active: isActive })}
                  </span>

                  <span className="bonix-nav-item__label">
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.span
                      layoutId="bonix-active-indicator"
                      className="bonix-nav-item__indicator"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Workspace */}
        <div className="bonix-sidebar__section bonix-sidebar__workspace">
          <p className="bonix-sidebar__eyebrow">Workspace</p>

          <nav className="bonix-workspace-navigation">
            {resolvedWorkspaceItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className="bonix-workspace-item"
              >
                <span className="bonix-workspace-item__icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom account */}
        <div className="bonix-sidebar__footer">
          <div className="bonix-account">
            <div className="bonix-account__avatar">
              {adminAvatarUrl ? (
                <Image
                  src={adminAvatarUrl}
                  alt="Admin avatar"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{adminInitials}</span>
              )}

              <span className="bonix-account__status" />
            </div>

            <div className="bonix-account__info">
              <p>{adminName}</p>
              <span>{adminEmail}</span>
            </div>

            <button
              type="button"
              className="bonix-account__menu"
              onClick={() => setAvatarMenuOpen((open) => !open)}
              aria-label="Open account menu"
            >
              <MoreIcon />
            </button>
          </div>

          <LogoutButton className="bonix-logout">
            <LogoutIcon />
            <span>Log out</span>
          </LogoutButton>
        </div>
      </aside>

      {/* Main application */}
      <div className="bonix-main">
        {/* Topbar */}
        <header className="bonix-topbar">
          <div className="bonix-topbar__left">
            <button
              type="button"
              className="bonix-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon />
            </button>

            <div className="bonix-breadcrumb">
              <span>Bonix</span>
              <ChevronIcon />
              <strong>{currentTitle || "Workspace"}</strong>
            </div>
          </div>

          <div className="bonix-topbar__right">
            <button
              type="button"
              className="bonix-icon-button"
              aria-label="Notifications"
            >
              <BellIcon />
              <span className="bonix-notification-dot" />
            </button>

            <div className="bonix-topbar__divider" />

            <button
              type="button"
              onClick={() => setAvatarMenuOpen((open) => !open)}
              className="bonix-topbar-account"
              aria-label="Open admin menu"
            >
              <div className="bonix-topbar-account__avatar">
                {adminAvatarUrl ? (
                  <Image
                    src={adminAvatarUrl}
                    alt="Admin avatar"
                    width={34}
                    height={34}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{adminInitials}</span>
                )}
              </div>

              <div className="bonix-topbar-account__copy">
                <strong>{adminName}</strong>
                <span>Administrator</span>
              </div>

              <ChevronDownIcon />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="bonix-content">
          <div className="bonix-content__inner">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="bonix-mobile-nav">
        {resolvedNavItems
          .filter((item) =>
            ["/dashboard", "/users", "/merchants", "/promos"].includes(
              item.path,
            ),
          )
          .map((item) => {
            const isActive = pathname
              ? pathname.startsWith(item.href)
              : false;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`bonix-mobile-nav__item ${
                  isActive ? "bonix-mobile-nav__item--active" : ""
                }`}
              >
                {item.icon({ active: isActive })}
                <span>{item.label}</span>
              </Link>
            );
          })}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="bonix-mobile-nav__item"
        >
          <MoreIcon />
          <span>More</span>
        </button>
      </nav>

      {/* Account menu */}
      <AnimatePresence>
        {avatarMenuOpen && (
          <motion.div
            className="bonix-account-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAvatarMenuOpen(false)}
          >
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -12,
                scale: 0.98,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={(event) => event.stopPropagation()}
              className="bonix-account-menu"
            >
              <div className="bonix-account-menu__header">
                <div className="bonix-account-menu__avatar">
                  {adminAvatarUrl ? (
                    <Image
                      src={adminAvatarUrl}
                      alt="Admin avatar"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    adminInitials
                  )}
                </div>

                <div>
                  <strong>{adminName}</strong>
                  <span>{adminEmail}</span>
                </div>
              </div>

              <div className="bonix-account-menu__divider" />

              <Link
                href={`${normalizedBasePath}/profile`}
                onClick={() => setAvatarMenuOpen(false)}
                className="bonix-account-menu__item"
              >
                <UserIcon active={false} />
                <span>View profile</span>
              </Link>

              <Link
                href={`${normalizedBasePath}/settings`}
                onClick={() => setAvatarMenuOpen(false)}
                className="bonix-account-menu__item"
              >
                <SettingsIcon active={false} />
                <span>Settings</span>
              </Link>

              <div className="bonix-account-menu__alert">
                <div className="bonix-alert-dot" />
                <div>
                  <span>Active alerts</span>
                  <strong>7</strong>
                </div>
              </div>

              <LogoutButton className="bonix-account-menu__logout">
                <LogoutIcon />
                <span>Log out</span>
              </LogoutButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function UsersIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c1.4-3.5 3.7-5.2 6.5-5.2s5.1 1.7 6.5 5.2" />
      <circle cx="17" cy="8" r="2.5" />
      <path d="M15 15.5c2.2.4 3.9 1.8 5 4.5" />
    </svg>
  );
}

function StoreIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M9 20v-7h6v7" />
      <path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3" />
    </svg>
  );
}

function AgentsIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c1.2-3.5 3.3-5.2 6-5.2s4.8 1.7 6 5.2" />
      <path d="M14 15.5c2.7.3 4.7 1.8 6 4.5" />
    </svg>
  );
}

function TagIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <path d="M3 12V5a2 2 0 012-2h7l9 9-7 7-9-9z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 20c1.7-3.6 4.3-5.2 8-5.2s6.3 1.6 8 5.2" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={active ? "is-active" : ""}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.6V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1A2 2 0 113.2 17l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.6-1H2a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9L3.3 7A2 2 0 116.1 4.2l.1.1a1.7 1.7 0 001.9.3 1.7 1.7 0 001-1.6V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1A2 2 0 1120.9 7l-.1.1a1.7 1.7 0 00-.3 1.9 1.7 1.7 0 001.6 1h.1a2 2 0 110 4h-.1a1.7 1.7 0 00-1.6 1z" />
    </svg>
  );
}

function ApprovalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M5 12l4 4L19 6" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function ContentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 19V5" />
      <path d="M4 18h16" />
      <path d="M7 15l3-4 3 2 5-6" />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 8h10M7 12h5M7 16h7" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M5 4h14v16H5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M18 9a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M10 4H5v16h5" />
      <path d="M14 8l4 4-4 4" />
      <path d="M9 12h9" />
    </svg>
  );
}