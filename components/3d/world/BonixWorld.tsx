"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { WorldCamera } from "@/components/3d/world/WorldCamera";
import { WorldGround } from "@/components/3d/world/WorldGround";
import { WorldLighting } from "@/components/3d/world/WorldLighting";
import { WorldSlots } from "@/components/3d/world/WorldSlots";
import { WorldBuildings } from "@/components/3d/world/WorldBuildings";
import { resolveMockWorld } from "@/lib/3d/world-state";
import type { ResolvedBuilding } from "@/types/3d";

// BonixWorld — Phase 1 entry point. A real <Canvas> with a mock
// world that mirrors the data shape we'll load from Supabase in
// Phase 4. The renderer must always receive a ResolvedBuilding[].

interface BonixWorldProps {
  onSelectBuilding?: (building: ResolvedBuilding) => void;
  onBackgroundTap?: () => void;
  onSelectEmptySlot?: (slotId: string) => void;
  highlightEmptySlots?: boolean;
}

export default function BonixWorld({
  onSelectBuilding,
  onBackgroundTap,
  onSelectEmptySlot,
  highlightEmptySlots,
}: BonixWorldProps) {
  const world = useMemo(() => resolveMockWorld(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const focusTarget = useMemo(() => {
    if (!selectedId) return null;
    const building = world.buildings.find((b) => b.id === selectedId);
    if (!building) return null;
    const slot = world.slots.find((s) => s.id === building.slotId);
    return slot?.position ?? null;
  }, [selectedId, world]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
    const building = world.buildings.find((b) => b.id === id);
    if (building && onSelectBuilding) onSelectBuilding(building);
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] bg-[#091018]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <WorldCamera focusTarget={focusTarget} />
          <WorldLighting />
          <WorldGround onBackgroundTap={onBackgroundTap} />
          <WorldSlots
            slots={world.slots}
            onSelectSlot={onSelectEmptySlot}
            highlightEmpty={highlightEmptySlots}
          />
          <WorldBuildings
            buildings={world.buildings}
            slots={world.slots}
            selectedBuildingId={selectedId}
            onSelectBuilding={handleSelect}
          />
      </Suspense>
    </Canvas>

      {/* Subtle vignette matching the existing 2D diorama atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(9,16,24,0.65))]" />
  </div>
  );
}
