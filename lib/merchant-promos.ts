import { createClient } from "@/lib/supabase/server";

export const MERCHANT_PROMO_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "SOLD_OUT",
  "EXPIRED",
  "DISABLED",
] as const;

export type MerchantPromoStatus = (typeof MERCHANT_PROMO_STATUSES)[number];

export type PromoInputPayload = {
  title?: unknown;
  description?: unknown;
  original_price?: unknown;
  discounted_price?: unknown;
  cashback_percent?: unknown;
  total_slots?: unknown;
  category?: unknown;
  image?: unknown;
  starts_at?: unknown;
  expires_at?: unknown;
  status?: unknown;
};

export type NormalizedPromoInput = {
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  category: string | null;
  image: string | null;
  starts_at: string | null;
  expires_at: string;
};

export type MerchantContext = {
  userId: string;
  merchantId: string;
};

const EXPIRING_SOON_DAYS = 7;

function coerceNumber(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) {
    return input;
  }
  if (typeof input !== "string") {
    return null;
  }
  const parsed = Number(input.trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function coerceIsoDate(input: unknown): string | null {
  if (typeof input !== "string" || input.trim().length === 0) {
    return null;
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function derivePromoStatus({
  status,
  availableSlots,
  expiresAt,
}: {
  status: MerchantPromoStatus;
  availableSlots: number;
  expiresAt: string;
}): MerchantPromoStatus {
  const now = Date.now();
  const expiresAtTimestamp = new Date(expiresAt).getTime();

  if (Number.isFinite(expiresAtTimestamp) && expiresAtTimestamp <= now) {
    return "EXPIRED";
  }

  if (availableSlots <= 0) {
    return "SOLD_OUT";
  }

  return status;
}

export function validatePromoInput(
  payload: PromoInputPayload,
): { data?: NormalizedPromoInput; errors: string[] } {
  const errors: string[] = [];

  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  if (!title) {
    errors.push("Title is required");
  }

  const description =
    typeof payload.description === "string" ? payload.description.trim() : "";
  if (!description) {
    errors.push("Description is required");
  }

  const originalPrice = coerceNumber(payload.original_price);
  const discountedPrice = coerceNumber(payload.discounted_price);
  const cashbackPercent = coerceNumber(payload.cashback_percent ?? 0);
  const totalSlots = coerceNumber(payload.total_slots);

  if (originalPrice === null || originalPrice <= 0) {
    errors.push("Original price must be greater than 0");
  }

  if (discountedPrice === null || discountedPrice <= 0) {
    errors.push("Discounted price must be greater than 0");
  }

  if (
    originalPrice !== null &&
    discountedPrice !== null &&
    discountedPrice >= originalPrice
  ) {
    errors.push("Discounted price must be lower than original price");
  }

  if (cashbackPercent === null || cashbackPercent < 0 || cashbackPercent > 100) {
    errors.push("Cashback percent must be between 0 and 100");
  }

  if (totalSlots === null || !Number.isInteger(totalSlots) || totalSlots <= 0) {
    errors.push("Total slots must be a positive integer");
  }

  const startsAt = coerceIsoDate(payload.starts_at);
  if (payload.starts_at != null && payload.starts_at !== "" && !startsAt) {
    errors.push("Starts at must be a valid date");
  }

  const expiresAt = coerceIsoDate(payload.expires_at);
  if (!expiresAt) {
    errors.push("Expires at is required and must be a valid date");
  } else if (new Date(expiresAt).getTime() <= Date.now()) {
    errors.push("Expires at must be a future date");
  }

  if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
    errors.push("Starts at must be earlier than expires at");
  }

  const category =
    typeof payload.category === "string" && payload.category.trim().length > 0
      ? payload.category.trim()
      : null;

  const image =
    typeof payload.image === "string" && payload.image.trim().length > 0
      ? payload.image.trim()
      : null;

  if (image) {
    try {
      new URL(image);
    } catch {
      errors.push("Image must be a valid URL");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    errors: [],
    data: {
      title,
      description,
      original_price: Number(originalPrice),
      discounted_price: Number(discountedPrice),
      cashback_percent: Number(cashbackPercent),
      total_slots: Number(totalSlots),
      category,
      image,
      starts_at: startsAt,
      expires_at: String(expiresAt),
    },
  };
}

export function isStatusValue(value: unknown): value is MerchantPromoStatus {
  return (
    typeof value === "string" &&
    MERCHANT_PROMO_STATUSES.includes(value as MerchantPromoStatus)
  );
}

export async function getMerchantContext(): Promise<{
  context?: MerchantContext;
  error?: { status: number; message: string };
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { status: 401, message: "Unauthorized" } };
  }

  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !merchant) {
    return { error: { status: 403, message: "Merchant profile not found" } };
  }

  return { context: { userId: user.id, merchantId: merchant.id } };
}

export async function getMerchantContextById(
  merchantId: string | null | undefined,
): Promise<{
  context?: MerchantContext;
  error?: { status: number; message: string };
}> {
  const normalizedMerchantId = typeof merchantId === "string" ? merchantId.trim() : "";
  if (!normalizedMerchantId) {
    return getMerchantContext();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { status: 401, message: "Unauthorized" } };
  }

  const { data: merchant, error } = await supabase
    .from("merchants")
    .select("id")
    .eq("id", normalizedMerchantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !merchant) {
    return { error: { status: 403, message: "Merchant profile not found" } };
  }

  return { context: { userId: user.id, merchantId: merchant.id } };
}

export function buildExpiringSoonDateIso(): string {
  const date = new Date();
  date.setDate(date.getDate() + EXPIRING_SOON_DAYS);
  return date.toISOString();
}
