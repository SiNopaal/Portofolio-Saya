"use client";

import { Layout, Cpu, Palette, Database } from "lucide-react";

export function TechStack() {
  const categories = [
    {
      title: "Frontend & Web",
      icon: Layout,
      color: "text-cyan-400",
      borderColor: "border-cyan-500/20 hover:border-cyan-500/40",
      items: [
        { name: "Next.js (App Router)", badge: "Primary", highlight: true },
        { name: "React.js", badge: "Advanced", highlight: false },
        { name: "TypeScript", badge: "Primary", highlight: true },
        { name: "Tailwind CSS", badge: "Advanced", highlight: false },
        { name: "Flutter", badge: "Cross-Platform", highlight: false, dim: true },
      ],
    },
    {
      title: "AI & Bot Scripting",
      icon: Cpu,
      color: "text-indigo-400",
      borderColor: "border-indigo-500/20 hover:border-indigo-500/40",
      items: [
        { name: "LLM APIs", badge: "Core", highlight: true },
        { name: "Python Scripting", badge: "Advanced", highlight: false },
        { name: "Node.js Bots", badge: "Automations", highlight: false },
        { name: "Prompt Engineering", badge: "Tuned", highlight: true },
        { name: "Webhook Handlers", badge: "Event-driven", highlight: false, dim: true },
      ],
    },
    {
      title: "UI/UX Design",
      icon: Palette,
      color: "text-pink-400",
      borderColor: "border-pink-500/20 hover:border-pink-500/40",
      items: [
        { name: "Figma", badge: "Expert", highlight: true },
        { name: "Design Systems", badge: "Tokens", highlight: false },
        { name: "Hi-Fi Prototyping", badge: "Interactive", highlight: false },
        { name: "User Journey Maps", badge: "UX Audit", highlight: false },
        { name: "BRD Documentation", badge: "Handoff", highlight: false, dim: true },
      ],
    },
    {
      title: "Backend & Cloud",
      icon: Database,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
      items: [
        { name: "NestJS", badge: "REST", highlight: true },
        { name: "Laravel", badge: "PHP", highlight: false },
        { name: "PostgreSQL / MySQL", badge: "Relational", highlight: false },
        { name: "Neon & Railway", badge: "Deployments", highlight: false },
        { name: "Git / GitHub", badge: "CI/CD", highlight: false, dim: true },
      ],
    },
  ];

  return (
    <section id="stack" className="relative mx-auto max-w-5xl px-6 py-20">
      <div className="mb-12 space-y-3 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          Technical Competencies
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Curated Tech Arsenal
        </h2>
        <p className="mx-auto max-w-lg text-sm text-slate-400">
          Every tool and language I use to ship production-ready interfaces and automation pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.title}
              className={`rounded-2xl border bg-[#0c101d]/80 p-5 shadow-xl backdrop-blur-xl transition-all duration-300 ${cat.borderColor}`}
            >
              <div
                className={`mb-4 flex items-center gap-2 font-mono text-xs font-bold uppercase ${cat.color}`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.title}</span>
              </div>
              <ul className="space-y-2 font-mono text-xs text-slate-300">
                {cat.items.map((item, idx) => (
                  <li
                    key={item.name}
                    className={`flex items-center justify-between pb-1 ${
                      idx !== cat.items.length - 1 ? "border-b border-white/5" : ""
                    }`}
                  >
                    <span>{item.name}</span>
                    <span
                      className={
                        item.highlight
                          ? `${cat.color} font-bold`
                          : item.dim
                          ? "text-slate-500"
                          : "text-slate-400"
                      }
                    >
                      {item.badge}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
