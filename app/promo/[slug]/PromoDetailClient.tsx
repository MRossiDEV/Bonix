"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Bookmark,
  Check,
  Clock3,
  Flame,
  Heart,
  MapPin,
  MessageCircle,
  QrCode,
  Share2,
  Star,
  Store,
  Ticket,
  Wallet,
} from "lucide-react";

import { PromoCardData } from "@/lib/promos";

type PromoDetailClientProps = {
  promo: PromoCardData;
  feedHref: string;
  expiresAt: string;
  initialNowMs?: number;
};

type CountdownParts = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdownParts(
  expiresAt: string,
  nowMs: number
): CountdownParts {
  const end = new Date(expiresAt).getTime();

  const diffMs = Math.max(0, end - nowMs);

  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    totalMs: diffMs,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function PromoDetailClient({
  promo,
  feedHref,
  expiresAt,
  initialNowMs,
}: PromoDetailClientProps) {
  const router = useRouter();

  const [nowMs, setNowMs] =
    useState(() => initialNowMs ?? Date.now());

  const [isLiked, setIsLiked] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [isReserving, setIsReserving] =
    useState(false);

  const [showReserveModal, setShowReserveModal] =
    useState(false);

  const countdown = getCountdownParts(
    expiresAt,
    nowMs
  );

  const soldPercent = useMemo(() => {
    if (!promo.totalSlots) return 0;

    return Math.min(
      100,
      ((promo.totalSlots -
        promo.availableSlots) /
        promo.totalSlots) *
        100
    );
  }, [
    promo.availableSlots,
    promo.totalSlots,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleReserve = async () => {
    try {
      setIsReserving(true);

      await new Promise((resolve) =>
        setTimeout(resolve, 1400)
      );

      router.push("/reservations");
    } finally {
      setIsReserving(false);
    }
  };

  const isExpired =
    countdown.totalMs <= 0;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* HERO */}
      <section className="relative h-[78vh] overflow-hidden">
        {promo.imageUrl && (
          <motion.div
            animate={{
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0"
          >
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/40 to-black/20" />

        {/* TOP NAV */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-4">
          <Link
            href={feedHref}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() =>
                setIsSaved(!isSaved)
              }
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl"
            >
              <Bookmark
                className={`h-5 w-5 ${
                  isSaved
                    ? "fill-white text-white"
                    : ""
                }`}
              />
            </motion.button>

            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* LIVE ACTIVITY */}
        <div className="absolute left-4 top-24 rounded-full border border-[#FF7A00]/20 bg-[#FF7A00]/10 px-4 py-2 backdrop-blur-xl">
          <p className="text-xs font-semibold text-[#FFB067]">
            🔥 {promo.redemptionCount ?? 0} reservations
          </p>
        </div>

        {/* PRICE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-4 top-40 rounded-[2rem] border border-white/10 bg-black/40 p-5 backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-black text-[#121212]">
              {promo.discountPercent}% OFF
            </div>

            <div className="rounded-full bg-[#00E5A8]/10 px-3 py-1 text-xs font-bold text-[#00E5A8]">
              +{promo.cashbackPercent}% BACK
            </div>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-xl text-[#9CA3AF] line-through">
              ${promo.originalPrice}
            </span>

            <span className="text-5xl font-black">
              ${promo.discountedPrice}
            </span>
          </div>

          <p className="mt-2 text-sm text-[#D1D5DB]">
            Pay directly at the store
          </p>
        </motion.div>

        {/* INFO */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {promo.isFeatured && (
              <div className="rounded-full bg-[#FF7A00]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#FF7A00]">
                Featured
              </div>
            )}

            <div className="rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
              {promo.category ?? "Trending"}
            </div>
          </div>

          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
            {promo.title}
          </h1>

          <div className="mt-5 flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/10 bg-[#1A1A1A]">
              {promo.merchantLogoUrl ? (
                <Image
                  src={promo.merchantLogoUrl}
                  alt={promo.merchantName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-black">
                  {promo.merchantName?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <p className="text-lg font-bold">
                {promo.merchantName}
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-[#9CA3AF]">
                <MapPin className="h-4 w-4" />

                <span>
                  {promo.neighborhood}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <main className="space-y-5 px-4 pb-40 pt-5">
        {/* SOCIAL */}
        <section className="flex items-center justify-between rounded-[2rem] border border-white/5 bg-[#121212] px-5 py-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() =>
                setIsLiked(!isLiked)
              }
              className="flex items-center gap-2"
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked
                    ? "fill-[#FF3040] text-[#FF3040]"
                    : ""
                }`}
              />

              <span className="text-sm font-semibold">
                {promo.likesCount ?? 0}
              </span>
            </button>

            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />

              <span className="text-sm font-semibold">
                {promo.commentsCount ?? 0}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />

              <span className="text-sm font-semibold">
                {promo.savesCount ?? 0}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-[#1E1E1E] px-3 py-1">
            <Star className="h-4 w-4 fill-[#FF7A00] text-[#FF7A00]" />

            <span className="text-sm font-bold">
              {promo.rating ?? 4.8}
            </span>
          </div>
        </section>

        {/* GALLERY */}
        {!!promo.gallery?.length && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">
                Gallery
              </h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2">
              {promo.gallery.map(
                (image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{
                      scale: 1.02,
                    }}
                    className="relative h-44 min-w-[280px] overflow-hidden rounded-[2rem]"
                  >
                    <Image
                      src={image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                )
              )}
            </div>
          </section>
        )}

        {/* DESCRIPTION */}
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#FF7A00]" />

            <h2 className="text-xl font-black">
              About this promo
            </h2>
          </div>

          <p className="mt-4 leading-relaxed text-[#D1D5DB]">
            {promo.description}
          </p>
        </section>

        {/* INCLUDED */}
        {!!promo.tags?.length && (
          <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
            <h2 className="text-xl font-black">
              Included
            </h2>

            <div className="mt-5 space-y-3">
              {promo.tags.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl bg-[#1A1A1A] p-4"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00E5A8]/10">
                    <Check className="h-4 w-4 text-[#00E5A8]" />
                  </div>

                  <p className="font-semibold">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* COUNTDOWN */}
        {!isExpired && (
          <section className="rounded-[2rem] border border-[#FF7A00]/20 bg-[#FF7A00]/5 p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-[#FF7A00]" />

              <h2 className="text-xl font-black">
                Time Left
              </h2>
            </div>

            <div className="mt-5 flex justify-between gap-2">
              {[
                {
                  label: "Days",
                  value: pad2(
                    countdown.days
                  ),
                },
                {
                  label: "Hours",
                  value: pad2(
                    countdown.hours
                  ),
                },
                {
                  label: "Minutes",
                  value: pad2(
                    countdown.minutes
                  ),
                },
                {
                  label: "Seconds",
                  value: pad2(
                    countdown.seconds
                  ),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex-1 text-center"
                >
                  <div className="flex h-20 items-center justify-center rounded-[1.5rem] bg-[#121212] text-3xl font-black">
                    {item.value}
                  </div>

                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AVAILABILITY */}
        <section className="rounded-[2rem] border border-white/5 bg-[#121212] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Availability
            </h2>

            <p className="font-semibold text-[#FF7A00]">
              {promo.availableSlots} left
            </p>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#1E1E1E]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${soldPercent}%`,
              }}
              transition={{
                duration: 1,
              }}
              className="h-full rounded-full bg-[#FF7A00]"
            />
          </div>
        </section>

        {/* MAP */}
        <section className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#121212]">
          <div className="h-48 bg-[#1A1A1A]" />

          <div className="p-5">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#FF7A00]" />

              <div>
                <p className="font-bold">
                  {promo.address ??
                    "Address unavailable"}
                </p>

                <p className="text-sm text-[#9CA3AF]">
                  {promo.neighborhood}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* STICKY CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#080808]/90 p-4 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6B7280]">
              Promo Price
            </p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-[#6B7280] line-through">
                ${promo.originalPrice}
              </span>

              <span className="text-3xl font-black">
                ${promo.discountedPrice}
              </span>
            </div>

            <p className="mt-1 text-sm font-bold text-[#00E5A8]">
              +{promo.cashbackPercent}% cashback
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={
              isExpired ||
              promo.availableSlots <= 0
            }
            onClick={() =>
              setShowReserveModal(true)
            }
            className="flex-1 rounded-[1.5rem] bg-[#FF7A00] px-6 py-5 text-lg font-black text-[#121212] disabled:opacity-50"
          >
            {isExpired
              ? "Expired"
              : promo.availableSlots <= 0
              ? "Sold Out"
              : "Reserve Promo"}
          </motion.button>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showReserveModal && (
          <div className="fixed inset-0 z-[100] flex items-end bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              className="w-full rounded-t-[3rem] bg-[#121212] p-6"
            >
              <div className="mx-auto h-1.5 w-20 rounded-full bg-[#333]" />

              <h2 className="mt-6 text-3xl font-black">
                Reserve Promo
              </h2>

              <div className="mt-6 rounded-[2rem] border border-white/5 bg-[#1A1A1A] p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF]">
                    Promo price
                  </span>

                  <span className="text-2xl font-black">
                    ${promo.discountedPrice}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[#9CA3AF]">
                    Cashback earned
                  </span>

                  <span className="font-bold text-[#00E5A8]">
                    +{promo.cashbackPercent}%
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() =>
                    setShowReserveModal(
                      false
                    )
                  }
                  className="flex-1 rounded-2xl border border-white/10 bg-[#1A1A1A] py-4 font-semibold"
                >
                  Cancel
                </button>

                <motion.button
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="flex-1 rounded-2xl bg-[#FF7A00] py-4 font-black text-[#121212]"
                >
                  {isReserving
                    ? "Reserving..."
                    : "Confirm"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}