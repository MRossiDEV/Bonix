import { NextRequest, NextResponse } from "next/server";

import {
  buildExpiringSoonDateIso,
  derivePromoStatus,
  getMerchantContextById,
  validatePromoInput,
} from "@/lib/merchant-promos";
import { getPromoActivityState, PromoActivityState } from "@/lib/promo-activity-state";
import { getPlatformSettings } from "@/lib/platform-settings";
import { createClient } from "@/lib/supabase/server";

type PromoListRow = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  available_slots: number;
  category: string | null;
  starts_at: string | null;
  expires_at: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
  activity_state: PromoActivityState;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type LegacyPromoListRow = {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  available_slots: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
  activity_state?: PromoActivityState;
  created_at: string;
  updated_at: string;
};

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") &&
    (message.includes("deleted_at") ||
      message.includes("category") ||
      message.includes("starts_at") ||
      message.includes("image") ||
      message.includes("is_featured") ||
      message.includes("activity_state"))
  );
}

function normalizePromoRows(rows: PromoListRow[]) {
  return rows.map((promo) => {
    const normalizedStatus = derivePromoStatus({
      status: promo.status,
      availableSlots: promo.available_slots,
      expiresAt: promo.expires_at,
    });
    const claimedSlots = Math.max(promo.total_slots - promo.available_slots, 0);

    return {
      ...promo,
      status: normalizedStatus,
      activity_state: getPromoActivityState(normalizedStatus),
      claimed_slots: claimedSlots,
      filled_percent:
        promo.total_slots > 0
          ? Math.min(100, Math.round((claimedSlots / promo.total_slots) * 100))
          : 0,
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get("merchantId");

  const merchantResult = await getMerchantContextById(merchantId);
  if (!merchantResult.context) {
    return NextResponse.json(
      { error: merchantResult.error?.message ?? "Unauthorized" },
      { status: merchantResult.error?.status ?? 401 },
    );
  }

  const supabase = await createClient();
  const statusFilter = searchParams.get("status");
  const activityStateFilter = searchParams.get("activityState");
  const activeOnly = searchParams.get("activeOnly") === "true";
  const expiringSoon = searchParams.get("expiringSoon") === "true";

  let query = supabase
    .from("promos")
    .select(
      "id, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at, status, activity_state, created_at, updated_at, deleted_at",
    )
    .eq("merchant_id", merchantResult.context.merchantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (activityStateFilter === "ACTIVE" || activityStateFilter === "UNACTIVE") {
    query = query.eq("activity_state", activityStateFilter);
  }

  if (activeOnly) {
    query = query.eq("status", "ACTIVE");
  }

  if (expiringSoon) {
    query = query.gte("expires_at", new Date().toISOString()).lte(
      "expires_at",
      buildExpiringSoonDateIso(),
    );
  }

  const { data, error } = await query;

  if (error && !isMissingColumnError(error.message)) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error && isMissingColumnError(error.message)) {
    let legacyQuery = supabase
      .from("promos")
      .select(
        "id, title, description, original_price, discounted_price, cashback_percent, total_slots, available_slots, status, created_at, updated_at, expires_at",
      )
      .eq("merchant_id", merchantResult.context.merchantId)
      .order("created_at", { ascending: false });

    if (statusFilter) {
      legacyQuery = legacyQuery.eq("status", statusFilter);
    }

    if (activityStateFilter === "ACTIVE" || activityStateFilter === "UNACTIVE") {
      if (activityStateFilter === "ACTIVE") {
        legacyQuery = legacyQuery.eq("status", "ACTIVE");
      } else {
        legacyQuery = legacyQuery.neq("status", "ACTIVE");
      }
    }

    if (activeOnly) {
      legacyQuery = legacyQuery.eq("status", "ACTIVE");
    }

    if (expiringSoon) {
      legacyQuery = legacyQuery.gte("expires_at", new Date().toISOString()).lte(
        "expires_at",
        buildExpiringSoonDateIso(),
      );
    }

    const { data: legacyData, error: legacyError } = await legacyQuery;

    if (legacyError) {
      return NextResponse.json({ error: legacyError.message }, { status: 400 });
    }

    const legacyNormalized = ((legacyData ?? []) as LegacyPromoListRow[]).map((row) => ({
      ...row,
      activity_state: getPromoActivityState(row.status),
      image: null,
      category: null,
      starts_at: null,
      deleted_at: null,
    }));

    return NextResponse.json({ promos: normalizePromoRows(legacyNormalized) });
  }

  const promos = normalizePromoRows((data ?? []) as PromoListRow[]);

  return NextResponse.json({ promos });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const merchantId = searchParams.get("merchantId");

  const merchantResult = await getMerchantContextById(merchantId);
  if (!merchantResult.context) {
    return NextResponse.json(
      { error: merchantResult.error?.message ?? "Unauthorized" },
      { status: merchantResult.error?.status ?? 401 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const validated = validatePromoInput(body);
  if (!validated.data) {
    return NextResponse.json({ errors: validated.errors }, { status: 400 });
  }

  const settings = await getPlatformSettings();
  const supabase = await createClient();

  const activePromosCountQuery = supabase
    .from("promos")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", merchantResult.context.merchantId)
    .is("deleted_at", null);

  const { count, error: countError } = await activePromosCountQuery;
  if (countError) {
    const legacy = await supabase
      .from("promos")
      .select("id", { count: "exact", head: true })
      .eq("merchant_id", merchantResult.context.merchantId);
    if (legacy.error) {
      return NextResponse.json({ error: legacy.error.message }, { status: 400 });
    }

    if ((legacy.count ?? 0) >= settings.maxPromosPerMerchant) {
      return NextResponse.json(
        {
          error: `Promo limit reached. Max promos per merchant is ${settings.maxPromosPerMerchant}`,
        },
        { status: 400 },
      );
    }
  } else if ((count ?? 0) >= settings.maxPromosPerMerchant) {
    return NextResponse.json(
      {
        error: `Promo limit reached. Max promos per merchant is ${settings.maxPromosPerMerchant}`,
      },
      { status: 400 },
    );
  }

  const { data: promo, error } = await supabase
    .from("promos")
    .insert({
      merchant_id: merchantResult.context.merchantId,
      title: validated.data.title,
      description: validated.data.description,
      image: validated.data.image,
      original_price: validated.data.original_price,
      discounted_price: validated.data.discounted_price,
      cashback_percent: settings.defaultCashbackPercent,
      total_slots: validated.data.total_slots,
      available_slots: validated.data.total_slots,
      category: validated.data.category,
      starts_at: validated.data.starts_at,
      expires_at: validated.data.expires_at,
      status: "DRAFT",
      activity_state: "UNACTIVE",
    })
    .select(
      "id, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at, status, created_at, updated_at",
    )
    .maybeSingle();

  if (error || !promo) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create promo" },
      { status: 400 },
    );
  }

  return NextResponse.json({ promo }, { status: 201 });
}
