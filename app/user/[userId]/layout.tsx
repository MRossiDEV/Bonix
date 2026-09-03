import { headers } from "next/headers";
import { redirect } from "next/navigation";

import UserAppLayout from "@/app/components/UserAppLayout";
import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function UserLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }
  const updates = getIdentityMetadataUpdates(data.user);
  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: `${userId}@bonix.app`,
  });

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";
  const isCity = pathname.endsWith("/city");
  const topBarHidden = isCity;
  const fullBleed = isCity;

  return (
    <UserAppLayout
      basePath={`/user/${userId}`}
      userName={profile.name}
      userEmail={profile.email}
      userInitials={profile.initials}
      userAvatarUrl={profile.avatarUrl}
      topBarHidden={topBarHidden}
      fullBleed={fullBleed}
    >
      {children}
   </UserAppLayout>
  );
}
