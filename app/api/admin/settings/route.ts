import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { getPlatformSettings } from "@/lib/platform-settings";
import { DEFAULT_PROMO_IMAGE } from "@/lib/promo-image";

export async function GET() {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  const settings = await getPlatformSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const adminContext = await requireAdmin();
  if ("error" in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status },
    );
  }

  let body: {
    defaultCashbackPercent?: unknown;
    maxPromosPerMerchant?: unknown;
    defaultPromoImageUrl?: unknown;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const cashback = Number(body.defaultCashbackPercent);
  const limit = Number(body.maxPromosPerMerchant);

  if (!Number.isFinite(cashback) || cashback < 0 || cashback > 100) {
    return NextResponse.json(
      { error: "Default cashback percent must be between 0 and 100" },
      { status: 400 },
    );
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    return NextResponse.json(
      { error: "Max promos per merchant must be a positive integer" },
      { status: 400 },
    );
  }

  const rawImageUrl =
    typeof body.defaultPromoImageUrl === "string"
      ? body.defaultPromoImageUrl.trim()
      : DEFAULT_PROMO_IMAGE;

  const imageUrl = rawImageUrl.length > 0 ? rawImageUrl : DEFAULT_PROMO_IMAGE;

  const isAbsolutePath = imageUrl.startsWith("/");
  const isHttpUrl = imageUrl.startsWith("http://") || imageUrl.startsWith("https://");
  if (!isAbsolutePath && !isHttpUrl) {
    return NextResponse.json(
      { error: "Default promo image must be an absolute path or a valid http(s) URL" },
      { status: 400 },
    );
  }

  const { admin } = adminContext;
  const { data, error } = await admin
    .from("platform_settings")
    .upsert(
      {
        id: true,
        default_cashback_percent: cashback,
        max_promos_per_merchant: limit,
        default_promo_image_url: imageUrl,
      },
      { onConflict: "id" },
    )
    .select("default_cashback_percent, max_promos_per_merchant, default_promo_image_url")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    settings: {
      defaultCashbackPercent: Number(data?.default_cashback_percent ?? cashback),
      maxPromosPerMerchant: Number(data?.max_promos_per_merchant ?? limit),
      defaultPromoImageUrl:
        typeof data?.default_promo_image_url === "string" && data.default_promo_image_url.trim().length > 0
          ? data.default_promo_image_url.trim()
          : imageUrl,
    },
  });
}
