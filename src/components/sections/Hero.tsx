"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
  useMotionTemplate,
} from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { useRef } from "react";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
});

const roles = [
  { label: "Frontend Engineer", color: "text-cyan-300" },
  { label: "AI Integrations", color: "text-indigo-300" },
  { label: "UI/UX Designer", color: "text-pink-300" },
  { label: "Bot Automations", color: "text-emerald-300" },
];

function RoleRotator() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-flex h-[1.4em] min-w-[15ch] items-center justify-center overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`whitespace-nowrap font-semibold ${roles[index].color}`}
        >
          {roles[index].label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.4);
  const glowX = useSpring(mx, { stiffness: 60, damping: 20 });
  const glowY = useSpring(my, { stiffness: 60, damping: 20 });
  const glow = useMotionTemplate`radial-gradient(600px circle at ${useTransform(
    glowX,
    (v) => v * 100
  )}% ${useTransform(glowY, (v) => v * 100)}%, rgba(56,189,248,0.15), transparent 70%)`;

  const onMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={ref}
      id="top"
      onMouseMove={onMouseMove}
      className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: glow }}
      />

      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 flex w-full flex-col items-center px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass mb-6 flex items-center gap-2 rounded-full px-5 py-2 text-sm text-neutral-300"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Available for opportunities
          <span className="mx-1 h-3 w-px bg-white/20" />
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          Kebumen, Indonesia
        </motion.div>

        <h1 className="sr-only">Naufal Maulana Izzuddin — Frontend Engineer & AI Automations</h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          aria-hidden
          className="mb-2 text-sm font-light uppercase tracking-[0.6em] text-neutral-400 md:text-base"
        >
          Hello, I&apos;m
        </motion.p>

        <div
          aria-hidden
          className="w-full overflow-hidden text-center leading-[0.85]"
        >
          <motion.span
            initial={{ y: "110%", rotate: 4 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-gradient block font-black uppercase tracking-tighter"
            style={{ fontSize: "clamp(4.5rem, 19vw, 19rem)" }}
          >
            Naufal
          </motion.span>
        </div>

        <div
          aria-hidden
          className="w-full overflow-hidden text-center leading-[0.75]"
        >
          <motion.span
            initial={{ y: "110%", rotate: -3 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="hero-stroke block font-black uppercase tracking-tighter"
            style={{ fontSize: "clamp(3.2rem, 13vw, 13rem)" }}
          >
            Maulana
          </motion.span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="mt-6 text-lg md:text-xl"
        >
          <RoleRotator />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.15 }}
          className="mt-6 max-w-xl text-center text-base font-light leading-relaxed text-neutral-400 md:text-lg"
        >
          Architecting fluid web interfaces, responsive design systems, and{" "}
          <span className="text-gradient-static font-medium">
            AI-powered automations
          </span>
          .
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-10 flex items-center gap-5"
        >
          <Magnetic>
            <a
              href="#work"
              className="glow-violet group relative overflow-hidden rounded-full bg-violet-600 px-8 py-4 text-sm font-semibold text-white transition-transform"
            >
              <span className="relative z-10">Explore My Work</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-600 to-violet-600 transition-transform duration-500 group-hover:translate-x-0" />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="#contact"
              className="glass rounded-full px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-violet-500/50"
            >
              Get in Touch
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.a
        href="#showcase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ opacity }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-neutral-500 transition-colors hover:text-white"
      >
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.a>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#090909] to-transparent" />
    </section>
  );
}
