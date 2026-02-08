import Link from "next/link";

import { getAuthProfile } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function UserProfilePage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: "member@bonix.app",
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#121212] text-lg font-semibold text-[#FF7A00]">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="User avatar"
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
              Access sections for accepted roles.
            </p>
          </div>
          <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
            Current: User
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/user/${userId}/feed`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>User</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
          <Link
            href={`/merchant/${userId}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>Merchant</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
          <Link
            href={`/agent/${userId}/dashboard`}
            className="flex items-center justify-between rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-sm"
          >
            <span>Agent</span>
            <span className="text-xs text-[#9CA3AF]">Accepted</span>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        {[
          "Payment methods",
          "Saved promos",
          "Notifications",
          "Privacy",
        ].map((item) => (
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

      <button
        type="button"
        className="w-full rounded-2xl border border-[#2A2A2A] bg-[#121212] py-3 text-sm text-[#FF7A00]"
      >
        Logout
      </button>
    </div>
  );
}
