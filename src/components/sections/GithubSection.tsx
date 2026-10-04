"use client";

import { GitFork, Star, Users, BookOpen } from "lucide-react";
import { Github } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { Magnetic } from "@/components/ui/Magnetic";
import { socials, projects } from "@/lib/data";
import githubData from "@/lib/github-contributions.json";

const stats = [
  { icon: BookOpen, label: "Public Repositories", value: "64" },
  { icon: Star, label: "Stars Earned", value: "62" },
  { icon: GitFork, label: "Total Forks", value: "1" },
  { icon: Users, label: "Followers", value: "31" },
];

function ContributionGraph() {
  const days = 7;
  const contributions = (githubData?.contributions || []) as {
    date: string;
    count: number;
    level: number;
  }[];

  const colors = [
    "bg-white/5",
    "bg-violet-900",
    "bg-violet-600",
    "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]",
    "bg-violet-300 shadow-[0_0_8px_rgba(196,181,253,0.8)]",
  ];

  return (
    <div className="overflow-x-auto pb-2">
      <div
        className="grid grid-flow-col gap-[3px]"
        style={{ gridTemplateRows: `repeat(${days}, 1fr)` }}
      >
        {contributions.map((c, i) => (
          <div
            key={i}
            className={`h-[10px] w-[10px] rounded-[2px] ${colors[Math.min(c.level, colors.length - 1)]} transition-transform hover:scale-125`}
            title={`${c.count} contributions on ${c.date}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-neutral-500">
        Less
        {colors.map((c, i) => (
          <span key={i} className={`h-[10px] w-[10px] rounded-[2px] ${c}`} />
        ))}
        More
      </div>
    </div>
  );
}

export function GithubSection() {
  return (
    <section className="section-rule relative mx-auto max-w-7xl px-6 py-32 md:px-16">
      <Reveal className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.4em] text-violet-400">
            Open Source
          </span>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-tight md:text-6xl">
            Built in <span className="text-gradient">Public</span>
          </h2>
        </div>
        <Magnetic strength={0.25}>
          <a
            href={socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="glass flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-violet-500/50"
          >
            <Github className="h-4 w-4" /> @NaufalAnantaSE
          </a>
        </Magnetic>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40"
            >
              <s.icon className="h-5 w-5 text-violet-400 transition-transform group-hover:scale-110" />
              <div className="mt-4 text-3xl font-black text-white">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-neutral-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="glass mt-6 rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
              Contribution Activity
            </h3>
            <span className="text-xs text-neutral-400">
              <strong className="text-white">{githubData?.total?.lastYear ?? 278}</strong> contributions in the last year
            </span>
          </div>
          <ContributionGraph />
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {projects.slice(0, 3).map((p) => (
            <a
              key={p.id}
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40"
            >
              <div className="flex items-center justify-between">
                <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${p.accent}`} />
                <Github className="h-4 w-4 text-neutral-600 transition-colors group-hover:text-white" />
              </div>
              <h4 className="mt-4 font-bold text-white">{p.title}</h4>
              <p className="mt-1 line-clamp-2 text-sm font-light text-neutral-400">
                {p.subtitle}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tech.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-neutral-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
