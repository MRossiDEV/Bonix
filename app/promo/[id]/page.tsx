import { notFound } from "next/navigation";

import { mapPromoRowToCard } from "@/lib/promos";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromoDetailClient } from "@/app/promo/[id]/PromoDetailClient";

type PromoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PromoDetailPage({ params }: PromoDetailPageProps) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promos")
    .select(
      "id, title, description, original_price, discounted_price, cashback_percent, expires_at, total_slots, available_slots, status, is_featured, category, merchant:merchants (business_name)",
    )
    .eq("id", id)
    .eq("status", "ACTIVE")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  return <PromoDetailClient promo={mapPromoRowToCard(data, 0)} />;
}
