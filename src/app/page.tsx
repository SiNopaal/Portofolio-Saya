"use client";

import dynamic from "next/dynamic";
import { WorldExperienceSkeleton } from "@/components/three/WorldExperienceSkeleton";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Navbar } from "@/components/ui/Navbar";
import { About } from "@/components/sections/About";
import { BotTerminal } from "@/components/sections/BotTerminal";
import { Projects } from "@/components/sections/Projects";
import { TechStack } from "@/components/sections/TechStack";
import { Timeline } from "@/components/sections/Timeline";
import { Contact } from "@/components/sections/Contact";

const WorldExperience = dynamic(
  () => import("@/components/three/WorldExperience").then((mod) => mod.WorldExperience),
  {
    ssr: false,
    loading: () => <WorldExperienceSkeleton />,
  }
);

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Navbar />
      <main className="relative z-10">
        {/* Top 3D Metaverse Arena */}
        <WorldExperience />

        {/* Bio, Quick Stats, & 3D Kinetic Cyber Core */}
        <About />

        {/* Live Autonomous Bot Console */}
        <BotTerminal />

        {/* Featured Engineering & UI/UX Project Studio */}
        <Projects />

        {/* Curated Tech Arsenal Matrix */}
        <TechStack />

        {/* Engineering Trajectory Journey */}
        <Timeline />

        {/* Contact & Footer */}
        <Contact />
      </main>
    </SmoothScrollProvider>
  );
}
