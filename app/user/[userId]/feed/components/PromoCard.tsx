import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark, CheckCircle2, Clock3, MapPin } from "lucide-react";

import { FeedPromo, fallbackGradients } from "../types";
import { formatDuration } from "../utils";

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
  const savingsPercent = promo.originalPrice > 0
    ? Math.max(0, Math.round(((promo.originalPrice - promo.discountedPrice) / promo.originalPrice) * 100))
    : 0;
  const accents = [
    {
      border: "border-[#DFFF00]/45",
      glow: "shadow-[0_25px_80px_rgba(223,255,0,0.08)]",
      badge: "text-[#DFFF00]",
      button: "bg-[#DFFF00] text-[#101300] shadow-[0_0_30px_rgba(223,255,0,0.2)]",
      visual: "from-[#1B2110] via-[#10150B] to-[#050609]",
    },
    {
      border: "border-[#A855F7]/60",
      glow: "shadow-[0_25px_80px_rgba(168,85,247,0.12)]",
      badge: "text-[#D78CFF]",
      button: "bg-gradient-to-br from-[#7C22CE] to-[#B145E8] text-white shadow-[0_0_35px_rgba(168,85,247,0.25)]",
      visual: "from-[#190B29] via-[#100719] to-[#08050E]",
    },
    {
      border: "border-[#FF6A00]/55",
      glow: "shadow-[0_25px_80px_rgba(255,106,0,0.1)]",
      badge: "text-[#FF9A3D]",
      button: "bg-gradient-to-br from-[#FF6A00] to-[#FF8F22] text-white shadow-[0_0_30px_rgba(255,106,0,0.25)]",
      visual: "from-[#2A1307] via-[#1A0D06] to-[#0D0805]",
    },
    {
      border: "border-[#FFC21A]/60",
      glow: "shadow-[0_25px_80px_rgba(255,194,26,0.1)]",
      badge: "text-[#FFC21A]",
      button: "bg-gradient-to-br from-[#FFB800] to-[#FFD44A] text-[#171000] shadow-[0_0_30px_rgba(255,194,26,0.2)]",
      visual: "from-[#201807] via-[#161105] to-[#090805]",
    },
  ][index % 4];

  return (
    <motion.article
      key={promo.id}
      whileInView={{ y: [8, 0] }}
      viewport={{ amount: 0.2, once: true }}
      className={`grid overflow-hidden rounded-[28px] border bg-[#0C0F14] transition-transform duration-300 hover:-translate-y-1 md:grid-cols-2 ${accents.border} ${accents.glow} ${isSoldOut ? "ring-2 ring-[#EF4444]" : ""} ${disabled ? "opacity-50" : ""}`}
    >
      <div className={`relative min-h-[300px] overflow-hidden bg-gradient-to-br md:min-h-[455px] ${accents.visual}`}>
        <motion.div
          initial={{ scale: 1.02 }}
          whileInView={{ scale: 1.06 }}
          viewport={{ amount: 0.25, once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${fallbackGradients[index % fallbackGradients.length]} opacity-50`}
        />
        {promo.imageUrl ? (
          <motion.div
            initial={{ scale: 1.02 }}
            whileInView={{ scale: 1.06 }}
            viewport={{ amount: 0.25, once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="absolute inset-0 object-cover mix-blend-screen opacity-85"
            />
          </motion.div>
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">✦</div>
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-soft-light"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
            backgroundSize: "3px 3px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

        <div className={`absolute left-5 top-5 z-10 rounded-[14px] border bg-black/35 px-4 py-2 text-sm font-extrabold uppercase tracking-wide backdrop-blur-xl ${accents.badge}`}>
          ✦ {savingsPercent}% OFF
        </div>

        <div className="absolute inset-x-5 bottom-5 z-10 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#080A0F]/80 px-3 py-2.5 backdrop-blur-xl">
          <div className="flex -space-x-2">
            {["A", "M", "J"].map((initial) => (
              <span key={initial} className="grid h-7 w-7 place-items-center rounded-full border-2 border-[#11151D] bg-gradient-to-br from-[#555] to-[#222] text-[10px]">
                {initial}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#D7DBE0]">{Math.max(1, promo.total - promo.remaining)} people<br /><span className="text-[#949AA6]">claimed this today</span></p>
        </div>

        {isSoldOut ? (
          <div className="absolute inset-x-0 top-16 z-10 border-b border-white/15 bg-[#7F1D1D]/90 px-4 py-2">
            <p className="text-center text-xs font-semibold tracking-wide text-white">Sold out in {soldOutIn}</p>
          </div>
        ) : null}

      </div>

      <div className="flex min-h-[360px] flex-col p-6 md:min-h-[455px] md:p-7">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/5 text-[10px] font-bold text-white">
              {promo.merchantLogoUrl ? (
                <Image
                  src={promo.merchantLogoUrl}
                  alt={`${promo.merchantName} logo`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-lg">{promo.merchantName.slice(0, 2)}</span>
              )}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-bold text-white">{promo.merchantName} <CheckCircle2 className="inline h-3.5 w-3.5 text-[#DFFF00]" /></p>
              <p className="mt-1 flex items-center gap-1 text-sm text-[#949AA6]"><MapPin className="h-3.5 w-3.5" /> {promo.distanceLabel}</p>
            </div>
          </div>
          <Link
            href={`/user/${userId}/merchant/${promo.merchantId}`}
            className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[#949AA6]"
          >
            Ver negocio
          </Link>
        </div>

        <h3 className="text-4xl font-black leading-[0.95] tracking-tight text-white md:text-5xl">{promo.title}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#949AA6]">{promo.description}</p>

        <div className="mt-6 flex items-end gap-3">
          <p className="text-3xl font-black text-white">${promo.discountedPrice}</p>
          <p className="mb-1 text-sm text-[#949AA6] line-through">${promo.originalPrice}</p>
          <p className="mb-1 text-sm font-bold text-[#00E5A8]">+{promo.cashbackPercent}% cashback</p>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-[#C3C8D0]"><Clock3 className="h-4 w-4" /> Valid until {new Date(promo.expiresAt).toLocaleDateString()}</span>
            <span className="text-[#949AA6]">{promo.remaining} left</span>
          </div>

          {isLowSlots ? (
            <motion.p
              animate={{ opacity: [0.65, 1, 0.65], y: [0, -1, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs font-semibold uppercase tracking-wide text-[#EF4444]"
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
            className="h-2 w-full overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              animate={isLowSlots ? { opacity: [0.6, 1, 0.6] } : undefined}
              transition={
                isLowSlots
                  ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                  : undefined
              }
              className={`h-full rounded-full ${
                promo.remaining <= 3 ? "bg-red-500" : promo.remaining <= 7 ? "bg-yellow-400" : "bg-[#FF6A00]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </motion.div>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-7">
          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenPreview(promo.id);
          }}
          className={`flex min-h-[60px] flex-1 items-center justify-center gap-3 rounded-2xl text-base font-extrabold ${
            disabled ? "bg-[#2A2A2A] text-gray-500" : accents.button
          }`}
        >
          {promo.status === "SOLD_OUT" ? "Ver promo agotada" : "Ver promo"}
          <ArrowRight className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Guardar promo" className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/[0.025] text-white">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
