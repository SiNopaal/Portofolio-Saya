"use client";

import { MessageCircle, Mail, Download } from "lucide-react";
import { Github, Linkedin } from "@/components/ui/icons";

export function Contact() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-white/10 bg-[#07090e]/80 px-6 py-20 backdrop-blur-md"
    >
      <div className="mx-auto max-w-4xl space-y-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          Let&apos;s Connect
        </div>
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Have a Project or Role in Mind?
        </h2>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-400">
          Currently open for Frontend Engineering positions, UI/UX design challenges, and custom AI
          bot automation contracts.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="https://wa.me/6285770266735"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp Chat</span>
          </a>
          <a
            href="mailto:naufalmaulana806@gmail.com"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:bg-cyan-400"
          >
            <Mail className="h-4 w-4" />
            <span>naufalmaulana806@gmail.com</span>
          </a>
          <a
            href="/Resume-Naufal Maulana.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0f1118]/80 px-6 py-3 font-mono text-sm text-slate-200 shadow-md transition-all hover:bg-[#161a26]"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Download CV</span>
          </a>
        </div>

        {/* Social Links Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8 font-mono text-xs text-slate-400 sm:gap-6">
          <a
            href="https://www.linkedin.com/in/naufalmaulanaizzuddin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <Linkedin className="h-4 w-4" />
            <span>LinkedIn</span>
          </a>
          <span>&bull;</span>
          <a
            href="https://github.com/SiNopaal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <span>&bull;</span>
          <span className="text-slate-500">Kebumen, Central Java, Indonesia</span>
        </div>

        <div className="pt-6 font-mono text-xs text-slate-600">
          &copy; 2026 Naufal Maulana Izzuddin &bull; Built with Next.js, Tailwind CSS &amp; Three.js
        </div>
      </div>
    </footer>
  );
}
