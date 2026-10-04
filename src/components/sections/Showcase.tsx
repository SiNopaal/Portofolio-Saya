"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { projects } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

function ShowcaseCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  return (
    <div
      className="group relative h-[62vh] w-[78vw] shrink-0 overflow-hidden rounded-3xl md:w-[46vw]"
      style={{ perspective: 1200 }}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${project.accent} opacity-20 transition-opacity duration-500 group-hover:opacity-35`}
      />
      <div className="glass absolute inset-0" />

      {/* Fake app preview */}
      <div className="absolute inset-x-8 bottom-0 top-20 overflow-hidden rounded-t-2xl border border-white/10 bg-[#0d0d10] shadow-2xl transition-transform duration-700 group-hover:-translate-y-3 group-hover:rotate-[0.5deg]">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
          <span className="ml-3 rounded-md bg-white/5 px-3 py-0.5 text-[10px] text-neutral-500">
            {project.id}.dev
          </span>
        </div>
        <div className="space-y-3 p-5">
          <div className={`h-3 w-2/5 rounded bg-gradient-to-r ${project.accent} opacity-70`} />
          <div className="h-2 w-4/5 rounded bg-white/10" />
          <div className="h-2 w-3/5 rounded bg-white/10" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-white/5 p-3">
                <div className={`bg-gradient-to-r ${project.accent} bg-clip-text text-lg font-bold text-transparent`}>
                  {m.value}
                </div>
                <div className="mt-1 h-1.5 w-4/5 rounded bg-white/10" />
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-2">
            {[70, 45, 85, 30, 60].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-8 rounded bg-white/10" />
                <div
                  className={`h-1.5 rounded bg-gradient-to-r ${project.accent} opacity-40`}
                  style={{ width: `${w}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-8">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-neutral-500">
            {String(index + 1).padStart(2, "0")} — {project.year}
          </span>
          <h3 className="mt-1 text-2xl font-bold text-white md:text-3xl">
            {project.title}
          </h3>
          <p className="text-sm text-neutral-400">{project.subtitle}</p>
        </div>
        <div className="glass rounded-full p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export function Showcase() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-72%"]);

  return (
    <section id="showcase" ref={targetRef} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-8 px-6 md:px-16">
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-violet-400">
            Selected Work
          </span>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Things I&apos;ve <span className="text-gradient">Built</span>
          </h2>
        </div>
        <motion.div style={{ x }} className="flex gap-8 pl-6 md:pl-16">
          {projects.map((p, i) => (
            <ShowcaseCard key={p.id} project={p} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
