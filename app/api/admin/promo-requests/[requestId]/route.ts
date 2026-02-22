import { NextRequest, NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { requireAdmin } from "@/lib/admin";
import { getPromoActivityState } from "@/lib/promo-activity-state";

type Decision = "APPROVED" | "REJECTED";
type PromoAction = "ACTIVATE" | "PAUSE" | "DEACTIVATE" | "DELETE" | "EDIT";

function isDecision(value: unknown): value is Decision {
  return value === "APPROVED" || value === "REJECTED";
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> },
) {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  const { requestId } = await params;
  let body: {
    decision?: unknown;
    adminNote?: unknown;
    promoUpdates?: {
      cashback_percent?: unknown;
      status?: unknown;
    };
    feeSettings?: {
      platformFeePercent?: unknown;
      affiliateFeePercent?: unknown;
    };
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  if (!isDecision(body.decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const adminNote = typeof body.adminNote === "string" ? body.adminNote.trim() : null;
  const { admin, user } = adminContext;

  const { data: requestRow, error: requestError } = await admin
    .from("promo_change_requests")
    .select("id, promo_id, action, status, requested_changes")
    .eq("id", requestId)
    .maybeSingle<{
      id: string;
      promo_id: string;
      action: PromoAction;
      status: string;
      requested_changes: Record<string, unknown> | null;
    }>();

  if (requestError) {
    return NextResponse.json({ error: requestError.message }, { status: 400 });
  }

  if (!requestRow) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (requestRow.status !== "PENDING") {
    return NextResponse.json({ error: "Request already resolved" }, { status: 400 });
  }

  if (body.decision === "APPROVED") {
    const updatePayload: Record<string, unknown> = {};
    if (body.promoUpdates) {
      if ("cashback_percent" in body.promoUpdates) {
        const nextCashback = Number(body.promoUpdates.cashback_percent);
        if (!Number.isFinite(nextCashback) || nextCashback < 0 || nextCashback > 100) {
          return NextResponse.json(
            { error: "Cashback percent must be between 0 and 100" },
            { status: 400 },
          );
        }
        updatePayload.cashback_percent = Number(nextCashback);
      }

      if ("status" in body.promoUpdates && body.promoUpdates.status !== undefined) {
        const nextStatus = String(body.promoUpdates.status ?? "").toUpperCase();
        const allowedStatuses = ["DRAFT", "ACTIVE", "PAUSED", "SOLD_OUT", "EXPIRED", "DISABLED"];
        if (!allowedStatuses.includes(nextStatus)) {
          return NextResponse.json({ error: "Invalid promo status" }, { status: 400 });
        }
        updatePayload.status = nextStatus;
      }
    }

    if (requestRow.action === "ACTIVATE") {
      updatePayload.status = "ACTIVE";
    } else if (requestRow.action === "PAUSE") {
      updatePayload.status = "PAUSED";
    } else if (requestRow.action === "DEACTIVATE") {
      updatePayload.status = "DISABLED";
    } else if (requestRow.action === "DELETE") {
      updatePayload.deleted_at = new Date().toISOString();
    } else if (requestRow.action === "EDIT") {
      if (!requestRow.requested_changes) {
        return NextResponse.json(
          { error: "Edit request is missing requested changes" },
          { status: 400 },
        );
      }

      const allowedKeys = [
        "title",
        "description",
        "image",
        "original_price",
        "discounted_price",
        "cashback_percent",
        "total_slots",
        "category",
        "starts_at",
        "expires_at",
      ] as const;

      for (const key of allowedKeys) {
        if (key in requestRow.requested_changes) {
          const nextValue = requestRow.requested_changes[key];
          if (nextValue !== undefined) {
            updatePayload[key] = nextValue;
          }
        }
      }
    }

    if ("status" in updatePayload) {
      updatePayload.activity_state = getPromoActivityState(
        typeof updatePayload.status === "string" ? updatePayload.status : null,
      );
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: "No valid promo changes found to apply" },
        { status: 400 },
      );
    }

    const { data: updatedPromo, error: promoError } = await admin
      .from("promos")
      .update(updatePayload)
      .eq("id", requestRow.promo_id)
      .select("id, title, description, image, original_price, discounted_price, total_slots, category, starts_at, expires_at, status")
      .maybeSingle();

    if (promoError) {
      return NextResponse.json({ error: promoError.message }, { status: 400 });
    }

    if (!updatedPromo) {
      return NextResponse.json(
        { error: "Promo not found while applying approved request" },
        { status: 404 },
      );
    }
  }

  const { data: resolved, error: resolveError } = await admin
    .from("promo_change_requests")
    .update({
      status: body.decision,
      admin_note: adminNote,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestRow.id)
    .eq("status", "PENDING")
    .select("id, status, action, promo_id")
    .maybeSingle();

  if (resolveError || !resolved) {
    return NextResponse.json(
      { error: resolveError?.message ?? "Failed to resolve request" },
      { status: 400 },
    );
  }

  await logAudit({
    action: "PROMO_CHANGE_REQUEST_REVIEWED",
    entityType: "promo_change_request",
    entityId: resolved.id,
    userId: user.id,
    metadata: {
      decision: body.decision,
      promo_id: resolved.promo_id,
      action: resolved.action,
      admin_note: adminNote,
      promo_updates: body.promoUpdates ?? null,
      fee_settings: body.feeSettings ?? null,
    },
  });

  return NextResponse.json({ request: resolved });
}
