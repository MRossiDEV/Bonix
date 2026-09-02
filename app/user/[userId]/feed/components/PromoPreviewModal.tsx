import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { FeedPromo } from "../types";
import { getPromoSocialProofText } from "../utils";

type PromoPreviewModalProps = {
  promo: FeedPromo | null;
  nowMs: number;
  onClose: () => void;
  onRedeem: () => void;
};

export function PromoPreviewModal({ promo, nowMs, onClose, onRedeem }: PromoPreviewModalProps) {
  return (
    <AnimatePresence>
      {promo ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 p-4 pb-28"
        >
          <div className="flex h-full items-end justify-center pb-6 md:items-center md:pb-0">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 260 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 900) {
                  onClose();
                }
              }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#121212]"
            >
              <div className="relative h-64 w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/35 via-[#7B61FF]/25 to-[#00E5A8]/25" />
                {promo.imageUrl ? (
                  <Image
                    src={promo.imageUrl}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-white"
                >
                  Close
                </button>

                <div className="absolute inset-x-0 bottom-0 space-y-2 px-5 pb-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-gray-300">
                    {promo.merchantName}
                  </p>
                  <h3 className="text-2xl font-semibold text-white">{promo.title}</h3>
                </div>
              </div>

              <div className="space-y-4 p-5 pb-8">
                <p className="text-sm text-gray-300">{promo.description}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#00E5A8]">
                  {getPromoSocialProofText(promo, nowMs)}
                </p>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-white">${promo.discountedPrice}</p>
                    <p className="text-xs text-gray-500 line-through">${promo.originalPrice}</p>
                  </div>
                  <p className="text-xs text-[#00E5A8]">+{promo.cashbackPercent}% cashback</p>
                </div>

                {promo.status === "ACTIVE" ? (
                  <Link
                    href={`/promo/${promo.id}`}
                    onClick={() => {
                      onRedeem();
                      onClose();
                    }}
                    className="block w-full rounded-2xl bg-[#FF7A00] py-4 text-center text-sm font-bold text-black"
                  >
                    Redeem
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="block w-full rounded-2xl bg-[#2A2A2A] py-4 text-center text-sm font-bold text-gray-400"
                  >
                    {promo.status === "SOLD_OUT" ? "Sold out" : "Expired"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
