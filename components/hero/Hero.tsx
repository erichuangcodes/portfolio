"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { colors, easing } from "@/lib/tokens";
import HeroBackground from "./HeroBackground";

// ─── constants ────────────────────────────────────────────────────────────────

const NAME = "Eric Huang";
const LETTERS = NAME.split("");
const LABELS = ["Engineer", "Designer", "Builder", "Filmmaker"] as const;
const LABEL_DWELL = 2400; // ms each label stays visible

const expoEase = [0.16, 1, 0.3, 1] as const;
const swiftEase = [0.65, 0, 0.35, 1] as const;

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
    <section
      id="home"
      style={{ position: "relative", height: "100svh", overflow: "hidden" }}
    >
      {/* Layer 0 — animated background */}
      <HeroBackground />

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
    </section>
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
