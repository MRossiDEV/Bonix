import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// useActivePromoForBuilding (PRD §78)
// Given a merchantId, returns the merchant's currently active promo
// (status='ACTIVE' AND expires_at > now). Returns null when no active
// promo is found, which keeps the engine rendering the base building
// without a promo indicator.
//
// Discount percent is derived from original_price vs discounted_price
// so we can show the "20% OFF" chip without any extra column.

type PromoRow = {
  id: string;
  original_price: number | string;
  discounted_price: number | string;
  expires_at: string;
  status: string;
};

export type BuildingPromo = {
  promoId: string;
  label: string;
  expiresAt: string;
  discountPercent: number;
};

function formatDiscount(promo: PromoRow): BuildingPromo | null {
  const original = Number(promo.original_price);
  const discounted = Number(promo.discounted_price);
  if (!Number.isFinite(original) || !Number.isFinite(discounted)) return null;
  if (original <= 0 || discounted <= 0) return null;
  if (discounted >= original) return null;
  const pct = Math.round(((original - discounted) / original) * 100);
  if (pct <= 0) return null;
  return {
    promoId: promo.id,
    label: `${pct}% OFF`,
    expiresAt: promo.expires_at,
    discountPercent: pct,
  };
}

async function fetchActivePromo(
  merchantId: string,
): Promise<BuildingPromo | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("promos")
    .select("id, original_price, discounted_price, expires_at, status")
    .eq("merchant_id", merchantId)
    .eq("status", "ACTIVE")
    .gt("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return formatDiscount(data);
}

export function useActivePromoForBuilding(
  merchantId: string | null | undefined,
): BuildingPromo | null {
  const [promo, setPromo] = useState<BuildingPromo | null>(null);

  useEffect(() => {
    if (!merchantId) {
      setPromo(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      const result = await fetchActivePromo(merchantId);
      if (!cancelled) setPromo(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [merchantId]);

  return promo;
}

export function useActivePromosForBuildings(
  merchantIds: string[],
): Record<string, BuildingPromo | null> {
  const stableKey = useMemo(() => merchantIds.slice().sort().join("|"), [merchantIds]);
  const [byId, setById] = useState<Record<string, BuildingPromo | null>>({});

  useEffect(() => {
    if (merchantIds.length === 0) {
      setById({});
      return;
    }

    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      if (!supabase) {
        if (!cancelled) {
          const empty: Record<string, BuildingPromo | null> = {};
          for (const id of merchantIds) empty[id] = null;
          setById(empty);
        }
        return;
      }

      const { data, error } = await supabase
        .from("promos")
        .select("id, merchant_id, original_price, discounted_price, expires_at, status")
        .in("merchant_id", merchantIds)
        .eq("status", "ACTIVE")
        .gt("expires_at", new Date().toISOString())
        .order("expires_at", { ascending: true });

      if (cancelled) return;

      const next: Record<string, BuildingPromo | null> = {};
      for (const id of merchantIds) next[id] = null;
      if (!error && data) {
        for (const promo of data) {
          // first one per merchant wins (they're sorted by expires_at ASC)
          if (next[promo.merchant_id] !== null) continue;
          const formatted = formatDiscount(promo);
          if (formatted) {
            next[promo.merchant_id] = formatted;
          }
        }
      }
      setById(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [stableKey]);

  return byId;
}
