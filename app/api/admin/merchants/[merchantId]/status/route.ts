import { NextRequest, NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";

const allowedStatuses = [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "INACTIVE",
  "PAUSED",
];

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

  let body: { status?: string } = {};
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    body = {};
  }

  const nextStatus = body.status?.toUpperCase();
  if (!nextStatus || !allowedStatuses.includes(nextStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: merchant, error: merchantError } = await admin
    .from("merchants")
    .update({ status: nextStatus })
    .eq("id", merchantId)
    .select("id, status, user_id")
    .maybeSingle();

  if (merchantError) {
    return NextResponse.json({ error: merchantError.message }, { status: 400 });
  }

  if (!merchant) {
    return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
  }

  if (nextStatus === "ACTIVE") {
    const { error: roleError } = await admin
      .from("user_roles")
      .upsert(
        { user_id: merchant.user_id, role: "MERCHANT" },
        { onConflict: "user_id,role" }
      );

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 400 });
    }
  }

  await logAudit({
    action: "MERCHANT_STATUS_UPDATED",
    entityType: "merchant",
    entityId: merchant.id,
    userId: user.id,
    metadata: {
      status: nextStatus,
      user_id: merchant.user_id,
    },
  });

  return NextResponse.json({ status: merchant.status, merchantId: merchant.id });
}
