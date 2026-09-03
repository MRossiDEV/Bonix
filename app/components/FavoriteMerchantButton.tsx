"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type FavoriteMerchantButtonProps = {
  merchantId: string;
  initialIsFavorited?: boolean;
  className?: string;
  // When provided, a successful POST (favoriting) navigates to the
  // user's city with a ?place= query so the 3D world can drop the
  // merchant into an empty slot (PRD §80).
  redirectToCityUserId?: string;
};

type FavoritesResponse = {
  merchantIds?: string[];
};

export function FavoriteMerchantButton({
  merchantId,
  initialIsFavorited,
  className,
  redirectToCityUserId,
}: FavoriteMerchantButtonProps) {
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited ?? false);
  const [isBusy, setIsBusy] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let active = true;

    const loadFavorites = async () => {
      try {
        const response = await fetch("/api/favorites", { cache: "no-store" });

        if (response.status === 401 || response.status === 403) {
          if (active) {
            setIsVisible(false);
          }
          return;
        }

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as FavoritesResponse;
        if (!active) {
          return;
        }

        const merchantIds = payload.merchantIds ?? [];
        setIsFavorited(merchantIds.includes(merchantId));
      } catch {
        if (active) {
          setIsVisible(false);
        }
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [merchantId]);

  const handleToggleFavorite = async () => {
    if (isBusy) {
      return;
    }

    const nextFavorited = !isFavorited;
    setIsBusy(true);
    setIsFavorited(nextFavorited);

    try {
      const response = await fetch("/api/favorites", {
        method: nextFavorited ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merchantId }),
      });

      if (!response.ok) {
        throw new Error("Unable to update favorite business.");
      }

      // Only redirect when we're adding the favorite, not removing
      // it. Avoids the surprising "where did I go?" after unstar.
      if (nextFavorited && redirectToCityUserId) {
        router.push(`/user/${redirectToCityUserId}/city?place=${merchantId}`);
      }
    } catch {
      setIsFavorited(!nextFavorited);
    } finally {
      setIsBusy(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggleFavorite}
      disabled={isBusy}
      className={`rounded-md border px-4 py-2 text-md font-semibold uppercase tracking-wide ${
        isFavorited
          ? "border-[#FF7A00] bg-[#FF7A00]/15 text-[#FF7A00]"
          : "border-[#2A2A2A] bg-[#121212] text-[#FAFAFA]"
      } ${isBusy ? "opacity-60" : ""} ${className ?? ""}`}
    >
      {isBusy ? "Updating..." : isFavorited ? "★" : "☆"}
    </button>
  );
}