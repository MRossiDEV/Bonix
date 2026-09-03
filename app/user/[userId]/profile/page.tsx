import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/app/components/LogoutButton";

import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

type MerchantProfile = {
  id: string;
  business_name: string | null;
  status: string;
};

function isMerchantAcceptedStatus(status: string | null | undefined): boolean {
  const normalized = String(status ?? "").toUpperCase();
  return normalized === "ACTIVE" || normalized === "APPROVED";
}

export default async function UserProfilePage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: merchantRecords } = await supabase
    .from("merchants")
    .select("id, business_name, status")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  const { data: agentRecord } = await supabase
    .from("agents")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  const updates = getIdentityMetadataUpdates(data.user);

  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }

  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: "member@bonix.app",
  });

  const preferences = [
    {
      label: "Payment methods",
      description: "Manage how you pay for Bonix purchases.",
      icon: <CardIcon />,
    },
    {
      label: "Saved promos",
      description: "Your favorite offers and places.",
      icon: <HeartIcon />,
    },
    {
      label: "Notifications",
      description: "Control Bonix activity alerts.",
      icon: <BellIcon />,
    },
    {
      label: "Privacy",
      description: "Manage your account and privacy.",
      icon: <LockIcon />,
    },
  ];

  const merchants = (merchantRecords ?? []) as MerchantProfile[];

  const activeMerchants = merchants.filter((merchant) =>
    isMerchantAcceptedStatus(merchant.status),
  );

  const isMerchantActive = activeMerchants.length > 0;
  const isMerchantApply = merchants.length === 0;
  const isMerchantPending = merchants.some(
    (merchant) => merchant.status === "PENDING",
  );
  const isMerchantRejected =
    merchants.length > 0 &&
    merchants.every((merchant) => merchant.status === "REJECTED");

  const merchantStatusLabel = isMerchantApply
    ? "APPLY"
    : isMerchantPending
      ? "PENDING APPROVAL"
      : isMerchantRejected
        ? "REJECTED"
        : isMerchantActive
          ? "ACCEPTED"
          : "INACTIVE";

  const isAgentActive = agentRecord?.status === "ACTIVE";
  const isAgentApply = !agentRecord;
  const isAgentPending = agentRecord?.status === "PENDING";
  const isAgentRejected = agentRecord?.status === "REJECTED";

  const agentStatusLabel = isAgentApply
    ? "APPLY"
    : isAgentPending
      ? "PENDING APPROVAL"
      : isAgentRejected
        ? "REJECTED"
        : isAgentActive
          ? "ACCEPTED"
          : agentRecord?.status ?? "INACTIVE";

  return (
    <div className="space-y-5 pb-8">
      {/* ============================================================
          PROFILE HERO
      ============================================================ */}

      <section className="relative mx-4 overflow-hidden rounded-[32px] border border-[#1F2937] bg-gradient-to-br from-[#12251A] via-[#0F172A] to-[#0B0F14]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#22C55E]/10 blur-[70px]" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-[#22C55E]/20 bg-[#111827] text-lg font-black text-[#22C55E]">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="User avatar"
                  width={72}
                  height={72}
                  className="h-full w-full object-cover"
                />
              ) : (
                profile.initials
              )}

              <span className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full border-2 border-[#111827] bg-[#22C55E]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-black tracking-tight text-[#F8FAFC]">
                  {profile.name}
                </h1>

                <span className="rounded-full bg-[#22C55E]/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#22C55E]">
                  Member
                </span>
              </div>

              <p className="mt-1 truncate text-xs text-[#64748B]">
                {profile.email}
              </p>

              <p className="mt-2 text-[9px] font-medium text-[#475569]">
                Member since Bonix
              </p>
            </div>
          </div>

          {/* Profile metrics */}

          <div className="mt-5 grid grid-cols-3 gap-2">
            <ProfileMetric
              value="8"
              label="City spots"
            />

            <ProfileMetric
              value="$248"
              label="Credits"
            />

            <ProfileMetric
              value="12"
              label="Promos used"
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          MY BONIX
      ============================================================ */}

      <section className="mx-4 overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-[#1F2937] px-4 py-3.5">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Your Bonix
            </p>

            <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
              Your world is growing
            </p>
          </div>

          <span className="rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-[9px] font-black text-[#22C55E]">
            LEVEL 1
          </span>
        </div>

        <div className="grid grid-cols-2">
          <Link
            href={`/user/${userId}/city`}
            className="group border-r border-[#1F2937] p-4 transition hover:bg-[#111827]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">🏙️</span>

              <ArrowIcon />
            </div>

            <p className="mt-3 text-xs font-bold text-[#CBD5E1]">
              My City
            </p>

            <p className="mt-1 text-[9px] leading-4 text-[#64748B]">
              8 of 10 spots unlocked
            </p>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
              <div className="h-full w-[80%] rounded-full bg-[#22C55E]" />
            </div>
          </Link>

          <Link
            href={`/user/${userId}/wallet`}
            className="group p-4 transition hover:bg-[#111827]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl">◈</span>

              <ArrowIcon />
            </div>

            <p className="mt-3 text-xs font-bold text-[#CBD5E1]">
              Wallet
            </p>

            <p className="mt-1 text-[9px] leading-4 text-[#64748B]">
              Available Bonix Credit
            </p>

            <p className="mt-2 text-lg font-black text-[#22C55E]">
              $248.60
            </p>
          </Link>
        </div>
      </section>

      {/* ============================================================
          SWITCH ROLE
      ============================================================ */}

      <section className="mx-4 overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
        <div className="border-b border-[#1F2937] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                Workspaces
              </p>

              <h2 className="mt-1 text-base font-bold text-[#F8FAFC]">
                Switch role
              </h2>

              <p className="mt-1 text-[10px] text-[#64748B]">
                Access the Bonix tools available to you.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#22C55E]/10">
              <LayersIcon />
            </div>
          </div>
        </div>

        <div className="p-3">
          {/* USER */}

          <div className="mb-2 flex items-center justify-between rounded-2xl border border-[#22C55E]/15 bg-[#22C55E]/5 px-3 py-3">
            <div className="flex items-center gap-3">
              <RoleIcon icon={<UserIcon />} active />

              <div>
                <p className="text-xs font-bold text-[#F8FAFC]">
                  User
                </p>

                <p className="mt-0.5 text-[9px] text-[#64748B]">
                  Discover and use Bonix
                </p>
              </div>
            </div>

            <span className="rounded-full bg-[#22C55E]/10 px-2 py-1 text-[8px] font-black text-[#22C55E]">
              CURRENT
            </span>
          </div>

          {/* ADMIN */}

          <RoleLink
            href={`/admin/${userId}/dashboard`}
            icon={<ShieldIcon />}
            title="Admin"
            description="Manage the Bonix platform"
            status="ACCEPTED"
          />

          {/* MERCHANT */}

          {isMerchantActive ? (
            <RoleLink
              href={`/merchant/${userId}/list`}
              icon={<StoreIcon />}
              title="Merchant"
              description={`${activeMerchants.length} ${
                activeMerchants.length === 1 ? "business" : "businesses"
              } connected`}
              status="ACCEPTED"
            />
          ) : isMerchantApply ? (
            <RoleLink
              href={`/user/${userId}/apply`}
              icon={<StoreIcon />}
              title="Merchant"
              description="Create a business account"
              status={merchantStatusLabel}
            />
          ) : (
            <RoleDisabled
              icon={<StoreIcon />}
              title="Merchant"
              description="Merchant access is not active"
              status={merchantStatusLabel}
            />
          )}

          {/* AGENT */}

          {isAgentActive ? (
            <RoleLink
              href={`/agent/${userId}/dashboard`}
              icon={<AgentIcon />}
              title="Agent"
              description="Manage your local campaigns"
              status="ACCEPTED"
            />
          ) : isAgentApply ? (
            <RoleLink
              href={`/user/${userId}/agent/apply`}
              icon={<AgentIcon />}
              title="Agent"
              description="Apply to become a Bonix Agent"
              status={agentStatusLabel}
            />
          ) : (
            <RoleDisabled
              icon={<AgentIcon />}
              title="Agent"
              description="Agent access is not active"
              status={agentStatusLabel}
            />
          )}
        </div>
      </section>

      {/* ============================================================
          BECOME MERCHANT
      ============================================================ */}

      {!isMerchantActive ? (
        <section className="mx-4 overflow-hidden rounded-3xl border border-[#1F2937] bg-gradient-to-br from-[#111827] to-[#0F172A]">
          <div className="relative p-5">
            <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full bg-[#22C55E]/8 blur-3xl" />

            <div className="relative flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-xl">
                🏪
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Grow with Bonix
                </p>

                <h2 className="mt-1 text-sm font-bold text-[#F8FAFC]">
                  Become a Merchant
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                  Put your business in front of nearby Bonix users and create
                  promotions that bring people through your door.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Benefit
                icon="📍"
                label="Local reach"
              />

              <Benefit
                icon="🎟️"
                label="Promos"
              />

              <Benefit
                icon="📊"
                label="Insights"
              />
            </div>

            <Link
              href={`/user/${userId}/apply`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] py-3.5 text-xs font-black text-[#041007] transition hover:bg-[#4ADE80]"
            >
              {isMerchantPending
                ? "View application"
                : isMerchantRejected
                  ? "Resubmit application"
                  : "Become a Merchant"}

              <ArrowIcon />
            </Link>

            {isMerchantRejected ? (
              <p className="mt-2 text-center text-[9px] text-red-400">
                Your previous application was rejected. You can resubmit now.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ============================================================
          BECOME AGENT
      ============================================================ */}

      {!isAgentActive ? (
        <section className="mx-4 overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111827] text-xl">
                🚀
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  Bonix Network
                </p>

                <h2 className="mt-1 text-sm font-bold text-[#F8FAFC]">
                  Become an Agent
                </h2>

                <p className="mt-1 text-[10px] leading-4 text-[#64748B]">
                  Promote Bonix offers in your territory and earn commissions
                  from the businesses you help grow.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#111827] p-3">
              <div>
                <p className="text-[10px] font-bold text-[#CBD5E1]">
                  Agent application
                </p>

                <p className="mt-1 text-[9px] text-[#64748B]">
                  {isAgentPending
                    ? "Your application is being reviewed."
                    : isAgentRejected
                      ? "You can submit a new application."
                      : "Start your application to join."}
                </p>
              </div>

              <Link
                href={`/user/${userId}/agent/apply`}
                className="rounded-xl bg-[#111827] px-3 py-2 text-[9px] font-black text-[#22C55E] ring-1 ring-[#22C55E]/20"
              >
                {isAgentPending
                  ? "View"
                  : isAgentRejected
                    ? "Resubmit"
                    : "Apply"}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============================================================
          SETTINGS
      ============================================================ */}

      <section className="px-4">
        <div className="mb-2 px-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            Account
          </p>

          <p className="mt-1 text-sm font-bold text-[#F8FAFC]">
            Settings
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
          {preferences.map((item, index) => (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#111827] ${
                index > 0 ? "border-t border-[#1F2937]" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-[#64748B]">
                {item.icon}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-[#CBD5E1]">
                  {item.label}
                </span>

                <span className="mt-0.5 block truncate text-[9px] text-[#475569]">
                  {item.description}
                </span>
              </span>

              <span className="text-lg font-light text-[#475569]">›</span>
            </button>
          ))}
        </div>
      </section>

      {/* ============================================================
          LOGOUT
      ============================================================ */}

      <div className="px-4">
        <LogoutButton className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/5 py-3.5 text-xs font-bold text-red-400 transition hover:bg-red-500/10">
          <LogoutIcon />
          Logout
        </LogoutButton>
      </div>

      <p className="px-6 text-center text-[8px] font-medium uppercase tracking-[0.18em] text-[#334155]">
        BONIX · Discover your city
      </p>
    </div>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function ProfileMetric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14]/50 px-3 py-3">
      <p className="text-sm font-black text-[#F8FAFC]">{value}</p>

      <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-[#475569]">
        {label}
      </p>
    </div>
  );
}

function RoleIcon({
  icon,
  active = false,
}: {
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
        active
          ? "bg-[#22C55E]/10 text-[#22C55E]"
          : "bg-[#111827] text-[#64748B]"
      }`}
    >
      {icon}
    </span>
  );
}

function RoleLink({
  href,
  icon,
  title,
  description,
  status,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  const accepted = status === "ACCEPTED";

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[#111827]"
    >
      <RoleIcon icon={icon} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#CBD5E1]">{title}</p>

        <p className="mt-0.5 truncate text-[9px] text-[#475569]">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-1 text-[7px] font-black ${
            accepted
              ? "bg-[#22C55E]/10 text-[#22C55E]"
              : "bg-[#111827] text-[#64748B]"
          }`}
        >
          {status}
        </span>

        <span className="text-lg font-light text-[#475569]">›</span>
      </div>
    </Link>
  );
}

function RoleDisabled({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-3 py-3 opacity-60">
      <RoleIcon icon={icon} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-[#94A3B8]">{title}</p>

        <p className="mt-0.5 truncate text-[9px] text-[#475569]">
          {description}
        </p>
      </div>

      <span className="rounded-full bg-[#111827] px-2 py-1 text-[7px] font-black text-[#64748B]">
        {status}
      </span>
    </div>
  );
}

function Benefit({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-3 text-center">
      <span className="text-sm">{icon}</span>

      <p className="mt-1.5 text-[8px] font-bold text-[#64748B]">
        {label}
      </p>
    </div>
  );
}

/* ================================================================
   ICONS
================================================================ */

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-3.6 5-5 8-5s6.2 1.4 8 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M4 10h16" />
      <path d="M5 10v10h14V10" />
      <path d="M3 10 5 4h14l2 6" />
      <path d="M8 10a2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="8" />
      <path d="m12 8 1.5 3 3 .5-2.2 2.2.5 3.1-2.8-1.5-2.8 1.5.5-3.1L7.5 11.5l3-.5L12 8Z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-[#22C55E]"
    >
      <path d="m12 3 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 17 8 4 8-4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 text-[#475569]"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 10h18" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M20.8 8.8c0 5-8.8 10-8.8 10S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
      <path d="M14 8l4 4-4 4" />
      <path d="M9 12h9" />
    </svg>
  );
}