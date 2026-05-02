"use client";

import {
  motion,
  useAnimate,
  useReducedMotion,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/tokens";
import { projects } from "@/lib/projects";

// ─── constants ────────────────────────────────────────────────────────────────

const N      = projects.length;
const CARD_W = 320;
const CARD_H = 420;

const expoEase  = [0.16, 1, 0.3, 1]  as const;
const swiftEase = [0.65, 0, 0.35, 1] as const;

// Spring used for card transitions and drag snap
const CARD_SPRING = { type: "spring", stiffness: 100, damping: 18, mass: 1.2 } as const;

// Drag: gesture fires navigation when offset exceeds this px threshold
const DRAG_THRESHOLD    = 60;
// or when flick velocity exceeds this px/s
const VELOCITY_THRESHOLD = 300;


// ─── 3D slot config ───────────────────────────────────────────────────────────

type SlotConfig = {
  x: number;
  rotateY: number;
  z: number;        // translateZ — Framer Motion "z" prop
  scale: number;
  opacity: number;
  zIndex: number;
};

function slotConfig(offset: number): SlotConfig {
  const sign = offset >= 0 ? 1 : -1;
  const abs  = Math.abs(offset);

  if (abs === 0) return { x: 0,          rotateY: 0,          z: 0,    scale: 1.00, opacity: 1.0, zIndex: 4 };
  if (abs === 1) return { x: sign * 295,  rotateY: -sign * 25, z: -200, scale: 0.70, opacity: 0.5, zIndex: 3 };
  if (abs === 2) return { x: sign * 510,  rotateY: -sign * 35, z: -400, scale: 0.40, opacity: 0.2, zIndex: 2 };
  // Beyond ±2 — parked offscreen so cards can slide in without popping
  return              { x: sign * 760,  rotateY: -sign * 40, z: -550, scale: 0.20, opacity: 0.0, zIndex: 1 };
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function getOffset(index: number, active: number): number {
  const raw = mod(index - active, N);
  return raw >= Math.ceil(N / 2) ? raw - N : raw;
}

// ─── card image ───────────────────────────────────────────────────────────────

function CardImage({ project }: { project: (typeof projects)[number] }) {
  return (
    <motion.div
      layoutId={`project-image-${project.slug}`}
      style={{ position: "absolute", inset: 0 }}
    >
      <div
        style={{
          position:   "absolute",
          inset:      0,
          background: project.gradient,
        }}
      />
      {project.heroImage && (
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          sizes={`${CARD_W}px`}
          style={{ objectFit: "cover" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
    </motion.div>
  );
}

// ─── project card ─────────────────────────────────────────────────────────────

function ProjectCard({ project, index }: { project: (typeof projects)[number]; index: number }) {
  return (
    <div
      style={{
        position:     "relative",
        width:        CARD_W,
        height:       CARD_H,
        borderRadius: "18px",
        overflow:     "hidden",
      }}
    >
      <CardImage project={project} />

      <div
        style={{
          position:      "absolute",
          inset:         0,
          background:    "linear-gradient(to top, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.15) 45%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position:       "absolute",
          bottom:         "1.25rem",
          left:           "1.25rem",
          right:          "1.25rem",
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          gap:            "0.5rem",
        }}
      >
        <p className="text-display-sm" style={{ color: colors.bg.primary, margin: 0, flex: 1 }}>
          {project.title}
        </p>
        <p className="text-mono-label" style={{ color: "rgba(255,255,255,0.55)", margin: 0, flexShrink: 0 }}>
          {project.year}
        </p>
      </div>
    </div>
  );
}

// ─── nav button ───────────────────────────────────────────────────────────────
// On click: button shell rotates ±360°, icon counter-rotates so it stays upright.
// Hover: scale 1.05, bg flips to text.primary, icon inherits white via CSS color.
// Rotation fires on click only — hover and rotation are independent.

function NavButton({
  direction,
  onClick,
  btnRef,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  btnRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const reduced = useReducedMotion();
  const Icon    = direction === "prev" ? ChevronLeft : ChevronRight;
  const sign    = direction === "prev" ? -1 : 1; // -1 = CCW, +1 = CW

  // useAnimate refs for shell rotation and icon counter-rotation
  const [shellScope, animateShell] = useAnimate();
  const [iconScope,  animateIcon ] = useAnimate();

  const handleClick = () => {
    onClick();
    if (reduced) return;
    // Shell rotates ±360; icon counter-rotates so it visually stays upright.
    // Keyframe [0, target] resets origin each click even if previous is mid-flight.
    animateShell(shellScope.current, { rotate: [0, sign * 360] }, { duration: 0.7, ease: expoEase });
    animateIcon (iconScope.current,  { rotate: [0, -sign * 360] }, { duration: 0.7, ease: expoEase });
  };

  return (
    <motion.button
      ref={btnRef as React.RefObject<HTMLButtonElement>}
      onClick={handleClick}
      aria-label={direction === "prev" ? "Previous project" : "Next project"}
      // Hover: scale + bg/icon-color flip. Fully independent of click rotation.
      whileHover={{
        scale: 1.05,
        backgroundColor: colors.text.primary,
        color: colors.bg.primary,  // CSS color inherited by Lucide via currentColor
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: swiftEase }}
      style={{
        width:          "56px",
        height:         "56px",
        borderRadius:   "50%",
        background:     colors.bg.primary,
        border:         `1px solid ${colors.border.subtle}`,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        cursor:         "pointer",
        flexShrink:     0,
        boxShadow:      "0 2px 8px rgba(10,10,10,0.06)",
        color:          colors.accent.primary, // default icon color via currentColor
        padding:        0,
      }}
    >
      {/* Shell — rotates on click */}
      <span
        ref={shellScope}
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        {/* Icon — counter-rotates to stay upright */}
        <span
          ref={iconScope}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          {/* No explicit color — inherits currentColor from motion.button animate */}
          <Icon size={20} strokeWidth={1.75} />
        </span>
      </span>
    </motion.button>
  );
}

// ─── carousel ─────────────────────────────────────────────────────────────────

export default function ProjectsCarousel() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const router  = useRouter();

  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);

  const prev = () => setActive((a) => mod(a - 1, N));
  const next = () => setActive((a) => mod(a + 1, N));

  // Keyboard navigation — fires the same .click() path as mouse so
  // the button rotation animation fires identically.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft")  prevBtnRef.current?.click();
      if (e.key === "ArrowRight") nextBtnRef.current?.click();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const counter = `${String(active + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3rem" }}>

      {/* ── 3D stage + drag capture ───────────────────────────────────────── */}
      {/*
        perspective: 1600px on the outer wrapper establishes the vanishing point.
        drag="x" is placed here — Framer Motion distinguishes click vs. drag
        internally, so side-card clicks still fire. dragElastic gives slight
        rubber-band resistance during the gesture; the cards themselves don't
        move — the drag just captures intent.
      */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const hardSwipe = Math.abs(info.offset.x)   > DRAG_THRESHOLD;
          const flick     = Math.abs(info.velocity.x) > VELOCITY_THRESHOLD;
          if (!hardSwipe && !flick) return;
          if (info.offset.x < 0 || info.velocity.x < 0) next();
          else                                            prev();
        }}
        style={{
          perspective:  "1600px",
          width:        "100%",
          height:       CARD_H,
          position:     "relative",
          touchAction:  "pan-y",   // allow vertical scroll on touch devices
          cursor:       "grab",
          userSelect:   "none",
        }}
        whileDrag={{ cursor: "grabbing" }}
      >
        {/* Inner stage — preserve-3d propagates perspective to motion.div cards */}
        <div
          style={{
            transformStyle: "preserve-3d",
            position:       "relative",
            width:          "100%",
            height:         "100%",
          }}
        >
          {projects.map((project, i) => {
            const offset = getOffset(i, active);
            const cfg    = slotConfig(offset);
            const abs    = Math.abs(offset);

            // Per-property transition:
            //   reduced-motion → position snaps instantly, only opacity fades
            //   normal         → spring on all, with 30ms stagger per offset level
            const staggerDelay = abs * 0.03;
            const posTransition = reduced
              ? { duration: 0 }
              : { ...CARD_SPRING, delay: staggerDelay };
            const opacityTransition = reduced
              ? { duration: 0.3, ease: "linear" as const }
              : { ...CARD_SPRING, delay: staggerDelay };

            return (
              <motion.div
                key={project.id}
                animate={{
                  x:       cfg.x,
                  rotateY: cfg.rotateY,
                  z:       cfg.z,
                  scale:   cfg.scale,
                  opacity: cfg.opacity,
                }}
                transition={{
                  x:       posTransition,
                  rotateY: posTransition,
                  z:       posTransition,
                  scale:   posTransition,
                  opacity: opacityTransition,
                }}
                style={{
                  position:      "absolute",
                  left:          "50%",
                  top:           0,
                  marginLeft:    -(CARD_W / 2),
                  zIndex:        cfg.zIndex,
                  pointerEvents: abs <= 2 ? "auto" : "none",
                  cursor:        abs <= 1 ? "pointer" : "default",
                  willChange:    "transform, opacity",
                }}
                onClick={() => {
                  if (offset ===  1) next();
                  if (offset === -1) prev();
                  if (offset ===  0) router.push(`/projects/${project.slug}`);
                }}
              >
                <ProjectCard project={project} index={i} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── controls ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <NavButton direction="prev" onClick={prev} btnRef={prevBtnRef} />

        <span
          className="text-mono-label"
          style={{ color: colors.text.muted, minWidth: "4rem", textAlign: "center" }}
        >
          {counter}
        </span>

        <NavButton direction="next" onClick={next} btnRef={nextBtnRef} />
      </div>
    </div>
  );
}
