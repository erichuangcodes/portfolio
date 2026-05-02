"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { colors } from "@/lib/tokens";

// Register ScrollTrigger once, safely — same pattern as motion-footer.tsx
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── SectionBridge ────────────────────────────────────────────────────────────
// Cinematic interstitial between two major sections, adapted from the
// CinematicFooter's ScrollTrigger scrub technique:
//
//   Layer 0 — .bridge-bg-grid: parallaxes upward at ~0.5× scroll speed
//   Layer 1 — .bridge-aurora: scales 0.8 → 1.2 as bridge transits viewport
//   Layer 2 — bridge content: fades in + rises on enter, fades out + rises on exit
//
// All animations use scrub:true so they're frame-locked to scroll velocity.
// Reduced-motion: skips the GSAP setup entirely (content visible at full opacity).

type Props = {
  previousLabel: string;
  nextLabel: string;
  children: React.ReactNode;
  background?: string;
};

export default function SectionBridge({
  previousLabel,
  nextLabel,
  children,
  background,
}: Props) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const auroraRef   = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Scoped GSAP context — cleans up on unmount (React Strict Mode safe)
    const ctx = gsap.context(() => {

      // ── Background grid: moves upward at 0.5× scroll speed ───────────────
      // Same technique as CinematicFooter's giantTextRef parallax.
      // The grid starts 20% taller than the container (inset: "-20% 0") so
      // the "-20%" upward shift never exposes a gap at the bottom.
      gsap.fromTo(bgRef.current,
        { y: "0%" },
        {
          y: "-20%",
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end:   "bottom top",
            scrub: true,
          },
        },
      );

      // ── Aurora glow: breathes in as bridge enters, out as it exits ────────
      gsap.fromTo(auroraRef.current,
        { scale: 0.7, opacity: 0 },
        {
          scale: 1.3, opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 80%",
            end:   "bottom 20%",
            scrub: 1,
          },
        },
      );

      // ── Content: single timeline maps full bridge transit to fade+slide ───
      // Same staggered content reveal approach as CinematicFooter's
      // headingRef/linksRef animation — one timeline, one ScrollTrigger.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top 85%",
          end:   "bottom 15%",
          scrub: 1,
        },
      });

      tl.fromTo(contentRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, ease: "power2.out", duration: 0.35 },
      )
      .to(contentRef.current,
        // Dwell: content held at natural position while bridge is centered
        { y: 0, opacity: 1, duration: 0.3 },
      )
      .to(contentRef.current,
        { y: -60, opacity: 0, ease: "power2.in", duration: 0.35 },
      );

    }, wrapper);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position:       "relative",
        minHeight:      "80vh",
        background:     background ?? colors.bg.secondary,
        display:        "flex",
        flexDirection:  "column",
        justifyContent: "space-between",
        padding:        "3rem 0",
        overflow:       "hidden",
      }}
    >
      {/* Grid parallax layer — extends beyond container so shift never gaps */}
      <div
        ref={bgRef}
        className="bridge-bg-grid"
        style={{ position: "absolute", inset: "-20% 0 0", zIndex: 0 }}
      />

      {/* Aurora accent glow */}
      <div
        ref={auroraRef}
        className="bridge-aurora"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
      />

      {/* Previous section label */}
      <p
        className="text-mono-label"
        style={{
          position:     "relative",
          zIndex:       1,
          color:        colors.text.muted,
          paddingLeft:  "8%",
          paddingRight: "8%",
        }}
      >
        ← {previousLabel}
      </p>

      {/* Bridge content — GSAP-animated (fade + parallax) */}
      <div ref={contentRef} style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>

      {/* Next section label */}
      <p
        className="text-mono-label"
        style={{
          position:     "relative",
          zIndex:       1,
          color:        colors.text.muted,
          textAlign:    "right",
          paddingLeft:  "8%",
          paddingRight: "8%",
        }}
      >
        {nextLabel} →
      </p>
    </div>
  );
}
