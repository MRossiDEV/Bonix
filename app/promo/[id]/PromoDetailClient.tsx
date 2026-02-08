"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PromoCardData } from "@/lib/promos";

// Note: Ensure PromoCardData type includes totalSlots and availableSlots properties

type PromoDetailClientProps = {
  promo: PromoCardData;
};

export function PromoDetailClient({ promo }: PromoDetailClientProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const router = useRouter();

  const soldPercent =
    ((promo.totalSlots - promo.availableSlots) / promo.totalSlots) * 100;

  const isSoldOut = promo.status === "SOLD_OUT";
  const isExpired = promo.status === "EXPIRED";

  const handleReserve = async () => {
    if (isReserving) return;
    setIsReserving(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoId: promo.id }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const payload = (await response.json()) as {
        reservationId?: string;
        userId?: string;
        error?: string;
      };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Unable to reserve this deal.");
        return;
      }

      if (payload.userId) {
        router.push(`/user/${payload.userId}/reservations`);
      } else {
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to reserve this deal.";
      setErrorMessage(message);
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-24 pt-10 text-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/feed" className="text-sm text-[#9CA3AF]">
          Back to feed
        </Link>

        {promo.isFeatured && (
          <span className="rounded-full bg-[#7B61FF] px-3 py-1 text-xs font-semibold">
            Featured
          </span>
        )}
      </div>

      {/* Hero */}
      <div className="relative mt-6 aspect-[9/16] overflow-hidden rounded-[28px] bg-[#1E1E1E]">
        {promo.imageUrl && (
          <Image
            src={promo.imageUrl}
            alt={promo.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-transparent" />

        <div className="absolute bottom-4 left-4">
          <p className="text-xs uppercase tracking-widest text-[#9CA3AF]">
            {promo.merchantName} · {promo.category}
          </p>
          <h1 className="mt-2 text-2xl font-semibold">{promo.title}</h1>
        </div>

        <div className="absolute right-4 top-4 rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-bold text-[#121212]">
          {promo.discountPercent}% OFF
        </div>
      </div>

      {/* Description */}
      <p className="mt-6 text-sm text-[#9CA3AF]">{promo.description}</p>

      {/* Price Block */}
      <div className="mt-6 rounded-2xl border border-[#2A2A2A] bg-[#1E1E1E] p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#9CA3AF]">Now</p>
            <p className="text-2xl font-semibold">
              ${promo.discountedPrice}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#9CA3AF] line-through">
              ${promo.originalPrice}
            </p>
            <p className="text-xs text-[#00E5A8]">
              + {promo.cashbackPercent}% cashback
            </p>
          </div>
        </div>
      </div>

      {/* Scarcity */}
      <div className="mt-6">
        <div className="mb-2 flex justify-between text-xs text-[#9CA3AF]">
          <span>{promo.availableSlots} left</span>
          <span>{promo.totalSlots} total</span>
        </div>

        <div className="h-2 w-full rounded-full bg-[#2A2A2A]">
          <div
            className="h-full rounded-full bg-[#FF7A00]"
            style={{ width: `${soldPercent}%` }}
          />
        </div>
      </div>

      {/* CTA */}
      {errorMessage ? (
        <p className="mt-6 text-sm text-[#FF7A00]">{errorMessage}</p>
      ) : null}

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={isSoldOut || isExpired || isReserving}
        onClick={handleReserve}
        className={`mt-8 w-full rounded-2xl py-4 text-base font-semibold ${
          isSoldOut || isExpired || isReserving
            ? "bg-[#2A2A2A] text-[#6B7280]"
            : "bg-[#FF7A00] text-[#121212]"
        }`}
      >
        {isSoldOut
          ? "Sold out"
          : isExpired
          ? "Expired"
          : isReserving
          ? "Reserving..."
          : "Reserve deal"}
      </motion.button>
    </main>
  );
}
