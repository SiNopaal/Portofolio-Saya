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

/* ============================================================
   PROCEDURAL SPATIAL AMBIENT SOUND ENGINE (Zero Asset Download)
   Tranquil, cinematic ambient soundscape that harmonically morphs
   based on avatar proximity to the 4 thematic corners & plaza.
============================================================ */

class MetaverseSpatialAmbientEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private isInitialized: boolean = false;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private oscs: OscillatorNode[] = [];
  private subGain: GainNode | null = null;
  private shimmerGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lastUpdate: number = 0;

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("portfolio_audio_muted");
      // Default to muted (true) to satisfy modern browser autoplay policies
      this.isMuted = saved === "0" ? false : true;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;
    try {
      this.ctx = getSharedAudioContext();
      if (!this.ctx) return;

      // Master ambient gain - subtle, gentle background volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.055, this.ctx.currentTime);

      // Lowpass resonant filter for celestial warmth
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = "lowpass";
      this.filter.frequency.setValueAtTime(420, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      // Base lush chord: C2 (65.41 Hz), G2 (98.0 Hz), D3 (146.83 Hz), E3 (164.81 Hz)
      const freqs = [65.41, 98.0, 146.83, 164.81];
      this.oscs = [];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? "triangle" : "sine";
        // Subtle micro-detune for rich acoustic chorusing
        osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.12 : -0.12), this.ctx.currentTime);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.42 : 0.26, this.ctx.currentTime);

        osc.connect(oscGain);
        if (this.filter) oscGain.connect(this.filter);
        osc.start();
        this.oscs.push(osc);
      });

      // Sub-bass oscillator (activated near SW DevOps / Aerospace runway)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(43.65, this.ctx.currentTime); // Deep F1
      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      subOsc.connect(this.subGain);
      this.subGain.connect(this.masterGain);
      subOsc.start();
      this.oscs.push(subOsc);

      // Ethereal overtone shimmer (activated near NE Quantum AI & SE Zen)
      const shimmerOsc = this.ctx.createOscillator();
      shimmerOsc.type = "sine";
      shimmerOsc.frequency.setValueAtTime(528.0, this.ctx.currentTime); // Solfeggio 528 Hz
      this.shimmerGain = this.ctx.createGain();
      this.shimmerGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      shimmerOsc.connect(this.shimmerGain);
      this.shimmerGain.connect(this.masterGain);
      shimmerOsc.start();
      this.oscs.push(shimmerOsc);

      // Slow organic LFO (0.05 Hz = 20s breathing cycle)
      this.lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfo.frequency.setValueAtTime(0.05, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(60, this.ctx.currentTime);
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filter.frequency);
      this.lfo.start();

      this.filter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch {
      // Audio fallback safe
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("portfolio_audio_muted", muted ? "1" : "0");
      } catch {}
    }

    if (!this.isInitialized && !muted) {
      this.init();
    }

    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === "suspended" && !muted) {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    if (muted) {
      // Smooth fade out
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    } else {
      // Smooth fade in
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.exponentialRampToValueAtTime(0.055, now + 1.2);
    }
  }

  public updateSpatialCoordinates(x: number, z: number) {
    if (this.isMuted || !this.isInitialized || !this.ctx || !this.filter) return;
    const nowMs = Date.now();
    if (nowMs - this.lastUpdate < 180) return; // Throttle spatial parameter updates
    this.lastUpdate = nowMs;

    const t = this.ctx.currentTime;

    // Distances to 4 corner zones, 4 cardinal lounges, and center
    const dNW = Math.hypot(x - (-32), z - (-32));       // NW: Programming & Tech
    const dNE = Math.hypot(x - 32, z - (-32));         // NE: Quantum AI
    const dSW = Math.hypot(x - (-32), z - 32);          // SW: DevOps Runway
    const dSE = Math.hypot(x - 32, z - 32);            // SE: Zen Sanctuary
    const dSouthLounge = Math.hypot(x, z - 32);         // South: Cyber Firepit Lounge
    const dNorthSanctuary = Math.hypot(x, z - (-32));   // North: Celestial Moon Sanctuary
    const dWestPavilion = Math.hypot(x - (-32), z);     // West: Cyber Zen Tea Pavilion
    const dEastGarden = Math.hypot(x - 32, z);          // East: Aurora Crystal Garden
    const dCenter = Math.hypot(x, z);                  // Center Plaza

    let targetCutoff = 420;
    let targetSub = 0.0001;
    let targetShimmer = 0.0001;

    if (dNW < 24) {
      // NW Programming: Brighter, crisp modern clarity
      const w = 1 - dNW / 24;
      targetCutoff = 420 + w * 320;
    } else if (dNE < 24) {
      // NE Quantum AI: Crystalline high overtone
      const w = 1 - dNE / 24;
      targetCutoff = 420 + w * 280;
      targetShimmer = 0.0001 + w * 0.035;
    } else if (dSW < 24) {
      // SW DevOps: Deep warm sub-bass hum
      const w = 1 - dSW / 24;
      targetCutoff = 360 + w * 120;
      targetSub = 0.0001 + w * 0.045;
    } else if (dSE < 24) {
      // SE Zen Sanctuary: Serene Solfeggio resonance
      const w = 1 - dSE / 24;
      targetCutoff = 460;
      targetShimmer = 0.0001 + w * 0.04;
    } else if (dSouthLounge < 16) {
      // South Chill Lounge: Ultra-warm campfire pad with gentle ambient shimmer
      const w = 1 - dSouthLounge / 16;
      targetCutoff = 380 + w * 60;
      targetShimmer = 0.0001 + w * 0.025;
    } else if (dNorthSanctuary < 16) {
      // North Moon Sanctuary: Crystalline nocturnal calm with celestial high overtone
      const w = 1 - dNorthSanctuary / 16;
      targetCutoff = 440 + w * 180;
      targetShimmer = 0.0001 + w * 0.045;
    } else if (dWestPavilion < 16) {
      // West Tea Pavilion: Grounded zen organic tranquility
      const w = 1 - dWestPavilion / 16;
      targetCutoff = 410 + w * 90;
      targetShimmer = 0.0001 + w * 0.02;
    } else if (dEastGarden < 16) {
      // East Crystal Garden: Mysterious shimmering violet harmony
      const w = 1 - dEastGarden / 16;
      targetCutoff = 450 + w * 160;
      targetShimmer = 0.0001 + w * 0.048;
    } else if (dCenter < 18) {
      // Center Spawn: Serene warm ambient
      targetCutoff = 400;
    }

    try {
      this.filter.frequency.setTargetAtTime(targetCutoff, t, 0.8);
      if (this.subGain) this.subGain.gain.setTargetAtTime(targetSub, t, 0.8);
      if (this.shimmerGain) this.shimmerGain.gain.setTargetAtTime(targetShimmer, t, 0.8);
    } catch {}
  }
}

export const metaverseAmbient = new MetaverseSpatialAmbientEngine();

export function setMetaverseAudioMuted(muted: boolean) {
  metaverseAmbient.setMuted(muted);
}

export function getMetaverseAudioMuted(): boolean {
  return metaverseAmbient.getMuted();
}

export function updateMetaverseSpatialAudio(x: number, z: number) {
  metaverseAmbient.updateSpatialCoordinates(x, z);
}

/**
 * Procedural electronic synthesizer for the Cyber DJ Synth Pad
 */
export function playSynthPadNote(frequency: number, isMuted: boolean = false) {
  if (metaverseAmbient.getMuted() || isMuted || typeof window === "undefined") return;
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
  if (metaverseAmbient.getMuted() || typeof window === "undefined") return;
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
 * Procedural Tibetan Singing Bowl / Zen Pentatonic Chime
 */
export function playZenChimeSound(freq: number = 528) {
  if (metaverseAmbient.getMuted() || typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    // Fundamental pure sine tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, ctx.currentTime);

    // Harmonic singing bowl overtone (2.76x ratio for bell bronze)
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2.76, ctx.currentTime);

    // Warm, gentle attack and long, serene exponential decay
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 2.5);
    osc2.stop(ctx.currentTime + 2.5);
  } catch {}
}

/**
 * Procedural subtle water droplet ripple sound
 */
export function playWaterRippleSound() {
  if (metaverseAmbient.getMuted() || typeof window === "undefined") return;
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch {}
}

/* ============================================================
   CANVAS TEXTURE BUILDERS (100% Native WebGL - Zero Floating DOM)
============================================================ */

export const TELEPORT_DESTINATIONS = [
  {
    id: "nw-programming",
    name: "Programming Arena",
    badge: "NW • Stack & Languages",
    icon: "💻",
    pos: [-26.0, 0.2, -26.0] as [number, number, number],
    color: "#38bdf8",
  },
  {
    id: "ne-observatory",
    name: "Quantum AI Observatory",
    badge: "NE • Quantum & Distributed",
    icon: "⚛️",
    pos: [26.0, 0.2, -26.0] as [number, number, number],
    color: "#a855f7",
  },
  {
    id: "sw-devops",
    name: "DevOps Cloud Runway",
    badge: "SW • CI/CD & Kubernetes",
    icon: "🚀",
    pos: [-26.0, 0.2, 26.0] as [number, number, number],
    color: "#f59e0b",
  },
  {
    id: "se-zen",
    name: "Clean Architecture Zen",
    badge: "SE • SOLID & Security",
    icon: "🛡️",
    pos: [26.0, 0.2, 26.0] as [number, number, number],
    color: "#10b981",
  },
  {
    id: "spawn",
    name: "Center Nexus Spawn",
    badge: "Pusat Metaverse Arena",
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
  ctx.font = "bold 24px monospace";
  ctx.fillText("⚡ TELEPORT KIOSK", 28, 50);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px monospace";
  ctx.fillText("KLIK TUJUAN AREA", 310, 50);

  // 5 Destination buttons
  TELEPORT_DESTINATIONS.forEach((d, idx) => {
    const y = 88 + idx * 72;
    const isSel = d.id === selectedId;

    ctx.fillStyle = isSel ? "rgba(56, 189, 248, 0.28)" : "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(24, y, 464, 60);

    ctx.strokeStyle = isSel ? d.color : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = isSel ? 3 : 1;
    ctx.strokeRect(24, y, 464, 60);

    ctx.fillStyle = isSel ? "#ffffff" : "#cbd5e1";
    ctx.font = "bold 19px sans-serif";
    ctx.fillText(`${d.icon}  ${d.name}`, 38, y + 37);

    ctx.fillStyle = isSel ? d.color : "#64748b";
    ctx.font = "12px monospace";
    ctx.fillText(isSel ? "● ACTIVE TARGET" : d.badge, 252, y + 37);
  });

  // Footer status bar
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 15px monospace";
  ctx.textAlign = "center";
  ctx.fillText(">>> MASUK KE PORTAL UNTUK TELEPORT <<<", 256, 484);

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
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
}) {
  const [isNearby, setIsNearby] = useState(false);
  const techRingRef = useRef<THREE.Group>(null);
  const beaconRingsRef = useRef<THREE.Group>(null);
  const spireCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const p = carState.current.pos;
    const dist = Math.hypot(p.x - 0.0, p.z - (-15.0));
    const nearby = dist < 4.8 && p.y >= 0.75;
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
    <group position={[0.0, 1.1, -15.0]}>
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
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
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
      Math.abs(p.x - 14.5) <= 4.5 &&
      Math.abs(p.z - 0.0) <= 4.0 &&
      p.y >= 0.65;

    if (onStage) {
      const relX = p.x - 14.5;
      const relZ = p.z - 0.0;

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
    <group position={[14.5, 0.75, 0.0]}>
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
  position = [0.0, 0.0, -14.5],
  rotation = [0, 0, 0],
}: {
  carState: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  position?: [number, number, number];
  rotation?: [number, number, number];
}) {
  const [selectedDestId, setSelectedDestId] = useState(TELEPORT_DESTINATIONS[0].id);
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

    // Portal center at dynamic position
    const p = carState.current.pos;
    const distToPortal = Math.hypot(p.x - position[0], p.z - position[2]);

    // If player walks into the center of the vertical portal
    if (distToPortal < 1.45 && Math.abs(p.y - position[1]) < 2.5) {
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
            const btnY = 0.375 - i * 0.191;
            return (
              <mesh
                key={dest.id}
                position={[0, btnY, 0.005]}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setSelectedDestId(dest.id);
                }}
              >
                <planeGeometry args={[1.44, 0.165]} />
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
   BACKWARD COMPATIBILITY EXPORTS
============================================================ */
export const CyberSparringRing = CyberDJSynthPad;
export const VisitorHallOfFame = CyberTeleportStation;
export const CyberCommandCenter = CyberContactBeacon;
