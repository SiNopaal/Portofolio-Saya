"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupport } from "@/lib/webgl";

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function StarField({ count = 2200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const rand = seededRandom(12345);
    for (let i = 0; i < count; i++) {
      const r = 8 + rand() * 18;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.012;
    ref.current.rotation.x += delta * 0.004;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a78bfa"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

function Dust({ count = 500 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = seededRandom(67890);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 20;
      arr[i * 3 + 1] = (rand() - 0.5) * 12;
      arr[i * 3 + 2] = (rand() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.15) * 0.4;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fb923c"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.45}
      />
    </Points>
  );
}

export default function BackgroundField() {
  const supported = useWebGLSupport();

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {supported && (
        <Canvas
          camera={{ position: [0, 0, 10], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        >
          <StarField />
          <Dust />
        </Canvas>
      )}
      {/* Glowing blobs */}
      <div className="absolute -left-40 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-700/15 blur-[140px] animate-pulse-glow" />
      <div className="absolute -right-40 top-2/3 h-[450px] w-[450px] rounded-full bg-blue-700/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute left-1/3 -bottom-40 h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
      {/* Light rays */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
    </div>
  );
}
