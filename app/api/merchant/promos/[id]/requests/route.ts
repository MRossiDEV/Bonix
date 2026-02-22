import { NextRequest, NextResponse } from "next/server";

import { getMerchantContextById, validatePromoInput } from "@/lib/merchant-promos";
import { createClient } from "@/lib/supabase/server";

type PromoAction = "ACTIVATE" | "PAUSE" | "DEACTIVATE" | "DELETE" | "EDIT";

function isValidAction(value: unknown): value is PromoAction {
  return ["ACTIVATE", "PAUSE", "DEACTIVATE", "DELETE", "EDIT"].includes(String(value));
}

function isMissingDeletedAt(message: string): boolean {
  return message.includes("deleted_at") && message.includes("does not exist");
}

export async function POST(
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
  let body: {
    action?: unknown;
    note?: unknown;
    requestedChanges?: Record<string, unknown>;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (!isValidAction(body.action)) {
    return NextResponse.json({ error: "Invalid request action" }, { status: 400 });
  }

  const note = typeof body.note === "string" ? body.note.trim() : null;
  const supabase = await createClient();

  const primaryPromo = await supabase
    .from("promos")
    .select(
      "id, merchant_id, status, title, description, image, original_price, discounted_price, cashback_percent, total_slots, available_slots, category, starts_at, expires_at",
    )
    .eq("id", id)
    .eq("merchant_id", merchantResult.context.merchantId)
    .is("deleted_at", null)
    .maybeSingle();

  let promo = primaryPromo.data;
  let promoError = primaryPromo.error;

  if (!promo && promoError && isMissingDeletedAt(promoError.message)) {
    const legacyPromo = await supabase
      .from("promos")
      .select(
        "id, merchant_id, status, title, description, original_price, discounted_price, cashback_percent, total_slots, available_slots, expires_at",
      )
      .eq("id", id)
      .eq("merchant_id", merchantResult.context.merchantId)
      .maybeSingle();
    promo = legacyPromo.data;
    promoError = legacyPromo.error;
  }

  if (promoError) {
    return NextResponse.json({ error: promoError.message }, { status: 400 });
  }

  if (!promo) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  let requestedChanges: Record<string, unknown> | null = null;
  if (body.action === "EDIT") {
    if (!body.requestedChanges || typeof body.requestedChanges !== "object") {
      return NextResponse.json(
        { error: "Requested changes are required for edit requests" },
        { status: 400 },
      );
    }

    const candidate = {
      title: body.requestedChanges.title ?? promo.title,
      description: body.requestedChanges.description ?? promo.description,
      image: body.requestedChanges.image ?? promo.image ?? null,
      original_price: body.requestedChanges.original_price ?? promo.original_price,
      discounted_price: body.requestedChanges.discounted_price ?? promo.discounted_price,
      cashback_percent: promo.cashback_percent,
      total_slots: body.requestedChanges.total_slots ?? promo.total_slots,
      category: body.requestedChanges.category ?? promo.category ?? null,
      starts_at: body.requestedChanges.starts_at ?? promo.starts_at ?? null,
      expires_at: body.requestedChanges.expires_at ?? promo.expires_at,
    };

    const validated = validatePromoInput(candidate);
    if (!validated.data) {
      return NextResponse.json({ errors: validated.errors }, { status: 400 });
    }

    requestedChanges = {
      title: validated.data.title,
      description: validated.data.description,
      image: validated.data.image,
      original_price: validated.data.original_price,
      discounted_price: validated.data.discounted_price,
      total_slots: validated.data.total_slots,
      category: validated.data.category,
      starts_at: validated.data.starts_at,
      expires_at: validated.data.expires_at,
    };
  }

  const { data: existing } = await supabase
    .from("promo_change_requests")
    .select("id")
    .eq("promo_id", promo.id)
    .eq("action", body.action)
    .eq("status", "PENDING")
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "A pending request for this action already exists" },
      { status: 409 },
    );
  }

  const { data: created, error } = await supabase
    .from("promo_change_requests")
    .insert({
      promo_id: promo.id,
      merchant_id: promo.merchant_id,
      requested_by: merchantResult.context.userId,
      action: body.action,
      note,
      requested_changes: requestedChanges,
      status: "PENDING",
    })
    .select("id, promo_id, action, status, requested_changes, created_at")
    .maybeSingle();

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to submit request" },
      { status: 400 },
    );
  }

  return NextResponse.json({ request: created }, { status: 201 });
}
