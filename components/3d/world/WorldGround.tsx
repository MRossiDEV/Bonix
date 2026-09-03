"use client";

import { useMemo } from "react";
import * as THREE from "three";

// SimCity-style ground: a square grass slab with a central road
// running along Z. Pavement strips line both sides of the road.
// Buildings sit on slots flanking the road (see mockWorld.ts).

interface WorldGroundProps {
  size?: number;
  roadWidth?: number;
  onBackgroundTap?: () => void;
}

const ROAD_LENGTH = 18;
const PAVEMENT_WIDTH = 0.45;

export function WorldGround({
  size = 16,
  roadWidth = 1.6,
  onBackgroundTap,
}: WorldGroundProps) {
  const grassGeometry = useMemo(
    () => new THREE.PlaneGeometry(size, size),
    [size],
  );

  // Road center dashes — 12 segments along Z
  const dashes = useMemo(() => {
    const segs: { z: number }[] = [];
    const step = 0.9;
    const start = -ROAD_LENGTH / 2 + 0.6;
    const end = ROAD_LENGTH / 2 - 0.4;
    for (let z = start; z <= end; z += step) {
      segs.push({ z });
    }
    return segs;
  }, []);

  return (
    <group>
      {/* Soft base shadow disk for depth */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[size + 1.2, size + 1.2]} />
        <meshStandardMaterial color="#0C1A14" roughness={1} />
     </mesh>

      {/* Grass slab */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        geometry={grassGeometry}
        onPointerDown={
          onBackgroundTap
            ? (event) => {
                event.stopPropagation();
                onBackgroundTap();
              }
            : undefined
        }
      >
        <meshStandardMaterial color="#2F7D32" roughness={0.95} />
     </mesh>

      {/* Pavement — left side of road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-roadWidth / 2 - PAVEMENT_WIDTH / 2, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[PAVEMENT_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
     </mesh>

      {/* Pavement — right side of road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roadWidth / 2 + PAVEMENT_WIDTH / 2, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[PAVEMENT_WIDTH, ROAD_LENGTH]} />
        <meshStandardMaterial color="#9CA3AF" roughness={0.9} />
     </mesh>

      {/* Asphalt road */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        receiveShadow
      >
        <planeGeometry args={[roadWidth, ROAD_LENGTH]} />
        <meshStandardMaterial color="#1F2937" roughness={0.85} />
     </mesh>

      {/* Dashed center line */}
      {dashes.map((dash, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, dash.z]}
        >
          <planeGeometry args={[0.12, 0.5]} />
          <meshBasicMaterial color="#F8FAFC" side={THREE.DoubleSide} />
      </mesh>
      ))}

      {/* Subtle grass-edge inset on the two grass sides (cosmetic only) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-roadWidth / 2 - PAVEMENT_WIDTH - size / 4, 0.002, 0]}
      >
        <planeGeometry args={[size / 2 - roadWidth / 2 - PAVEMENT_WIDTH, size]} />
        <meshStandardMaterial color="#256029" roughness={1} />
     </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roadWidth / 2 + PAVEMENT_WIDTH + size / 4, 0.002, 0]}
      >
        <planeGeometry args={[size / 2 - roadWidth / 2 - PAVEMENT_WIDTH, size]} />
        <meshStandardMaterial color="#256029" roughness={1} />
     </mesh>
  </group>
  );
}
