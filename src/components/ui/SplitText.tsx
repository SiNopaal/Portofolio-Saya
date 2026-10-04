"use client";

import { motion, type Variants } from "framer-motion";

const MotionSpan = motion.create("span");
const MotionH1 = motion.create("h1");
const MotionH2 = motion.create("h2");
const MotionH3 = motion.create("h3");
const MotionP = motion.create("p");

const TAG_MAP = {
  span: MotionSpan,
  h1: MotionH1,
  h2: MotionH2,
  h3: MotionH3,
  p: MotionP,
} as const;

/**
 * Splits text into words and reveals them with a staggered
 * mask-slide animation when scrolled into view.
 * Supports multiline via " | " delimiter.
 */
export function SplitText({
  text,
  className = "",
  delay = 0,
  stagger = 0.045,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}) {
  const lines = text.split(" | ");
  const MotionTag = TAG_MAP[Tag];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      aria-label={text}
    >
      {lines.map((line, lineIdx) => {
        const words = line.split(" ");
        const lineDelay = delay + lineIdx * 0.18;

        const container: Variants = {
          hidden: {},
          visible: {
            transition: {
              staggerChildren: stagger,
              delayChildren: lineDelay,
            },
          },
        };

        const word: Variants = {
          hidden: { y: "115%", rotate: 3 },
          visible: {
            y: 0,
            rotate: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          },
        };

        return (
          <motion.span
            key={lineIdx}
            variants={container}
            className="block overflow-hidden pb-[0.08em] align-bottom last:pb-0"
          >
            {words.map((w, i) => (
              <span
                key={i}
                aria-hidden
                className="inline-block overflow-hidden pb-[0.08em] align-bottom"
              >
                <motion.span
                  variants={word}
                  className="inline-block will-change-transform"
                >
                  {w}
                  {i < words.length - 1 ? "\u00A0" : ""}
                </motion.span>
              </span>
            ))}
          </motion.span>
        );
      })}
    </MotionTag>
  );
}
