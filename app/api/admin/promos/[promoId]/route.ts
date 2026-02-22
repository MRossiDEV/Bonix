import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { logAudit } from "@/lib/audit";
import { config } from "@/lib/config";
import { derivePromoStatus, isStatusValue } from "@/lib/merchant-promos";
import { getPromoActivityState } from "@/lib/promo-activity-state";

type MerchantRelation = {
  id: string;
  business_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  business_category: string | null;
  short_description: string | null;
  logo_url: string | null;
  status: string;
};

type PromoRow = {
  id: string;
  merchant_id: string;
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
  created_at: string;
  updated_at: string;
  merchant: MerchantRelation | MerchantRelation[] | null;
};

type PromoRequestRow = {
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
};

const FULL_PROMO_SELECT =
  "id, merchant_id, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at, status, created_at, updated_at, merchant:merchants!left(id, business_name, contact_name, email, phone, address, business_category, short_description, logo_url, status)";

const FALLBACK_PROMO_SELECT =
  "id, merchant_id, title, description, original_price, discounted_price, cashback_percent, total_slots, available_slots, expires_at, status, created_at, updated_at, merchant:merchants!left(id, business_name, status)";

const OPTIONAL_PROMO_COLUMNS = ["image", "category", "starts_at", "activity_state"] as const;

function isMissingColumnError(message: string): boolean {
  const normalized = message.toLowerCase();
  const knownOptionalColumns = [
    ...OPTIONAL_PROMO_COLUMNS,
    "contact_name",
    "email",
    "phone",
    "address",
    "business_category",
    "short_description",
    "logo_url",
  ];

  return (
    normalized.includes("does not exist") &&
    knownOptionalColumns.some((column) => normalized.includes(column))
  );
}

function normalizePromoRow(row: Record<string, unknown>): PromoRow {
  const merchantRaw = firstOrNull(row.merchant as MerchantRelation | MerchantRelation[] | null);

  return {
    id: String(row.id),
    merchant_id: String(row.merchant_id),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    image: typeof row.image === "string" ? row.image : null,
    original_price: Number(row.original_price ?? 0),
    discounted_price: Number(row.discounted_price ?? 0),
    cashback_percent: Number(row.cashback_percent ?? 0),
    total_slots: Number(row.total_slots ?? 0),
    available_slots: Number(row.available_slots ?? 0),
    category: typeof row.category === "string" ? row.category : null,
    starts_at: typeof row.starts_at === "string" ? row.starts_at : null,
    expires_at: String(row.expires_at ?? ""),
    status: String(row.status ?? "DRAFT") as PromoRow["status"],
    created_at: String(row.created_at ?? new Date().toISOString()),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
    merchant: merchantRaw
      ? {
          id: String(merchantRaw.id),
          business_name:
            typeof merchantRaw.business_name === "string"
              ? merchantRaw.business_name
              : null,
          contact_name:
            typeof merchantRaw.contact_name === "string"
              ? merchantRaw.contact_name
              : null,
          email: typeof merchantRaw.email === "string" ? merchantRaw.email : null,
          phone: typeof merchantRaw.phone === "string" ? merchantRaw.phone : null,
          address: typeof merchantRaw.address === "string" ? merchantRaw.address : null,
          business_category:
            typeof merchantRaw.business_category === "string"
              ? merchantRaw.business_category
              : null,
          short_description:
            typeof merchantRaw.short_description === "string"
              ? merchantRaw.short_description
              : null,
          logo_url:
            typeof merchantRaw.logo_url === "string" ? merchantRaw.logo_url : null,
          status: String(merchantRaw.status ?? "UNKNOWN"),
        }
      : null,
  };
}

async function fetchPromoWithMerchant(admin: ReturnType<typeof requireAdmin> extends Promise<infer T>
  ? T extends { admin: infer A }
    ? A
    : never
  : never, promoId: string) {
  const full = await admin
    .from("promos")
    .select(FULL_PROMO_SELECT)
    .eq("id", promoId)
    .maybeSingle<Record<string, unknown>>();

  if (!full.error || !isMissingColumnError(full.error.message)) {
    if (!full.data || full.error) {
      return {
        data: null,
        error: full.error,
      };
    }

    return {
      data: normalizePromoRow(full.data),
      error: null,
    };
  }

  const fallback = await admin
    .from("promos")
    .select(FALLBACK_PROMO_SELECT)
    .eq("id", promoId)
    .maybeSingle<Record<string, unknown>>();

  if (!fallback.data || fallback.error) {
    return {
      data: null,
      error: fallback.error,
    };
  }

  return {
    data: normalizePromoRow(fallback.data),
    error: null,
  };
}

function firstOrNull<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function normalizeNullableString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const next = value.trim();
  return next.length > 0 ? next : null;
}

function normalizeRequiredString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const next = value.trim();
  return next.length > 0 ? next : null;
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function normalizeDateString(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> },
) {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  const { promoId } = await params;
  const { admin } = adminContext;

  const { data: promo, error: promoError } = await fetchPromoWithMerchant(admin, promoId);

  if (promoError) {
    return NextResponse.json({ error: promoError.message }, { status: 400 });
  }

  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  const { data: requests, error: requestError } = await admin
    .from("promo_change_requests")
    .select("id, promo_id, merchant_id, action, status, note, requested_changes, admin_note, created_at, reviewed_at")
    .eq("promo_id", promoId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 400 });
  }

  return NextResponse.json({
    promo: {
      ...promo,
      merchant: promo.merchant,
    },
    requests: (requests ?? []) as PromoRequestRow[],
    feeDefaults: {
      platformFeePercent: Number(config.platformFee),
      affiliateFeePercent: Number(config.affiliateFee),
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> },
) {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  const { promoId } = await params;
  const { admin, user } = adminContext;

  const { data: existing, error: existingError } = await fetchPromoWithMerchant(admin, promoId);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const updates: Record<string, unknown> = {};

  if ("title" in body) {
    const next = normalizeRequiredString(body.title);
    if (!next) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    updates.title = next;
  }

  if ("description" in body) {
    const next = normalizeRequiredString(body.description);
    if (!next) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }
    updates.description = next;
  }

  if ("image" in body) {
    const next = normalizeNullableString(body.image);
    if (next) {
      try {
        new URL(next);
      } catch {
        return NextResponse.json({ error: "Image must be a valid URL" }, { status: 400 });
      }
    }
    updates.image = next;
  }

  if ("category" in body) {
    updates.category = normalizeNullableString(body.category);
  }

  if ("original_price" in body) {
    const next = normalizeNumber(body.original_price);
    if (next === null || next <= 0) {
      return NextResponse.json({ error: "Original price must be greater than 0" }, { status: 400 });
    }
    updates.original_price = Number(next);
  }

  if ("discounted_price" in body) {
    const next = normalizeNumber(body.discounted_price);
    if (next === null || next <= 0) {
      return NextResponse.json({ error: "Discounted price must be greater than 0" }, { status: 400 });
    }
    updates.discounted_price = Number(next);
  }

  const effectiveOriginalPrice = Number(updates.original_price ?? existing.original_price);
  const effectiveDiscountedPrice = Number(updates.discounted_price ?? existing.discounted_price);
  if (effectiveDiscountedPrice >= effectiveOriginalPrice) {
    return NextResponse.json(
      { error: "Discounted price must be lower than original price" },
      { status: 400 },
    );
  }

  if ("cashback_percent" in body) {
    const next = normalizeNumber(body.cashback_percent);
    if (next === null || next < 0 || next > 100) {
      return NextResponse.json(
        { error: "Cashback percent must be between 0 and 100" },
        { status: 400 },
      );
    }
    updates.cashback_percent = Number(next);
  }

  if ("total_slots" in body) {
    const next = normalizeNumber(body.total_slots);
    if (next === null || !Number.isInteger(next) || next <= 0) {
      return NextResponse.json({ error: "Total slots must be a positive integer" }, { status: 400 });
    }

    const claimedSlots = Math.max(existing.total_slots - existing.available_slots, 0);
    if (next < claimedSlots) {
      return NextResponse.json(
        { error: "Total slots cannot be lower than already claimed slots" },
        { status: 400 },
      );
    }

    updates.total_slots = Number(next);
    updates.available_slots = Math.max(Number(next) - claimedSlots, 0);
  }

  if ("starts_at" in body) {
    const next = normalizeDateString(body.starts_at);
    if (body.starts_at != null && body.starts_at !== "" && !next) {
      return NextResponse.json({ error: "Starts at must be a valid date" }, { status: 400 });
    }
    updates.starts_at = next;
  }

  if ("expires_at" in body) {
    const next = normalizeDateString(body.expires_at);
    if (!next) {
      return NextResponse.json({ error: "Expires at must be a valid date" }, { status: 400 });
    }
    updates.expires_at = next;
  }

  const effectiveStartsAt = (updates.starts_at ?? existing.starts_at) as string | null;
  const effectiveExpiresAt = String(updates.expires_at ?? existing.expires_at);

  if (effectiveStartsAt && new Date(effectiveStartsAt) >= new Date(effectiveExpiresAt)) {
    return NextResponse.json(
      { error: "Starts at must be earlier than expires at" },
      { status: 400 },
    );
  }

  if ("status" in body) {
    if (!isStatusValue(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  const effectiveStatus = (updates.status ?? existing.status) as
    | "DRAFT"
    | "ACTIVE"
    | "PAUSED"
    | "SOLD_OUT"
    | "EXPIRED"
    | "DISABLED";
  const effectiveAvailableSlots = Number(updates.available_slots ?? existing.available_slots);

  updates.status = derivePromoStatus({
    status: effectiveStatus,
    availableSlots: effectiveAvailableSlots,
    expiresAt: effectiveExpiresAt,
  });
  updates.activity_state = getPromoActivityState(
    typeof updates.status === "string" ? updates.status : null,
  );

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  let updateResult = await admin
    .from("promos")
    .update(updates)
    .eq("id", promoId)
    .select(FULL_PROMO_SELECT)
    .maybeSingle<Record<string, unknown>>();

  if (updateResult.error && isMissingColumnError(updateResult.error.message)) {
    const retryPayload = { ...updates };
    for (const optionalColumn of OPTIONAL_PROMO_COLUMNS) {
      delete retryPayload[optionalColumn];
    }

    updateResult = await admin
      .from("promos")
      .update(retryPayload)
      .eq("id", promoId)
      .select(FALLBACK_PROMO_SELECT)
      .maybeSingle<Record<string, unknown>>();
  }

  const updateError = updateResult.error;
  const updated = updateResult.data ? normalizePromoRow(updateResult.data) : null;

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Promo not found after update" }, { status: 404 });
  }

  const feeSettings = {
    platformFeePercent: normalizeNumber(body.platformFeePercent),
    affiliateFeePercent: normalizeNumber(body.affiliateFeePercent),
  };

  await logAudit({
    action: "PROMO_UPDATED_BY_ADMIN",
    entityType: "promo",
    entityId: updated.id,
    userId: user.id,
    metadata: {
      promo_id: updated.id,
      merchant_id: updated.merchant_id,
      updates,
      fee_settings: feeSettings,
    },
  });

  return NextResponse.json({
    promo: {
      ...updated,
      merchant: updated.merchant,
    },
  });
}