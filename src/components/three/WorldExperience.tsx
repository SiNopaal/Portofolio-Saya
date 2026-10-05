"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
  Sparkles,
  Flame,
  Rocket,
  Send,
  MessageSquare,
  User,
  Check,
  X,
} from "lucide-react";
import { useMultiplayer, PlayerData, HitSpark, PALETTES } from "@/lib/multiplayer";
import { CyberTeleportStation } from "./ArenaZones";


/* ============================================================
   WEBGL DETECTION
============================================================ */
function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

/* ============================================================
   WORLD DATA & ZONES
============================================================ */
export type LandmarkData = {
  id: string;
  label: string;
  index: string;
  title: string;
  description: string;
  href: string;
  position: [number, number, number];
  color: string;
  accent: string;
};

const landmarks: LandmarkData[] = [
  {
    id: "work",
    label: "PROJECTS",
    index: "01",
    title: "Featured Works",
    description: "Commercial Laundry Suite, Patukrejomulyo E-Gov, and AI Bot Labs.",
    href: "#work",
    position: [-8.5, 0, 8.5],
    color: "#38bdf8",
    accent: "border-sky-500/40 bg-sky-600/10 text-sky-300",
  },
  {
    id: "terminal",
    label: "BOT TERMINAL",
    index: "02",
    title: "Autonomous Console",
    description: "Interactive Python & Node.js AI worker execution terminal.",
    href: "#terminal",
    position: [0, 0, 11.5],
    color: "#10b981",
    accent: "border-emerald-500/40 bg-emerald-600/10 text-emerald-300",
  },
  {
    id: "about",
    label: "ABOUT",
    index: "03",
    title: "About Naufal",
    description: "S1 RPL Telkom Purwokerto & Frontend / UI-UX Architecture.",
    href: "#about",
    position: [8.5, 0, 8.5],
    color: "#ec4899",
    accent: "border-pink-500/40 bg-pink-600/10 text-pink-300",
  },
  {
    id: "stack",
    label: "STACK",
    index: "04",
    title: "Tech Arsenal",
    description: "Next.js, React, TypeScript, Figma, Python Bot Scripting, & LLMs.",
    href: "#stack",
    position: [-8.5, 0, -8.5],
    color: "#a855f7",
    accent: "border-purple-500/40 bg-purple-600/10 text-purple-300",
  },
  {
    id: "contact",
    label: "CONTACT",
    index: "05",
    title: "Get in Touch",
    description: "WhatsApp, Email, LinkedIn, GitHub, & verified CV.",
    href: "#contact",
    position: [8.5, 0, -8.5],
    color: "#f59e0b",
    accent: "border-amber-500/40 bg-amber-600/10 text-amber-300",
  },
];

const JUMP_PADS: { id: string; x: number; z: number; color: string }[] = [];

const ELEVATED_PLATFORMS: {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  border: string;
}[] = [
  // Platform Dek Teleport Station di Lokasi Bekas Tower (z: -14.5)
  { x: 0.0, z: -14.5, w: 8.0, d: 5.5, h: 0.6, color: "#0e1526", border: "#38bdf8" },
];

const ARENA_BOUND = 36.0;
const AVATAR_R = 0.55;

interface SolidObstacle {
  x: number;
  z: number;
  r?: number; // Cylinder radius
  w?: number; // Box width along X
  d?: number; // Box depth along Z
  minY?: number;
  maxY?: number;
}

const SOLID_OBSTACLES: SolidObstacle[] = [
  // 1. Sci-Fi Monolith Pillars (Projects, Terminal, About, Stack, Contact)
  { x: -8.5, z: 8.5, r: 0.7, minY: 0.0, maxY: 5 },
  { x: 0.0, z: 11.5, r: 0.7, minY: 0.0, maxY: 5 },
  { x: 8.5, z: 8.5, r: 0.7, minY: 0.0, maxY: 5 },
  { x: -8.5, z: -8.5, r: 0.7, minY: 0.0, maxY: 5 },
  { x: 8.5, z: -8.5, r: 0.7, minY: 0.0, maxY: 5 },

  // 2. Teleport Station Stargate di Lokasi Bekas Tower (z: -14.5)
  // Stargate Side Support Struts
  { x: -1.7, z: -14.5, r: 0.35, minY: 0.5, maxY: 4.5 },
  { x: 1.7, z: -14.5, r: 0.35, minY: 0.5, maxY: 4.5 },
  // Power Reactor Generator
  { x: 2.35, z: -14.4, r: 0.65, minY: 0.5, maxY: 3.5 },
  // Teleport Destination Kiosk
  { x: -2.4, z: -12.55, r: 0.85, minY: 0.5, maxY: 3.5 },
];

/* ============================================================
   CANVAS TEXTURE HELPERS (crisp text, no font download)
============================================================ */
const textureCache = new Map<string, THREE.CanvasTexture>();

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function getLabelTexture(lm: LandmarkData): THREE.CanvasTexture {
  const key = `monolith-${lm.id}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const W = 768;
  const H = 384;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, W, H);

  // Card background
  roundedRect(ctx, 14, 14, W - 28, H - 28, 36);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "rgba(12,16,28,0.96)");
  bg.addColorStop(1, "rgba(6,9,18,0.96)");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = lm.color;
  ctx.stroke();

  // Accent side bar
  roundedRect(ctx, 14, 14, 24, H - 28, 12);
  ctx.fillStyle = lm.color;
  ctx.fill();

  // Index number top-right
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "700 44px system-ui, 'Segoe UI', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(lm.index, W - 52, 84);

  // Big label
  ctx.textAlign = "left";
  ctx.fillStyle = lm.color;
  ctx.font = "900 88px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText(lm.label, 68, 182);

  // Title
  ctx.fillStyle = "#f8fafc";
  ctx.font = "600 40px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText(lm.title, 70, 252);

  // Divider
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(70, 280, W - 150, 2);

  // Call to action
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 28px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText("APPROACH ZONE TO EXPLORE  →", 70, 334);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  textureCache.set(key, tex);
  return tex;
}

function getCentralNexusTexture(): THREE.CanvasTexture {
  const key = "nexus-floor-welcome-v2";
  const cached = textureCache.get(key);
  if (cached) return cached;

  const S = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);

  // Outer glowing ring
  ctx.save();
  ctx.translate(S / 2, S / 2);

  const grad = ctx.createRadialGradient(0, 0, 50, 0, 0, S / 2);
  grad.addColorStop(0, "rgba(56, 189, 248, 0.25)");
  grad.addColorStop(0.65, "rgba(168, 85, 247, 0.15)");
  grad.addColorStop(1, "rgba(10, 15, 28, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, S / 2, 0, Math.PI * 2);
  ctx.fill();

  // Concentric neon rings
  for (let r = 120; r <= 460; r += 85) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = r % 170 === 0 ? "rgba(56,189,248,0.7)" : "rgba(168,85,247,0.5)";
    ctx.stroke();
  }

  // Cross hair energy axes
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
  ctx.beginPath();
  ctx.moveTo(-480, 0);
  ctx.lineTo(480, 0);
  ctx.moveTo(0, -480);
  ctx.lineTo(0, 480);
  ctx.stroke();

  // Welcome banner in center circle
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#38bdf8";
  ctx.font = "900 80px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText("WELCOME", 0, -42);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 32px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText("TO NAUFAL'S PORTFOLIO", 0, 24);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "600 22px system-ui, 'Segoe UI', sans-serif";
  ctx.fillText("CYBER METAVERSE ARENA", 0, 72);

  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

function getCyberFloorTexture(): THREE.CanvasTexture {
  const key = "cyber-grid-floor";
  const cached = textureCache.get(key);
  if (cached) return cached;

  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, S, S);

  // High-tech cyber grid lines
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(30, 41, 59, 0.7)";
  const step = 64;
  for (let x = 0; x <= S; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, S);
    ctx.stroke();
  }
  for (let y = 0; y <= S; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(S, y);
    ctx.stroke();
  }

  // Neon node cross dots
  ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
  for (let x = 0; x <= S; x += step) {
    for (let y = 0; y <= S; y += step) {
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  textureCache.set(key, tex);
  return tex;
}

function getBlobTexture(): THREE.CanvasTexture {
  const key = "avatar-shadow";
  const cached = textureCache.get(key);
  if (cached) return cached;

  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(S / 2, S / 2, 6, S / 2, S / 2, S / 2);
  grad.addColorStop(0, "rgba(0,0,0,0.68)");
  grad.addColorStop(0.65, "rgba(0,0,0,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  const tex = new THREE.CanvasTexture(canvas);
  textureCache.set(key, tex);
  return tex;
}

/* ============================================================
   CYBER METAVERSE ARENA (Ground, Nexus, Platforms, Jump Pads)
============================================================ */
function CyberMetaverseArena() {
  const floorTex = useMemo(() => getCyberFloorTexture(), []);
  const nexusTex = useMemo(() => getCentralNexusTexture(), []);
  const haloRingsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (haloRingsRef.current) {
      haloRingsRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Endless Cyber Base Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial map={floorTex} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Central Nexus Teleport Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]} receiveShadow>
        <circleGeometry args={[4.2, 48]} />
        <meshStandardMaterial color="#0c1122" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[8.4, 8.4]} />
        <meshBasicMaterial map={nexusTex} transparent depthWrite={false} />
      </mesh>

      {/* Rotating Cyber Runes around Nexus */}
      <group ref={haloRingsRef} position={[0, 0.03, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.25, 4.38, 48]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[4.6, 4.68, 48]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Super Jump Launch Pads (Trampolin) */}
      {JUMP_PADS.map((pad) => (
        <group key={pad.id} position={[pad.x, 0.02, pad.z]}>
          {/* Pad Base */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[1.35, 32]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Outer Glowing Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[1.15, 1.35, 32]} />
            <meshBasicMaterial color={pad.color} />
          </mesh>
          {/* Inner Concentric Energy Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
            <ringGeometry args={[0.5, 0.85, 24]} />
            <meshBasicMaterial color={pad.color} transparent opacity={0.65} />
          </mesh>
          {/* Upward Chevron Arrows */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <coneGeometry args={[0.42, 0.75, 3]} />
            <meshBasicMaterial color={pad.color} />
          </mesh>
          {/* Translucent Vertical Energy Launch Tube */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.95, 1.15, 1.4, 16, 1, true]} />
            <meshBasicMaterial color={pad.color} transparent opacity={0.2} side={THREE.DoubleSide} />
          </mesh>
          {/* Pad Point Light */}
          <pointLight color={pad.color} intensity={3.5} distance={5.5} position={[0, 0.6, 0]} />
        </group>
      ))}

      {/* Elevated Stepping Terraces / Walkways */}
      {ELEVATED_PLATFORMS.map((plat, idx) => (
        <group key={`plat-${idx}`} position={[plat.x, plat.h / 2, plat.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[plat.w, plat.h, plat.d]} />
            <meshStandardMaterial color={plat.color} roughness={0.35} metalness={0.7} />
          </mesh>
          {/* Neon Border Trim on Top Face */}
          <mesh position={[0, plat.h / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[plat.w - 0.2, plat.d - 0.2]} />
            <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, plat.h / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[plat.w, plat.d]} />
            <meshBasicMaterial color={plat.border} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* --- 1. PROJECTS: Holo-Globe & Orbiting Satellites --- */
function ProjectsCrown({ color, isNearby }: { color: string; isNearby: boolean }) {
  const globeRef = useRef<THREE.Group>(null);
  const sat1Ref = useRef<THREE.Group>(null);
  const sat2Ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (globeRef.current) {
      globeRef.current.position.y = 4.1 + Math.sin(t * 2) * 0.08;
      globeRef.current.rotation.y += delta * 0.8;
      globeRef.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    }
    if (sat1Ref.current) sat1Ref.current.rotation.y += delta * 1.8;
    if (sat2Ref.current) sat2Ref.current.rotation.y -= delta * 1.4;
  });

  return (
    <group ref={globeRef} position={[0, 4.1, 0]}>
      {/* Outer Geodesic Sphere Wireframe */}
      <mesh>
        <sphereGeometry args={[0.42, 16, 12]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Inner Glowing Core */}
      <mesh>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNearby ? 2.5 : 1.2}
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Equatorial Coordinate Ring */}
      <mesh rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[0.54, 0.015, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Orbiting Satellite 1 */}
      <group ref={sat1Ref}>
        <mesh position={[0.7, 0.1, 0]}>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} />
        </mesh>
      </group>
      {/* Orbiting Satellite 2 (Tilted Orbit) */}
      <group ref={sat2Ref} rotation={[0.4, 0, 0.4]}>
        <mesh position={[-0.75, -0.05, 0]}>
          <octahedronGeometry args={[0.06, 0]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={3} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 2. BOT TERMINAL: Quantum Tesseract / AI Core --- */
function TerminalCrown({ color, isNearby }: { color: string; isNearby: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const outerBoxRef = useRef<THREE.Mesh>(null);
  const innerBoxRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current) {
      rootRef.current.position.y = 4.1 + Math.sin(t * 2.2) * 0.08;
    }
    if (outerBoxRef.current) {
      outerBoxRef.current.rotation.x += delta * 0.7;
      outerBoxRef.current.rotation.y += delta * 0.9;
    }
    if (innerBoxRef.current) {
      innerBoxRef.current.rotation.y -= delta * 1.3;
      innerBoxRef.current.rotation.z += delta * 0.8;
    }
    if (coreRef.current) {
      const s = 1 + Math.sin(t * 6) * 0.18;
      coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={rootRef} position={[0, 4.1, 0]}>
      {/* Outer Rotating Wireframe Cube */}
      <mesh ref={outerBoxRef}>
        <boxGeometry args={[0.62, 0.62, 0.62]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
      {/* Inner Inverted Wireframe Cube */}
      <mesh ref={innerBoxRef}>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshBasicMaterial color="#ffffff" wireframe />
      </mesh>
      {/* Pulsing Quantum Energy Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNearby ? 4.0 : 2.0}
        />
      </mesh>
      {/* Corner Nano Flakes */}
      {[-0.42, 0.42].map((x, i) =>
        [-0.42, 0.42].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0, z]}>
            <boxGeometry args={[0.03, 0.14, 0.03]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* --- 3. ABOUT: Gyro-Helix & Diamond Prism --- */
function AboutCrown({ color, isNearby }: { color: string; isNearby: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const prismRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current) {
      rootRef.current.position.y = 4.1 + Math.sin(t * 1.8) * 0.08;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 1.2;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 1.0;
    if (prismRef.current) {
      prismRef.current.rotation.y -= delta * 1.5;
      const s = 1 + Math.sin(t * 3) * 0.1;
      prismRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group ref={rootRef} position={[0, 4.1, 0]}>
      {/* Central Faceted Icosahedron Diamond */}
      <mesh ref={prismRef}>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isNearby ? 3.5 : 1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      {/* Gyro Ring 1 (Vertical Tilted) */}
      <group ref={ring1Ref} rotation={[0.4, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.55, 0.02, 8, 36]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.55, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={2} />
        </mesh>
      </group>
      {/* Gyro Ring 2 (Opposite Tilted) */}
      <group ref={ring2Ref} rotation={[-0.4, 0, 0.6]}>
        <mesh>
          <torusGeometry args={[0.65, 0.018, 8, 36]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/* --- 4. TECH STACK: Layered Floating Hex-Discs --- */
function StackCrown({ color, isNearby }: { color: string; isNearby: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const layer1Ref = useRef<THREE.Group>(null);
  const layer2Ref = useRef<THREE.Group>(null);
  const layer3Ref = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current) {
      rootRef.current.position.y = 3.85;
    }
    if (layer1Ref.current) {
      layer1Ref.current.position.y = 0.0 + Math.sin(t * 2.0) * 0.04;
      layer1Ref.current.rotation.y += delta * 0.5;
    }
    if (layer2Ref.current) {
      layer2Ref.current.position.y = 0.28 + Math.sin(t * 2.0 + 1.2) * 0.04;
      layer2Ref.current.rotation.y -= delta * 0.7;
    }
    if (layer3Ref.current) {
      layer3Ref.current.position.y = 0.56 + Math.sin(t * 2.0 + 2.4) * 0.04;
      layer3Ref.current.rotation.y += delta * 0.9;
    }
  });

  return (
    <group ref={rootRef} position={[0, 3.85, 0]}>
      {/* Vertical Core Energy Conduit Line */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.75, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Layer 1 (Bottom - Cloud/DB) */}
      <group ref={layer1Ref} position={[0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.48, 0.48, 0.05, 6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.49, 0.49, 0.052, 6]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </group>

      {/* Layer 2 (Middle - Logic/Backend) */}
      <group ref={layer2Ref} position={[0, 0.28, 0]}>
        <mesh>
          <cylinderGeometry args={[0.38, 0.38, 0.05, 6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.39, 0.39, 0.052, 6]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </group>

      {/* Layer 3 (Top - Frontend) */}
      <group ref={layer3Ref} position={[0, 0.56, 0]}>
        <mesh>
          <cylinderGeometry args={[0.28, 0.28, 0.05, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isNearby ? 2.5 : 1.2}
          />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.29, 0.29, 0.052, 6]} />
          <meshBasicMaterial color="#ffffff" wireframe />
        </mesh>
      </group>
    </group>
  );
}

/* --- 5. CONTACT: Quantum Radar & Signal Beacon --- */
function ContactCrown({ color, isNearby }: { color: string; isNearby: boolean }) {
  const rootRef = useRef<THREE.Group>(null);
  const dishRef = useRef<THREE.Group>(null);
  const pulseRing1Ref = useRef<THREE.Mesh>(null);
  const pulseRing2Ref = useRef<THREE.Mesh>(null);
  const apexRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (rootRef.current) {
      rootRef.current.position.y = 3.9 + Math.sin(t * 2) * 0.05;
    }
    if (dishRef.current) {
      dishRef.current.rotation.y += delta * 1.5;
    }
    if (apexRef.current) {
      apexRef.current.rotation.y -= delta * 2.0;
    }
    // Expanding radar waves
    if (pulseRing1Ref.current) {
      const p1 = (t * 1.2) % 1.5;
      pulseRing1Ref.current.position.y = 0.2 + p1 * 0.45;
      const s1 = 0.3 + p1 * 0.5;
      pulseRing1Ref.current.scale.set(s1, s1, s1);
      (pulseRing1Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p1 / 1.5);
    }
    if (pulseRing2Ref.current) {
      const p2 = (t * 1.2 + 0.75) % 1.5;
      pulseRing2Ref.current.position.y = 0.2 + p2 * 0.45;
      const s2 = 0.3 + p2 * 0.5;
      pulseRing2Ref.current.scale.set(s2, s2, s2);
      (pulseRing2Ref.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - p2 / 1.5);
    }
  });

  return (
    <group ref={rootRef} position={[0, 3.9, 0]}>
      {/* Base Inverted Antenna Cone */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 0.35, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Radar Dish & Emitter */}
      <group ref={dishRef} position={[0, 0.24, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.12, 0.06, 16]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>
      </group>

      {/* Dynamic Expanding Radar Wave Rings */}
      <mesh ref={pulseRing1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[0.35, 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      <mesh ref={pulseRing2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[0.35, 0.42, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>

      {/* Apex Beacon Emitter Crystal */}
      <mesh ref={apexRef} position={[0, 0.65, 0]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={color}
          emissiveIntensity={isNearby ? 4.5 : 2.5}
        />
      </mesh>
    </group>
  );
}

/* ============================================================
   3D SCI-FI MONOLITH (Interactive Zone Landmark)
============================================================ */
function SciFiMonolith({
  landmark,
  isNearby,
}: {
  landmark: LandmarkData;
  isNearby: boolean;
}) {
  const labelTex = useMemo(() => getLabelTexture(landmark), [landmark]);

  const faceRotation = useMemo(() => {
    const [x, , z] = landmark.position;
    return Math.atan2(-x, -z);
  }, [landmark]);

  return (
    <group position={landmark.position} rotation-y={faceRotation}>
      {/* Ground Pedestal Glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.8, 2.05, 36]} />
        <meshBasicMaterial
          color={landmark.color}
          transparent
          opacity={isNearby ? 0.95 : 0.45}
        />
      </mesh>

      {/* Octagonal Cyber Monolith Crystal Pillar */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 3.6, 8]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
      {/* Crystal Neon Inlay Lines */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.36, 0.51, 3.62, 8]} />
        <meshBasicMaterial color={landmark.color} wireframe />
      </mesh>

      {/* Monolith Pillar Top Collar */}
      <mesh position={[0, 3.6, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 0.08, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Thematic Holographic Crown (Unique per Landmark) */}
      {landmark.id === "work" && <ProjectsCrown color={landmark.color} isNearby={isNearby} />}
      {landmark.id === "terminal" && <TerminalCrown color={landmark.color} isNearby={isNearby} />}
      {landmark.id === "about" && <AboutCrown color={landmark.color} isNearby={isNearby} />}
      {landmark.id === "stack" && <StackCrown color={landmark.color} isNearby={isNearby} />}
      {landmark.id === "contact" && <ContactCrown color={landmark.color} isNearby={isNearby} />}

      {/* Holographic Interactive HUD Display Board (PATEN - Braced to pillar) */}
      <group position={[0, 2.0, 0.6]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 1.6, 0.08]} />
          <meshStandardMaterial color="#090d16" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[3.08, 1.48]} />
          <meshBasicMaterial map={labelTex} transparent toneMapped={false} />
        </mesh>
        {/* Dual Industrial Steel Brackets connecting back to pillar */}
        <mesh position={[-0.8, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0.8, 0, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>
      </group>

      {/* Proximity Beacon Point Light */}
      <pointLight
        color={landmark.color}
        intensity={isNearby ? 4.5 : 1.5}
        distance={6}
        position={[0, 2.5, 0.8]}
      />
    </group>
  );
}

/* ============================================================
   3D CYBER CHARACTER / AVATAR (Procedural Rig with Walk Cycle)
============================================================ */
function CyberCharacter({
  carRef,
  steerRef,
  tiltRef,
  isDriftingRef,
  color = "#0284c7",
  accentColor = "#38bdf8",
  name,
  emote,
  isRemote = false,
  isPunching = false,
  isHit = false,
}: {
  carRef: React.MutableRefObject<{
    pos: THREE.Vector3;
    rot: number;
    speed: number;
  }>;
  steerRef: React.MutableRefObject<number>;
  tiltRef: React.MutableRefObject<{ roll: number; pitch: number }>;
  isDriftingRef: React.MutableRefObject<boolean>;
  color?: string;
  accentColor?: string;
  name?: string;
  emote?: string;
  isRemote?: boolean;
  isPunching?: boolean;
  isHit?: boolean;
}) {
  const blobTex = useMemo(() => getBlobTexture(), []);

  const rootGroup = useRef<THREE.Group>(null);
  const bodyGroup = useRef<THREE.Group>(null);
  const headGroup = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftShinRef = useRef<THREE.Group>(null);
  const rightShinRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Group>(null);
  const rightForearmRef = useRef<THREE.Group>(null);
  const droneRef = useRef<THREE.Group>(null);
  const jetFlameLRef = useRef<THREE.Mesh>(null);
  const jetFlameRRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const flipPivotRef = useRef<THREE.Group>(null);
  const flipProgressRef = useRef<number>(0);
  const wasAirborneRef = useRef<boolean>(false);
  const somersaultRingRef = useRef<THREE.Mesh>(null);

  const walkPhaseRef = useRef<number>(0);
  const walkWeightRef = useRef<number>(0);

  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.4, 12);
    return o;
  }, []);

  useEffect(() => {
    if (spotRef.current) spotRef.current.target = spotTarget;
  }, [spotTarget]);

  useFrame((state, delta) => {
    const player = carRef.current;
    if (rootGroup.current) {
      // Sub-frame smooth position damping
      rootGroup.current.position.x = THREE.MathUtils.damp(rootGroup.current.position.x, player.pos.x, 26, delta);
      rootGroup.current.position.y = THREE.MathUtils.damp(rootGroup.current.position.y, player.pos.y || 0, 26, delta);
      rootGroup.current.position.z = THREE.MathUtils.damp(rootGroup.current.position.z, player.pos.z, 26, delta);

      // Shortest-arc smooth rotation
      let rDiff = player.rot - rootGroup.current.rotation.y;
      while (rDiff < -Math.PI) rDiff += Math.PI * 2;
      while (rDiff > Math.PI) rDiff -= Math.PI * 2;
      rootGroup.current.rotation.y += rDiff * Math.min(1, delta * 18.0);
    }

    const speed = player.speed;
    const absSpeed = Math.abs(speed);
    const isMoving = absSpeed > 0.08;
    const isSprinting = isDriftingRef.current;
    const isAirborne = (player as unknown as { onGround?: boolean }).onGround !== undefined
      ? !(player as unknown as { onGround?: boolean }).onGround
      : (player.pos.y || 0) > 0.35;

    // Salto Depan (Front Somersault / Acrobatic Front Flip)
    if (isAirborne && !wasAirborneRef.current) {
      flipProgressRef.current = 0;
    }
    wasAirborneRef.current = isAirborne;

    if (isAirborne) {
      if (flipProgressRef.current < 1.0) {
        flipProgressRef.current = Math.min(1.0, flipProgressRef.current + delta * 1.55);
        if (flipPivotRef.current) {
          if (flipProgressRef.current >= 1.0) {
            flipPivotRef.current.rotation.x = 0;
          } else {
            flipPivotRef.current.rotation.x = flipProgressRef.current * Math.PI * 2;
          }
        }
      } else {
        if (flipPivotRef.current) flipPivotRef.current.rotation.x = 0;
      }
    } else {
      flipProgressRef.current = 0;
      if (flipPivotRef.current) {
        if (Math.abs(flipPivotRef.current.rotation.x) > 0.01) {
          let r = flipPivotRef.current.rotation.x % (Math.PI * 2);
          if (r < 0) r += Math.PI * 2;
          if (r > Math.PI) {
            flipPivotRef.current.rotation.x = THREE.MathUtils.damp(flipPivotRef.current.rotation.x, Math.PI * 2, 24, delta);
            if (Math.abs(flipPivotRef.current.rotation.x - Math.PI * 2) < 0.05) {
              flipPivotRef.current.rotation.x = 0;
            }
          } else {
            flipPivotRef.current.rotation.x = THREE.MathUtils.damp(flipPivotRef.current.rotation.x, 0, 24, delta);
          }
        } else {
          flipPivotRef.current.rotation.x = 0;
        }
      }
    }

    const tuck = isAirborne && flipProgressRef.current < 1.0
      ? Math.sin(flipProgressRef.current * Math.PI)
      : 0;

    if (somersaultRingRef.current) {
      somersaultRingRef.current.visible = tuck > 0.15;
      if (tuck > 0.15) {
        (somersaultRingRef.current.material as THREE.MeshBasicMaterial).opacity = tuck * 0.75;
        somersaultRingRef.current.rotation.x += delta * 12.0;
      }
    }

    // Smoothly blend walking animation in & out
    const targetWalkWeight = isMoving && !isAirborne ? 1.0 : 0.0;
    walkWeightRef.current = THREE.MathUtils.damp(walkWeightRef.current, targetWalkWeight, 12, delta);
    const walkWeight = walkWeightRef.current;

    // Advance walk cycle only when moving
    const cycleFreq = isSprinting ? 12 : 8.5;
    if (walkWeight > 0.01) {
      walkPhaseRef.current += delta * cycleFreq;
    }
    const phase = walkPhaseRef.current;
    const stride = Math.min(1.0, absSpeed / 2.6) * walkWeight;

    // Arm swing & punch kinematics with elbow flexion
    if (leftArmRef.current && rightArmRef.current && leftForearmRef.current && rightForearmRef.current) {
      if (isPunching) {
        // Powerful cyber punch jab forward with right fist
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -Math.PI / 1.75, 26, delta);
        rightArmRef.current.position.z = THREE.MathUtils.damp(rightArmRef.current.position.z, 0.35, 26, delta);
        rightForearmRef.current.rotation.x = THREE.MathUtils.damp(rightForearmRef.current.rotation.x, -0.15, 26, delta);

        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, 0.3, 20, delta);
        leftForearmRef.current.rotation.x = THREE.MathUtils.damp(leftForearmRef.current.rotation.x, -0.7, 20, delta);
      } else if (isHit) {
        rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -0.75, 18, delta);
        leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -0.75, 18, delta);
        rightForearmRef.current.rotation.x = -0.4;
        leftForearmRef.current.rotation.x = -0.4;
      } else if (isAirborne) {
        if (tuck > 0.05) {
          // Acrobatic front flip / salto depan arm tuck
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(-0.45, -1.35, tuck);
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(-0.45, -1.35, tuck);
          leftForearmRef.current.rotation.x = THREE.MathUtils.lerp(-0.2, -1.15, tuck);
          rightForearmRef.current.rotation.x = THREE.MathUtils.lerp(-0.2, -1.15, tuck);
          leftArmRef.current.rotation.z = THREE.MathUtils.lerp(0.1, 0.28, tuck);
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(-0.1, -0.28, tuck);
        } else {
          // Airborne jetpack flying arms
          leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, -0.45, 10, delta);
          rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, -0.45, 10, delta);
          leftForearmRef.current.rotation.x = -0.2;
          rightForearmRef.current.rotation.x = -0.2;
        }
      } else {
        // Natural opposite arm swing
        const armCycle = Math.sin(phase) * (isSprinting ? 0.8 : 0.5) * stride;
        leftArmRef.current.rotation.x = armCycle;
        rightArmRef.current.rotation.x = -armCycle;
        rightArmRef.current.position.z = 0;

        // Natural elbow flexion (elbows slightly bent, bending further on up-swing)
        const leftElbow = -0.32 - (isSprinting ? 0.35 : 0.18) * Math.max(0, Math.sin(phase)) * stride;
        const rightElbow = -0.32 - (isSprinting ? 0.35 : 0.18) * Math.max(0, -Math.sin(phase)) * stride;
        leftForearmRef.current.rotation.x = leftElbow;
        rightForearmRef.current.rotation.x = rightElbow;

        leftArmRef.current.rotation.z = isSprinting ? 0.22 : 0.1;
        rightArmRef.current.rotation.z = isSprinting ? -0.22 : -0.1;
      }
    }

    // Leg stride kinematics with knee flexion
    if (leftLegRef.current && rightLegRef.current && leftShinRef.current && rightShinRef.current) {
      if (isAirborne) {
        if (tuck > 0.05) {
          // Front flip knee & shin tuck
          leftLegRef.current.rotation.x = THREE.MathUtils.lerp(0.3, -1.15, tuck);
          rightLegRef.current.rotation.x = THREE.MathUtils.lerp(-0.2, -1.15, tuck);
          leftShinRef.current.rotation.x = THREE.MathUtils.lerp(0.45, 1.6, tuck);
          rightShinRef.current.rotation.x = THREE.MathUtils.lerp(0.65, 1.6, tuck);
        } else {
          leftLegRef.current.rotation.x = THREE.MathUtils.damp(leftLegRef.current.rotation.x, 0.3, 10, delta);
          rightLegRef.current.rotation.x = THREE.MathUtils.damp(rightLegRef.current.rotation.x, -0.2, 10, delta);
          leftShinRef.current.rotation.x = THREE.MathUtils.damp(leftShinRef.current.rotation.x, 0.45, 10, delta);
          rightShinRef.current.rotation.x = THREE.MathUtils.damp(rightShinRef.current.rotation.x, 0.65, 10, delta);
        }
      } else {
        // Thigh swing
        const legCycle = Math.sin(phase) * (isSprinting ? 0.9 : 0.62) * stride;
        leftLegRef.current.rotation.x = -legCycle;
        rightLegRef.current.rotation.x = legCycle;

        // Knee bends backward only when foot swings back / lifts off
        const leftKneeBend = Math.max(0, -Math.sin(phase)) * (isSprinting ? 1.15 : 0.78) * stride;
        const rightKneeBend = Math.max(0, Math.sin(phase)) * (isSprinting ? 1.15 : 0.78) * stride;
        leftShinRef.current.rotation.x = leftKneeBend;
        rightShinRef.current.rotation.x = rightKneeBend;
      }
    }

    // Torso counter-rotation, lateral hip sway & bounce
    if (bodyGroup.current) {
      if (isHit) {
        bodyGroup.current.rotation.x = -0.42;
        bodyGroup.current.position.z = -0.15;
      } else if (isPunching) {
        bodyGroup.current.rotation.y = -0.36;
        bodyGroup.current.rotation.x = 0.15;
        bodyGroup.current.position.z = 0.08;
      } else {
        // Rhythmic vertical step bounce (2 bounces per cycle)
        const bounce = isAirborne ? 0 : Math.abs(Math.sin(phase)) * (isSprinting ? 0.055 : 0.028) * stride;
        bodyGroup.current.position.y = bounce;
        bodyGroup.current.position.z = 0;

        // Spine counter-rotation (cross-body torsion)
        const spineTwist = Math.sin(phase) * 0.075 * stride;
        bodyGroup.current.rotation.y = THREE.MathUtils.damp(bodyGroup.current.rotation.y, spineTwist, 12, delta);

        // Lateral hip sway (Z roll)
        const hipSway = Math.sin(phase) * 0.035 * stride;
        bodyGroup.current.rotation.z = THREE.MathUtils.damp(bodyGroup.current.rotation.z, hipSway + tiltRef.current.roll * 0.5, 10, delta);

        // Dynamic forward lean
        const forwardLean = THREE.MathUtils.clamp(speed * 0.024, -0.1, isSprinting ? 0.32 : 0.18);
        bodyGroup.current.rotation.x = THREE.MathUtils.damp(bodyGroup.current.rotation.x, forwardLean, 10, delta);
      }
    }

    // Head looks in steer direction
    if (headGroup.current) {
      headGroup.current.rotation.y = THREE.MathUtils.damp(
        headGroup.current.rotation.y,
        steerRef.current * 0.45,
        10,
        delta
      );
      if (tuck > 0.05) {
        headGroup.current.rotation.x = THREE.MathUtils.lerp(0, 0.35, tuck);
      } else {
        headGroup.current.rotation.x = 0;
      }
    }

    // Jetpack thrusters
    const thrusterActive = isSprinting || isAirborne || absSpeed > 1.2;
    if (jetFlameLRef.current && jetFlameRRef.current) {
      jetFlameLRef.current.visible = thrusterActive || absSpeed > 0.2;
      jetFlameRRef.current.visible = thrusterActive || absSpeed > 0.2;
      if (thrusterActive) {
        const pulse = 0.9 + Math.sin(state.clock.elapsedTime * 35) * 0.35;
        jetFlameLRef.current.scale.set(pulse, pulse * 2.0, pulse);
        jetFlameRRef.current.scale.set(pulse, pulse * 2.0, pulse);
      } else {
        jetFlameLRef.current.scale.set(0.3, 0.4, 0.3);
        jetFlameRRef.current.scale.set(0.3, 0.4, 0.3);
      }
    }

    // Floating AI Companion Drone
    if (droneRef.current) {
      const t = state.clock.elapsedTime;
      droneRef.current.position.y = 1.62 + Math.sin(t * 3.4) * 0.12;
      droneRef.current.position.x = 0.58 + Math.cos(t * 1.8) * 0.08;
      droneRef.current.position.z = -0.28 + Math.sin(t * 1.8) * 0.08;
      droneRef.current.rotation.y += delta * 2.2;
    }

    // Sprint aura pulse
    if (auraRef.current) {
      auraRef.current.visible = isSprinting;
      if (isSprinting) {
        const aScale = 1.0 + (Math.sin(state.clock.elapsedTime * 12) * 0.5 + 0.5) * 0.35;
        auraRef.current.scale.set(aScale, aScale, aScale);
      }
    }
  });

  return (
    <group ref={rootGroup}>
      {/* 3D Floating Speech Bubble & Name Tag */}
      {name && (
        <Html position={[0, 2.3, 0]} center distanceFactor={14} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center select-none pointer-events-none">
            {emote && (
              <div className="relative mb-2.5 max-w-[260px] rounded-2xl bg-neutral-950/95 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl border border-cyan-400/60 backdrop-blur-md text-center leading-snug">
                <span
                  className="text-[10px] uppercase font-bold tracking-wider block mb-0.5"
                  style={{ color: accentColor }}
                >
                  {name}
                </span>
                <span className="break-words text-slate-100">{emote}</span>
                {/* Speech bubble arrow pointer */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-950 border-r border-b border-cyan-400/60 rotate-45" />
              </div>
            )}
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider backdrop-blur-md shadow-md whitespace-nowrap"
              style={{
                backgroundColor: "rgba(10, 15, 29, 0.85)",
                border: `1px solid ${accentColor}88`,
                color: "#fff",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span>{name}</span>
            </div>
          </div>
        </Html>
      )}

      {/* 3D Somersault Pivot (Salto Depan - Center of mass at hips y = 0.85) */}
      <group ref={flipPivotRef} position={[0, 0.85, 0]}>
        <group position={[0, -0.85, 0]}>
          {/* Upper Body + Head + Arms */}
          <group ref={bodyGroup}>
        {/* Tactical Pelvis & Belt */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.16, 0.14, 16]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Neon Cyber Belt Trim */}
        <mesh position={[0, 0.97, 0]}>
          <cylinderGeometry args={[0.205, 0.19, 0.04, 16]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} />
        </mesh>
        {/* Belt Buckle */}
        <mesh position={[0, 0.97, 0.16]}>
          <boxGeometry args={[0.08, 0.06, 0.03]} />
          <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Hip Energy Cell Canisters */}
        <mesh position={[-0.2, 0.95, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.035, 0.035, 0.1, 10]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, 0.95, 0]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.035, 0.035, 0.1, 10]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Sculpted Abdominal Segment Plates */}
        <mesh position={[0, 1.07, 0.05]} castShadow>
          <boxGeometry args={[0.26, 0.08, 0.16]} />
          <meshStandardMaterial color="#0b0f19" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, 1.17, 0.06]} castShadow>
          <boxGeometry args={[0.3, 0.09, 0.18]} />
          <meshStandardMaterial color="#111827" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Abdominal Neon Pinstripes */}
        <mesh position={[-0.14, 1.12, 0.09]}>
          <boxGeometry args={[0.015, 0.14, 0.02]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
        </mesh>
        <mesh position={[0.14, 1.12, 0.09]}>
          <boxGeometry args={[0.015, 0.14, 0.02]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
        </mesh>

        {/* V-Taper Armored Chest Chassis */}
        <mesh position={[0, 1.32, 0.02]} castShadow>
          <boxGeometry args={[0.44, 0.28, 0.26]} />
          <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Left Pectoral Armor Plate */}
        <mesh position={[-0.12, 1.34, 0.12]} rotation={[0.08, 0.12, -0.05]} castShadow>
          <boxGeometry args={[0.18, 0.2, 0.08]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
        </mesh>
        {/* Right Pectoral Armor Plate */}
        <mesh position={[0.12, 1.34, 0.12]} rotation={[0.08, -0.12, 0.05]} castShadow>
          <boxGeometry args={[0.18, 0.2, 0.08]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
        </mesh>

        {/* Central Arc-Reactor Core (Concentric Dual Rings) */}
        <group position={[0, 1.34, 0.16]}>
          {/* Inner Glowing Core */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 20]} />
            <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={4.5} />
          </mesh>
          {/* Outer Containment Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.075, 0.012, 12, 24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
          </mesh>
        </group>

        {/* Cyber Wingpack / Jetpack */}
        <group position={[0, 1.32, -0.16]}>
          {/* Central Housing */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.34, 0.12]} />
            <meshStandardMaterial color="#070a12" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Heat Sink Grill */}
          <mesh position={[0, 0.04, -0.065]}>
            <planeGeometry args={[0.18, 0.14]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} wireframe />
          </mesh>

          {/* Left Swept-back Aero-Wing */}
          <group position={[-0.14, 0.06, 0]} rotation={[0, 0.25, 0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.07, 0.03]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.036, 0]}>
              <boxGeometry args={[0.28, 0.008, 0.035]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
            </mesh>
          </group>

          {/* Right Swept-back Aero-Wing */}
          <group position={[0.14, 0.06, 0]} rotation={[0, -0.25, -0.35]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.07, 0.03]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.036, 0]}>
              <boxGeometry args={[0.28, 0.008, 0.035]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
            </mesh>
          </group>

          {/* Dual Twin Thruster Nozzles */}
          <mesh position={[-0.09, -0.18, 0]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.12, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0.09, -0.18, 0]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.12, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Animated Thruster Plasma Flames */}
          <mesh ref={jetFlameLRef} position={[-0.09, -0.28, -0.02]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.06, 0.28, 12]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
          <mesh ref={jetFlameRRef} position={[0.09, -0.28, -0.02]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.06, 0.28, 12]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>

        {/* Head & Aerodynamic Cyber Visor Helmet */}
        <group ref={headGroup} position={[0, 1.62, 0]}>
          {/* Neck Collar */}
          <mesh position={[0, -0.1, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.08, 14]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Helmet Cranial Dome */}
          <mesh castShadow position={[0, 0.02, -0.02]}>
            <sphereGeometry args={[0.2, 28, 24]} />
            <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Center Crown Ridge / Fin */}
          <mesh position={[0, 0.16, -0.02]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.04, 0.07, 0.26]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.19, -0.02]} rotation={[0.3, 0, 0]}>
            <boxGeometry args={[0.015, 0.02, 0.24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
          </mesh>

          {/* Aerodynamic Panoramic Curved Visor */}
          <mesh position={[0, 0.02, 0.1]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.17, 24, 20, 0, Math.PI, 0, Math.PI / 1.7]} />
            <meshStandardMaterial
              color="#020617"
              emissive={accentColor}
              emissiveIntensity={3.2}
              metalness={0.95}
              roughness={0.08}
            />
          </mesh>

          {/* Angular Chin / Rebreather Guard */}
          <mesh position={[0, -0.09, 0.08]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.12]} />
            <meshStandardMaterial color="#0e1726" metalness={0.88} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.09, 0.145]}>
            <boxGeometry args={[0.08, 0.03, 0.01]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} />
          </mesh>

          {/* Swept Cyber Ear Antenna Fins */}
          <group position={[-0.2, 0.05, -0.02]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.025, 0.16, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
            <mesh position={[-0.01, 0.06, 0]}>
              <boxGeometry args={[0.01, 0.06, 0.02]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
            </mesh>
          </group>
          <group position={[0.2, 0.05, -0.02]} rotation={[0, 0, -0.35]}>
            <boxGeometry args={[0.025, 0.16, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
            <mesh position={[0.01, 0.06, 0]}>
              <boxGeometry args={[0.01, 0.06, 0.02]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
            </mesh>
          </group>

          {!isRemote && (
            <>
              <spotLight
                ref={spotRef}
                position={[0, 0.05, 0.2]}
                angle={0.52}
                penumbra={0.6}
                intensity={22}
                distance={22}
                decay={1.3}
                color="#bae6fd"
              />
              <primitive object={spotTarget} />
            </>
          )}
        </group>

        {/* Left Arm with Layered Pauldron & Gauntlet */}
        <group ref={leftArmRef} position={[-0.32, 1.4, 0]}>
          {/* Angled Shoulder Pauldron Guard */}
          <mesh position={[-0.04, 0.05, 0]} rotation={[0, 0, 0.22]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.2]} />
            <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[-0.12, 0.08, 0]}>
            <boxGeometry args={[0.01, 0.08, 0.18]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
          </mesh>
          {/* Upper Arm Bicep */}
          <mesh position={[-0.03, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.16, 14]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Forearm & Fist Hinge at Elbow */}
          <group ref={leftForearmRef} position={[-0.03, -0.21, 0]}>
            {/* Elbow Joint Cap */}
            <mesh position={[0, 0, -0.02]}>
              <sphereGeometry args={[0.045, 12, 10]} />
              <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Armored Forearm Gauntlet */}
            <mesh position={[0, -0.12, 0.02]} castShadow>
              <boxGeometry args={[0.1, 0.18, 0.11]} />
              <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Gauntlet Neon Conduit Plate */}
            <mesh position={[0, -0.12, 0.08]}>
              <boxGeometry args={[0.07, 0.12, 0.02]} />
              <meshStandardMaterial color={accentColor} emissive={color} emissiveIntensity={2.8} />
            </mesh>
            {/* Cyber Fist */}
            <mesh position={[0, -0.24, 0.02]} castShadow>
              <boxGeometry args={[0.08, 0.09, 0.09]} />
              <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        </group>

        {/* Right Arm with Cyber Power Gauntlet (Punch Arm) */}
        <group ref={rightArmRef} position={[0.32, 1.4, 0]}>
          {/* Angled Shoulder Pauldron Guard */}
          <mesh position={[0.04, 0.05, 0]} rotation={[0, 0, -0.22]} castShadow>
            <boxGeometry args={[0.16, 0.14, 0.2]} />
            <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0.12, 0.08, 0]}>
            <boxGeometry args={[0.01, 0.08, 0.18]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3} />
          </mesh>
          {/* Upper Arm Bicep */}
          <mesh position={[0.03, -0.11, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.045, 0.16, 14]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>

          {/* Forearm & Fist Hinge at Elbow */}
          <group ref={rightForearmRef} position={[0.03, -0.21, 0]}>
            {/* Elbow Joint Cap */}
            <mesh position={[0, 0, -0.02]}>
              <sphereGeometry args={[0.045, 12, 10]} />
              <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Heavy Armored Forearm Gauntlet */}
            <mesh position={[0, -0.12, 0.02]} castShadow>
              <boxGeometry args={[0.11, 0.18, 0.12]} />
              <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Gauntlet Kinetic Overcharge Conduit */}
            <mesh position={[0, -0.12, 0.085]}>
              <boxGeometry args={[0.075, 0.13, 0.02]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={accentColor}
                emissiveIntensity={isPunching ? 5.5 : 2.8}
              />
            </mesh>
            {/* Reinforced Cyber Punching Fist */}
            <mesh position={[0, -0.24, 0.02]} castShadow>
              <boxGeometry args={[0.09, 0.095, 0.095]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Knuckle Strike Plate */}
            <mesh position={[0, -0.25, 0.07]}>
              <boxGeometry args={[0.08, 0.03, 0.02]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive={accentColor}
                emissiveIntensity={isPunching ? 6.0 : 3.0}
              />
            </mesh>
          </group>
        </group>
      </group>

      {/* Left Leg & Kinetic Hover Boot */}
      <group ref={leftLegRef} position={[-0.14, 0.9, 0]}>
        {/* Sculpted Thigh Armor */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.06, 0.3, 14]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.14, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.18, 0.05]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Knee Hinge -> Shin & Boot Group */}
        <group ref={leftShinRef} position={[0, -0.32, 0]}>
          {/* Mechanical Knee Guard with Chevron */}
          <mesh position={[0, 0, 0.05]} castShadow>
            <boxGeometry args={[0.095, 0.095, 0.07]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.05, 0.05, 0.015]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
          </mesh>

          {/* Shin Guard & Calf Booster */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.055, 0.28, 14]} />
            <meshStandardMaterial color="#0e1726" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.18, 0.055]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.04]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>

          {/* High-Top Kinetic Cyber Sneaker / Hover Boot */}
          <mesh position={[0, -0.42, 0.05]} castShadow>
            <boxGeometry args={[0.11, 0.16, 0.24]} />
            <meshStandardMaterial color="#070a12" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Boot Toe Guard */}
          <mesh position={[0, -0.44, 0.16]} castShadow>
            <boxGeometry args={[0.1, 0.11, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Dual Neon Sole Traction Rails */}
          <mesh position={[-0.04, -0.505, 0.05]}>
            <boxGeometry args={[0.02, 0.015, 0.24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
          </mesh>
          <mesh position={[0.04, -0.505, 0.05]}>
            <boxGeometry args={[0.02, 0.015, 0.24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
          </mesh>
        </group>
      </group>

      {/* Right Leg & Kinetic Hover Boot */}
      <group ref={rightLegRef} position={[0.14, 0.9, 0]}>
        {/* Sculpted Thigh Armor */}
        <mesh position={[0, -0.16, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.06, 0.3, 14]} />
          <meshStandardMaterial color="#111827" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.14, 0.06]} castShadow>
          <boxGeometry args={[0.11, 0.18, 0.05]} />
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Knee Hinge -> Shin & Boot Group */}
        <group ref={rightShinRef} position={[0, -0.32, 0]}>
          {/* Mechanical Knee Guard with Chevron */}
          <mesh position={[0, 0, 0.05]} castShadow>
            <boxGeometry args={[0.095, 0.095, 0.07]} />
            <meshStandardMaterial color="#090d16" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.05, 0.05, 0.015]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
          </mesh>

          {/* Shin Guard & Calf Booster */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.055, 0.28, 14]} />
            <meshStandardMaterial color="#0e1726" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.18, 0.055]} castShadow>
            <boxGeometry args={[0.08, 0.2, 0.04]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>

          {/* High-Top Kinetic Cyber Sneaker / Hover Boot */}
          <mesh position={[0, -0.42, 0.05]} castShadow>
            <boxGeometry args={[0.11, 0.16, 0.24]} />
            <meshStandardMaterial color="#070a12" metalness={0.92} roughness={0.15} />
          </mesh>
          {/* Boot Toe Guard */}
          <mesh position={[0, -0.44, 0.16]} castShadow>
            <boxGeometry args={[0.1, 0.11, 0.08]} />
            <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Dual Neon Sole Traction Rails */}
          <mesh position={[-0.04, -0.505, 0.05]}>
            <boxGeometry args={[0.02, 0.015, 0.24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
          </mesh>
          <mesh position={[0.04, -0.505, 0.05]}>
            <boxGeometry args={[0.02, 0.015, 0.24]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
          </mesh>
        </group>
      </group>

      {/* Somersault Acrobatic Energy Spin Ring */}
      <mesh
        ref={somersaultRingRef}
        position={[0, 0.85, 0]}
        rotation={[0, Math.PI / 2, 0]}
        visible={false}
      >
        <torusGeometry args={[0.82, 0.02, 10, 36]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.65} />
      </mesh>
        </group>
      </group>

      {/* Floating Tactical AI Drone Companion */}
      <group ref={droneRef} position={[0.55, 1.65, -0.25]}>
        <mesh castShadow>
          <octahedronGeometry args={[0.1, 0]} />
          <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Forward Holographic Scanner Eye */}
        <mesh position={[0, 0, 0.09]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={4.2} />
        </mesh>
        {/* Gyroscopic Planetary Orbit Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.18, 0.012, 10, 28]} />
          <meshStandardMaterial color={color} emissive={accentColor} emissiveIntensity={2.5} />
        </mesh>
        <pointLight color={accentColor} intensity={2.2} distance={4} />
      </group>

      {/* Sprint Aura */}
      <mesh ref={auraRef} position={[0, 0.9, 0]} visible={false}>
        <sphereGeometry args={[0.9, 16, 12]} />
        <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.35} />
      </mesh>

      {/* Radial Ground Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={blobTex} transparent depthWrite={false} opacity={0.88} />
      </mesh>
    </group>
  );
}

/* ============================================================
   REMOTE PLAYER CHARACTER
============================================================ */
function RemotePlayerCharacter({ player }: { player: PlayerData }) {
  const carState = useRef<{
    pos: THREE.Vector3;
    rot: number;
    speed: number;
    onGround?: boolean;
  }>({
    pos: new THREE.Vector3(...player.pos),
    rot: player.rot,
    speed: player.speed,
    onGround: player.onGround ?? true,
  });
  const steerAngle = useRef(0);
  const tilt = useRef({ roll: 0, pitch: 0 });
  const isDriftingRef = useRef(player.isSprinting);

  useFrame((_, delta) => {
    const current = carState.current;
    current.pos.x = THREE.MathUtils.damp(current.pos.x, player.pos[0], 14, delta);
    current.pos.y = THREE.MathUtils.damp(current.pos.y, player.pos[1], 14, delta);
    current.pos.z = THREE.MathUtils.damp(current.pos.z, player.pos[2], 14, delta);

    let diff = player.rot - current.rot;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    current.rot += diff * Math.min(1, delta * 12);

    current.speed = THREE.MathUtils.damp(current.speed, player.speed, 10, delta);
    current.onGround = player.onGround ?? true;
    isDriftingRef.current = player.isSprinting;
  });

  return (
    <CyberCharacter
      carRef={carState}
      steerRef={steerAngle}
      tiltRef={tilt}
      isDriftingRef={isDriftingRef}
      color={player.color}
      accentColor={player.accentColor}
      name={player.name}
      emote={player.emote}
      isRemote={true}
      isPunching={player.isPunching}
      isHit={player.isHit}
    />
  );
}

/* ============================================================
   COMIC HIT SPARKS
============================================================ */
function ComicHitSparks({ hitSparks }: { hitSparks: HitSpark[] }) {
  return (
    <>
      {hitSparks.map((spark) => (
        <group key={spark.id} position={spark.pos}>
          <Html center distanceFactor={12} style={{ pointerEvents: "none" }}>
            <div className="relative select-none pointer-events-none -rotate-12 animate-pulse whitespace-nowrap">
              <span className="font-black text-2xl md:text-4xl text-yellow-300 drop-shadow-[0_4px_14px_rgba(239,68,68,0.95)] tracking-wider">
                💥 {spark.text}
              </span>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}

/* ============================================================
   WORLD SIMULATION (Humanoid Physics, Jumping, Combat, Camera)
============================================================ */
type MobileControls = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
};

function World({
  onActiveLandmark,
  mobileControls,
  localPlayer,
  remotePlayers,
  broadcastLocalState,
  currentEmote,
  isLocalPunching,
  isLocalHit,
  triggerHit,
  registerKnockbackHandler,
  hitSparks,
  triggerEmote,
}: {
  onActiveLandmark: (landmark: LandmarkData | null) => void;
  mobileControls: MobileControls;
  localPlayer: { id: string; name: string; color: string; accentColor: string };
  remotePlayers: PlayerData[];
  broadcastLocalState: (
    pos: [number, number, number],
    rot: number,
    speed: number,
    isSprinting: boolean,
    onGround?: boolean
  ) => void;
  currentEmote: string | null;
  isLocalPunching: boolean;
  isLocalHit: boolean;
  triggerHit: (
    targetId: string,
    dir: [number, number],
    force: number,
    sparkPos: [number, number, number]
  ) => void;
  registerKnockbackHandler: (fn: (dir: [number, number], force: number) => void) => void;
  hitSparks: HitSpark[];
  triggerEmote: (emoji: string) => void;
}) {
  const camera = useThree((s) => s.camera);

  const carState = useRef({
    pos: new THREE.Vector3(0, 0, 1.6),
    rot: 0,
    speed: 0,
    onGround: true,
  });
  const vel = useRef({ x: 0, y: 0, z: 0 });
  const steerAngle = useRef(0);
  const tilt = useRef({ roll: 0, pitch: 0 });
  const isDriftingRef = useRef(false);
  const keys = useRef(new Set<string>());
  const speedShown = useRef(-1);
  const nearbyId = useRef<string | null>(null);
  const camAnchor = useMemo(() => new THREE.Vector3(), []);
  const camTarget = useMemo(() => new THREE.Vector3(0, 1.25, 0), []);

  // Hit cooldown against targets
  const hitCooldownRef = useRef(new Set<string>());

  useEffect(() => {
    registerKnockbackHandler((dir, force) => {
      vel.current.x += dir[0] * force;
      vel.current.z += dir[1] * force;
      vel.current.y = 4.5;
    });
  }, [registerKnockbackHandler]);

  // Camera Orbit Angle (Horizontal Yaw & Vertical Pitch)
  const camYawRef = useRef(0);
  const camPitchRef = useRef(0.35); // Initial pitch angle (~20 deg elevation)
  const dragStart = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === "CANVAS") {
        isDragging.current = true;
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;
        // Horizontal yaw (kiri/kanan)
        camYawRef.current -= deltaX * 0.005;
        // Vertical pitch (atas/bawah):
        // Drag mouse ke ATAS (deltaY < 0) -> camera memandang ke ATAS (tengadah)
        // Drag mouse ke BAWAH (deltaY > 0) -> camera memandang ke BAWAH (menunduk)
        camPitchRef.current = THREE.MathUtils.clamp(
          camPitchRef.current + deltaY * 0.004,
          -0.35, // Sudut bawah (kamera rendah memandang ke atas ke langit)
          1.20   // Sudut atas (kamera tinggi memandang ke bawah)
        );
        dragStart.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };

    // Mobile / Tablet Touch Drag (Swipe camera atas/bawah/kiri/kanan tanpa scroll halaman)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && (e.target as HTMLElement).tagName === "CANVAS") {
        isDragging.current = true;
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length === 1) {
        if (e.cancelable) {
          e.preventDefault(); // Stop mobile browser from scrolling page down while looking around in 3D
        }
        const deltaX = e.touches[0].clientX - dragStart.current.x;
        const deltaY = e.touches[0].clientY - dragStart.current.y;
        camYawRef.current -= deltaX * 0.006;
        camPitchRef.current = THREE.MathUtils.clamp(
          camPitchRef.current + deltaY * 0.005,
          -0.35,
          1.20
        );
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const sunTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 0);
    return o;
  }, []);

  useEffect(() => {
    if (sunRef.current) sunRef.current.target = sunTarget;
    const down = (e: KeyboardEvent) => {
      // Guard: Do not capture movement keys when typing in input or modal
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        keys.current.clear();
        return;
      }
      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      keys.current.add(e.key.toLowerCase());
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down, { passive: false });
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [sunTarget]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const car = carState.current;

    /* ---- 8-Directional Humanoid Inputs ---- */
    const isW = keys.current.has("w") || keys.current.has("arrowup") || mobileControls.forward;
    const isS = keys.current.has("s") || keys.current.has("arrowdown") || mobileControls.backward;
    const isA = keys.current.has("a") || keys.current.has("arrowleft") || mobileControls.left;
    const isD = keys.current.has("d") || keys.current.has("arrowright") || mobileControls.right;
    const isSprint = keys.current.has("shift") || mobileControls.sprint;
    const isJump = keys.current.has(" ") || mobileControls.jump;

    const inputX = (isD ? 1 : 0) - (isA ? 1 : 0);
    const inputZ = (isW ? 1 : 0) - (isS ? 1 : 0);
    const hasMoveInput = inputX !== 0 || inputZ !== 0;

    /* ---- Optional Keyboard Camera Controls ---- */
    if (keys.current.has("q")) camYawRef.current += 2.0 * delta;
    if (keys.current.has("e")) camYawRef.current -= 2.0 * delta;
    if (keys.current.has("pageup") || keys.current.has("r")) {
      camPitchRef.current = Math.max(-0.35, camPitchRef.current - 1.4 * delta); // Lihat ke atas
    }
    if (keys.current.has("pagedown") || keys.current.has("c")) {
      camPitchRef.current = Math.min(1.20, camPitchRef.current + 1.4 * delta);  // Lihat ke bawah
    }

    /* ---- Camera Relative Movement (Decoupled from Character Rotation) ---- */
    const camYaw = camYawRef.current;
    let targetVx = 0;
    let targetVz = 0;

    if (hasMoveInput) {
      const len = Math.hypot(inputX, inputZ);
      const nx = inputX / len;
      const nz = inputZ / len;

      // Screen space: W is forward away from camera, S toward camera, A left, D right
      // In Three.js, with camera at -Z looking to +Z, screen RIGHT is -X and screen LEFT is +X
      const sin = Math.sin(camYaw);
      const cos = Math.cos(camYaw);
      const dirX = -nx * cos + nz * sin;
      const dirZ = nx * sin + nz * cos;

      const curMaxSpeed = isSprint ? 9.5 : 5.8;
      targetVx = dirX * curMaxSpeed;
      targetVz = dirZ * curMaxSpeed;

      // Character smoothly faces movement direction
      const targetRot = Math.atan2(dirX, dirZ);
      let diff = targetRot - car.rot;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      car.rot += diff * Math.min(1, delta * 12.0);
    }

    // Smooth humanoid acceleration & gentle stopping (natural momentum)
    const accelRate = hasMoveInput ? 13.0 : 11.0;
    vel.current.x = THREE.MathUtils.damp(vel.current.x, targetVx, accelRate, delta);
    vel.current.z = THREE.MathUtils.damp(vel.current.z, targetVz, accelRate, delta);

    car.pos.x += vel.current.x * delta;
    car.pos.z += vel.current.z * delta;

    const hSpeed = Math.hypot(vel.current.x, vel.current.z);
    car.speed = hasMoveInput ? hSpeed : (hSpeed > 0.08 ? hSpeed : 0);

    /* ---- Vertical Physics, Ground Elevation & Platforms ---- */
    let groundY = 0;
    for (const plat of ELEVATED_PLATFORMS) {
      const halfW = plat.w / 2;
      const halfD = plat.d / 2;
      const dx = car.pos.x - plat.x;
      const dz = car.pos.z - plat.z;
      const inX = Math.abs(dx) <= halfW;
      const inZ = Math.abs(dz) <= halfD;

      if (inX && inZ) {
        if (car.pos.y >= plat.h - 0.35) {
          groundY = Math.max(groundY, plat.h);
        }
      } else if (car.pos.y < plat.h - 0.35) {
        // Horizontal wall collision for platform edge when on the ground
        const overlapX = (halfW + AVATAR_R) - Math.abs(dx);
        const overlapZ = (halfD + AVATAR_R) - Math.abs(dz);
        if (overlapX > 0 && overlapZ > 0) {
          if (overlapX < overlapZ) {
            car.pos.x = plat.x + Math.sign(dx) * (halfW + AVATAR_R);
            vel.current.x = 0;
          } else {
            car.pos.z = plat.z + Math.sign(dz) * (halfD + AVATAR_R);
            vel.current.z = 0;
          }
        }
      }
    }

    /* ---- Solid Obstacle Collisions (Components di Arena tidak tembus) ---- */
    for (const obs of SOLID_OBSTACLES) {
      if (car.pos.y + 0.1 < (obs.minY ?? 0) || car.pos.y > (obs.maxY ?? 10)) {
        continue;
      }
      if (obs.r) {
        const dx = car.pos.x - obs.x;
        const dz = car.pos.z - obs.z;
        const dist = Math.hypot(dx, dz);
        const minDist = obs.r + AVATAR_R;
        if (dist < minDist && dist > 0.001) {
          const push = minDist - dist;
          car.pos.x += (dx / dist) * push;
          car.pos.z += (dz / dist) * push;
          const normX = dx / dist;
          const normZ = dz / dist;
          const dot = vel.current.x * normX + vel.current.z * normZ;
          if (dot < 0) {
            vel.current.x -= dot * normX;
            vel.current.z -= dot * normZ;
          }
        }
      } else if (obs.w && obs.d) {
        const halfW = obs.w / 2;
        const halfD = obs.d / 2;
        const dx = car.pos.x - obs.x;
        const dz = car.pos.z - obs.z;
        const overlapX = (halfW + AVATAR_R) - Math.abs(dx);
        const overlapZ = (halfD + AVATAR_R) - Math.abs(dz);
        if (overlapX > 0 && overlapZ > 0) {
          if (overlapX < overlapZ) {
            car.pos.x = obs.x + Math.sign(dx) * (halfW + AVATAR_R);
            vel.current.x = 0;
          } else {
            car.pos.z = obs.z + Math.sign(dz) * (halfD + AVATAR_R);
            vel.current.z = 0;
          }
        }
      }
    }

    const GRAVITY = -24.0;
    vel.current.y += GRAVITY * delta;
    car.pos.y += vel.current.y * delta;

    let onGround = false;
    if (car.pos.y <= groundY) {
      car.pos.y = groundY;
      vel.current.y = 0;
      onGround = true;
    }
    car.onGround = onGround;

    // Normal Jump (Space)
    if (isJump && onGround) {
      vel.current.y = 9.8;
      onGround = false;
      car.onGround = false;
    }

    // Super Jump Launch Pads (Trampolin Super Kuat)
    for (const pad of JUMP_PADS) {
      const d = Math.hypot(car.pos.x - pad.x, car.pos.z - pad.z);
      if (d < 1.45 && car.pos.y <= groundY + 0.35) {
        vel.current.y = 25.5; // Trampolin super tinggi (~13.5m apex launch!)
        onGround = false;
        car.onGround = false;
      }
    }

    /* ---- Elastic Arena Bounds ---- */
    if (Math.abs(car.pos.x) > ARENA_BOUND) {
      const n = Math.sign(car.pos.x);
      car.pos.x = n * ARENA_BOUND;
      if (vel.current.x * n > 0) vel.current.x *= -0.3;
    }
    if (Math.abs(car.pos.z) > ARENA_BOUND) {
      const n = Math.sign(car.pos.z);
      car.pos.z = n * ARENA_BOUND;
      if (vel.current.z * n > 0) vel.current.z *= -0.3;
    }

    isDriftingRef.current = isSprint && hSpeed > 0.4;

    /* ---- Direct DOM HUD Speed ---- */
    const shown = Math.round(hSpeed * 5.2);
    if (shown !== speedShown.current) {
      speedShown.current = shown;
      const valEl = document.getElementById("hud-speed-val");
      if (valEl) valEl.textContent = `${shown} KM/H`;
      const dotEl = document.getElementById("hud-speed-dot");
      if (dotEl) {
        if (shown > 4) {
          dotEl.className = "h-2 w-2 rounded-full bg-cyan-400 animate-pulse";
        } else {
          dotEl.className = "h-2 w-2 rounded-full bg-neutral-500";
        }
      }
    }

    /* ---- Third-Person Spherical Orbit Camera (Pitch Atas/Bawah, Yaw Kiri/Kanan) ---- */
    const camPitch = camPitchRef.current;
    const camDist = 5.6;

    const horizontalDist = camDist * Math.cos(camPitch);
    const verticalDist = camDist * Math.sin(camPitch);

    const camX = Math.sin(camYaw) * horizontalDist;
    const camZ = Math.cos(camYaw) * horizontalDist;

    // Pastikan posisi kamera tidak tembus ke bawah lantai atau panggung
    const safeMinY = groundY + 0.35;
    const targetCamY = Math.max(safeMinY, car.pos.y + 1.25 + verticalDist);

    camAnchor.set(
      car.pos.x - camX,
      targetCamY,
      car.pos.z - camZ
    );

    // Silky smooth camera position damping
    camera.position.x = THREE.MathUtils.damp(camera.position.x, camAnchor.x, 8.0, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, camAnchor.y, 8.0, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camAnchor.z, 8.0, delta);

    // Dynamic LookAt target: tilts naturally up/down
    const lookOffsetY = 1.3 - Math.sin(camPitch) * 0.35;
    camTarget.x = THREE.MathUtils.damp(camTarget.x, car.pos.x, 12.0, delta);
    camTarget.y = THREE.MathUtils.damp(camTarget.y, car.pos.y + lookOffsetY, 12.0, delta);
    camTarget.z = THREE.MathUtils.damp(camTarget.z, car.pos.z, 12.0, delta);
    camera.lookAt(camTarget);

    /* ---- Dynamic Sun follows avatar for realistic shadows ---- */
    if (sunRef.current) {
      sunRef.current.position.set(car.pos.x + 7, car.pos.y + 14, car.pos.z + 5);
      sunTarget.position.set(car.pos.x, car.pos.y, car.pos.z);
      sunTarget.updateMatrixWorld();
    }

    /* ---- Proximity Zone Trigger ---- */
    let closest: LandmarkData | null = null;
    let minD = 4.2;
    for (const lm of landmarks) {
      const d = Math.hypot(car.pos.x - lm.position[0], car.pos.z - lm.position[2]);
      if (d < minD) {
        minD = d;
        closest = lm;
      }
    }
    if ((closest?.id ?? null) !== nearbyId.current) {
      nearbyId.current = closest?.id ?? null;
      onActiveLandmark(closest);
    }

    /* ---- Punch Hit Detection on Remote Players ---- */
    if (isLocalPunching) {
      const pfx = Math.sin(car.rot);
      const pfz = Math.cos(car.rot);
      const fistX = car.pos.x + pfx * 1.15;
      const fistZ = car.pos.z + pfz * 1.15;

      for (const remote of remotePlayers) {
        if (hitCooldownRef.current.has(remote.id)) continue;
        const dx = remote.pos[0] - fistX;
        const dz = remote.pos[2] - fistZ;
        const dist = Math.hypot(dx, dz);

        if (dist < 1.85) {
          hitCooldownRef.current.add(remote.id);
          setTimeout(() => hitCooldownRef.current.delete(remote.id), 550);

          const pushDir: [number, number] = [pfx, pfz];
          const sparkPos: [number, number, number] = [
            remote.pos[0],
            remote.pos[1] + 1.4,
            remote.pos[2],
          ];
          triggerHit(remote.id, pushDir, 7.5, sparkPos);
        }
      }
    }

    /* ---- Broadcast Local Avatar State across network ---- */
    broadcastLocalState(
      [car.pos.x, car.pos.y, car.pos.z],
      car.rot,
      car.speed,
      isDriftingRef.current,
      car.onGround
    );
  });

  return (
    <>
      <ambientLight intensity={0.85} color="#cbd5e1" />
      <directionalLight
        ref={sunRef}
        position={[7, 14, 5]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0003}
        color="#e0f2fe"
      />
      <primitive object={sunTarget} />

      <CyberMetaverseArena />

      {/* Teleport Station di Lokasi Bekas Tower (z: -14.5) */}
      <CyberTeleportStation
        carState={carState}
        position={[0.0, 0.6, -14.5]}
        rotation={[0, 0, 0]}
      />

      {/* Sci-Fi Monoliths di Sektor Utama */}
      {landmarks.map((lm) => (
        <SciFiMonolith
          key={lm.id}
          landmark={lm}
          isNearby={nearbyId.current === lm.id}
        />
      ))}

      {/* Comic Hit Sparks */}
      <ComicHitSparks hitSparks={hitSparks} />

      {/* Local Avatar */}
      <CyberCharacter
        carRef={carState}
        steerRef={steerAngle}
        tiltRef={tilt}
        isDriftingRef={isDriftingRef}
        color={localPlayer.color}
        accentColor={localPlayer.accentColor}
        name={localPlayer.name}
        emote={currentEmote ?? undefined}
        isPunching={isLocalPunching}
        isHit={isLocalHit}
      />

      {/* Remote Players in Metaverse */}
      {remotePlayers.map((player) => (
        <RemotePlayerCharacter key={player.id} player={player} />
      ))}
    </>
  );
}

/* ============================================================
   WORLD HERO (Canvas, Mobile Controls & HUD)
============================================================ */
function WorldHero() {
  const [activeLandmark, setActiveLandmark] = useState<LandmarkData | null>(null);
  const [mobileControls, setMobileControls] = useState<MobileControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
  });

  const {
    localPlayer,
    remotePlayers,
    totalOnline,
    maxPlayers,
    currentEmote,
    isLocalPunching,
    isLocalHit,
    punchesLanded,
    hitSparks,
    triggerEmote,
    triggerPunch,
    triggerHit,
    registerKnockbackHandler,
    broadcastLocalState,
    updateLocalPlayerProfile,
  } = useMultiplayer();

  const [chatText, setChatText] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [inputName, setInputName] = useState(localPlayer.name);
  const [selectedColor, setSelectedColor] = useState(localPlayer.color);
  const [selectedAccent, setSelectedAccent] = useState(localPlayer.accentColor);

  // Auto show pop-up on first arrival if custom name not yet chosen
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSaved = localStorage.getItem("portfolio_custom_username");
      if (!hasSaved) {
        const t = setTimeout(() => {
          setInputName(localPlayer.name);
          setSelectedColor(localPlayer.color);
          setSelectedAccent(localPlayer.accentColor);
          setShowNameModal(true);
        }, 700);
        return () => clearTimeout(t);
      }
    }
  }, [localPlayer.name, localPlayer.color, localPlayer.accentColor]);

  const handleSendChat = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    triggerEmote(trimmed);
    setChatText("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "f") {
        e.preventDefault();
        triggerPunch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerPunch]);

  const handleTouch = useCallback((key: keyof MobileControls, val: boolean) => {
    setMobileControls((prev) => ({ ...prev, [key]: val }));
  }, []);

  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).tagName === "CANVAS" && e.button === 0) {
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointerStartRef.current && (e.target as HTMLElement).tagName === "CANVAS" && e.button === 0) {
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      const dist = Math.hypot(dx, dy);
      const dt = Date.now() - pointerStartRef.current.time;
      // If it's a deliberate click (< 8px movement within 400ms), punch!
      if (dist < 8 && dt < 400) {
        triggerPunch();
      }
    }
    pointerStartRef.current = null;
  };

  return (
    <div
      className="relative h-full w-full select-none touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 4.6, -7.2], fov: 48 }}
        className="absolute inset-0 cursor-crosshair touch-none"
      >
        <World
          onActiveLandmark={setActiveLandmark}
          mobileControls={mobileControls}
          localPlayer={localPlayer}
          remotePlayers={remotePlayers}
          broadcastLocalState={broadcastLocalState}
          currentEmote={currentEmote}
          isLocalPunching={isLocalPunching}
          isLocalHit={isLocalHit}
          triggerHit={triggerHit}
          registerKnockbackHandler={registerKnockbackHandler}
          hitSparks={hitSparks}
          triggerEmote={triggerEmote}
        />
      </Canvas>

      {/* Top HUD (Safe area padding for fixed Navbar) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between p-4 pt-16 sm:p-6 sm:pt-20 md:p-8 md:pt-8">
        <div className="max-w-[280px] sm:max-w-[340px] text-white">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-cyan-400 font-mono">
            Interactive Metaverse Arena
          </p>
          <h1 className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-4xl font-black leading-tight tracking-[-0.03em]">
            NAUFAL MAULANA
          </h1>
          <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-neutral-400 hidden xs:block">
            Swipe layar arahkan kamera &bull; Kontrol karakter di bawah.
          </p>
          {/* Mobile Visitor Indicator */}
          <button
            onClick={() => {
              setInputName(localPlayer.name);
              setSelectedColor(localPlayer.color);
              setSelectedAccent(localPlayer.accentColor);
              setShowNameModal(true);
            }}
            className="mt-2 flex items-center gap-1.5 md:hidden pointer-events-auto bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 active:scale-95 transition-transform"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-400">
              {totalOnline}/{maxPlayers || 10} Online
            </span>
            <span className="text-[10px] text-cyan-300 font-mono underline">
              {localPlayer.name} ✏️
            </span>
          </button>
        </div>

        <div className="hidden flex-col items-end gap-2 text-right md:flex pointer-events-auto">
          <div className="flex items-center gap-2">
            {/* Live Visitors Badge & Character Customization Trigger */}
            <button
              onClick={() => {
                setInputName(localPlayer.name);
                setSelectedColor(localPlayer.color);
                setSelectedAccent(localPlayer.accentColor);
                setShowNameModal(true);
              }}
              title="Klik untuk ubah nama atau warna armor karakter kamu"
              className="glass flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-neutral-300 transition-all hover:border-cyan-400/60 hover:bg-white/15 cursor-pointer shadow-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-white">
                {totalOnline}/{maxPlayers || 10} Players Online
              </span>
              <span className="text-neutral-500">•</span>
              <span className="text-[11px] font-mono text-neutral-300 flex items-center gap-1">
                You: <span style={{ color: localPlayer.accentColor }}>{localPlayer.name}</span>
                <span className="text-[10px] text-cyan-400">✏️</span>
              </span>
            </button>

            {/* Punches Landed */}
            {punchesLanded > 0 && (
              <div className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-amber-300 border border-amber-500/40 bg-amber-500/10 animate-pulse">
                <span>🥊</span>
                <span className="font-black">{punchesLanded}</span>
                <span className="text-[10px] uppercase font-bold text-amber-400">Hits</span>
              </div>
            )}

            {/* Speed Indicator */}
            <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-neutral-300">
              <span id="hud-speed-dot" className="h-2 w-2 rounded-full bg-neutral-500" />
              <span id="hud-speed-val" className="font-mono">0 KM/H</span>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">
            WASD RUN &bull; DRAG MOUSE / SWIPE CAMERA (ATAS &bull; BAWAH &bull; KIRI &bull; KANAN) &bull; F PUNCH
          </span>
        </div>
      </div>

      {/* Desktop Quick Action Bar: Punch & Interactive Live Typing Chat (Hidden on Mobile) */}
      <div className="hidden md:flex pointer-events-auto absolute inset-x-0 bottom-8 z-20 flex-col items-center gap-2">
        {/* Quick chat chip presets */}
        <div className="flex items-center gap-1.5 pb-1">
          {[
            "Halo bro! 👋",
            "Ayo spar 🥊",
            "Keren portofolionya! ✨",
            "Gas mabar 🚀",
            "Salam kenal! 🤝",
          ].map((msg) => (
            <button
              key={msg}
              onClick={() => handleSendChat(msg)}
              className="rounded-full border border-white/10 bg-neutral-900/80 px-2.5 py-1 text-[11px] text-neutral-300 backdrop-blur-md transition-all hover:border-cyan-400/50 hover:bg-neutral-800 hover:text-white active:scale-95 shadow-md"
            >
              {msg}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 max-w-xl w-full justify-center">
          {/* Main Punch Trigger Button */}
          <button
            onClick={triggerPunch}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-red-600 to-amber-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-red-500/25 transition-all hover:scale-105 active:scale-95 border border-red-400/50"
            title="Press F or Click Screen to Punch"
          >
            <span className="text-base">🥊</span>
            <span>PUNCH (F)</span>
          </button>

          {/* Live Visitor Typing Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat(chatText);
            }}
            className="flex flex-1 items-center gap-2 rounded-full border border-cyan-500/40 bg-neutral-950/90 p-1.5 pl-4 backdrop-blur-xl shadow-2xl"
          >
            <MessageSquare className="h-4 w-4 text-cyan-400 flex-shrink-0" />
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Ketik chat ke visitor lain... (Tekan Enter)"
              maxLength={80}
              className="w-full bg-transparent font-sans text-xs text-cyan-100 placeholder-neutral-500 outline-none"
            />
            <button
              type="submit"
              disabled={!chatText.trim()}
              className="flex flex-shrink-0 items-center gap-1 rounded-full bg-cyan-500 px-3 py-1.5 text-xs font-bold text-black transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      </div>

      {/* Proximity Zone Modal */}
      {activeLandmark && (
        <div className="absolute inset-x-3 bottom-32 sm:bottom-28 z-30 mx-auto max-w-sm rounded-3xl border border-white/15 bg-neutral-950/90 p-4 sm:p-5 shadow-2xl backdrop-blur-xl md:bottom-24 md:max-w-md">
          <span
            className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${activeLandmark.accent}`}
          >
            Nearby Zone {activeLandmark.index}
          </span>
          <h3 className="mt-2 text-base sm:text-lg font-bold text-white">{activeLandmark.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">
            {activeLandmark.description}
          </p>
          <a
            href={activeLandmark.href}
            className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Jump to Section</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      )}

      {/* Mobile Ergonomic Touch HUD & Controls */}
      <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 flex items-end justify-between md:hidden">
        {/* Left: Compact Cyber D-Pad */}
        <div className="grid grid-cols-3 gap-1 w-28 sm:w-32">
          <div />
          <button
            onPointerDown={() => handleTouch("forward", true)}
            onPointerUp={() => handleTouch("forward", false)}
            onPointerLeave={() => handleTouch("forward", false)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 backdrop-blur-md active:bg-cyan-500/40 active:border-cyan-400 transition-colors shadow-lg"
            aria-label="Forward"
          >
            <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
          <div />
          <button
            onPointerDown={() => handleTouch("left", true)}
            onPointerUp={() => handleTouch("left", false)}
            onPointerLeave={() => handleTouch("left", false)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 backdrop-blur-md active:bg-cyan-500/40 active:border-cyan-400 transition-colors shadow-lg"
            aria-label="Left"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
          <button
            onPointerDown={() => handleTouch("backward", true)}
            onPointerUp={() => handleTouch("backward", false)}
            onPointerLeave={() => handleTouch("backward", false)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 backdrop-blur-md active:bg-cyan-500/40 active:border-cyan-400 transition-colors shadow-lg"
            aria-label="Backward"
          >
            <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
          <button
            onPointerDown={() => handleTouch("right", true)}
            onPointerUp={() => handleTouch("right", false)}
            onPointerLeave={() => handleTouch("right", false)}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 backdrop-blur-md active:bg-cyan-500/40 active:border-cyan-400 transition-colors shadow-lg"
            aria-label="Right"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </button>
        </div>

        {/* Center: Explore & Mobile Chat Trigger */}
        <div className="flex flex-col items-center gap-1.5 pb-0.5">
          <button
            type="button"
            onClick={() => setMobileChatOpen((v) => !v)}
            className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-[#090e1c]/90 px-2.5 py-1 font-mono text-[10px] sm:text-[11px] font-semibold text-cyan-300 backdrop-blur-md shadow-lg active:scale-95 transition-all"
          >
            <MessageSquare className="h-3 w-3 text-cyan-400" />
            <span>Chat / Emote</span>
          </button>
          <a
            href="#about"
            className="flex items-center gap-1 rounded-full border border-cyan-400/40 bg-black/75 px-3 py-1 font-mono text-[10px] sm:text-[11px] font-bold text-cyan-300 backdrop-blur-md shadow-md active:scale-95 transition-all hover:text-white"
          >
            <span>Scroll Bawah &darr;</span>
          </a>
        </div>

        {/* Right: Action Buttons (Punch & Jump) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onPointerDown={triggerPunch}
            className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border border-rose-500/50 bg-gradient-to-br from-rose-600 to-amber-600 text-white shadow-xl shadow-rose-950/50 active:scale-90 transition-transform"
            aria-label="Punch"
            title="Punch"
          >
            <span className="text-lg sm:text-xl">🥊</span>
          </button>
          <button
            onPointerDown={() => handleTouch("jump", true)}
            onPointerUp={() => handleTouch("jump", false)}
            onPointerLeave={() => handleTouch("jump", false)}
            className="flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-600 to-indigo-600 text-white shadow-xl shadow-cyan-950/50 active:scale-90 transition-transform"
            aria-label="Jump / Salto"
            title="Jump / Salto"
          >
            <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-200" />
          </button>
        </div>
      </div>

      {/* Mobile Chat & Emotes Drawer */}
      {mobileChatOpen && (
        <div className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-sm rounded-2xl border border-cyan-500/40 bg-[#090d1a]/95 p-3.5 shadow-2xl backdrop-blur-2xl md:hidden animate-in fade-in duration-200">
          <div className="mb-2 flex items-center justify-between pb-1.5 border-b border-white/10">
            <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
              Visitor Chat &amp; Emotes
            </span>
            <button
              onClick={() => setMobileChatOpen(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Chips */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {["Halo bro! 👋", "Ayo spar 🥊", "Keren portofolionya! ✨", "Gas mabar 🚀", "Salto! 🤸"].map((msg) => (
              <button
                key={msg}
                onClick={() => {
                  handleSendChat(msg);
                  setMobileChatOpen(false);
                }}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-cyan-500/20 active:scale-95"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (chatText.trim()) {
                handleSendChat(chatText);
                setMobileChatOpen(false);
              }
            }}
            className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-black/60 p-1 pl-3"
          >
            <input
              type="text"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Ketik chat..."
              maxLength={80}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none font-sans"
            />
            <button
              type="submit"
              disabled={!chatText.trim()}
              className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-black disabled:opacity-40"
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      {/* Pop-up Modal: Character Customization & Username Input */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border border-cyan-500/40 bg-[#0a0e1c] p-5 sm:p-6 shadow-2xl shadow-cyan-950/60 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Kustomisasi Karakter Avatar</h3>
                  <p className="text-[11px] text-slate-400">Atur username &amp; armor kamu di Metaverse</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputName.trim()) {
                  updateLocalPlayerProfile(inputName.trim(), selectedColor, selectedAccent);
                  sessionStorage.setItem("portfolio_name_set", "true");
                  setShowNameModal(false);
                }
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                  Nama Karakter / Nickname:
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Contoh: Alex, CyberNinja, Naufal, dsb."
                  maxLength={18}
                  required
                  autoFocus
                  className="w-full rounded-xl border border-cyan-500/30 bg-black/70 px-4 py-2.5 text-sm text-cyan-200 placeholder-slate-600 outline-none focus:border-cyan-400 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">
                  Pilih Warna Armor Exoskeleton:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PALETTES.map((p) => {
                    const isSel = selectedColor === p.color;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setSelectedColor(p.color);
                          setSelectedAccent(p.accent);
                        }}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
                          isSel
                            ? "border-cyan-400 bg-cyan-500/20 shadow-lg scale-105"
                            : "border-white/5 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full shadow-md"
                          style={{ backgroundColor: p.color, border: `1.5px solid ${p.accent}` }}
                        />
                        <span className="text-[10px] font-mono text-slate-300">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-cyan-500/25 transition-all hover:brightness-110 active:scale-95"
                >
                  🚀 Masuk &amp; Simpan Karakter
                </button>
                {typeof window !== "undefined" && localStorage.getItem("portfolio_custom_username") && (
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STATIC FALLBACK (No WebGL)
============================================================ */
function StaticFallback() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center bg-[#0b0e18] px-6 md:px-16">
      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="text-[10px] uppercase tracking-[0.45em] text-cyan-400">
          Frontend Engineer &bull; Naufal Maulana
        </p>
        <h1 className="mt-4 text-5xl font-black leading-[0.85] tracking-[-0.04em] text-white md:text-8xl">
          CRAFTING
          <br />
          <span className="text-white/30">THE FUTURE WEB</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/50 md:text-lg">
          Specializing in modern interactive frontend architectures, UI/UX design systems,
          and production AI automation solutions.
        </p>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {landmarks.map((lm) => (
            <a
              key={lm.id}
              href={lm.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-all hover:border-white/25 hover:bg-white/[0.06]"
            >
              <span
                className="relative text-sm font-bold uppercase tracking-[0.2em]"
                style={{ color: lm.color }}
              >
                {lm.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN EXPORT
============================================================ */
export function WorldExperience() {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      setSupported(hasWebGL());
    }, 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="top" className="relative h-svh min-h-[620px] w-full overflow-hidden bg-[#0b0e18]">
      {!mounted ? (
        <div className="absolute inset-0 bg-[#0b0e18]" />
      ) : supported ? (
        <WorldHero />
      ) : (
        <StaticFallback />
      )}
    </section>
  );
}
