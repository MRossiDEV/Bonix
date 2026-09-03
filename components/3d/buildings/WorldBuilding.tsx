"use client";

import { useMemo } from "react";
import { AssetInstance } from "@/components/3d/assets/AssetInstance";
import { BuildingBranding } from "@/components/3d/buildings/BuildingBranding";
import { BuildingPromoState } from "@/components/3d/buildings/BuildingPromoState";
import { resolveBuildingState } from "@/lib/3d/building-state";
import { MOCK_ASSETS } from "@/lib/3d/mockWorld";
import { useActivePromoForBuilding } from "@/lib/3d/use-active-promo-for-building";
import { useMerchantBranding } from "@/lib/3d/use-merchant-branding";
import type { ResolvedBuilding } from "@/types/3d";

// A single rendered building. Knows how to translate building state
// into visual treatment (PRD §22 priority). Selectable — calls back
// up to the parent so the camera can focus.
//
// Phase 6: also queries the merchant's live active promo row so the
// glow + label track reality, not the hard-coded mock hasActivePromo.

interface WorldBuildingProps {
  building: ResolvedBuilding;
  position: [number, number, number];
  rotationY: number;
  scale?: number;
  isSelected: boolean;
  onSelect: (buildingId: string) => void;
}

export function WorldBuilding({
  building,
  position,
  rotationY,
  scale = 1,
  isSelected,
  onSelect,
}: WorldBuildingProps) {
  const asset = MOCK_ASSETS[building.assetId];

  const branding = useMerchantBranding(building.merchantId);
  const livePromo = useActivePromoForBuilding(building.merchantId);

  // Live promo always wins over the mock hasActivePromo flag so the
  // engine reflects what merchants are currently running.
  const liveBuildingState = useMemo(() => {
    if (!livePromo) return building.buildingState;
    return resolveBuildingState({
      hasActivePromo: true,
      promoExpiresAt: livePromo.expiresAt,
      isNew: building.isNew,
      hasReservation: building.isReserved,
      isVisited: building.buildingState === "VISITED",
    });
  }, [livePromo, building]);

  const effectivePromoLabel = livePromo?.label ?? building.promoLabel ?? null;

  const showPromo =
    liveBuildingState === "ACTIVE_PROMO" ||
    liveBuildingState === "LIMITED_PROMO";

  const effectivePrimaryColor =
    branding?.primaryColor ?? building.primaryColor ?? "#94A3B8";
  const effectiveSecondaryColor =
    branding?.secondaryColor ?? building.secondaryColor ?? "#F8FAFC";

  const emissive = useMemo(() => {
    if (showPromo) return "#F59E0B";
    if (liveBuildingState === "RESERVED") return "#3B82F6";
    if (liveBuildingState === "NEW") return "#F59E0B";
    return undefined;
  }, [liveBuildingState, showPromo]);

  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={isSelected ? scale * 1.06 : scale}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect(building.id);
      }}
    >
      <AssetInstance
        asset={asset}
        position={[0, 0, 0]}
        scale={1}
        primaryColor={effectivePrimaryColor}
        secondaryColor={effectiveSecondaryColor}
        emissive={emissive}
        emissiveIntensity={showPromo ? 0.35 : 0.1}
      />

      <BuildingBranding
        position={position}
        logoUrl={branding?.logoUrl ?? null}
        signText={branding?.signText ?? building.signText ?? null}
        primaryColor={effectivePrimaryColor}
      />

      <BuildingPromoState
        position={position}
        buildingState={liveBuildingState}
        promoLabel={effectivePromoLabel}
      />

      {isSelected ? (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.1, 1.25, 32]} />
          <meshBasicMaterial color="#E5E7EB" transparent opacity={0.85} />
     </mesh>
      ) : null}
   </group>
  );
}
