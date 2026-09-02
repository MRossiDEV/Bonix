import { getPromoImageUrl } from "@/lib/promo-image";

import type { PromoCardData, PromoRow } from "@/types/promos";

export type { PromoCardData, PromoRow } from "@/types/promos";

function toNumber(value: number | string | undefined): number {
  if (typeof value === "number") return value;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function getDiscountPercent(
  originalPrice: number,
  discountedPrice: number,
): number {
  if (originalPrice <= 0) return 0;

  return Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100,
  );
}

function getPriceLabel(price: number): string {
  if (price <= 12) return "$";
  if (price <= 22) return "$$";
  if (price <= 40) return "$$$";

  return "$$$$";
}

export function mapPromoRowToCard(
  row: PromoRow,
): PromoCardData {
  const originalPrice = toNumber(row.original_price);

  const discountedPrice = toNumber(row.discounted_price);

  const merchant = Array.isArray(row.merchant) ? row.merchant[0] ?? null : row.merchant;

  return {
    id: row.id,

    slug: row.slug ?? row.id,

    merchantName:
      merchant?.business_name ?? "Bonix Partner",

    merchantLogoUrl:
      merchant?.logo_url ?? null,

    title: row.title,

    description: row.description,

    discountPercent: getDiscountPercent(
      originalPrice,
      discountedPrice,
    ),

    imageUrl: getPromoImageUrl(row.image),

    neighborhood:
      row.neighborhood ?? "Montevideo",

    distanceLabel: "Nearby",

    priceLabel: getPriceLabel(discountedPrice),

    originalPrice,

    discountedPrice,

    cashbackPercent: toNumber(
      row.cashback_percent,
    ),

    totalSlots: toNumber(row.total_slots),

    availableSlots: toNumber(
      row.available_slots,
    ),

    status: row.status ?? "ACTIVE",

    isFeatured: Boolean(row.is_featured),

    category: row.category ?? null,

    likesCount: toNumber(row.likes_count),

    viewsCount: toNumber(row.views_count),

    redemptionCount: toNumber(
      row.redemption_count,
    ),
  };
}