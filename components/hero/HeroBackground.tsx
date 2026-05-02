"use client";

import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { colors } from "@/lib/tokens";

// ─── constants ────────────────────────────────────────────────────────────────

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

const SPRING = { stiffness: 120, damping: 22, restDelta: 0.001 };

const REPEL_RADIUS = 160;
const MAX_REPEL    =  55;

// 12 blobs — cx/cy as fraction of container, size in vmin
const BLOBS = [
  { cx: 0.12, cy: 0.20, size: 72 },
  { cx: 0.82, cy: 0.15, size: 80 },
  { cx: 0.50, cy: 0.55, size: 68 },
  { cx: 0.25, cy: 0.80, size: 62 },
  { cx: 0.78, cy: 0.72, size: 74 },
  { cx: 0.60, cy: 0.30, size: 48 },
  { cx: 0.35, cy: 0.50, size: 44 },
  { cx: 0.88, cy: 0.50, size: 42 },
  { cx: 0.15, cy: 0.60, size: 46 },
  { cx: 0.45, cy: 0.12, size: 24 },
  { cx: 0.70, cy: 0.88, size: 28 },
  { cx: 0.05, cy: 0.40, size: 22 },
] as const;

// Iridescent conic-gradient palettes — unique per blob.
// Colors chosen to look like oil-on-water through mix-blend-mode: multiply on white.
// Each array is [c0, c1, c2, c3] — conic-gradient cycles through them.
const BLOB_PALETTES = [
  ["#f472b6", "#c084fc", "#67e8f9", "#f472b6"],   // pink → purple → cyan
  ["#4ade80", "#2dd4bf", "#818cf8", "#4ade80"],   // green → teal → indigo
  ["#fb923c", "#f472b6", "#a78bfa", "#fb923c"],   // orange → pink → violet
  ["#67e8f9", "#86efac", "#fde047", "#67e8f9"],   // cyan → green → yellow
  ["#d946ef", "#f43f5e", "#fb923c", "#d946ef"],   // magenta → red → orange
  ["#3b82f6", "#06b6d4", "#34d399", "#3b82f6"],   // blue → cyan → emerald
  ["#f9a8d4", "#fda4af", "#fbbf24", "#f9a8d4"],   // blush → rose → amber
  ["#8b5cf6", "#6366f1", "#38bdf8", "#8b5cf6"],   // violet → indigo → sky
  ["#22c55e", "#84cc16", "#facc15", "#22c55e"],   // green → lime → yellow
  ["#e879f9", "#a78bfa", "#60a5fa", "#e879f9"],   // fuchsia → purple → blue
  ["#14b8a6", "#22d3ee", "#818cf8", "#14b8a6"],   // teal → cyan → indigo
  ["#f43f5e", "#ec4899", "#c084fc", "#f43f5e"],   // rose → pink → purple
] as const;

// Organic morph targets — each blob oscillates from 50% (circle) to its target
const MORPH_TARGETS = [
  "42% 58% 52% 48% / 46% 54% 48% 52%",
  "58% 42% 48% 52% / 52% 48% 56% 44%",
  "50% 50% 62% 38% / 42% 58% 44% 56%",
  "38% 62% 50% 50% / 54% 46% 58% 42%",
  "46% 54% 42% 58% / 60% 40% 48% 52%",
  "62% 38% 56% 44% / 44% 56% 42% 58%",
  "44% 56% 60% 40% / 48% 52% 40% 60%",
  "56% 44% 40% 60% / 56% 44% 62% 38%",
  "50% 50% 44% 56% / 38% 62% 52% 48%",
  "40% 60% 56% 44% / 52% 48% 44% 56%",
  "60% 40% 42% 58% / 46% 54% 58% 42%",
  "48% 52% 58% 42% / 60% 40% 46% 54%",
] as const;

// Gradient rotation speeds (seconds per 360°) — varies per blob for async feel
const ROTATE_DURATIONS = [12, 9, 15, 8, 11, 14, 7, 13, 10, 6, 16, 9] as const;

// Morph durations (seconds) — odd values so blobs never sync
const MORPH_DURATIONS = [5, 7, 4, 6, 8, 5, 7, 4, 6, 3, 5, 4] as const;

// Drift amplitude/period — scales with blob size (smaller = faster)
function makeDrift(size: number, phaseX: number, phaseY: number) {
  const s = size / 70;
  return { ax: 40 + 35 * s, ay: 45 + 40 * s, tx: 45 + 50 * s, ty: 35 + 45 * s, px: phaseX, py: phaseY };
}
const DRIFT = BLOBS.map((b, i) => makeDrift(b.size, i * 0.9, i * 0.7 + 0.4));
const TWO_PI = Math.PI * 2;

// ─── component ────────────────────────────────────────────────────────────────

export default function HeroBackground() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const blobRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const gradientRefs  = useRef<(HTMLDivElement | null)[]>([]);

  // ── Drift MotionValues — one pair per blob (hooks cannot be in loops) ─────
  const d0x  = useMotionValue(0); const d0y  = useMotionValue(0);
  const d1x  = useMotionValue(0); const d1y  = useMotionValue(0);
  const d2x  = useMotionValue(0); const d2y  = useMotionValue(0);
  const d3x  = useMotionValue(0); const d3y  = useMotionValue(0);
  const d4x  = useMotionValue(0); const d4y  = useMotionValue(0);
  const d5x  = useMotionValue(0); const d5y  = useMotionValue(0);
  const d6x  = useMotionValue(0); const d6y  = useMotionValue(0);
  const d7x  = useMotionValue(0); const d7y  = useMotionValue(0);
  const d8x  = useMotionValue(0); const d8y  = useMotionValue(0);
  const d9x  = useMotionValue(0); const d9y  = useMotionValue(0);
  const d10x = useMotionValue(0); const d10y = useMotionValue(0);
  const d11x = useMotionValue(0); const d11y = useMotionValue(0);

  const driftMVs = [
    { x: d0x, y: d0y }, { x: d1x, y: d1y }, { x: d2x, y: d2y },
    { x: d3x, y: d3y }, { x: d4x, y: d4y }, { x: d5x, y: d5y },
    { x: d6x, y: d6y }, { x: d7x, y: d7y }, { x: d8x, y: d8y },
    { x: d9x, y: d9y }, { x: d10x, y: d10y }, { x: d11x, y: d11y },
  ];

  // ── Repel inputs ─────────────────────────────────────────────────────────
  const r0xi  = useMotionValue(0); const r0yi  = useMotionValue(0);
  const r1xi  = useMotionValue(0); const r1yi  = useMotionValue(0);
  const r2xi  = useMotionValue(0); const r2yi  = useMotionValue(0);
  const r3xi  = useMotionValue(0); const r3yi  = useMotionValue(0);
  const r4xi  = useMotionValue(0); const r4yi  = useMotionValue(0);
  const r5xi  = useMotionValue(0); const r5yi  = useMotionValue(0);
  const r6xi  = useMotionValue(0); const r6yi  = useMotionValue(0);
  const r7xi  = useMotionValue(0); const r7yi  = useMotionValue(0);
  const r8xi  = useMotionValue(0); const r8yi  = useMotionValue(0);
  const r9xi  = useMotionValue(0); const r9yi  = useMotionValue(0);
  const r10xi = useMotionValue(0); const r10yi = useMotionValue(0);
  const r11xi = useMotionValue(0); const r11yi = useMotionValue(0);

  // ── Repel springs ─────────────────────────────────────────────────────────
  const r0x  = useSpring(r0xi,  SPRING); const r0y  = useSpring(r0yi,  SPRING);
  const r1x  = useSpring(r1xi,  SPRING); const r1y  = useSpring(r1yi,  SPRING);
  const r2x  = useSpring(r2xi,  SPRING); const r2y  = useSpring(r2yi,  SPRING);
  const r3x  = useSpring(r3xi,  SPRING); const r3y  = useSpring(r3yi,  SPRING);
  const r4x  = useSpring(r4xi,  SPRING); const r4y  = useSpring(r4yi,  SPRING);
  const r5x  = useSpring(r5xi,  SPRING); const r5y  = useSpring(r5yi,  SPRING);
  const r6x  = useSpring(r6xi,  SPRING); const r6y  = useSpring(r6yi,  SPRING);
  const r7x  = useSpring(r7xi,  SPRING); const r7y  = useSpring(r7yi,  SPRING);
  const r8x  = useSpring(r8xi,  SPRING); const r8y  = useSpring(r8yi,  SPRING);
  const r9x  = useSpring(r9xi,  SPRING); const r9y  = useSpring(r9yi,  SPRING);
  const r10x = useSpring(r10xi, SPRING); const r10y = useSpring(r10yi, SPRING);
  const r11x = useSpring(r11xi, SPRING); const r11y = useSpring(r11yi, SPRING);

  const repelTargets = [
    { xi: r0xi,  yi: r0yi  }, { xi: r1xi,  yi: r1yi  }, { xi: r2xi,  yi: r2yi  },
    { xi: r3xi,  yi: r3yi  }, { xi: r4xi,  yi: r4yi  }, { xi: r5xi,  yi: r5yi  },
    { xi: r6xi,  yi: r6yi  }, { xi: r7xi,  yi: r7yi  }, { xi: r8xi,  yi: r8yi  },
    { xi: r9xi,  yi: r9yi  }, { xi: r10xi, yi: r10yi }, { xi: r11xi, yi: r11yi },
  ];

  // ── Combined drift + repel ────────────────────────────────────────────────
  type MV = MotionValue<number>;
  const add = (d: MV, r: MV) => useTransform([d, r] as MV[], ([dv, rv]: number[]) => dv + rv);

  const x0  = add(d0x,  r0x  as MV); const y0  = add(d0y,  r0y  as MV);
  const x1  = add(d1x,  r1x  as MV); const y1  = add(d1y,  r1y  as MV);
  const x2  = add(d2x,  r2x  as MV); const y2  = add(d2y,  r2y  as MV);
  const x3  = add(d3x,  r3x  as MV); const y3  = add(d3y,  r3y  as MV);
  const x4  = add(d4x,  r4x  as MV); const y4  = add(d4y,  r4y  as MV);
  const x5  = add(d5x,  r5x  as MV); const y5  = add(d5y,  r5y  as MV);
  const x6  = add(d6x,  r6x  as MV); const y6  = add(d6y,  r6y  as MV);
  const x7  = add(d7x,  r7x  as MV); const y7  = add(d7y,  r7y  as MV);
  const x8  = add(d8x,  r8x  as MV); const y8  = add(d8y,  r8y  as MV);
  const x9  = add(d9x,  r9x  as MV); const y9  = add(d9y,  r9y  as MV);
  const x10 = add(d10x, r10x as MV); const y10 = add(d10y, r10y as MV);
  const x11 = add(d11x, r11x as MV); const y11 = add(d11y, r11y as MV);

  const orbTransforms = [
    { x: x0, y: y0 }, { x: x1, y: y1 }, { x: x2, y: y2 },
    { x: x3, y: y3 }, { x: x4, y: y4 }, { x: x5, y: y5 },
    { x: x6, y: y6 }, { x: x7, y: y7 }, { x: x8, y: y8 },
    { x: x9, y: y9 }, { x: x10, y: y10 }, { x: x11, y: y11 },
  ];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Reduced-motion: skip all animation, blobs remain static ──────────────
    if (reduced) {
      // Still position gradient divs so blobs look reasonable at rest
      gradientRefs.current.forEach((el) => {
        if (!el) return;
        gsap.set(el, { xPercent: -50, yPercent: -50 });
      });
      return;
    }

    // ── Drift ticker ─────────────────────────────────────────────────────────
    function tick() {
      const t = gsap.ticker.time;
      DRIFT.forEach((d, i) => {
        driftMVs[i].x.set(d.ax * Math.sin(TWO_PI * (t / d.tx) + d.px));
        driftMVs[i].y.set(d.ay * Math.sin(TWO_PI * (t / d.ty) + d.py));
      });
    }
    gsap.ticker.add(tick);

    // ── Gradient rotation — inner div spins independently of Framer position ─
    // GSAP owns xPercent/yPercent/rotation on the inner div; Framer owns x/y on outer.
    gradientRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { xPercent: -50, yPercent: -50 });
      gsap.to(el, {
        rotation: 360,
        duration: ROTATE_DURATIONS[i],
        ease: "none",
        repeat: -1,
      });
    });

    // ── Border-radius morph — organic blob shape oscillation ─────────────────
    blobRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        borderRadius: MORPH_TARGETS[i],
        duration: MORPH_DURATIONS[i],
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.25,
      });
    });

    // ── Cursor repel ─────────────────────────────────────────────────────────
    let rafPending = false;
    let mouseX = -9999;
    let mouseY = -9999;

    function processRepel() {
      rafPending = false;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cursorX = mouseX - rect.left;
      const cursorY = mouseY - rect.top;

      BLOBS.forEach((_, i) => {
        const orbX = BLOBS[i].cx * rect.width  + driftMVs[i].x.get();
        const orbY = BLOBS[i].cy * rect.height + driftMVs[i].y.get();
        const dx   = orbX - cursorX;
        const dy   = orbY - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0.1) {
          const t     = 1 - dist / REPEL_RADIUS;
          const force = t * t * MAX_REPEL;
          repelTargets[i].xi.set((dx / dist) * force);
          repelTargets[i].yi.set((dy / dist) * force);
        } else {
          repelTargets[i].xi.set(0);
          repelTargets[i].yi.set(0);
        }
      });
    }

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafPending) { rafPending = true; requestAnimationFrame(processRepel); }
    }
    function onMouseLeave() {
      repelTargets.forEach(({ xi, yi }) => { xi.set(0); yi.set(0); });
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      gsap.ticker.remove(tick);
      blobRefs.current.forEach(el => el && gsap.killTweensOf(el));
      gradientRefs.current.forEach(el => el && gsap.killTweensOf(el));
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: colors.bg.primary,
      }}
    >
      {/* Blob layer — blur wrapper softens hard gradient edges */}
      <div style={{ position: "absolute", inset: 0, filter: "blur(22px)" }}>
        {BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            ref={(el) => { blobRefs.current[i] = el; }}
            style={{
              position:    "absolute",
              top:         `${blob.cy * 100}%`,
              left:        `${blob.cx * 100}%`,
              width:       `${blob.size}vmin`,
              height:      `${blob.size}vmin`,
              marginTop:   `${-blob.size / 2}vmin`,
              marginLeft:  `${-blob.size / 2}vmin`,
              borderRadius: "50%",
              overflow:    "hidden",   // clips rotating inner gradient to blob shape
              mixBlendMode: "multiply",
              opacity:     0.55,
              willChange:  "transform",
              x: orbTransforms[i].x,
              y: orbTransforms[i].y,
            }}
          >
            {/*
              Inner gradient div — 160% so corners stay hidden during rotation.
              GSAP sets xPercent/yPercent to center it, then rotates continuously.
              Framer never touches this element's transform.
            */}
            <div
              ref={(el) => { gradientRefs.current[i] = el; }}
              style={{
                position: "absolute",
                top:      "50%",
                left:     "50%",
                width:    "160%",
                height:   "160%",
                background: `conic-gradient(from 0deg, ${BLOB_PALETTES[i].join(", ")})`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Noise overlay */}
      <div
        style={{
          position:        "absolute",
          inset:           0,
          backgroundImage: NOISE_SVG,
          backgroundRepeat: "repeat",
          backgroundSize:  "200px 200px",
          opacity:         0.08,
          pointerEvents:   "none",
          mixBlendMode:    "overlay",
        }}
      />
    </div>
  );
}
