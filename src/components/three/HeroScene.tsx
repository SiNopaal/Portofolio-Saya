"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox, Cylinder, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupport } from "@/lib/webgl";

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* ---------- Individual assets ---------- */

function ServerRack({ position }: { position: [number, number, number] }) {
  const leds = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        y: -0.75 + i * 0.22,
        color: i % 3 === 0 ? "#fb923c" : i % 3 === 1 ? "#8b5cf6" : "#3b82f6",
        speed: 1 + seededRandom(i * 1337 + 42)() * 3,
      })),
    []
  );
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      if (i === 0) return;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (mat?.emissiveIntensity !== undefined) {
        mat.emissiveIntensity =
          0.8 + Math.sin(t * leds[i - 1].speed * 4 + i) * 0.7;
      }
    });
  });

  return (
    <group position={position} ref={group}>
      <RoundedBox args={[0.9, 2.1, 0.7]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#141416" metalness={0.8} roughness={0.3} />
      </RoundedBox>
      {leds.map((led, i) => (
        <mesh key={i} position={[0.28, led.y, 0.37]}>
          <boxGeometry args={[0.3, 0.04, 0.02]} />
          <meshStandardMaterial
            color={led.color}
            emissive={led.color}
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function DatabaseCylinder({
  position,
  color = "#3b82f6",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group position={position}>
      <Cylinder args={[0.5, 0.5, 0.9, 32]}>
        <meshStandardMaterial
          color="#151517"
          metalness={0.9}
          roughness={0.25}
        />
      </Cylinder>
      {[0.25, 0, -0.25].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.015, 8, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function ApiNode({
  position,
  color = "#8b5cf6",
}: {
  position: [number, number, number];
  color?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.6;
    ref.current.rotation.y = state.clock.elapsedTime * 0.8;
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.35, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.7}
        metalness={0.6}
        roughness={0.2}
        wireframe
      />
    </mesh>
  );
}

function CloudShape({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[
        [0, 0, 0, 0.32],
        [0.3, -0.05, 0, 0.24],
        [-0.3, -0.06, 0, 0.22],
        [0.08, 0.18, 0, 0.2],
      ].map(([x, y, z, r], i) => (
        <Sphere key={i} args={[r, 24, 24]} position={[x, y, z]}>
          <meshStandardMaterial
            color="#1c1c22"
            metalness={0.4}
            roughness={0.5}
            emissive="#3b82f6"
            emissiveIntensity={0.12}
          />
        </Sphere>
      ))}
    </group>
  );
}

function Particles({ count = 350 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = seededRandom(9999);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 14;
      arr[i * 3 + 1] = (rand() - 0.5) * 8;
      arr[i * 3 + 2] = (rand() - 0.5) * 6;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color="#a78bfa"
        size={0.05}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </points>
  );
}

/* Connections between nodes */
function Network() {
  const lines = useMemo(() => {
    const pts: [number, number, number][][] = [
      [[-3.2, 0.4, -1.5], [-1.4, 1.4, -0.5]],
      [[-1.4, 1.4, -0.5], [0.6, 0.2, -1]],
      [[0.6, 0.2, -1], [2.6, 1.2, -1.6]],
      [[2.6, 1.2, -1.6], [3.4, -0.6, -0.8]],
      [[0.6, 0.2, -1], [1.8, -1.6, -0.4]],
      [[-3.2, 0.4, -1.5], [-2.2, -1.5, -0.9]],
    ];
    return pts;
  }, []);

  return (
    <group>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={i % 2 === 0 ? "#8b5cf6" : "#3b82f6"}
          lineWidth={1}
          transparent
          opacity={0.4}
          dashed
          dashScale={8}
        />
      ))}
    </group>
  );
}

function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const { x, y } = state.pointer;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x * 0.18,
      0.05
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -y * 0.12,
      0.05
    );
  });
  return <group ref={group}>{children}</group>;
}

export default function HeroScene() {
  const supported = useWebGLSupport();

  if (!supported) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 55 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={30} color="#8b5cf6" />
      <pointLight position={[-5, -3, 3]} intensity={20} color="#3b82f6" />
      <pointLight position={[0, 4, -4]} intensity={15} color="#fb923c" />

      <ParallaxRig>
        <Network />
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.9}>
          <ServerRack position={[-3.2, 0.4, -1.5]} />
        </Float>
        <Float speed={1.1} rotationIntensity={0.3} floatIntensity={1.1}>
          <ServerRack position={[3.3, -0.3, -2.2]} />
        </Float>
        <Float speed={1.7} rotationIntensity={0.5} floatIntensity={1.2}>
          <DatabaseCylinder position={[2.6, 1.4, -1.6]} />
        </Float>
        <Float speed={1.3} rotationIntensity={0.4} floatIntensity={1}>
          <DatabaseCylinder position={[-2.2, -1.6, -0.9]} color="#fb923c" />
        </Float>
        <Float speed={2} rotationIntensity={0.8} floatIntensity={1.4}>
          <ApiNode position={[-1.4, 1.5, -0.5]} />
        </Float>
        <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.3}>
          <ApiNode position={[0.7, 0.3, -1]} color="#3b82f6" />
        </Float>
        <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1.5}>
          <ApiNode position={[1.9, -1.7, -0.4]} color="#fb923c" />
        </Float>
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.8}>
          <CloudShape position={[3.5, 1.8, -2.5]} />
        </Float>
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={1}>
          <CloudShape position={[-3.8, 2.2, -2.8]} />
        </Float>
        <Particles />
      </ParallaxRig>
    </Canvas>
  );
}
