"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";

/**
 * Linear-style spotlight card: a radial glow follows the cursor
 * inside the card and along its border. Instant premium feel.
 */
export function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(139, 92, 246, 0.15)",
}: {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group/spot relative overflow-hidden ${className}`}
      style={{ ["--spot-x" as string]: "50%", ["--spot-y" as string]: "50%" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: `radial-gradient(420px circle at var(--spot-x) var(--spot-y), ${glowColor}, transparent 65%)`,
        }}
      />
      {children}
    </div>
  );
}
