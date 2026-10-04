"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CursorFollower() {
  const [isPointer, setIsPointer] = useState(false);
  const [visible, setVisible] = useState(false);
  const raw = useRef({ x: -100, y: -100 });

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 500, damping: 40, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 500, damping: 40, mass: 0.6 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      raw.current = { x: e.clientX, y: e.clientY };
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const target = e.target as HTMLElement;
      setIsPointer(
        !!target.closest("a, button, [data-magnetic], [role='button']")
      );
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [x, y]);

  return (
    <>
      {/* Glow trail */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl md:block"
        style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
      />
      {/* Core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] hidden md:block"
        style={{ x, y, translateX: "-50%", translateY: "-50%" }}
        animate={{
          scale: isPointer ? 2.6 : 1,
          opacity: visible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div
          className={`h-3 w-3 rounded-full border transition-colors duration-200 ${
            isPointer
              ? "border-violet-400 bg-violet-400/20"
              : "border-white/70 bg-white/10"
          }`}
        />
      </motion.div>
    </>
  );
}
