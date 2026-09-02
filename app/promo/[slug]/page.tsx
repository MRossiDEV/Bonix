import { notFound } from "next/navigation";

import UserAppLayout from "@/app/components/UserAppLayout";

import { PromoDetailClient } from "./PromoDetailClient";

import { mapPromoRowToCard } from "@/lib/promos";

import { createClient } from "@/lib/supabase/server";

type PromoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type MerchantRow = {
  business_name: string;
  logo_url: string | null;
};

type PromoRow = {
  id: string;
  merchant_id: string;
  slug: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  image: string | null;
  gallery: string[] | null;
  category: string | null;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  expires_at: string;
  neighborhood: string | null;
  address: string | null;
  rating: number | null;
  reviews_count: number;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  shares_count: number;
  redemption_count: number;
  tags: string[] | null;

  merchants:
    | MerchantRow
    | MerchantRow[]
    | null;
};

export default async function PromoPage({
  params,
}: PromoPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

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
      category,
      total_slots,
      available_slots,
      status,
      is_featured,
      expires_at,
      neighborhood,
      address,
      rating,
      reviews_count,
      likes_count,
      comments_count,
      saves_count,
      shares_count,
      redemption_count,
      tags,

      merchants!promos_merchant_id_fkey (
        business_name,
        logo_url
      )
    `)
    .eq("activity_state", "ACTIVE")
    .eq("slug", slug)
    .gt(
      "expires_at",
      new Date().toISOString()
    )
    .gt("available_slots", 0)
    .single<PromoRow>();

  if (error || !data) {
    console.error(
      "PROMO FETCH ERROR:",
      error
    );

    notFound();
  }

  const merchant = Array.isArray(
    data.merchants
  )
    ? data.merchants[0]
    : data.merchants;

  const promo = mapPromoRowToCard({
    ...data,

    merchant: merchant
      ? {
          business_name:
            merchant.business_name,

          logo_url:
            merchant.logo_url,
        }
      : null,
  });

  return (
    <UserAppLayout
      basePath=""
      userName="Bonix Member"
      userEmail="member@bonix.app"
    >
      <PromoDetailClient
        promo={{
          ...promo,

          gallery:
            data.gallery ?? [],

          likesCount:
            data.likes_count ?? 0,

          
          commentsCount:
            data.comments_count ?? 0,

          savesCount:
            data.saves_count ?? 0,

          sharesCount:
            data.shares_count ?? 0,

          rating:
            data.rating ?? 4.8,

          reviewsCount:
            data.reviews_count ?? 0,

          address:
            data.address ??
            "Montevideo",

          neighborhood:
            data.neighborhood ??
            "Montevideo",
        }}
        feedHref="/feed"
        expiresAt={data.expires_at}
      />
    </UserAppLayout>
  );
}