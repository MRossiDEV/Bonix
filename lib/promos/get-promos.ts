import { mapPromoRowToCard } from "@/lib/promos";
import { createClient } from "@/lib/supabase/client";
import type { PromoCardData } from "@/types/promos";

export default async function getActivePromos(): Promise<PromoCardData[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("promos")
    .select(`
      id,
      merchant_id,
      slug,

      title,
      description,

      original_price,
      discounted_price,
      cashback_percent,

      image,
      gallery,

      expires_at,

      total_slots,
      available_slots,

      status,
      activity_state,

      is_featured,

      category,

      views_count,
      likes_count,
      comments_count,
      saves_count,
      shares_count,
      redemption_count,

      neighborhood,
      address,

      rating,
      reviews_count,

      tags,

      created_at,

      merchants!promos_merchant_id_fkey (
        business_name,
        logo_url,
        neighborhood
      )
    `)
    .eq("activity_state", "ACTIVE")
    .gt("available_slots", 0)
    .gt("expires_at", new Date().toISOString())
    .order("is_featured", {
      ascending: false,
    })
    .order("redemption_count", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "SUPABASE PROMOS ERROR:",
      error.message,
      error.details,
      error.hint,
    );

    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((promo) => {
    const merchant = Array.isArray(promo.merchants)
      ? promo.merchants[0]
      : promo.merchants;

    return mapPromoRowToCard({
      ...promo,
      slug: promo.slug ?? String(promo.id),
      merchant: merchant
        ? {
            business_name: merchant.business_name,
            logo_url: merchant.logo_url ?? null,
            neighborhood: merchant.neighborhood ?? null,
          }
        : null,
      neighborhood: promo.neighborhood ?? merchant?.neighborhood ?? "Montevideo",
      category: promo.category ?? null,
      is_featured: Boolean(promo.is_featured),
      views_count: promo.views_count ?? 0,
      likes_count: promo.likes_count ?? 0,
      comments_count: promo.comments_count ?? 0,
      saves_count: promo.saves_count ?? 0,
      shares_count: promo.shares_count ?? 0,
      redemption_count: promo.redemption_count ?? 0,
      rating: promo.rating ?? null,
      reviews_count: promo.reviews_count ?? 0,
      tags: Array.isArray(promo.tags) ? promo.tags : [],
      created_at: promo.created_at ?? new Date().toISOString(),
    });
  });
}