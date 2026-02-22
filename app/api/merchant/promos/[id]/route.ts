import { NextRequest, NextResponse } from "next/server";

import {
  derivePromoStatus,
  getMerchantContextById,
  validatePromoInput,
} from "@/lib/merchant-promos";
import { createClient } from "@/lib/supabase/server";

type PromoRecord = {
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
  deleted_at: string | null;
};

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") &&
    (message.includes("deleted_at") ||
      message.includes("category") ||
      message.includes("starts_at") ||
      message.includes("image") ||
      message.includes("is_featured"))
  );
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function getOwnedPromo(id: string, merchantId: string) {
  const supabase = await createClient();
  const primary = await supabase
    .from("promos")
    .select(
      "id, merchant_id, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at, status, created_at, deleted_at",
    )
    .eq("id", id)
    .eq("merchant_id", merchantId)
    .is("deleted_at", null)
    .maybeSingle<PromoRecord>();

  if (!primary.error || !isMissingColumnError(primary.error.message)) {
    return primary;
  }

  const legacy = await supabase
    .from("promos")
    .select(
      "id, merchant_id, title, description, original_price, discounted_price, cashback_percent, total_slots, available_slots, expires_at, status, created_at",
    )
    .eq("id", id)
    .eq("merchant_id", merchantId)
    .maybeSingle<
      Omit<PromoRecord, "image" | "category" | "starts_at" | "deleted_at">
    >();

  if (legacy.error || !legacy.data) {
    return {
      data: null,
      error: legacy.error,
      count: legacy.count,
      status: legacy.status,
      statusText: legacy.statusText,
    };
  }

  return {
    data: {
      ...legacy.data,
      image: null,
      category: null,
      starts_at: null,
      deleted_at: null,
    },
    error: null,
    count: legacy.count,
    status: legacy.status,
    statusText: legacy.statusText,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const merchantId = new URL(request.url).searchParams.get("merchantId");
  const merchantResult = await getMerchantContextById(merchantId);
  if (!merchantResult.context) {
    return NextResponse.json(
      { error: merchantResult.error?.message ?? "Unauthorized" },
      { status: merchantResult.error?.status ?? 401 },
    );
  }

  const { id } = await params;
  const { data: promo, error } = await getOwnedPromo(
    id,
    merchantResult.context.merchantId,
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  const status = derivePromoStatus({
    status: promo.status,
    availableSlots: promo.available_slots,
    expiresAt: promo.expires_at,
  });

  return NextResponse.json({ promo: { ...promo, status } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const merchantId = new URL(request.url).searchParams.get("merchantId");
  const merchantResult = await getMerchantContextById(merchantId);
  if (!merchantResult.context) {
    return NextResponse.json(
      { error: merchantResult.error?.message ?? "Unauthorized" },
      { status: merchantResult.error?.status ?? 401 },
    );
  }

  return NextResponse.json(
    { error: "Direct promo edits are disabled. Submit an EDIT request for admin approval." },
    { status: 403 },
  );

  const { id } = await params;
  const { data: existing, error: existingError } = await getOwnedPromo(
    id,
    merchantResult.context.merchantId,
  );

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 400 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  if (isExpired(existing.expires_at)) {
    return NextResponse.json(
      { error: "Expired promos cannot be updated" },
      { status: 400 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const requestedStatus = body.status;
  if (requestedStatus !== undefined) {
    return NextResponse.json(
      { error: "Status changes require admin approval request" },
      { status: 403 },
    );
  }

  const nextInput = {
    title: body.title ?? existing.title,
    description: body.description ?? existing.description,
    image: body.image ?? existing.image,
    original_price: body.original_price ?? existing.original_price,
    discounted_price: body.discounted_price ?? existing.discounted_price,
    cashback_percent: existing.cashback_percent,
    total_slots: body.total_slots ?? existing.total_slots,
    category: body.category ?? existing.category,
    starts_at: body.starts_at ?? existing.starts_at,
    expires_at: body.expires_at ?? existing.expires_at,
  };

  const validated = validatePromoInput(nextInput);
  if (!validated.data) {
    return NextResponse.json({ errors: validated.errors }, { status: 400 });
  }

  const claimedSlots = Math.max(existing.total_slots - existing.available_slots, 0);
  const hasTotalSlotsChange = validated.data.total_slots !== existing.total_slots;
  if (hasTotalSlotsChange && validated.data.total_slots < claimedSlots) {
    return NextResponse.json(
      {
        error:
          "Total slots cannot be lower than already claimed slots",
      },
      { status: 400 },
    );
  }

  if (hasTotalSlotsChange) {
    const supabase = await createClient();
    const { count, error: redemptionError } = await supabase
      .from("redemptions")
      .select("id", { count: "exact", head: true })
      .eq("promo_id", existing.id);

    if (redemptionError) {
      return NextResponse.json({ error: redemptionError.message }, { status: 400 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Slots cannot be changed after redemptions exist" },
        { status: 400 },
      );
    }
  }

  let nextAvailableSlots = existing.available_slots;
  if (hasTotalSlotsChange) {
    nextAvailableSlots = Math.max(validated.data.total_slots - claimedSlots, 0);
  }

  let statusToPersist = existing.status;

  statusToPersist = derivePromoStatus({
    status: statusToPersist,
    availableSlots: nextAvailableSlots,
    expiresAt: validated.data.expires_at,
  });

  const supabase = await createClient();
  const { data: updated, error: updateError } = await supabase
    .from("promos")
    .update({
      title: validated.data.title,
      description: validated.data.description,
      image: validated.data.image,
      original_price: validated.data.original_price,
      discounted_price: validated.data.discounted_price,
      cashback_percent: validated.data.cashback_percent,
      total_slots: validated.data.total_slots,
      available_slots: nextAvailableSlots,
      category: validated.data.category,
      starts_at: validated.data.starts_at,
      expires_at: validated.data.expires_at,
      status: statusToPersist,
    })
    .eq("id", existing.id)
    .eq("merchant_id", merchantResult.context.merchantId)
    .is("deleted_at", null)
    .select(
      "id, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at, status, created_at",
    )
    .maybeSingle();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update promo" },
      { status: 400 },
    );
  }

  return NextResponse.json({ promo: updated });
}

export async function DELETE(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> },
) {
  return NextResponse.json(
    { error: "Delete requires admin approval request" },
    { status: 403 },
  );
}
