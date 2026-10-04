"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { techStack, categories } from "@/lib/data";
import { useWebGLSupport } from "@/lib/webgl";

function TechSphere({
  position,
  name,
  color,
  onHover,
  hovered,
}: {
  position: [number, number, number];
  name: string;
  color: string;
  onHover: (name: string | null) => void;
  hovered: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const target = useRef(1);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    target.current = hovered ? 1.6 : 1;
    const s = THREE.MathUtils.damp(mesh.current.scale.x, target.current, 8, delta);
    mesh.current.scale.setScalar(s);
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.damp(
      mat.emissiveIntensity,
      hovered ? 2.4 : 0.6,
      8,
      delta
    );
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh
        ref={mesh}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(name);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.5}
          roughness={0.25}
          toneMapped={false}
        />
        {hovered && (
          <Html center distanceFactor={8} className="pointer-events-none">
            <div className="glass whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-xl">
              {name}
            </div>
          </Html>
        )}
      </mesh>
    </Float>
  );
}

function SphereCloud({ category }: { category: string }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const items = useMemo(() => {
    const list =
      category === "All"
        ? techStack
        : techStack.filter((t) => t.category === category);
    return list.map((t, i) => {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - (2 * (i + 0.5)) / list.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 3.4;
      return {
        ...t,
        position: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi) * 0.7,
          r * Math.sin(phi) * Math.sin(theta),
        ] as [number, number, number],
      };
    });
  }, [category]);

  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.y += state.pointer.x * 0.002;
  });

  return (
    <group ref={group}>
      {items.map((t) => (
        <TechSphere
          key={t.name}
          position={t.position}
          name={t.name}
          color={t.color}
          onHover={setHovered}
          hovered={hovered === t.name}
        />
      ))}
      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}

export default function TechSphereScene({
  category,
  className,
}: {
  category: string;
  className?: string;
}) {
  const supported = useWebGLSupport();

  if (!supported) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[6, 6, 6]} intensity={25} color="#8b5cf6" />
        <pointLight position={[-6, -4, 4]} intensity={15} color="#3b82f6" />
        <SphereCloud category={category} />
      </Canvas>
    </div>
  );
}

export { categories };
