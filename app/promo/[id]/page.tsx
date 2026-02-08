import { notFound } from "next/navigation";

import { mapPromoRowToCard } from "@/lib/promos";
import { createAdminClient } from "@/lib/supabase/admin";
import { PromoDetailClient } from "@/app/promo/[id]/PromoDetailClient";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  expires_at: string;
  total_slots: number | string;
  available_slots: number | string;
  status: string;
  is_featured: boolean;
  category: string | null;
  merchant: { business_name: string } | null;
};

type PromoRowRaw = Omit<PromoRow, "merchant"> & {
  merchant: { business_name: string }[] | null;
};

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

  const normalized = (() => {
    const row = data as PromoRowRaw;
    const merchant = Array.isArray(row.merchant) ? row.merchant[0] ?? null : row.merchant;
    return { ...row, merchant } satisfies PromoRow;
  })();

  return <PromoDetailClient promo={mapPromoRowToCard(normalized)} />;
}
