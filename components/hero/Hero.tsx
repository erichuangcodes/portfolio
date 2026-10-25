"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors, easing, shadow } from "@/lib/tokens";
import { DEV_TUNING, shrinkScale, useTransitionValues } from "./scroll-controls";

// WebGL + physics + WASM: kept off the initial payload and out of SSR.
const HeroSpheres = dynamic(() => import("./HeroSpheres"), {
  ssr: false,
  loading: () => null,
});

// Dev-only Leva panel for the shrink timing. DEV_TUNING is statically false
// in production, so this import is dropped and Leva never ships.
const ScrollTuner = DEV_TUNING
  ? dynamic(() => import("./ScrollTuner"), { ssr: false, loading: () => null })
  : null;

// ─── constants ────────────────────────────────────────────────────────────────

const NAME = "Eric Huang";
const LETTERS = NAME.split("");
const LABELS = ["Engineer", "Designer", "Builder", "Filmmaker"] as const;
const LABEL_DWELL = 2400; // ms each label stays visible

const expoEase = [0.16, 1, 0.3, 1] as const;
const swiftEase = [0.65, 0, 0.35, 1] as const;

// Corner radius of the hero card in its own (unscaled) pixels. The card is
// shrunk with a transform, so the rounding scales down in proportion with it.
const HERO_RADIUS = "clamp(18px, 1.8vw, 26px)";

// ─── letter entrance ──────────────────────────────────────────────────────────

const nameContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,    // 40ms stagger
      delayChildren: 0.1,
    },
  },
};

const letterVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 0.8, ease: expoEase },
  },
};

// ─── cycling label variants ───────────────────────────────────────────────────

const labelEnter = {
  y: "100%",
  opacity: 0,
  filter: "blur(8px)",
};

const labelCenter = {
  y: "0%",
  opacity: 1,
  filter: "blur(0px)",
  transition: { duration: 0.5, ease: expoEase },
};

const labelExit = {
  y: "-100%",
  opacity: 0,
  filter: "blur(8px)",
  transition: { duration: 0.5, ease: expoEase },
};

// ─── component ────────────────────────────────────────────────────────────────

export default function Hero() {
  const reduced = useReducedMotion();
  const [labelIndex, setLabelIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── scroll-linked shrink ───────────────────────────────────────────────────
  // The wrapper is taller than the viewport (250svh, 180svh on phones); the
  // card is pinned inside it, so progress runs 0 → 1 over the pinned travel and
  // ends exactly as the pin releases and the next section starts to rise.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Timing comes from a tunable store (dev-only Leva panel) rather than
  // useTransform's keyframe/ease options, so a slider drag updates the card
  // immediately — useTransform only recomputes on the next scroll event. Kept
  // in a ref too: the scroll listener below subscribes once and must always
  // read the latest timing, not the values from the render that set it up.
  const timing = useTransitionValues();
  const timingRef = useRef(timing);
  useEffect(() => {
    timingRef.current = timing;
  }, [timing]);

  const cardScale = useMotionValue(shrinkScale(scrollYProgress.get(), timing));
  const [scenePaused, setScenePaused] = useState(false);

  const applyScale = useCallback(
    (progress: number) => {
      const v = timingRef.current;
      const scale = shrinkScale(progress, v);
      cardScale.set(scale);
      setScenePaused((paused) => {
        const shouldPause = scale < v.pauseBelowScale;
        return paused === shouldPause ? paused : shouldPause;
      });
    },
    [cardScale],
  );

  useEffect(() => {
    return scrollYProgress.on("change", applyScale);
  }, [scrollYProgress, applyScale]);

  // Re-apply immediately on a timing change, so dragging a slider updates the
  // card without needing to scroll first.
  useEffect(() => {
    applyScale(scrollYProgress.get());
  }, [timing, applyScale, scrollYProgress]);

  // Cycle labels every LABEL_DWELL ms, pause on hover
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setLabelIndex((i) => (i + 1) % LABELS.length);
    }, LABEL_DWELL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  return (
    // Tall wrapper = scroll travel for the shrink. Reduced motion collapses it
    // to the card's own height, so the hero is just a normal first screen.
    // White behind the card, matching the next section, so the speck sits on
    // the same surface the page continues on.
    <div
      ref={wrapperRef}
      className="relative h-[250svh] max-md:h-[180svh] motion-reduce:h-auto"
      style={{ background: colors.bg.primary }}
    >
      {ScrollTuner ? <ScrollTuner /> : null}
      <div className="sticky top-0 h-svh motion-reduce:relative">
        <motion.section
          id="home"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            background: colors.bg.primary,
            borderRadius: HERO_RADIUS,
            transformOrigin: "50% 50%",
            boxShadow: shadow.card,
            ...(reduced ? {} : { scale: cardScale }),
          }}
        >
          {/* Layer 0 — animated background */}
          <HeroSpheres paused={scenePaused} />

          {/* Layer 10 — hero content */}
          <div style={{ position: "relative", zIndex: 10, height: "100%" }}>

            {/* Top-left: signature — scrolls away with the hero, not fixed */}
            <div
              className="hero-signature"
              style={{ position: "absolute", top: "24px", left: "24px", opacity: 0.8, mixBlendMode: "multiply" }}
            >
              <Image
                src="/portfolioicon.png"
                alt="Eric Huang"
                width={100}
                height={100}
                style={{ width: "100px", height: "auto", display: "block" }}
                priority
              />
            </div>
            <style>{`
              @media (max-width: 767px) { .hero-signature { display: none; } }
            `}</style>

            {/* Top-right: portfolio datestamp — hidden on mobile, Header takes that space */}
            <div
              className="hero-datestamp"
              style={{ position: "absolute", top: "2rem", right: "2.5rem" }}
            >
              <span className="text-mono-label" style={{ color: colors.text.muted }}>
                Portfolio&nbsp;/&nbsp;2026
              </span>
            </div>
            <style>{`
              @media (max-width: 767px) { .hero-datestamp { display: none; } }
            `}</style>

            {/* Lower-left: name + cycling label */}
            <div
              style={{
                position: "absolute",
                bottom: "20%",
                left: "8%",
              }}
            >
              {/* Name — letter-by-letter entrance */}
              <div style={{ overflow: "visible" }}>
                <motion.h1
                  className="text-display-xl"
                  style={{
                    color: colors.text.primary,
                    lineHeight: 0.9,
                    display: "flex",
                    flexWrap: "wrap",
                    // Clip letters rising from below
                  }}
                  variants={reduced ? undefined : nameContainerVariants}
                  initial={reduced ? false : "hidden"}
                  animate="visible"
                  aria-label={NAME}
                >
                  {LETTERS.map((char, i) => (
                    <span
                      key={i}
                      style={{
                        display: "inline-block",
                        // Preserve space character width
                        whiteSpace: char === " " ? "pre" : undefined,
                      }}
                    >
                      {reduced ? (
                        char
                      ) : (
                        <motion.span
                          variants={letterVariants}
                          style={{ display: "inline-block" }}
                        >
                          {char}
                        </motion.span>
                      )}
                    </span>
                  ))}
                </motion.h1>
              </div>

              {/* Cycling label */}
              <div
                style={{
                  marginTop: "0.75rem",
                  // Fixed height = text-display-md at clamp(2rem,5vw,3.5rem) × line-height 1
                  // Use a generous px value so the clip never cuts the ascenders
                  height: "4rem",
                  overflow: "hidden",
                  position: "relative",
                }}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={LABELS[labelIndex]}
                    className="text-display-md"
                    style={{ color: colors.text.secondary, margin: 0 }}
                    initial={reduced ? false : labelEnter}
                    animate={labelCenter}
                    exit={reduced ? undefined : labelExit}
                  >
                    {LABELS[labelIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Bottom-center: scroll cue */}
            <ScrollCue />
              </div>
        </motion.section>
      </div>
    </div>
  );
}

// ─── scroll cue ───────────────────────────────────────────────────────────────

function ScrollCue() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      style={{
        position: "absolute",
        bottom: "2.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
      }}
      animate={reduced ? undefined : { y: [0, 4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    >
      {/* Vertical line */}
      <div
        style={{
          width: "1px",
          height: "40px",
          background: colors.accent.primary,
          opacity: 0.6,
        }}
      />
      <ChevronDown
        size={14}
        color={colors.accent.primary}
        strokeWidth={1.5}
        style={{ opacity: 0.6 }}
      />
    </motion.div>
  );
}
