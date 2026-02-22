import { redirect } from "next/navigation";

import MerchantAppLayout from "@/app/components/MerchantAppLayout";
import { getAuthProfile } from "@/lib/auth-profile";
import { createClient } from "@/lib/supabase/server";

function isMissingLogoColumn(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("logo_url") && normalized.includes("does not exist");
}

function isMerchantAccessStatus(status: string | null | undefined): boolean {
  const normalized = String(status ?? "").toUpperCase();
  return normalized === "ACTIVE" || normalized === "APPROVED";
}

export default async function MerchantLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ merchantId: string }> }>) {
  const { merchantId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login");
  }

  const isUserScopedRoute = merchantId === data.user.id;

  if (isUserScopedRoute) {
    const profile = getAuthProfile(data.user, {
      fallbackName: "Bonix Merchant",
      fallbackEmail: `${data.user.id}@bonix.app`,
    });

    return (
      <MerchantAppLayout
        basePath={`/merchant/${data.user.id}`}
        merchantName={profile.name}
        merchantEmail={profile.email}
        merchantInitials={profile.initials}
        merchantAvatarUrl={profile.avatarUrl ?? undefined}
      >
        {children}
      </MerchantAppLayout>
    );
  }

  const primaryMerchant = await supabase
    .from("merchants")
    .select("status, business_name, email, logo_url")
    .eq("id", merchantId)
    .eq("user_id", data.user.id)
    .maybeSingle();

  let merchantRecord = primaryMerchant.data;
  let merchantError = primaryMerchant.error;

  if (!merchantRecord && merchantError && isMissingLogoColumn(merchantError.message)) {
    const legacyMerchant = await supabase
      .from("merchants")
      .select("status, business_name, email")
      .eq("id", merchantId)
      .eq("user_id", data.user.id)
      .maybeSingle();

    merchantRecord = legacyMerchant.data
      ? { ...legacyMerchant.data, logo_url: null }
      : null;
    merchantError = legacyMerchant.error;
  }

  if (merchantError || !merchantRecord || !isMerchantAccessStatus(merchantRecord.status)) {
    redirect(`/merchant/${data.user.id}/list`);
  }

  const merchantName = merchantRecord.business_name?.trim() || "Bonix Merchant";
  const merchantEmail = merchantRecord.email?.trim() || `${merchantId}@bonix.app`;
  const merchantInitials =
    merchantName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase() ?? "")
      .join("") || "BM";

  return (
    <MerchantAppLayout
      basePath={`/merchant/${merchantId}`}
      merchantName={merchantName}
      merchantEmail={merchantEmail}
      merchantInitials={merchantInitials}
      merchantAvatarUrl={merchantRecord.logo_url ?? undefined}
    >
      {children}
    </MerchantAppLayout>
  );
}
