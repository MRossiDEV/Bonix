"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { CategoryChips } from "./components/CategoryChips";
import { PromoCard } from "./components/PromoCard";
import { PromoPreviewModal } from "./components/PromoPreviewModal";
import { useDailyProgress } from "./hooks/useDailyProgress";
import { useFeedPromos } from "./hooks/useFeedPromos";
import { useNow } from "./hooks/useNow";

const CATEGORY_FILTER_STORAGE_KEY = "bonix:feed-category-filter";

type DiscoverPlace = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  rating: string;
  distance: string;
  gradient: string;
};

const DISCOVER_PLACES: DiscoverPlace[] = [
  {
    id: "discover-1",
    name: "La Cocina Verde",
    category: "Restaurant",
    emoji: "🍃",
    rating: "4.8",
    distance: "0.8 km",
    gradient: "from-emerald-500/30 to-teal-950",
  },
  {
    id: "discover-2",
    name: "Montevideo Brew",
    category: "Café",
    emoji: "☕",
    rating: "4.7",
    distance: "1.2 km",
    gradient: "from-amber-500/30 to-orange-950",
  },
  {
    id: "discover-3",
    name: "Casa Nómada",
    category: "Restaurant",
    emoji: "🏡",
    rating: "4.9",
    distance: "1.6 km",
    gradient: "from-violet-500/30 to-purple-950",
  },
];

export default function UserFeedPage() {
  const params = useParams<{ userId?: string | string[] }>();

  const userId = Array.isArray(params?.userId)
    ? params.userId[0]
    : (params?.userId ?? "");

  const nowMs = useNow();

  const [activePreviewPromoId, setActivePreviewPromoId] =
    useState<string | null>(null);

  const [activeCategoryId, setActiveCategoryId] = useState("all");

  const [favoritePlaces, setFavoritePlaces] = useState<string[]>([]);

  const {
    promos,
    loading,
    loadingMore,
    errorMessage,
    hasMore,
    loadMore,
  } = useFeedPromos();

  const todayKey = useMemo(
    () => new Date(nowMs).toISOString().slice(0, 10),
    [nowMs],
  );

  const { incrementDailyCreditsUsed } = useDailyProgress(todayKey);

  const categoryOptions = useMemo(() => {
    const categoryMap = new Map<string, string>();

    promos.forEach((promo) => {
      const value = promo.category?.trim();

      if (!value) return;

      const key = value.toLowerCase();

      if (!categoryMap.has(key)) {
        categoryMap.set(key, value);
      }
    });

    return [
      { id: "all", label: "All" },
      ...Array.from(categoryMap, ([id, label]) => ({
        id,
        label,
      })),
    ];
  }, [promos]);

  const filteredPromos = useMemo(() => {
    if (activeCategoryId === "all") return promos;

    return promos.filter(
      (promo) =>
        promo.category?.trim().toLowerCase() === activeCategoryId,
    );
  }, [promos, activeCategoryId]);

  const activePreviewPromo = useMemo(
    () =>
      filteredPromos.find(
        (promo) => promo.id === activePreviewPromoId,
      ) ?? null,
    [filteredPromos, activePreviewPromoId],
  );

  const featuredPromos = useMemo(
    () => filteredPromos.slice(0, 3),
    [filteredPromos],
  );

  useEffect(() => {
    const savedCategoryId = window.localStorage.getItem(
      CATEGORY_FILTER_STORAGE_KEY,
    );

    if (savedCategoryId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveCategoryId(savedCategoryId);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      CATEGORY_FILTER_STORAGE_KEY,
      activeCategoryId,
    );
  }, [activeCategoryId]);

  useEffect(() => {
    if (
      !categoryOptions.some(
        (option) => option.id === activeCategoryId,
      )
    ) {
      setActiveCategoryId("all");
    }
  }, [categoryOptions, activeCategoryId]);

  const toggleFavorite = (placeId: string) => {
    setFavoritePlaces((current) =>
      current.includes(placeId)
        ? current.filter((id) => id !== placeId)
        : [...current, placeId],
    );
  };

  return (
    <section className="min-h-full bg-[#0B0F14] pb-28 text-[#F8FAFC]">
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-5 sm:px-6 lg:px-8">

        {/* ============================================================
            WELCOME
        ============================================================ */}

        <header className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#22C55E]">
            BONIX
          </p>

          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Discover your city
              </h1>

              <p className="mt-1 text-sm text-[#94A3B8]">
                Find places, unlock promos and grow your world.
              </p>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#1F2937] bg-[#111827] text-[#94A3B8] transition hover:border-[#22C55E]/40 hover:text-white"
              aria-label="Search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
            </button>
          </div>
        </header>

        {/* ============================================================
            MY BONIX CITY
        ============================================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-[#1F2937] bg-[#0F172A]">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#22C55E]/10 blur-3xl" />

          <div className="relative p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏙️</span>

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">
                    My Bonix City
                  </p>
                </div>

                <h2 className="mt-2 text-xl font-bold">
                  My Neighborhood
                </h2>

                <p className="mt-1 max-w-md text-sm text-[#64748B]">
                  Your personal city is growing as you discover and use Bonix.
                </p>
              </div>

              <span className="rounded-full border border-[#22C55E]/20 bg-[#22C55E]/10 px-3 py-1.5 text-xs font-semibold text-[#22C55E]">
                Level 2
              </span>
            </div>

            {/* Mini world */}
            <div className="relative mt-5 h-36 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0B0F14]">

              <div className="absolute inset-x-0 top-1/2 h-px bg-[#1F2937]" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-[#1F2937]" />

              <div className="absolute left-[15%] top-[20%] text-3xl">
                ☕
              </div>

              <div className="absolute right-[18%] top-[18%] text-3xl">
                🍕
              </div>

              <div className="absolute bottom-[16%] left-[42%] text-3xl">
                🏡
              </div>

              <div className="absolute bottom-[18%] right-[13%] text-3xl">
                🌳
              </div>

              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22C55E] shadow-[0_0_18px_rgba(34,197,94,0.7)]" />

              <div className="absolute bottom-3 left-3 rounded-lg border border-[#1F2937] bg-[#0F172A]/90 px-2.5 py-1.5 text-[10px] font-semibold text-[#94A3B8] backdrop-blur">
                8 / 10 spots occupied
              </div>

              <button
                type="button"
                className="absolute bottom-3 right-3 rounded-lg bg-[#22C55E] px-3 py-1.5 text-[10px] font-bold text-[#041007] transition hover:bg-[#16A34A]"
              >
                Open city
              </button>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-[#64748B]">
                  Neighborhood progress
                </span>

                <span className="font-semibold text-[#F8FAFC]">
                  80%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
                <div className="h-full w-[80%] rounded-full bg-[#22C55E]" />
              </div>

              <p className="mt-2 text-[11px] text-[#64748B]">
                Discover 2 more places to unlock new city spots.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            HAPPENING NOW
        ============================================================ */}

        {!loading && !errorMessage && featuredPromos.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />

                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#22C55E]">
                    Happening now
                  </p>
                </div>

                <h2 className="mt-1 text-xl font-bold">
                  Your city is active
                </h2>
              </div>

              <span className="text-xs text-[#64748B]">
                {filteredPromos.length} offers
              </span>
            </div>

            <div className="space-y-4">
              {featuredPromos.map((promo, index) => (
                <PromoCard
                  key={promo.id}
                  promo={promo}
                  index={index}
                  nowMs={nowMs}
                  userId={userId}
                  onOpenPreview={setActivePreviewPromoId}
                />
              ))}
            </div>
          </section>
        )}

        {/* ============================================================
            DISCOVER
        ============================================================ */}

        <section className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
              Explore
            </p>

            <div className="mt-1 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold">
                Discover new places
              </h2>

              <button
                type="button"
                className="text-xs font-semibold text-[#22C55E]"
              >
                See all
              </button>
            </div>
          </div>

          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {DISCOVER_PLACES.map((place) => {
              const isFavorite = favoritePlaces.includes(place.id);

              return (
                <article
                  key={place.id}
                  className="relative min-w-[230px] overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827]"
                >
                  <div
                    className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${place.gradient}`}
                  >
                    <span className="text-6xl drop-shadow-lg">
                      {place.emoji}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(place.id)}
                      aria-label={
                        isFavorite
                          ? `Remove ${place.name} from favorites`
                          : `Add ${place.name} to favorites`
                      }
                      className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur ${
                        isFavorite
                          ? "border-[#22C55E]/30 bg-[#22C55E]/20 text-[#22C55E]"
                          : "border-white/10 bg-black/30 text-white"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={isFavorite ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7A4.6 4.6 0 0 1 12 6.2a4.6 4.6 0 0 1 8.8 2.5Z" />
                      </svg>
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold">
                          {place.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#64748B]">
                          {place.category}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-[#F8FAFC]">
                        ★ {place.rating}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[#64748B]">
                        📍 {place.distance}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(place.id)}
                        className="text-[11px] font-bold text-[#22C55E]"
                      >
                        {isFavorite ? "In my city" : "＋ Add"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ============================================================
            CATEGORIES
        ============================================================ */}

        {!loading && !errorMessage && (
          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                Browse
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Explore by category
              </h2>
            </div>

            <CategoryChips
              options={categoryOptions}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          </section>
        )}

        {/* ============================================================
            ALL PROMOS
        ============================================================ */}

        <section className="space-y-4">

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                For you
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Available promos
              </h2>
            </div>

            {!loading && !errorMessage && (
              <span className="text-xs text-[#64748B]">
                {filteredPromos.length} available
              </span>
            )}
          </div>

          {loading && (
            <div className="rounded-2xl border border-[#1F2937] bg-[#111827] p-6 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#1F2937] border-t-[#22C55E]" />

              <p className="mt-3 text-sm text-[#64748B]">
                Discovering offers...
              </p>
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-sm font-semibold text-red-400">
                Unable to load promos
              </p>

              <p className="mt-1 text-xs text-[#64748B]">
                Please try again in a moment.
              </p>
            </div>
          )}

          {!loading &&
            !errorMessage &&
            filteredPromos.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#1F2937] bg-[#0F172A] p-8 text-center">
                <div className="text-4xl">🏙️</div>

                <h3 className="mt-3 text-sm font-bold">
                  Nothing here yet
                </h3>

                <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#64748B]">
                  Try another category or discover new places to grow your city.
                </p>
              </div>
            )}

          {!loading &&
            !errorMessage &&
            filteredPromos.length > 3 && (
              <div className="space-y-6">
                {filteredPromos.slice(3).map((promo, index) => (
                  <PromoCard
                    key={promo.id}
                    promo={promo}
                    index={index + 3}
                    nowMs={nowMs}
                    userId={userId}
                    onOpenPreview={setActivePreviewPromoId}
                  />
                ))}
              </div>
            )}
        </section>

        {/* ============================================================
            LOAD MORE
        ============================================================ */}

        {!loading && !errorMessage && hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="w-full rounded-2xl border border-[#1F2937] bg-[#111827] py-3.5 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#22C55E]/30 hover:bg-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Loading more..." : "Discover more"}
          </button>
        )}

        {/* ============================================================
            CITY GROWTH CTA
        ============================================================ */}

        <section className="overflow-hidden rounded-3xl border border-[#22C55E]/15 bg-gradient-to-br from-[#22C55E]/10 via-[#0F172A] to-[#0B0F14] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]/10 text-xl">
              🌱
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#22C55E]">
                Grow your city
              </p>

              <h3 className="mt-1 text-lg font-bold">
                Discover more. Unlock more.
              </h3>

              <p className="mt-1 text-sm leading-6 text-[#94A3B8]">
                Favorite places, use promos and interact with Bonix to unlock
                new neighborhoods, locations and experiences.
              </p>

              <button
                type="button"
                className="mt-4 rounded-xl bg-[#22C55E] px-4 py-2.5 text-xs font-bold text-[#041007] transition hover:bg-[#16A34A]"
              >
                Explore my city
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ==============================================================
          PROMO PREVIEW
      ============================================================== */}

      <PromoPreviewModal
        promo={activePreviewPromo}
        nowMs={nowMs}
        onClose={() => setActivePreviewPromoId(null)}
        onRedeem={incrementDailyCreditsUsed}
      />
    </section>
  );
}