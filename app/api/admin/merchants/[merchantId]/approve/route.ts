import { NextRequest, NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  const { merchantId } = await params;
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status }
    );
  }

  const { admin, user } = adminContext;

  let body: { reason?: string } = {};
  try {
    body = (await request.json()) as { reason?: string };
  } catch {
    body = {};
  }

  const { data: merchant, error: merchantError } = await admin
    .from("merchants")
    .update({ status: "ACTIVE" })
    .eq("id", merchantId)
    .select("id, status, user_id")
    .maybeSingle();

  if (merchantError) {
    return NextResponse.json({ error: merchantError.message }, { status: 400 });
  }

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert(
      { user_id: merchant.user_id, role: "MERCHANT" },
      { onConflict: "user_id,role" }
    );

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  await logAudit({
    action: "MERCHANT_APPROVED",
    entityType: "merchant",
    entityId: merchant.id,
    userId: user.id,
    metadata: {
      reason: body.reason ?? null,
      user_id: merchant.user_id,
    },
  });

  return NextResponse.json({ status: merchant.status, merchantId: merchant.id });
}
