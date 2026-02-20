"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";

type UserStatus = "Active" | "Suspended";
type UserRole = "User" | "Merchant" | "Agent" | "Admin";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  signupDate: string;
  lastActive: string;
  promosClaimed: number;
  reports: number;
};

const NOW = new Date("2026-02-08T00:00:00Z");

export default function AdminUsersPage({
  params,
}: Readonly<{ params: Promise<{ adminID: string }> }>) {
  const { adminID } = use(params);
  const basePath = `/admin/${adminID}`;

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "All">("All");
  const [status, setStatus] = useState<UserStatus | "All">("All");
  const [signupWindow, setSignupWindow] = useState<
    "All" | "7" | "30" | "90"
  >("30");

  const users: UserRecord[] = [
    {
      id: "u-1024",
      name: "Aurelia Brooks",
      email: "aurelia@bonix.app",
      role: "Merchant",
      status: "Active",
      signupDate: "2026-01-26",
      lastActive: "2 mins ago",
      promosClaimed: 12,
      reports: 0,
    },
    {
      id: "u-1025",
      name: "Mateo Diaz",
      email: "mateo@bonix.app",
      role: "User",
      status: "Suspended",
      signupDate: "2026-01-18",
      lastActive: "1 hour ago",
      promosClaimed: 4,
      reports: 2,
    },
    {
      id: "u-1026",
      name: "Naomi Clarke",
      email: "naomi@bonix.app",
      role: "Agent",
      status: "Active",
      signupDate: "2025-12-12",
      lastActive: "Yesterday",
      promosClaimed: 9,
      reports: 0,
    },
    {
      id: "u-1027",
      name: "Riley Morgan",
      email: "riley@bonix.app",
      role: "User",
      status: "Active",
      signupDate: "2026-02-02",
      lastActive: "Today",
      promosClaimed: 2,
      reports: 1,
    },
    {
      id: "u-1028",
      name: "Serena Wu",
      email: "serena@bonix.app",
      role: "Admin",
      status: "Active",
      signupDate: "2025-11-30",
      lastActive: "Yesterday",
      promosClaimed: 0,
      reports: 0,
    },
  ];

  const filteredUsers = useMemo(() => {
    const windowDays = signupWindow === "All" ? null : Number(signupWindow);
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = role === "All" || user.role === role;
      const matchesStatus = status === "All" || user.status === status;

      let matchesSignup = true;
      if (windowDays) {
        const signedUp = new Date(user.signupDate);
        const diffDays =
          (NOW.getTime() - signedUp.getTime()) / (1000 * 60 * 60 * 24);
        matchesSignup = diffDays <= windowDays;
      }

      return matchesSearch && matchesRole && matchesStatus && matchesSignup;
    });
  }, [users, role, search, signupWindow, status]);

  const totalActive = users.filter((user) => user.status === "Active").length;
  const totalSuspended = users.filter(
    (user) => user.status === "Suspended",
  ).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <h1 className="text-2xl font-semibold">User management</h1>
        <p className="mt-2 text-sm text-[#94A3B8]">
          Powerful and safe. Search, review, and take action.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
              Total users
            </p>
            <p className="mt-2 text-2xl font-semibold">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
              Active
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalActive}</p>
          </div>
          <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
              Suspended
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalSuspended}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-lg font-semibold">Search and filters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-[#94A3B8]">
            Name or email
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email"
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#F8FAFC]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-[#94A3B8]">
            Role
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as UserRole | "All")
              }
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#F8FAFC]"
            >
              <option value="All">All roles</option>
              <option value="User">User</option>
              <option value="Merchant">Merchant</option>
              <option value="Agent">Agent</option>
              <option value="Admin">Admin</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-[#94A3B8]">
            Status
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as UserStatus | "All")
              }
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#F8FAFC]"
            >
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-[#94A3B8]">
            Signup date
            <select
              value={signupWindow}
              onChange={(event) =>
                setSignupWindow(
                  event.target.value as "All" | "7" | "30" | "90",
                )
              }
              className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm text-[#F8FAFC]"
            >
              <option value="All">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        {filteredUsers.map((user) => (
          <Link
            key={user.id}
            href={`${basePath}/users/${user.id}`}
            className="block rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5 transition hover:border-[#22C55E]/50"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">{user.email}</p>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Signed up {user.signupDate} · Last active {user.lastActive}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.status === "Suspended"
                      ? "bg-[#F97316] text-[#0B0F14]"
                      : "bg-[#22C55E] text-[#0B0F14]"
                  }`}
                >
                  {user.status}
                </span>
                <span className="rounded-full border border-[#1F2937] px-3 py-1 text-xs text-[#94A3B8]">
                  {user.role}
                </span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                  Promos claimed
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {user.promosClaimed}
                </p>
              </div>
              <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                  Reports
                </p>
                <p className="mt-2 text-lg font-semibold">{user.reports}</p>
              </div>
              <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-[#94A3B8]">
                  Role
                </p>
                <p className="mt-2 text-lg font-semibold">{user.role}</p>
              </div>
            </div>
          </Link>
        ))}
        {filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#1F2937] bg-[#0F172A] p-6 text-center text-sm text-[#94A3B8]">
            No users match those filters.
          </div>
        ) : null}
      </section>
    </div>
  );
}
