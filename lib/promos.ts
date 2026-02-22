import { getPromoImageUrl } from "@/lib/promo-image";

export type PromoCardData = {
  id: string;
  merchantName: string;
  title: string;
  description: string;
  discountPercent: number;
  imageUrl?: string;
  distanceLabel: string;
  neighborhood: string;
  priceLabel: string;
  previewMode?: boolean;
  originalPrice: number;
  discountedPrice: number;
  cashbackPercent: number;
  totalSlots: number;
  availableSlots: number;
  status: string;
  isFeatured: boolean;
  category: string | null;
};

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  image?: string | null;
  merchant: { business_name: string } | null;
  status?: string;
  is_featured?: boolean;
  category?: string | null;
  total_slots?: number | string;
  available_slots?: number | string;
};

function toNumber(value: number | string): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getDiscountPercent(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0) return 0;
  const raw = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.max(0, Math.round(raw));
}

function getPriceLabel(discountedPrice: number): string {
  if (discountedPrice <= 12) return "$";
  if (discountedPrice <= 22) return "$$";
  if (discountedPrice <= 35) return "$$$";
  return "$$$$";
}

export function mapPromoRowToCard(row: PromoRow): PromoCardData {
  const originalPrice = toNumber(row.original_price);
  const discountedPrice = toNumber(row.discounted_price);
  const cashbackPercent = toNumber(row.cashback_percent);
  const totalSlots = toNumber(row.total_slots ?? 0);
  const availableSlots = toNumber(row.available_slots ?? 0);

  return {
    id: row.id,
    merchantName: row.merchant?.business_name ?? "Bonix partner",
    title: row.title,
    description: row.description,
    discountPercent: getDiscountPercent(originalPrice, discountedPrice),
    imageUrl: getPromoImageUrl(row.image),
    distanceLabel: "Nearby",
    neighborhood: "Bonix",
    priceLabel: getPriceLabel(discountedPrice),
    previewMode: false,
    originalPrice,
    discountedPrice,
    cashbackPercent,
    totalSlots,
    availableSlots,
    status: row.status ?? "ACTIVE",
    isFeatured: Boolean(row.is_featured),
    category: row.category ?? null,
  };
}
