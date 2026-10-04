"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/*
  CarGLTF - load car model dari .glb
  
  Taruh file di: public/models/car.glb
  
  Roda berputar di sumbu X (rolling, bukan gasing).
  Mobil bergerak di sumbu Z.
*/

interface CarGLTFProps {
  modelPath?: string;
  position?: [number, number, number];
  rotation?: number;
  scale?: number;
  speed?: number;
}

export default function CarGLTF({
  modelPath = "/models/car.glb",
  position = [0, 0, 0],
  rotation = 0,
  scale = 1,
  speed = 0,
}: CarGLTFProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone scene & find wheel refs via useMemo (only once)
  const { clonedScene, wheels } = useMemo(() => {
    const cloned = scene.clone(true) as THREE.Group;
    const wheelMap: THREE.Object3D[] = [];
    cloned.traverse((child) => {
      if (child.name.toLowerCase().includes("wheel")) {
        wheelMap.push(child);
      }
    });
    return { clonedScene: cloned, wheels: wheelMap };
  }, [scene]);

  useFrame((_, delta) => {
    // Roda berputar di X (rolling forward, bukan gasing)
    wheels.forEach((wheel) => {
      wheel.rotation.x += delta * speed * 3;
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/car.glb");
