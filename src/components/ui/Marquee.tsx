"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useVelocity,
  useTransform,
  useSpring,
  useAnimationFrame,
  useMotionValue,
  wrap,
} from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Velocity-reactive marquee — scroll faster and the strip
 * accelerates & tilts. Feels physical, not decorative.
 */
export function Marquee({
  items,
  baseVelocity = 2.5,
  className = "",
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], {
    clamp: false,
  });
  const skew = useTransform(smoothVelocity, [-1000, 1000], [-3, 3]);
  const skewSpring = useSpring(skew, { damping: 40, stiffness: 300 });

  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`);
  const direction = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const vf = velocityFactor.get();
    if (vf < 0) direction.current = -1;
    else if (vf > 0) direction.current = 1;
    moveBy += direction.current * moveBy * Math.abs(vf);
    baseX.set(baseX.get() + moveBy);
  });

  const row = (key: number) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="mx-6 whitespace-nowrap text-4xl font-black uppercase tracking-tight text-transparent md:mx-10 md:text-6xl [-webkit-text-stroke:1px_rgba(255,255,255,0.22)]">
            {item}
          </span>
          <Sparkles className="h-5 w-5 shrink-0 text-violet-500/60 md:h-7 md:w-7" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none relative select-none overflow-hidden py-10 ${className}`}
    >
      <motion.div
        className="flex w-max"
        style={{ x, skewX: skewSpring, willChange: "transform" }}
      >
        {[0, 1, 2, 3].map(row)}
      </motion.div>
    </div>
  );
}
