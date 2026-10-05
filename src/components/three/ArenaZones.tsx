"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ============================================================
   PROCEDURAL SOUND SYNTHESIZERS (Web Audio API - Zero Asset Download)
============================================================ */

// Shared AudioContext singleton across the metaverse
let sharedAudioCtx: AudioContext | null = null;
function getSharedAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Procedural electronic synthesizer for the Cyber DJ Synth Pad
 */
export function playSynthPadNote(frequency: number, isMuted: boolean = false) {
  if (isMuted || typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    // Dual oscillator blend (Sawtooth for sci-fi bite + Sine for deep warmth)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(frequency, ctx.currentTime);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(frequency * 1.003, ctx.currentTime); // Chorus detune

    // Warm resonant sweep filter
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.08);
    filter.frequency.exponentialRampToValueAtTime(380, ctx.currentTime + 0.65);
    filter.Q.setValueAtTime(3.5, ctx.currentTime);

    // Smooth ADSR envelope
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.24, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.75);
    osc2.stop(ctx.currentTime + 0.75);
  } catch {
    // Autoplay audio policy safe fallback
  }
}

/**
 * Procedural spatial warp sound effect for Teleportation
 */
export function playTeleportSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    // High sweep downward + sub bass pulse
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(980, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.38);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.38);
    filter.Q.setValueAtTime(4.0, ctx.currentTime);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
}

/**
 * Punch sound synthesizer (backward compatibility)
 */
export function playPunchSound() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch {}
}

/* ============================================================
   CANVAS TEXTURE BUILDERS (100% Native WebGL - Zero Floating DOM)
============================================================ */

export const TELEPORT_DESTINATIONS = [
  {
    id: "parkour",
    name: "Sektor 1: Sky Parkour (NW)",
    badge: "NW Tower Apex Summit",
    icon: "🧗",
    pos: [-45.0, 1.15, 45.0] as [number, number, number],
    color: "#38bdf8",
  },
  {
    id: "boxing",
    name: "Sektor 2: Boxing Ring (SW)",
    badge: "SW Tower Sparring Arena",
    icon: "🥊",
    pos: [-45.0, 1.15, -45.0] as [number, number, number],
    color: "#ef4444",
  },
  {
    id: "citadel",
    name: "Sektor 3: Tech Citadel (SE)",
    badge: "SE Tower Spire Tower",
    icon: "🗼",
    pos: [45.0, 1.25, -45.0] as [number, number, number],
    color: "#a855f7",
  },
  {
    id: "djpad",
    name: "Sektor 4: DJ Synth Pad (NE)",
    badge: "NE Tower Audio Lounge",
    icon: "🎵",
    pos: [45.0, 1.15, 45.0] as [number, number, number],
    color: "#ec4899",
  },
  {
    id: "nexus",
    name: "Sektor Utama: Center Nexus",
    badge: "Pusat Metaverse & Hub",
    icon: "📍",
    pos: [0.0, 0.2, 1.8] as [number, number, number],
    color: "#06b6d4",
  },
];

function createKioskTexture(selectedId: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = "#070b16";
  ctx.fillRect(0, 0, 512, 512);

  // Outer border
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 496);

  // Header bar
  ctx.fillStyle = "#0e172a";
  ctx.fillRect(12, 12, 488, 64);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 25px monospace";
  ctx.fillText("⚡ TELEPORT KIOSK", 28, 50);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "14px monospace";
  ctx.fillText("CLICK TO SELECT", 320, 50);

  // 5 Destination buttons
  TELEPORT_DESTINATIONS.forEach((d, idx) => {
    const y = 86 + idx * 72;
    const isSel = d.id === selectedId;

    ctx.fillStyle = isSel ? "rgba(56, 189, 248, 0.32)" : "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(24, y, 464, 60);

    ctx.strokeStyle = isSel ? "#38bdf8" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = isSel ? 3 : 1;
    ctx.strokeRect(24, y, 464, 60);

    ctx.fillStyle = isSel ? "#ffffff" : "#cbd5e1";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(`${d.icon}  ${d.name}`, 38, y + 36);

    ctx.fillStyle = isSel ? "#38bdf8" : "#64748b";
    ctx.font = "12px monospace";
    ctx.fillText(isSel ? "● ACTIVE TARGET" : d.badge, 256, y + 36);
  });

  // Footer status bar
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 15px monospace";
  ctx.textAlign = "center";
  ctx.fillText(">>> WALK INTO PORTAL TO WARP <<<", 256, 480);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}


function createDJMuteTexture(isMuted: boolean, note: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep cyber background
  ctx.fillStyle = "#070b16";
  ctx.fillRect(0, 0, 512, 512);

  // Outer border
  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 496);

  // Header Bar
  ctx.fillStyle = "#16091c";
  ctx.fillRect(14, 14, 484, 76);
  ctx.fillStyle = "#ec4899";
  ctx.font = "bold 26px monospace";
  ctx.fillText("🎧 DJ SOUNDBOARD", 30, 56);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 14px monospace";
  ctx.fillText("SYNTH PAD V2", 340, 56);

  // Main Interactive Mute / Unmute Button Box
  const btnColor = isMuted ? "#ef4444" : "#10b981";
  const btnBg = isMuted ? "rgba(239, 68, 68, 0.22)" : "rgba(16, 185, 129, 0.25)";
  ctx.fillStyle = btnBg;
  ctx.fillRect(24, 106, 464, 130);
  ctx.strokeStyle = btnColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 106, 464, 130);

  // Button Status Text
  ctx.fillStyle = btnColor;
  ctx.font = "900 32px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(isMuted ? "🔇 AUDIO : MUTED" : "🔊 AUDIO : ACTIVE", 256, 160);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px monospace";
  ctx.fillText(isMuted ? "[ KLIK DISINI UNTUK AKTIFKAN ]" : "[ KLIK DISINI UNTUK MUTE ]", 256, 204);

  // Live Note & Frequency Display Box
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(24, 252, 464, 120);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 252, 464, 120);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 14px monospace";
  ctx.textAlign = "left";
  ctx.fillText("NADA TERAKHIR DIMAINKAN:", 44, 284);

  ctx.fillStyle = "#facc15";
  ctx.font = "bold 28px monospace";
  ctx.fillText(`🎶 NOTE: [ ${note} ]`, 44, 330);

  // Stage Guide Footer
  ctx.fillStyle = "#1e1b4b";
  ctx.fillRect(24, 388, 464, 96);
  ctx.strokeStyle = "#a855f7";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 388, 464, 96);

  ctx.fillStyle = "#ec4899";
  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⚡ PANDUAN ARENA DJ:", 256, 422);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px monospace";
  ctx.fillText("Lompat / Injak 16 Neon Pad di Lantai", 256, 452);
  ctx.fillText("Untuk Menghasilkan Nada Sci-Fi Ambient", 256, 472);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ============================================================
   1. KOTAK UTAMA (x: 0, z: -15.0)
   KONSEP: "Cyber Tech Citadel / Spire Tower"
   - Papan Quick Hire dihilangkan sepenuhnya (Zero floating DOM)
   - Model 3D Amplop & WhatsApp dihilangkan
   - Diganti Model 3D Berbagai Tech Stack (React, Next.js, TypeScript, Python, Three.js, Node.js)
   - Tower Megah dengan Skyward Light Beam & Rotating Tech Arsenal
============================================================ */

export function CyberContactBeacon({
  carState,
  position = [45.0, 1.0, -45.0],
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  position?: [number, number, number];
}) {
  const [isNearby, setIsNearby] = useState(false);
  const techRingRef = useRef<THREE.Group>(null);
  const beaconRingsRef = useRef<THREE.Group>(null);
  const spireCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const p = carState.current.pos;
    const dist = Math.hypot(p.x - position[0], p.z - position[2]);
    const nearby = dist < 5.5 && p.y >= 0.75;
    if (nearby !== isNearby) {
      setIsNearby(nearby);
    }

    // Orbit 3D Tech Stacks around the central tower
    if (techRingRef.current) {
      techRingRef.current.rotation.y += delta * 0.45;
    }

    // Animate central spire core
    if (spireCoreRef.current) {
      spireCoreRef.current.rotation.y -= delta * 0.8;
      spireCoreRef.current.position.y =
        3.2 + Math.sin(state.clock.elapsedTime * 2.5) * 0.12;
    }

    // Rotate platform energy runes
    if (beaconRingsRef.current) {
      beaconRingsRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Skyward Light Beam (Translucent Cylinder reaching into clouds) */}
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.8, 1.6, 24, 24, 1, true]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={isNearby ? 0.38 : 0.18}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 12, 0]}>
        <cylinderGeometry args={[0.25, 0.45, 24, 16, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={isNearby ? 0.65 : 0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Stage Spotlight */}
      <spotLight
        position={[0, 10.5, 0]}
        target-position={[0, 0, 0]}
        angle={0.65}
        penumbra={0.7}
        intensity={isNearby ? 45 : 18}
        distance={20}
        color="#c084fc"
      />

      {/* Runic Energy Rings on Platform Floor */}
      <group ref={beaconRingsRef} position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.15, 48]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 2.92, 48]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.48, 48]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.5} />
        </mesh>
      </group>

      {/* ============================================================
          CENTRAL TOWER STRUCTURE (Multi-Tier Hexagonal Cyber Spire)
      ============================================================ */}
      {/* Tier 1: Lower Pedestal */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[1.0, 1.4, 1.2, 6]} />
        <meshStandardMaterial
          color="#080c18"
          metalness={0.92}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[1.02, 1.42, 1.22, 6]} />
        <meshBasicMaterial color="#a855f7" wireframe />
      </mesh>

      {/* Tier 2: Mid Column Spire */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 1.2, 6]} />
        <meshStandardMaterial
          color="#0d1424"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <cylinderGeometry args={[0.56, 0.86, 1.22, 6]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>

      {/* Tier 3: Upper Conduit Neck */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 0.8, 8]} />
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#a855f7"
          emissiveIntensity={1.2}
          metalness={0.9}
        />
      </mesh>

      {/* Spire Floating Crystal Core (Floating & Spinning) */}
      <mesh ref={spireCoreRef} position={[0, 3.2, 0]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={isNearby ? 4.5 : 2.5}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <pointLight
        color="#c084fc"
        intensity={isNearby ? 6.5 : 3.5}
        distance={7}
        position={[0, 3.2, 0]}
      />

      {/* Outer Orbit Ring Gyroscope */}
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[0.7, 0.02, 8, 36]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>

      {/* ============================================================
          3D TECH STACKS (Pure WebGL Meshes - Zero Floating DOM)
          - React (Atomic Orbit Rings)
          - Next.js (Black Prism Monolith)
          - TypeScript (Blue Cyber Cube)
          - Python (Twin Yellow/Blue Twist)
          - Three.js (Golden Wireframe Icosahedron)
          - Node.js (Green Hexagon Crystal)
      ============================================================ */}
      <group ref={techRingRef} position={[0, 2.0, 0]}>
        {/* 1. REACT 3D ATOM (Angle: 0) */}
        <group position={[2.5, 0, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.2, 16, 14]} />
            <meshStandardMaterial
              color="#00d8ff"
              emissive="#00d8ff"
              emissiveIntensity={3.2}
            />
          </mesh>
          <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.42, 0.016, 8, 32]} />
            <meshBasicMaterial color="#00d8ff" />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.42, 0.016, 8, 32]} />
            <meshBasicMaterial color="#00d8ff" />
          </mesh>
          <mesh rotation={[-Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.42, 0.016, 8, 32]} />
            <meshBasicMaterial color="#00d8ff" />
          </mesh>
        </group>

        {/* 2. NEXT.JS 3D MONOLITH (Angle: 60 deg) */}
        <group position={[1.25, 0, 2.16]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.28, 0.52, 6]} />
            <meshStandardMaterial
              color="#000000"
              emissive="#ffffff"
              emissiveIntensity={0.8}
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.29, 0.29, 0.54, 6]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
        </group>

        {/* 3. TYPESCRIPT 3D CUBE (Angle: 120 deg) */}
        <group position={[-1.25, 0, 2.16]}>
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshStandardMaterial
              color="#3178c6"
              emissive="#3178c6"
              emissiveIntensity={2.8}
              metalness={0.8}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.41, 0.41, 0.41]} />
            <meshBasicMaterial color="#60a5fa" wireframe />
          </mesh>
        </group>

        {/* 4. PYTHON 3D TWIST (Angle: 180 deg) */}
        <group position={[-2.5, 0, 0]}>
          <mesh position={[0, 0.11, 0]} castShadow>
            <boxGeometry args={[0.36, 0.22, 0.36]} />
            <meshStandardMaterial
              color="#3776ab"
              emissive="#3776ab"
              emissiveIntensity={2.2}
            />
          </mesh>
          <mesh position={[0, -0.11, 0]} castShadow>
            <boxGeometry args={[0.36, 0.22, 0.36]} />
            <meshStandardMaterial
              color="#ffd43b"
              emissive="#ffd43b"
              emissiveIntensity={2.4}
            />
          </mesh>
        </group>

        {/* 5. THREE.JS 3D ICOSAHEDRON (Angle: 240 deg) */}
        <group position={[-1.25, 0, -2.16]}>
          <mesh castShadow>
            <icosahedronGeometry args={[0.28, 0]} />
            <meshStandardMaterial
              color="#f43f5e"
              emissive="#f43f5e"
              emissiveIntensity={3.0}
              metalness={0.9}
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.29, 0]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
        </group>

        {/* 6. NODE.JS 3D HEXAGON (Angle: 300 deg) */}
        <group position={[1.25, 0, -2.16]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.38, 6]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={2.8}
              metalness={0.8}
            />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.27, 0.27, 0.4, 6]} />
            <meshBasicMaterial color="#86efac" wireframe />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ============================================================
   2. KOTAK KANAN (x: 14.0, z: 0.0)
   KONSEP: "Cyber Soundboard / DJ Synth Pad"
   - 4x4 (16 Grid) Interactive Neon Synth Pads
   - Setiap avatar menginjak/melompat di atasnya -> menghasilkan nada synth ambient sci-fi
   - Tombol Mute / Unmute PATEN pada meja konsol (100% WebGL 3D Mesh)
============================================================ */

const DJ_PAD_GRID = [
  // Row 0: Deep Sub & Bass Chords (Purple Palette)
  [
    { id: 0, label: "SUB C2", freq: 65.41, note: "C2", color: "#a855f7" },
    { id: 1, label: "BASS D#2", freq: 77.78, note: "D#2", color: "#c084fc" },
    { id: 2, label: "BASS F2", freq: 87.31, note: "F2", color: "#e879f9" },
    { id: 3, label: "BASS G2", freq: 98.0, note: "G2", color: "#f43f5e" },
  ],
  // Row 1: Warm Ambient Synth Pads (Cyan Palette)
  [
    { id: 4, label: "PAD C3", freq: 130.81, note: "C3", color: "#06b6d4" },
    { id: 5, label: "PAD D#3", freq: 155.56, note: "D#3", color: "#38bdf8" },
    { id: 6, label: "PAD F3", freq: 174.61, note: "F3", color: "#60a5fa" },
    { id: 7, label: "PAD G3", freq: 196.0, note: "G3", color: "#818cf8" },
  ],
  // Row 2: Melodic Pluck & Chords (Emerald Palette)
  [
    { id: 8, label: "PLUCK A#3", freq: 233.08, note: "A#3", color: "#10b981" },
    { id: 9, label: "PLUCK C4", freq: 261.63, note: "C4", color: "#34d399" },
    { id: 10, label: "PLUCK D#4", freq: 311.13, note: "D#4", color: "#4ade80" },
    { id: 11, label: "PLUCK F4", freq: 349.23, note: "F4", color: "#a3e635" },
  ],
  // Row 3: Cyber High Leads (Solar / Pink Palette)
  [
    { id: 12, label: "LEAD G4", freq: 392.0, note: "G4", color: "#facc15" },
    { id: 13, label: "LEAD A#4", freq: 466.16, note: "A#4", color: "#fb923c" },
    { id: 14, label: "LEAD C5", freq: 523.25, note: "C5", color: "#f43f5e" },
    { id: 15, label: "LEAD D#5", freq: 622.25, note: "D#5", color: "#ec4899" },
  ],
];

export function CyberDJSynthPad({
  carState,
  position = [45.0, 0.9, 45.0],
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  position?: [number, number, number];
}) {
  const [activePadId, setActivePadId] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [lastNotePlayed, setLastNotePlayed] = useState<string>("READY");

  const lastPadRef = useRef<number | null>(null);
  const djVinylRef = useRef<THREE.Mesh>(null);
  const eqBarsRef = useRef<THREE.Group>(null);

  // Dynamic canvas texture for the 3D Mute/Unmute console screen
  const muteScreenTex = useMemo(
    () => createDJMuteTexture(isMuted, lastNotePlayed),
    [isMuted, lastNotePlayed]
  );

  // Trigger Pad Note
  const triggerPad = (pad: { id: number; note: string; freq: number }) => {
    setActivePadId(pad.id);
    setLastNotePlayed(pad.note);
    playSynthPadNote(pad.freq, isMuted);
    setTimeout(() => {
      setActivePadId((cur) => (cur === pad.id ? null : cur));
    }, 280);
  };

  // Step detection: check if avatar steps onto any of the 16 pads
  useFrame((state, delta) => {
    const p = carState.current.pos;
    const onStage =
      Math.abs(p.x - position[0]) <= 4.5 &&
      Math.abs(p.z - position[2]) <= 4.0 &&
      p.y >= 0.65;

    if (onStage) {
      const relX = p.x - position[0];
      const relZ = p.z - position[2];

      // Centered dance floor pads (cIdx: 0..3, rIdx: 0..3)
      const col = Math.floor((relX + 2.94) / 1.32);
      const row = Math.floor((relZ + 2.64) / 1.32);

      if (row >= 0 && row < 4 && col >= 0 && col < 4) {
        const pad = DJ_PAD_GRID[row][col];
        if (pad && pad.id !== lastPadRef.current) {
          lastPadRef.current = pad.id;
          triggerPad(pad);
        }
      } else {
        lastPadRef.current = null;
      }
    } else {
      lastPadRef.current = null;
    }

    // Rotate DJ Hologram Vinyl
    if (djVinylRef.current) {
      djVinylRef.current.rotation.z += delta * (isMuted ? 0.3 : 2.5);
    }

    // Animate Equalizer Bars
    if (eqBarsRef.current) {
      eqBarsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const targetScaleY = isMuted
          ? 0.2
          : 0.3 +
            Math.abs(Math.sin(state.clock.elapsedTime * 6 + i * 0.8)) * 1.5;
        mesh.scale.y = THREE.MathUtils.damp(
          mesh.scale.y,
          targetScaleY,
          10,
          delta
        );
      });
    }
  });

  return (
    <group position={position}>
      {/* 4 Corner Neon DJ Towers (Lampu Arena pada platform diperluas 9.0 x 8.0) */}
      {[
        [-4.1, -3.6],
        [4.1, -3.6],
        [-4.1, 3.6],
        [4.1, 3.6],
      ].map(([px, pz], idx) => (
        <group key={idx} position={[px, 0, pz]}>
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 1.8, 12]} />
            <meshStandardMaterial
              color="#090d16"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 1.85, 0]}>
            <sphereGeometry args={[0.13, 16, 14]} />
            <meshStandardMaterial
              color="#ec4899"
              emissive="#ec4899"
              emissiveIntensity={3.5}
            />
          </mesh>
        </group>
      ))}

      {/* 4x4 Grid of Interactive Neon Synth Pads (Spacious Dance Floor) */}
      <group position={[0, 0.02, 0]}>
        {DJ_PAD_GRID.map((row, rIdx) =>
          row.map((pad, cIdx) => {
            const posX = (cIdx - 1.5) * 1.32 - 0.3;
            const posZ = (rIdx - 1.5) * 1.32;
            const isActive = activePadId === pad.id;

            return (
              <group
                key={pad.id}
                position={[posX, 0, posZ]}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  triggerPad(pad);
                }}
              >
                {/* Pad Base */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[1.15, 1.15]} />
                  <meshStandardMaterial
                    color={isActive ? "#ffffff" : "#0a0e1c"}
                    emissive={pad.color}
                    emissiveIntensity={isActive ? 4.0 : 0.4}
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>

                {/* Glowing Pad Neon Frame */}
                <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.48, 0.55, 4]} />
                  <meshBasicMaterial
                    color={pad.color}
                    wireframe
                  />
                </mesh>

                {/* Emissive center pulse circle */}
                <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.22, 16]} />
                  <meshStandardMaterial
                    color={pad.color}
                    emissive={pad.color}
                    emissiveIntensity={isActive ? 5.0 : 1.2}
                  />
                </mesh>

                {/* Active Impact Light Flash */}
                {isActive && (
                  <pointLight
                    color={pad.color}
                    intensity={6}
                    distance={3.5}
                    position={[0, 0.5, 0]}
                  />
                )}
              </group>
            );
          })
        )}
      </group>

      {/* ============================================================
          CONCERT DJ STAGE BACKDROP (LEGA DI BELAKANG - TIDAK NEMPEL TOMBOL)
          - Meja DJ di belakang panggung (x: 3.5) berjarak >1.2 meter dari tombol
          - Dual speaker towers di sudut panggung (z: ±3.2)
          - 100% PATEN grounded ke lantai deck
      ============================================================ */}
      <group position={[3.5, 0.0, 0.0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Heavy Industrial Base Feet */}
        <mesh position={[-1.4, 0.05, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.7]} />
          <meshStandardMaterial color="#060913" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[1.4, 0.05, 0]} castShadow>
          <boxGeometry args={[0.6, 0.1, 0.7]} />
          <meshStandardMaterial color="#060913" metalness={0.95} roughness={0.2} />
        </mesh>

        {/* Main Solid Console Body */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[3.6, 0.9, 0.6]} />
          <meshStandardMaterial
            color="#090d16"
            metalness={0.92}
            roughness={0.2}
          />
        </mesh>
        {/* Neon Front Accent Trim */}
        <mesh position={[0, 0.45, 0.305]}>
          <planeGeometry args={[3.5, 0.78]} />
          <meshBasicMaterial color="#ec4899" wireframe />
        </mesh>

        {/* Spinning Holographic DJ Vinyl (Mounted on Console Desk) */}
        <mesh
          ref={djVinylRef}
          position={[-0.9, 0.92, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.08, 0.38, 32]} />
          <meshStandardMaterial
            color="#ec4899"
            emissive="#ec4899"
            emissiveIntensity={2.5}
            metalness={0.9}
          />
        </mesh>

        {/* 3D Equalizer Bars (Mounted on Console Desk) */}
        <group ref={eqBarsRef} position={[0.4, 1.05, 0]}>
          {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8].map((bx, bIdx) => (
            <mesh key={bIdx} position={[bx, 0, 0]}>
              <boxGeometry args={[0.12, 0.4, 0.08]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={2.5}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* Dual Rear Concert Subwoofer Towers (Di Sudut Belakang Jauh Dari Tombol) */}
      {[-3.2, 3.2].map((zPos, idx) => (
        <group key={idx} position={[3.5, 0.0, zPos]}>
          {/* Speaker Base Column */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <boxGeometry args={[0.8, 1.8, 0.8]} />
            <meshStandardMaterial color="#080c18" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Subwoofer Cones */}
          <mesh position={[-0.41, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.26, 16]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.8} />
          </mesh>
          <mesh position={[-0.41, 1.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
            <circleGeometry args={[0.26, 16]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}

      {/* ============================================================
          PAPAN ARENA DJ: INTERACTIVE DJ SOUNDBOARD KIOSK (100% PATEN)
          - Diletakkan di BAWAH arena (y: -0.75 pada lantai dasar arena)
          - Berdiri MAJU di depan lampu arena sudut (x: -5.8, z: -3.5)
          - Berjarak 1.3 meter dari dinding arena (tidak nempel arena sama sekali!)
          - Miring 40 derajat (Math.PI / 4.5) menghadap ke arah pengunjung
          - Menampilkan Status Audio, tombol klik Mute/Unmute, Nada live, & Panduan
      ============================================================ */}
      <group position={[-5.8, -0.75, -3.5]} rotation={[0, -Math.PI / 4.5, 0]}>
        {/* Heavy Ground Base Plate resting on Main Arena Floor */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.75, 0.12, 8]} />
          <meshStandardMaterial color="#080d1a" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.66, 0.76, 0.13, 8]} />
          <meshBasicMaterial color="#ec4899" wireframe />
        </mesh>

        {/* Dual Industrial Structural Columns */}
        <mesh position={[-0.28, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0.28, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Rear Cable Conduit Trunking into Floor */}
        <mesh position={[0, 0.45, -0.06]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>

        {/* Angled Monitor Bezel (Ergonomic 22-degree tilt for avatars on ground) */}
        <mesh position={[0, 1.25, 0.06]} rotation={[-0.38, 0, 0]} castShadow>
          <boxGeometry args={[1.65, 1.45, 0.1]} />
          <meshStandardMaterial
            color="#070b16"
            metalness={0.94}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.25, 0.112]} rotation={[-0.38, 0, 0]}>
          <planeGeometry args={[1.67, 1.47]} />
          <meshBasicMaterial color={isMuted ? "#ef4444" : "#ec4899"} wireframe />
        </mesh>

        {/* 3D Physical Screen Surface with CanvasTexture */}
        <group position={[0, 1.25, 0.114]} rotation={[-0.38, 0, 0]}>
          <mesh>
            <planeGeometry args={[1.56, 1.36]} />
            <meshBasicMaterial map={muteScreenTex} toneMapped={false} />
          </mesh>

          {/* Clickable Area Over Entire Screen to Toggle Mute */}
          <mesh
            position={[0, 0, 0.01]}
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsMuted((prev) => !prev);
            }}
          >
            <planeGeometry args={[1.56, 1.36]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        {/* Kiosk Terminal Beacon Light */}
        <pointLight
          color={isMuted ? "#ef4444" : "#ec4899"}
          intensity={4.0}
          distance={4.5}
          position={[0, 1.8, 0.2]}
        />
      </group>
    </group>
  );
}

/* ============================================================
   3. KOTAK KIRI (x: -14.0, z: 0.0)
   KONSEP: "Live Mini-Map / Teleport Station"
   - Portal Energi Berputar Vertikal (Stargate)
   - Jalur tengah portal 100% TERBUKA dan PLONG
   - Papan selector dipindahkan ke samping portal secara miring (x: 2.35, z: 0.6)
   - Papan selector 100% PATEN (WebGL CanvasTexture pada monitor pedestal)
   - ZERO floating DOM HTML: Karakter tidak akan pernah tertutup papan!
============================================================ */

export function CyberTeleportStation({
  carState,
  position = [-14.0, 0.75, 0.0],
  rotation = [0, Math.PI / 2, 0],
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [selectedDestId, setSelectedDestId] = useState("parkour");
  const [warpFlash, setWarpFlash] = useState(false);
  const lastTeleportRef = useRef(0);

  const vortexRingRef = useRef<THREE.Group>(null);
  const energyFieldRef = useRef<THREE.Mesh>(null);

  const currentDest = useMemo(
    () =>
      TELEPORT_DESTINATIONS.find((d) => d.id === selectedDestId) ||
      TELEPORT_DESTINATIONS[0],
    [selectedDestId]
  );

  // Dynamic canvas textures for the 3D Kiosk Screen
  const kioskTex = useMemo(
    () => createKioskTexture(selectedDestId),
    [selectedDestId]
  );

  // Portal animation & Entry Detection
  useFrame((state, delta) => {
    // Spin outer vortex ring
    if (vortexRingRef.current) {
      vortexRingRef.current.rotation.z += delta * 2.2;
    }
    // Pulse energy field
    if (energyFieldRef.current) {
      const scale = 1.0 + Math.sin(state.clock.elapsedTime * 6) * 0.06;
      energyFieldRef.current.scale.set(scale, scale, 1);
    }

    // Portal center at position
    const p = carState.current.pos;
    const distToPortal = Math.hypot(p.x - position[0], p.z - position[2]);

    // If player walks into the center of the vertical portal
    if (distToPortal < 1.35 && Math.abs(p.y - (position[1] + 1.15)) < 1.6) {
      const now = Date.now();
      if (now - lastTeleportRef.current > 2200) {
        lastTeleportRef.current = now;

        // Sound effect
        playTeleportSound();

        // Warp screen animation
        setWarpFlash(true);
        setTimeout(() => setWarpFlash(false), 450);

        // Execute Instant Teleportation!
        const [tx, ty, tz] = currentDest.pos;
        carState.current.pos.set(tx, ty, tz);
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* 3D Vertical Stargate Frame Structure */}
      <group position={[0, 1.9, 0]}>
        {/* Outer Heavy Industrial Metal Ring */}
        <mesh castShadow>
          <torusGeometry args={[1.85, 0.18, 16, 40]} />
          <meshStandardMaterial
            color="#080d1a"
            metalness={0.92}
            roughness={0.15}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[1.88, 0.19, 16, 40]} />
          <meshBasicMaterial color={currentDest.color} wireframe />
        </mesh>

        {/* 6 Outer Glowing Chevron Nodes */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = Math.cos(rad) * 1.85;
          const cy = Math.sin(rad) * 1.85;
          return (
            <mesh key={i} position={[cx, cy, 0]}>
              <boxGeometry args={[0.22, 0.22, 0.26]} />
              <meshStandardMaterial
                color={currentDest.color}
                emissive={currentDest.color}
                emissiveIntensity={3.5}
              />
            </mesh>
          );
        })}

        {/* Inner Counter-Rotating Vortex Ring */}
        <group ref={vortexRingRef}>
          <mesh>
            <ringGeometry args={[0.3, 1.68, 36]} />
            <meshBasicMaterial
              color={currentDest.color}
              transparent
              opacity={0.75}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <ringGeometry args={[0.8, 1.5, 6]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
        </group>

        {/* Pulsing Energy Singularity Core */}
        <mesh ref={energyFieldRef} position={[0, 0, 0]}>
          <circleGeometry args={[1.65, 36]} />
          <meshBasicMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Portal Illumination Light */}
        <pointLight
          color={currentDest.color}
          intensity={warpFlash ? 15 : 5.5}
          distance={8}
          position={[0, 0, 0.8]}
        />
        <pointLight
          color="#38bdf8"
          intensity={warpFlash ? 15 : 5.5}
          distance={8}
          position={[0, 0, -0.8]}
        />
      </group>

      {/* Support Platform Struts (Firmly grounded to platform deck) */}
      <mesh position={[-1.7, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.8, 12]} />
        <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.7, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.8, 12]} />
        <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ============================================================
          PORTAL POWER REACTOR GENERATOR (LEFT SIDE - 100% PATEN)
          - Generator daya Stargate tertanam kokoh di lantai platform
      ============================================================ */}
      <group position={[2.35, 0.0, 0.1]}>
        {/* Floor Mounting Base */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.12, 8]} />
          <meshStandardMaterial color="#080d1a" metalness={0.92} roughness={0.2} />
        </mesh>
        {/* Reactor Column */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.35, 1.05, 8]} />
          <meshStandardMaterial color="#0b1222" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.27, 0.36, 1.06, 8]} />
          <meshBasicMaterial color={currentDest.color} wireframe />
        </mesh>
        {/* Pulsing Energy Core */}
        <mesh position={[0, 1.3, 0]}>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial
            color={currentDest.color}
            emissive={currentDest.color}
            emissiveIntensity={3.5}
          />
        </mesh>
        {/* Ground Conduit Pipe connecting to portal frame */}
        <mesh position={[-0.35, 0.08, -0.05]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} />
        </mesh>
      </group>

      {/* ============================================================
          INTERACTIVE DESTINATION KIOSK (PATEN 3D MONITOR ON SIDE PEDESTAL)
          - Dimajukan ke depan samping portal (x: -2.4, z: 1.95) agar tidak nempel portal
          - Rotasi miring 53 derajat (Math.PI / 3.4) menyambut pengunjung yang naik ke platform
          - 100% PATEN: Bertumpu kokoh dari lantai deck dengan tiang pylon ganda
          - Layar 100% WebGL CanvasTexture PATEN pada bezel monitor
          - Klik pada 5 tombol baris destinasi langsung mengubah target!
          - ZERO floating DOM HTML: Karakter tidak akan pernah tertutup papan!
      ============================================================ */}
      <group position={[-2.4, 0.0, 1.95]} rotation={[0, Math.PI / 3.4, 0]}>
        {/* Heavy Ground Base Plate on Platform Deck */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.65, 0.75, 0.12, 8]} />
          <meshStandardMaterial color="#080d1a" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.66, 0.76, 0.13, 8]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>

        {/* Dual Industrial Structural Columns */}
        <mesh position={[-0.28, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0.28, 0.52, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.8, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Rear Cable Conduit Trunking into Floor */}
        <mesh position={[0, 0.45, -0.06]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>

        {/* Angled Monitor Bezel (Ergonomic 22-degree tilt for standing avatars) */}
        <mesh position={[0, 1.25, 0.06]} rotation={[-0.38, 0, 0]} castShadow>
          <boxGeometry args={[1.65, 1.45, 0.1]} />
          <meshStandardMaterial
            color="#070b16"
            metalness={0.94}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 1.25, 0.112]} rotation={[-0.38, 0, 0]}>
          <planeGeometry args={[1.67, 1.47]} />
          <meshBasicMaterial color={currentDest.color} wireframe />
        </mesh>

        {/* 3D Physical Screen Surface with CanvasTexture */}
        <group position={[0, 1.25, 0.114]} rotation={[-0.38, 0, 0]}>
          <mesh>
            <planeGeometry args={[1.56, 1.36]} />
            <meshBasicMaterial map={kioskTex} toneMapped={false} />
          </mesh>

          {/* 5 Interactive Clickable Zones on the Screen */}
          {TELEPORT_DESTINATIONS.map((dest, i) => {
            const btnY = 0.38 - i * 0.19;
            return (
              <mesh
                key={dest.id}
                position={[0, btnY, 0.005]}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedDestId(dest.id);
                }}
              >
                <planeGeometry args={[1.44, 0.16]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            );
          })}
        </group>

        {/* Kiosk Terminal Beacon Light */}
        <pointLight
          color={currentDest.color}
          intensity={4.0}
          distance={4.5}
          position={[0, 1.8, 0.2]}
        />
      </group>
    </group>
  );
}

/* ============================================================
   4. SEKTOR SELATAN: CYBER BOXING & SPARRING RING (z: -38.0)
   - Ukuran 10m x 10m, Elevasi panggung 0.9m
   - 4 Steel Corner Posts (Merah, Biru, 2x Netral)
   - 3 Neon Glowing Ropes melingkari ring
   - Overhead suspended floodlight truss dengan 4 downward spotlights
   - 2 Dynamic Sparring Dummies dengan spring recoil physics
   - Interaksi pukulan (Punch [F] / Tombol HP) menghasilkan efek benturan komik
============================================================ */

function createBoxingMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark canvas floor
  ctx.fillStyle = "#0a0f1d";
  ctx.fillRect(0, 0, 1024, 1024);

  // Outer border
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, 984, 984);

  // Red corner (top right)
  ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
  ctx.beginPath();
  ctx.moveTo(1024, 0);
  ctx.lineTo(600, 0);
  ctx.lineTo(1024, 424);
  ctx.closePath();
  ctx.fill();

  // Blue corner (bottom left)
  ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
  ctx.beginPath();
  ctx.moveTo(0, 1024);
  ctx.lineTo(424, 1024);
  ctx.lineTo(0, 600);
  ctx.closePath();
  ctx.fill();

  // Octagon / Circles in center
  ctx.save();
  ctx.translate(512, 512);

  ctx.strokeStyle = "rgba(239, 68, 68, 0.65)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 310, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(59, 130, 246, 0.65)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 340, 0, Math.PI * 2);
  ctx.stroke();

  // Diagonal hash marks
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 2;
  for (let a = -280; a <= 280; a += 40) {
    ctx.beginPath();
    ctx.moveTo(a, -280);
    ctx.lineTo(a + 40, 280);
    ctx.stroke();
  }

  // Ring Center Banner
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 68px system-ui, sans-serif";
  ctx.fillText("🥊 CYBER COMBAT RING 🥊", 0, -45);

  ctx.fillStyle = "#ef4444";
  ctx.font = "bold 32px monospace";
  ctx.fillText("STAND & PUNCH [F] TO SPAR", 0, 30);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 22px monospace";
  ctx.fillText("DYNAMIC SPRING DUMMIES • HIT REACTION", 0, 80);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function CyberBoxingRing({
  carState,
  position = [-45.0, 0.0, -45.0],
  isPunching = false,
  onPunchHit,
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3; rot: number; speed: number }>;
  position?: [number, number, number];
  isPunching?: boolean;
  onPunchHit?: (
    target: string,
    pushDir: [number, number],
    force: number,
    sparkPos: [number, number, number]
  ) => void;
}) {
  const matTex = useMemo(() => createBoxingMatTexture(), []);

  // Sparring Dummy 1 (Blue side: x: -2.2, z: 0)
  const dummy1Ref = useRef<THREE.Group>(null);
  const dummy1Spring = useRef({ angleX: 0, angleZ: 0, velX: 0, velZ: 0 });

  // Sparring Dummy 2 (Red side: x: 2.2, z: 0)
  const dummy2Ref = useRef<THREE.Group>(null);
  const dummy2Spring = useRef({ angleX: 0, angleZ: 0, velX: 0, velZ: 0 });

  const dummyCooldownRef = useRef<{ [key: string]: number }>({});

  useFrame((_, delta) => {
    const dTime = Math.min(delta, 0.1);

    // Damped harmonic spring physics for Dummy 1
    const s1 = dummy1Spring.current;
    s1.velX += (-s1.angleX * 42.0 - s1.velX * 7.5) * dTime;
    s1.velZ += (-s1.angleZ * 42.0 - s1.velZ * 7.5) * dTime;
    s1.angleX += s1.velX * dTime;
    s1.angleZ += s1.velZ * dTime;
    if (dummy1Ref.current) {
      dummy1Ref.current.rotation.x = s1.angleX;
      dummy1Ref.current.rotation.z = s1.angleZ;
    }

    // Damped harmonic spring physics for Dummy 2
    const s2 = dummy2Spring.current;
    s2.velX += (-s2.angleX * 42.0 - s2.velX * 7.5) * dTime;
    s2.velZ += (-s2.angleZ * 42.0 - s2.velZ * 7.5) * dTime;
    s2.angleX += s2.velX * dTime;
    s2.angleZ += s2.velZ * dTime;
    if (dummy2Ref.current) {
      dummy2Ref.current.rotation.x = s2.angleX;
      dummy2Ref.current.rotation.z = s2.angleZ;
    }

    // Punch hit check against dummies
    if (isPunching) {
      const now = Date.now();
      const car = carState.current;
      const pfx = Math.sin(car.rot);
      const pfz = Math.cos(car.rot);
      const fistX = car.pos.x + pfx * 1.15;
      const fistZ = car.pos.z + pfz * 1.15;

      // Check Dummy 1
      const d1Dist = Math.hypot(fistX - (position[0] - 2.2), fistZ - position[2]);
      if (d1Dist < 1.65 && (!dummyCooldownRef.current["d1"] || now - dummyCooldownRef.current["d1"] > 450)) {
        dummyCooldownRef.current["d1"] = now;
        s1.velX += pfz * 16.0;
        s1.velZ -= pfx * 16.0;
        playPunchSound();
        onPunchHit?.("sparring-dummy-blue", [pfx, pfz], 6.0, [position[0] - 2.2, 2.1, position[2]]);
      }

      // Check Dummy 2
      const d2Dist = Math.hypot(fistX - (position[0] + 2.2), fistZ - position[2]);
      if (d2Dist < 1.65 && (!dummyCooldownRef.current["d2"] || now - dummyCooldownRef.current["d2"] > 450)) {
        dummyCooldownRef.current["d2"] = now;
        s2.velX += pfz * 16.0;
        s2.velZ -= pfx * 16.0;
        playPunchSound();
        onPunchHit?.("sparring-dummy-red", [pfx, pfz], 6.0, [position[0] + 2.2, 2.1, position[2]]);
      }
    }
  });

  return (
    <group position={position}>
      {/* Ring Mat Surface Decal */}
      <mesh position={[0, 0.905, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9.7, 9.7]} />
        <meshStandardMaterial map={matTex} roughness={0.35} metalness={0.65} />
      </mesh>

      {/* 4 Corner Steel Posts */}
      {[
        { x: -4.4, z: -4.4, color: "#3b82f6", name: "blue" }, // Blue corner
        { x: 4.4, z: 4.4, color: "#ef4444", name: "red" },    // Red corner
        { x: -4.4, z: 4.4, color: "#94a3b8", name: "white1" },
        { x: 4.4, z: -4.4, color: "#94a3b8", name: "white2" },
      ].map((post, idx) => (
        <group key={`post-${idx}`} position={[post.x, 0.9, post.z]}>
          {/* Vertical steel post column */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 1.5, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Post glowing cap */}
          <mesh position={[0, 1.55, 0]}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={post.color} emissive={post.color} emissiveIntensity={2.5} />
          </mesh>
          {/* Corner turnbuckle protective pad */}
          <mesh position={[-Math.sign(post.x) * 0.15, 0.75, -Math.sign(post.z) * 0.15]} castShadow>
            <boxGeometry args={[0.24, 1.4, 0.24]} />
            <meshStandardMaterial color={post.color} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 3 Perimeter Neon Ropes */}
      {[1.25, 1.55, 1.85].map((ropeY, rIdx) => {
        const ropeColor = rIdx === 0 ? "#38bdf8" : rIdx === 1 ? "#ef4444" : "#ec4899";
        return (
          <group key={`rope-tier-${rIdx}`}>
            {/* North rope (between X: -4.4 and +4.4 at Z: +4.4) */}
            <mesh position={[0, ropeY, 4.4]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 8.8, 12]} />
              <meshStandardMaterial color={ropeColor} emissive={ropeColor} emissiveIntensity={1.5} />
            </mesh>
            {/* South rope (between X: -4.4 and +4.4 at Z: -4.4) */}
            <mesh position={[0, ropeY, -4.4]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.025, 0.025, 8.8, 12]} />
              <meshStandardMaterial color={ropeColor} emissive={ropeColor} emissiveIntensity={1.5} />
            </mesh>
            {/* West rope (between Z: -4.4 and +4.4 at X: -4.4) */}
            <mesh position={[-4.4, ropeY, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 8.8, 12]} />
              <meshStandardMaterial color={ropeColor} emissive={ropeColor} emissiveIntensity={1.5} />
            </mesh>
            {/* East rope (between Z: -4.4 and +4.4 at X: +4.4) */}
            <mesh position={[4.4, ropeY, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 8.8, 12]} />
              <meshStandardMaterial color={ropeColor} emissive={ropeColor} emissiveIntensity={1.5} />
            </mesh>
          </group>
        );
      })}

      {/* Overhead Suspended Floodlight Truss Structure */}
      <group position={[0, 6.2, 0]}>
        {/* Aluminum square truss frame */}
        <mesh>
          <boxGeometry args={[7.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -3.75]}>
          <boxGeometry args={[7.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, 3.75]}>
          <boxGeometry args={[7.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <mesh position={[-3.75, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[7.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        <mesh position={[3.75, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[7.5, 0.15, 0.15]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>

        {/* 4 Downward Stadium Spotlights */}
        <spotLight
          position={[-2.5, -0.2, -2.5]}
          target-position={[-1, -6.0, -1]}
          intensity={22}
          distance={14}
          angle={0.7}
          penumbra={0.6}
          color="#fef08a"
        />
        <spotLight
          position={[2.5, -0.2, -2.5]}
          target-position={[1, -6.0, -1]}
          intensity={22}
          distance={14}
          angle={0.7}
          penumbra={0.6}
          color="#fef08a"
        />
        <spotLight
          position={[-2.5, -0.2, 2.5]}
          target-position={[-1, -6.0, 1]}
          intensity={22}
          distance={14}
          angle={0.7}
          penumbra={0.6}
          color="#fef08a"
        />
        <spotLight
          position={[2.5, -0.2, 2.5]}
          target-position={[1, -6.0, 1]}
          intensity={22}
          distance={14}
          angle={0.7}
          penumbra={0.6}
          color="#fef08a"
        />
      </group>

      {/* Sparring Dummy 1 (Blue Corner, x: -2.2) */}
      <group position={[-2.2, 0.9, 0]}>
        {/* Base Plate on floor */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.1, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.56, 0.66, 0.11, 24]} />
          <meshBasicMaterial color="#38bdf8" wireframe />
        </mesh>
        {/* Tilting Group from base anchor */}
        <group ref={dummy1Ref} position={[0, 0.1, 0]}>
          {/* Spring Coil stem */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Dummy Torso */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.85, 16]} />
            <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Dummy Chest Bullseye Target */}
          <mesh position={[0, 1.05, 0.31]}>
            <circleGeometry args={[0.18, 24]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>
          {/* Dummy Head */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#172554" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Glowing Visor */}
          <mesh position={[0, 1.6, 0.18]}>
            <boxGeometry args={[0.25, 0.08, 0.1]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={3.0} />
          </mesh>
        </group>
      </group>

      {/* Sparring Dummy 2 (Red Corner, x: 2.2) */}
      <group position={[2.2, 0.9, 0]}>
        {/* Base Plate on floor */}
        <mesh position={[0, 0.05, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.1, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.56, 0.66, 0.11, 24]} />
          <meshBasicMaterial color="#ef4444" wireframe />
        </mesh>
        {/* Tilting Group from base anchor */}
        <group ref={dummy2Ref} position={[0, 0.1, 0]}>
          {/* Spring Coil stem */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.6, 16]} />
            <meshStandardMaterial color="#64748b" metalness={0.95} roughness={0.15} />
          </mesh>
          {/* Dummy Torso */}
          <mesh position={[0, 1.0, 0]} castShadow>
            <cylinderGeometry args={[0.34, 0.28, 0.85, 16]} />
            <meshStandardMaterial color="#881337" roughness={0.3} metalness={0.7} />
          </mesh>
          {/* Dummy Chest Bullseye Target */}
          <mesh position={[0, 1.05, 0.31]}>
            <circleGeometry args={[0.18, 24]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
          {/* Dummy Head */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#4c0519" roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Glowing Visor */}
          <mesh position={[0, 1.6, 0.18]}>
            <boxGeometry args={[0.25, 0.08, 0.1]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={3.0} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ============================================================
   5. SEKTOR UTARA: CYBER SKY PARKOUR & APEX SUMMIT (z: +25 to +55)
   - Multi-tier elevated jumping platforms (Y = 1.6m, 2.7m, 3.8m, 5.5m)
   - Holographic Champion Apex Trophy di Summit
   - Panoramic viewing deck dengan neon balustrades
   - Leap of Faith dive pad untuk salto 360°
============================================================ */

export function CyberSkyParkour() {
  const trophyRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (trophyRef.current) {
      trophyRef.current.position.y = 7.2 + Math.sin(t * 2.2) * 0.15;
      trophyRef.current.rotation.y += delta * 0.75;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.x += delta * 1.2;
    if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.9;
  });

  return (
    <group>
      {/* Heavy Structural Support Pillars under Parkour Platforms (Sektor NW) */}
      {/* Pillars under Platform 1 (x: -36.0, z: 45.0, h: 1.8) */}
      {[
        [-38.5, 42.5],
        [-33.5, 42.5],
        [-38.5, 47.5],
        [-33.5, 47.5],
      ].map(([px, pz], i) => (
        <mesh key={`p1-col-${i}`} position={[px, 0.9, pz]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 1.8, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Pillar under Stepping Stone (x: -27.0, z: 45.0, h: 2.9) */}
      <mesh position={[-27.0, 1.45, 45.0]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 2.9, 12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Pillars under Platform 2 (x: -18.0, z: 45.0, h: 4.0) */}
      {[
        [-20.5, 42.5],
        [-15.5, 42.5],
        [-20.5, 47.5],
        [-15.5, 47.5],
      ].map(([px, pz], i) => (
        <mesh key={`p2-col-${i}`} position={[px, 2.0, pz]} castShadow>
          <cylinderGeometry args={[0.26, 0.35, 4.0, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Pillars under Sky Summit (x: -8.0, z: 45.0, h: 5.5) */}
      {[
        [-11.0, 42.0],
        [-5.0, 42.0],
        [-11.0, 48.0],
        [-5.0, 48.0],
        [-8.0, 45.0],
      ].map(([px, pz], i) => (
        <mesh key={`summit-col-${i}`} position={[px, 2.75, pz]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 5.5, 12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Holographic Apex Champion Trophy at the Sky Summit (x: -8.0, z: 45.0) */}
      <group position={[-8.0, 0.0, 45.0]}>
        {/* Pedestal Stand on Platform Floor */}
        <mesh position={[0, 5.85, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.5, 0.7, 8]} />
          <meshStandardMaterial color="#0b1120" metalness={0.92} roughness={0.2} />
        </mesh>
        <mesh position={[0, 5.85, 0]}>
          <cylinderGeometry args={[1.22, 1.52, 0.72, 8]} />
          <meshBasicMaterial color="#ec4899" wireframe />
        </mesh>

        {/* Floating Rotating Trophy */}
        <group ref={trophyRef} position={[0, 7.2, 0]}>
          {/* Central Gem Diamond */}
          <mesh>
            <octahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={2.5}
              metalness={0.8}
              roughness={0.1}
            />
          </mesh>
          {/* Inner Light Core */}
          <pointLight color="#ec4899" intensity={15} distance={10} />
          {/* Gyroscopic Ring 1 */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[1.1, 0.035, 16, 32]} />
            <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2} />
          </mesh>
          {/* Gyroscopic Ring 2 */}
          <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.35, 0.035, 16, 32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={2} />
          </mesh>
        </group>

        {/* Viewing Deck Balustrades / Glowing Handrails around Summit */}
        <mesh position={[4.1, 6.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 8.2, 12]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.0} />
        </mesh>
        <mesh position={[0, 6.1, 4.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 8.2, 12]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.0} />
        </mesh>
        <mesh position={[0, 6.1, -4.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 8.2, 12]} />
          <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={2.0} />
        </mesh>
      </group>
    </group>
  );
}

/* ============================================================
   6. SEKTOR BARAT & TIMUR: SPEEDWAY ARCHES & TECH PLAZA
============================================================ */

export function CyberSpeedwayAndPlazas() {
  const crystalRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group>
      {/* SEKTOR BARAT: West Hyper Runway (x: -40.0, z: 0.0) */}
      <group position={[-40.0, 0.0, 0.0]}>
        {/* Speed Runway Neon Chevron Arches */}
        {[-8.0, 0.0, 8.0].map((az, idx) => (
          <group key={`arch-${idx}`} position={[0, 0, az]}>
            {/* Left Arch Pillar */}
            <mesh position={[-4.0, 2.2, 0]}>
              <boxGeometry args={[0.3, 4.4, 0.3]} />
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
            </mesh>
            {/* Right Arch Pillar */}
            <mesh position={[4.0, 2.2, 0]}>
              <boxGeometry args={[0.3, 4.4, 0.3]} />
              <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1.5} />
            </mesh>
            {/* Top Beam */}
            <mesh position={[0, 4.4, 0]}>
              <boxGeometry args={[8.3, 0.3, 0.3]} />
              <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2.0} />
            </mesh>
          </group>
        ))}
      </group>

      {/* SEKTOR TIMUR: East VIP Tech Pavilion (x: 40.0, z: 0.0) */}
      <group position={[40.0, 1.0, 0.0]}>
        {/* Floating Crystal Monoliths */}
        <group ref={crystalRef} position={[0, 2.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.6, 0.6, 2.2, 6]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={2.0}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          <mesh rotation={[0, Math.PI / 6, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 2.22, 6]} />
            <meshBasicMaterial color="#ffffff" wireframe />
          </mesh>
          <pointLight color="#f59e0b" intensity={18} distance={12} />
        </group>

        {/* 4 Corner Tech Pylons */}
        {[
          [-3.8, -3.8],
          [3.8, -3.8],
          [-3.8, 3.8],
          [3.8, 3.8],
        ].map(([px, pz], idx) => (
          <mesh key={`tech-pylon-${idx}`} position={[px, 1.2, pz]} castShadow>
            <boxGeometry args={[0.35, 2.4, 0.35]} />
            <meshStandardMaterial color="#d97706" emissive="#f59e0b" emissiveIntensity={1.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ============================================================
   7. PERIMETER BOUNDARY: 4 MEGA SKY BEACONS & ENERGY FORCEFIELD
   - 4 Tower Megah di Sudut Arena (x: ±58, z: ±58)
   - Skyward laser beam menembus langit (Tinggi 65m)
   - Forcefield barrier pagar energi di tepi arena (X = ±68, Z = ±68)
============================================================ */

export function CyberArenaPerimeter() {
  const corners = [
    { x: -45.0, z: 45.0, color: "#38bdf8", name: "NW: Sky Parkour" },
    { x: -45.0, z: -45.0, color: "#ef4444", name: "SW: Boxing Ring" },
    { x: 45.0, z: -45.0, color: "#a855f7", name: "SE: Tech Citadel" },
    { x: 45.0, z: 45.0, color: "#ec4899", name: "NE: DJ Synth" },
  ];

  return (
    <group>
      {/* 4 Corner Mega Sky Beacons */}
      {corners.map((corner, i) => (
        <group key={`beacon-${i}`} position={[corner.x, 0, corner.z]}>
          {/* Base Pedestal (8m tall sci-fi structure) */}
          <mesh position={[0, 4.0, 0]} castShadow>
            <cylinderGeometry args={[1.8, 2.8, 8.0, 8]} />
            <meshStandardMaterial color="#0a0f1d" metalness={0.92} roughness={0.2} />
          </mesh>
          <mesh position={[0, 4.0, 0]}>
            <cylinderGeometry args={[1.82, 2.82, 8.05, 8]} />
            <meshBasicMaterial color={corner.color} wireframe />
          </mesh>

          {/* Glowing Energy Ring at Top */}
          <mesh position={[0, 8.1, 0]}>
            <torusGeometry args={[1.9, 0.12, 16, 32]} />
            <meshStandardMaterial
              color={corner.color}
              emissive={corner.color}
              emissiveIntensity={3.0}
            />
          </mesh>

          {/* Vertical Skyward Laser Beam (Reaches 65m into sky) */}
          <mesh position={[0, 38.0, 0]}>
            <cylinderGeometry args={[0.55, 1.6, 60.0, 16, 1, true]} />
            <meshBasicMaterial
              color={corner.color}
              transparent
              opacity={0.35}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 38.0, 0]}>
            <cylinderGeometry args={[0.18, 0.45, 60.0, 12, 1, true]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Beacon Point Light */}
          <pointLight color={corner.color} intensity={25} distance={28} position={[0, 9.0, 0]} />
        </group>
      ))}

      {/* Forcefield Laser Boundary Ribbons along X = ±68 and Z = ±68 */}
      {/* North Forcefield (Z = +68) */}
      <mesh position={[0, 1.5, 68.0]}>
        <boxGeometry args={[136.0, 3.0, 0.1]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh position={[0, 0.4, 68.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>
      <mesh position={[0, 2.5, 68.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* South Forcefield (Z = -68) */}
      <mesh position={[0, 1.5, -68.0]}>
        <boxGeometry args={[136.0, 3.0, 0.1]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh position={[0, 0.4, -68.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0, 2.5, -68.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* West Forcefield (X = -68) */}
      <mesh position={[-68.0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[136.0, 3.0, 0.1]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh position={[-68.0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
      <mesh position={[-68.0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      {/* East Forcefield (X = +68) */}
      <mesh position={[68.0, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[136.0, 3.0, 0.1]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh position={[68.0, 0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      <mesh position={[68.0, 2.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 136.0, 8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
    </group>
  );
}

/* ============================================================
   8. TATA LETAK & WAYFINDING: 4 GRAND HIGHWAYS & NEXUS SIGNPOSTS
   - 4 Jalur Runway Terang (Cyan, Crimson, Emerald, Amber) menghubungkan Nexus ke 4 sektor
   - 4 Holographic Wayfinder Signposts di tepi Welcome Disc
   - Combat District Ceremonial Gateway Arch di pintu masuk ring tinju
============================================================ */

function createWayfinderTexture(
  title: string,
  badge: string,
  icon: string,
  color: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark cyber glass card
  ctx.fillStyle = "rgba(7, 11, 24, 0.95)";
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 240);

  // Top accent bar
  ctx.fillStyle = color;
  ctx.fillRect(12, 12, 488, 12);

  // Text contents
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(`${icon} ${title}`, 256, 95);

  ctx.fillStyle = color;
  ctx.font = "bold 23px monospace";
  ctx.fillText(badge, 256, 155);

  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "15px monospace";
  ctx.fillText("JALAN LURUS MENUJU SEKTOR →", 256, 205);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createReturnPortalTexture(color: string, label: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark glass background
  ctx.fillStyle = "rgba(7, 11, 24, 0.95)";
  ctx.fillRect(0, 0, 512, 160);

  // Neon glowing border
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(6, 6, 500, 148);

  // Top accent bar
  ctx.fillStyle = color;
  ctx.fillRect(10, 10, 492, 10);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 36px system-ui, sans-serif";
  ctx.fillText("↩️ SEKTOR UTAMA", 256, 68);

  ctx.fillStyle = color;
  ctx.font = "bold 20px monospace";
  ctx.fillText(`WARP KE NEXUS • ${label}`, 256, 118);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ReturnTeleportPortal({
  position,
  rotation = [0, 0, 0],
  carState,
  color = "#38bdf8",
  label = "NEXUS RETURN",
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  carState?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  color?: string;
  label?: string;
}) {
  const vortexRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const lastTeleportRef = useRef(0);
  const portalTex = useMemo(() => createReturnPortalTexture(color, label), [color, label]);

  useFrame((state, delta) => {
    if (vortexRef.current) {
      vortexRef.current.rotation.z += delta * 2.2;
    }
    if (coreRef.current) {
      const scale = 1.0 + Math.sin(state.clock.elapsedTime * 5) * 0.08;
      coreRef.current.scale.set(scale, scale, 1);
    }

    if (carState) {
      const p = carState.current.pos;
      const dist = Math.hypot(p.x - position[0], p.z - position[2]);
      if (dist < 1.35 && Math.abs(p.y - position[1]) < 2.2) {
        const now = Date.now();
        if (now - lastTeleportRef.current > 2200) {
          lastTeleportRef.current = now;
          playTeleportSound();
          carState.current.pos.set(0.0, 0.2, 1.8);
        }
      }
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Heavy Ground Base Pedestal */}
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[1.5, 1.7, 0.16, 16]} />
        <meshStandardMaterial color="#080d1a" metalness={0.92} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.52, 1.72, 0.17, 16]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>

      {/* Ring Frame */}
      <group position={[0, 1.8, 0]}>
        <mesh castShadow>
          <torusGeometry args={[1.5, 0.14, 16, 36]} />
          <meshStandardMaterial color="#091122" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh>
          <torusGeometry args={[1.53, 0.15, 16, 36]} />
          <meshBasicMaterial color={color} wireframe />
        </mesh>

        {/* Outer Chevrons */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const cx = Math.cos(rad) * 1.5;
          const cy = Math.sin(rad) * 1.5;
          return (
            <mesh key={i} position={[cx, cy, 0]}>
              <boxGeometry args={[0.18, 0.18, 0.22]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3.5} />
            </mesh>
          );
        })}

        {/* Counter-Rotating Vortex Ring */}
        <group ref={vortexRef}>
          <mesh>
            <ringGeometry args={[0.2, 1.35, 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
        </group>

        {/* Pulsing Core */}
        <mesh ref={coreRef}>
          <circleGeometry args={[1.32, 32]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Top Header Sign */}
        <group position={[0, 1.95, 0]}>
          <mesh>
            <planeGeometry args={[2.2, 0.7]} />
            <meshBasicMaterial map={portalTex} toneMapped={false} />
          </mesh>
        </group>

        {/* Illumination Point Light */}
        <pointLight color={color} intensity={5.0} distance={6.0} position={[0, 0, 0.5]} />
      </group>
    </group>
  );
}

export function CyberArenaWayfindingAndPathways({
  carState,
}: {
  carState?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
}) {
  const nwTex = useMemo(
    () => createWayfinderTexture("SKY PARKOUR", "NW TOWER • 5.5M APEX", "🧗", "#38bdf8"),
    []
  );
  const swTex = useMemo(
    () => createWayfinderTexture("CYBER BOXING", "SW TOWER • SPARRING RING", "🥊", "#ef4444"),
    []
  );
  const seTex = useMemo(
    () => createWayfinderTexture("TECH CITADEL", "SE TOWER • SPIRE CITADEL", "🗼", "#a855f7"),
    []
  );
  const neTex = useMemo(
    () => createWayfinderTexture("DJ SYNTH PAD", "NE TOWER • AUDIO LOUNGE", "🎵", "#ec4899"),
    []
  );

  const lastWarpRef = useRef(0);

  // Central Nexus 4 Diagonal Warp Pads
  useFrame(() => {
    if (!carState) return;
    const p = carState.current.pos;
    const now = Date.now();
    if (now - lastWarpRef.current < 2200) return;

    // NW Pad: [-3.6, 3.6] -> NW Tower [-45.0, 1.15, 45.0]
    if (Math.hypot(p.x - (-3.6), p.z - 3.6) < 1.25) {
      lastWarpRef.current = now;
      playTeleportSound();
      carState.current.pos.set(-45.0, 1.15, 45.0);
      return;
    }
    // SW Pad: [-3.6, -3.6] -> SW Tower [-45.0, 1.15, -45.0]
    if (Math.hypot(p.x - (-3.6), p.z - (-3.6)) < 1.25) {
      lastWarpRef.current = now;
      playTeleportSound();
      carState.current.pos.set(-45.0, 1.15, -45.0);
      return;
    }
    // SE Pad: [3.6, -3.6] -> SE Tower [45.0, 1.25, -45.0]
    if (Math.hypot(p.x - 3.6, p.z - (-3.6)) < 1.25) {
      lastWarpRef.current = now;
      playTeleportSound();
      carState.current.pos.set(45.0, 1.25, -45.0);
      return;
    }
    // NE Pad: [3.6, 3.6] -> NE Tower [45.0, 1.15, 45.0]
    if (Math.hypot(p.x - 3.6, p.z - 3.6) < 1.25) {
      lastWarpRef.current = now;
      playTeleportSound();
      carState.current.pos.set(45.0, 1.15, 45.0);
      return;
    }
  });

  return (
    <group>
      {/* ============================================================
          1. FOUR RETURN TELEPORT STARGATE PORTALS AT 4 CORNER TOWERS
      ============================================================ */}
      {/* NW Tower (Sky Parkour) Return Portal */}
      <ReturnTeleportPortal
        position={[-45.0, 0.9, 48.2]}
        rotation={[0, 0, 0]}
        carState={carState}
        color="#38bdf8"
        label="SEKTOR 1 (NW)"
      />

      {/* SW Tower (Cyber Boxing) Return Portal */}
      <ReturnTeleportPortal
        position={[-45.0, 0.9, -48.2]}
        rotation={[0, Math.PI, 0]}
        carState={carState}
        color="#ef4444"
        label="SEKTOR 2 (SW)"
      />

      {/* SE Tower (Tech Citadel) Return Portal */}
      <ReturnTeleportPortal
        position={[45.0, 1.0, -48.2]}
        rotation={[0, Math.PI, 0]}
        carState={carState}
        color="#a855f7"
        label="SEKTOR 3 (SE)"
      />

      {/* NE Tower (DJ Synth Pad) Return Portal */}
      <ReturnTeleportPortal
        position={[45.0, 0.9, 48.2]}
        rotation={[0, 0, 0]}
        carState={carState}
        color="#ec4899"
        label="SEKTOR 4 (NE)"
      />

      {/* ============================================================
          2. FOUR GRAND DIAGONAL HIGHWAYS (Central Nexus -> 4 Corner Towers)
          - Symmetrical 45-degree cyber runways
          - Double illuminated neon laser guard rails
          - High-contrast sci-fi dark grid decking
      ============================================================ */}
      {/* NW Diagonal Highway (Nexus to NW Tower [-45, 45]) */}
      <group position={[-22.63, 0.008, 22.63]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 52.0]} />
          <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* SW Diagonal Highway (Nexus to SW Tower [-45, -45]) */}
      <group position={[-22.63, 0.008, -22.63]} rotation={[0, -3 * Math.PI / 4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 52.0]} />
          <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* SE Diagonal Highway (Nexus to SE Tower [45, -45]) */}
      <group position={[22.63, 0.008, -22.63]} rotation={[0, 3 * Math.PI / 4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 52.0]} />
          <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh position={[1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
      </group>

      {/* NE Diagonal Highway (Nexus to NE Tower [45, 45]) */}
      <group position={[22.63, 0.008, 22.63]} rotation={[0, Math.PI / 4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.4, 52.0]} />
          <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[-1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        <mesh position={[1.7, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 52.0, 8]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
      </group>

      {/* ============================================================
          3. FOUR CENTRAL NEXUS TELEPORT GATE PADS (Direct Warp to 4 Corners)
      ============================================================ */}
      {/* NW Warp Pad (Cyan) */}
      <group position={[-3.6, 0.03, 3.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#0c1527" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.1, 24]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <pointLight color="#38bdf8" intensity={4} distance={3.0} position={[0, 0.5, 0]} />
      </group>

      {/* SW Warp Pad (Crimson) */}
      <group position={[-3.6, 0.03, -3.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#0c1527" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.1, 24]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <pointLight color="#ef4444" intensity={4} distance={3.0} position={[0, 0.5, 0]} />
      </group>

      {/* SE Warp Pad (Purple) */}
      <group position={[3.6, 0.03, -3.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#0c1527" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.1, 24]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#a855f7" />
        </mesh>
        <pointLight color="#a855f7" intensity={4} distance={3.0} position={[0, 0.5, 0]} />
      </group>

      {/* NE Warp Pad (Pink) */}
      <group position={[3.6, 0.03, 3.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.1, 24]} />
          <meshStandardMaterial color="#0c1527" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.1, 24]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 16]} />
          <meshBasicMaterial color="#ec4899" />
        </mesh>
        <pointLight color="#ec4899" intensity={4} distance={3.0} position={[0, 0.5, 0]} />
      </group>

      {/* ============================================================
          4. FOUR HOLOGRAPHIC WAYFINDER SIGNPOSTS (At Central Nexus Edge)
      ============================================================ */}
      {/* NW Sign: Menghadap ke Pusat Spawn dari sudut NW */}
      <group position={[-3.2, 0, 3.2]} rotation={[0, 3 * Math.PI / 4, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.9, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshBasicMaterial map={nwTex} toneMapped={false} />
        </mesh>
        <pointLight color="#38bdf8" intensity={4} distance={3.5} position={[0, 1.1, -0.2]} />
      </group>

      {/* SW Sign: Menghadap ke Pusat Spawn dari sudut SW */}
      <group position={[-3.2, 0, -3.2]} rotation={[0, Math.PI / 4, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.9, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshBasicMaterial map={swTex} toneMapped={false} />
        </mesh>
        <pointLight color="#ef4444" intensity={4} distance={3.5} position={[0, 1.1, -0.2]} />
      </group>

      {/* SE Sign: Menghadap ke Pusat Spawn dari sudut SE */}
      <group position={[3.2, 0, -3.2]} rotation={[0, -Math.PI / 4, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.9, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshBasicMaterial map={seTex} toneMapped={false} />
        </mesh>
        <pointLight color="#a855f7" intensity={4} distance={3.5} position={[0, 1.1, -0.2]} />
      </group>

      {/* NE Sign: Menghadap ke Pusat Spawn dari sudut NE */}
      <group position={[3.2, 0, 3.2]} rotation={[0, -3 * Math.PI / 4, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.1, 0.9, 12]} />
          <meshStandardMaterial color="#0e1726" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[-0.2, 0, 0]}>
          <planeGeometry args={[1.3, 0.65]} />
          <meshBasicMaterial map={neTex} toneMapped={false} />
        </mesh>
        <pointLight color="#ec4899" intensity={4} distance={3.5} position={[0, 1.1, -0.2]} />
      </group>
    </group>
  );
}

/* ============================================================
   BACKWARD COMPATIBILITY EXPORTS
============================================================ */
export const CyberSparringRing = CyberBoxingRing;
export const VisitorHallOfFame = CyberTeleportStation;
export const CyberCommandCenter = CyberContactBeacon;

