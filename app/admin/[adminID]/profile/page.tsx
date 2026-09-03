import Link from "next/link";
import Image from "next/image";

import { LogoutButton } from "@/app/components/LogoutButton";

import {
  getAuthProfile,
  getIdentityMetadataUpdates,
} from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

type MerchantProfile = {
  id: string;
  business_name: string | null;
  status: string;
};

function isMerchantAcceptedStatus(
  status: string | null | undefined,
): boolean {
  const normalized = String(status ?? "").toUpperCase();

  return normalized === "ACTIVE" || normalized === "APPROVED";
}

function StatusDot({
  status,
}: {
  status: "active" | "pending" | "neutral" | "danger";
}) {
  const styles = {
    active: "bg-[#22C55E]",
    pending: "bg-[#F59E0B]",
    neutral: "bg-[#64748B]",
    danger: "bg-[#EF4444]",
  };

  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${styles[status]}`}
    />
  );
}

function SectionIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#22C55E]">
      {children}
    </div>
  );
}

export default async function AdminProfilePage({
  params,
}: Readonly<{ params: Promise<{ adminID: string }> }>) {
  const { adminID } = await params;

  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  const { data: merchantRecords } = await supabase
    .from("merchants")
    .select("id, business_name, status")
    .eq("user_id", data.user?.id ?? "")
    .order("created_at", { ascending: false });

  const updates = getIdentityMetadataUpdates(data.user);

  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }

  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Admin",
    fallbackEmail: "admin@bonix.app",
  });

  const merchants = (merchantRecords ?? []) as MerchantProfile[];

  const activeMerchants = merchants.filter((merchant) =>
    isMerchantAcceptedStatus(merchant.status),
  );

  const isMerchantActive = activeMerchants.length > 0;

  const isMerchantApply = merchants.length === 0;

  const merchantStatusLabel = isMerchantApply
    ? "APPLY"
    : merchants.some((merchant) => merchant.status === "PENDING")
      ? "PENDING APPROVAL"
      : merchants.every(
            (merchant) => merchant.status === "REJECTED",
          )
        ? "REJECTED"
        : isMerchantActive
          ? "ACCEPTED"
          : "INACTIVE";

  const settings = [
    {
      title: "Compliance",
      description: "Account verification and platform requirements",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 3 4.5 6v5.5c0 4.6 3 7.9 7.5 9.5 4.5-1.6 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m8.5 12 2.2 2.2 4.8-4.8" />
        </svg>
      ),
    },
    {
      title: "Security",
      description: "Authentication, sessions and account protection",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
        </svg>
      ),
    },
    {
      title: "Risk Alerts",
      description: "Platform warnings and administrative notifications",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M10.3 4.8 2.9 18a2 2 0 0 0 1.7 3h14.8a2 2 0 0 0 1.7-3L13.7 4.8a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      ),
    },
    {
      title: "Support",
      description: "Get help with your Bonix administrator account",
      icon: (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 12a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2" />
          <path d="M4 14H3a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1" />
          <path d="M20 14h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1" />
          <path d="M16 19c-.7 1.2-2 2-4 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative space-y-6 pb-8">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-[#22C55E]/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#14B8A6]/5 blur-[120px]" />

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#22C55E10,transparent_45%)]" />

        <div className="relative p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#334155] bg-[#0B0F14] text-2xl font-bold text-[#22C55E] shadow-xl sm:h-24 sm:w-24">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt="Admin avatar"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.initials
                )}
              </div>

              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border-4 border-[#0F172A] bg-[#22C55E]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#04110A]" />
              </span>
            </div>

            {/* Identity */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-[#F8FAFC]">
                  {profile.name}
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#22C55E]">
                  <StatusDot status="active" />
                  Admin
                </span>
              </div>

              <p className="mt-1 text-sm text-[#94A3B8]">
                {profile.email}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg border border-[#1F2937] bg-[#0B0F14] px-2.5 py-1 text-[11px] text-[#64748B]">
                  Administrator
                </span>

                <span className="rounded-lg border border-[#1F2937] bg-[#0B0F14] px-2.5 py-1 text-[11px] text-[#64748B]">
                  Platform access
                </span>
              </div>
            </div>

            {/* Account status */}
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 sm:min-w-[150px]">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Account
              </p>

              <div className="mt-2 flex items-center gap-2">
                <StatusDot status="active" />
                <span className="text-sm font-medium text-[#F8FAFC]">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account overview */}
      <section className="relative grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4">
          <p className="text-xs text-[#64748B]">Current Role</p>

          <p className="mt-2 text-lg font-bold text-[#F8FAFC]">
            Admin
          </p>

          <p className="mt-1 text-[11px] text-[#22C55E]">
            Full platform access
          </p>
        </div>

        <div className="rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4">
          <p className="text-xs text-[#64748B]">
            Merchant Workspaces
          </p>

          <p className="mt-2 text-lg font-bold text-[#F8FAFC]">
            {activeMerchants.length}
          </p>

          <p className="mt-1 text-[11px] text-[#94A3B8]">
            Accepted businesses
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4 sm:col-span-1">
          <p className="text-xs text-[#64748B]">
            Merchant Status
          </p>

          <div className="mt-2 flex items-center gap-2">
            <StatusDot
              status={
                isMerchantActive
                  ? "active"
                  : isMerchantApply
                    ? "neutral"
                    : merchantStatusLabel === "PENDING APPROVAL"
                      ? "pending"
                      : "danger"
              }
            />

            <p className="text-sm font-bold text-[#F8FAFC]">
              {merchantStatusLabel}
            </p>
          </div>

          <p className="mt-1 text-[11px] text-[#94A3B8]">
            Merchant workspace access
          </p>
        </div>
      </section>

      {/* Role switch */}
      <section className="relative overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
        <div className="border-b border-[#1F2937] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SectionIcon>
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M7 7h10M7 17h10" />
                  <path d="m14 4 3 3-3 3M10 14l-3 3 3 3" />
                </svg>
              </SectionIcon>

              <div>
                <h2 className="text-base font-semibold text-[#F8FAFC]">
                  Switch workspace
                </h2>

                <p className="mt-0.5 text-xs text-[#64748B]">
                  Jump between the roles available to this account.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#22C55E]">
              <StatusDot status="active" />
              Current: Admin
            </span>
          </div>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Merchant */}
          {isMerchantActive ? (
            <Link
              href={`/merchant/${adminID}/profile`}
              className="group relative overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4 transition hover:border-[#22C55E]/30 hover:bg-[#111827]"
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#22C55E]/5 blur-2xl transition group-hover:bg-[#22C55E]/10" />

              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M4 10h16v10H4z" />
                    <path d="M3 10 5 4h14l2 6" />
                    <path d="M8 14h8M8 18h5" />
                  </svg>
                </div>

                <span className="rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2 py-1 text-[10px] font-medium text-[#22C55E]">
                  Accepted
                </span>
              </div>

              <div className="relative mt-4">
                <p className="font-semibold text-[#F8FAFC]">
                  Merchant
                </p>

                <p className="mt-1 text-xs text-[#64748B]">
                  {activeMerchants.length} active{" "}
                  {activeMerchants.length === 1
                    ? "business"
                    : "businesses"}
                </p>
              </div>

              <div className="relative mt-4 flex items-center text-xs font-medium text-[#94A3B8] group-hover:text-[#22C55E]">
                Open workspace
                <svg
                  className="ml-1.5 h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          ) : isMerchantApply ? (
            <Link
              href={`/user/${adminID}/apply`}
              className="group relative rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4 transition hover:border-[#22C55E]/30 hover:bg-[#111827]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>

                <span className="rounded-full border border-[#1F2937] bg-[#111827] px-2 py-1 text-[10px] font-medium text-[#94A3B8]">
                  APPLY
                </span>
              </div>

              <p className="mt-4 font-semibold text-[#F8FAFC]">
                Merchant
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Become a Bonix merchant
              </p>

              <div className="mt-4 text-xs font-medium text-[#22C55E]">
                Start application →
              </div>
            </Link>
          ) : (
            <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-[#64748B]">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M4 10h16v10H4z" />
                    <path d="M3 10 5 4h14l2 6" />
                  </svg>
                </div>

                <span className="rounded-full border border-[#1F2937] bg-[#111827] px-2 py-1 text-[10px] font-medium text-[#64748B]">
                  {merchantStatusLabel}
                </span>
              </div>

              <p className="mt-4 font-semibold text-[#CBD5E1]">
                Merchant
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Workspace unavailable
              </p>
            </div>
          )}

          {/* User */}
          <Link
            href={`/user/${adminID}/feed`}
            className="group rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4 transition hover:border-[#22C55E]/30 hover:bg-[#111827]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-[#CBD5E1]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
              </div>

              <span className="rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2 py-1 text-[10px] font-medium text-[#22C55E]">
                Accepted
              </span>
            </div>

            <p className="mt-4 font-semibold text-[#F8FAFC]">
              User
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Access the consumer experience
            </p>

            <div className="mt-4 text-xs font-medium text-[#94A3B8] group-hover:text-[#22C55E]">
              Open workspace →
            </div>
          </Link>

          {/* Agent */}
          <Link
            href={`/agent/${adminID}/dashboard`}
            className="group rounded-2xl border border-[#1F2937] bg-[#0B0F14] p-4 transition hover:border-[#22C55E]/30 hover:bg-[#111827]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-[#CBD5E1]">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                  <path d="M18 5v3M19.5 6.5h-3" />
                </svg>
              </div>

              <span className="rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-2 py-1 text-[10px] font-medium text-[#22C55E]">
                Accepted
              </span>
            </div>

            <p className="mt-4 font-semibold text-[#F8FAFC]">
              Agent
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Access the Bonix agent workspace
            </p>

            <div className="mt-4 text-xs font-medium text-[#94A3B8] group-hover:text-[#22C55E]">
              Open workspace →
            </div>
          </Link>
        </div>
      </section>

      {/* Settings */}
      <section className="relative">
        <div className="mb-3 flex items-center gap-3">
          <SectionIcon>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
              <path d="m5.6 5.6 2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </SectionIcon>

          <div>
            <h2 className="text-base font-semibold text-[#F8FAFC]">
              Administration
            </h2>

            <p className="text-xs text-[#64748B]">
              Manage your administrator account and platform access.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {settings.map((item) => (
            <button
              key={item.title}
              type="button"
              className="group flex items-center gap-4 rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4 text-left transition hover:border-[#334155] hover:bg-[#111827]"
            >
              <SectionIcon>{item.icon}</SectionIcon>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#F8FAFC]">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-[#64748B]">
                  {item.description}
                </p>
              </div>

              <svg
                className="h-4 w-4 shrink-0 text-[#475569] transition group-hover:translate-x-0.5 group-hover:text-[#94A3B8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </section>

      {/* Danger / logout */}
      <section className="relative rounded-3xl border border-[#1F2937] bg-[#0F172A] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#F8FAFC]">
              End administrator session
            </p>

            <p className="mt-1 text-xs text-[#64748B]">
              Sign out of Bonix on this device.
            </p>
          </div>

          <LogoutButton className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-5 text-sm font-semibold text-[#EF4444] transition hover:bg-[#EF4444]/15 sm:w-auto">
            Logout
          </LogoutButton>
        </div>
      </section>
    </div>
  );
}