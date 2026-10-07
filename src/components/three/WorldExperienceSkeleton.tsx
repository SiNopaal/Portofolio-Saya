"use client";

export function WorldExperienceSkeleton() {
  return (
    <section className="relative h-svh min-h-[620px] w-full overflow-hidden bg-[#0b0e18] flex items-center justify-center">
      {/* Subtle Cyber Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Radial Center Glow */}
      <div className="absolute h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* Cyber Preloader Core HUD */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center">
        {/* Animated Gyroscopic Neon Rings */}
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 border-b-purple-400 animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.8)] animate-pulse" />
        </div>

        {/* Status Text */}
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] tracking-[0.45em] uppercase text-cyan-400">
            System Online &bull; V3.5 Core
          </p>
          <h2 className="text-sm md:text-base font-bold tracking-widest text-white uppercase">
            Memuat Arena 3D Metaverse...
          </h2>
          <p className="text-xs text-neutral-400 max-w-xs mx-auto">
            Menyiapkan shader &amp; lingkungan interaktif
          </p>
        </div>

        {/* Pulsing Progress Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3.5 py-1 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] text-neutral-300 tracking-wider">
            SYNCHRONIZING ASSETS
          </span>
        </div>
      </div>
    </section>
  );
}
