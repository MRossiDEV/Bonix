import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ClaimClient from "@/app/user/[userId]/reservations/[reservationId]/claim/ClaimClient";

type ReservationRow = {
  id: string;
  status: string;
  expires_at: string;
  promo: {
    title: string;
    discounted_price: number | string;
    cashback_percent: number | string;
    merchant: { business_name: string } | null;
  } | null;
};

type ReservationRowRaw = Omit<ReservationRow, "promo"> & {
  promo:
    | {
        title: string;
        discounted_price: number | string;
        cashback_percent: number | string;
        merchant: { business_name: string }[] | { business_name: string } | null;
      }
    | {
        title: string;
        discounted_price: number | string;
        cashback_percent: number | string;
        merchant: { business_name: string }[] | { business_name: string } | null;
      }[]
    | null;
};

export default async function ClaimPage({
  params,
}: Readonly<{ params: Promise<{ userId: string; reservationId: string }> }>) {
  const { userId, reservationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    redirect(`/user/${user.id}/reservations`);
  }

  const { data, error } = await supabase
    .from("reservations")
    .select(
      "id, status, expires_at, promo:promos!left (title, discounted_price, cashback_percent, merchant:merchants!left (business_name))",
    )
    .eq("id", reservationId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const raw = data as ReservationRowRaw;
  const promo = Array.isArray(raw.promo) ? raw.promo[0] ?? null : raw.promo;
  const merchant = promo?.merchant
    ? Array.isArray(promo.merchant)
      ? promo.merchant[0] ?? null
      : promo.merchant
    : null;

  if (!promo) {
    notFound();
  }

  const discountedPrice = Number(promo.discounted_price) || 0;
  const cashbackPercent = Number(promo.cashback_percent) || 0;

  return (
    <ClaimClient
      reservation={{
        id: raw.id,
        status: raw.status,
        expiresAt: raw.expires_at,
        promoTitle: promo.title,
        merchantName: merchant?.business_name ?? null,
        discountedPrice,
        cashbackPercent,
      }}
    />
  );
}
