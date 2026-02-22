import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_PROMO_IMAGE } from "@/lib/promo-image";

export type PlatformSettings = {
  defaultCashbackPercent: number;
  maxPromosPerMerchant: number;
  defaultPromoImageUrl: string;
};

const DEFAULT_SETTINGS: PlatformSettings = {
  defaultCashbackPercent: 2,
  maxPromosPerMerchant: 10,
  defaultPromoImageUrl: DEFAULT_PROMO_IMAGE,
};

function isMissingSettingsTable(message: string): boolean {
  return message.toLowerCase().includes("platform_settings");
}

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platform_settings")
    .select("default_cashback_percent, max_promos_per_merchant, default_promo_image_url")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    if (isMissingSettingsTable(error.message)) {
      return DEFAULT_SETTINGS;
    }
    throw new Error(error.message);
  }

  if (!data) {
    return DEFAULT_SETTINGS;
  }

  return {
    defaultCashbackPercent: Number(data.default_cashback_percent ?? DEFAULT_SETTINGS.defaultCashbackPercent),
    maxPromosPerMerchant: Number(data.max_promos_per_merchant ?? DEFAULT_SETTINGS.maxPromosPerMerchant),
    defaultPromoImageUrl:
      typeof data.default_promo_image_url === "string" && data.default_promo_image_url.trim().length > 0
        ? data.default_promo_image_url.trim()
        : DEFAULT_SETTINGS.defaultPromoImageUrl,
  };
}
