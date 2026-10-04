"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    const duration = 1600;
    let raf: number;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // ease-out for satisfying deceleration
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setDone(true), 250);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    document.body.style.overflow = done ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#090909]"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="relative flex flex-col items-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs font-medium uppercase tracking-[0.5em] text-neutral-500"
            >
              Naufal Ananta
            </motion.span>
            <span className="text-gradient-static mt-2 text-7xl font-black tabular-nums tracking-tighter md:text-8xl">
              {count}
              <span className="text-3xl md:text-4xl">%</span>
            </span>
          </div>

          {/* progress line */}
          <div className="absolute bottom-0 left-0 h-px w-full bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-orange-400"
              style={{ width: `${count}%` }}
            />
          </div>

          {/* corner marks */}
          <span className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.4em] text-neutral-700">
            Portfolio © 2025
          </span>
          <span className="absolute bottom-6 right-6 text-[10px] uppercase tracking-[0.4em] text-neutral-700">
            Backend · AI · Cloud
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
