"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

// Floating "promo badge" rendered above a building when its state
// is ACTIVE_PROMO or LIMITED_PROMO. Lightweight — a single sprite
// billboard plus a pulsing ring. PRD §23: keep effects cheap.

interface PromoIndicatorProps {
  position: [number, number, number];
  active: boolean;
  label?: string;
  intensity?: number;
  color?: string;
}

export function PromoIndicator({
  position,
  active,
  label,
  intensity = 1,
  color = "#22C55E",
}: PromoIndicatorProps) {
  const ringRef = useRef<THREE.Mesh | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (groupRef.current && active) {
      groupRef.current.position.y =
        position[1] + Math.sin(t * 1.8) * 0.08 + 3.2;
    }

    if (ringRef.current && active) {
      const scale = 1 + Math.sin(t * 2.4) * 0.08;
      ringRef.current.scale.set(scale, scale, scale);

      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      if (material) {
        material.opacity = 0.35 + Math.sin(t * 2.4) * 0.2;
      }
    }
  });

  const badgeTexture = useMemo(() => {
    if (typeof document === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 96;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#0B0F14";
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    const radius = 32;
    ctx.beginPath();
    ctx.moveTo(radius, 4);
    ctx.lineTo(canvas.width - radius, 4);
    ctx.quadraticCurveTo(canvas.width - 4, 4, canvas.width - 4, radius);
    ctx.lineTo(canvas.width - 4, canvas.height - radius);
    ctx.quadraticCurveTo(
      canvas.width - 4,
      canvas.height - 4,
      canvas.width - radius,
      canvas.height - 4,
    );
    ctx.lineTo(radius, canvas.height - 4);
    ctx.quadraticCurveTo(4, canvas.height - 4, 4, canvas.height - radius);
    ctx.lineTo(4, radius);
    ctx.quadraticCurveTo(4, 4, radius, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "bold 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label ?? "PROMO", canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [color, label]);

  if (!active) return null;

  return (
    <group ref={groupRef} position={[position[0], position[1] + 3.2, position[2]]}>
      {/* glowing ring on the ground around the building */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.1, 0]}
      >
        <ringGeometry args={[1.1 * intensity, 1.4 * intensity, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
     </mesh>

      {/* floating badge */}
      {badgeTexture ? (
        <sprite scale={[1.4, 0.52, 1]}>
          <spriteMaterial
            map={badgeTexture}
            transparent
            depthWrite={false}
          />
       </sprite>
      ) : null}
   </group>
  );
}
