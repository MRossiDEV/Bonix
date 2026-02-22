import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function normalizeText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMissingColumnFromError(message: string): string | null {
  const pgMatch = message.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (pgMatch?.[1]) {
    const raw = pgMatch[1].replaceAll('"', "");
    const parts = raw.split(".");
    return parts[parts.length - 1] || null;
  }

  const schemaCacheMatch = message.match(/could not find the '([^']+)' column of '[^']+' in the schema cache/i);
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const payload = {
    business_name: normalizeText(body.business_name),
    email: normalizeText(body.email),
    contact_name: normalizeText(body.contact_name),
    phone: normalizeText(body.phone),
    business_category: normalizeText(body.business_category),
    short_description: normalizeText(body.short_description),
    description: normalizeText(body.short_description),
    address: normalizeText(body.address),
    locations: Array.isArray(body.locations)
      ? body.locations.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : null,
  };

  const updatePayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  let safePayload = { ...updatePayload };
  let data: Record<string, unknown> | null = null;
  let lastError: { message: string } | null = null;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const updateResult = await supabase
      .from("merchants")
      .update(safePayload)
      .eq("id", businessId)
      .eq("user_id", user.id)
      .select("id, business_name, email, contact_name, phone, status, created_at")
      .maybeSingle();

    data = (updateResult.data as Record<string, unknown> | null) ?? null;
    lastError = updateResult.error ? { message: updateResult.error.message } : null;

    if (!lastError) {
      break;
    }

    const missingColumn = getMissingColumnFromError(lastError.message);
    if (!missingColumn || !(missingColumn in safePayload)) {
      break;
    }

    delete safePayload[missingColumn as keyof typeof safePayload];

    if (Object.keys(safePayload).length === 0) {
      break;
    }
  }

  if (lastError || !data) {
    return NextResponse.json(
      { error: lastError?.message ?? "Business not found" },
      { status: 400 },
    );
  }

  return NextResponse.json({ business: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count, error: promoCountError } = await supabase
    .from("promos")
    .select("id", { count: "exact", head: true })
    .eq("merchant_id", businessId);

  if (promoCountError) {
    return NextResponse.json({ error: promoCountError.message }, { status: 400 });
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "Cannot delete business with promos. Remove promos first." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("merchants")
    .delete()
    .eq("id", businessId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
