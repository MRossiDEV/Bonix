"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { DRACO_DECODER_PATH, KTX2_TRANSCODER_PATH } from "@/lib/3d/asset-loaders";
import type { BonixAssetDefinition } from "@/types/3d";

// AssetInstance: loads a GLB, or falls back to a colored primitive
// when the asset is missing (PRD §64). Renders a single mesh tree
// that consumers can position/rotate/scale freely.

interface AssetInstanceProps {
  asset?: BonixAssetDefinition;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  primaryColor?: string;
  secondaryColor?: string;
  emissive?: string;
  emissiveIntensity?: number;
  onPointerDown?: (event: THREE.Event) => void;
}

interface PrimitiveFallbackProps {
  primaryColor: string;
  secondaryColor: string;
  emissive?: string;
  emissiveIntensity?: number;
}

function PrimitiveFallback({
  primaryColor,
  secondaryColor,
  emissive,
  emissiveIntensity = 0,
}: PrimitiveFallbackProps) {
  // A simple two-story stylized building block. Used when no GLB
  // is available yet (Phase 1) or when a GLB fails to load.
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[1.6, 1.2, 1.4]} />
        <meshStandardMaterial
          color={primaryColor}
          roughness={0.65}
          metalness={0.05}
          emissive={emissive ?? "#000000"}
          emissiveIntensity={emissiveIntensity}
        />
     </mesh>

      <mesh castShadow receiveShadow position={[0, 1.7, 0]}>
        <boxGeometry args={[1.3, 1, 1.2]} />
        <meshStandardMaterial color={secondaryColor} roughness={0.6} />
     </mesh>

      <mesh castShadow receiveShadow position={[0, 2.3, 0]}>
        <boxGeometry args={[1.5, 0.18, 1.3]} />
        <meshStandardMaterial color="#0B0F14" roughness={0.9} />
     </mesh>

      {/* glowing window strip — the "promo" tell */}
      <mesh position={[0, 1.4, 0.71]}>
        <planeGeometry args={[1.2, 0.5]} />
        <meshStandardMaterial
          color={emissive ?? "#F8FAFC"}
          emissive={emissive ?? "#F8FAFC"}
          emissiveIntensity={emissiveIntensity + 0.4}
          transparent
          opacity={0.85}
        />
     </mesh>
   </group>
  );
}

export function AssetInstance({
  asset,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  primaryColor,
  secondaryColor,
  emissive,
  emissiveIntensity = 0,
  onPointerDown,
}: AssetInstanceProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  const assetUrl = asset?.url ?? "";
  // DRACO via drei's built-in path (PRD §82). KTX2 setup is wired
  // by lib/3d/asset-loaders.ts and applied via drei's setDecoderPath
  // hook when the project ships compressed textures.
  const gltf = useGLTF(assetUrl, DRACO_DECODER_PATH, true);
  const gltfScene = gltf?.scene ?? null;
  const loadFailed = !assetUrl || !gltfScene;

  const cloned = useMemo(() => {
    if (!gltfScene) return null;
    return gltfScene.clone(true);
  }, [gltfScene]);

  // Apply brand colors to whatever materials the GLB exposes. PRD
  // §44: "Where possible, allow material colors to change."
  useEffect(() => {
    if (!cloned) return;

    cloned.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material, index) => {
        if (!material || !("color" in material)) return;

        const mat = material as THREE.MeshStandardMaterial;

        if (primaryColor && index === 0) {
          mat.color = new THREE.Color(primaryColor);
        } else if (secondaryColor && index === 1) {
          mat.color = new THREE.Color(secondaryColor);
        }

        if (emissive && emissiveIntensity > 0) {
          mat.emissive = new THREE.Color(emissive);
          mat.emissiveIntensity = emissiveIntensity;
        }

        mat.needsUpdate = true;
      });
    });
  }, [cloned, primaryColor, secondaryColor, emissive, emissiveIntensity]);

  if (!asset || loadFailed || !cloned) {
    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onPointerDown={onPointerDown}
      >
        <PrimitiveFallback
          primaryColor={primaryColor ?? "#1F2937"}
          secondaryColor={secondaryColor ?? "#94A3B8"}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
     </group>
    );
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={onPointerDown}
    >
      <primitive object={cloned} />
   </group>
  );
}
