import { NextResponse } from "next/server";

import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";

type MerchantProfileEventType = "PROFILE_VIEW" | "PROMO_CLICK" | "PROFILE_SESSION";

type MerchantProfileAnalyticsPayload = {
  merchantId?: string;
  userId?: string;
  eventType?: MerchantProfileEventType;
  promoId?: string;
  timeOnPageMs?: number;
  scrollDepth?: number;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MerchantProfileAnalyticsPayload;

  try {
    payload = (await request.json()) as MerchantProfileAnalyticsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const merchantId = typeof payload.merchantId === "string" ? payload.merchantId : "";
  const eventType = payload.eventType;

  if (!isUuid(merchantId)) {
    return NextResponse.json({ error: "Invalid merchantId" }, { status: 400 });
  }

  if (eventType !== "PROFILE_VIEW" && eventType !== "PROMO_CLICK" && eventType !== "PROFILE_SESSION") {
    return NextResponse.json({ error: "Invalid eventType" }, { status: 400 });
  }

  const metadata: Record<string, unknown> = {
    event_type: eventType,
    page: "merchant_profile",
  };

  if (typeof payload.promoId === "string" && payload.promoId.trim()) {
    metadata.promo_id = payload.promoId.trim();
  }

  if (typeof payload.timeOnPageMs === "number" && Number.isFinite(payload.timeOnPageMs)) {
    metadata.time_on_page_ms = Math.max(0, Math.round(payload.timeOnPageMs));
  }

  if (typeof payload.scrollDepth === "number" && Number.isFinite(payload.scrollDepth)) {
    metadata.scroll_depth = Math.min(100, Math.max(0, Math.round(payload.scrollDepth)));
  }

  await logAudit({
    action: "MERCHANT_PROFILE_EVENT",
    entityType: "merchant_profile",
    entityId: merchantId,
    userId: user.id,
    metadata,
  });

  return NextResponse.json({ ok: true });
}
