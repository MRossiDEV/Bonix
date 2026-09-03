"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Camera + tap-to-focus. PRD §28-29. We start above the world at
// (12, 14, 12) and gently settle, then smoothly track a target
// whenever the user selects a building.

interface WorldCameraProps {
  focusTarget?: [number, number, number] | null;
}

export function WorldCamera({ focusTarget }: WorldCameraProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const { camera } = useThree();

  const desired = useRef(new THREE.Vector3(12, 14, 12));
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const tmpLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      cameraRef.current = camera;
      camera.position.set(12, 14, 12);
      camera.lookAt(0, 0, 0);
    }
  }, [camera]);

  useEffect(() => {
    if (!focusTarget) {
      desired.current.set(12, 14, 12);
      target.current.set(0, 0, 0);
      return;
    }

    const [x, y, z] = focusTarget;
    desired.current.set(x + 6, y + 7, z + 6);
    target.current.set(x, y, z);
  }, [focusTarget]);

  useFrame(() => {
    if (!cameraRef.current) return;

    cameraRef.current.position.lerp(desired.current, 0.06);
    tmpLookAt.current.lerp(target.current, 0.08);
    cameraRef.current.lookAt(tmpLookAt.current);
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[12, 14, 12]}
        fov={38}
        near={0.1}
        far={120}
      />
      <OrbitControls
        enablePan={false}
        enableZoom
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.6}
        minDistance={10}
        maxDistance={24}
        target={[0, 0, 0]}
      />
    </>
  );
}
