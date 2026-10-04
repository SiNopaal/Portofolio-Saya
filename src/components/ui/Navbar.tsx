"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  FileText,
  Gamepad2,
  Sparkles,
  Terminal,
  Layers,
  Cpu,
  Milestone,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "ARENA", href: "#top", icon: Gamepad2 },
  { label: "ABOUT", href: "#about", icon: Sparkles },
  { label: "TERMINAL", href: "#terminal", icon: Terminal },
  { label: "WORK", href: "#work", icon: Layers },
  { label: "STACK", href: "#stack", icon: Cpu },
  { label: "JOURNEY", href: "#journey", icon: Milestone },
  { label: "CONTACT", href: "#contact", icon: Send },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("#top");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Determine active section on scroll
      const sections = navItems.map((item) => item.href.replace("#", ""));
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sections[i]);
        if (sec && sec.offsetTop <= scrollPos) {
          setActiveItem(`#${sections[i]}`);
          break;
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4 pointer-events-none">
      <nav
        className={`pointer-events-auto flex items-center justify-between lg:justify-center gap-2 sm:gap-3 rounded-full border px-3 py-1.5 sm:px-4 sm:py-2 transition-all duration-300 shadow-2xl backdrop-blur-xl ${
          scrolled
            ? "border-cyan-500/30 bg-[#080c18]/90 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
            : "border-white/10 bg-[#090d1a]/85 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* MOBILE: ACTIVE ARENA PILL LINK */}
        <a
          href="#top"
          onClick={() => setActiveItem("#top")}
          className="flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs font-bold text-cyan-300 transition-all active:scale-95 lg:hidden"
        >
          <Gamepad2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>ARENA</span>
        </a>

        {/* DESKTOP: CLEAN CAPSULE NAVIGATION STARTING FROM ARENA */}
        <div className="hidden lg:flex items-center gap-1 font-mono text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setActiveItem(item.href)}
                className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-300 ${
                  isActive
                    ? "text-cyan-300 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 h-3.5 w-3.5 ${
                    isActive ? "text-cyan-400" : "opacity-70"
                  }`}
                />
                <span className="relative z-10">{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* VERTICAL DIVIDER (DESKTOP) */}
        <div className="hidden lg:block h-4 w-px bg-white/15 mx-1" />

        {/* RIGHT QUICK ACTIONS */}
        <div className="flex items-center gap-2">
          {/* Punch Shortcut Hint */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-slate-400">
            <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px] font-bold text-cyan-300">
              [F]
            </kbd>
            <span>Punch</span>
          </div>

          {/* CV Button */}
          <a
            href="/Resume-Naufal Maulana.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-white hover:shadow-[0_0_12px_rgba(56,189,248,0.3)] active:scale-95"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400 transition-transform group-hover:-translate-y-0.5" />
            <span>CV</span>
          </a>

          {/* Hire Me CTA Button */}
          <a
            href="#contact"
            className="relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/40 active:scale-95"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-[#090d1a]/70 px-3.5 py-1.5 font-mono text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-transparent">
              <span>Hire Me</span>
              <span className="text-cyan-400">&rarr;</span>
            </span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* MOBILE EXPANDED HUD MENU */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto absolute left-3 right-3 top-16 z-50 rounded-2xl border border-cyan-500/30 bg-[#080c18]/95 p-4 shadow-2xl backdrop-blur-2xl sm:left-auto sm:right-auto sm:w-96"
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-slate-300">
                  METAVERSE HUB &bull; ONLINE
                </span>
              </div>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                PUNCH: [F] / CLICK
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => {
                      setActiveItem(item.href);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-xs transition-all ${
                      isActive
                        ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-bold"
                        : "border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
              <a
                href="/Resume-Naufal Maulana.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 py-2 font-mono text-xs text-cyan-300"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View CV</span>
              </a>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 py-2 font-mono text-xs font-semibold text-white shadow-lg shadow-cyan-500/20"
              >
                Hire Me &rarr;
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
