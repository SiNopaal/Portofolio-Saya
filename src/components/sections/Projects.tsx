"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ExternalLink,
  Lock,
  Sparkles,
  Globe,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Smartphone,
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
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
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
    x: direction > 0 ? 80 : -80,
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
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 },
    },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: "spring" as const, stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  }),
};

export function Projects() {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);

  const tabs = [
    { id: 0, label: "01. Central Laundry Express", color: "cyan" },
    { id: 1, label: "02. Management Ternak", color: "emerald" },
    { id: 2, label: "03. Patukrejomulyo E-Gov", color: "indigo" },
  ];

  const auraColors = [
    "bg-cyan-500/15",
    "bg-emerald-500/15",
    "bg-indigo-500/15",
  ];

  const paginate = (newDirection: number) => {
    setSlide(([prev]) => {
      const next = (prev + newDirection + 3) % 3;
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
            <span>Live Web Showcase</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Featured Web Projects
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
            0{currentSlide + 1} / 03
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

      {/* ANIMATED SLIDER CONTAINER */}
      <div className="relative min-h-[580px] overflow-hidden rounded-3xl">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {/* SLIDE 0: Central Laundry Express */}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 font-mono text-xs text-cyan-300">
                      Live Production &bull; 2026
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      Project Lead &bull; UI/UX &amp; FE
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    Central Laundry Express
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Platform website resmi <strong className="text-cyan-300">Central Laundry Express</strong> di Purbalingga. Menghadirkan booking antar-jemput kilat via WhatsApp, estimasi harga transparan, dan desain landing page mobile-first berkecepatan tinggi.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Alur pemesanan laundry kilat 3 jam terintegrasi WhatsApp API</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Desain responsif modern &amp; optimasi performa Next.js App Router</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">Next.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">Tailwind CSS</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">TypeScript</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-pink-300">Figma UI/UX</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-3 font-mono text-xs">
                    <a
                      href="https://www.centrallaundryexpress.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 active:scale-95"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Live Website</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href="https://github.com/wewolk/compro-laundry-central"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
                    >
                      <Github className="h-4 w-4" />
                      <span>compro-central</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Browser Mockup */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0a0d17] shadow-2xl shadow-cyan-950/50">
                    {/* Browser Chrome Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#101424] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <a
                        href="https://www.centrallaundryexpress.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-2 flex flex-1 max-w-sm items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
                      >
                        <Lock className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">https://www.centrallaundryexpress.com</span>
                      </a>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span>LIVE</span>
                      </span>
                    </div>

                    {/* Web Preview Content */}
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0b1224] to-[#080d19] text-white">
                      {/* Mock Website Navbar */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500 text-xs font-black text-black">
                            CL
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">Central Laundry</div>
                            <div className="text-[9px] text-cyan-400 font-mono tracking-wider">EXPRESS PURBALINGGA</div>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-300">
                          <span className="text-cyan-300">Beranda</span>
                          <span className="hover:text-white">Layanan</span>
                          <span className="hover:text-white">Harga</span>
                          <span className="hover:text-white">Kontak</span>
                        </div>
                        <a
                          href="https://www.centrallaundryexpress.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                        >
                          Chat WhatsApp
                        </a>
                      </div>

                      {/* Mock Website Hero View */}
                      <div className="pt-5 pb-2 space-y-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-mono text-cyan-300">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          <span>Jasa Laundry Profesional Purbalingga</span>
                        </div>
                        <h4 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                          Pakaian Bersih, Rapi &amp; Wangi Tanpa Ribet
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                          Layanan laundry kiloan &amp; dry cleaning profesional dengan teknologi modern, deterjen ramah lingkungan, serta layanan gratis antar jemput.
                        </p>

                        {/* Quick Feature Pills */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2 sm:p-2.5 text-center">
                            <div className="text-[10px] font-bold text-cyan-300">⚡ Express 3 Jam</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Selesai Hari Ini</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2 sm:p-2.5 text-center">
                            <div className="text-[10px] font-bold text-emerald-300">🛵 Antar Jemput</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Area Purbalingga</div>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-2 sm:p-2.5 text-center">
                            <div className="text-[10px] font-bold text-pink-300">🏷️ Rp 6.000/kg</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Cuci + Setrika</div>
                          </div>
                        </div>

                        {/* Direct Live Preview Footer Bar */}
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-[11px] text-cyan-300">
                          <span className="flex items-center gap-1.5 font-mono">
                            <Smartphone className="h-3.5 w-3.5" />
                            <span>100% Mobile Optimized Web Experience</span>
                          </span>
                          <a
                            href="https://www.centrallaundryexpress.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold text-white hover:underline"
                          >
                            <span>Buka Web</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {/* SLIDE 1: Management Ternak (TernakPro) */}
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
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-emerald-500/20 bg-[#08130e]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-300">
                      Cloud App &bull; 2025 &ndash; 2026
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      Fullstack Web System
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    TernakPro &bull; Management Ternak
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Sistem manajemen peternakan berbasis web dengan pelacakan identifikasi barcode digital. Memudahkan pencatatan populasi hewan, rekam medis vaksinasi, pemantauan siklus pakan, dan analitik pertumbuhan ternak.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Pelacakan profil ternak cepat via QR &amp; barcode identification</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Monitoring stok pakan, bobot ternak &amp; rekam jadwal vaksinasi</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-emerald-300">Next.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">React.js</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">Tailwind CSS</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">Vercel Cloud</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-3 font-mono text-xs">
                    <a
                      href="https://managementternak.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/40 active:scale-95"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Live Website</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href="https://github.com/SiNopaal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
                    >
                      <Github className="h-4 w-4" />
                      <span>Source Profile</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Browser Mockup */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#07110c] shadow-2xl shadow-emerald-950/50">
                    {/* Browser Chrome Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#0e1f16] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <a
                        href="https://managementternak.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-2 flex flex-1 max-w-sm items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-emerald-400/50 hover:text-white"
                      >
                        <Lock className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">https://managementternak.vercel.app</span>
                      </a>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                        <span>LIVE</span>
                      </span>
                    </div>

                    {/* Web Preview Content */}
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0a1811] to-[#06100b] text-white">
                      {/* Mock Website Navbar */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-black">
                            TP
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">TernakPro</div>
                            <div className="text-[9px] text-emerald-400 font-mono tracking-wider">MANAJEMEN &amp; BARCODE</div>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-300">
                          <span className="text-emerald-300">Dashboard</span>
                          <span className="hover:text-white">Data Ternak</span>
                          <span className="hover:text-white">Pakan</span>
                          <span className="hover:text-white">Laporan</span>
                        </div>
                        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] font-mono text-slate-300">
                          Admin Aktif
                        </span>
                      </div>

                      {/* Mock Website Dashboard View */}
                      <div className="pt-4 pb-2 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs sm:text-sm font-bold text-white">Ringkasan Peternakan</div>
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Data Realtime
                          </span>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                            <div className="text-[9px] font-mono text-slate-400 uppercase">Total Ternak</div>
                            <div className="mt-0.5 text-xs sm:text-base font-bold text-white">154 Ekor</div>
                            <div className="text-[9px] text-emerald-400 mt-0.5">Sapi 48 &bull; Kambing 106</div>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                            <div className="text-[9px] font-mono text-slate-400 uppercase">Kesehatan</div>
                            <div className="mt-0.5 text-xs sm:text-base font-bold text-emerald-300">98.5%</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Kondisi Prima</div>
                          </div>
                          <div className="rounded-xl border border-white/5 bg-white/5 p-2.5">
                            <div className="text-[9px] font-mono text-slate-400 uppercase">Stok Pakan</div>
                            <div className="mt-0.5 text-xs sm:text-base font-bold text-cyan-300">4.2 Ton</div>
                            <div className="text-[9px] text-slate-400 mt-0.5">Aman 14 Hari</div>
                          </div>
                        </div>

                        {/* Animal Barcode & Health Log Cards */}
                        <div className="space-y-2 pt-1 font-mono text-[11px]">
                          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300">#TRN-042</span>
                              <span className="text-white text-xs">Sapi Limosin (420 kg)</span>
                            </div>
                            <span className="text-emerald-400 text-[10px]">Vaksin Lengkap &bull; Sehat</span>
                          </div>
                          <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-2.5">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] text-cyan-300">#TRN-089</span>
                              <span className="text-white text-xs">Kambing Etawa (54 kg)</span>
                            </div>
                            <span className="text-cyan-400 text-[10px]">Jadwal Pakan Teratur</span>
                          </div>
                        </div>

                        {/* Live Direct Preview Footer Bar */}
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
                          <span className="flex items-center gap-1.5 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Digital Farm Automation &amp; Barcode Integration</span>
                          </span>
                          <a
                            href="https://managementternak.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold text-white hover:underline"
                          >
                            <span>Buka Web</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: Patukrejomulyo E-Gov */}
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
              <div className="grid grid-cols-1 items-center gap-8 rounded-3xl border border-indigo-500/20 bg-[#0d0f21]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:grid-cols-12">
                <div className="space-y-5 lg:col-span-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs text-indigo-300">
                      Civic Governance &bull; 2024
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      100% QA Pass &bull; 32 Scenarios
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-snug text-white sm:text-3xl">
                    Patukrejomulyo E-Gov Portal
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Platform pengaduan fasilitas umum digital resmi untuk Desa Patukrejomulyo, Kebumen. Dilengkapi integrasi pemetaan spasial Google Maps dan triase AI untuk mempercepat respon perbaikan infrastruktur publik.
                  </p>
                  <div className="space-y-2 pt-1 font-mono text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <span>Pelaporan kerusakan warga (jalan, jembatan, lampu) secara realtime</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <span>Lulus 100% Black Box Testing di 32 skenario tata kelola desa</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-indigo-300">Next.js App Router</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-cyan-300">Google Maps API</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">NestJS</span>
                    <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-xs text-slate-300">PostgreSQL</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-3 font-mono text-xs">
                    <a
                      href="https://www.patukrejomulyo.web.id/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-500/40 active:scale-95"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Visit Live Website</span>
                      <ExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href="https://github.com/SiNopaal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300 transition-all hover:border-indigo-400/40 hover:bg-white/10 hover:text-white"
                    >
                      <Github className="h-4 w-4" />
                      <span>Source Profile</span>
                    </a>
                  </div>
                </div>

                {/* Interactive Browser Mockup */}
                <TiltCard className="lg:col-span-7">
                  <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#090c1b] shadow-2xl shadow-indigo-950/50">
                    {/* Browser Chrome Header */}
                    <div className="flex items-center justify-between border-b border-white/10 bg-[#12162d] px-4 py-2.5 font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-3 w-3 rounded-full bg-rose-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-500/80" />
                        <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <a
                        href="https://www.patukrejomulyo.web.id/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-2 flex flex-1 max-w-sm items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-3 py-1 text-[11px] text-slate-300 transition-colors hover:border-indigo-400/50 hover:text-white"
                      >
                        <Lock className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">https://www.patukrejomulyo.web.id</span>
                      </a>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                        <span>LIVE</span>
                      </span>
                    </div>

                    {/* Web Preview Content */}
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#0c1126] to-[#080b18] text-white">
                      {/* Mock Website Navbar */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                            PK
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white leading-tight">Patukrejomulyo</div>
                            <div className="text-[9px] text-indigo-300 font-mono tracking-wider">LAYANAN PENGADUAN DIGITAL</div>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-slate-300">
                          <span className="text-indigo-300">Beranda</span>
                          <span className="hover:text-white">Berita</span>
                          <span className="hover:text-white">Laporan</span>
                          <span className="hover:text-white">Buat Laporan</span>
                        </div>
                        <span className="rounded-full bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 text-[10px] font-mono text-blue-300">
                          Kebumen E-Gov
                        </span>
                      </div>

                      {/* Mock Website Hero View */}
                      <div className="pt-4 pb-2 space-y-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-[10px] font-mono text-indigo-300">
                          <MapPin className="h-3 w-3 text-indigo-400" />
                          <span>Layanan Publik Desa Bonorowo, Kebumen</span>
                        </div>
                        <h4 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white leading-tight">
                          Pengaduan Kerusakan Fasilitas Umum
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
                          Laporkan jalan rusak, jembatan, dan lampu penerangan warga secara digital dan transparan untuk percepatan tindak lanjut aparat desa.
                        </p>

                        {/* Radar / Spatial Infrastructure Status */}
                        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-indigo-500/20 bg-[#060a17]">
                          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:14px_14px] opacity-40" />
                          <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full border border-indigo-500/30">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/40">
                              <div className="h-2 w-2 rounded-full bg-cyan-400" />
                            </div>
                          </div>
                          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-lg border border-rose-500/50 bg-[#0f1424]/90 px-2 py-1 font-mono text-[9px] shadow-lg">
                            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rose-500" />
                            <span className="font-bold text-rose-300">[URGENT]</span> Jembatan RW 02
                          </div>
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-[#0f1424]/90 px-2 py-1 font-mono text-[9px] shadow-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-emerald-300">[SELESAI]</span> Lampu Jalan RT 01
                          </div>
                        </div>

                        {/* Live Direct Preview Footer Bar */}
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-[11px] text-indigo-300">
                          <span className="flex items-center gap-1.5 font-mono">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>GIS Mapping &bull; 100% QA Pass (32 Skenario)</span>
                          </span>
                          <a
                            href="https://www.patukrejomulyo.web.id/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-bold text-white hover:underline"
                          >
                            <span>Buka Web</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
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
