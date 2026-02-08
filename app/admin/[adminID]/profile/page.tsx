import Link from "next/link";
import Image from "next/image";

import { LogoutButton } from "@/app/components/LogoutButton";

import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProfilePage({
  params,
}: Readonly<{ params: Promise<{ adminID: string }> }>) {
  const { adminID } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const updates = getIdentityMetadataUpdates(data.user);
  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Admin",
    fallbackEmail: "admin@bonix.app",
  });

  const settings = ["Compliance", "Security", "Risk alerts", "Support"];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0B0F14] text-lg font-semibold text-[#22C55E]">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Admin avatar"
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
            <p className="text-sm text-[#94A3B8]">{profile.email}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-[#1F2937] bg-[#0F172A] p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">Switch role</p>
            <p className="text-sm text-[#94A3B8]">
              Jump to other accepted workspaces.
            </p>
          </div>
          <span className="rounded-full border border-[#1F2937] px-3 py-1 text-xs text-[#94A3B8]">
            Current: Admin
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/merchant/${adminID}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
          >
            <span>Merchant</span>
            <span className="text-xs text-[#94A3B8]">Accepted</span>
          </Link>
          <Link
            href={`/user/${adminID}/feed`}
            className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
          >
            <span>User</span>
            <span className="text-xs text-[#94A3B8]">Accepted</span>
          </Link>
          <Link
            href={`/agent/${adminID}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0B0F14] px-4 py-3 text-sm"
          >
            <span>Agent</span>
            <span className="text-xs text-[#94A3B8]">Accepted</span>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        {settings.map((item) => (
          <div
            key={item}
            className="flex w-full items-center justify-between rounded-2xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-sm"
          >
            {item}
            <span className="text-[#94A3B8]">›</span>
          </div>
        ))}
      </section>

      <LogoutButton className="w-full rounded-2xl border border-[#1F2937] bg-[#0B0F14] py-3 text-sm text-[#22C55E]">
        Logout
      </LogoutButton>
    </div>
  );
}
