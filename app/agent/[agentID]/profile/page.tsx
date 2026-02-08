import Link from "next/link";
import Image from "next/image";

import { LogoutButton } from "@/app/components/LogoutButton";

import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AgentProfilePage({
  params,
}: Readonly<{ params: Promise<{ agentID: string }> }>) {
  const { agentID } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const updates = getIdentityMetadataUpdates(data.user);
  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Agent",
    fallbackEmail: "agent@bonix.app",
  });

  const preferences = ["Notifications", "Escalation rules", "Security", "Support"];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#121212] text-lg font-semibold text-[#38BDF8]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Agent avatar"
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

      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Switch role</p>
            <p className="text-sm text-[#9CA3AF]">
              Jump to other accepted workspaces.
            </p>
          </div>
          <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
            Current: Agent
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/admin/${agentID}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>Admin</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
          <Link
            href={`/merchant/${agentID}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>Merchant</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
          <Link
            href={`/user/${agentID}/feed`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>User</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h2 className="text-lg font-semibold">Agent status</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Active cases", value: "18" },
            { label: "Resolved this week", value: "64" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#2A2A2A] bg-[#121212] p-4"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {preferences.map((item) => (
          <div
            key={item}
            className="flex w-full items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] px-4 py-3 text-sm"
          >
            {item}
            <span className="text-[#9CA3AF]">›</span>
          </div>
        ))}
      </section>

      <LogoutButton className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#38BDF8]">
        Logout
      </LogoutButton>
    </div>
  );
}
