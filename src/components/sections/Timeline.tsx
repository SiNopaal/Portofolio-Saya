"use client";

export function Timeline() {
  const milestones = [
    {
      date: "Expected Jul 2026",
      title: "Bachelor of Software Engineering (S1 RPL)",
      institution: "Telkom University Purwokerto \u2022 Banyumas, Central Java",
      description:
        "Focused on web programming, human-computer interaction (HCI), artificial intelligence, and software testing.",
      color: "cyan",
      dotBg: "bg-cyan-400",
      textDate: "text-cyan-400",
    },
    {
      date: "Jun 2025 \u2013 Aug 2025",
      title: "UI/UX Designer Intern \u2022 PT Seven Inc",
      institution: "Yogyakarta, Indonesia",
      description:
        "Designed the 13+ page Titik Visual platform and the Nebeng ride-sharing multi-role product flows in Figma.",
      color: "pink",
      dotBg: "bg-pink-400",
      textDate: "text-pink-400",
    },
    {
      date: "2026",
      title: "Project Lead & Frontend \u2022 Commercial Laundry Suite",
      institution: "Client Delivery",
      description:
        "Led a development squad delivering Londri-Admin and Central Laundry commercial web systems with Next.js/React.",
      color: "indigo",
      dotBg: "bg-indigo-400",
      textDate: "text-indigo-400",
    },
    {
      date: "2024 \u2013 2026",
      title: "AI Bot Scripting & Workflow Automation Labs",
      institution: "Independent Exploration",
      description:
        "Engineered automated Python/Node.js bots utilizing LLM APIs for autonomous data extraction and dynamic tasks.",
      color: "emerald",
      dotBg: "bg-emerald-400",
      textDate: "text-emerald-400",
    },
  ];

  return (
    <section id="journey" className="relative mx-auto max-w-4xl px-6 py-20">
      <div className="mb-12 space-y-3 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          Trajectory
        </div>
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Engineering Journey
        </h2>
      </div>

      <div className="relative ml-4 space-y-10 border-l-2 border-white/10 pl-6 sm:ml-8 sm:pl-8">
        {milestones.map((m, idx) => (
          <div key={idx} className="group relative">
            {/* Glowing Node Dot */}
            <div
              className={`absolute -left-[31px] top-1 h-4 w-4 rounded-full ${m.dotBg} ring-4 ring-[#07090e] transition-transform duration-300 group-hover:scale-125 sm:-left-[39px]`}
            />

            <div className={`font-mono text-xs font-semibold ${m.textDate}`}>
              {m.date}
            </div>
            <h3 className="mt-1 text-lg font-bold text-white">
              {m.title}
            </h3>
            <p className="font-mono text-xs text-slate-400">
              {m.institution}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {m.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
