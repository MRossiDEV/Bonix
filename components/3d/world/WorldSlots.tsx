"use client";

import { useMemo } from "react";
import * as THREE from "three";

// Decorative slot indicator — a dashed disc rendered on the ground
// wherever a building slot is defined but empty. Tapping an empty
// slot during placement mode triggers `onSelectSlot` (PRD §80).

interface WorldSlotsProps {
  slots: { id: string; position: [number, number, number]; occupied: boolean }[];
  onSelectSlot?: (slotId: string) => void;
  highlightEmpty?: boolean;
}

function SlotRing({
  position,
  highlight,
  onClick,
}: {
  position: [number, number, number];
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[position[0], 0.02, position[2]]}
      onPointerDown={(event) => {
        if (!onClick) return;
        event.stopPropagation();
        onClick();
      }}
    >
      <ringGeometry args={[0.85, 1.05, 32]} />
      <meshBasicMaterial
        color="#22C55E"
        transparent
        opacity={highlight ? 0.9 : 0.45}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
 </mesh>
  );
}

export function WorldSlots({ slots, onSelectSlot, highlightEmpty }: WorldSlotsProps) {
  const empty = useMemo(() => slots.filter((s) => !s.occupied), [slots]);

  return (
    <group>
      {empty.map((slot) => (
        <SlotRing
          key={slot.id}
          position={slot.position}
          highlight={highlightEmpty}
          onClick={onSelectSlot ? () => onSelectSlot(slot.id) : undefined}
        />
      ))}
</group>
  );
}
