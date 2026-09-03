"use client";

import { Detailed } from "@react-three/drei";
import { AssetInstance } from "@/components/3d/assets/AssetInstance";
import type { BonixAssetDefinition } from "@/types/3d";

// LodAssetInstance (PRD §82)
// Renders the full GLB up close and a low-detail colored box far
// away. drei's <Detailed> swaps meshes by camera distance, which
// keeps the city light for users that have many buildings on
// screen.

interface LodAssetInstanceProps {
  asset?: BonixAssetDefinition;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  primaryColor?: string;
  secondaryColor?: string;
  emissive?: string;
  emissiveIntensity?: number;
}

export function LodAssetInstance({
  asset,
  position,
  rotation,
  scale,
  primaryColor,
  secondaryColor,
  emissive,
  emissiveIntensity,
}: LodAssetInstanceProps) {
  return (
    <Detailed distances={[0, 12]}>
      {/* L0: full GLB up close */}
      <AssetInstance
        asset={asset}
        position={position}
        rotation={rotation}
        scale={scale}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
      />

      {/* L1: low-cost colored primitive past 12 world units */}
      <mesh
        position={position}
        rotation={rotation}
        scale={typeof scale === "number" ? scale : 1}
        castShadow={false}
        receiveShadow={false}
      >
        <boxGeometry args={[1.6, 2.2, 1.4]} />
        <meshStandardMaterial color={primaryColor ?? "#1F2937"} />
    </mesh>
  </Detailed>
  );
}
