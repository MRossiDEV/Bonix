import { notFound, redirect } from "next/navigation";

import PromoForm from "../../PromoForm";
import { createClient } from "@/lib/supabase/server";

type PromoFormRow = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  category: string | null;
  original_price: number;
  discounted_price: number;
  cashback_percent: number;
  total_slots: number;
  available_slots: number;
  starts_at: string | null;
  expires_at: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "SOLD_OUT" | "EXPIRED" | "DISABLED";
};

function isMissingColumnError(message: string): boolean {
  return (
    message.includes("does not exist") &&
    (message.includes("deleted_at") ||
      message.includes("image") ||
      message.includes("category") ||
      message.includes("starts_at"))
  );
}

export default async function MerchantPromoEditPage({
  params,
}: Readonly<{ params: Promise<{ merchantId: string; id: string }> }>) {
  const { merchantId, id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: merchant } = await supabase
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!merchant) {
    notFound();
  }

  const primaryPromo = await supabase
    .from("promos")
    .select(
      "id, title, description, image, category, original_price, discounted_price, cashback_percent, total_slots, available_slots, starts_at, expires_at, status",
    )
    .eq("id", id)
    .eq("merchant_id", merchant.id)
    .is("deleted_at", null)
    .maybeSingle<PromoFormRow>();

  let promo = primaryPromo.data;

  if (!promo && primaryPromo.error && isMissingColumnError(primaryPromo.error.message)) {
    const legacyPromo = await supabase
      .from("promos")
      .select(
        "id, title, description, original_price, discounted_price, cashback_percent, total_slots, available_slots, expires_at, status",
      )
      .eq("id", id)
      .eq("merchant_id", merchant.id)
      .maybeSingle<
        Omit<PromoFormRow, "image" | "category" | "starts_at">
      >();

    if (legacyPromo.data) {
      promo = {
        ...legacyPromo.data,
        image: null,
        category: null,
        starts_at: null,
      };
    }
  }

  if (!promo) {
    notFound();
  }

  return <PromoForm merchantId={merchantId} mode="edit" initialPromo={promo} />;
}
