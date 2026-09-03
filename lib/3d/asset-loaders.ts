"use client";

// Asset loader paths (PRD §82).
// DRACO + KTX2 decoder URLs shared across the 3D engine. Drei's
// useGLTF picks these up when consumers pass useDraco/useKTX2
// flags. Centralising the URLs here means a swap (e.g. self-hosted
// decoders) happens in one place.

export const DRACO_DECODER_PATH =
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

export const KTX2_TRANSCODER_PATH =
  "https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/";

// Re-export so callers can pass them through to useGLTF when they
// explicitly request compressed loads.
export { useGLTF } from "@react-three/drei";
