import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function normalizeText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isMissingColumnError(message: string, column: string): boolean {
  const normalized = message.toLowerCase();
  return (
    normalized.includes(column.toLowerCase()) &&
    (normalized.includes("does not exist") || normalized.includes("schema cache"))
  );
}

function getMissingColumnFromError(message: string): string | null {
  const pgMatch = message.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (pgMatch?.[1]) {
    const raw = pgMatch[1].replaceAll('"', "");
    const parts = raw.split(".");
    return parts[parts.length - 1] || null;
  }

  const schemaCacheMatch = message.match(
    /could not find the '([^']+)' column of '[^']+' in the schema cache/i,
  );
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  return null;
}

const merchantSelectColumns = [
  "id",
  "business_name",
  "email",
  "business_category",
  "contact_name",
  "phone",
  "locations",
  "address",
  "short_description",
  "description",
  "status",
  "logo_url",
  "created_at",
] as const;

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missingColumns = new Set<string>();
  let businesses: Record<string, unknown>[] = [];
  let lastError: string | null = null;

  for (let attempt = 0; attempt < merchantSelectColumns.length; attempt += 1) {
    const selectColumns = merchantSelectColumns.filter(
      (column) => !missingColumns.has(column),
    );

    const query = await supabase
      .from("merchants")
      .select(selectColumns.join(", "))
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!query.error) {
      businesses = (query.data ?? []) as Record<string, unknown>[];
      lastError = null;
      break;
    }

    lastError = query.error.message;

    const missingColumn = getMissingColumnFromError(lastError);
    if (!missingColumn || !merchantSelectColumns.includes(missingColumn as (typeof merchantSelectColumns)[number])) {
      break;
    }

    missingColumns.add(missingColumn);
  }

  if (lastError && !businesses.length) {
    return NextResponse.json({ error: lastError }, { status: 400 });
  }

  return NextResponse.json({ businesses });
}

export async function POST(request: NextRequest) {
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

  const businessName = normalizeText(body.business_name);
  const email = normalizeText(body.email);
  const contactName = normalizeText(body.contact_name);
  const phone = normalizeText(body.phone);
  const businessCategory = normalizeText(body.business_category);
  const shortDescription = normalizeText(body.short_description);
  const address = normalizeText(body.address);
  const locations = Array.isArray(body.locations)
    ? body.locations.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : null;

  if (!businessName || !email || !contactName || !phone) {
    return NextResponse.json(
      { error: "business_name, email, contact_name, and phone are required" },
      { status: 400 },
    );
  }

  const primaryInsert = await supabase
    .from("merchants")
    .insert({
      user_id: user.id,
      business_name: businessName,
      email,
      contact_name: contactName,
      phone,
      business_category: businessCategory,
      short_description: shortDescription,
      description: shortDescription,
      address,
      locations,
      status: "PENDING",
    })
    .select("id, status")
    .maybeSingle();

  let createdBusiness = primaryInsert.data;
  let createError = primaryInsert.error;

  if (createError) {
    const normalizedError = createError.message.toLowerCase();
    if (normalizedError.includes("merchants_user_id_key")) {
      return NextResponse.json(
        {
          error:
            "Your database currently allows only one merchant account per user. Apply migration 021_allow_multiple_merchant_accounts.sql and try again.",
        },
        { status: 409 },
      );
    }

    const canFallback =
      isMissingColumnError(createError.message, "business_category") ||
      isMissingColumnError(createError.message, "short_description") ||
      isMissingColumnError(createError.message, "description") ||
      isMissingColumnError(createError.message, "address") ||
      isMissingColumnError(createError.message, "locations");

    if (!canFallback) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 },
      );
    }

    const fallbackInsert = await supabase
      .from("merchants")
      .insert({
        user_id: user.id,
        business_name: businessName,
        email,
        contact_name: contactName,
        phone,
        status: "PENDING",
      })
      .select("id, status")
      .maybeSingle();

    createdBusiness = fallbackInsert.data;
    createError = fallbackInsert.error;
  }

  if (createError || !createdBusiness) {
    return NextResponse.json(
      { error: createError?.message ?? "Failed to create business" },
      { status: 400 },
    );
  }

  return NextResponse.json({ business: createdBusiness }, { status: 201 });
}
