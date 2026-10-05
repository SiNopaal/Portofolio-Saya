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
  Copy,
  ExternalLink,
  Code2,
  Terminal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useMultiplayer, PlayerData, HitSpark, PALETTES, CharacterModelType } from "@/lib/multiplayer";
import {
  CyberTeleportStation,
  playTeleportSound,
  playZenChimeSound,
  playWaterRippleSound,
  setMetaverseAudioMuted,
  getMetaverseAudioMuted,
  updateMetaverseSpatialAudio,
} from "./ArenaZones";


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

const ARENA_BOUND = 85.0;
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

  // 3. Four Minimalist Corner Arenas (Pedestals, Monoliths, Parked Craft, Rock Cairns)
  // Corner 1: Zen Gallery Pedestals & Columns (NW: [-32, -32])
  { x: -32.0, z: -32.0, r: 0.85, minY: 0.0, maxY: 2.5 },
  { x: -37.5, z: -32.0, r: 0.75, minY: 0.0, maxY: 2.0 },
  { x: -26.5, z: -32.0, r: 0.75, minY: 0.0, maxY: 2.0 },
  { x: -37.5, z: -26.5, r: 0.65, minY: 0.0, maxY: 2.0 },
  { x: -39.0, z: -39.0, r: 0.25, minY: 0.0, maxY: 5.0 },
  { x: -25.0, z: -39.0, r: 0.25, minY: 0.0, maxY: 5.0 },
  { x: -39.0, z: -25.0, r: 0.25, minY: 0.0, maxY: 5.0 },
  { x: -25.0, z: -25.0, r: 0.25, minY: 0.0, maxY: 5.0 },
  // Corner 2: Stargazer Sky Platform Monolith (NE: [32, -32])
  { x: 32.0, z: -32.0, r: 0.85, minY: 0.0, maxY: 4.0 },
  // Corner 3: Aerospace Runway VTOL Parked Drone (SW: [-26.3, 26.3])
  { x: -26.3, z: 26.3, r: 1.25, minY: 0.0, maxY: 2.5 },
  // Corner 4: Clean Architecture Hexagonal Core Altar (SE: [32, 32])
  { x: 32.0, z: 32.0, r: 1.4, minY: 0.0, maxY: 2.5 },
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
   PROGRAMMING LANGUAGES & TECH ECOSYSTEM DATA
============================================================ */
export interface TechPillarData {
  id: string;
  name: string;
  badge: string;
  category: string;
  desc: string;
  color: string;
  border: string;
}

export const TECH_PILLARS: TechPillarData[] = [
  { id: "ts", name: "TypeScript", badge: "TS", category: "LANGUAGE", desc: "Static typing, scalable contracts & strict interfaces", color: "#38bdf8", border: "#60a5fa" },
  { id: "py", name: "Python", badge: "PY", category: "AI / SCRIPT", desc: "Machine learning, AsyncIO & rapid scientific compute", color: "#f59e0b", border: "#fbbf24" },
  { id: "rs", name: "Rust", badge: "RS", category: "SYSTEMS", desc: "Memory safety without GC, zero-cost abstractions & Tokio", color: "#f97316", border: "#fb923c" },
  { id: "go", name: "Go", badge: "GO", category: "CONCURRENCY", desc: "High-throughput Goroutines, CSP channels & cloud microservices", color: "#00add8", border: "#38bdf8" },
  { id: "cpp", name: "C++20", badge: "C++", category: "PERF / CORE", desc: "Low-latency engines, deterministic memory & SIMD", color: "#60a5fa", border: "#93c5fd" },
  { id: "wasm", name: "WebAssembly", badge: "WASM", category: "BYTECODE", desc: "Near-native binary execution & sandboxed VM on the web", color: "#a855f7", border: "#c084fc" },
  { id: "webgpu", name: "WebGPU", badge: "GPU", category: "GRAPHICS", desc: "Direct-to-metal parallel compute & modern shader pipelines", color: "#10b981", border: "#34d399" },
  { id: "next", name: "Next.js / React", badge: "REACT", category: "UI / SSR", desc: "Declarative UI, Server Components & streaming runtime", color: "#06b6d4", border: "#67e8f9" },
  { id: "linux", name: "Linux", badge: "LINUX", category: "KERNEL / OS", desc: "POSIX syscalls, epoll, namespaces & cloud infrastructure", color: "#facc15", border: "#fde047" },
  { id: "docker", name: "Docker", badge: "DOCKER", category: "CONTAINER", desc: "Process isolation, container virtualization & microservices", color: "#38bdf8", border: "#7dd3fc" },
  { id: "postgres", name: "PostgreSQL", badge: "SQL", category: "DATABASE", desc: "ACID compliance, relational calculus & complex indexing", color: "#818cf8", border: "#a5b4fc" },
  { id: "pytorch", name: "PyTorch", badge: "TORCH", category: "DEEP LEARNING", desc: "Tensors, dynamic autograd computation graphs & CUDA", color: "#f43f5e", border: "#fb7185" },
  { id: "redis", name: "Redis", badge: "REDIS", category: "IN-MEMORY", desc: "Sub-millisecond data structures, cache & pub/sub brokers", color: "#ef4444", border: "#f87171" },
  { id: "graphql", name: "GraphQL / gRPC", badge: "PROTOCOLS", category: "PROTOCOLS", desc: "Strongly typed APIs, binary Protobuf & multiplexed streams", color: "#ec4899", border: "#f472b6" },
  { id: "three", name: "Three.js / R3F", badge: "3D WEB", category: "SPATIAL", desc: "Matrix transformations, shaders & interactive 3D WebGL", color: "#2dd4bf", border: "#5eead4" },
  { id: "git", name: "Git", badge: "GIT", category: "VCS", desc: "Distributed DAG snapshots & atomic cryptographical commits", color: "#fb923c", border: "#fdba74" },
];

/* ============================================================
   QUANTUM AI & DISTRIBUTED SYSTEMS OBSERVATORY DATA
============================================================ */
export interface QuantumObservatoryNode {
  id: string;
  name: string;
  category: string;
  badge: string;
  color: string;
  border: string;
  formula: string;
  concept: string;
  realWorldUsage: string;
  position: [number, number, number];
}

export const QUANTUM_OBSERVATORY_NODES: QuantumObservatoryNode[] = [
  {
    id: "quantum-core",
    name: "The Quantum Core & Bloch Sphere",
    category: "QUANTUM COMPUTE",
    badge: "Q-CORE",
    color: "#38bdf8",
    border: "#60a5fa",
    formula: "|ψ⟩ = α|0⟩ + β|1⟩",
    concept: "Superposisi probabilitas melampaui biner (0 & 1) untuk komputasi paralel masif eksponensial.",
    realWorldUsage: "Kriptografi Post-Quantum (PQC), simulasi fisika molekuler, & optimasi komputasi eksponensial.",
    position: [0, 0, 0],
  },
  {
    id: "vector-space",
    name: "Latent Nebula & Vector Embeddings",
    category: "AI & EMBEDDINGS",
    badge: "AI-VEC",
    color: "#a855f7",
    border: "#c084fc",
    formula: "cos(θ) = (A · B) / (||A|| ||B||)",
    concept: "Representasi semantik kata dan pengetahuan di ruang n-dimensi (1536D) untuk penalaran kontekstual AI.",
    realWorldUsage: "Semantic vector search (Pinecone/Milvus), RAG, & Transformer Self-Attention Q-K-V.",
    position: [-5.2, 0, 0],
  },
  {
    id: "raft-mesh",
    name: "Orbital Mesh & Raft Consensus",
    category: "DISTRIBUTED SYSTEMS",
    badge: "RAFT",
    color: "#f59e0b",
    border: "#fbbf24",
    formula: "Quorum = ⌊N / 2⌋ + 1",
    concept: "Protokol konsensus pemilihan Leader dan replikasi log konsisten terhadap partisi jaringan (CAP Theorem).",
    realWorldUsage: "Kubernetes etcd, CockroachDB, TiKV, & cluster cloud berkeandalan 99.999%.",
    position: [5.2, 0, 0],
  },
  {
    id: "dag-graph",
    name: "The Celestial DAG & Graph Theory",
    category: "GRAPH THEORY",
    badge: "DAG",
    color: "#10b981",
    border: "#34d399",
    formula: "G = (V, E) [Acyclic]",
    concept: "Struktur graf berarah tanpa siklus untuk pemetaan dependensi waktu, kausalitas, dan determinisme eksekusi.",
    realWorldUsage: "Git commit tree DAG, monorepo build graph (Turborepo/Bazel), & Airflow DAGs.",
    position: [0, 0, -5.2],
  },
  {
    id: "event-stream",
    name: "Reactive Streams & Event Pipeline",
    category: "EVENT-DRIVEN",
    badge: "STREAM",
    color: "#ec4899",
    border: "#f472b6",
    formula: "Throughput: O(1) append-log",
    concept: "Pemisahan produsen dan konsumen data melalui append-only commit log dengan penanganan backpressure.",
    realWorldUsage: "Apache Kafka, AWS Kinesis, RabbitMQ, & microservices event-driven scalability.",
    position: [0, 0, 5.2],
  },
];

/* ============================================================
   DEVOPS LAUNCHPAD & CLOUD INFRASTRUCTURE DATA
============================================================ */
export interface DevOpsStationNode {
  id: string;
  name: string;
  category: string;
  badge: string;
  color: string;
  border: string;
  formula: string;
  concept: string;
  realWorldUsage: string;
  position: [number, number, number]; // local coordinate inside Aerospace corner
}

export const DEVOPS_LAUNCHPAD_NODES: DevOpsStationNode[] = [
  {
    id: "ci-pipeline",
    name: "Automated CI Pipeline & Test Matrix",
    category: "CONTINUOUS INTEGRATION",
    badge: "CI/CD",
    color: "#38bdf8",
    border: "#60a5fa",
    formula: "Git Push ➔ Lint ➔ Test ➔ Build",
    concept: "Validasi otomatis setiap commit menggunakan runner paralel untuk mendeteksi regresi kode sebelum merge.",
    realWorldUsage: "GitHub Actions, GitLab CI, Argo Workflows, & Tekton Pipelines.",
    position: [-5.8, 0, -3.5],
  },
  {
    id: "k8s-mesh",
    name: "Containerization & Kubernetes Mesh",
    category: "ORCHESTRATION",
    badge: "K8S",
    color: "#3b82f6",
    border: "#60a5fa",
    formula: "Desired State == Current State",
    concept: "Isolasi proses via Linux cgroups/namespaces & manajemen cluster otomatis (self-healing, autoscaling, rolling update).",
    realWorldUsage: "Kubernetes (k8s), Docker, containerd, & Helm Charts.",
    position: [5.8, 0, -3.5],
  },
  {
    id: "iac-gitops",
    name: "Infrastructure as Code & GitOps",
    category: "DECLARATIVE CLOUD",
    badge: "IaC",
    color: "#a855f7",
    border: "#c084fc",
    formula: "Declarative: Code == Cloud State",
    concept: "Penyediaan server, VPC, database, dan DNS secara terprogram, reproducible, dan version-controlled tanpa konfigurasi manual.",
    realWorldUsage: "Terraform, OpenTofu, AWS CloudFormation, Pulumi, & Ansible.",
    position: [-5.8, 0, 4.5],
  },
  {
    id: "sre-telemetry",
    name: "Full-Stack Observability & SRE Radar",
    category: "SITE RELIABILITY",
    badge: "SRE",
    color: "#10b981",
    border: "#34d399",
    formula: "MELT: Metrics, Events, Logs, Traces",
    concept: "Monitoring kesehatan infrastruktur, deteksi anomali real-time, profiling latensi terdistribusi, dan penegakan SLO 99.99%.",
    realWorldUsage: "Prometheus, Grafana, OpenTelemetry, Datadog, & Jaeger Tracing.",
    position: [5.8, 0, 4.5],
  },
  {
    id: "orbital-deploy",
    name: "Zero-Downtime Release & Traffic Ingress",
    category: "RELEASE STRATEGY",
    badge: "DEPLOY",
    color: "#f59e0b",
    border: "#fbbf24",
    formula: "Traffic: Blue (100% ➔ 0%) | Green (0% ➔ 100%)",
    concept: "Teknik peluncuran sistem tanpa henti layanan (Blue/Green Deployment, Canary Release) melalui intelligent reverse proxy.",
    realWorldUsage: "Envoy Proxy, Nginx Ingress, Istio Service Mesh, & Cloudflare Edge.",
    position: [0, 0, -8.0],
  },
];

/* ============================================================
   CLEAN ARCHITECTURE & CRAFTSMANSHIP ZEN SANCTUARY DATA
============================================================ */
export interface ZenArchitectureNode {
  id: string;
  name: string;
  category: string;
  badge: string;
  color: string;
  border: string;
  formula: string;
  concept: string;
  realWorldUsage: string;
  position: [number, number, number]; // local coordinate inside Zen corner
}

export const ZEN_ARCHITECTURE_NODES: ZenArchitectureNode[] = [
  {
    id: "hexagonal-core",
    name: "The Hexagonal Core & Domain-Driven Design",
    category: "ARCHITECTURE",
    badge: "DDD",
    color: "#f59e0b",
    border: "#fbbf24",
    formula: "Domain Core ⟂ Ports & Adapters",
    concept: "Pemisahan logika bisnis murni dari database, web framework, dan dependensi eksternal agar sistem tahan lama dan mudah diuji.",
    realWorldUsage: "Enterprise core systems, banking ledger, Clean Architecture, & Hexagonal microservices.",
    position: [0, 0, 0],
  },
  {
    id: "solid-principles",
    name: "SOLID Principles & Clean Code Monolith",
    category: "SOFTWARE DESIGN",
    badge: "SOLID",
    color: "#38bdf8",
    border: "#60a5fa",
    formula: "High Cohesion, Loose Coupling",
    concept: "5 hukum dasar desain rekayasa perangkat lunak untuk menghasilkan sistem yang modular, dapat diperluas, dan mudah dirawat.",
    realWorldUsage: "Single Responsibility, Open/Closed, Liskov, Interface Segregation, & Dependency Inversion.",
    position: [0, 0, -4.8],
  },
  {
    id: "zero-trust",
    name: "Zero-Trust Security & Cryptographic Vault",
    category: "CYBERSECURITY",
    badge: "SEC",
    color: "#ef4444",
    border: "#f87171",
    formula: "Never Trust, Always Verify",
    concept: "Arsitektur keamanan modern tanpa batas perimeter implisit: setiap request wajib terotentikasi, terotorisasi, dan terenkripsi.",
    realWorldUsage: "AES-256-GCM, Ed25519 asymmetric keys, OAuth 2.1 / OIDC, TLS 1.3, & mTLS.",
    position: [0, 0, 4.8],
  },
  {
    id: "big-o-harmony",
    name: "Algorithmic Big-O Harmony & Complexity",
    category: "ALGORITHMS",
    badge: "BIG-O",
    color: "#10b981",
    border: "#34d399",
    formula: "T(n) ⚖️ S(n) [Time vs Space]",
    concept: "Keseimbangan trade-off antara kecepatan eksekusi algoritma dan efisiensi alokasi memori komputer.",
    realWorldUsage: "O(1) Hash Map access, O(log N) Binary Trees / B-Trees, & O(N log N) Quicksort/Mergesort.",
    position: [-4.8, 0, 0],
  },
  {
    id: "craftsmanship",
    name: "Software Craftsmanship & Test Pyramid",
    category: "QUALITY & TESTING",
    badge: "TDD",
    color: "#a855f7",
    border: "#c084fc",
    formula: "Unit (70%) > Integration (20%) > E2E (10%)",
    concept: "Disiplin rekayasa kode berkelanjutan: otomatisasi pengujian, refactoring konstan (Boy Scout Rule), dan desain ekspresif.",
    realWorldUsage: "Test-Driven Development (TDD), CI test suites, Vitest/Jest, & clean refactoring.",
    position: [4.8, 0, 0],
  },
];

function getTechBadgeTexture(item: TechPillarData): THREE.CanvasTexture {
  const key = `tech-badge-${item.id}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const S = 256;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);

  // Dark translucent background with subtle metallic border
  roundedRect(ctx, 8, 8, S - 16, S - 16, 24);
  ctx.fillStyle = "rgba(10, 15, 26, 0.94)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = item.border;
  ctx.stroke();

  // Top category badge pill
  roundedRect(ctx, 32, 22, S - 64, 28, 8);
  ctx.fillStyle = "rgba(30, 41, 59, 0.9)";
  ctx.fill();
  ctx.fillStyle = item.border;
  ctx.font = "bold 12px Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText(item.category, S / 2, 41);

  // Large center monogram / symbol
  ctx.fillStyle = item.color;
  ctx.font = "900 52px Consolas, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item.badge, S / 2, 126);

  // Tech name at bottom
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 20px Consolas, monospace";
  ctx.fillText(item.name, S / 2, 185);

  // Subtle accent line
  ctx.strokeStyle = item.border;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(56, 205);
  ctx.lineTo(S - 56, 205);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

function getCodeRuneTexture(glyph: string, color: string): THREE.CanvasTexture {
  const key = `code-rune-${glyph}-${color}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);

  // Soft glowing glyph on dark transparent glass badge
  roundedRect(ctx, 4, 4, S - 8, S - 8, 16);
  ctx.fillStyle = "rgba(10, 15, 26, 0.78)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = "bold 38px Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(glyph, S / 2, S / 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

/* ============================================================
   1. FLOATING COSMIC STARDUST (Debu Bintang & Partikel Kosmis di Jurang Hampa)
============================================================ */
function FloatingCosmicStardust({ count = 140, radius = 90 }: { count?: number; radius?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color("#38bdf8"),
      new THREE.Color("#818cf8"),
      new THREE.Color("#c084fc"),
      new THREE.Color("#ec4899"),
      new THREE.Color("#34d399"),
    ];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 58 + Math.random() * (radius - 58);
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 45 - 6;
      pos[i * 3 + 2] = Math.sin(angle) * r;

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count, radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.7}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ============================================================
   2. FLOATING DIGITAL ISLAND (Pulau Mengambang Futuristik di Ruang Angkasa)
   - Deck Permukaan Cyber (110m x 110m)
   - Bibir Tebing Pulau dengan Strip Laser Neon Cyan (#38bdf8)
   - Titanium Beveled Hull di Sisi Samping Dek
   - Pendaran Cahaya Kosmis di Bawah Lambung Pulau
============================================================ */
function FloatingDigitalIsland({ size = 55.0 }: { size?: number }) {
  const floorTex = useMemo(() => getCyberFloorTexture(), []);
  const sideLen = size * 2;

  return (
    <group>
      {/* 1. Main Deck Surface Floor Plate */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[sideLen, sideLen]} />
        <meshStandardMaterial map={floorTex} roughness={0.4} metalness={0.6} />
      </mesh>

      {/* 2. Perimeter Cyber Laser Glow Trim (Bibir Tepi Pulau) */}
      {/* Sisi Utara & Selatan (z = ±size) */}
      {[-size, size].map((zPos, idx) => (
        <group key={`edge-ns-${idx}`}>
          {/* Top Neon Laser Edge Line */}
          <mesh position={[0, 0.02, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, sideLen, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Beveled Hull Plate Drop */}
          <mesh position={[0, -1.0, zPos]}>
            <boxGeometry args={[sideLen, 2.0, 0.25]} />
            <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Bottom Neon Accent Rail */}
          <mesh position={[0, -2.02, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.02, 0.02, sideLen, 8]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </group>
      ))}

      {/* Sisi Barat & Timur (x = ±size) */}
      {[-size, size].map((xPos, idx) => (
        <group key={`edge-we-${idx}`}>
          {/* Top Neon Laser Edge Line */}
          <mesh position={[xPos, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, sideLen, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          {/* Beveled Hull Plate Drop */}
          <mesh position={[xPos, -1.0, 0]}>
            <boxGeometry args={[0.25, 2.0, sideLen]} />
            <meshStandardMaterial color="#080e1c" roughness={0.3} metalness={0.9} />
          </mesh>
          {/* Bottom Neon Accent Rail */}
          <mesh position={[xPos, -2.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, sideLen, 8]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>
        </group>
      ))}

      {/* 3. Under-Deck Floating Tech Keel / Inverse Sub-hull */}
      <mesh position={[0, -2.8, 0]}>
        <boxGeometry args={[sideLen * 0.88, 1.4, sideLen * 0.88]} />
        <meshStandardMaterial color="#050914" roughness={0.4} metalness={0.95} />
      </mesh>
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[sideLen * 0.88 + 0.1, 0.04, sideLen * 0.88 + 0.1]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>

      {/* 4. Soft Underside Void Ambient Glow */}
      <pointLight color="#0284c7" intensity={8} distance={38} position={[0, -8, 0]} />
    </group>
  );
}

/* ============================================================
   FOUR MINIMALIST THEMED CORNER ARENAS
   1. Zen Gallery / Apple-Style Digital Pavilion (North-West: [-32, 0, -32])
   2. Floating Monolith Courtyard / Stargazer Sky Platform (North-East: [32, 0, -32])
   3. Clean Aerospace Runway / Minimalist Hangar Apron (South-West: [-32, 0, 32])
   4. Cyber Oasis / Japanese Zen Rock Garden (South-East: [32, 0, 32])
============================================================ */

/* ============================================================
   ZEN DIGITAL GALLERY ARTWORKS DATA & TYPES
============================================================ */
export type ZenPillarId = "prism" | "mobius" | "gyroscope" | "bonsai";

export interface ZenGalleryArtwork {
  id: ZenPillarId;
  exhibitNumber: string;
  title: string;
  subtitle: string;
  categoryBadge: string;
  coreConcept: string;
  problemSolved: string;
  educationalTakeaways: string[];
  year: string;
  medium: string;
  filename: string;
  language: "typescript" | "python";
  stackTags: string[];
  metrics: { label: string; value: string }[];
  description: string;
  codeSnippet: string;
  philosophy: string;
  accent: string;
  borderAccent: string;
  learnMoreUrl: string;
}

export const ZEN_GALLERY_ARTWORKS: Record<ZenPillarId, ZenGalleryArtwork> = {
  prism: {
    id: "prism",
    exhibitNumber: "01",
    title: "Fixed Timestep vs Render Loop: Solving the Tunneling Trap",
    subtitle: "Computer Graphics & Real-Time Physics Engine Synchronization",
    categoryBadge: "Spatial Engine Architecture",
    coreConcept: "Pemisahan deterministik antara siklus fisika diskrit (Fixed Timestep) dan siklus rendering monitor (Variable Delta Rate).",
    problemSolved: "Dalam game & simulasi 3D, jika kalkulasi gerak diikat langsung ke delta waktu monitor (requestAnimationFrame), penurunan frame drastis akan memperbesar langkah perpindahan objek (step displacement). Akibatnya, proyektil atau karakter berkecepatan tinggi dapat menembus dinding tebal tanpa terdeteksi tabrakan (masalah klasik 'Tunneling').",
    educationalTakeaways: [
      "Jangan pernah mengeksekusi kalkulasi posisi fisika langsung di dalam variabel delta render yang fluktuatif.",
      "Gunakan Fixed Timestep Accumulator (misal: tepat 1/60 detik = 16.6ms) agar pergerakan selalu deterministik dan stabil di semua perangkat.",
      "Interpolasikan posisi visual (alpha blend) antara state fisik sebelumnya dan state fisik saat ini agar gerakan tetap mulus di monitor 120Hz/144Hz.",
      "Terapkan dead-reckoning saat menyinkronkan posisi multiplayer melalui WebSocket untuk menyamarkan latensi jaringan internet.",
    ],
    year: "Computer Science Foundation",
    medium: "Interactive WebGL Simulation / Deterministic Physics Pipeline",
    filename: "fixed_timestep_accumulator.ts",
    language: "typescript",
    stackTags: ["Fixed Timestep", "Dead Reckoning", "Game Physics", "Frame Budgeting"],
    metrics: [
      { label: "Physics Rate", value: "60Hz Fixed (16.6ms)" },
      { label: "Render Hz", value: "Variable 60-144Hz" },
      { label: "Tunneling Risk", value: "Zero (Sub-Stepped)" },
    ],
    description: "Eksibisi ini mendemonstrasikan bagaimana mesin komputasi spasial memproses realitas virtual. Inti dari stabilitas simulasi adalah kepastian matematis: kalkulasi fisika harus selalu berjalan pada interval waktu diskrit yang identik, terlepas apakah layar pengguna berjalan lambat di 30 FPS atau cepat di 144 FPS.",
    codeSnippet: `// 💡 EDUKASI: Pola Pemisahan Fixed Timestep vs Render Loop
// Mencegah masalah 'tunneling' objek menembus dinding saat frame drop.

export function runPhysicsTickPipeline(
  state: SimulationState,
  deltaSec: number,
  physicsWorld: PhysicsEngine
) {
  const FIXED_STEP = 1 / 60; // Tepat 16.66 milidetik per kalkulasi fisika
  const MAX_ACCUMULATOR = 0.2; // Batas perlindungan dari 'spiral of death' jika lag parah

  // 1. Kumpulkan waktu delta yang berjalan di frame render
  state.accumulator += Math.min(deltaSec, MAX_ACCUMULATOR);

  // 2. Eksekusi kalkulasi fisika hanya dalam interval fixed time
  while (state.accumulator >= FIXED_STEP) {
    physicsWorld.step(FIXED_STEP); // Deterministik, konsisten di semua PC
    state.accumulator -= FIXED_STEP;
  }

  // 3. Hitung rasio sisa waktu untuk interpolasi visual di monitor 120Hz+
  const alpha = state.accumulator / FIXED_STEP;
  renderInterpolation(state.previousTransform, state.currentTransform, alpha);
}`,
    philosophy: "Deterministik dalam kalkulasi, dinamis dalam visualisasi: stabilitas sistem real-time bergantung pada disiplin pemisahan state waktu.",
    accent: "text-sky-300 bg-sky-500/10 border-sky-500/30",
    borderAccent: "#38bdf8",
    learnMoreUrl: "https://gafferongames.com/post/fix_your_timestep/",
  },
  mobius: {
    id: "mobius",
    exhibitNumber: "02",
    title: "Asynchronous Resilient Event Loops & Task Queues",
    subtitle: "Distributed Systems, Idempotency & Exponential Backoff with Jitter",
    categoryBadge: "Distributed Cloud Architecture",
    coreConcept: "Pola pemrosesan asynchronous berdaya tahan tinggi (Resilient Event-Driven Pipeline) dengan buffer antrean terdistribusi dan strategi self-healing backoff.",
    problemSolved: "Jika arsitektur backend memanggil API eksternal (seperti LLM atau database eksternal) secara synchronous (blocking) saat terjadi lonjakan trafik mendadak, thread pool server akan terkuras habis. Ini memicu 'cascading failure' di mana seluruh ekosistem layanan mikro crash secara beruntun.",
    educationalTakeaways: [
      "Pisahkan penerimaan tugas (ingress HTTP) dari pengerjaan beban berat menggunakan antrean pesan (message queue buffer).",
      "Selalu tambahkan 'Jitter' (variasi acak) pada Exponential Backoff agar request yang gagal tidak me-retry serentak membanjiri server hilir (thundering herd problem).",
      "Pastikan setiap tugas bersifat Idempoten: mengeksekusi tugas yang sama 2 kali harus menghasilkan kondisi akhir yang sama persis tanpa duplikasi transaksi.",
      "Terapkan Dead-Letter Queue (DLQ) untuk mengisolasi pesan yang rusak tanpa menghentikan pemrosesan pesan antrean lainnya.",
    ],
    year: "Distributed Systems",
    medium: "Async Event Pipeline / Rate Limiter & Circuit Breaker Model",
    filename: "resilient_async_worker.py",
    language: "python",
    stackTags: ["AsyncIO", "Event Loop", "Task Queue", "Exponential Backoff"],
    metrics: [
      { label: "Concurrency", value: "Non-Blocking Async" },
      { label: "Retry Strategy", value: "Exp Backoff + Jitter" },
      { label: "Failure Isolation", value: "Dead-Letter Queue" },
    ],
    description: "Eksibisi Möbius merepresentasikan siklus kontinu sebuah event loop. Seperti topologi Möbius yang tak berujung, sistem terdistribusi modern dirancang untuk mengalir tanpa henti: saat error tak terduga muncul, sistem tidak panik ataupun crash, melainkan merespons dengan perlambatan terkontrol (graceful degradation) dan retry otomatis.",
    codeSnippet: `# 💡 EDUKASI: Arsitektur Resilient Worker dengan Exponential Backoff + Jitter
# Mencegah 'Thundering Herd' ketika layanan eksternal mengalami gangguan.

import asyncio, random

class ResilientJobProcessor:
    def __init__(self, queue, max_retries: int = 5):
        self.queue = queue
        self.max_retries = max_retries

    def compute_backoff_with_jitter(self, attempt: int, base_delay: float = 0.5) -> float:
        # Full Jitter: Sleep = random_between(0, min(cap, base * 2 ** attempt))
        # Memecah gelombang retry serentak agar server hilir dapat bernapas
        exponential_limit = min(30.0, base_delay * (2 ** attempt))
        return random.uniform(0.1, exponential_limit)

    async def execute_task_loop(self):
        while True:
            job = await self.queue.pop_next_job()
            try:
                # Tugas harus Idempoten (aman diulang jika jaringan sempat putus)
                await self.process_idempotent_task(job)
            except ExternalServiceRateLimitError:
                delay = self.compute_backoff_with_jitter(job.retry_count)
                await asyncio.sleep(delay)
                await self.queue.requeue(job)`,
    philosophy: "Sistem yang tangguh bukan sistem yang tidak pernah gagal, melainkan sistem yang dirancang untuk pulih secara mandiri saat kegagalan terjadi.",
    accent: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    borderAccent: "#f59e0b",
    learnMoreUrl: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/",
  },
  gyroscope: {
    id: "gyroscope",
    exhibitNumber: "03",
    title: "Spatial Hashing: Slashing O(N²) Collisions to O(1)",
    subtitle: "Discrete Coordinate Hashing & Spatial Data Structures",
    categoryBadge: "Algorithmic Efficiency & Math",
    coreConcept: "Algoritma partisi ruang matematis (Spatial Hashing) yang memetakan objek kontinu ke dalam sel-sel bucket diskrit untuk mendeteksi kedekatan instan.",
    problemSolved: "Pendekatan naif (brute-force) membandingkan setiap objek dengan semua objek lain membutuhkan N*(N-1)/2 perbandingan (kompleksitas kuadratik O(N²)). Pada 2.000 objek, terjadi hampir 2.000.000 komparasi per frame (60 kali/detik) yang langsung membekukan CPU.",
    educationalTakeaways: [
      "Bagi ruang dunia menjadi sel grid diskrit berukuran teratur (misal: 4m x 4m) menggunakan fungsi hash bilangan prima integer.",
      "Pindahkan pencarian dari 'seluruh dunia' menjadi hanya memeriksa objek yang menempati sel yang sama atau 8 sel tetangga terdekat.",
      "Kompleksitas komputasi terpangkas dari kuadratik O(N²) menjadi waktu konstan O(1) amortized.",
      "Gunakan flat arrays atau pre-allocated object pools untuk mencegah alokasi memori dinamis yang memicu Garbage Collection lag.",
    ],
    year: "Data Structures & Algorithms",
    medium: "Spatial Hash Table / Vector Geometry Optimization",
    filename: "spatial_hash_partition.ts",
    language: "typescript",
    stackTags: ["Spatial Partitioning", "Big-O Optimization", "Hash Collisions", "Memory Locality"],
    metrics: [
      { label: "Complexity", value: "O(1) Amortized" },
      { label: "Broadphase Cost", value: "< 0.2ms / frame" },
      { label: "Memory GC", value: "Zero Allocations" },
    ],
    description: "Tiga cincin konsentris giroskop melambangkan pemetaan koordinat ruang (X, Y, Z). Eksibisi ini mengajarkan salah satu lompatan performa paling fundamental dalam ilmu komputer: mengubah masalah penelusuran ruang yang berat menjadi pencarian kamus hash cepat berbasis aritmatika integer.",
    codeSnippet: `// 💡 EDUKASI: Spatial Hashing untuk Collision Detection O(1)
// Mengeliminasi pemeriksaan kuadratik O(N²) menjadi lookup instan.

export class SpatialHashGrid {
  private cellSize: number = 4.0; // Ukuran sel grid dalam satuan meter
  private buckets = new Map<number, Entity[]>();

  // Hash koordinat ruang kontinu ke integer 32-bit diskrit
  public hash(x: number, z: number): number {
    const cx = Math.floor(x / this.cellSize);
    const cz = Math.floor(z / this.cellSize);
    // Kombinasikan koordinat dengan perkalian bilangan prima besar
    return ((cx * 73856093) ^ (cz * 19349663)) >>> 0;
  }

  // Hanya periksa tabrakan terhadap entitas di sel yang relevan!
  public queryNearby(x: number, z: number): Entity[] {
    const cellKey = this.hash(x, z);
    return this.buckets.get(cellKey) || [];
    // Hasil: hanya memeriksa ~4 objek terdekat, bukan 2.000 objek dunia!
  }
}`,
    philosophy: "Struktur data yang tepat mengubah komputasi yang mustahil menjadi instan tanpa memerlukan perangkat keras yang lebih mahal.",
    accent: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30",
    borderAccent: "#818cf8",
    learnMoreUrl: "https://en.wikipedia.org/wiki/Spatial_hash",
  },
  bonsai: {
    id: "bonsai",
    exhibitNumber: "04",
    title: "The Zen of Clean Architecture & Pruning Complexity",
    subtitle: "Software Craftsmanship, SOLID Principles & Preventing Code Rot",
    categoryBadge: "Software Engineering Principles",
    coreConcept: "Filosofi perawatan kode jangka panjang: secara berkala memangkas 'dead code', mengisolasi domain independen, dan melawan entropi perangkat lunak.",
    problemSolved: "Seiring bertambahnya usia perangkat lunak, penambahan fitur tanpa refactoring menciptakan 'software rot' (pembusukan arsitektur). Kode menjadi saling terikat erat (tightly coupled), sehingga mengubah 1 baris di satu tempat bisa merusak modul yang sama sekali tidak berhubungan.",
    educationalTakeaways: [
      "Kode dibaca 10 kali lebih sering daripada ditulis. Jangan korbankan keterbacaan demi kode yang tampak 'pintar' namun sulit dipahami.",
      "Prinsip Single Responsibility: Satu modul atau fungsi idealnya hanya menyelesaikan satu tugas spesifik dan memiliki satu alasan untuk berubah.",
      "Pangkas ketergantungan (dependencies) yang tidak perlu seperti memangkas cabang pohon bonsai yang mati agar nutrisi mengalir ke struktur inti.",
      "Tulis unit test sebagai jaring pengaman (safety net) sehingga refactoring besar dapat dilakukan dengan rasa percaya diri penuh.",
    ],
    year: "Software Craftsmanship",
    medium: "Domain-Driven Design / Static Analysis / Clean Code Heuristics",
    filename: "clean_architecture_zen.ts",
    language: "typescript",
    stackTags: ["Clean Architecture", "SOLID Principles", "Refactoring", "Domain Decoupling"],
    metrics: [
      { label: "Cognitive Load", value: "Minimal & Clean" },
      { label: "Coupling", value: "Loosely Coupled" },
      { label: "Maintainability", value: "High / Scalable" },
    ],
    description: "Pohon bonsai di taman zen ini adalah metafora nyata dari seni rekayasa perangkat lunak: keindahan dan kekuatan bukan berasal dari seberapa besar dan liarnya pohon tumbuh, melainkan dari kedisiplinan memangkas kerumitan yang tak berfaedah demi menjaga kemurnian dan daya tahan struktur intinya.",
    codeSnippet: `// 💡 EDUKASI: Zen Arsitektur Bersih - Memangkas Kompleksitas (Refactoring)
// Kode yang baik adalah kode yang mudah dipahami, mudah diuji, dan mudah diubah.

export interface SoftwareArchitectureHealth {
  // 1. Single Responsibility: Apakah setiap fungsi hanya punya 1 tugas?
  readonly singleResponsibilityRatio: number; // Target: 1.0 (Tinggi)
  
  // 2. Cyclomatic Complexity: Jumlah cabang percabangan logika per fungsi
  readonly averageCyclomaticComplexity: number; // Target: <= 4 (Rendah)
  
  // 3. Dead Code Pruning: Persentase kode mati yang belum dibersihkan
  readonly unreferencedCodeRatio: number; // Target: 0.0% (Terpangkas rapi)
}

export function evaluateEngineeringZen(metrics: SoftwareArchitectureHealth): string {
  if (metrics.averageCyclomaticComplexity <= 4 && metrics.unreferencedCodeRatio === 0) {
    return "HARMONIC_ZEN: Arsitektur stabil, mudah dirawat, minim technical debt.";
  }
  return "PRUNING_REQUIRED: Pangkas cabang logika yang kusut sebelum menambah fitur baru.";
}`,
    philosophy: "Kesederhanaan adalah prasyarat utama keandalan sistem. Kode terbaik bukanlah kode yang tidak bisa ditambah lagi, melainkan kode yang tidak ada lagi yang perlu dihapus.",
    accent: "text-teal-300 bg-teal-500/10 border-teal-500/30",
    borderAccent: "#14b8a6",
    learnMoreUrl: "https://martinfowler.com/books/refactoring.html",
  },
};

/* --- Surrounding Floating Tech Ecosystem Artifact --- */
function TechMonolithPillar({
  item,
  position,
  index = 0,
}: {
  item: TechPillarData;
  position: [number, number, number];
  index?: number;
}) {
  const floatingGroupRef = useRef<THREE.Group>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const badgeTex = useMemo(() => getTechBadgeTexture(item), [item]);

  // Staggered levitation height so the constellation feels dynamic, undulating, and layered
  const baseY = useMemo(() => 1.85 + ((index * 3) % 4) * 0.32, [index]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (floatingGroupRef.current) {
      // Gentle floating bobbing in the air
      floatingGroupRef.current.position.y =
        baseY + Math.sin(t * 1.5 + index * 0.8) * 0.15;
      // Continuous smooth yaw rotation
      floatingGroupRef.current.rotation.y += delta * 0.45;
      // Floating pitch/roll wobble
      floatingGroupRef.current.rotation.x = Math.sin(t * 1.1 + index) * 0.06;
      floatingGroupRef.current.rotation.z = Math.cos(t * 1.3 + index) * 0.06;
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y -= delta * 0.85;
      orbitGroupRef.current.rotation.x += delta * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Sleek Anti-Gravity Ground Projector Disk */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.06, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Ground Projection Halo Ring in Brand Color */}
      <mesh position={[0, 0.062, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.34, 24]} />
        <meshBasicMaterial color={item.color} transparent opacity={0.65} />
      </mesh>

      {/* Ethereal Levitating Light Beam */}
      <mesh position={[0, baseY * 0.5, 0]}>
        <cylinderGeometry args={[0.015, 0.04, baseY, 8]} />
        <meshBasicMaterial
          color={item.color}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Floating Kinetic Tech Artifact (Berterbangan di Udara) */}
      <group ref={floatingGroupRef} position={[0, baseY, 0]}>
        {/* Double-Sided Floating Glass Badge Display */}
        <mesh>
          <planeGeometry args={[0.62, 0.62]} />
          <meshStandardMaterial
            map={badgeTex}
            transparent
            opacity={0.96}
            roughness={0.1}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Diamond Outer Crystalline Frame */}
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.46, 0.49, 16]} />
          <meshBasicMaterial color={item.border} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* Orbiting Satellite Micro-Runes / Nodes */}
        <group ref={orbitGroupRef}>
          <mesh position={[0.54, 0, 0]}>
            <octahedronGeometry args={[0.045, 0]} />
            <meshStandardMaterial
              color={item.color}
              roughness={0.2}
              metalness={0.9}
              emissive={item.color}
              emissiveIntensity={0.6}
            />
          </mesh>
          <mesh position={[-0.54, 0, 0]}>
            <octahedronGeometry args={[0.035, 0]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* Soft Ambient Brand Glow Light */}
      <pointLight position={[0, baseY, 0]} color={item.color} intensity={0.85} distance={3.8} />
    </group>
  );
}

/* --- Exhibit 05: Neural Matrix Hypercube (AI & High-Performance Compute • Northeast Quad) --- */
function NeuralMatrixExhibit({ position }: { position: [number, number, number] }) {
  const outerCubeRef = useRef<THREE.Group>(null);
  const innerCubeRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (outerCubeRef.current) {
      outerCubeRef.current.rotation.x += delta * 0.4;
      outerCubeRef.current.rotation.y += delta * 0.55;
      outerCubeRef.current.position.y = 1.35 + Math.sin(t * 1.3) * 0.04;
    }
    if (innerCubeRef.current) {
      innerCubeRef.current.rotation.x -= delta * 0.6;
      innerCubeRef.current.rotation.z += delta * 0.45;
    }
    if (coreRef.current) {
      const scale = 1.0 + Math.sin(t * 3.0) * 0.08;
      coreRef.current.scale.set(scale, scale, scale);
    }
    if (orbitGroupRef.current) {
      orbitGroupRef.current.rotation.y += delta * 0.8;
      orbitGroupRef.current.rotation.x += delta * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Basalt Pedestal (Matching Cyber Bonsai) */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.45, 1.1]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Plinth Accent Trim in Electric Cyan-Violet */}
      <mesh position={[0, 0.53, 0]}>
        <boxGeometry args={[1.14, 0.02, 1.14]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Levitating 4D Neural Hypercube */}
      <group position={[0, 1.35, 0]}>
        {/* Outer Rotating Wireframe Cube */}
        <group ref={outerCubeRef}>
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.72, 0.72]} />
            <meshStandardMaterial
              color="#06b6d4"
              wireframe
              roughness={0.2}
              metalness={0.9}
              emissive="#0891b2"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>

        {/* Inner Counter-Rotating Nested Octahedron */}
        <group ref={innerCubeRef}>
          <mesh castShadow>
            <octahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial
              color="#a855f7"
              wireframe
              roughness={0.2}
              metalness={0.85}
              emissive="#7e22ce"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Pulsing Quantum Neural Core */}
        <mesh ref={coreRef} castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial
            color="#ec4899"
            roughness={0.1}
            metalness={0.95}
            emissive="#db2777"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Orbiting Synapse Node Micro-Spheres */}
        <group ref={orbitGroupRef}>
          {[
            [0.55, 0.2, 0],
            [-0.55, -0.2, 0],
            [0, 0.55, 0.2],
            [0, -0.55, -0.2],
          ].map((pos, idx) => (
            <mesh key={`synapse-${idx}`} position={pos as [number, number, number]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#67e8f9" />
            </mesh>
          ))}
        </group>
      </group>

      {/* Dedicated Soft Micro-Spotlight */}
      <pointLight position={[0, 0.7, 0]} color="#06b6d4" intensity={1.5} distance={5.5} />
    </group>
  );
}

/* --- Floating Code Runes Cloud (Syntax Tokens Berterbangan di Udara) --- */
const CODE_GLYPHS = [
  { glyph: "{ }", color: "#38bdf8" },
  { glyph: "=>", color: "#f59e0b" },
  { glyph: "</>", color: "#34d399" },
  { glyph: "λ", color: "#a855f7" },
  { glyph: "01", color: "#06b6d4" },
  { glyph: "fn", color: "#ec4899" },
  { glyph: "async", color: "#fb923c" },
  { glyph: "::", color: "#818cf8" },
  { glyph: "*ptr", color: "#60a5fa" },
  { glyph: "type", color: "#facc15" },
  { glyph: "[]", color: "#2dd4bf" },
  { glyph: "&ref", color: "#f43f5e" },
];

function FloatingCodeRunesCloud({ count = 36 }: { count?: number }) {
  const runeItems = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const g = CODE_GLYPHS[i % CODE_GLYPHS.length];
      const radius = 1.4 + Math.random() * 5.6;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        glyph: g.glyph,
        color: g.color,
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        y: 0.6 + Math.random() * 3.4,
        speed: 0.22 + Math.random() * 0.26,
        swaySpeed: 0.8 + Math.random() * 0.7,
        swayAmp: 0.15 + Math.random() * 0.18,
        rotSpeed: (Math.random() - 0.5) * 0.6,
        seed: Math.random() * 10,
        scale: 0.26 + Math.random() * 0.1,
      };
    });
  }, [count]);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < runeItems.length; i++) {
      const item = runeItems[i];
      const el = refs.current[i];
      if (!el) continue;

      item.y += delta * item.speed;
      if (item.y > 4.2) {
        item.y = 0.5;
      }

      el.position.y = item.y;
      el.position.x = item.baseX + Math.sin(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.position.z = item.baseZ + Math.cos(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.rotation.y += delta * item.rotSpeed;
    }
  });

  return (
    <group>
      {runeItems.map((item, i) => {
        const tex = getCodeRuneTexture(item.glyph, item.color);
        return (
          <group
            key={`code-rune-${i}`}
            ref={(r) => {
              refs.current[i] = r;
            }}
            position={[item.baseX, item.y, item.baseZ]}
          >
            <mesh>
              <planeGeometry args={[item.scale, item.scale]} />
              <meshStandardMaterial
                map={tex}
                transparent
                opacity={0.82}
                roughness={0.2}
                metalness={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* --- Cyber Bonsai Tree (The Digital Pine Bonsai &bull; Organic Harmony) --- */
function CyberBonsaiTree({
  position,
  accentColor = "#0f766e",
  glowColor = "#5eead4",
}: {
  position: [number, number, number];
  accentColor?: string;
  glowColor?: string;
}) {
  const foliageRef = useRef<THREE.Group>(null);
  const pollenRef = useRef<THREE.Points>(null);

  // Procedural drift particles
  const pollenPositions = useMemo(() => {
    const arr = new Float32Array(36 * 3);
    for (let i = 0; i < 36; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 1.4;
      arr[i * 3 + 1] = Math.random() * 1.3 + 0.3;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (foliageRef.current) {
      foliageRef.current.rotation.y = Math.sin(t * 0.7) * 0.04;
      foliageRef.current.position.y = Math.sin(t * 1.1) * 0.012;
    }
    if (pollenRef.current) {
      pollenRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group position={position}>
      {/* Basalt Plinth Stand */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.44, 0.95]} />
        <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Plinth Bronze Accent Lip */}
      <mesh position={[0, 0.445, 0]}>
        <boxGeometry args={[0.98, 0.015, 0.98]} />
        <meshStandardMaterial color={accentColor} roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Shallow Slate Ceramic Bonsai Pot */}
      <mesh position={[0, 0.51, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 0.12, 0.58]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Dark Soil Bed */}
      <mesh position={[0, 0.575, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.66, 0.52]} />
        <meshStandardMaterial color="#090d16" roughness={0.95} />
      </mesh>

      {/* S-Curved Graphite Wood Trunk */}
      <group position={[0, 0.58, 0]}>
        {/* Base trunk segment angled right */}
        <mesh position={[0.04, 0.2, 0]} rotation={[0, 0, -0.25]} castShadow>
          <cylinderGeometry args={[0.065, 0.09, 0.42, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Mid trunk curve left */}
        <mesh position={[-0.04, 0.48, 0.02]} rotation={[0.1, 0, 0.32]} castShadow>
          <cylinderGeometry args={[0.048, 0.065, 0.38, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Main Upper Bough */}
        <mesh position={[0.05, 0.76, 0]} rotation={[-0.1, 0.2, -0.22]} castShadow>
          <cylinderGeometry args={[0.035, 0.048, 0.35, 12]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Branch 1 Left */}
        <mesh position={[-0.18, 0.54, 0.05]} rotation={[0, 0, 1.1]} castShadow>
          <cylinderGeometry args={[0.022, 0.035, 0.32, 8]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Branch 2 Right */}
        <mesh position={[0.22, 0.72, -0.04]} rotation={[0, 0, -1.0]} castShadow>
          <cylinderGeometry args={[0.02, 0.032, 0.28, 8]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} metalness={0.3} />
        </mesh>

        {/* Sculpted Pine Needle Foliage Clouds */}
        <group ref={foliageRef}>
          {/* Main Top Cloud */}
          <mesh position={[0.12, 0.98, 0]} castShadow>
            <dodecahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial color={accentColor} roughness={0.65} metalness={0.2} emissive={accentColor} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0.16, 1.05, 0.05]} castShadow>
            <dodecahedronGeometry args={[0.2, 1]} />
            <meshStandardMaterial color={glowColor} roughness={0.5} metalness={0.3} emissive={glowColor} emissiveIntensity={0.35} />
          </mesh>
          {/* Left Lower Cloud */}
          <mesh position={[-0.32, 0.62, 0.06]} castShadow>
            <dodecahedronGeometry args={[0.22, 1]} />
            <meshStandardMaterial color={accentColor} roughness={0.65} metalness={0.2} emissive={accentColor} emissiveIntensity={0.2} />
          </mesh>
          {/* Right Mid Cloud */}
          <mesh position={[0.36, 0.78, -0.05]} castShadow>
            <dodecahedronGeometry args={[0.24, 1]} />
            <meshStandardMaterial color={glowColor} roughness={0.6} metalness={0.2} emissive={glowColor} emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Floating Zen Pollen Particles */}
        <points ref={pollenRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[pollenPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial size={0.035} color={glowColor} transparent opacity={0.65} />
        </points>
      </group>

      {/* Dedicated Subtle Warm Micro-Spotlight */}
      <pointLight position={[0, 1.2, 0]} color={glowColor} intensity={0.7} distance={3.5} />
    </group>
  );
}

interface WaterRippleItem {
  id: number;
  x: number;
  z: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

/* --- Corner 1: Zen Minimalist Digital Gallery --- */
function ZenGalleryCorner({
  position,
  carRef,
  onNearbyArtwork,
  onNearbyTech,
  resonancePulseKey = 0,
}: {
  position: [number, number, number];
  carRef?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  onNearbyArtwork?: (artwork: ZenPillarId | null) => void;
  onNearbyTech?: (tech: TechPillarData | null) => void;
  resonancePulseKey?: number;
}) {
  const crystalRef = useRef<THREE.Group>(null);
  const crystalRingsRef = useRef<THREE.Group>(null);
  const mobiusRef = useRef<THREE.Group>(null);
  const gyroRing1Ref = useRef<THREE.Group>(null);
  const gyroRing2Ref = useRef<THREE.Group>(null);
  const gyroRing3Ref = useRef<THREE.Group>(null);
  const gyroCoreRef = useRef<THREE.Mesh>(null);
  const poolWaterRef = useRef<THREE.Mesh>(null);
  const flareRingRef = useRef<THREE.Mesh>(null);
  const currentNearbyRef = useRef<ZenPillarId | null>(null);
  const currentNearbyTechRef = useRef<TechPillarData | null>(null);

  // Dynamic Footstep Water Ripples State
  const [ripples, setRipples] = useState<WaterRippleItem[]>([]);
  const ripplesRef = useRef<WaterRippleItem[]>([]);
  ripplesRef.current = ripples;
  const lastFootstepPos = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const lastRippleTime = useRef(0);
  const hasEnteredRef = useRef(false);

  // Resonance Pulse Energy State
  const pulseEnergyRef = useRef(0);
  const lastPulseKeyRef = useRef(resonancePulseKey);

  useEffect(() => {
    if (resonancePulseKey > 0 && resonancePulseKey !== lastPulseKeyRef.current) {
      lastPulseKeyRef.current = resonancePulseKey;
      pulseEnergyRef.current = 4.5; // High burst of rotational kinetic velocity
    }
  }, [resonancePulseKey]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Decay resonance pulse energy
    if (pulseEnergyRef.current > 0.01) {
      pulseEnergyRef.current = THREE.MathUtils.lerp(pulseEnergyRef.current, 0, delta * 2.0);
    }
    const energyMult = 1.0 + pulseEnergyRef.current;

    // 1. Centerpiece Crystal & Outer Gimbal
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.35 * energyMult;
      crystalRef.current.rotation.x = Math.sin(t * 0.8) * 0.12;
      crystalRef.current.position.y = 1.35 + Math.sin(t * 1.2) * 0.05;
    }
    if (crystalRingsRef.current) {
      crystalRingsRef.current.rotation.z += delta * 0.25 * energyMult;
      crystalRingsRef.current.rotation.y -= delta * 0.2 * energyMult;
    }
    // Celestial Light Flare Ring during Resonance Pulse
    if (flareRingRef.current) {
      if (pulseEnergyRef.current > 0.05) {
        flareRingRef.current.scale.setScalar(1.0 + (4.5 - pulseEnergyRef.current) * 0.8);
        (flareRingRef.current.material as THREE.MeshBasicMaterial).opacity = pulseEnergyRef.current * 0.18;
        flareRingRef.current.visible = true;
      } else {
        flareRingRef.current.visible = false;
      }
    }

    // 2. West Wing: Möbius Singularity Kinetic Rotation
    if (mobiusRef.current) {
      mobiusRef.current.rotation.x += delta * 0.45 * energyMult;
      mobiusRef.current.rotation.y += delta * 0.6 * energyMult;
      mobiusRef.current.position.y = 1.25 + Math.sin(t * 1.1 + 0.5) * 0.04;
    }

    // 3. East Wing: Quantum Gyroscope Independent 3-Axis Rings
    if (gyroRing1Ref.current) gyroRing1Ref.current.rotation.x += delta * 0.85 * energyMult;
    if (gyroRing2Ref.current) gyroRing2Ref.current.rotation.y += delta * 1.15 * energyMult;
    if (gyroRing3Ref.current) gyroRing3Ref.current.rotation.z += delta * 0.65 * energyMult;
    if (gyroCoreRef.current) {
      gyroCoreRef.current.position.y = 1.25 + Math.sin(t * 1.3) * 0.03;
    }

    // 4. Subtle Shimmering Water Reflection Wave
    if (poolWaterRef.current) {
      const mat = poolWaterRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.roughness = 0.04 + Math.sin(t * 1.8) * 0.015;
      }
    }

    // 5. Entrance Chime, Footstep Ripples, and Artwork Proximity
    if (carRef?.current) {
      const carPos = carRef.current.pos;
      const dCenter = Math.hypot(carPos.x - position[0], carPos.z - position[2]);

      // Gallery Entrance Chime (432Hz ambient healing chime)
      if (dCenter < 12.0 && !hasEnteredRef.current) {
        hasEnteredRef.current = true;
        playZenChimeSound(432);
      } else if (dCenter > 17.0) {
        hasEnteredRef.current = false;
      }

      // Footstep Water Ripple check on glass walkway or reflection basin
      const relX = carPos.x - position[0];
      const relZ = carPos.z - position[2];
      const onBridgeOrPool = Math.abs(relX) < 2.4 && relZ >= 0.5 && relZ <= 3.6;

      if (onBridgeOrPool) {
        const moved = Math.hypot(carPos.x - lastFootstepPos.current.x, carPos.z - lastFootstepPos.current.z);
        if (moved > 0.42 && t - lastRippleTime.current > 0.28) {
          lastRippleTime.current = t;
          lastFootstepPos.current = { x: carPos.x, z: carPos.z };
          const newRipple: WaterRippleItem = {
            id: Date.now() + Math.random(),
            x: relX,
            z: relZ,
            radius: 0.12,
            maxRadius: 2.2,
            opacity: 0.75,
          };
          setRipples((prev) => [...prev.slice(-6), newRipple]);
          playWaterRippleSound();
        }
      }

      // Tech Monolith proximity detection
      if (onNearbyTech) {
        let nearbyNode: TechPillarData | null = null;
        let minD = 2.4;
        for (let i = 0; i < TECH_PILLARS.length; i++) {
          const tPillar = TECH_PILLARS[i];
          const ang = (i / TECH_PILLARS.length) * Math.PI * 2;
          const tx = position[0] + Math.cos(ang) * 7.4;
          const tz = position[2] + Math.sin(ang) * 7.4;
          const d = Math.hypot(carPos.x - tx, carPos.z - tz);
          if (d < minD) {
            minD = d;
            nearbyNode = tPillar;
          }
        }
        if (nearbyNode?.id !== currentNearbyTechRef.current?.id) {
          currentNearbyTechRef.current = nearbyNode;
          onNearbyTech(nearbyNode);
        }
      }

      // Artwork proximity detection
      if (onNearbyArtwork) {
        const dWest = Math.hypot(carPos.x - (position[0] - 5.5), carPos.z - position[2]);
        const dEast = Math.hypot(carPos.x - (position[0] + 5.5), carPos.z - position[2]);
        const dBonsai = Math.hypot(carPos.x - (position[0] - 5.5), carPos.z - (position[2] - 5.5));

        let detected: ZenPillarId | null = null;
        if (dCenter < 2.9) detected = "prism";
        else if (dWest < 2.5) detected = "mobius";
        else if (dEast < 2.5) detected = "gyroscope";
        else if (dBonsai < 2.5) detected = "bonsai";

        if (detected !== currentNearbyRef.current) {
          currentNearbyRef.current = detected;
          onNearbyArtwork(detected);
        }
      }
    }

    // 6. Update Active Ripples
    if (ripplesRef.current.length > 0) {
      let changed = false;
      const updated = ripplesRef.current
        .map((rip) => {
          const nextRadius = rip.radius + delta * 1.6;
          const nextOpacity = Math.max(0, 0.75 * (1 - nextRadius / rip.maxRadius));
          if (nextRadius >= rip.maxRadius) {
            changed = true;
            return null;
          }
          return { ...rip, radius: nextRadius, opacity: nextOpacity };
        })
        .filter((r): r is WaterRippleItem => r !== null);

      if (changed || updated.length > 0) {
        setRipples(updated);
      }
    }
  });

  return (
    <group position={position}>
      {/* Matte Slate Plaza Slab (16m x 16m x 0.08m) */}
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry args={[16, 0.08, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.25} />
      </mesh>

      {/* Plaza Perimeter Bevel Edge */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[16.4, 0.03, 16.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Paving Seam Lines */}
      {[-4, 0, 4].map((coord, i) => (
        <group key={`gallery-seam-${i}`}>
          <mesh position={[coord, 0.082, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.03, 15.6]} />
            <meshBasicMaterial color="#334155" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0.082, coord]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[15.6, 0.03]} />
            <meshBasicMaterial color="#334155" opacity={0.6} transparent />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          TADAO ANDO ARCHITECTURAL LOUVERED PERGOLA / CANOPY
      ======================================================== */}
      {/* 4 Slender Titanium Columns at (±7m, ±7m) */}
      {[-7, 7].flatMap((cx) =>
        [-7, 7].map((cz) => (
          <group key={`column-${cx}-${cz}`} position={[cx, 0.08, cz]}>
            {/* Column Base Footing Plate */}
            <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.48, 0.08, 0.48]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Slender Titanium Column Shaft */}
            <mesh position={[0, 2.1, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.11, 0.11, 4.12, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.25} metalness={0.85} />
            </mesh>
            {/* Column Top Structural Capital */}
            <mesh position={[0, 4.18, 0]} castShadow>
              <boxGeometry args={[0.42, 0.08, 0.42]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>
        ))
      )}

      {/* Perimeter Cantilever Lintel Beams (y: 4.22m) */}
      <group position={[0, 4.26, 0]}>
        {/* North & South Lintel Beams */}
        {[-7, 7].map((lz, idx) => (
          <mesh key={`lintel-ns-${idx}`} position={[0, 0, lz]} castShadow>
            <boxGeometry args={[14.48, 0.22, 0.28]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
        {/* West & East Lintel Beams */}
        {[-7, 7].map((lx, idx) => (
          <mesh key={`lintel-we-${idx}`} position={[lx, 0, 0]} castShadow>
            <boxGeometry args={[0.28, 0.22, 14.48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}

        {/* 9 Architectural Louver Slats (Spanning X, Spaced across Z) */}
        {[-5.4, -4.05, -2.7, -1.35, 0, 1.35, 2.7, 4.05, 5.4].map((sz, idx) => (
          <mesh
            key={`louver-${idx}`}
            position={[0, 0.16, sz]}
            rotation={[0.35, 0, 0]}
            castShadow
          >
            <boxGeometry args={[13.9, 0.03, 0.22]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
          </mesh>
        ))}

        {/* Concealed Warm Cove Downlight Strip beneath Canopy Perimeter */}
        <pointLight position={[0, -0.3, 0]} color="#fffbeb" intensity={2.2} distance={15} />
      </group>

      {/* ========================================================
          BLACK MIRROR REFLECTION POOL & GLASS WALKWAY BRIDGE
      ======================================================== */}
      <group position={[0, 0.082, 0]}>
        {/* Basin Rim */}
        <mesh position={[0, 0.005, 0]}>
          <boxGeometry args={[5.8, 0.02, 5.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Pool Water Surface */}
        <mesh ref={poolWaterRef} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.4, 5.4]} />
          <meshStandardMaterial color="#060c18" roughness={0.04} metalness={0.96} />
        </mesh>

        {/* Dynamic Footstep Concentric Water Ripples */}
        {ripples.map((rip) => (
          <mesh
            key={`rip-${rip.id}`}
            position={[rip.x, 0.014, rip.z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry args={[Math.max(0.01, rip.radius - 0.035), rip.radius, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={rip.opacity} depthWrite={false} />
          </mesh>
        ))}

        {/* Glass Walkway Bridge (Crosses from South Rim z: 2.7m to Center Pedestal z: 0.7m) */}
        <group position={[0, 0.018, 1.7]}>
          {/* Frosted Architectural Glass Deck */}
          <mesh receiveShadow>
            <boxGeometry args={[1.36, 0.025, 2.1]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.08}
              metalness={0.9}
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Left Stainless Steel Stringer */}
          <mesh position={[-0.7, -0.005, 0]}>
            <boxGeometry args={[0.04, 0.035, 2.1]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Right Stainless Steel Stringer */}
          <mesh position={[0.7, -0.005, 0]}>
            <boxGeometry args={[0.04, 0.035, 2.1]} />
            <meshStandardMaterial color="#475569" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Subtle Underside Warm Edge Glow */}
          <pointLight position={[0, -0.05, 0]} color="#fef3c7" intensity={0.6} distance={2.5} />
        </group>
      </group>

      {/* ========================================================
          EXHIBIT 01: THE PRIMORDIAL PRISM (Centerpiece)
      ======================================================== */}
      <group position={[0, 0, 0]}>
        {/* Center Basalt Sculpture Pedestal */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.5, 1.3]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Pedestal Accent Trim */}
        <mesh position={[0, 0.61, 0]}>
          <boxGeometry args={[1.34, 0.02, 1.34]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Floating Pristine Crystal Geometry */}
        <group ref={crystalRef} position={[0, 1.35, 0]}>
          {/* Outer Faceted Prism */}
          <mesh castShadow>
            <octahedronGeometry args={[0.65, 0]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.08}
              metalness={0.9}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Inner Core Wireframe */}
          <mesh>
            <icosahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial
              color="#38bdf8"
              roughness={0.15}
              metalness={0.8}
              wireframe
            />
          </mesh>
        </group>

        {/* Celestial Light Flare Ring during Resonance Pulse */}
        <mesh ref={flareRingRef} position={[0, 1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <ringGeometry args={[1.2, 1.45, 36]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>

        {/* Counter-Rotating Celestial Rings around Crystal */}
        <group ref={crystalRingsRef} position={[0, 1.35, 0]}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.92, 0.015, 8, 36]} />
            <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
          </mesh>
          <mesh rotation={[-Math.PI / 4, 0, 0]}>
            <torusGeometry args={[1.05, 0.012, 8, 36]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
        </group>

        {/* Subtle Warm Recessed Downlight */}
        <pointLight position={[0, 0.8, 0]} color="#fffbeb" intensity={1.8} distance={7} />
      </group>

      {/* ========================================================
          EXHIBIT 02: MÖBIUS SINGULARITY (West Wing at [-5.5, 0])
      ======================================================== */}
      <group position={[-5.5, 0, 0]}>
        {/* Basalt Pedestal */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.45, 1.1]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Plinth Accent Trim */}
        <mesh position={[0, 0.53, 0]}>
          <boxGeometry args={[1.14, 0.02, 1.14]} />
          <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Kinetic Möbius Torus Knot Sculpture */}
        <group ref={mobiusRef} position={[0, 1.25, 0]}>
          <mesh castShadow>
            <torusKnotGeometry args={[0.52, 0.13, 64, 16, 2, 3]} />
            <meshStandardMaterial
              color="#f59e0b"
              roughness={0.2}
              metalness={0.85}
              emissive="#b45309"
              emissiveIntensity={0.25}
            />
          </mesh>
        </group>

        {/* Dedicated Warm Amber Accent Spotlight */}
        <pointLight position={[0, 0.7, 0]} color="#fef3c7" intensity={1.5} distance={5.5} />
      </group>

      {/* ========================================================
          EXHIBIT 03: QUANTUM GYROSCOPE (East Wing at [5.5, 0])
      ======================================================== */}
      <group position={[5.5, 0, 0]}>
        {/* Basalt Pedestal */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.45, 1.1]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Plinth Accent Trim */}
        <mesh position={[0, 0.53, 0]}>
          <boxGeometry args={[1.14, 0.02, 1.14]} />
          <meshStandardMaterial color="#818cf8" roughness={0.2} metalness={0.85} />
        </mesh>

        {/* Kinetic 3-Axis Multi-Gimbal Rings */}
        <group position={[0, 1.25, 0]}>
          {/* Ring 1 (Outer - X axis) */}
          <group ref={gyroRing1Ref}>
            <mesh castShadow>
              <torusGeometry args={[0.72, 0.026, 16, 48]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.25} metalness={0.85} />
            </mesh>
          </group>
          {/* Ring 2 (Middle - Y axis) */}
          <group ref={gyroRing2Ref}>
            <mesh castShadow>
              <torusGeometry args={[0.54, 0.024, 16, 48]} />
              <meshStandardMaterial color="#6366f1" roughness={0.2} metalness={0.9} />
            </mesh>
          </group>
          {/* Ring 3 (Inner - Z axis) */}
          <group ref={gyroRing3Ref}>
            <mesh castShadow>
              <torusGeometry args={[0.38, 0.02, 16, 48]} />
              <meshStandardMaterial color="#a5b4fc" roughness={0.15} metalness={0.95} />
            </mesh>
          </group>
          {/* Central Levitating Obsidian Core */}
          <mesh ref={gyroCoreRef} castShadow>
            <sphereGeometry args={[0.22, 24, 24]} />
            <meshStandardMaterial color="#090d16" roughness={0.08} metalness={0.95} />
          </mesh>
        </group>

        {/* Dedicated Soft Indigo Accent Spotlight */}
        <pointLight position={[0, 0.7, 0]} color="#e0e7ff" intensity={1.5} distance={5.5} />
      </group>

      {/* ========================================================
          SURROUNDING PROGRAMMING & TECH ECOSYSTEM RING (16 NODES)
      ======================================================== */}
      {/* Outer Perimeter Tech Constellation Ring Line */}
      <mesh position={[0, 0.084, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[7.32, 7.48, 64]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.3} transparent />
      </mesh>

      {TECH_PILLARS.map((tech, idx) => {
        const angle = (idx / TECH_PILLARS.length) * Math.PI * 2;
        const x = Math.cos(angle) * 7.4;
        const z = Math.sin(angle) * 7.4;
        return (
          <TechMonolithPillar
            key={tech.id}
            item={tech}
            position={[x, 0, z]}
            index={idx}
          />
        );
      })}

      {/* ========================================================
          EXHIBIT 04: CYBER BONSAI (The Digital Pine Bonsai - Northwest Quad)
      ======================================================== */}
      <CyberBonsaiTree position={[-5.2, 0, -5.2]} />

      {/* ========================================================
          EXHIBIT 05: NEURAL MATRIX HYPERCUBE (AI & Deep Systems - Northeast Quad)
      ======================================================== */}
      <NeuralMatrixExhibit position={[5.2, 0, -5.2]} />

      {/* ========================================================
          AMBIENT FLOATING CODE RUNES & SYNTAX ATMOSPHERE (Berterbangan di Area)
      ======================================================== */}
      <FloatingCodeRunesCloud count={36} />

      {/* Minimalist Floating Cantilever Benches (North & South) */}
      {[-5.8, 5.8].map((zOffset, i) => (
        <group key={`gallery-bench-${i}`} position={[0, 0.28, zOffset]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3.2, 0.12, 0.7]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} metalness={0.3} />
          </mesh>
          {[-1.1, 1.1].map((xOffset, j) => (
            <mesh key={`gallery-leg-${j}`} position={[xOffset, -0.1, 0]}>
              <boxGeometry args={[0.15, 0.22, 0.55]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
            </mesh>
          ))}
          <pointLight position={[0, -0.1, 0]} color="#fed7aa" intensity={0.5} distance={2.5} />
        </group>
      ))}

      {/* Discrete Corner Ground Studs */}
      {[-7.2, 7.2].flatMap((x) =>
        [-7.2, 7.2].map((z) => (
          <mesh key={`stud-${x}-${z}`} position={[x, 0.085, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.12, 16]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

/* --- 1. The Quantum Core & Armillary Sphere (Centerpiece) --- */
function QuantumCoreArmillary() {
  const ring1Ref = useRef<THREE.Group>(null);
  const ring2Ref = useRef<THREE.Group>(null);
  const ring3Ref = useRef<THREE.Group>(null);
  const ring4Ref = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) ring1Ref.current.rotation.y += delta * 0.35;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.45;
    if (ring3Ref.current) ring3Ref.current.rotation.z -= delta * 0.3;
    if (ring4Ref.current) {
      ring4Ref.current.rotation.y -= delta * 0.55;
      ring4Ref.current.rotation.x = Math.sin(t * 0.8) * 0.15;
    }
    if (coreRef.current) {
      coreRef.current.position.y = 1.95 + Math.sin(t * 1.5) * 0.05;
      const s = 1.0 + Math.sin(t * 3.0) * 0.08;
      coreRef.current.scale.set(s, s, s);
    }
    if (beamRef.current) {
      (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 2.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Basalt Octagonal Central Plinth */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.5, 1.8, 0.4, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Plinth Accent Trim in Starlight Cyan */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[1.54, 1.54, 0.03, 8]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>

      {/* Zenith Sky Laser Light Beam (Tembus ke Angkasa) */}
      <mesh ref={beamRef} position={[0, 16, 0]}>
        <cylinderGeometry args={[0.02, 0.06, 32, 8]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Kinetic 4-Ring Armillary Sphere & Bloch Frame */}
      <group position={[0, 1.95, 0]}>
        {/* Ring 1 (Meridian - Outer Titanium Ring) */}
        <group ref={ring1Ref}>
          <mesh castShadow>
            <torusGeometry args={[1.35, 0.032, 16, 48]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>

        {/* Ring 2 (Celestial Equator - Bronze Tilted Ring) */}
        <group ref={ring2Ref} rotation={[0.41, 0, 0]}>
          <mesh castShadow>
            <torusGeometry args={[1.12, 0.028, 16, 48]} />
            <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.9} emissive="#b45309" emissiveIntensity={0.3} />
          </mesh>
        </group>

        {/* Ring 3 (Ecliptic - Cyan Luminous Orbit Ring) */}
        <group ref={ring3Ref} rotation={[-0.41, 0, Math.PI / 4]}>
          <mesh castShadow>
            <torusGeometry args={[0.9, 0.024, 16, 48]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.15} metalness={0.95} emissive="#0284c7" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Ring 4 (Bloch Sphere Superposition Axis Wireframe) */}
        <group ref={ring4Ref}>
          <mesh>
            <sphereGeometry args={[0.65, 16, 12]} />
            <meshStandardMaterial color="#94a3b8" wireframe roughness={0.3} metalness={0.8} opacity={0.35} transparent />
          </mesh>
        </group>

        {/* Central Levitating Quantum Core (Stellar Singularity) */}
        <mesh ref={coreRef} castShadow>
          <octahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial
            color="#e0f2fe"
            roughness={0.08}
            metalness={0.95}
            emissive="#38bdf8"
            emissiveIntensity={0.85}
          />
        </mesh>
      </group>

      {/* Gentle Starlight Ambient Core Light */}
      <pointLight position={[0, 2.1, 0]} color="#38bdf8" intensity={1.8} distance={7} />
    </group>
  );
}

/* --- 2. Latent Space & Vector Embeddings Station (AI / LLM) --- */
function VectorSpaceStation({ position }: { position: [number, number, number] }) {
  const orbRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  const points = useMemo(() => {
    return [
      [-0.28, 0.2, 0.16],
      [-0.16, 0.36, -0.12],
      [0.12, 0.24, 0.28],
      [0.28, 0.12, -0.2],
      [-0.08, 0.08, 0.32],
      [0.2, 0.32, 0.08],
      [-0.24, -0.08, -0.16],
      [0.08, -0.12, 0.2],
    ] as [number, number, number][];
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = 1.38 + Math.sin(t * 1.5) * 0.04;
    }
    if (ringRef1.current) ringRef1.current.rotation.y += delta * 0.45;
    if (ringRef2.current) ringRef2.current.rotation.x -= delta * 0.35;
  });

  return (
    <group position={position}>
      {/* Ground Projection Halo Ring */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.88, 32]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.55} />
      </mesh>
      {/* Basalt Octagonal Pedestal Footing */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Plinth Accent Trim in Violet */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.025, 8]} />
        <meshStandardMaterial color="#a855f7" roughness={0.2} metalness={0.9} emissive="#7e22ce" emissiveIntensity={0.5} />
      </mesh>

      {/* Consistent Celestial Kinetic Orb */}
      <group ref={orbRef} position={[0, 1.38, 0]}>
        {/* Gimbal Ring 1 */}
        <mesh ref={ringRef1} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 16, 36]} />
          <meshStandardMaterial color="#c084fc" roughness={0.2} metalness={0.9} emissive="#a855f7" emissiveIntensity={0.3} />
        </mesh>
        {/* Gimbal Ring 2 */}
        <mesh ref={ringRef2} rotation={[-0.3, 0, Math.PI / 4]}>
          <torusGeometry args={[0.54, 0.014, 16, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Central Violet Octahedron Vector Core */}
        <mesh castShadow>
          <octahedronGeometry args={[0.22, 0]} />
          <meshStandardMaterial color="#d8b4fe" emissive="#a855f7" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
        </mesh>

        {/* Orbiting Semantic Vector Nodes */}
        {points.map((p, idx) => (
          <mesh key={`vec-${idx}`} position={p}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#f3e8ff" emissive="#c084fc" emissiveIntensity={0.7} />
          </mesh>
        ))}
      </group>

      {/* Soft Violet Point Light */}
      <pointLight position={[0, 1.38, 0]} color="#a855f7" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- 3. Orbital Mesh & Raft Consensus Station (Distributed Systems) --- */
function RaftMeshStation({ position }: { position: [number, number, number] }) {
  const orbRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const satellitesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = 1.38 + Math.sin(t * 1.5 + 0.8) * 0.04;
    }
    if (ringRef1.current) ringRef1.current.rotation.y += delta * 0.45;
    if (ringRef2.current) ringRef2.current.rotation.z -= delta * 0.35;
    if (satellitesRef.current) satellitesRef.current.rotation.y -= delta * 0.6;
  });

  return (
    <group position={position}>
      {/* Ground Projection Halo Ring */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.88, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.55} />
      </mesh>
      {/* Basalt Octagonal Pedestal Footing */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Plinth Accent Trim in Amber */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.025, 8]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.2} metalness={0.9} emissive="#b45309" emissiveIntensity={0.5} />
      </mesh>

      {/* Consistent Celestial Kinetic Orb */}
      <group ref={orbRef} position={[0, 1.38, 0]}>
        {/* Gimbal Ring 1 */}
        <mesh ref={ringRef1} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 16, 36]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} emissive="#f59e0b" emissiveIntensity={0.3} />
        </mesh>
        {/* Gimbal Ring 2 */}
        <mesh ref={ringRef2} rotation={[-0.3, 0, Math.PI / 4]}>
          <torusGeometry args={[0.54, 0.014, 16, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Central Amber Dodecahedron Leader Core */}
        <mesh castShadow>
          <dodecahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
        </mesh>

        {/* 3 Orbiting Consensus Follower Satellites with Laser Links */}
        <group ref={satellitesRef}>
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => {
            const sx = Math.cos(angle) * 0.42;
            const sz = Math.sin(angle) * 0.42;
            return (
              <group key={`raft-sat-${idx}`} position={[sx, 0, sz]}>
                <mesh castShadow>
                  <octahedronGeometry args={[0.055, 0]} />
                  <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[-sx * 0.5, 0, -sz * 0.5]}>
                  <cylinderGeometry args={[0.005, 0.005, 0.42, 6]} />
                  <meshBasicMaterial color="#f59e0b" transparent opacity={0.65} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Dedicated Amber Point Light */}
      <pointLight position={[0, 1.38, 0]} color="#f59e0b" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- 4. The Celestial DAG & Graph Theory Station --- */
function DagGraphStation({ position }: { position: [number, number, number] }) {
  const orbRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const dagGroupRef = useRef<THREE.Group>(null);

  const vertices = useMemo(() => [
    { pos: [0, 0.32, 0], label: "Root" },
    { pos: [-0.22, 0.08, 0.1], label: "B1" },
    { pos: [0.22, 0.08, -0.1], label: "B2" },
    { pos: [-0.28, -0.18, 0], label: "C1" },
    { pos: [0, -0.18, 0.18], label: "C2" },
    { pos: [0.28, -0.18, -0.08], label: "C3" },
  ] as { pos: [number, number, number]; label: string }[], []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = 1.38 + Math.sin(t * 1.5 + 1.6) * 0.04;
    }
    if (ringRef1.current) ringRef1.current.rotation.y += delta * 0.45;
    if (ringRef2.current) ringRef2.current.rotation.x -= delta * 0.35;
    if (dagGroupRef.current) dagGroupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group position={position}>
      {/* Ground Projection Halo Ring */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.88, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.55} />
      </mesh>
      {/* Basalt Octagonal Pedestal Footing */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Plinth Accent Trim in Emerald */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.025, 8]} />
        <meshStandardMaterial color="#10b981" roughness={0.2} metalness={0.9} emissive="#059669" emissiveIntensity={0.5} />
      </mesh>

      {/* Consistent Celestial Kinetic Orb */}
      <group ref={orbRef} position={[0, 1.38, 0]}>
        {/* Gimbal Ring 1 */}
        <mesh ref={ringRef1} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 16, 36]} />
          <meshStandardMaterial color="#34d399" roughness={0.2} metalness={0.9} emissive="#10b981" emissiveIntensity={0.3} />
        </mesh>
        {/* Gimbal Ring 2 */}
        <mesh ref={ringRef2} rotation={[-0.3, 0, Math.PI / 4]}>
          <torusGeometry args={[0.54, 0.014, 16, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Central Emerald Icosahedron Graph Core */}
        <mesh castShadow>
          <icosahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#a7f3d0" emissive="#10b981" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
        </mesh>

        {/* 3D DAG Vertices & Directed Laser Edges */}
        <group ref={dagGroupRef}>
          {vertices.map((v, idx) => (
            <mesh key={`v-${idx}`} position={v.pos}>
              <octahedronGeometry args={[0.045, 0]} />
              <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.7} metalness={0.85} />
            </mesh>
          ))}
          {[
            { from: vertices[0].pos, to: vertices[1].pos },
            { from: vertices[0].pos, to: vertices[2].pos },
            { from: vertices[1].pos, to: vertices[3].pos },
            { from: vertices[1].pos, to: vertices[4].pos },
            { from: vertices[2].pos, to: vertices[4].pos },
            { from: vertices[2].pos, to: vertices[5].pos },
          ].map((edge, idx) => {
            const midX = (edge.from[0] + edge.to[0]) / 2;
            const midY = (edge.from[1] + edge.to[1]) / 2;
            const midZ = (edge.from[2] + edge.to[2]) / 2;
            const len = Math.hypot(edge.to[0] - edge.from[0], edge.to[1] - edge.from[1], edge.to[2] - edge.from[2]);
            return (
              <group key={`dag-edge-${idx}`} position={[midX, midY, midZ]}>
                <mesh>
                  <boxGeometry args={[0.01, len, 0.01]} />
                  <meshStandardMaterial color="#34d399" transparent opacity={0.65} emissive="#10b981" emissiveIntensity={0.5} />
                </mesh>
              </group>
            );
          })}
        </group>
      </group>

      {/* Dedicated Emerald Point Light */}
      <pointLight position={[0, 1.38, 0]} color="#10b981" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- 5. Reactive Streams & Event Pipeline Station --- */
function EventStreamStation({ position }: { position: [number, number, number] }) {
  const orbRef = useRef<THREE.Group>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const conduitRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = 1.38 + Math.sin(t * 1.5 + 2.4) * 0.04;
    }
    if (ringRef1.current) ringRef1.current.rotation.y += delta * 0.45;
    if (ringRef2.current) ringRef2.current.rotation.x -= delta * 0.35;
    if (conduitRef.current) conduitRef.current.rotation.z += delta * 1.8;
  });

  return (
    <group position={position}>
      {/* Ground Projection Halo Ring */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.88, 32]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.55} />
      </mesh>
      {/* Basalt Octagonal Pedestal Footing */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.38, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.8} />
      </mesh>
      {/* Plinth Accent Trim in Magenta */}
      <mesh position={[0, 0.39, 0]}>
        <cylinderGeometry args={[0.75, 0.75, 0.025, 8]} />
        <meshStandardMaterial color="#ec4899" roughness={0.2} metalness={0.9} emissive="#be185d" emissiveIntensity={0.5} />
      </mesh>

      {/* Consistent Celestial Kinetic Orb */}
      <group ref={orbRef} position={[0, 1.38, 0]}>
        {/* Gimbal Ring 1 */}
        <mesh ref={ringRef1} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.62, 0.018, 16, 36]} />
          <meshStandardMaterial color="#f472b6" roughness={0.2} metalness={0.9} emissive="#ec4899" emissiveIntensity={0.3} />
        </mesh>
        {/* Gimbal Ring 2 */}
        <mesh ref={ringRef2} rotation={[-0.3, 0, Math.PI / 4]}>
          <torusGeometry args={[0.54, 0.014, 16, 36]} />
          <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.9} />
        </mesh>

        {/* Central Magenta Spherical Event Core */}
        <mesh castShadow>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#fbcfe8" emissive="#ec4899" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
        </mesh>

        {/* High-Speed Event Stream Conduit Pipe */}
        <mesh ref={conduitRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.018, 12, 32]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Dedicated Magenta Point Light */}
      <pointLight position={[0, 1.38, 0]} color="#ec4899" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Floating AI & Distributed Systems Formula Runes --- */
const QUANTUM_FORMULA_GLYPHS = [
  { glyph: "softmax()", color: "#38bdf8" },
  { glyph: "Q•K^T", color: "#a855f7" },
  { glyph: "O(N log N)", color: "#10b981" },
  { glyph: "CAP", color: "#f59e0b" },
  { glyph: "|ψ⟩", color: "#38bdf8" },
  { glyph: "Embed(1536)", color: "#c084fc" },
  { glyph: "Raft::Heartbeat", color: "#fbbf24" },
  { glyph: "DAG::Sort", color: "#34d399" },
  { glyph: "Kafka::Stream", color: "#ec4899" },
  { glyph: "Loss(θ)", color: "#f43f5e" },
  { glyph: "p99 < 5ms", color: "#2dd4bf" },
  { glyph: "λx.x", color: "#fb923c" },
];

function FloatingQuantumRunesCloud({ count = 32 }: { count?: number }) {
  const runeItems = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const g = QUANTUM_FORMULA_GLYPHS[i % QUANTUM_FORMULA_GLYPHS.length];
      const radius = 1.2 + Math.random() * 6.5;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        glyph: g.glyph,
        color: g.color,
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        y: 0.6 + Math.random() * 3.4,
        speed: 0.2 + Math.random() * 0.25,
        swaySpeed: 0.8 + Math.random() * 0.6,
        swayAmp: 0.15 + Math.random() * 0.18,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        seed: Math.random() * 10,
        scale: 0.28 + Math.random() * 0.1,
      };
    });
  }, [count]);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < runeItems.length; i++) {
      const item = runeItems[i];
      const el = refs.current[i];
      if (!el) continue;

      item.y += delta * item.speed;
      if (item.y > 4.2) {
        item.y = 0.5;
      }

      el.position.y = item.y;
      el.position.x = item.baseX + Math.sin(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.position.z = item.baseZ + Math.cos(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.rotation.y += delta * item.rotSpeed;
    }
  });

  return (
    <group>
      {runeItems.map((item, i) => {
        const tex = getCodeRuneTexture(item.glyph, item.color);
        return (
          <group
            key={`quantum-rune-${i}`}
            ref={(r) => {
              refs.current[i] = r;
            }}
            position={[item.baseX, item.y, item.baseZ]}
          >
            <mesh>
              <planeGeometry args={[item.scale, item.scale]} />
              <meshStandardMaterial
                map={tex}
                transparent
                opacity={0.82}
                roughness={0.2}
                metalness={0.1}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* --- Corner 2: Stargazer Quantum AI & Distributed Systems Observatory --- */
function SkyPlatformCorner({
  position,
  carRef,
  onNearbyNode,
}: {
  position: [number, number, number];
  carRef?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  onNearbyNode?: (node: QuantumObservatoryNode | null) => void;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const currentNearbyRef = useRef<string | null>(null);

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.12;
    }

    if (carRef?.current && onNearbyNode) {
      const carPos = carRef.current.pos;
      let closest: QuantumObservatoryNode | null = null;
      let minD = 2.8;

      for (const node of QUANTUM_OBSERVATORY_NODES) {
        const nx = position[0] + node.position[0];
        const nz = position[2] + node.position[2];
        const d = Math.hypot(carPos.x - nx, carPos.z - nz);
        if (d < minD) {
          minD = d;
          closest = node;
        }
      }

      if ((closest?.id ?? null) !== currentNearbyRef.current) {
        currentNearbyRef.current = closest?.id ?? null;
        onNearbyNode(closest);
      }
    }
  });

  return (
    <group position={position}>
      {/* Circular Obsidian Marble Terrace (Radius 8.5m x Height 0.1m) */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[8.5, 8.8, 0.1, 48]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.35} metalness={0.7} />
      </mesh>

      {/* Terrace Outer Bronze/Titanium Bevel Rim */}
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[8.95, 9.2, 0.04, 48]} />
        <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Celestial Concentric Orbital Inlays */}
      <group position={[0, 0.102, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[3.4, 3.44, 48]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.5} transparent />
        </mesh>
        <mesh>
          <ringGeometry args={[5.6, 5.64, 48]} />
          <meshBasicMaterial color="#818cf8" opacity={0.4} transparent />
        </mesh>
        <mesh>
          <ringGeometry args={[7.4, 7.44, 48]} />
          <meshBasicMaterial color="#38bdf8" opacity={0.35} transparent />
        </mesh>
      </group>

      {/* Slowly Rotating Astronomical Coordinate Dial Ring */}
      <group ref={ringRef} position={[0, 0.105, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {[0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4].map((rad, idx) => (
          <mesh key={`dial-${idx}`} position={[Math.cos(rad) * 6.5, Math.sin(rad) * 6.5, 0]} rotation={[0, 0, rad]}>
            <planeGeometry args={[0.08, 0.45]} />
            <meshBasicMaterial color="#94a3b8" />
          </mesh>
        ))}
      </group>

      {/* Center Module: The Quantum Core & Bloch Sphere */}
      <QuantumCoreArmillary />

      {/* Station 1: Latent Nebula & Vector Embeddings (West) */}
      <VectorSpaceStation position={[-5.2, 0, 0]} />

      {/* Station 2: Orbital Mesh & Raft Consensus (East) */}
      <RaftMeshStation position={[5.2, 0, 0]} />

      {/* Station 3: The Celestial DAG & Graph Theory (North) */}
      <DagGraphStation position={[0, 0, -5.2]} />

      {/* Station 4: Reactive Streams & Event Pipeline (South) */}
      <EventStreamStation position={[0, 0, 5.2]} />

      {/* Floating Software Engineering & AI Formula Runes */}
      <FloatingQuantumRunesCloud count={32} />

      {/* Low-profile Perimeter Observatory Stanchions */}
      {[0.25, 0.55, 0.85, 1.15, 1.45, 1.75, 2.05].map((angleMult, idx) => {
        const rad = angleMult * Math.PI;
        const bx = Math.cos(rad) * 7.9;
        const bz = Math.sin(rad) * 7.9;
        return (
          <group key={`stanchion-${idx}`} position={[bx, 0.1, bz]}>
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 0.5, 16]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Soft Starlight Cyan Top Lens Dot */}
            <mesh position={[0, 0.51, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ============================================================
   CORNER 3: DEVOPS LAUNCHPAD & CLOUD INFRASTRUCTURE RUNWAY
============================================================ */

/* --- Floating DevOps & Cloud Infrastructure Runes Cloud --- */
const DEVOPS_FORMULA_GLYPHS = [
  { glyph: "docker build", color: "#38bdf8" },
  { glyph: "kubectl apply", color: "#60a5fa" },
  { glyph: "terraform plan", color: "#a855f7" },
  { glyph: "git push -u", color: "#f97316" },
  { glyph: "prom/ql rate()", color: "#f43f5e" },
  { glyph: "helm upgrade", color: "#06b6d4" },
  { glyph: "canary: 10%", color: "#f59e0b" },
  { glyph: "SLO: 99.99%", color: "#10b981" },
  { glyph: "otel::span", color: "#c084fc" },
  { glyph: "nginx ingress", color: "#34d399" },
  { glyph: "k8s::Pod/v1", color: "#38bdf8" },
  { glyph: "CI: PASS (0s)", color: "#10b981" },
  { glyph: "env: production", color: "#ec4899" },
  { glyph: "cgroup memory", color: "#fbbf24" },
];

function FloatingDevOpsRunesCloud({ count = 28 }: { count?: number }) {
  const runeItems = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const g = DEVOPS_FORMULA_GLYPHS[i % DEVOPS_FORMULA_GLYPHS.length];
      const radius = 2.5 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        glyph: g.glyph,
        color: g.color,
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        y: 0.6 + Math.random() * 3.4,
        speed: 0.2 + Math.random() * 0.25,
        swaySpeed: 0.8 + Math.random() * 0.6,
        swayAmp: 0.15 + Math.random() * 0.18,
        rotSpeed: (Math.random() - 0.5) * 0.5,
        seed: Math.random() * 10,
        scale: 0.28 + Math.random() * 0.1,
      };
    });
  }, [count]);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < runeItems.length; i++) {
      const item = runeItems[i];
      const el = refs.current[i];
      if (!el) continue;

      item.y += delta * item.speed;
      if (item.y > 4.2) {
        item.y = 0.5;
      }

      el.position.y = item.y;
      el.position.x = item.baseX + Math.sin(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.position.z = item.baseZ + Math.cos(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.rotation.y += delta * item.rotSpeed;
    }
  });

  return (
    <group>
      {runeItems.map((item, i) => {
        const tex = getCodeRuneTexture(item.glyph, item.color);
        return (
          <group
            key={`devops-rune-${i}`}
            ref={(r) => {
              refs.current[i] = r;
            }}
            position={[item.baseX, item.y, item.baseZ]}
          >
            <mesh>
              <planeGeometry args={[item.scale, item.scale]} />
              <meshStandardMaterial
                map={tex}
                transparent
                depthWrite={false}
                roughness={0.2}
                metalness={0.8}
                emissive={item.color}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* --- Reusable Standardized Basalt Telemetry Pedestal --- */
function StandardDevOpsPedestal({
  accentColor,
  children,
}: {
  accentColor: string;
  children?: React.ReactNode;
}) {
  return (
    <group>
      {/* Octagonal Plinth */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.88, 0.38, 8]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Outer Titanium Trim Ring */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.92, 0.96, 0.04, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Floor Glowing Halo Ring */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.15, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.65} />
      </mesh>
      {/* Dual Vertical Telemetry Stanchions */}
      {[-0.45, 0.45].map((sx, idx) => (
        <group key={`pylon-${idx}`} position={[sx, 0.65, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.65, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.25} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  );
}

/* --- Station 1: Automated CI Pipeline & Test Matrix --- */
function CiCdPipelineStation({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const laserRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.8;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.6;
      coreRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
    }
    if (laserRef.current) {
      laserRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group position={position}>
      <StandardDevOpsPedestal accentColor="#38bdf8">
        <group position={[0, 1.35, 0]}>
          {/* Rotating Laser Test Gantry Ring */}
          <group ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <mesh>
              <torusGeometry args={[0.55, 0.018, 16, 36]} />
              <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.5} />
            </mesh>
          </group>
          {/* Inner Floating Test Prism Artifact */}
          <mesh ref={coreRef} castShadow>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.8} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Pulsing Vertical Test Scan Beam */}
          <mesh ref={laserRef}>
            <cylinderGeometry args={[0.01, 0.01, 0.5, 12]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
          </mesh>
        </group>
      </StandardDevOpsPedestal>
      <pointLight position={[0, 1.35, 0]} color="#38bdf8" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 2: Containerization & Kubernetes Mesh --- */
function K8sMeshStation({ position }: { position: [number, number, number] }) {
  const meshGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshGroupRef.current) meshGroupRef.current.rotation.y += delta * 0.6;
    if (ringRef.current) ringRef.current.rotation.z -= delta * 0.5;
  });

  return (
    <group position={position}>
      <StandardDevOpsPedestal accentColor="#3b82f6">
        <group position={[0, 1.35, 0]}>
          {/* Master Control Plane Node Cube */}
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.26, 0.26]} />
            <meshStandardMaterial color="#bfdbfe" emissive="#3b82f6" emissiveIntensity={0.8} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Cluster Service Mesh Interconnect Ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.52, 0.014, 16, 32]} />
            <meshStandardMaterial color="#60a5fa" roughness={0.2} metalness={0.9} emissive="#2563eb" emissiveIntensity={0.4} />
          </mesh>
          {/* Orbiting Worker Pod Nodes */}
          <group ref={meshGroupRef}>
            {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
              <mesh key={`pod-${idx}`} position={[Math.cos(angle) * 0.44, Math.sin(angle * 2) * 0.1, Math.sin(angle) * 0.44]}>
                <boxGeometry args={[0.11, 0.11, 0.11]} />
                <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.9} roughness={0.2} metalness={0.8} />
              </mesh>
            ))}
          </group>
        </group>
      </StandardDevOpsPedestal>
      <pointLight position={[0, 1.35, 0]} color="#3b82f6" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 3: Infrastructure as Code & GitOps --- */
function IacGitopsStation({ position }: { position: [number, number, number] }) {
  const cubeRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 0.45;
      cubeRef.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    }
  });

  return (
    <group position={position}>
      <StandardDevOpsPedestal accentColor="#a855f7">
        <group ref={cubeRef} position={[0, 1.35, 0]}>
          {/* Declarative Cloud Blueprint Wireframe Cube */}
          <mesh>
            <boxGeometry args={[0.42, 0.42, 0.42]} />
            <meshStandardMaterial color="#c084fc" wireframe emissive="#a855f7" emissiveIntensity={0.6} />
          </mesh>
          {/* Layered Infrastructure Stack Slabs */}
          {[-0.14, 0, 0.14].map((ly, idx) => (
            <mesh key={`iac-slab-${idx}`} position={[0, ly, 0]}>
              <boxGeometry args={[0.34, 0.025, 0.34]} />
              <meshStandardMaterial color="#e9d5ff" emissive="#a855f7" emissiveIntensity={0.8} roughness={0.2} metalness={0.85} />
            </mesh>
          ))}
        </group>
      </StandardDevOpsPedestal>
      <pointLight position={[0, 1.35, 0]} color="#a855f7" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 4: Full-Stack Observability & SRE Radar --- */
function SreTelemetryStation({ position }: { position: [number, number, number] }) {
  const radarRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (radarRef.current) radarRef.current.rotation.y += delta * 1.1;
    if (beamRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      beamRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      <StandardDevOpsPedestal accentColor="#10b981">
        <group position={[0, 1.35, 0]}>
          {/* Rotating Telemetry Radar Dish Assembly */}
          <group ref={radarRef}>
            {/* Parabolic Dish */}
            <mesh rotation={[Math.PI / 4, 0, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.1, 0.16, 24, 1, true]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Feedhorn Antenna */}
            <mesh position={[0, 0.12, 0.18]} rotation={[Math.PI / 4, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 0.28, 12]} />
              <meshStandardMaterial color="#34d399" roughness={0.2} metalness={0.9} emissive="#10b981" emissiveIntensity={0.8} />
            </mesh>
          </group>
          {/* Pulsing Telemetry Sensor Orb */}
          <mesh ref={beamRef} position={[0, 0, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#a7f3d0" emissive="#10b981" emissiveIntensity={0.9} roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      </StandardDevOpsPedestal>
      <pointLight position={[0, 1.35, 0]} color="#10b981" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 5: Zero-Downtime Release & Traffic Ingress (VTOL Orbital Shuttle) --- */
function OrbitalDeployShuttlePad({
  position,
  craftRef,
}: {
  position: [number, number, number];
  craftRef: React.RefObject<THREE.Group | null>;
}) {
  return (
    <group position={position}>
      {/* Circular Target Launch Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.7, 2.85, 32]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
      </mesh>
      {/* Inner Amber Alert Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.9, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
      {/* Helipad 'H' Marking */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.6, 0, 0]}>
        <planeGeometry args={[0.22, 1.8]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.6, 0, 0]}>
        <planeGeometry args={[0.22, 1.8]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[1.2, 0.22]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Cyber Orbital VTOL Shuttle Parked on Pad */}
      <group ref={craftRef} position={[0, 0.52, 0]}>
        {/* Fuselage (Stealth chiseled angular body) */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <coneGeometry args={[0.8, 2.6, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Delta Wings */}
        <mesh position={[0, -0.05, 0.2]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
          <coneGeometry args={[1.7, 1.5, 3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.7} />
        </mesh>
        {/* Cockpit / Sensor Array Visor */}
        <mesh position={[0, 0.18, -0.4]}>
          <boxGeometry args={[0.35, 0.15, 0.8]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        {/* Twin Subdued Thruster Nozzles */}
        {[-0.35, 0.35].map((tx, ti) => (
          <mesh key={`thruster-${ti}`} position={[tx, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.16, 0.2, 16]} />
            <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.9} />
          </mesh>
        ))}
        {/* Thruster exhaust halo */}
        <pointLight position={[0, 0, 1.4]} color="#f59e0b" intensity={0.7} distance={3.0} />
      </group>
    </group>
  );
}

/* --- Corner 3 Main Assembly: Aerospace Runway & DevOps Launchpad --- */
function AerospaceRunwayCorner({
  position,
  carRef,
  onNearbyNode,
}: {
  position: [number, number, number];
  carRef?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  onNearbyNode?: (node: DevOpsStationNode | null) => void;
}) {
  const craftRef = useRef<THREE.Group>(null);
  const currentNearbyRef = useRef<string | null>(null);

  useFrame((state) => {
    if (craftRef.current) {
      craftRef.current.position.y = 0.52 + Math.sin(state.clock.elapsedTime * 1.5) * 0.018;
    }

    if (carRef?.current && onNearbyNode) {
      const carPos = carRef.current.pos;
      let closest: DevOpsStationNode | null = null;
      let minD = 3.0;

      const tmpVec = new THREE.Vector3();
      const originVec = new THREE.Vector3(position[0], 0, position[2]);
      const upAxis = new THREE.Vector3(0, 1, 0);

      for (const node of DEVOPS_LAUNCHPAD_NODES) {
        tmpVec
          .set(node.position[0], 0, node.position[2])
          .applyAxisAngle(upAxis, -Math.PI / 4)
          .add(originVec);
        const d = Math.hypot(carPos.x - tmpVec.x, carPos.z - tmpVec.z);
        if (d < minD) {
          minD = d;
          closest = node;
        }
      }

      if ((closest?.id ?? null) !== currentNearbyRef.current) {
        currentNearbyRef.current = closest?.id ?? null;
        onNearbyNode(closest);
      }
    }
  });

  return (
    <group position={position} rotation={[0, -Math.PI / 4, 0]}>
      {/* Matte Industrial Runway Asphalt Strip (10m x 24m x 0.06m) */}
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[10, 0.06, 24]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* Runway Clean Concrete Border Trim */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[10.5, 0.03, 24.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Threshold "Piano Key" Bars at Runway Entry (Z = 10m) */}
      {[-3.6, -2.4, -1.2, 1.2, 2.4, 3.6].map((x, idx) => (
        <mesh key={`thresh-${idx}`} position={[x, 0.062, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.55, 2.6]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      ))}

      {/* Clean White Dashed Centerlines along Runway */}
      {[-6, -2, 2, 6].map((z, idx) => (
        <mesh key={`dash-${idx}`} position={[0, 0.062, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.25, 2.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
      ))}

      {/* Runway Edge Inset Lighting Pucks */}
      {[-9, -5, -1, 3, 7, 11].map((z, idx) => (
        <group key={`edge-lights-${idx}`}>
          {/* Left Puck */}
          <mesh position={[-4.6, 0.063, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
          </mesh>
          {/* Right Puck */}
          <mesh position={[4.6, 0.063, z]}>
            <cylinderGeometry args={[0.1, 0.1, 0.02, 16]} />
            <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}

      {/* Symmetrical Left & Right Concrete Gantries for DevOps Stations */}
      {/* Station 1: CI/CD Pipeline (Left Flank 1) */}
      <CiCdPipelineStation position={[-5.8, 0, -3.5]} />

      {/* Station 2: Kubernetes Mesh (Right Flank 1) */}
      <K8sMeshStation position={[5.8, 0, -3.5]} />

      {/* Station 3: IaC & GitOps (Left Flank 2) */}
      <IacGitopsStation position={[-5.8, 0, 4.5]} />

      {/* Station 4: Full-Stack SRE Telemetry (Right Flank 2) */}
      <SreTelemetryStation position={[5.8, 0, 4.5]} />

      {/* Station 5: Orbital VTOL Shuttle Release Pad (Center End: Z = -8m) */}
      <OrbitalDeployShuttlePad position={[0, 0.062, -8.0]} craftRef={craftRef} />

      {/* Floating Cloud & DevOps Ecosystem Runes Cloud */}
      <FloatingDevOpsRunesCloud count={28} />
    </group>
  );
}

/* --- Corner 4: Cyber Oasis / Japanese Zen Rock Garden --- */
/* ============================================================
   CORNER 4: CLEAN ARCHITECTURE, SECURITY & CRAFTSMANSHIP SANCTUARY
============================================================ */

/* --- Floating Architecture & Security Runes Cloud --- */
const ZEN_ARCHITECTURE_GLYPHS = [
  { glyph: "SOLID", color: "#38bdf8" },
  { glyph: "KISS / DRY", color: "#60a5fa" },
  { glyph: "SHA-256", color: "#ef4444" },
  { glyph: "O(1) Map", color: "#10b981" },
  { glyph: "O(log N) Tree", color: "#34d399" },
  { glyph: "Zero-Trust", color: "#f87171" },
  { glyph: "DDD::Core", color: "#f59e0b" },
  { glyph: "Pure Function", color: "#fbbf24" },
  { glyph: "Idempotent", color: "#a855f7" },
  { glyph: "AES-256-GCM", color: "#f43f5e" },
  { glyph: "Ed25519", color: "#fb7185" },
  { glyph: "TDD::Green", color: "#22c55e" },
  { glyph: "Decoupled", color: "#c084fc" },
  { glyph: "BoyScoutRule", color: "#38bdf8" },
];

function FloatingZenArchitectureRunesCloud({ count = 28 }: { count?: number }) {
  const runeItems = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const g = ZEN_ARCHITECTURE_GLYPHS[i % ZEN_ARCHITECTURE_GLYPHS.length];
      const radius = 2.2 + Math.random() * 6.5;
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        glyph: g.glyph,
        color: g.color,
        baseX: Math.cos(angle) * radius,
        baseZ: Math.sin(angle) * radius,
        y: 0.6 + Math.random() * 3.4,
        speed: 0.18 + Math.random() * 0.22,
        swaySpeed: 0.7 + Math.random() * 0.5,
        swayAmp: 0.14 + Math.random() * 0.16,
        rotSpeed: (Math.random() - 0.5) * 0.45,
        seed: Math.random() * 10,
        scale: 0.28 + Math.random() * 0.1,
      };
    });
  }, [count]);

  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < runeItems.length; i++) {
      const item = runeItems[i];
      const el = refs.current[i];
      if (!el) continue;

      item.y += delta * item.speed;
      if (item.y > 4.2) {
        item.y = 0.5;
      }

      el.position.y = item.y;
      el.position.x = item.baseX + Math.sin(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.position.z = item.baseZ + Math.cos(t * item.swaySpeed + item.seed) * item.swayAmp;
      el.rotation.y += delta * item.rotSpeed;
    }
  });

  return (
    <group>
      {runeItems.map((item, i) => {
        const tex = getCodeRuneTexture(item.glyph, item.color);
        return (
          <group
            key={`zen-rune-${i}`}
            ref={(r) => {
              refs.current[i] = r;
            }}
            position={[item.baseX, item.y, item.baseZ]}
          >
            <mesh>
              <planeGeometry args={[item.scale, item.scale]} />
              <meshStandardMaterial
                map={tex}
                transparent
                depthWrite={false}
                roughness={0.2}
                metalness={0.8}
                emissive={item.color}
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* --- Reusable Standardized Basalt Zen Pedestal --- */
function StandardZenPedestal({
  accentColor,
  children,
}: {
  accentColor: string;
  children?: React.ReactNode;
}) {
  return (
    <group>
      {/* Octagonal Basalt Plinth */}
      <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.85, 0.38, 8]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Outer Titanium Trim */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.88, 0.92, 0.04, 8]} />
        <meshStandardMaterial color="#1c1917" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Floor Glowing Halo Ring */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.1, 32]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.65} />
      </mesh>
      {/* Dual Dark Timber Posts */}
      {[-0.42, 0.42].map((sx, idx) => (
        <group key={`zen-post-${idx}`} position={[sx, 0.6, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.03, 0.04, 0.6, 16]} />
            <meshStandardMaterial color="#292524" roughness={0.6} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.31, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  );
}

/* --- Station 1: The Hexagonal Core & Domain-Driven Design (Center Altar) --- */
function HexagonalCoreStation({ position }: { position: [number, number, number] }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.position.y = 1.38 + Math.sin(state.clock.elapsedTime * 1.8) * 0.03;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Stepped Central Altar Terrace */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2.0, 0.24, 6]} />
        <meshStandardMaterial color="#111827" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[1.3, 1.45, 0.08, 6]} />
        <meshStandardMaterial color="#1c1917" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Concentric Gold Inlay Ring */}
      <mesh position={[0, 0.292, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.15, 1.22, 36]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
      </mesh>

      {/* Floating Pure Domain Dodecahedron Core */}
      <mesh ref={coreRef} position={[0, 1.38, 0]} castShadow>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Hexagonal Outer Ports & Adapters Ring */}
      <group ref={ringRef} position={[0, 1.38, 0]} rotation={[Math.PI / 4, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.68, 0.016, 16, 6]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.9} emissive="#f59e0b" emissiveIntensity={0.4} />
        </mesh>
      </group>

      <pointLight position={[0, 1.38, 0]} color="#f59e0b" intensity={1.4} distance={5.0} />
    </group>
  );
}

/* --- Station 2: SOLID Principles & Clean Code Monolith (North) --- */
function SolidPrinciplesStation({ position }: { position: [number, number, number] }) {
  const prismRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (prismRef.current) {
      prismRef.current.rotation.y += delta * 0.6;
      prismRef.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 2.0) * 0.025;
    }
  });

  return (
    <group position={position}>
      <StandardZenPedestal accentColor="#38bdf8">
        <group position={[0, 0.4, 0]}>
          {/* Obsidian Monolith Pillar */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.34, 0.9, 0.34]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* 5 Glowing Horizontal SOLID Inlay Bands */}
          {[-0.28, -0.14, 0, 0.14, 0.28].map((yOff, idx) => (
            <mesh key={`solid-band-${idx}`} position={[0, 0.45 + yOff, 0]}>
              <boxGeometry args={[0.355, 0.025, 0.355]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
          {/* Floating Cyan Apex Prism */}
          <mesh ref={prismRef} position={[0, 1.15, 0]} castShadow>
            <octahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.9} roughness={0.1} metalness={0.9} />
          </mesh>
        </group>
      </StandardZenPedestal>
      <pointLight position={[0, 1.35, 0]} color="#38bdf8" intensity={1.2} distance={4.5} />
    </group>
  );
}

/* --- Station 3: Zero-Trust Security & Cryptographic Vault (South) --- */
function ZeroTrustVaultStation({ position }: { position: [number, number, number] }) {
  const key1Ref = useRef<THREE.Mesh>(null);
  const key2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (key1Ref.current) key1Ref.current.rotation.y += delta * 0.7;
    if (key2Ref.current) key2Ref.current.rotation.z -= delta * 0.8;
    if (coreRef.current) coreRef.current.rotation.x += delta * 0.5;
  });

  return (
    <group position={position}>
      <StandardZenPedestal accentColor="#ef4444">
        <group position={[0, 1.35, 0]}>
          {/* Cryptographic Core Crystal */}
          <mesh ref={coreRef} castShadow>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial color="#fca5a5" emissive="#ef4444" emissiveIntensity={0.9} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Outer Rotating Shield Rings (Public/Private Keypair) */}
          <mesh ref={key1Ref} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.48, 0.018, 16, 36]} />
            <meshStandardMaterial color="#f87171" roughness={0.2} metalness={0.9} emissive="#dc2626" emissiveIntensity={0.4} />
          </mesh>
          <mesh ref={key2Ref} rotation={[-Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.56, 0.014, 16, 36]} />
            <meshStandardMaterial color="#fca5a5" roughness={0.25} metalness={0.9} />
          </mesh>
        </group>
      </StandardZenPedestal>
      <pointLight position={[0, 1.35, 0]} color="#ef4444" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 4: Algorithmic Big-O Harmony & Complexity Balance (West) --- */
function BigOHarmonyStation({ position }: { position: [number, number, number] }) {
  const beamRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.6) * 0.18;
    }
  });

  return (
    <group position={position}>
      <StandardZenPedestal accentColor="#10b981">
        <group position={[0, 1.15, 0]}>
          {/* Central Fulcrum Pillar */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.07, 0.45, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Tilting Balance Beam */}
          <group ref={beamRef} position={[0, 0.22, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.9, 0.03, 0.04]} />
              <meshStandardMaterial color="#34d399" roughness={0.2} metalness={0.9} emissive="#10b981" emissiveIntensity={0.4} />
            </mesh>
            {/* Left Weight: Time Complexity T(n) */}
            <mesh position={[-0.42, -0.12, 0]} castShadow>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
            </mesh>
            {/* Right Weight: Space Complexity S(n) */}
            <mesh position={[0.42, 0.12, 0]} castShadow>
              <sphereGeometry args={[0.11, 24, 24]} />
              <meshStandardMaterial color="#a7f3d0" emissive="#059669" emissiveIntensity={0.85} roughness={0.1} metalness={0.9} />
            </mesh>
          </group>
        </group>
      </StandardZenPedestal>
      <pointLight position={[0, 1.35, 0]} color="#10b981" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Station 5: Software Craftsmanship & Test Pyramid Pagoda (East) --- */
function CraftsmanshipStation({ position }: { position: [number, number, number] }) {
  const pyramidRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (pyramidRef.current) {
      pyramidRef.current.rotation.y += delta * 0.55;
      pyramidRef.current.position.y = 1.35 + Math.sin(state.clock.elapsedTime * 1.7) * 0.03;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.6;
    }
  });

  return (
    <group position={position}>
      <StandardZenPedestal accentColor="#a855f7">
        <group position={[0, 1.35, 0]}>
          {/* Floating Test Pyramid (Tetrahedron) */}
          <mesh ref={pyramidRef} castShadow>
            <tetrahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color="#e9d5ff" emissive="#a855f7" emissiveIntensity={0.9} roughness={0.1} metalness={0.9} />
          </mesh>
          {/* Continuous Quality Verification Ring */}
          <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[0.52, 0.016, 16, 32]} />
            <meshStandardMaterial color="#c084fc" roughness={0.2} metalness={0.9} emissive="#9333ea" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </StandardZenPedestal>
      <pointLight position={[0, 1.35, 0]} color="#a855f7" intensity={1.3} distance={4.5} />
    </group>
  );
}

/* --- Corner 4 Main Assembly: Zen Architecture & Craftsmanship Sanctuary --- */
function ZenGardenCorner({
  position,
  carRef,
  onNearbyNode,
}: {
  position: [number, number, number];
  carRef?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  onNearbyNode?: (node: ZenArchitectureNode | null) => void;
}) {
  const currentNearbyRef = useRef<string | null>(null);

  useFrame(() => {
    if (carRef?.current && onNearbyNode) {
      const carPos = carRef.current.pos;
      let closest: ZenArchitectureNode | null = null;
      let minD = 2.8;

      for (const node of ZEN_ARCHITECTURE_NODES) {
        const nx = position[0] + node.position[0];
        const nz = position[2] + node.position[2];
        const d = Math.hypot(carPos.x - nx, carPos.z - nz);
        if (d < minD) {
          minD = d;
          closest = node;
        }
      }

      if ((closest?.id ?? null) !== currentNearbyRef.current) {
        currentNearbyRef.current = closest?.id ?? null;
        onNearbyNode(closest);
      }
    }
  });

  return (
    <group position={position}>
      {/* Dark Charcoal Gravel Sanctuary Bed (16m x 16m x 0.05m) */}
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[16, 0.05, 16]} />
        <meshStandardMaterial color="#111827" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Dark Basalt Timber Border Frame */}
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[16.5, 0.07, 16.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Concentric Raked Gravel Wave Ripples centered on Hexagonal Core */}
      <group position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {[1.8, 3.0, 4.2, 5.5, 6.8].map((radius, idx) => (
          <mesh key={`zen-ripple-${idx}`}>
            <ringGeometry args={[radius, radius + 0.04, 48]} />
            <meshBasicMaterial color="#334155" opacity={0.6} transparent />
          </mesh>
        ))}
      </group>

      {/* Symmetrical Cardinal Cross Stepping Stones Path */}
      {[-3.6, -2.4, -1.2, 1.2, 2.4, 3.6].map((offset, idx) => (
        <group key={`cross-stones-${idx}`}>
          {/* North-South Axis Stone */}
          <mesh position={[0, 0.055, offset]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.38, 16]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.2} />
          </mesh>
          {/* East-West Axis Stone */}
          <mesh position={[offset, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.38, 16]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} metalness={0.2} />
          </mesh>
        </group>
      ))}

      {/* 4 Japanese-style Warm Cube Lanterns (Andon / Toro style, placed symmetrically) */}
      {[
        [-6.6, -6.6],
        [6.6, -6.6],
        [-6.6, 6.6],
        [6.6, 6.6],
      ].map(([lx, lz], idx) => (
        <group key={`zen-lantern-${idx}`} position={[lx, 0.05, lz]}>
          {/* Stone Plinth Footing */}
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.6, 0.12, 0.6]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.2} />
          </mesh>
          {/* Frosted Warm Paper / Glass Cube */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.4]} />
            <meshStandardMaterial
              color="#fef3c7"
              emissive="#f59e0b"
              emissiveIntensity={0.55}
              roughness={0.3}
            />
          </mesh>
          {/* Dark Timber Lattice Posts */}
          <mesh position={[0, 0.38, 0]}>
            <boxGeometry args={[0.44, 0.52, 0.44]} />
            <meshBasicMaterial color="#0f172a" wireframe />
          </mesh>
          {/* Overhanging Pyramid Roof Cap */}
          <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.42, 0.22, 4]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.3} />
          </mesh>
          {/* Soft 2700K Warm Ambient Radiance */}
          <pointLight position={[0, 0.4, 0]} color="#fde68a" intensity={0.9} distance={4.5} />
        </group>
      ))}

      {/* Center Station: The Hexagonal Core & DDD */}
      <HexagonalCoreStation position={[0, 0, 0]} />

      {/* North Station: SOLID Principles & Clean Code Monolith */}
      <SolidPrinciplesStation position={[0, 0, -4.8]} />

      {/* South Station: Zero-Trust Security & Cryptographic Vault */}
      <ZeroTrustVaultStation position={[0, 0, 4.8]} />

      {/* West Station: Algorithmic Big-O Harmony & Complexity */}
      <BigOHarmonyStation position={[-4.8, 0, 0]} />

      {/* East Station: Software Craftsmanship & Test Pyramid */}
      <CraftsmanshipStation position={[4.8, 0, 0]} />

      {/* Floating Architecture & Security Runes Cloud */}
      <FloatingZenArchitectureRunesCloud count={28} />
    </group>
  );
}

/* ============================================================
   ZEN-MINIMALIST PROMENADE DECORATIONS (Clean, Non-Crowded)
============================================================ */

/* 1. Floor Data Traces: Subtle dual neon guide inlays along the 4 diagonal corridors */
function FloorDataTraces() {
  const corridors = [
    { angle: (-3 * Math.PI) / 4, color: "#38bdf8" }, // NW
    { angle: -Math.PI / 4, color: "#a855f7" },        // NE
    { angle: (3 * Math.PI) / 4, color: "#f59e0b" },  // SW
    { angle: Math.PI / 4, color: "#10b981" },         // SE
  ];

  return (
    <group position={[0, 0.018, 0]}>
      {corridors.map((c, i) => {
        const dist = 15.5;
        const cx = Math.sin(c.angle) * dist;
        const cz = Math.cos(c.angle) * dist;

        return (
          <group key={`data-trace-${i}`} position={[cx, 0, cz]} rotation={[0, c.angle, 0]}>
            {/* Left Thin Neon Trace Line */}
            <mesh position={[-0.45, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.06, 21.0]} />
              <meshBasicMaterial color={c.color} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            {/* Right Thin Neon Trace Line */}
            <mesh position={[0.45, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.06, 21.0]} />
              <meshBasicMaterial color={c.color} transparent opacity={0.45} depthWrite={false} />
            </mesh>
            {/* Waypoint Floor Nodes along the corridor */}
            {[-7.0, 0.0, 7.0].map((wz, wi) => (
              <mesh key={`waypoint-${wi}`} position={[0, 0.002, wz]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.22, 0.22]} />
                <meshBasicMaterial color={c.color} transparent opacity={0.6} depthWrite={false} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/* 2. Promenade Light Bollards: 8 slender titanium stanchions with soft starlight glow */
function PromenadeLightBollards() {
  const bollards = [
    // NW corridor
    { x: -10.5, z: -8.5, color: "#38bdf8" },
    { x: -17.5, z: -15.5, color: "#38bdf8" },
    // NE corridor
    { x: 10.5, z: -8.5, color: "#a855f7" },
    { x: 17.5, z: -15.5, color: "#a855f7" },
    // SW corridor
    { x: -10.5, z: 8.5, color: "#f59e0b" },
    { x: -17.5, z: 15.5, color: "#f59e0b" },
    // SE corridor
    { x: 10.5, z: 8.5, color: "#10b981" },
    { x: 17.5, z: 15.5, color: "#10b981" },
  ];

  return (
    <group>
      {bollards.map((b, i) => (
        <group key={`bollard-${i}`} position={[b.x, 0, b.z]}>
          {/* Heavy Titanium Post */}
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.64, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Soft Starlight Top Capsule */}
          <mesh position={[0, 0.66, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color={b.color} emissive={b.color} emissiveIntensity={0.8} />
          </mesh>
          {/* Subtle Path Glow */}
          <pointLight position={[0, 0.66, 0]} color={b.color} intensity={0.5} distance={3.2} />
        </group>
      ))}
    </group>
  );
}

/* 3. Minimalist Promenade Trees: 4 solitary cyber-bonsai trees gracefully placed */
function MinimalistPromenadeTrees() {
  return (
    <group>
      {/* NW: Programming Promenade */}
      <CyberBonsaiTree
        position={[-18.5, 0, -13.0]}
        accentColor="#0284c7"
        glowColor="#38bdf8"
      />
      {/* NE: Quantum Promenade */}
      <CyberBonsaiTree
        position={[18.5, 0, -13.0]}
        accentColor="#7c3aed"
        glowColor="#c084fc"
      />
      {/* SW: DevOps Promenade */}
      <CyberBonsaiTree
        position={[-18.5, 0, 13.0]}
        accentColor="#d97706"
        glowColor="#fbbf24"
      />
      {/* SE: Clean Architecture Promenade */}
      <CyberBonsaiTree
        position={[18.5, 0, 13.0]}
        accentColor="#059669"
        glowColor="#34d399"
      />
    </group>
  );
}

/* ============================================================
   CYBER METAVERSE ARENA (Floating Island, Cosmic Dust & Nexus)
============================================================ */
function CyberMetaverseArena({
  carRef,
  onNearbyArtwork,
  onNearbyTech,
  onNearbyQuantumNode,
  onNearbyDevOpsNode,
  onNearbyZenNode,
  resonancePulseKey = 0,
}: {
  carRef?: React.MutableRefObject<{ pos: THREE.Vector3 }>;
  onNearbyArtwork?: (artwork: ZenPillarId | null) => void;
  onNearbyTech?: (tech: TechPillarData | null) => void;
  onNearbyQuantumNode?: (node: QuantumObservatoryNode | null) => void;
  onNearbyDevOpsNode?: (node: DevOpsStationNode | null) => void;
  onNearbyZenNode?: (node: ZenArchitectureNode | null) => void;
  resonancePulseKey?: number;
}) {
  const nexusTex = useMemo(() => getCentralNexusTexture(), []);
  const haloRingsRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (haloRingsRef.current) {
      haloRingsRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* 1. Floating Digital Island (Ukuran 110m x 110m Tanpa Pagar Kaku) */}
      <FloatingDigitalIsland size={55.0} />

      {/* 2. Cosmic Abyss Dust Particles (Melayang di Ruang Hampa Sekitar Pulau) */}
      <FloatingCosmicStardust count={150} radius={95} />

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

      {/* 3. Four Minimalist Themed Corner Arenas */}
      {/* Corner 1: Minimalist Zen Gallery / Apple-Style Digital Pavilion (North-West) */}
      <ZenGalleryCorner
        position={[-32, 0, -32]}
        carRef={carRef}
        onNearbyArtwork={onNearbyArtwork}
        onNearbyTech={onNearbyTech}
        resonancePulseKey={resonancePulseKey}
      />

      {/* Corner 2: Floating Monolith Courtyard / Stargazer Sky Platform (North-East) */}
      <SkyPlatformCorner
        position={[32, 0, -32]}
        carRef={carRef}
        onNearbyNode={onNearbyQuantumNode}
      />

      {/* Corner 3: Aerospace Runway & DevOps Launchpad (South-West) */}
      <AerospaceRunwayCorner
        position={[-32, 0, 32]}
        carRef={carRef}
        onNearbyNode={onNearbyDevOpsNode}
      />

      {/* Corner 4: Clean Architecture, Security & Craftsmanship Sanctuary (South-East) */}
      <ZenGardenCorner
        position={[32, 0, 32]}
        carRef={carRef}
        onNearbyNode={onNearbyZenNode}
      />

      {/* 4. Zen-Minimalist Promenade Decorations (Floor Traces, Light Bollards & Solitary Trees) */}
      <FloorDataTraces />
      <PromenadeLightBollards />
      <MinimalistPromenadeTrees />

      {/* Elevated Stepping Terraces / Walkways (Teleport Station Platform) */}
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
   3D CYBER EXOSKELETON 2.0 (High-Poly Smooth Cybernetics Rig)
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
  modelType?: CharacterModelType;
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

        // Natural elbow flexion
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
        <Html position={[0, 2.15, 0]} center distanceFactor={7.2} style={{ pointerEvents: "none" }}>
          <div className="flex flex-col items-center select-none pointer-events-none">
            {emote && (
              <div className="relative mb-1.5 max-w-[200px] rounded-xl bg-neutral-950/95 px-2.5 py-1 text-[10px] font-medium text-white shadow-xl border border-cyan-400/50 backdrop-blur-md text-center leading-snug">
                <span
                  className="text-[8px] uppercase font-bold tracking-wider block mb-0.5"
                  style={{ color: accentColor }}
                >
                  🤖 {name}
                </span>
                <span className="break-words text-slate-100">{emote}</span>
                {/* Speech bubble arrow pointer */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-950 border-r border-b border-cyan-400/50 rotate-45" />
              </div>
            )}
            <div
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-mono tracking-tight backdrop-blur-md shadow-sm whitespace-nowrap"
              style={{
                backgroundColor: "rgba(10, 15, 29, 0.8)",
                border: `1px solid ${accentColor}66`,
                color: "#e2e8f0",
              }}
            >
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
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
            {/* Tactical Smooth Pelvis & Core Chassis */}
            <mesh position={[0, 0.95, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.165, 0.15, 32]} />
              <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
            </mesh>
            {/* Neon Cyber Belt Trim (High-Poly Ribbon) */}
            <mesh position={[0, 0.97, 0]}>
              <cylinderGeometry args={[0.206, 0.192, 0.045, 32]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.8} />
            </mesh>
            {/* Contoured Buckle Unit */}
            <mesh position={[0, 0.97, 0.165]}>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 20]} />
              <meshStandardMaterial color={color} metalness={0.9} roughness={0.15} />
            </mesh>
            {/* Hip Hydraulic Damper Cells */}
            <mesh position={[-0.2, 0.95, 0]} rotation={[0, 0, 0.15]}>
              <cylinderGeometry args={[0.035, 0.035, 0.11, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0.2, 0.95, 0]} rotation={[0, 0, -0.15]}>
              <cylinderGeometry args={[0.035, 0.035, 0.11, 16]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
            </mesh>

            {/* Sculpted Smooth Abdominal Segments (Anatomical Curvature) */}
            <mesh position={[0, 1.07, 0.05]} castShadow>
              <cylinderGeometry args={[0.18, 0.2, 0.09, 32]} />
              <meshStandardMaterial color="#0b0f19" metalness={0.88} roughness={0.22} />
            </mesh>
            <mesh position={[0, 1.17, 0.055]} castShadow>
              <cylinderGeometry args={[0.21, 0.18, 0.1, 32]} />
              <meshStandardMaterial color="#111827" metalness={0.88} roughness={0.22} />
            </mesh>
            {/* Abdominal Recessed Neon Pinstripes */}
            <mesh position={[-0.12, 1.12, 0.095]} rotation={[0, 0, 0.1]}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 12]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
            </mesh>
            <mesh position={[0.12, 1.12, 0.095]} rotation={[0, 0, -0.1]}>
              <cylinderGeometry args={[0.008, 0.008, 0.14, 12]} />
              <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
            </mesh>

            {/* Aerodynamic V-Taper Torso Carapace */}
            <mesh position={[0, 1.32, 0.02]} castShadow>
              <cylinderGeometry args={[0.24, 0.2, 0.28, 32]} />
              <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
            </mesh>

            {/* Smooth Left Pectoral Armor Shell */}
            <group position={[-0.12, 1.34, 0.12]} rotation={[0.08, 0.14, -0.06]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.11, 0.09, 0.19, 24]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.15} />
              </mesh>
            </group>
            {/* Smooth Right Pectoral Armor Shell */}
            <group position={[0.12, 1.34, 0.12]} rotation={[0.08, -0.14, 0.06]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.11, 0.09, 0.19, 24]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.15} />
              </mesh>
            </group>

            {/* Central Arc-Reactor Singularity (Concentric Dual Rings) */}
            <group position={[0, 1.34, 0.16]}>
              {/* Inner Glowing Core */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.035, 32]} />
                <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={4.8} />
              </mesh>
              {/* Outer Containment Ring */}
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.078, 0.012, 16, 36]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
              </mesh>
            </group>

            {/* Cyber Wingpack / Streamlined Jetpack */}
            <group position={[0, 1.32, -0.16]}>
              {/* Central Housing */}
              <mesh castShadow>
                <cylinderGeometry args={[0.14, 0.12, 0.32, 24]} />
                <meshStandardMaterial color="#070a12" metalness={0.95} roughness={0.14} />
              </mesh>
              {/* Heat Sink Grill */}
              <mesh position={[0, 0.04, -0.07]}>
                <planeGeometry args={[0.18, 0.14]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.8} wireframe />
              </mesh>

              {/* Left Swept-back Aero-Wing */}
              <group position={[-0.14, 0.06, 0]} rotation={[0, 0.25, 0.35]}>
                <mesh castShadow>
                  <boxGeometry args={[0.28, 0.07, 0.03]} />
                  <meshStandardMaterial color={color} metalness={0.9} roughness={0.18} />
                </mesh>
                <mesh position={[0, 0.036, 0]}>
                  <boxGeometry args={[0.28, 0.008, 0.035]} />
                  <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
                </mesh>
              </group>

              {/* Right Swept-back Aero-Wing */}
              <group position={[0.14, 0.06, 0]} rotation={[0, -0.25, -0.35]}>
                <mesh castShadow>
                  <boxGeometry args={[0.28, 0.07, 0.03]} />
                  <meshStandardMaterial color={color} metalness={0.9} roughness={0.18} />
                </mesh>
                <mesh position={[0, 0.036, 0]}>
                  <boxGeometry args={[0.28, 0.008, 0.035]} />
                  <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
                </mesh>
              </group>

              {/* Dual Twin Thruster Nozzles */}
              <mesh position={[-0.09, -0.18, 0]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.042, 0.062, 0.12, 24]} />
                <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0.09, -0.18, 0]} rotation={[0.2, 0, 0]}>
                <cylinderGeometry args={[0.042, 0.062, 0.12, 24]} />
                <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.18} />
              </mesh>
              {/* Animated Thruster Plasma Flames */}
              <mesh ref={jetFlameLRef} position={[-0.09, -0.28, -0.02]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.062, 0.28, 16]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
              <mesh ref={jetFlameRRef} position={[0.09, -0.28, -0.02]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.062, 0.28, 16]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
            </group>

            {/* Head & Aerodynamic Cyber Visor Helmet */}
            <group ref={headGroup} position={[0, 1.62, 0]}>
              {/* Neck Collar */}
              <mesh position={[0, -0.1, 0]}>
                <cylinderGeometry args={[0.08, 0.1, 0.08, 20]} />
                <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.28} />
              </mesh>
              {/* Helmet Cranial Dome (High-Poly Smooth Sphere) */}
              <mesh castShadow position={[0, 0.02, -0.02]}>
                <sphereGeometry args={[0.2, 36, 32]} />
                <meshStandardMaterial color="#090d16" metalness={0.94} roughness={0.14} />
              </mesh>
              {/* Center Crown Ridge / Aerodynamic Fin */}
              <mesh position={[0, 0.16, -0.02]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.038, 0.07, 0.26]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0.19, -0.02]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.015, 0.02, 0.24]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
              </mesh>

              {/* Aerodynamic Panoramic Curved Visor (Ultra-Smooth Liquid Crystal Glass) */}
              <mesh position={[0, 0.02, 0.1]} rotation={[0.1, 0, 0]}>
                <sphereGeometry args={[0.176, 36, 28, 0, Math.PI, 0, Math.PI / 1.7]} />
                <meshStandardMaterial
                  color="#020617"
                  emissive={accentColor}
                  emissiveIntensity={3.4}
                  metalness={0.96}
                  roughness={0.05}
                />
              </mesh>

              {/* Angular Chin / Rebreather Guard */}
              <mesh position={[0, -0.09, 0.08]} castShadow>
                <cylinderGeometry args={[0.08, 0.07, 0.09, 20]} />
                <meshStandardMaterial color="#0e1726" metalness={0.88} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.09, 0.14]}>
                <boxGeometry args={[0.08, 0.025, 0.01]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.8} />
              </mesh>

              {/* Swept Cyber Ear Antenna Fins */}
              <group position={[-0.2, 0.05, -0.02]} rotation={[0, 0, 0.35]}>
                <boxGeometry args={[0.025, 0.16, 0.08]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
                <mesh position={[-0.01, 0.06, 0]}>
                  <boxGeometry args={[0.01, 0.06, 0.02]} />
                  <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
                </mesh>
              </group>
              <group position={[0.2, 0.05, -0.02]} rotation={[0, 0, -0.35]}>
                <boxGeometry args={[0.025, 0.16, 0.08]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
                <mesh position={[0.01, 0.06, 0]}>
                  <boxGeometry args={[0.01, 0.06, 0.02]} />
                  <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
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

            {/* Left Arm with High-Poly Pauldron & Gauntlet */}
            <group ref={leftArmRef} position={[-0.32, 1.4, 0]}>
              {/* Smooth Spherical Shoulder Pauldron Guard */}
              <mesh position={[-0.04, 0.05, 0]} castShadow>
                <sphereGeometry args={[0.11, 24, 20]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.16} />
              </mesh>
              <mesh position={[-0.12, 0.07, 0]}>
                <boxGeometry args={[0.01, 0.08, 0.16]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
              </mesh>
              {/* Upper Arm Bicep */}
              <mesh position={[-0.03, -0.11, 0]} castShadow>
                <cylinderGeometry args={[0.052, 0.046, 0.16, 20]} />
                <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.28} />
              </mesh>

              {/* Forearm & Fist Hinge at Elbow */}
              <group ref={leftForearmRef} position={[-0.03, -0.21, 0]}>
                {/* Elbow Joint Cap */}
                <mesh position={[0, 0, -0.02]}>
                  <sphereGeometry args={[0.046, 16, 16]} />
                  <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
                </mesh>
                {/* Streamlined Forearm Gauntlet */}
                <mesh position={[0, -0.12, 0.02]} castShadow>
                  <cylinderGeometry args={[0.058, 0.05, 0.18, 20]} />
                  <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.15} />
                </mesh>
                {/* Gauntlet Neon Conduit */}
                <mesh position={[0, -0.12, 0.07]}>
                  <cylinderGeometry args={[0.015, 0.015, 0.12, 12]} />
                  <meshStandardMaterial color={accentColor} emissive={color} emissiveIntensity={3.0} />
                </mesh>
                {/* Cyber Fist */}
                <mesh position={[0, -0.24, 0.02]} castShadow>
                  <boxGeometry args={[0.08, 0.09, 0.09]} />
                  <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
                </mesh>
              </group>
            </group>

            {/* Right Arm with Cyber Power Gauntlet (Punch Arm) */}
            <group ref={rightArmRef} position={[0.32, 1.4, 0]}>
              {/* Smooth Spherical Shoulder Pauldron Guard */}
              <mesh position={[0.04, 0.05, 0]} castShadow>
                <sphereGeometry args={[0.11, 24, 20]} />
                <meshStandardMaterial color={color} metalness={0.9} roughness={0.16} />
              </mesh>
              <mesh position={[0.12, 0.07, 0]}>
                <boxGeometry args={[0.01, 0.08, 0.16]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.2} />
              </mesh>
              {/* Upper Arm Bicep */}
              <mesh position={[0.03, -0.11, 0]} castShadow>
                <cylinderGeometry args={[0.052, 0.046, 0.16, 20]} />
                <meshStandardMaterial color="#1e293b" metalness={0.82} roughness={0.28} />
              </mesh>

              {/* Forearm & Fist Hinge at Elbow */}
              <group ref={rightForearmRef} position={[0.03, -0.21, 0]}>
                {/* Elbow Joint Cap */}
                <mesh position={[0, 0, -0.02]}>
                  <sphereGeometry args={[0.046, 16, 16]} />
                  <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
                </mesh>
                {/* Heavy Armored Forearm Gauntlet */}
                <mesh position={[0, -0.12, 0.02]} castShadow>
                  <cylinderGeometry args={[0.062, 0.052, 0.18, 20]} />
                  <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.15} />
                </mesh>
                {/* Gauntlet Kinetic Overcharge Conduit */}
                <mesh position={[0, -0.12, 0.075]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.13, 12]} />
                  <meshStandardMaterial
                    color={accentColor}
                    emissive={accentColor}
                    emissiveIntensity={isPunching ? 5.8 : 3.0}
                  />
                </mesh>
                {/* Reinforced Cyber Punching Fist */}
                <mesh position={[0, -0.24, 0.02]} castShadow>
                  <boxGeometry args={[0.09, 0.095, 0.095]} />
                  <meshStandardMaterial color={color} metalness={0.92} roughness={0.15} />
                </mesh>
                {/* Knuckle Strike Plate */}
                <mesh position={[0, -0.25, 0.07]}>
                  <boxGeometry args={[0.08, 0.03, 0.02]} />
                  <meshStandardMaterial
                    color="#ffffff"
                    emissive={accentColor}
                    emissiveIntensity={isPunching ? 6.5 : 3.2}
                  />
                </mesh>
              </group>
            </group>
          </group>

          {/* Left Leg & Kinetic Hover Boot */}
          <group ref={leftLegRef} position={[-0.14, 0.9, 0]}>
            {/* Sculpted Smooth Thigh Armor */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.076, 0.062, 0.3, 24]} />
              <meshStandardMaterial color="#111827" metalness={0.84} roughness={0.24} />
            </mesh>
            <mesh position={[0, -0.14, 0.06]} castShadow>
              <boxGeometry args={[0.11, 0.18, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
            </mesh>

            {/* Knee Hinge -> Shin & Boot Group */}
            <group ref={leftShinRef} position={[0, -0.32, 0]}>
              {/* Mechanical Knee Guard with Chevron */}
              <mesh position={[0, 0, 0.05]} castShadow>
                <cylinderGeometry args={[0.055, 0.045, 0.09, 16]} />
                <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0, 0.09]}>
                <boxGeometry args={[0.05, 0.05, 0.015]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
              </mesh>

              {/* Shin Guard & Calf Booster */}
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.055, 0.28, 24]} />
                <meshStandardMaterial color="#0e1726" metalness={0.88} roughness={0.22} />
              </mesh>
              <mesh position={[0, -0.18, 0.055]} castShadow>
                <boxGeometry args={[0.08, 0.2, 0.04]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
              </mesh>

              {/* High-Top Kinetic Cyber Sneaker / Hover Boot */}
              <mesh position={[0, -0.42, 0.05]} castShadow>
                <boxGeometry args={[0.11, 0.16, 0.24]} />
                <meshStandardMaterial color="#070a12" metalness={0.94} roughness={0.14} />
              </mesh>
              {/* Boot Toe Guard */}
              <mesh position={[0, -0.44, 0.16]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.09, 16]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
              </mesh>
              {/* Dual Neon Sole Traction Rails */}
              <mesh position={[-0.04, -0.505, 0.05]}>
                <boxGeometry args={[0.02, 0.015, 0.24]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
              </mesh>
              <mesh position={[0.04, -0.505, 0.05]}>
                <boxGeometry args={[0.02, 0.015, 0.24]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
              </mesh>
            </group>
          </group>

          {/* Right Leg & Kinetic Hover Boot */}
          <group ref={rightLegRef} position={[0.14, 0.9, 0]}>
            {/* Sculpted Smooth Thigh Armor */}
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.076, 0.062, 0.3, 24]} />
              <meshStandardMaterial color="#111827" metalness={0.84} roughness={0.24} />
            </mesh>
            <mesh position={[0, -0.14, 0.06]} castShadow>
              <boxGeometry args={[0.11, 0.18, 0.05]} />
              <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
            </mesh>

            {/* Knee Hinge -> Shin & Boot Group */}
            <group ref={rightShinRef} position={[0, -0.32, 0]}>
              {/* Mechanical Knee Guard with Chevron */}
              <mesh position={[0, 0, 0.05]} castShadow>
                <cylinderGeometry args={[0.055, 0.045, 0.09, 16]} />
                <meshStandardMaterial color="#090d16" metalness={0.92} roughness={0.18} />
              </mesh>
              <mesh position={[0, 0, 0.09]}>
                <boxGeometry args={[0.05, 0.05, 0.015]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.5} />
              </mesh>

              {/* Shin Guard & Calf Booster */}
              <mesh position={[0, -0.18, 0]} castShadow>
                <cylinderGeometry args={[0.065, 0.055, 0.28, 24]} />
                <meshStandardMaterial color="#0e1726" metalness={0.88} roughness={0.22} />
              </mesh>
              <mesh position={[0, -0.18, 0.055]} castShadow>
                <boxGeometry args={[0.08, 0.2, 0.04]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
              </mesh>

              {/* High-Top Kinetic Cyber Sneaker / Hover Boot */}
              <mesh position={[0, -0.42, 0.05]} castShadow>
                <boxGeometry args={[0.11, 0.16, 0.24]} />
                <meshStandardMaterial color="#070a12" metalness={0.94} roughness={0.14} />
              </mesh>
              {/* Boot Toe Guard */}
              <mesh position={[0, -0.44, 0.16]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.09, 16]} />
                <meshStandardMaterial color={color} metalness={0.88} roughness={0.18} />
              </mesh>
              {/* Dual Neon Sole Traction Rails */}
              <mesh position={[-0.04, -0.505, 0.05]}>
                <boxGeometry args={[0.02, 0.015, 0.24]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
              </mesh>
              <mesh position={[0.04, -0.505, 0.05]}>
                <boxGeometry args={[0.02, 0.015, 0.24]} />
                <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={3.8} />
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
            <torusGeometry args={[0.82, 0.02, 16, 48]} />
            <meshBasicMaterial color={accentColor} transparent opacity={0.65} />
          </mesh>
        </group>
      </group>

      {/* Floating Tactical AI Drone Companion (Gyroscopic Orb) */}
      <group ref={droneRef} position={[0.55, 1.65, -0.25]}>
        <mesh castShadow>
          <sphereGeometry args={[0.09, 24, 20]} />
          <meshStandardMaterial color="#090d16" metalness={0.94} roughness={0.14} />
        </mesh>
        {/* Forward Holographic Scanner Eye */}
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.04, 20, 16]} />
          <meshStandardMaterial color="#ffffff" emissive={accentColor} emissiveIntensity={4.5} />
        </mesh>
        {/* Gyroscopic Planetary Orbit Ring */}
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.18, 0.012, 16, 36]} />
          <meshStandardMaterial color={color} emissive={accentColor} emissiveIntensity={2.8} />
        </mesh>
        <pointLight color={accentColor} intensity={2.4} distance={4.5} />
      </group>

      {/* Sprint Aura */}
      <mesh ref={auraRef} position={[0, 0.9, 0]} visible={false}>
        <sphereGeometry args={[0.9, 20, 16]} />
        <meshBasicMaterial color={accentColor} wireframe transparent opacity={0.32} />
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
      modelType={player.modelType || "male_hoodie"}
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
  onNearbyArtwork,
  onNearbyTech,
  onNearbyQuantumNode,
  onNearbyDevOpsNode,
  onNearbyZenNode,
  resonancePulseKey = 0,
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
  playerPoseRef,
  teleportTargetRef,
}: {
  onActiveLandmark: (landmark: LandmarkData | null) => void;
  onNearbyArtwork?: (artwork: ZenPillarId | null) => void;
  onNearbyTech?: (tech: TechPillarData | null) => void;
  onNearbyQuantumNode?: (node: QuantumObservatoryNode | null) => void;
  onNearbyDevOpsNode?: (node: DevOpsStationNode | null) => void;
  onNearbyZenNode?: (node: ZenArchitectureNode | null) => void;
  resonancePulseKey?: number;
  mobileControls: MobileControls;
  localPlayer: {
    id: string;
    name: string;
    color: string;
    accentColor: string;
    modelType?: CharacterModelType;
  };
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
  playerPoseRef?: React.MutableRefObject<{ x: number; y: number; z: number; rot: number; speed: number }>;
  teleportTargetRef?: React.MutableRefObject<[number, number, number] | null>;
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

    /* ---- Instant Teleport Fast-Travel Handling ---- */
    if (teleportTargetRef?.current) {
      const [tx, ty, tz] = teleportTargetRef.current;
      car.pos.set(tx, ty, tz);
      car.speed = 0;
      vel.current = { x: 0, y: 0, z: 0 };
      teleportTargetRef.current = null;
    }

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
    const ISLAND_SIZE = 55.0;
    const onIsland = Math.abs(car.pos.x) <= ISLAND_SIZE && Math.abs(car.pos.z) <= ISLAND_SIZE;
    let groundY = onIsland ? 0 : -999;
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

    /* ---- Void Fall Auto-Respawn (Jatuh Bebas ke Jurang Kosmis) ---- */
    if (car.pos.y < -7.5) {
      car.pos.set(0.0, 0.2, 1.8);
      vel.current.x = 0;
      vel.current.y = 0;
      vel.current.z = 0;
      playTeleportSound();
    }

    /* ---- Elastic Outer Cosmic Bounds ---- */
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

    /* ---- High-Performance HUD Pose Reference & Spatial Ambient Sync ---- */
    if (playerPoseRef?.current) {
      playerPoseRef.current.x = car.pos.x;
      playerPoseRef.current.y = car.pos.y;
      playerPoseRef.current.z = car.pos.z;
      playerPoseRef.current.rot = car.rot;
      playerPoseRef.current.speed = car.speed;
    }

    // Procedural Spatial Ambient Soundscape coordinate update (Web Audio API)
    updateMetaverseSpatialAudio(car.pos.x, car.pos.z);
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

      <CyberMetaverseArena
        carRef={carState}
        onNearbyArtwork={onNearbyArtwork}
        onNearbyTech={onNearbyTech}
        onNearbyQuantumNode={onNearbyQuantumNode}
        onNearbyDevOpsNode={onNearbyDevOpsNode}
        onNearbyZenNode={onNearbyZenNode}
        resonancePulseKey={resonancePulseKey}
      />

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
        modelType={localPlayer.modelType || "male_hoodie"}
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

  // Real-time High Performance Player Pose for Minimap & HUD (0 React re-renders)
  const playerPoseRef = useRef({ x: 0, y: 0, z: 1.6, rot: 0, speed: 0 });

  // Fast Travel Teleport Target Reference
  const teleportTargetRef = useRef<[number, number, number] | null>(null);

  // Procedural Spatial Ambient Soundscape Master State
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  useEffect(() => {
    setIsAudioMuted(getMetaverseAudioMuted());
  }, []);

  const handleToggleAudio = useCallback(() => {
    setIsAudioMuted((prev) => {
      const next = !prev;
      setMetaverseAudioMuted(next);
      return next;
    });
  }, []);

  // Surrounding Tech Ecosystem Ring State
  const [nearbyTech, setNearbyTech] = useState<TechPillarData | null>(null);

  // Stargazer Quantum AI Observatory State
  const [nearbyQuantumNode, setNearbyQuantumNode] = useState<QuantumObservatoryNode | null>(null);

  // DevOps Launchpad & Cloud Infrastructure State
  const [nearbyDevOpsNode, setNearbyDevOpsNode] = useState<DevOpsStationNode | null>(null);

  // Clean Architecture & Software Craftsmanship State
  const [nearbyZenNode, setNearbyZenNode] = useState<ZenArchitectureNode | null>(null);

  // Zen Gallery Kinetic Resonance Pulse State
  const [resonancePulseKey, setResonancePulseKey] = useState(0);

  const handleTriggerResonance = () => {
    setResonancePulseKey((prev) => prev + 1);
    playZenChimeSound(528);
  };

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
          onNearbyTech={setNearbyTech}
          onNearbyQuantumNode={setNearbyQuantumNode}
          onNearbyDevOpsNode={setNearbyDevOpsNode}
          onNearbyZenNode={setNearbyZenNode}
          resonancePulseKey={resonancePulseKey}
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
          playerPoseRef={playerPoseRef}
          teleportTargetRef={teleportTargetRef}
        />
      </Canvas>

      {/* Top HUD (Safe area padding for fixed Navbar) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between p-4 pt-16 sm:p-6 sm:pt-20 md:p-8 md:pt-8">
        <div className="max-w-[280px] sm:max-w-[340px] text-white">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-cyan-400 font-mono">
            Interactive Metaverse Arena
          </p>
          <h1 className="mt-1 text-lg sm:text-xl md:text-2xl font-black leading-tight tracking-[-0.02em]">
            NAUFAL MAULANA
          </h1>
          <p className="mt-1 sm:mt-2 text-[11px] sm:text-xs leading-relaxed text-neutral-400 hidden xs:block">
            Swipe layar arahkan kamera &bull; Kontrol karakter di bawah.
          </p>
          {/* Mobile Visitor Indicator & Audio Toggle */}
          <div className="mt-2 flex items-center gap-1.5 md:hidden pointer-events-auto">
            <button
              onClick={() => {
                setInputName(localPlayer.name);
                setSelectedColor(localPlayer.color);
                setSelectedAccent(localPlayer.accentColor);
                setShowNameModal(true);
              }}
              className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 active:scale-95 transition-transform"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">
                {totalOnline}/{maxPlayers || 10} Online
              </span>
              <span className="text-[10px] text-cyan-300 font-mono underline">
                🤖 {localPlayer.name} ✏️
              </span>
            </button>

            <button
              onClick={handleToggleAudio}
              title={isAudioMuted ? "Aktifkan Audio Metaverse" : "Bisukan Audio Metaverse"}
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all active:scale-90 ${
                !isAudioMuted
                  ? "border-cyan-400/60 bg-cyan-950/70 text-cyan-300"
                  : "border-white/15 bg-black/60 text-neutral-400"
              }`}
            >
              {!isAudioMuted ? (
                <Volume2 className="h-3 w-3 text-cyan-400 animate-pulse" />
              ) : (
                <VolumeX className="h-3 w-3 text-neutral-400" />
              )}
            </button>
          </div>
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
              title="Klik untuk ubah nama atau warna armor exoskeleton kamu"
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
              <span className="text-[11px] font-mono text-neutral-300 flex items-center gap-1.5">
                <span>🤖</span>
                <span>You: <span style={{ color: localPlayer.accentColor }}>{localPlayer.name}</span></span>
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

            {/* Master Spatial Audio Toggle */}
            <button
              onClick={handleToggleAudio}
              title={isAudioMuted ? "Aktifkan Spatial Ambient & Sound FX" : "Bisukan Suara (Mute)"}
              className={`glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all cursor-pointer shadow-lg active:scale-95 ${
                !isAudioMuted
                  ? "border-cyan-400/60 bg-cyan-950/50 text-cyan-300 hover:bg-cyan-900/40"
                  : "border-white/10 bg-neutral-900/40 text-neutral-400 hover:text-white"
              }`}
            >
              {!isAudioMuted ? (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                  <span className="font-mono text-[11px] font-semibold text-cyan-300">AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="font-mono text-[11px] text-neutral-400">AUDIO OFF</span>
                </>
              )}
            </button>

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

      {/* Zen Gallery Surrounding Tech Ecosystem HUD Floating Pill */}
      {nearbyTech && (
        <div className="pointer-events-none absolute inset-x-3 bottom-24 sm:bottom-20 z-30 mx-auto max-w-sm sm:max-w-md rounded-2xl border border-white/10 bg-neutral-950/85 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono font-black text-sm tracking-wider shadow-inner"
              style={{
                borderColor: `${nearbyTech.color}55`,
                backgroundColor: `${nearbyTech.color}15`,
                color: nearbyTech.color,
                boxShadow: `0 0 16px ${nearbyTech.color}25`,
              }}
            >
              {nearbyTech.badge}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    borderColor: `${nearbyTech.color}40`,
                    backgroundColor: `${nearbyTech.color}10`,
                    color: nearbyTech.color,
                  }}
                >
                  {nearbyTech.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Zen Tech Ring</span>
              </div>
              <h4 className="mt-0.5 text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>{nearbyTech.name}</span>
              </h4>
              <p className="text-[11px] text-neutral-300 font-mono truncate">
                {nearbyTech.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stargazer Quantum AI & Distributed Systems HUD Floating Pill */}
      {nearbyQuantumNode && (
        <div className="pointer-events-none absolute inset-x-3 bottom-24 sm:bottom-20 z-30 mx-auto max-w-sm sm:max-w-md rounded-2xl border border-white/10 bg-neutral-950/90 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono font-black text-xs tracking-wider shadow-inner text-center"
              style={{
                borderColor: `${nearbyQuantumNode.color}55`,
                backgroundColor: `${nearbyQuantumNode.color}15`,
                color: nearbyQuantumNode.color,
                boxShadow: `0 0 16px ${nearbyQuantumNode.color}25`,
              }}
            >
              {nearbyQuantumNode.badge}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    borderColor: `${nearbyQuantumNode.color}40`,
                    backgroundColor: `${nearbyQuantumNode.color}10`,
                    color: nearbyQuantumNode.color,
                  }}
                >
                  {nearbyQuantumNode.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Observatory</span>
              </div>
              <h4 className="mt-0.5 text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>{nearbyQuantumNode.name}</span>
              </h4>
              <div className="mt-0.5 inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-cyan-300">
                {nearbyQuantumNode.formula}
              </div>
              <p className="mt-1 text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                {nearbyQuantumNode.concept}
              </p>
              <p className="mt-1 text-[10px] text-neutral-400 truncate font-mono">
                <span className="text-neutral-500">Real-World:</span> {nearbyQuantumNode.realWorldUsage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DevOps Cloud & Aerospace Launchpad HUD Floating Pill */}
      {nearbyDevOpsNode && (
        <div className="pointer-events-none absolute inset-x-3 bottom-24 sm:bottom-20 z-30 mx-auto max-w-sm sm:max-w-md rounded-2xl border border-white/10 bg-neutral-950/90 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono font-black text-xs tracking-wider shadow-inner text-center"
              style={{
                borderColor: `${nearbyDevOpsNode.color}55`,
                backgroundColor: `${nearbyDevOpsNode.color}15`,
                color: nearbyDevOpsNode.color,
                boxShadow: `0 0 16px ${nearbyDevOpsNode.color}25`,
              }}
            >
              {nearbyDevOpsNode.badge}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    borderColor: `${nearbyDevOpsNode.color}40`,
                    backgroundColor: `${nearbyDevOpsNode.color}10`,
                    color: nearbyDevOpsNode.color,
                  }}
                >
                  {nearbyDevOpsNode.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">DevOps Pad</span>
              </div>
              <h4 className="mt-0.5 text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>{nearbyDevOpsNode.name}</span>
              </h4>
              <div className="mt-0.5 inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-amber-300">
                {nearbyDevOpsNode.formula}
              </div>
              <p className="mt-1 text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                {nearbyDevOpsNode.concept}
              </p>
              <p className="mt-1 text-[10px] text-neutral-400 truncate font-mono">
                <span className="text-neutral-500">Real-World:</span> {nearbyDevOpsNode.realWorldUsage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clean Architecture & Cybersecurity Zen Sanctuary HUD Floating Pill */}
      {nearbyZenNode && (
        <div className="pointer-events-none absolute inset-x-3 bottom-24 sm:bottom-20 z-30 mx-auto max-w-sm sm:max-w-md rounded-2xl border border-white/10 bg-neutral-950/90 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border font-mono font-black text-xs tracking-wider shadow-inner text-center"
              style={{
                borderColor: `${nearbyZenNode.color}55`,
                backgroundColor: `${nearbyZenNode.color}15`,
                color: nearbyZenNode.color,
                boxShadow: `0 0 16px ${nearbyZenNode.color}25`,
              }}
            >
              {nearbyZenNode.badge}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase border"
                  style={{
                    borderColor: `${nearbyZenNode.color}40`,
                    backgroundColor: `${nearbyZenNode.color}10`,
                    color: nearbyZenNode.color,
                  }}
                >
                  {nearbyZenNode.category}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Zen Sanctuary</span>
              </div>
              <h4 className="mt-0.5 text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>{nearbyZenNode.name}</span>
              </h4>
              <div className="mt-0.5 inline-block font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-amber-300">
                {nearbyZenNode.formula}
              </div>
              <p className="mt-1 text-[11px] text-neutral-300 line-clamp-2 leading-relaxed">
                {nearbyZenNode.concept}
              </p>
              <p className="mt-1 text-[10px] text-neutral-400 truncate font-mono">
                <span className="text-neutral-500">Real-World:</span> {nearbyZenNode.realWorldUsage}
              </p>
            </div>
          </div>
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
                  <h3 className="text-base font-extrabold text-white">Kustomisasi Karakter Exoskeleton</h3>
                  <p className="text-[11px] text-slate-400">Atur username &amp; warna armor exoskeleton kamu di Metaverse</p>
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
