"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupport } from "@/lib/webgl";

function Orb() {
  const core = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      const mat = core.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.6 + Math.sin(t * 2) * 0.5;
    }
    if (ring1.current) {
      ring1.current.rotation.x = t * 0.5;
      ring1.current.rotation.y = t * 0.3;
    }
    if (ring2.current) {
      ring2.current.rotation.x = -t * 0.4;
      ring2.current.rotation.z = t * 0.5;
    }
    if (glow.current) {
      glow.current.intensity = 18 + Math.sin(t * 2) * 6;
    }
    // react to pointer
    const { x, y } = state.pointer;
    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      x * 0.8,
      0.04
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      y * 0.8,
      0.04
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group>
      <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={core}>
          <icosahedronGeometry args={[1.1, 4]} />
          <meshStandardMaterial
            color="#7c3aed"
            emissive="#8b5cf6"
            emissiveIntensity={1.6}
            metalness={0.3}
            roughness={0.15}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={ring1}>
          <torusGeometry args={[1.8, 0.02, 8, 96]} />
          <meshStandardMaterial
            color="#3b82f6"
            emissive="#3b82f6"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[2.2, 0.015, 8, 96]} />
          <meshStandardMaterial
            color="#fb923c"
            emissive="#fb923c"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      </Float>
      <pointLight ref={glow} position={[0, 0, 2]} intensity={18} color="#8b5cf6" />
    </group>
  );
}

export default function ContactOrbScene({ className }: { className?: string }) {
  const supported = useWebGLSupport();

  if (!supported) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <Orb />
      </Canvas>
    </div>
  );
}
