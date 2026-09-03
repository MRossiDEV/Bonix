"use client";

import { useMemo } from "react";
import * as THREE from "three";

// A stylized miniature ground plane — a soft circular slab with a
// thin grass ring. No textures (PRD §30: keep mobile cheap). The
// diamond accent matches the Bonix green.

interface WorldGroundProps {
  radius?: number;
  onBackgroundTap?: () => void;
}

export function WorldGround({ radius = 9, onBackgroundTap }: WorldGroundProps) {
  const slabGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    return new THREE.ShapeGeometry(shape, 64);
  }, [radius]);

  return (
    <group>
      {/* Soft base — a slightly larger dark disk */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <circleGeometry args={[radius + 0.6, 64]} />
        <meshStandardMaterial color="#0C1A18" roughness={1} />
     </mesh>

      {/* Main ground */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        geometry={slabGeometry}
        onPointerDown={onBackgroundTap ? (event) => {
          event.stopPropagation();
          onBackgroundTap();
        } : undefined}
      >
        <meshStandardMaterial color="#0F2A22" roughness={0.95} />
     </mesh>

      {/* Soft inner glow ring to hint at city energy */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[radius * 0.55, radius * 0.62, 64]} />
        <meshBasicMaterial
          color="#22C55E"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
     </mesh>
   </group>
  );
}
