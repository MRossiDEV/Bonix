import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";

type PromoRelation = {
  id: string;
  title: string | null;
  description: string | null;
  image: string | null;
  category: string | null;
  original_price: number | null;
  discounted_price: number | null;
  total_slots: number | null;
  starts_at: string | null;
  expires_at: string | null;
  status: string;
};

type MerchantRelation = {
  id: string;
  business_name: string | null;
};

type RequestRowRaw = {
  id: string;
  promo_id: string;
  merchant_id: string;
  action: string;
  status: string;
  note: string | null;
  requested_changes: Record<string, unknown> | null;
  admin_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  promo: PromoRelation | PromoRelation[] | null;
  merchant: MerchantRelation | MerchantRelation[] | null;
};

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export async function GET() {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  const { admin } = adminContext;
  const { data, error } = await admin
    .from("promo_change_requests")
    .select(
      "id, promo_id, merchant_id, action, status, note, requested_changes, admin_note, created_at, reviewed_at, promo:promos!left(id, title, description, image, category, original_price, discounted_price, total_slots, starts_at, expires_at, status), merchant:merchants!left(id, business_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const normalized = ((data ?? []) as RequestRowRaw[]).map((row) => ({
    ...row,
    promo: firstOrNull(row.promo),
    merchant: firstOrNull(row.merchant),
  }));

  return NextResponse.json({ requests: normalized });
}
