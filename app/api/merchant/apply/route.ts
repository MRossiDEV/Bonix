import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: {
    userId?: string;
    email?: string;
    businessName?: string;
    businessCategory?: string;
    locations?: string[];
    contactName?: string;
    phone?: string;
    shortDescription?: string;
    acceptTerms?: boolean;
  } = {};

  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    payload = {};
  }

  if (!payload.userId || payload.userId !== data.user.id) {
    return NextResponse.json({ error: "Invalid user" }, { status: 403 });
  }

  if (
    !payload.email ||
    !payload.businessName ||
    !payload.businessCategory ||
    !payload.locations?.length ||
    !payload.contactName ||
    !payload.phone ||
    !payload.shortDescription ||
    !payload.acceptTerms
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("merchants")
    .select("id, status")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (existing && existing.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Merchant application already exists" },
      { status: 409 }
    );
  }

  if (existing && existing.status === "REJECTED") {
    const { error: updateError } = await supabase
      .from("merchants")
      .update({
        email: payload.email,
        business_name: payload.businessName,
        business_category: payload.businessCategory,
        locations: payload.locations,
        contact_name: payload.contactName,
        phone: payload.phone,
        short_description: payload.shortDescription,
        terms_accepted_at: new Date().toISOString(),
        status: "PENDING",
      })
      .eq("id", existing.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await logAudit({
      action: "MERCHANT_REAPPLIED",
      entityType: "merchant",
      entityId: existing.id,
      userId: data.user.id,
    });

    return NextResponse.json({ status: "PENDING", merchantId: existing.id });
  }

  const { data: merchant, error } = await supabase
    .from("merchants")
    .insert({
      user_id: data.user.id,
      email: payload.email,
      business_name: payload.businessName,
      business_category: payload.businessCategory,
      locations: payload.locations,
      contact_name: payload.contactName,
      phone: payload.phone,
      short_description: payload.shortDescription,
      terms_accepted_at: new Date().toISOString(),
      status: "PENDING",
    })
    .select("id")
    .maybeSingle();

  if (error || !merchant) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 400 });
  }

  await logAudit({
    action: "MERCHANT_APPLIED",
    entityType: "merchant",
    entityId: merchant.id,
    userId: data.user.id,
  });

  return NextResponse.json({ status: "PENDING", merchantId: merchant.id });
}
