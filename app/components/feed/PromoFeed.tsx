"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  ChevronRight,
  Clock3,
  Filter,
  Flame,
  Map,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import { PromoCardData } from "@/types/promos";

import getActivePromos from "@/lib/promos/get-promos";

const quickFilters = [
  "Under $300",
  "2x1",
  "Cheap Lunch",
  "Coffee",
  "Pizza",
  "Burgers",
  "Tonight Deals",
  "Happy Hour",
];

export function PromoFeed() {
  const [items, setItems] = useState<
    PromoCardData[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState("Under $300");

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const fetchPromos = useCallback(
    async () => {
      try {
        setLoading(true);

        const promos =
          await getActivePromos();

        setItems(promos);
      } catch (error) {
        console.error(error);

        setErrorMessage(
          "Unable to load promos."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Initial data load; setState inside fetchPromos is expected for
    // one-shot fetch on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPromos();
  }, [fetchPromos]);

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    if (search.trim()) {
      const term =
        search.toLowerCase();

      filtered = filtered.filter(
        (promo) =>
          promo.title
            .toLowerCase()
            .includes(term) ||
          promo.description
            .toLowerCase()
            .includes(term) ||
          promo.merchantName
            .toLowerCase()
            .includes(term)
      );
    }

    switch (selectedFilter) {
      case "Under $300":
        filtered = filtered.filter(
          (promo) =>
            promo.discountedPrice <=
            300
        );
        break;

      case "Coffee":
      case "Pizza":
      case "Burgers":
        filtered = filtered.filter(
          (promo) =>
            promo.category
              ?.toLowerCase()
              .includes(
                selectedFilter.toLowerCase()
              )
        );
        break;

      default:
        break;
    }

    return filtered;
  }, [
    items,
    search,
    selectedFilter,
  ]);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080808]/80 backdrop-blur-2xl">
        <div className="px-4 pb-4 pt-safe">
          {/* TOP BAR */}
          <div className="flex items-center justify-between pt-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FF7A00]" />

                <h1 className="text-2xl font-black tracking-tight">
                  BONIX
                </h1>
              </div>

              <div className="mt-1 flex items-center gap-1 text-sm text-[#9CA3AF]">
                <MapPin className="h-4 w-4" />

                <span>
                  Montevideo,
                  Uruguay
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#121212]">
                <Bell className="h-5 w-5" />

                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF7A00]" />
              </button>

              <button className="h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-[#121212]">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF7A00] to-[#FFB067] font-black text-[#121212]">
                  B
                </div>
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mt-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6B7280]" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search burgers, coffee, cheap lunch..."
                className="h-14 w-full rounded-2xl border border-white/5 bg-[#121212] pl-12 pr-4 text-sm outline-none placeholder:text-[#6B7280]"
              />
            </div>

            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
              <Filter className="h-5 w-5" />
            </button>

            <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#121212]">
              <Map className="h-5 w-5" />
            </button>
          </div>

          {/* QUICK FILTERS */}
          <div className="-mx-4 mt-5 overflow-x-auto px-4">
            <div className="flex gap-3 pb-1">
              {quickFilters.map(
                (filter) => {
                  const active =
                    selectedFilter ===
                    filter;

                  return (
                    <motion.button
                      whileTap={{
                        scale: 0.96,
                      }}
                      key={filter}
                      onClick={() =>
                        setSelectedFilter(
                          filter
                        )
                      }
                      className={`whitespace-nowrap rounded-2xl px-5 py-3 text-sm font-bold transition-all ${
                        active
                          ? "bg-[#FF7A00] text-[#121212]"
                          : "border border-white/5 bg-[#121212] text-[#D1D5DB]"
                      }`}
                    >
                      {filter}
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </header>

      {/* FEED */}
      <main className="space-y-5 px-4 pb-32 pt-5">
        {/* STATE */}
        {loading && (
          <>
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <SkeletonCard
                key={index}
              />
            ))}
          </>
        )}

        {!loading &&
          errorMessage && (
            <div className="rounded-[2rem] border border-[#FF7A00]/10 bg-[#121212] p-6 text-center">
              <p className="text-[#FFB067]">
                {errorMessage}
              </p>
            </div>
          )}

        {!loading &&
          !errorMessage &&
          filteredItems.length ===
            0 && (
            <div className="rounded-[2rem] border border-white/5 bg-[#121212] p-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1A]">
                <Search className="h-8 w-8 text-[#6B7280]" />
              </div>

              <h2 className="mt-5 text-2xl font-black">
                No deals nearby
              </h2>

              <p className="mt-3 text-sm text-[#9CA3AF]">
                Try changing your
                filters or expanding
                your search radius.
              </p>
            </div>
          )}

        {!loading &&
          filteredItems.map(
            (promo, index) => (
              <PromoCard
                key={promo.id}
                promo={promo}
                priority={index < 2}
              />
            )
          )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/90 backdrop-blur-2xl">
        <div className="grid grid-cols-5 px-2 py-3">
          {[
            "Home",
            "Saved",
            "Map",
            "Alerts",
            "Profile",
          ].map((item) => (
            <button
              key={item}
              className={`flex flex-col items-center gap-1 rounded-2xl py-2 text-xs font-semibold ${
                item === "Home"
                  ? "text-[#FF7A00]"
                  : "text-[#6B7280]"
              }`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  item === "Home"
                    ? "bg-[#FF7A00]"
                    : "bg-transparent"
                }`}
              />

              {item}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

type PromoCardProps = {
  promo: PromoCardData;
  priority?: boolean;
};

const PromoCard = memo(
  function PromoCard({
    promo,
    priority,
  }: PromoCardProps) {
    const expiresSoon =
      promo.availableSlots <= 5;

    return (
      <motion.article
        initial={{
          opacity: 0,
          y: 16,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        whileTap={{
          scale: 0.985,
        }}
        className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]"
      >
        <Link
          href={`/promo/${promo.slug}`}
        >
          {/* IMAGE */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {promo.imageUrl ? (
              <Image
                src={promo.imageUrl}
                alt={promo.title}
                fill
                priority={priority}
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#1A1A1A]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* BADGES */}
            <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
              <div className="rounded-full bg-black/50 px-3 py-1 text-xs font-semibold backdrop-blur-xl">
                📍{" "}
                {promo.neighborhood ??
                  "Montevideo"}
              </div>

              <div className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-black text-[#121212]">
                {
                  promo.discountPercent
                }
                % OFF
              </div>
            </div>

            {/* URGENCY */}
            {expiresSoon && (
              <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-[#FF7A00]/20 bg-[#FF7A00]/10 px-3 py-1 backdrop-blur-xl">
                <Clock3 className="h-3.5 w-3.5 text-[#FFB067]" />

                <span className="text-xs font-bold text-[#FFB067]">
                  Only few left
                </span>
              </div>
            )}
          </div>

          {/* CONTENT */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
                  {promo.category ??
                    "Food"}
                </p>

                <h2 className="mt-2 line-clamp-1 text-2xl font-black">
                  {promo.title}
                </h2>

                <p className="mt-2 line-clamp-1 text-sm text-[#9CA3AF]">
                  {
                    promo.description
                  }
                </p>
              </div>

              <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-[#6B7280]" />
            </div>

            {/* PRICE */}
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-sm text-[#6B7280] line-through">
                  $
                  {
                    promo.originalPrice
                  }
                </p>

                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">
                    $
                    {
                      promo.discountedPrice
                    }
                  </span>

                  <span className="mb-1 text-sm font-bold text-[#00E5A8]">
                    +
                    {
                      promo.cashbackPercent
                    }
                    %
                  </span>
                </div>
              </div>

              <motion.div
                whileTap={{
                  scale: 0.95,
                }}
                className="rounded-2xl bg-[#FF7A00] px-5 py-3 text-sm font-black text-[#121212]"
              >
                Claim
              </motion.div>
            </div>

            {/* SOCIAL */}
            <div className="mt-5 flex items-center gap-2 text-xs text-[#6B7280]">
              <Flame className="h-4 w-4 text-[#FF7A00]" />

              <span>
                {
                  promo.redemptionCount
                }{" "}
                people claimed this
                recently
              </span>
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }
);

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
      <div className="aspect-[16/10] animate-pulse bg-[#1A1A1A]" />

      <div className="space-y-4 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-[#1A1A1A]" />

        <div className="h-8 w-2/3 animate-pulse rounded-full bg-[#1A1A1A]" />

        <div className="h-4 w-full animate-pulse rounded-full bg-[#1A1A1A]" />

        <div className="flex items-end justify-between pt-4">
          <div className="space-y-3">
            <div className="h-3 w-16 animate-pulse rounded-full bg-[#1A1A1A]" />

            <div className="h-10 w-28 animate-pulse rounded-full bg-[#1A1A1A]" />
          </div>

          <div className="h-12 w-28 animate-pulse rounded-2xl bg-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}