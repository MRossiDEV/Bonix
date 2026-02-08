import { redirect } from "next/navigation";

import AdminAppLayout from "@/app/components/AdminAppLayout";
import { getAuthProfile, getIdentityMetadataUpdates } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ adminID: string }>;
}>) {
  const { adminID } = await params;
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
    fallbackName: "Bonix Admin",
    fallbackEmail: `${adminID}@bonix.app`,
  });

  return (
    <AdminAppLayout
      basePath={`/admin/${adminID}`}
      adminName={profile.name}
      adminEmail={profile.email}
      adminInitials={profile.initials}
      adminAvatarUrl={profile.avatarUrl}
    >
      {children}
    </AdminAppLayout>
  );
}
