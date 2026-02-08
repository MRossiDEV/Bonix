"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";

import { mapPromoRowToCard, PromoCardData } from "@/lib/promos";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  expires_at: string;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  category: string | null;
  merchant: { business_name: string } | null;
};

type FeedPromo = PromoCardData & {
  expiresIn: string;
  remaining: number;
  total: number;
  hot: boolean;
};

const fallbackGradients = [
  "from-[#FF7A00]/40 via-[#7B61FF]/30 to-[#00E5A8]/30",
  "from-[#00E5A8]/35 via-[#FF7A00]/30 to-[#7B61FF]/30",
  "from-[#7B61FF]/35 via-[#00E5A8]/30 to-[#FF7A00]/30",
];

const formatExpiresIn = (expiresAt: string) => {
  const now = Date.now();
  const end = new Date(expiresAt).getTime();
  const diffMs = Math.max(0, end - now);
  const totalSeconds = Math.floor(diffMs / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const PAGE_SIZE = 12;

export default function UserFeedPage() {
  const [promos, setPromos] = useState<FeedPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

        const expiringSoon =
          new Date(row.expires_at).getTime() - Date.now() < 1000 * 60 * 60 * 3;

        return {
          ...card,
          expiresIn: formatExpiresIn(row.expires_at),
          remaining: row.available_slots,
          total: row.total_slots,
          hot: row.available_slots <= 3 || expiringSoon,
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

  return (
    <section className="space-y-8 pb-24">
      {/* HEADER */}
      <div className="px-4">
        <h2 className="text-2xl font-bold tracking-tight">Live Drops 🔥</h2>
        <p className="mt-1 text-sm text-gray-400">
          Limited offers happening right now
        </p>
      </div>

      {/* FEED */}
      <div className="space-y-6">
        {loading && (
          <p className="px-4 text-sm text-gray-400">Loading promos...</p>
        )}

        {!loading && errorMessage && (
          <p className="px-4 text-sm text-[#FF7A00]">
            Unable to load promos.
          </p>
        )}

        {!loading && !errorMessage && promos.length === 0 && (
          <p className="px-4 text-sm text-gray-400">
            No promos available right now.
          </p>
        )}

        {promos.map((promo, index) => {
          const progress =
            promo.total > 0
              ? ((promo.total - promo.remaining) / promo.total) * 100
              : 0;

          const disabled =
            promo.status === "SOLD_OUT" || promo.status === "EXPIRED";

          return (
            <motion.article
              key={promo.id}
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              className={`overflow-hidden rounded-3xl bg-[#121212] shadow-lg ${
                disabled ? "opacity-50" : ""
              }`}
            >
              {/* IMAGE */}
              <div className="relative h-52">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    fallbackGradients[index % fallbackGradients.length]
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* BADGES */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {promo.isFeatured && (
                    <span className="rounded-full bg-[#7B61FF] px-3 py-1 text-xs font-bold">
                      ⭐ Featured
                    </span>
                  )}
                  {!promo.isFeatured && promo.hot && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">
                      🔥 Hot
                    </span>
                  )}
                  <span className="rounded-full bg-black/80 px-3 py-1 text-xs">
                    ⏳ {promo.expiresIn}
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400">
                    {promo.merchantName} · {promo.category}
                  </p>
                  <h3 className="text-xl font-semibold">{promo.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    📍 {promo.distanceLabel}
                  </p>
                </div>

                {/* PRICE */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold">
                      ${promo.discountedPrice}
                    </p>
                    <p className="text-xs text-gray-500 line-through">
                      ${promo.originalPrice}
                    </p>
                  </div>
                  <p className="text-xs text-[#00E5A8]">
                    +{promo.cashbackPercent}% cashback
                  </p>
                </div>

                {/* SCARCITY */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      🎟️ {promo.remaining} left
                    </span>
                    <span className="text-gray-500">
                      {promo.total} total
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A]">
                    <div
                      className={`h-full rounded-full ${
                        promo.remaining <= 3
                          ? "bg-red-500"
                          : promo.remaining <= 7
                          ? "bg-yellow-400"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/promo/${promo.id}`}
                  className={`block w-full rounded-2xl py-4 text-center text-sm font-bold ${
                    disabled
                      ? "bg-[#2A2A2A] text-gray-500"
                      : "bg-[#FF7A00] text-black"
                  }`}
                >
                  {promo.status === "SOLD_OUT"
                    ? "Sold out"
                    : promo.status === "EXPIRED"
                    ? "Expired"
                    : "Unlock deal"}
                </Link>
              </div>
            </motion.article>
          );
        })}

        {!loading && !errorMessage && hasMore ? (
          <div className="px-4">
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={loadingMore}
              className="w-full rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] py-3 text-sm font-semibold text-[#FAFAFA]"
            >
              {loadingMore ? "Loading more..." : "Load more"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}