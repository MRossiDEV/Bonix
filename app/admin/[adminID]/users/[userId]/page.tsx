"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";

type UserRole = "User" | "Merchant" | "Agent" | "Admin";

type UserStatus = "Active" | "Suspended";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roles: UserRole[];
  signupDate: string;
  lastActive: string;
  promosClaimed: number;
  reports: number;
  merchantActivity?: string;
  agentActivity?: string;
};

type PendingAction =
  | { type: "suspend" }
  | { type: "reactivate" }
  | { type: "force-reset" }
  | { type: "toggle-role"; role: UserRole };

const mockProfiles: UserProfile[] = [
  {
    id: "u-1024",
    name: "Aurelia Brooks",
    email: "aurelia@bonix.app",
    status: "Active",
    roles: ["Merchant"],
    signupDate: "2026-01-26",
    lastActive: "2 mins ago",
    promosClaimed: 12,
    reports: 0,
    merchantActivity: "Running 3 promos · 120 claims",
  },
  {
    id: "u-1025",
    name: "Mateo Diaz",
    email: "mateo@bonix.app",
    status: "Suspended",
    roles: ["User"],
    signupDate: "2026-01-18",
    lastActive: "1 hour ago",
    promosClaimed: 4,
    reports: 2,
  },
  {
    id: "u-1026",
    name: "Naomi Clarke",
    email: "naomi@bonix.app",
    status: "Active",
    roles: ["Agent", "User"],
    signupDate: "2025-12-12",
    lastActive: "Yesterday",
    promosClaimed: 9,
    reports: 0,
    agentActivity: "Queue audits: 6 pending",
  },
  {
    id: "u-1027",
    name: "Riley Morgan",
    email: "riley@bonix.app",
    status: "Active",
    roles: ["User"],
    signupDate: "2026-02-02",
    lastActive: "Today",
    promosClaimed: 2,
    reports: 1,
  },
  {
    id: "u-1028",
    name: "Serena Wu",
    email: "serena@bonix.app",
    status: "Active",
    roles: ["Admin"],
    signupDate: "2025-11-30",
    lastActive: "Yesterday",
    promosClaimed: 0,
    reports: 0,
  },
];

const allRoles: UserRole[] = ["User", "Merchant", "Agent", "Admin"];

export default function AdminUserProfilePage({
  params,
}: Readonly<{ params: Promise<{ adminID: string; userId: string }> }>) {
  const { adminID, userId } = use(params);
  const basePath = `/admin/${adminID}`;

  const profile = useMemo(() => {
    return (
      mockProfiles.find((item) => item.id === userId) ??
      mockProfiles[0]
    );
  }, [userId]);

  const [status, setStatus] = useState<UserStatus>(profile.status);
  const [roles, setRoles] = useState<UserRole[]>(profile.roles);
  const [passwordResetQueued, setPasswordResetQueued] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const handleConfirm = () => {
    if (!pendingAction) return;

    if (pendingAction.type === "suspend") {
      setStatus("Suspended");
    }

    if (pendingAction.type === "reactivate") {
      setStatus("Active");
    }

    if (pendingAction.type === "force-reset") {
      setPasswordResetQueued(true);
    }

    if (pendingAction.type === "toggle-role") {
      const role = pendingAction.role;
      if (roles.includes(role)) {
        setRoles(roles.filter((item) => item !== role));
      } else {
        setRoles([...roles, role]);
      }
    }

    setPendingAction(null);
  };

  const actionLabel = useMemo(() => {
    if (!pendingAction) return "";
    if (pendingAction.type === "suspend") return "Suspend account";
    if (pendingAction.type === "reactivate") return "Reactivate account";
    if (pendingAction.type === "force-reset") return "Force password reset";
    if (pendingAction.type === "toggle-role") {
      return roles.includes(pendingAction.role)
        ? `Remove ${pendingAction.role} role`
        : `Add ${pendingAction.role} role`;
    }
    return "";
  }, [pendingAction, roles]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
              User profile
            </p>
            <h1 className="mt-3 text-2xl font-semibold">{profile.name}</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">{profile.email}</p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Signed up {profile.signupDate} · Last active {profile.lastActive}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              status === "Suspended"
                ? "bg-[#F97316] text-[#0B0F14]"
                : "bg-[#22C55E] text-[#0B0F14]"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {roles.map((role) => (
            <span
              key={role}
              className="rounded-full border border-[#1F2937] px-3 py-1 text-xs text-[#94A3B8]"
            >
              {role}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-lg font-semibold">Activity summary</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                Promos claimed
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {profile.promosClaimed}
              </p>
            </div>
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                Reports
              </p>
              <p className="mt-2 text-2xl font-semibold">{profile.reports}</p>
            </div>
            {profile.merchantActivity ? (
              <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#94A3B8]">
                {profile.merchantActivity}
              </div>
            ) : null}
            {profile.agentActivity ? (
              <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#94A3B8]">
                {profile.agentActivity}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-lg font-semibold">Role management</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Manually add or remove roles
          </p>
          <div className="mt-4 space-y-3">
            {allRoles.map((role) => {
              const hasRole = roles.includes(role);
              return (
                <div
                  key={role}
                  className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
                >
                  <span className="text-[#F8FAFC]">{role}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAction({ type: "toggle-role", role })
                    }
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      hasRole
                        ? "bg-[#F97316] text-[#0B0F14]"
                        : "bg-[#22C55E] text-[#0B0F14]"
                    }`}
                  >
                    {hasRole ? "Remove" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Account actions</h2>
        <p className="mt-1 text-sm text-[#94A3B8]">
          Destructive actions require confirmation.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setPendingAction(
                status === "Suspended" ? { type: "reactivate" } : { type: "suspend" },
              )
            }
            className={`rounded-2xl border border-[#1F2937] px-4 py-3 text-sm font-semibold ${
              status === "Suspended"
                ? "bg-[#22C55E] text-[#0B0F14]"
                : "bg-[#F97316] text-[#0B0F14]"
            }`}
          >
            {status === "Suspended" ? "Reactivate account" : "Suspend account"}
          </button>
          <button
            type="button"
            onClick={() => setPendingAction({ type: "force-reset" })}
            className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm font-semibold text-[#F8FAFC]"
          >
            Force password reset
          </button>
        </div>
        {passwordResetQueued ? (
          <div className="mt-4 rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#94A3B8]">
            Password reset has been queued and the user will be prompted on next
            login.
          </div>
        ) : null}
        <div className="mt-4 rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#94A3B8]">
          <p>
            Admin actions are logged in the audit trail.{" "}
            <Link href={`${basePath}/audit-logs`} className="text-[#22C55E]">
              View audit logs
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Guardrails</h2>
        <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
          <li>Destructive actions require confirmation.</li>
          <li>Role changes are logged and reversible.</li>
          <li>Audit Logs capture who did what and when.</li>
        </ul>
      </section>

      {pendingAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-[#94A3B8]">
              Confirm action
            </p>
            <h3 className="mt-2 text-lg font-semibold">{actionLabel}</h3>
            <p className="mt-2 text-sm text-[#94A3B8]">
              This action is logged and can impact user access.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingAction(null)}
                className="flex-1 rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 rounded-2xl bg-[#22C55E] px-4 py-3 text-sm font-semibold text-[#0B0F14]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
