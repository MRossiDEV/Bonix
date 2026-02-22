"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { mapPromoRowToCard, PromoCardData } from "@/lib/promos";

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  image: string | null;
  expires_at: string;
  total_slots: number;
  available_slots: number;
  status: string;
  is_featured: boolean;
  category: string | null;
  sold_out_duration_seconds: number | null;
  merchant: { business_name: string } | null;
};

type FeedPromo = PromoCardData & {
  expiresAt: string;
  soldOutDurationSeconds: number | null;
  remaining: number;
  total: number;
  hot: boolean;
};

const fallbackGradients = [
  "from-[#FF7A00]/40 via-[#7B61FF]/30 to-[#00E5A8]/30",
  "from-[#00E5A8]/35 via-[#FF7A00]/30 to-[#7B61FF]/30",
  "from-[#7B61FF]/35 via-[#00E5A8]/30 to-[#FF7A00]/30",
];

type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdownParts(expiresAt: string, nowMs: number): CountdownParts {
  const end = new Date(expiresAt).getTime();
  const safeEnd = Number.isFinite(end) ? end : 0;
  const diffMs = Math.max(0, safeEnd - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { totalMs: diffMs, days, hours, minutes, seconds };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function formatDuration(totalSecondsRaw: number | null | undefined): string {
  const totalSeconds =
    typeof totalSecondsRaw === "number" && Number.isFinite(totalSecondsRaw)
      ? Math.max(0, Math.floor(totalSecondsRaw))
      : 0;

  if (totalSeconds === 0) return "under 1m";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

const PAGE_SIZE = 12;

export default function UserFeedPage() {
  const [promos, setPromos] = useState<FeedPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

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
          expiresAt: row.expires_at,
          soldOutDurationSeconds:
            row.status === "SOLD_OUT" ? row.sold_out_duration_seconds : null,
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
          const countdown = getCountdownParts(promo.expiresAt, nowMs);
          const soldOutIn = formatDuration(promo.soldOutDurationSeconds);
          const isSoldOut = promo.status === "SOLD_OUT";

          const disabled =
            promo.status === "SOLD_OUT" || promo.status === "EXPIRED";

          return (
            <motion.article
              key={promo.id}
              whileTap={{ scale: disabled ? 1 : 0.97 }}
              className={`overflow-hidden bg-[#121212] shadow-lg ${
                isSoldOut ? "ring-2 ring-[#EF4444]" : ""
              } ${
                disabled ? "opacity-50" : ""
              }`}
            >
              {/* IMAGE */}
              <div className="relative h-100 w-full">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    fallbackGradients[index % fallbackGradients.length]
                  }`}
                />
                {promo.imageUrl ? (
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    fill
                    sizes="100vw"
                    className="absolute inset-0 object-cover"
                  />
                ) : null}
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
                  {isSoldOut ? (
                    <span className="rounded-full bg-[#EF4444] px-3 py-1 text-xs font-bold text-white">
                      SOLD OUT
                    </span>
                  ) : null}
                </div>

                {isSoldOut ? (
                  <div className="absolute inset-x-0 top-0 border-b border-white/15 bg-[#7F1D1D]/90 px-4 py-2">
                    <p className="text-center text-xs font-semibold tracking-wide text-white">
                      Sold out in {soldOutIn}
                    </p>
                  </div>
                ) : null}

                <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/50 px-4 py-3">
                  {countdown.totalMs <= 0 ? (
                    <p className="text-center text-sm font-semibold tracking-wide text-[#FF7A00]">Expired</p>
                  ) : (
                    <div className="flex items-end justify-center gap-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold leading-none text-white">{pad2(countdown.days)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-300">d</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold leading-none text-white">{pad2(countdown.hours)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-300">h</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold leading-none text-white">{pad2(countdown.minutes)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-300">m</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold leading-none text-white">{pad2(countdown.seconds)}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-300">s</p>
                      </div>
                    </div>
                  )}
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