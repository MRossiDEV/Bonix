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
  _context: { params: Promise<{ id: string }> },
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
