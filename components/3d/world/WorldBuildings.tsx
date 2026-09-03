"use client";

import { useMemo } from "react";
import { WorldBuilding } from "@/components/3d/buildings/WorldBuilding";
import type { ResolvedBuilding, BuildingSlot } from "@/types/3d";

// Maps buildings onto their slots and handles selection state.

interface WorldBuildingsProps {
  buildings: ResolvedBuilding[];
  slots: BuildingSlot[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
}

export function WorldBuildings({
  buildings,
  slots,
  selectedBuildingId,
  onSelectBuilding,
}: WorldBuildingsProps) {
  const slotById = useMemo(
    () => new Map(slots.map((slot) => [slot.id, slot])),
    [slots],
  );

  return (
    <group>
      {buildings.map((building) => {
        const slot = slotById.get(building.slotId);
        if (!slot) return null;

        return (
          <WorldBuilding
            key={building.id}
            building={building}
            position={slot.position}
            rotationY={slot.rotationY}
            scale={slot.scale}
            isSelected={selectedBuildingId === building.id}
            onSelect={onSelectBuilding}
          />
        );
      })}
  </group>
  );
}
