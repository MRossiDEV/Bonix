"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { AssetInstance } from "@/components/3d/assets/AssetInstance";
import { WorldLighting } from "@/components/3d/world/WorldLighting";
import { resolveAsset } from "@/lib/3d/asset-registry";
import type { BonixAssetDefinition } from "@/types/3d";

// A reusable preview canvas for the Studio and any "inspect" panel.
// Slightly larger camera distance than the world so a single asset
// fills the frame.

interface AssetPreviewProps {
  assetId?: string;
  primaryColor?: string;
  height?: number | string;
}

function PreviewStage({
  asset,
  primaryColor,
}: {
  asset: BonixAssetDefinition;
  primaryColor?: string;
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 5]} fov={32} />
      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3}
        maxDistance={8}
        target={[0, 1, 0]}
      />
      <WorldLighting />
      <AssetInstance
        asset={asset}
        position={[0, 0, 0]}
        primaryColor={primaryColor}
        secondaryColor="#94A3B8"
      />
    </>
  );
}

export function AssetPreview({
  assetId,
  primaryColor,
  height = 220,
}: AssetPreviewProps) {
  const asset = assetId ? resolveAsset(assetId) : undefined;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-[#1F2937] bg-[#080C11]"
      style={{ height }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          {asset ? (
            <PreviewStage asset={asset} primaryColor={primaryColor} />
          ) : null}
       </Suspense>
     </Canvas>

      {!asset ? (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#64748B]">
          No asset selected
       </div>
      ) : null}
   </div>
  );
}
