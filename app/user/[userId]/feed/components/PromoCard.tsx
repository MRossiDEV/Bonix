import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { FeedPromo, fallbackGradients } from "../types";
import { formatDuration, getCountdownParts, pad2 } from "../utils";

type PromoCardProps = {
  promo: FeedPromo;
  index: number;
  nowMs: number;
  userId: string;
  onOpenPreview: (promoId: string) => void;
};

export function PromoCard({
  promo,
  index,
  nowMs,
  userId,
  onOpenPreview,
}: PromoCardProps) {
  const progress = promo.total > 0 ? ((promo.total - promo.remaining) / promo.total) * 100 : 0;
  const countdown = getCountdownParts(promo.expiresAt, nowMs);
  const showSecondsOnly =
    countdown.totalMs > 0 && countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0;
  const soldOutIn = formatDuration(promo.soldOutDurationSeconds);
  const isSoldOut = promo.status === "SOLD_OUT";
  const isLowSlots = promo.status === "ACTIVE" && promo.remaining > 0 && promo.remaining < 3;
  const activatedMs = new Date(promo.activatedAt).getTime();
  const isNewDrop =
    promo.status === "ACTIVE" &&
    Number.isFinite(activatedMs) &&
    nowMs >= activatedMs &&
    nowMs - activatedMs <= 1000 * 60 * 60 * 2;

  const disabled = promo.status === "SOLD_OUT" || promo.status === "EXPIRED";

  return (
    <motion.article
      key={promo.id}
      whileInView={{ y: [8, 0] }}
      viewport={{ amount: 0.2, once: false }}
      className={`overflow-hidden bg-[#121212] shadow-lg ${isSoldOut ? "ring-2 ring-[#EF4444]" : ""} ${
        disabled ? "opacity-50" : ""
      } ${
        promo.isFeatured
          ? "shadow-[0_0_0_1px_rgba(123,97,255,0.35),0_12px_36px_rgba(123,97,255,0.22)]"
          : "shadow-[0_8px_24px_rgba(0,0,0,0.38),0_2px_8px_rgba(0,0,0,0.28)]"
      }`}
    >
      <div className="relative h-100 w-full">
        <motion.div
          initial={{ y: 10, scale: 1.02 }}
          whileInView={{ y: -4, scale: 1.04 }}
          viewport={{ amount: 0.25, once: false }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${fallbackGradients[index % fallbackGradients.length]}`}
        />
        {promo.imageUrl ? (
          <motion.div
            initial={{ y: 12, scale: 1.02 }}
            whileInView={{ y: -6, scale: 1.05 }}
            viewport={{ amount: 0.25, once: false }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              fill
              sizes="(max-width: 640px) 100vw, 576px"
              className="absolute inset-0 object-cover"
            />
          </motion.div>
        ) : null}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/25 px-4 py-3 backdrop-blur-[1px]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-white/20 bg-black/45 p-[2px]">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#1E1E1E] text-[10px] font-semibold uppercase text-[#FAFAFA]">
                {promo.merchantLogoUrl ? (
                  <Image
                    src={promo.merchantLogoUrl}
                    alt={`${promo.merchantName} logo`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  promo.merchantName.slice(0, 2)
                )}
              </div>
            </div>

            <div className="leading-tight">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white">
                {promo.merchantName}
              </p>
              <p className="text-[10px] text-gray-300">{promo.category}</p>
              <p className="text-[10px] text-gray-300">📍 {promo.distanceLabel}</p>
            </div>
          </div>

          <Link
            href={`/user/${userId}/merchant/${promo.merchantId}`}
            className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
          >
            View business
          </Link>
        </div>

        {isSoldOut ? (
          <div className="absolute inset-x-0 top-16 z-10 border-b border-white/15 bg-[#7F1D1D]/90 px-4 py-2">
            <p className="text-center text-xs font-semibold tracking-wide text-white">Sold out in {soldOutIn}</p>
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/50 px-4 py-3">
          {countdown.totalMs <= 0 ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold tracking-wide text-[#FF7A00]">Expired</p>
              <div className="flex items-center justify-end gap-2">
                {isNewDrop ? (
                  <motion.span
                    animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-bold text-black"
                  >
                    NEW DROP
                  </motion.span>
                ) : null}
                {promo.isFeatured && (
                  <span className="rounded-full bg-[#7B61FF] px-3 py-1 text-xs font-bold">⭐ Featured</span>
                )}
                {!promo.isFeatured && promo.hot && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">🔥 Hot</span>
                )}
                {isSoldOut ? (
                  <span className="rounded-full bg-[#EF4444] px-3 py-1 text-xs font-bold text-white">SOLD OUT</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {showSecondsOnly ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-end gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold leading-none text-white">{pad2(countdown.seconds)}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-300">s</p>
                    </div>
                  </div>
                  
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Time left</p>
                  <div className="flex items-end gap-4">
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
                  </div>                  
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                {isNewDrop ? (
                  <motion.span
                    animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-bold text-black"
                  >
                    NEW DROP
                  </motion.span>
                ) : null}
                {promo.isFeatured && (
                  <span className="rounded-full bg-[#7B61FF] px-3 py-1 text-xs font-bold">⭐ Featured</span>
                )}
                {!promo.isFeatured && promo.hot && (
                  <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold">🔥 Hot</span>
                )}
                {isSoldOut ? (
                  <span className="rounded-full bg-[#EF4444] px-3 py-1 text-xs font-bold text-white">SOLD OUT</span>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-xl font-semibold">{promo.title}</h3>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-semibold">${promo.discountedPrice}</p>
            <p className="text-xs text-gray-500 line-through">${promo.originalPrice}</p>
          </div>
          <p className="text-xs text-[#00E5A8]">+{promo.cashbackPercent}% cashback</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">🎟️ {promo.remaining} left</span>
            <span className="text-gray-500">{promo.total} total</span>
          </div>

          {isLowSlots ? (
            <motion.p
              animate={{ opacity: [0.65, 1, 0.65], y: [0, -1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="text-[11px] font-semibold uppercase tracking-wide text-[#EF4444]"
            >
              Almost gone!
            </motion.p>
          ) : null}

          <motion.div
            animate={isLowSlots ? { x: [0, -2, 2, -2, 0] } : undefined}
            transition={
              isLowSlots
                ? { duration: 0.35, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }
                : undefined
            }
            className="h-2 w-full overflow-hidden rounded-full bg-[#2A2A2A]"
          >
            <motion.div
              animate={isLowSlots ? { opacity: [0.6, 1, 0.6] } : undefined}
              transition={
                isLowSlots
                  ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
              className={`h-full rounded-full ${
                promo.remaining <= 3 ? "bg-red-500" : promo.remaining <= 7 ? "bg-yellow-400" : "bg-green-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenPreview(promo.id);
          }}
          className={`block w-full rounded-2xl py-4 text-center text-sm font-bold ${
            disabled ? "bg-[#2A2A2A] text-gray-500" : "bg-[#FF7A00] text-black"
          }`}
        >
          {promo.status === "SOLD_OUT" ? "View sold-out deal" : "Tap to preview"}
        </button>
      </div>
    </motion.article>
  );
}
