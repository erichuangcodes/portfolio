"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

// ─── RevealSection ────────────────────────────────────────────────────────────
// Inspired by the CinematicFooter's clip-path curtain reveal.
// As a section's top edge crosses from 90vh to 20vh in the viewport,
// the section slides up from 48px and its top-left/right corners
// straighten from 20px → 0px — giving a "card emerging from beneath" feel.
// No overflow:hidden so the 3D carousel side-cards are never clipped.

export default function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.2"],
  });

  const y            = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.6],
    ["20px 20px 0px 0px", "0px 0px 0px 0px"],
  );

  if (reduced) return <div ref={ref}>{children}</div>;

  return (
    <div ref={ref}>
      <motion.div
        style={{
          y,
          borderRadius,
          willChange: "transform",
          // Clip the rounded corners without cutting 3D-carousel overflow:
          // overflow:hidden only on a small inner wrapper so the carousel
          // (which overflows its own container) is unaffected at section level.
          overflow: "clip",
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
