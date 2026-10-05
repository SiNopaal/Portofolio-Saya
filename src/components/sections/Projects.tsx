"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShieldCheck,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Github } from "@/components/ui/icons";
import { motion, AnimatePresence, type Variants } from "framer-motion";

function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.x, rotateY: tilt.y }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.3 },
      scale: { duration: 0.3 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.25 },
    },
  }),
};

export function Projects() {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);

  const tabs = [
    { id: 0, label: "01. Laundry Client Suite", color: "cyan" },
    { id: 1, label: "02. Patukrejomulyo E-Gov", color: "indigo" },
    { id: 2, label: "03. AI Bot Scripting Labs", color: "emerald" },
    { id: 3, label: "04. PT Seven Inc UI/UX", color: "pink" },
  ];

  const auraColors = [
    "bg-cyan-500/15",
    "bg-indigo-500/15",
    "bg-emerald-500/15",
    "bg-pink-500/15",
  ];

  const paginate = (newDirection: number) => {
    setSlide(([prev]) => {
      const next = (prev + newDirection + 4) % 4;
      return [next, newDirection];
    });
  };

  const goToSlide = (index: number) => {
    setSlide(([prev]) => [index, index > prev ? 1 : -1]);
  };

  return (
    <section id="work" className="relative mx-auto max-w-6xl px-6 py-24">
      {/* Dynamic Ambient Aura behind the slider */}
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] transition-all duration-700 ${auraColors[currentSlide]}`}
      />

      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-cyan-400">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-400" />
            <span>Interactive Project Studio</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Featured Engineering &amp; UI/UX
          </h2>
        </div>

        {/* Slide Controls (Arrows & Counter & Dots) */}
        <div className="flex items-center gap-4">
          {/* Animated Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {tabs.map((tab, idx) => (
              <button
                key={tab.id}
                onClick={() => goToSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="relative h-2 rounded-full transition-all duration-300"
                style={{ width: currentSlide === idx ? 22 : 6 }}
              >
                <span
                  className={`absolute inset-0 rounded-full transition-colors ${
                    currentSlide === idx
                      ? "bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          <span className="font-mono text-xs text-slate-400">
            0{currentSlide + 1} / 04
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous Slide"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all hover:border-cyan-400/50 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next Slide"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 shadow-lg transition-all hover:border-cyan-400/50 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs Navigation with animated floating pill */}
      <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 font-mono text-xs">
        {tabs.map((tab) => {
          const isActive = currentSlide === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => goToSlide(tab.id)}
              className={`relative flex flex-shrink-0 items-center gap-2 rounded-xl px-4 py-2 transition-all ${
                isActive
                  ? "text-cyan-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-project-tab"
                  className="absolute inset-0 rounded-xl border border-cyan-500/40 bg-cyan-500/15 shadow-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 h-1.5 w-1.5 rounded-full ${
                  isActive ? "bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" : "bg-slate-600"
                }`}
              />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ANIMATED SLIDER CONTAINER (Supports Drag / Swipe Gestures & Framer Motion transitions) */}
      <div className="relative min-h-[580px] overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentSlide === 0 && (
            <motion.div
              key="slide-0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 100 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-cyan-500/20 bg-[#0c101d]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
                      Client Commercial &bull; 2026
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Project Lead &bull; UI/UX &amp; FE
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    Commercial Laundry Operations &amp; Client Web Suite
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Spearheaded the engineering and design of an end-to-end commercial operations system for laundry businesses. Built{" "}
                    <strong className="text-cyan-300">Londri-Admin</strong> (real-time order pipeline &amp; financial reporting) and{" "}
                    <strong className="text-cyan-300">Laundry Central</strong> (conversion-optimized company profile).
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400" />
                      <span>Managed sprint milestones across 3 team git repositories</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400" />
                      <span>Real-time status tracking, order queues &amp; daily revenue graphs</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">Next.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">React.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">Tailwind CSS</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-pink-300">Figma UI/UX</span>
                  </div>
                  <div className="flex items-center gap-4 pt-3 font-mono text-xs">
                    <a
                      href="https://github.com/wewolk/londri-admin"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-cyan-300 transition-all hover:bg-cyan-500/30"
                    >
                      <Github className="h-4 w-4" />
                      <span>londri-admin</span>
                    </a>
                    <a
                      href="https://github.com/wewolk/compro-laundry-central"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-slate-300 transition-all hover:bg-white/10"
                    >
                      <Github className="h-4 w-4" />
                      <span>compro-central</span>
                    </a>
                  </div>
                </div>

                {/* 3D Tilt Mockup Dashboard */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0a0d17] shadow-2xl shadow-cyan-950/50">
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#121626] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-slate-400">londri-admin.internal/dashboard</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE DB
                      </span>
                    </div>
                    <div className="space-y-4 p-3.5 sm:p-5 font-sans text-xs">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2 sm:p-3">
                          <div className="font-mono text-[8px] sm:text-[10px] text-slate-400">MONTHLY REVENUE</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-base font-bold text-white">Rp 48.5M</div>
                          <div className="mt-0.5 text-[8px] sm:text-[10px] text-emerald-400">&uarr; 18.4%</div>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2 sm:p-3">
                          <div className="font-mono text-[8px] sm:text-[10px] text-slate-400">ACTIVE ORDERS</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-base font-bold text-cyan-400">142 Orders</div>
                          <div className="mt-0.5 text-[8px] sm:text-[10px] text-slate-400">8 Wash &bull; 12 Dry</div>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 p-2 sm:p-3">
                          <div className="font-mono text-[8px] sm:text-[10px] text-slate-400">SYSTEM HEALTH</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-base font-bold text-emerald-400">99.8%</div>
                          <div className="mt-0.5 text-[8px] sm:text-[10px] text-slate-400">App Router</div>
                        </div>
                      </div>

                      <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[360px] space-y-2 rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-[11px]">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 font-semibold text-slate-400">
                            <span>ORDER ID</span>
                            <span>CUSTOMER / SERVICE</span>
                            <span>AMOUNT</span>
                            <span>STATUS</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-200">
                            <span className="text-cyan-400">#ORD-9821</span>
                            <span>Hotel Santika (Bedding 45kg)</span>
                            <span className="font-semibold text-white">Rp 450.000</span>
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">COMPLETED</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-200">
                            <span className="text-cyan-400">#ORD-9822</span>
                            <span>Anisa Rahma (Express Wash 6kg)</span>
                            <span className="font-semibold text-white">Rp 54.000</span>
                            <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">WASHING</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-200">
                            <span className="text-cyan-400">#ORD-9823</span>
                            <span>Dian S. (Curtain Dry Clean)</span>
                            <span className="font-semibold text-white">Rp 120.000</span>
                            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">IRONING</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-[10px] sm:text-[11px] text-cyan-300">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>Strict Role-Based Access: Admin, Cashier, Owner</span>
                        </span>
                        <span className="font-mono text-slate-400">TypeScript + Tailwind</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div
              key="slide-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 100 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-indigo-500/20 bg-[#0d0f21]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-300">
                      Civic Governance &bull; 2024
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      100% QA Pass &bull; 32 Scenarios
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    Patukrejomulyo E-Gov &bull; Public Incident Platform
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Civic facility incident tracking platform for rural governance. Combines interactive Google Maps spatial mapping with AI categorization to triage incoming citizen complaints 50% faster.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-indigo-400" />
                      <span>Black Box Testing across 8 features &amp; 32 test scenarios</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-indigo-400" />
                      <span>Hands-on User Acceptance Testing (UAT) with village officials</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-indigo-300">Next.js App Router</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">Google Maps API</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">NestJS</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">PostgreSQL</span>
                  </div>
                  <div className="flex items-center gap-2 pt-3 font-mono text-xs text-indigo-300">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <span>Patukrejomulyo Village, Bonorowo, Kebumen</span>
                  </div>
                </div>

                {/* 3D Tilt Map Visual Mockup */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#090b16] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#121526] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-slate-400">maps.patukrejomulyo.desa.id/live-map</span>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-400">SPATIAL RADAR</span>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border border-indigo-500/20 bg-[#070b18]">
                        <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] bg-[size:16px_16px] opacity-40" />
                        <div className="flex h-36 w-36 animate-pulse items-center justify-center rounded-full border border-indigo-500/40">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-cyan-500/50">
                            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                          </div>
                        </div>
                        <div className="absolute left-2.5 top-2.5 sm:left-6 sm:top-6 flex items-center gap-1 sm:gap-1.5 rounded-lg border border-rose-500/60 bg-[#0f1424]/90 p-1.5 sm:p-2 font-mono text-[9px] sm:text-[10px] shadow-lg">
                          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 animate-ping rounded-full bg-rose-500" />
                          <span className="font-bold text-rose-300">[HIGH]</span> Jembatan RW 02
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 sm:bottom-6 sm:right-6 flex items-center gap-1 sm:gap-1.5 rounded-lg border border-amber-500/60 bg-[#0f1424]/90 p-1.5 sm:p-2 font-mono text-[9px] sm:text-[10px] shadow-lg">
                          <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-500" />
                          <span className="text-amber-300">[PROGRESS]</span> Lampu Jalan RT 01
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                        <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">AI AUTO-TRIAGE:</span>
                          <div className="mt-0.5 font-bold text-indigo-300">Categorized in 42ms</div>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-white/5 p-2.5">
                          <span className="text-slate-400">RESPONSE LATENCY:</span>
                          <div className="mt-0.5 font-bold text-cyan-300">50% Faster Triage</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div
              key="slide-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 100 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-emerald-500/20 bg-[#08120c]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
                      Automation Labs &bull; 2024 &ndash; 2026
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Autonomous Agents
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    AI Bot Scripting &amp; Automated Web Solutions
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Architected automated background worker bots using Python and Node.js integrated with LLM APIs. Automates data extraction, content summarization, and reactive messaging listeners with robust retry mechanisms.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Automated multi-worker task queuing &amp; webhook dispatchers</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Rate-limit throttling &amp; structured JSON function-calling</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-emerald-300">Python 3</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-emerald-300">Node.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">LLM APIs</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">Webhooks</span>
                  </div>
                </div>

                {/* 3D Tilt Code/Worker Terminal */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#060e0a] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#0f1f16] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-slate-400">agent_dispatcher.py &bull; active</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400">THREAD: 4 WORKERS</span>
                    </div>
                    <div className="space-y-2 bg-black/70 p-5 font-mono text-[11.5px] text-slate-300">
                      <div className="text-slate-500"># Autonomous event loop running with API rate guard</div>
                      <div>
                        <span className="font-bold text-emerald-400">def</span>{" "}
                        <span className="text-cyan-300">dispatch_agent_task</span>(payload: dict):
                      </div>
                      <div className="pl-4 text-slate-400">
                        &gt;&gt; Parsing target event: <span className="text-amber-300">&quot;NEW_INQUIRY&quot;</span>
                      </div>
                      <div className="pl-4 text-indigo-300">
                        &gt;&gt; Invoking LLM Function Call [schema_verified: True]
                      </div>
                      <div className="pl-4 text-emerald-400">
                        &gt;&gt; Response generated in 182ms &bull; Payload valid
                      </div>
                      <div className="pl-4 text-cyan-300">&gt;&gt; Webhook trigger sent &rarr; 200 OK</div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-[10px] sm:text-[11px] text-slate-400">
                        <span>MEM: <strong className="text-emerald-400">128 MB</strong></span>
                        <span>SUCCESS: <strong className="text-emerald-400">99.9%</strong></span>
                        <span>QUEUE: <strong className="text-cyan-400">0 IDLE</strong></span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {currentSlide === 3 && (
            <motion.div
              key="slide-3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -100 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 100 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="w-full cursor-grab active:cursor-grabbing"
            >
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-pink-500/20 bg-[#160c18]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 font-mono text-xs text-pink-300">
                      Internship &bull; Jun &ndash; Aug 2025
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300">
                      PT Seven Inc (Yogyakarta)
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    Titik Visual (13+ Pages) &amp; Nebeng Ride-Sharing UI/UX
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Led UI/UX design architecture in Figma. Expanded the commercial landing platform of &quot;Titik Visual&quot; across 13+ responsive web pages and structured 4-role user flows for &quot;Nebeng&quot; ride-sharing.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-pink-400" />
                      <span>Engineered reusable Design Tokens, UI Kits, and typography systems</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-pink-400" />
                      <span>Authored BRD and collaborated closely with front-end engineers</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-pink-300">Figma</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-pink-300">Design Systems</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">User Flow Mapping</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">BRD Specs</span>
                  </div>
                </div>

                {/* 3D Tilt Figma Visual Board Mockup */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-pink-500/30 bg-[#120814] shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#211024] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="ml-2 text-slate-400">figma.com/@naufal/seven-inc-ui-kit</span>
                      </div>
                      <span className="text-[11px] font-bold text-pink-400">13+ FRAMES</span>
                    </div>
                    <div className="space-y-4 p-5 font-mono text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <div className="rounded-xl border border-pink-500/20 bg-pink-500/10 p-2.5 sm:p-3">
                          <div className="text-[9px] sm:text-[10px] text-pink-300 font-bold uppercase">TITIK VISUAL CMS</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold text-white">Full Landing Architecture</div>
                          <div className="mt-0.5 text-[9px] sm:text-[10px] text-slate-400">Hero, Features, Pricing, Form</div>
                        </div>
                        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-2.5 sm:p-3">
                          <div className="text-[9px] sm:text-[10px] text-violet-300 font-bold uppercase">NEBENG APP</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-bold text-white">Ride-Sharing Matrix</div>
                          <div className="mt-0.5 text-[9px] sm:text-[10px] text-slate-400">Driver, Passenger, Fleet, Admin</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 rounded-lg border border-white/5 bg-white/5 p-2.5 sm:p-3 text-[10px] sm:text-[11px] text-slate-300">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-pink-400 flex-shrink-0" />
                          <span>Interactive Components &amp; Atomic Tokens</span>
                        </div>
                        <span className="text-pink-300 font-bold flex-shrink-0">100% Mobile Ready</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
