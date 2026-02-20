import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/app/components/LogoutButton";

import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function UserProfilePage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  const { data: merchantRecord } = await supabase
    .from("merchants")
    .select("status")
    .eq("user_id", data.user.id)
    .maybeSingle();
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
    "Payment methods",
    "Saved promos",
    "Notifications",
    "Privacy",
  ];

  const isMerchantActive = merchantRecord?.status === "ACTIVE";
  const isMerchantApply = !merchantRecord;
  const isMerchantPending = merchantRecord?.status === "PENDING";
  const isMerchantRejected = merchantRecord?.status === "REJECTED";
  const merchantStatusLabel = isMerchantApply
    ? "APPLY"
    : merchantRecord.status === "PENDING"
      ? "PENDING APPROVAL"
      : merchantRecord.status === "REJECTED"
        ? "REJECTED"
        : merchantRecord.status === "ACTIVE"
          ? "ACCEPTED"
          : merchantRecord.status;

    const isAgentActive = agentRecord?.status === "ACTIVE";
    const isAgentApply = !agentRecord;
    const isAgentPending = agentRecord?.status === "PENDING";
    const isAgentRejected = agentRecord?.status === "REJECTED";
    const agentStatusLabel = isAgentApply
      ? "APPLY"
      : agentRecord.status === "PENDING"
        ? "PENDING APPROVAL"
        : agentRecord.status === "REJECTED"
          ? "REJECTED"
          : agentRecord.status === "ACTIVE"
            ? "ACCEPTED"
            : agentRecord.status;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#121212] text-lg font-semibold text-[#FF7A00]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="User avatar"
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              profile.initials
            )}
          </div>
          <div>
            <p className="text-xl font-semibold">{profile.name}</p>
            <p className="text-sm text-[#9CA3AF]">{profile.email}</p>
          </div>
        </div>
      </section>

      {!isMerchantActive ? (
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                Merchant role
              </p>
              <h2 className="mt-2 text-xl font-semibold">Become a Merchant</h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                Unlock tools to grow your business with Bonix.
              </p>
            </div>
            {isMerchantPending ? (
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
                Pending approval
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              "More exposure in nearby feeds",
              "New customers via promos",
              "Easy promo creation tools",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#9CA3AF]"
              >
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/user/${userId}/apply`}
              className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212]"
            >
              {isMerchantPending
                ? "View application"
                : isMerchantRejected
                  ? "Resubmit application"
                  : "Start application"}
            </Link>
            {isMerchantRejected ? (
              <span className="text-xs text-[#FCA5A5]">
                Your previous application was rejected. You can resubmit now.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {!isAgentActive ? (
        <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                Agent role
              </p>
              <h2 className="mt-2 text-xl font-semibold">Become an Agent</h2>
              <p className="mt-2 text-sm text-[#9CA3AF]">
                Promote promos, grow local reach, and earn commissions.
              </p>
            </div>
            {isAgentPending ? (
              <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
                Pending approval
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              "Distribute promos in your territory",
              "Share referral links or codes",
              "Track performance across campaigns",
            ].map((benefit) => (
              <div
                key={benefit}
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm text-[#9CA3AF]"
              >
                {benefit}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={`/user/${userId}/agent/apply`}
              className="rounded-2xl bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-[#121212]"
            >
              {isAgentPending
                ? "View application"
                : isAgentRejected
                  ? "Resubmit application"
                  : "Start application"}
            </Link>
            {isAgentRejected ? (
              <span className="text-xs text-[#FCA5A5]">
                Your previous application was rejected. You can resubmit now.
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Switch role</p>
            <p className="text-sm text-[#9CA3AF]">
              Access sections for accepted roles.
            </p>
          </div>
          <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
            Current: User
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/admin/${userId}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>Admin</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
          {isMerchantActive ? (
            <Link
              href={`/merchant/${userId}/dashboard`}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
            >
              <span>Merchant</span>
              <span className="text-xs text-[#9CA3AF]">ACCEPTED</span>
            </Link>
          ) : isMerchantApply ? (
            <Link
              href={`/user/${userId}/apply`}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
            >
              <span>Merchant</span>
              <span className="text-xs text-[#9CA3AF]">{merchantStatusLabel}</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm opacity-70">
              <span>Merchant</span>
              <span className="text-xs text-[#9CA3AF]">
                {merchantStatusLabel}
              </span>
            </div>
          )}
          {isAgentActive ? (
            <Link
              href={`/agent/${userId}/dashboard`}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
            >
              <span>Agent</span>
              <span className="text-xs text-[#9CA3AF]">ACCEPTED</span>
            </Link>
          ) : isAgentApply ? (
            <Link
              href={`/user/${userId}/agent/apply`}
              className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
            >
              <span>Agent</span>
              <span className="text-xs text-[#9CA3AF]">{agentStatusLabel}</span>
            </Link>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm opacity-70">
              <span>Agent</span>
              <span className="text-xs text-[#9CA3AF]">{agentStatusLabel}</span>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        {preferences.map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-3 text-sm"
          >
            {item}
            <span className="text-[#9CA3AF]">›</span>
          </button>
        ))}
      </section>

      <LogoutButton className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#FF7A00]">
        Logout
      </LogoutButton>
    </div>
  );
}
