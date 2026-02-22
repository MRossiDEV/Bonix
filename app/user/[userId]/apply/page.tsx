import { redirect } from "next/navigation";

import MerchantApplyWizard from "./MerchantApplyWizard";
import { createClient } from "@/lib/supabase/server";
import { getAuthProfile } from "@/lib/auth-profile";

function isMerchantAcceptedStatus(status: string | null | undefined): boolean {
  const normalized = String(status ?? "").toUpperCase();
  return normalized === "ACTIVE" || normalized === "APPROVED";
}

export default async function MerchantApplyPage({
  params,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const { userId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  if (data.user.id !== userId) {
    redirect(`/user/${data.user.id}/apply`);
  }

  const { data: merchantRecords } = await supabase
    .from("merchants")
    .select("id, status")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });

  const merchantList = merchantRecords ?? [];
  const activeMerchant = merchantList.find((merchant) =>
    isMerchantAcceptedStatus(merchant.status),
  );
  const pendingMerchant = merchantList.find(
    (merchant) => String(merchant.status ?? "").toUpperCase() === "PENDING",
  );
  const merchantRecord = activeMerchant ?? pendingMerchant ?? merchantList[0] ?? null;

  const profile = getAuthProfile(data.user, {
    fallbackName: "Bonix Member",
    fallbackEmail: `${userId}@bonix.app`,
  });

  if (activeMerchant) {
    redirect(`/merchant/${activeMerchant.id}/dashboard`);
  }

  if (merchantRecord && merchantRecord.status === "PENDING") {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <h1 className="text-2xl font-semibold">Application pending</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Your merchant application is under review. The merchant dashboard is
            visible but locked until approval.
          </p>
        </div>
        <div className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">Merchant dashboard</p>
              <p className="text-sm text-[#9CA3AF]">
                Preview what you can access once approved.
              </p>
            </div>
            <span className="rounded-full border border-[#2A2A2A] px-3 py-1 text-xs text-[#9CA3AF]">
              Locked
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Promo creation",
                detail: "Build and publish promos for nearby customers.",
              },
              {
                title: "Promo analytics",
                detail: "Track redemptions, revenue, and customer reach.",
              },
              {
                title: "Merchant profile",
                detail: "Showcase your business details and locations.",
              },
            ].map((item) => (
              <div
                key={item.title}
                title="Unlocks when your application is approved."
                className="rounded-2xl border border-[#2A2A2A] bg-[#121212] px-4 py-4 text-sm text-[#9CA3AF]"
              >
                <p className="text-[#FAFAFA]">{item.title}</p>
                <p className="mt-2 text-xs text-[#9CA3AF]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (merchantRecord && merchantRecord.status !== "REJECTED") {
    return (
      <section className="rounded-3xl border border-[#2A2A2A] bg-[#1E1E1E] p-6">
        <h1 className="text-2xl font-semibold">Merchant access unavailable</h1>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Your merchant access is not active. Please contact support.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <MerchantApplyWizard
        userId={userId}
        defaultEmail={profile.email}
        existingStatus={merchantRecord?.status ?? null}
      />
    </div>
  );
}
