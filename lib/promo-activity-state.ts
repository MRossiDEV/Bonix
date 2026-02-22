export type PromoActivityState = "ACTIVE" | "UNACTIVE";

export function getPromoActivityState(status: string | null | undefined): PromoActivityState {
  return String(status ?? "").toUpperCase() === "ACTIVE" ? "ACTIVE" : "UNACTIVE";
}