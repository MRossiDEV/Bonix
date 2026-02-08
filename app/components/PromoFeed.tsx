"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";

import { mapPromoRowToCard, PromoCardData } from "@/lib/promos";
import { createClient } from "@/lib/supabase/client";
import { PreviewInstallModal } from "@/app/components/PreviewInstallModal";
import { usePwaInstallPrompt } from "@/app/components/usePwaInstallPrompt";

type PromoFeedProps = {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  compact?: boolean;
};

type PromoRow = {
  id: string;
  title: string;
  description: string;
  original_price: number | string;
  discounted_price: number | string;
  cashback_percent: number | string;
  expires_at: string;
  image: string | null;
  merchant: { business_name: string } | null;
};

type PromoPublicRow = Omit<PromoRow, "merchant"> & {
  merchant_name: string | null;
};

const gradients = [
  "from-[#FF7A00]/30 via-[#7B61FF]/20 to-[#00E5A8]/20",
  "from-[#00E5A8]/25 via-[#FF7A00]/20 to-[#7B61FF]/20",
  "from-[#7B61FF]/25 via-[#00E5A8]/20 to-[#FF7A00]/20",
];

export function PromoFeed({
  title = "Promo feed",
  subtitle = "Live previews in your area",
  limit,
  showViewAll,
  compact,
}: PromoFeedProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [items, setItems] = useState<PromoCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { promptInstall } = usePwaInstallPrompt();
  const router = useRouter();

  useEffect(() => {
    let isActive = true;

    const fetchPromos = async () => {
      setLoading(true);
      setErrorMessage(null);

      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "get_public_promos",
        typeof limit === "number" ? { p_limit: limit } : undefined,
      );
      if (error) {
        throw new Error(error.message);
      }

      if (!isActive) return;

      const promos: PromoRow[] = (data ?? []).map((row: PromoPublicRow): PromoRow => {
        const merchant = row.merchant_name ? { business_name: row.merchant_name } : null;
        return { ...row, merchant };
      });

      setItems(promos.map((row: PromoRow) => mapPromoRowToCard(row)));
      setLoading(false);
    };

    fetchPromos().catch((error: Error) => {
      if (!isActive) return;
      setErrorMessage(error.message);
      setItems([]);
      setLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, [limit]);

  const handleRestrictedAction = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleInstall = async () => {
    setModalOpen(false);
    const prompted = await promptInstall();
    if (!prompted) {
      router.push("/install");
    }
  };

  return (
    <section className={compact ? "px-6 pb-16" : "px-6 py-16"}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#FAFAFA]">{title}</h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">{subtitle}</p>
        </div>
        {showViewAll ? (
          <Link
            href="/feed"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00E5A8]"
          >
            View all
          </Link>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        {loading ? (
          <p className="text-sm text-[#9CA3AF]">Loading promos...</p>
        ) : null}
        {!loading && errorMessage ? (
          <p className="text-sm text-[#FF7A00]">Unable to load promos.</p>
        ) : null}
        {!loading && !errorMessage && items.length === 0 ? (
          <p className="text-sm text-[#9CA3AF]">No promos available right now.</p>
        ) : null}
        {items.map((promo, index) => (
          <PromoCard
            key={promo.id}
            promo={promo}
            gradientClass={gradients[index % gradients.length]}
            onRestrictedAction={handleRestrictedAction}
          />
        ))}
      </div>

      <PreviewInstallModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onInstall={handleInstall}
      />
    </section>
  );
}

type PromoCardProps = {
  promo: PromoCardData;
  gradientClass: string;
  onRestrictedAction: () => void;
};

const PromoCard = memo(function PromoCard({
  promo,
  gradientClass,
  onRestrictedAction,
}: PromoCardProps) {
  return (
    <article
      data-preview={promo.previewMode ? "true" : "false"}
      className="rounded-[28px] border border-[#2A2A2A] bg-[#1E1E1E] p-4"
    >
      <Link href={`/promo/${promo.id}`} className="block">
        <motion.div whileTap={{ scale: 0.98 }} className="space-y-4">
          <div className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass}`}>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-70"
              style={
                promo.imageUrl
                  ? {
                      backgroundImage: `linear-gradient(rgba(18,18,18,0.1), rgba(18,18,18,0.75)), url(${promo.imageUrl})`,
                    }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent" />
            <div className="absolute left-3 top-3 rounded-full bg-[#121212]/85 px-3 py-1 text-xs text-[#9CA3AF]">
              {promo.distanceLabel} | {promo.neighborhood}
            </div>
            <div className="absolute right-3 top-3 rounded-full bg-[#FF7A00] px-3 py-1 text-xs font-semibold text-[#121212]">
              {promo.discountPercent}% OFF
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
                {promo.merchantName}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#FAFAFA]">
                {promo.title}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-[#9CA3AF]">{promo.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>{promo.priceLabel} | Limited today</span>
              <span className="rounded-full bg-[#121212] px-2 py-1 text-[#00E5A8]">
                Cashback boost
              </span>
            </div>
          </div>
        </motion.div>
      </Link>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onRestrictedAction}
        className="mt-4 w-full rounded-2xl bg-[#FF7A00] py-3 text-sm font-semibold text-[#121212]"
      >
        Get this promo
      </motion.button>
    </article>
  );
});
