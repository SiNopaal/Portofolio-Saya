"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { useWebGLSupport } from "@/lib/webgl";

function seededRandom(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/* Docker whale-ish container stack */
function DockerWhale({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <group position={position}>
        {[
          [-0.3, 0.45, 0],
          [0.15, 0.45, 0],
          [-0.08, 0.78, 0],
        ].map(([x, y, z], i) => (
          <RoundedBox key={i} args={[0.4, 0.28, 0.3]} radius={0.03} position={[x, y, z]}>
            <meshStandardMaterial
              color="#0db7ed"
              emissive="#0db7ed"
              emissiveIntensity={0.5}
              metalness={0.4}
              roughness={0.3}
            />
          </RoundedBox>
        ))}
        <RoundedBox args={[1.1, 0.5, 0.55]} radius={0.14} position={[0, 0, 0]}>
          <meshStandardMaterial color="#101418" metalness={0.7} roughness={0.3} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function NestShape({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.4;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.3}>
      <mesh ref={ref} position={position}>
        <torusKnotGeometry args={[0.32, 0.1, 96, 12]} />
        <meshStandardMaterial
          color="#ea2845"
          emissive="#ea2845"
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </Float>
  );
}

function PostgresCylinder({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.1}>
      <group position={position}>
        <mesh>
          <cylinderGeometry args={[0.38, 0.38, 0.75, 24]} />
          <meshStandardMaterial
            color="#336791"
            emissive="#336791"
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        {[0.2, -0.05, -0.3].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.012, 8, 40]} />
            <meshStandardMaterial
              color="#9ecfff"
              emissive="#9ecfff"
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function AwsCloud({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.9}>
      <group position={position}>
        {[
          [0, 0, 0, 0.3],
          [0.28, -0.04, 0, 0.22],
          [-0.28, -0.05, 0, 0.2],
        ].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r, 20, 20]} />
            <meshStandardMaterial
              color="#ff9900"
              emissive="#ff9900"
              emissiveIntensity={0.35}
              metalness={0.4}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function PythonGem({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.7;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#ffd343"
          emissive="#ffd343"
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.2}
          flatShading
        />
      </mesh>
    </Float>
  );
}

function AiBrain({ position }: { position: [number, number, number] }) {
  const nodes = useMemo(() => {
    const rand = seededRandom(7777);
    return Array.from({ length: 14 }, () => ({
      pos: [
        (rand() - 0.5) * 0.9,
        (rand() - 0.5) * 0.9,
        (rand() - 0.5) * 0.9,
      ] as [number, number, number],
    }));
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current)
      group.current.rotation.y = state.clock.elapsedTime * 0.5;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <group position={position} ref={group}>
        {nodes.map((n, i) => (
          <mesh key={i} position={n.pos}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color="#a78bfa"
              emissive="#a78bfa"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.55, 24, 24]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            transparent
            opacity={0.18}
            wireframe
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function AboutAssetsScene({
  className,
}: {
  className?: string;
}) {
  const supported = useWebGLSupport();

  if (!supported) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 50 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[4, 4, 4]} intensity={22} color="#8b5cf6" />
        <pointLight position={[-4, -3, 3]} intensity={14} color="#fb923c" />
        <DockerWhale position={[-1.9, 1.2, 0]} />
        <NestShape position={[1.9, 1.3, -0.5]} />
        <PostgresCylinder position={[-2.1, -1.1, -0.4]} />
        <AwsCloud position={[2, -1.2, 0]} />
        <PythonGem position={[0, 1.9, -0.8]} />
        <AiBrain position={[0.1, -0.2, 0.4]} />
      </Canvas>
    </div>
  );
}
