"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { resolveMockWorld } from "@/lib/3d/world-state";
import { useCityBuildings, type CityBuilding } from "@/lib/3d/use-city-buildings";
import { useCityProgression } from "@/lib/3d/use-city-progression";

// Phase 1: BonixWorld is loaded only on the client and only when
// this page mounts, so other routes don't pay the bundle cost.
const BonixWorld = dynamic(
  () => import("@/components/3d/world/BonixWorld"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#091018] text-xs text-[#64748B]">
        Building your city…
    </div>
    ),
  },
);

// Tiny helper to keep emoji/category/labels synced with the 3D mock
// without forcing the HTML panel to render Three.js types.
function describeBuilding(building: CityBuilding) {
  const assetCategory = building.assetId.replace(/^asset-/, "").toUpperCase();
  const fallbackEmoji =
    assetCategory === "CAFE"
      ? "☕"
      : assetCategory === "HOTEL"
      ? "🏨"
      : assetCategory === "FITNESS"
      ? "🏋️"
      : assetCategory === "HOUSE"
      ? "🏡"
      : "🍃";
  const fallbackCategory =
    assetCategory === "CAFE"
      ? "Café"
      : assetCategory === "HOTEL"
      ? "Hotel"
      : assetCategory === "FITNESS"
      ? "Fitness"
      : assetCategory === "HOUSE"
      ? "Restaurant"
      : "Restaurant";

  return {
    emoji: fallbackEmoji,
    category: fallbackCategory,
  };
}

export default function UserCityPage() {
  const params = useParams<{ userId?: string | string[] }>();

  const userId = Array.isArray(params?.userId)
    ? params.userId[0]
    : params?.userId ?? "";

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );

  // Warm the mock world resolver on mount so the 3D scene is ready
  // before the user finishes the page chrome scroll-in.
  useMemo(() => resolveMockWorld(), []);

  // Phase 6: live branding + active promos so the HTML detail
  // panel reflects what merchants are currently running.
  const buildings = useCityBuildings();
  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId) ?? null,
    [selectedBuildingId, buildings],
  );

  // Phase 9: city progression events (PRD §81).
  const { snapshot: progression, logEvent } = useCityProgression(
    userId || null,
  );

  // Phase 8: ?place=<merchantId> opens placement mode (PRD §80).
  // The city surfaces a CTA; tapping an empty slot writes a
  // world_buildings row. V1 logs to the console + persists to
  // Supabase when available; full drag/tap animation lands later.
  const searchParams = useSearchParams();
  const pendingMerchantId = searchParams?.get("place");
  const [placementStatus, setPlacementStatus] = useState<
    | { kind: "idle" }
    | { kind: "placing"; merchantId: string }
    | { kind: "placed"; slotId: string; merchantId: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    if (!pendingMerchantId) return;
    setPlacementStatus({ kind: "placing", merchantId: pendingMerchantId });
  }, [pendingMerchantId]);

  const unlockedSpots = buildings.length;
  const totalSpots = 10;
  const progress = (unlockedSpots / totalSpots) * 100;

  const handleClearSelection = () => setSelectedBuildingId(null);

  const handlePlaceInEmptySlot = async (slotId: string) => {
    if (placementStatus.kind !== "placing") return;
    const merchantId = placementStatus.merchantId;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase unavailable");

      const { error } = await supabase.from("world_buildings").insert({
        world_id: null, // V1: world association resolves after the
        //       worlds scaffold ships in Phase 9. We still record
        //       the placement so the merchant appears in city UI.
        slot_id: slotId,
        merchant_id: merchantId,
        state: "NEW",
      });

      if (error) throw error;
      setPlacementStatus({ kind: "placed", slotId, merchantId });
      void logEvent({
        kind: "BUILDING_PLACED",
        points: 50,
        slotId,
        merchantId,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Placement failed";
      setPlacementStatus({ kind: "error", message });
    }
  };

  const handleDismissPlacement = () => {
    setPlacementStatus({ kind: "idle" });
  };

  return (
    <section className="relative h-[calc(100vh-108px-env(safe-area-inset-bottom))] w-full overflow-hidden bg-[#091018]">
      {/* ============================================================
          3D VIEWPORT — fills the whole route, the only real surface
      ============================================================ */}

      <div className="absolute inset-0">
        <BonixWorld
          onSelectBuilding={(building) =>
            setSelectedBuildingId((current) =>
              current === building.id ? null : building.id,
            )
          }
          onBackgroundTap={handleClearSelection}
          onSelectEmptySlot={handlePlaceInEmptySlot}
          highlightEmptySlots={placementStatus.kind === "placing"}
        />
    </div>

      {/* ============================================================
          ATMOSPHERE OVERLAYS (kept from the diorama)
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[25%] h-48 w-48 -translate-x-1/2 rounded-full bg-[#22C55E]/8 blur-[70px]" />
        <div className="absolute bottom-24 left-0 h-40 w-40 rounded-full bg-[#14B8A6]/5 blur-[70px]" />
    </div>

      {/* ============================================================
          TOP-LEFT HUD — world title
      ============================================================ */}

      <div className="pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-3">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14]/80 px-3 py-2 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_10px_rgba(34,197,94,0.7)]" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#64748B]">
              Your world
          </span>
        </div>
          <p className="mt-1 text-base font-black tracking-tight text-[#F8FAFC]">
            My City
        </p>
      </div>
    </div>

      {/* ============================================================
          TOP-RIGHT HUD — level + settings
      ============================================================ */}

      <div className="absolute right-4 top-4 z-30 flex items-start gap-2">
        <div className="pointer-events-auto overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0B0F14]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
                City level
            </p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="text-base font-black text-[#F8FAFC]">
                  Level 1
              </span>
                <span className="text-[10px] font-semibold text-[#22C55E]">
                  My Block
              </span>
                <span className="text-[9px] font-bold text-[#94A3B8]">
                  · {progression.points} XP
              </span>
            </div>
          </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-lg">
              🏙️
          </div>
        </div>

          <div className="border-t border-[#1F2937] px-3 py-2">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[#64748B]">
                {unlockedSpots}/{totalSpots} spots
            </span>
              <span className="font-bold text-[#22C55E]">
                {Math.round(progress)}%
            </span>
          </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#1F2937]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full bg-[#22C55E]"
              />
          </div>
        </div>
      </div>

        <button
          type="button"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1F2937] bg-[#0B0F14]/80 text-[#94A3B8] backdrop-blur-xl"
          aria-label="City settings"
        >
          <SettingsIcon />
      </button>
    </div>

      {/* ============================================================
          PLACEMENT MODE BANNER — floats top-center
      ============================================================ */}

      {placementStatus.kind === "placing" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-4 z-30 flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#22C55E]/30 bg-[#0B0F14]/80 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/15 text-lg">
            📍
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Place this merchant in your city
          </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              Tap an empty slot to drop{" "}
              <code className="rounded bg-[#1F2937] px-1 text-[10px] text-[#94A3B8]">
                {placementStatus.merchantId}
            </code>
          </p>
        </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl border border-[#1F2937] bg-[#080C11] px-3 py-1.5 text-[10px] font-bold text-[#94A3B8]"
          >
            Cancel
        </button>
      </motion.div>
      ) : null}

      {placementStatus.kind === "placed" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-4 z-30 flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#22C55E]/40 bg-[#0B0F14]/80 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/15 text-lg">
            ✓
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Placed into slot {placementStatus.slotId}
          </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              Your new building is live.
          </p>
        </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl bg-[#22C55E] px-3 py-1.5 text-[10px] font-black text-[#041007]"
          >
            Done
        </button>
      </motion.div>
      ) : null}

      {placementStatus.kind === "error" ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-4 z-30 flex w-[min(92vw,420px)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-[#EF4444]/30 bg-[#0B0F14]/80 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EF4444]/15 text-lg">
            !
        </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-[#F8FAFC]">
              Placement failed
          </p>
            <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
              {placementStatus.message}
          </p>
        </div>
          <button
            type="button"
            onClick={handleDismissPlacement}
            className="rounded-xl border border-[#1F2937] bg-[#080C11] px-3 py-1.5 text-[10px] font-bold text-[#94A3B8]"
          >
            Dismiss
        </button>
      </motion.div>
      ) : null}

      {/* ============================================================
          BOTTOM-LEFT HUD — block summary + activity
      ============================================================ */}

      <div className="pointer-events-none absolute bottom-24 left-4 z-30 space-y-2">
        <div className="rounded-2xl border border-[#1F2937] bg-[#0B0F14]/80 px-3 py-2 backdrop-blur-xl">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            My Block
        </p>
          <p className="mt-0.5 text-[10px] font-semibold text-[#F8FAFC]">
            {buildings.length} places live here
        </p>
      </div>

        <div className="pointer-events-auto w-[min(80vw,260px)] overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0B0F14]/80 backdrop-blur-xl">
          <ActivityCard
            emoji="🍃"
            title="La Cocina Verde"
            description="A new promo is waiting for you."
            time="12 min ago"
            action="Open"
          />
          <div className="border-t border-[#1F2937]" />
          <ActivityCard
            emoji="☕"
            title="Montevideo Brew"
            description="Your favorite café just added 2x credits."
            time="1h ago"
            action="View"
          />
      </div>
    </div>

      {/* ============================================================
          BOTTOM-RIGHT HUD — grow CTA + activity ping
      ============================================================ */}

      <div className="absolute bottom-24 right-4 z-30 flex flex-col items-end gap-2">
        <div className="pointer-events-none flex items-center gap-2 rounded-2xl border border-[#22C55E]/20 bg-[#0B0F14]/80 px-3 py-2 backdrop-blur-xl">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#22C55E]" />
        </span>
          <span className="text-[9px] font-bold text-[#22C55E]">
            2 active
        </span>
      </div>

        <Link
          href={`${userId ? `/user/${userId}` : ""}/feed`}
          className="pointer-events-auto flex w-[min(80vw,260px)] items-center justify-center gap-2 rounded-2xl bg-[#22C55E] px-4 py-3 text-xs font-black text-[#041007] shadow-[0_8px_24px_rgba(34,197,94,0.35)] transition hover:bg-[#4ADE80]"
        >
          <span className="text-base">🌱</span>
          Discover new places
          <ArrowIcon />
      </Link>
    </div>

      {/* ============================================================
          SELECTED BUILDING PANEL — slides up from the bottom
      ============================================================ */}

      {selectedBuilding ? (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 32 }}
          transition={{ duration: 0.22 }}
          className="absolute bottom-24 left-1/2 z-40 w-[min(94vw,420px)] -translate-x-1/2 overflow-hidden rounded-3xl border border-[#22C55E]/20 bg-[#0B0F14]/90 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center gap-3 p-4">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
              style={{
                backgroundColor: `${selectedBuilding.branding.primaryColor}1A`,
              }}
            >
              {describeBuilding(selectedBuilding).emoji}
          </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#F8FAFC]">
                {selectedBuilding.merchantName}
            </p>

              <p className="mt-0.5 text-[10px] text-[#64748B]">
                {describeBuilding(selectedBuilding).category} · Level{" "}
                {selectedBuilding.level}
            </p>
          </div>

            {selectedBuilding.hasActivePromo || selectedBuilding.isLivePromo ? (
              <div
                className="rounded-full px-2.5 py-1 text-[9px] font-black"
                style={{
                  backgroundColor: `${selectedBuilding.branding.primaryColor}1A`,
                  color: selectedBuilding.branding.primaryColor,
                }}
              >
                {selectedBuilding.effectivePromoLabel ?? "Promo"}
            </div>
            ) : null}
        </div>

          <div className="grid grid-cols-2 border-t border-[#1F2937]">
            <Link
              href={`${userId ? `/user/${userId}` : ""}/feed`}
              className="flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold text-[#94A3B8] transition hover:bg-[#111827] hover:text-[#F8FAFC]"
            >
              View place
              <ArrowIcon />
          </Link>

            <button
              type="button"
              onClick={() => setSelectedBuildingId(null)}
              className="border-l border-[#1F2937] px-4 py-3.5 text-xs font-bold text-[#64748B]"
            >
              Close
          </button>
        </div>
      </motion.div>
      ) : null}
 </section>
  );
}

/* ================================================================
   COMPONENTS
================================================================ */

function ActivityCard({
  emoji,
  title,
  description,
  time,
  action,
}: {
  emoji: string;
  title: string;
  description: string;
  time: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-base">
        {emoji}
    </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-bold text-[#F8FAFC]">
            {title}
        </p>

          <span className="shrink-0 text-[8px] text-[#475569]">
            {time}
        </span>
      </div>

        <p className="mt-0.5 truncate text-[10px] text-[#64748B]">
          {description}
      </p>
    </div>

      <button
        type="button"
        className="shrink-0 rounded-lg bg-[#22C55E]/10 px-2.5 py-1.5 text-[9px] font-bold text-[#22C55E]"
      >
        {action}
    </button>
  </div>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
  </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z" />
  </svg>
  );
}
