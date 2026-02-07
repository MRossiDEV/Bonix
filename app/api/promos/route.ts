import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  expires_at: string;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  category: string | null;
  merchant: { business_name: string } | null;
};

type PromoRowRaw = Omit<PromoRow, "merchant"> & {
  merchant: { business_name: string }[] | null;
};

const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const id = searchParams.get("id");
  const limit = limitParam ? Number(limitParam) : 12;
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(limit, 1), MAX_LIMIT)
    : 12;

  const admin = createAdminClient();

  let query = admin
    .from("promos")
    .select(
      "id, title, description, original_price, discounted_price, cashback_percent, expires_at, total_slots, available_slots, status, is_featured, category, merchant:merchants (business_name)",
    )
    .eq("status", "ACTIVE")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (id) {
    query = query.eq("id", id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const promos = (data ?? []).map((row: PromoRowRaw): PromoRow => {
    const merchant = Array.isArray(row.merchant) ? row.merchant[0] ?? null : row.merchant;
    return { ...row, merchant };
  });

  return NextResponse.json({ promos });
}
