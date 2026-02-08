import MerchantAppLayout from "@/app/components/MerchantAppLayout";
import { getAuthProfile } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

export default async function MerchantLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Merchant",
    fallbackEmail: `${merchantId}@bonix.app`,
  });

  return (
    <MerchantAppLayout
      basePath={`/merchant/${merchantId}`}
      merchantName={profile.name}
      merchantEmail={profile.email}
      merchantInitials={profile.initials}
      merchantAvatarUrl={profile.avatarUrl}
    >
      {children}
    </MerchantAppLayout>
  );
}
