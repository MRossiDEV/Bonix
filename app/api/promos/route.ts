import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  image: string | null;
  expires_at: string;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  category: string | null;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
  sold_out_duration_seconds: number | null;
  merchant: { business_name: string } | null;
};

type PromoRowRaw = Omit<PromoRow, "merchant"> & {
  merchant: { business_name: string }[] | null;
};

const MAX_LIMIT = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const pageParam = searchParams.get("page");
  const id = searchParams.get("id");
  const limit = limitParam ? Number(limitParam) : 12;
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(limit, 1), MAX_LIMIT)
    : 12;
  const parsedPage = pageParam ? Number(pageParam) : 1;
  const safePage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
  const offset = (safePage - 1) * safeLimit;

  const admin = createAdminClient();

  let query = admin
    .from("promos")
    .select(
      "id, title, description, original_price, discounted_price, cashback_percent, image, expires_at, total_slots, available_slots, status, is_featured, category, activated_at, created_at, updated_at, merchant:merchants (business_name)",
    )
    .in("status", ["ACTIVE", "SOLD_OUT"])
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .range(offset, offset + safeLimit - 1);

  if (id) {
    query = query.eq("id", id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const promos = (data ?? []).map((row: PromoRowRaw): PromoRow => {
    const merchant = Array.isArray(row.merchant) ? row.merchant[0] ?? null : row.merchant;
    return { ...row, merchant, sold_out_duration_seconds: null };
  });

  const soldOutPromoIds = promos.filter((promo) => promo.status === "SOLD_OUT").map((promo) => promo.id);

  if (soldOutPromoIds.length > 0) {
    const { data: reservations, error: reservationsError } = await admin
      .from("reservations")
      .select("promo_id, created_at")
      .in("promo_id", soldOutPromoIds)
      .order("created_at", { ascending: false });

    if (!reservationsError) {
      const latestReservationByPromo = new Map<string, string>();
      for (const reservation of reservations ?? []) {
        const promoId = String((reservation as { promo_id: string }).promo_id ?? "");
        const createdAt = String((reservation as { created_at: string }).created_at ?? "");
        if (!promoId || !createdAt || latestReservationByPromo.has(promoId)) {
          continue;
        }
        latestReservationByPromo.set(promoId, createdAt);
      }

      for (const promo of promos) {
        if (promo.status !== "SOLD_OUT") {
          continue;
        }

        const activatedAt = promo.activated_at ?? promo.created_at;
        const lastReservationAt = latestReservationByPromo.get(promo.id) ?? null;

        if (!lastReservationAt) {
          promo.sold_out_duration_seconds = null;
          continue;
        }

        const activatedMs = new Date(activatedAt).getTime();
        const soldOutMs = new Date(lastReservationAt).getTime();

        if (!Number.isFinite(activatedMs) || !Number.isFinite(soldOutMs) || soldOutMs < activatedMs) {
          promo.sold_out_duration_seconds = null;
          continue;
        }

        promo.sold_out_duration_seconds = Math.floor((soldOutMs - activatedMs) / 1000);
      }
    }
  }

  return NextResponse.json({ promos });
}
