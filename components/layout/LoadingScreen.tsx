"use client";

// Full-screen loader for the home page: a spinning two-tone yin-yang mark
// (no dots) that fades out once the hero sphere scene has drawn its first
// frame. Server-rendered, so it covers the page from the very first paint.

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onHeroReady } from "@/lib/hero-ready";
import { bezier, colors, duration, durationMs } from "@/lib/tokens";

/** Keeps the mark up long enough to read as intentional, not a flash. */
const MIN_VISIBLE_MS = 700;
/** Never hold the page hostage if WebGL or the physics WASM fails to load. */
const MAX_VISIBLE_MS = 8000;

export default function LoadingScreen() {
  // Only the home page has the hero scene to wait for. Lives in the root
  // layout, so it persists across client navigation and never re-shows.
  const isHome = usePathname() === "/";
  const [visible, setVisible] = useState(isHome);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!isHome) return;
    const start = performance.now();
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      hideTimer = setTimeout(() => setVisible(false), wait);
    };
    const unsubscribe = onHeroReady(hide);
    const fallback = setTimeout(() => setVisible(false), MAX_VISIBLE_MS);
    return () => {
      unsubscribe();
      clearTimeout(fallback);
      if (hideTimer) clearTimeout(hideTimer);
    };
    // Mount-only: a later route change must not bring the loader back.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          role="status"
          aria-label="Loading"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: (reduced ? duration.fast : duration.slow) / 1000, ease: bezier.expo }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            background: colors.bg.primary,
          }}
        >
          <svg
            className="loader-mark"
            viewBox="0 0 100 100"
            width="56"
            height="56"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="50" fill={colors.text.primary} />
            {/* The S-curve half: outer arc down the right, then two half-size
                arcs back up through the centre. */}
            <path
              d="M50 0 A50 50 0 0 1 50 100 A25 25 0 0 1 50 50 A25 25 0 0 0 50 0 Z"
              fill={colors.accent.primary}
            />
          </svg>
          <style>{`
            .loader-mark { animation: loader-spin ${durationMs.deliberate} linear infinite; }
            @keyframes loader-spin { to { transform: rotate(360deg); } }
            @media (prefers-reduced-motion: reduce) { .loader-mark { animation: none; } }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
