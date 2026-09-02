import { useCallback, useEffect, useState } from "react";

import { mapPromoRowToCard } from "@/lib/promos";

import { FeedPromo, PAGE_SIZE, PromoRow } from "../types";

type UseFeedPromosResult = {
  promos: FeedPromo[];
  loading: boolean;
  loadingMore: boolean;
  errorMessage: string | null;
  hasMore: boolean;
  favoriteBusyMerchantId: string | null;
  loadMore: () => void;
  handleToggleFavorite: (merchantId: string, isFavorited: boolean) => Promise<void>;
};

export function useFeedPromos(): UseFeedPromosResult {
  const [promos, setPromos] = useState<FeedPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [favoriteBusyMerchantId, setFavoriteBusyMerchantId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPromos = async () => {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setErrorMessage(null);

      const res = await fetch(`/api/promos?limit=${PAGE_SIZE}&page=${page}`);
      if (!res.ok) throw new Error("Failed to load promos");

      const { promos } = (await res.json()) as { promos: PromoRow[] };
      if (!active) return;

      const mapped = promos.map((row) => {
        const card = mapPromoRowToCard(row);

        const expiringSoon = new Date(row.expires_at).getTime() - Date.now() < 1000 * 60 * 60 * 3;

        return {
          ...card,
          merchantId: row.merchant_id,
          isFavorited: Boolean(row.is_favorited),
          expiresAt: row.expires_at ?? new Date().toISOString(),
          activatedAt: row.activated_at ?? row.created_at ?? new Date().toISOString(),
          createdAt: row.created_at ?? new Date().toISOString(),
          soldOutDurationSeconds: row.status === "SOLD_OUT" ? (row.sold_out_duration_seconds ?? null) : null,
          remaining: Number(row.available_slots ?? 0),
          total: Number(row.total_slots ?? 0),
          hot: Number(row.available_slots ?? 0) <= 3 || expiringSoon,
        } satisfies FeedPromo;
      });

      setPromos((current) => (page === 1 ? mapped : [...current, ...mapped]));
      setHasMore(promos.length === PAGE_SIZE);
      setLoading(false);
      setLoadingMore(false);
    };

    fetchPromos().catch((err) => {
      if (!active) return;
      setErrorMessage(err.message);
      setLoading(false);
      setLoadingMore(false);
    });

    return () => {
      active = false;
    };
  }, [page]);

  const handleToggleFavorite = useCallback(
    async (merchantId: string, isFavorited: boolean) => {
      if (!merchantId || favoriteBusyMerchantId) {
        return;
      }

      setFavoriteBusyMerchantId(merchantId);
      setErrorMessage(null);

      const previous = promos;
      setPromos((current) =>
        current.map((promo) =>
          promo.merchantId === merchantId ? { ...promo, isFavorited: !isFavorited } : promo,
        ),
      );

      try {
        const response = await fetch("/api/favorites", {
          method: isFavorited ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ merchantId }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorites");
        }
      } catch (error) {
        setPromos(previous);
        setErrorMessage(error instanceof Error ? error.message : "Failed to update favorites");
      } finally {
        setFavoriteBusyMerchantId(null);
      }
    },
    [favoriteBusyMerchantId, promos],
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setPage((current) => current + 1);
  }, [loadingMore, hasMore]);

  return {
    promos,
    loading,
    loadingMore,
    errorMessage,
    hasMore,
    favoriteBusyMerchantId,
    loadMore,
    handleToggleFavorite,
  };
}
