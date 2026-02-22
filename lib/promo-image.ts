export const DEFAULT_PROMO_IMAGE = "/promo-placeholder.svg";

export function getPromoImageUrl(image: string | null | undefined): string {
  if (typeof image !== "string") {
    return DEFAULT_PROMO_IMAGE;
  }

  const trimmed = image.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_PROMO_IMAGE;
}