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
  const updates = getIdentityMetadataUpdates(data.user);
  if (updates) {
    await supabase.auth.updateUser({ data: updates });
  }
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: `${userId}@bonix.app`,
  });

  return (
    <UserAppLayout
      basePath={`/user/${userId}`}
      userName={profile.name}
      userEmail={profile.email}
      userInitials={profile.initials}
      userAvatarUrl={profile.avatarUrl}
    >
      {children}
    </UserAppLayout>
  );
}
