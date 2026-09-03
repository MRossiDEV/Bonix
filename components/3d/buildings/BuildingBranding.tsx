"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

// BuildingBranding (PRD §43-44)
// Renders the merchant's logo or sign text as a floating placard next
// to the building. Pure 2D-friendly: it builds a CanvasTexture so we
// don't pay for a separate GLB material. Hidden when neither logoUrl
// nor signText is available so we don't clutter the city.

interface BuildingBrandingProps {
  position: [number, number, number];
  logoUrl?: string | null;
  signText?: string | null;
  primaryColor?: string;
  height?: number;
}

const PLACARD_WIDTH = 1.4;
const PLACARD_HEIGHT = 0.5;

export function BuildingBranding({
  position,
  logoUrl,
  signText,
  primaryColor = "#22C55E",
  height = 1.8,
}: BuildingBrandingProps) {
  const [logoTexture, setLogoTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!logoUrl) {
      setLogoTexture(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      logoUrl,
      (texture) => {
        if (!cancelled) {
          texture.colorSpace = THREE.SRGBColorSpace;
          setLogoTexture(texture);
        }
      },
      undefined,
      () => {
        if (!cancelled) setLogoTexture(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [logoUrl]);

  const placardTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    if (!signText) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "rgba(11, 15, 20, 0.85)";
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    const r = 32;
    ctx.beginPath();
    ctx.moveTo(r, 6);
    ctx.lineTo(canvas.width - r, 6);
    ctx.quadraticCurveTo(canvas.width - 6, 6, canvas.width - 6, r);
    ctx.lineTo(canvas.width - 6, canvas.height - r);
    ctx.quadraticCurveTo(
      canvas.width - 6,
      canvas.height - 6,
      canvas.width - r,
      canvas.height - 6,
    );
    ctx.lineTo(r, canvas.height - 6);
    ctx.quadraticCurveTo(6, canvas.height - 6, 6, canvas.height - r);
    ctx.lineTo(6, r);
    ctx.quadraticCurveTo(6, 6, r, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primaryColor;
    ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const trimmed = signText.length > 14 ? `${signText.slice(0, 13)}…` : signText;
    ctx.fillText(trimmed.toUpperCase(), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [signText, primaryColor]);

  const hasLogo = Boolean(logoTexture);
  const hasText = Boolean(placardTexture);
  if (!hasLogo && !hasText) return null;

  return (
    <group
      position={[position[0] + 0.9, position[1] + height, position[2]]}
      rotation={[0, -Math.PI / 4, 0]}
    >
      {hasLogo ? (
        <sprite scale={[PLACARD_WIDTH, PLACARD_HEIGHT, 1]}>
          <spriteMaterial map={logoTexture} transparent depthWrite={false} />
       </sprite>
      ) : placardTexture ? (
        <sprite scale={[PLACARD_WIDTH, PLACARD_HEIGHT, 1]}>
          <spriteMaterial
            map={placardTexture}
            transparent
            depthWrite={false}
          />
       </sprite>
      ) : null}
   </group>
  );
}
