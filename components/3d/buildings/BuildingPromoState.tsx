"use client";

import { PromoIndicator } from "@/components/3d/buildings/BuildingEffects";
import type { BuildingState } from "@/types/3d";

// BuildingPromoState (PRD §22, §46)
// Translates a BuildingState (priority-resolved upstream) into the
// right PromoIndicator config: ring color, intensity, label.

interface BuildingPromoStateProps {
  position: [number, number, number];
  buildingState: BuildingState;
  promoLabel?: string | null;
}

const STATE_COLOR: Record<BuildingState, string | undefined> = {
  LIMITED_PROMO: "#22C55E",
  ACTIVE_PROMO: "#22C55E",
  RESERVED: "#3B82F6",
  NEW: "#F59E0B",
  VISITED: undefined,
  NORMAL: undefined,
};

const STATE_INTENSITY: Record<BuildingState, number> = {
  LIMITED_PROMO: 1.3,
  ACTIVE_PROMO: 1,
  RESERVED: 0.8,
  NEW: 0.6,
  VISITED: 0.4,
  NORMAL: 0,
};

const STATE_LABEL: Record<BuildingState, string | undefined> = {
  LIMITED_PROMO: "Limited",
  ACTIVE_PROMO: "Promo",
  RESERVED: "Reserved",
  NEW: "New",
  VISITED: undefined,
  NORMAL: undefined,
};

export function BuildingPromoState({
  position,
  buildingState,
  promoLabel,
}: BuildingPromoStateProps) {
  const color = STATE_COLOR[buildingState];
  if (!color) return null;

  return (
    <PromoIndicator
      position={position}
      active
      intensity={STATE_INTENSITY[buildingState]}
      color={color}
      label={promoLabel ?? STATE_LABEL[buildingState] ?? "BONIX"}
    />
  );
}
