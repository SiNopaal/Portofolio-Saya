"use client";

import dynamic from "next/dynamic";
import { ArrowRight, Orbit } from "lucide-react";
import { Github } from "@/components/ui/icons";

const KineticCore = dynamic(
  () => import("@/components/three/KineticCore").then((mod) => mod.KineticCore),
  { ssr: false }
);

export function About() {
  return (
    <section
      id="about"
      className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-12 px-6 pb-20 pt-24 md:flex-row md:pb-28 md:pt-32"
    >
      {/* Hero / About Text */}
      <div className="z-10 flex-1 space-y-6 text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-xs text-emerald-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Available for Projects &amp; Frontend Roles</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
          Architect of{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
            Fluid Interfaces
          </span>{" "}
          &amp; Autonomous Bots.
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          I&apos;m{" "}
          <span className="font-semibold text-white">Naufal Maulana Izzuddin</span>{" "}
          — Frontend Engineer &amp; UI/UX Designer from Kebumen, Indonesia. I bridge modern
          Next.js/React architectures with intelligent AI bot automations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 md:justify-start">
          <a
            href="#work"
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition-all hover:opacity-95"
          >
            <span>Explore Projects</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="https://github.com/SiNopaal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1118]/80 px-5 py-3 font-mono text-sm text-slate-300 transition-all hover:bg-[#161a26] hover:text-white"
          >
            <Github className="h-4 w-4" />
            <span>github/SiNopaal</span>
          </a>
        </div>

        {/* Quick Stats */}
        <div className="mx-auto grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono md:mx-0">
          <div>
            <div className="text-2xl font-bold text-cyan-400">13+</div>
            <div className="text-xs text-slate-500">Pages Shipped</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">100%</div>
            <div className="text-xs text-slate-500">QA Pass Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">2026</div>
            <div className="text-xs text-slate-500">Graduating S1</div>
          </div>
        </div>
      </div>

      {/* 3D Interactive Mesh Canvas */}
      <div className="relative flex h-[350px] w-full items-center justify-center sm:h-[420px] md:w-5/12">
        <div className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-cyan-500/10 to-indigo-500/5 blur-2xl" />
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/5 bg-[#0a0d16]/50 shadow-2xl backdrop-blur-xl">
          <KineticCore />
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0c101d]/80 px-2.5 py-1 font-mono text-[11px] text-slate-400 backdrop-blur-md">
            <Orbit className="h-3 w-3 text-cyan-400" />
            <span>Interactive Kinetic Core &bull; Drag to rotate</span>
          </div>
        </div>
      </div>
    </section>
  );
}
