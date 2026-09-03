"use client";

// Warm, soft lighting per PRD §86. Two directional lights from the
// "sun" and the rim, plus a low ambient that never fully blackens
// any face — important so the city reads on cheap mobile screens.

export function WorldLighting() {
  return (
    <>
      <ambientLight intensity={0.55} color="#E5E7EB" />

      <directionalLight
        position={[8, 14, 6]}
        intensity={1.1}
        color="#FDE68A"
        castShadow
      />

      <directionalLight
        position={[-6, 8, -8]}
        intensity={0.35}
        color="#67E8F9"
      />

      {/* Bonix-green rim light */}
      <pointLight
        position={[0, 4, 0]}
        intensity={0.4}
        color="#22C55E"
        distance={14}
        decay={1.4}
      />
    </>
  );
}
