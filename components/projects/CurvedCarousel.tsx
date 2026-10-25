"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type PanInfo,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { useHorizontalWheel } from "@/hooks/useHorizontalWheel";
import { projects } from "@/lib/projects";
import { bezier, colors, duration, durationMs, easing } from "@/lib/tokens";
import CarouselSlide from "./CarouselSlide";
import {
  computeGeometry,
  mod,
  nearestEquivalent,
  type CarouselGeometry,
} from "./carousel-geometry";

const COUNT = projects.length;
/** Pointer travel (px) after which a gesture counts as a drag, not a click. */
const CLICK_SLOP = 6;
/** Seconds of flick velocity projected forward when picking the snap target. */
const FLICK_PROJECTION = 0.2;
/** Flick speed (cards/s) that always advances at least one card. */
const FLICK_MIN_VELOCITY = 0.6;
const MAX_FLICK_CARDS = 2;
/** Distance (card units) from the target below which the strip counts as at rest. */
const REST_EPSILON = 0.001;
/** Drag resistance past the ends in finite (non-looping) mode. */
const RUBBER_BAND = 0.3;
const SNAP_SPRING = { type: "spring", stiffness: 220, damping: 32, mass: 1, restDelta: 0.001 } as const;

// Deterministic layout for the server render and the frame before the
// ResizeObserver reports, so server and client markup match. The viewport is
// hidden until the real measurement lands.
const FALLBACK_GEOMETRY = computeGeometry(1440, COUNT, false);

type SnapMode = "tween" | "spring";

function maskFor(g: CarouselGeometry): string {
  const fade = `${g.maskFade * 100}%`;
  // Alpha-only mask: `transparent`/`black` are mask keywords, not design colours.
  return `linear-gradient(to right, transparent 0, black ${fade}, black calc(100% - ${fade}), transparent 100%)`;
}

export default function CurvedCarousel() {
  const reduced = useReducedMotion() ?? false;
  const [geometry, setGeometry] = useState<CarouselGeometry | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const position = useMotionValue(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const targetRef = useRef(0);
  const animRef = useRef<AnimationPlaybackControls | null>(null);
  const movedRef = useRef(false);
  const panIgnoredRef = useRef(false);
  const panStartRef = useRef(0);
  /** A real (non-ignored) pan is in progress for the current press. */
  const panActiveRef = useRef(false);
  /** The current press stopped a snap animation part-way. */
  const interruptedRef = useRef(false);
  /**
   * The card the strip was resting on when the current press began, or null
   * if it was moving; undefined when no press preceded the click. A pointer
   * click only navigates when it lands on this card.
   */
  const pressRestIndexRef = useRef<number | null | undefined>(undefined);
  /** A wheel scrub has moved the strip since the last commit. */
  const scrubbingRef = useRef(false);
  const stageId = useId();

  const g = geometry ?? FALLBACK_GEOMETRY;

  // ── measurement ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width <= 0) return;
      const next = computeGeometry(width, COUNT, reduced);
      if (!next.loop) {
        // Finite mode: bring an unbounded looping position back into range.
        animRef.current?.stop();
        targetRef.current = mod(targetRef.current, COUNT);
        position.set(targetRef.current);
      }
      setGeometry(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduced, position]);

  useEffect(() => () => animRef.current?.stop(), []);

  // ── navigation ────────────────────────────────────────────────────────────
  const commit = (target: number, mode: SnapMode, velocity = 0) => {
    const t = g.loop ? target : Math.min(COUNT - 1, Math.max(0, target));
    scrubbingRef.current = false;
    targetRef.current = t;
    setActiveIndex(mod(t, COUNT));
    animRef.current?.stop();
    if (reduced) {
      position.set(t);
      return;
    }
    animRef.current =
      mode === "tween"
        ? animate(position, t, { duration: duration.base / 1000, ease: bezier.expo })
        : animate(position, t, { ...SNAP_SPRING, velocity });
  };

  const goTo = (index: number, mode: SnapMode) => {
    const t = g.loop ? nearestEquivalent(index, targetRef.current, COUNT) : index;
    if (t === targetRef.current) return;
    commit(t, mode);
  };

  const step = (delta: number) => commit(targetRef.current + delta, "tween");

  // ── keyboard ──────────────────────────────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keyTargets: Record<string, () => number> = {
      ArrowRight: () => targetRef.current + 1,
      ArrowLeft: () => targetRef.current - 1,
      Home: () => (g.loop ? nearestEquivalent(0, targetRef.current, COUNT) : 0),
      End: () => (g.loop ? nearestEquivalent(COUNT - 1, targetRef.current, COUNT) : COUNT - 1),
    };
    const resolve = keyTargets[e.key];
    if (!resolve) return;
    e.preventDefault();
    const focusedSlide = linkRefs.current.findIndex((el) => el === document.activeElement);
    commit(resolve(), "tween");
    if (focusedSlide >= 0) {
      linkRefs.current[mod(targetRef.current, COUNT)]?.focus({ preventScroll: true });
    }
  };

  // ── drag / swipe ──────────────────────────────────────────────────────────
  // Pressing catches a running snap. If the press turns out to be a plain
  // click (no pan), the strip settles on the nearest card on release instead
  // of being left between cards.
  const handlePointerDownCapture = () => {
    movedRef.current = false;
    panActiveRef.current = false;
    pressRestIndexRef.current = restingIndexNow();
    if (pressRestIndexRef.current === null) {
      animRef.current?.stop();
      interruptedRef.current = true;
    }
  };

  const settleAfterPress = () => {
    if (panActiveRef.current || !interruptedRef.current) return;
    interruptedRef.current = false;
    commit(Math.round(position.get()), "tween");
  };

  const handlePanStart = (_: PointerEvent, info: PanInfo) => {
    panIgnoredRef.current = Math.abs(info.offset.y) > Math.abs(info.offset.x);
    if (panIgnoredRef.current) return;
    panActiveRef.current = true;
    interruptedRef.current = false;
    animRef.current?.stop();
    panStartRef.current = Math.round(position.get());
    viewportRef.current?.setAttribute("data-dragging", "");
  };

  const handlePan = (_: PointerEvent, info: PanInfo) => {
    if (panIgnoredRef.current) return;
    if (Math.abs(info.offset.x) > CLICK_SLOP) movedRef.current = true;
    const current = position.get();
    const outOfRange = !g.loop && (current < 0 || current > COUNT - 1);
    const factor = outOfRange ? RUBBER_BAND : 1;
    position.set(current - (info.delta.x / g.pitch) * factor);
  };

  const handlePanEnd = (_: PointerEvent, info: PanInfo) => {
    if (panIgnoredRef.current) {
      settleAfterPress();
      return;
    }
    viewportRef.current?.removeAttribute("data-dragging");
    const v = -info.velocity.x / g.pitch;
    // Steps are counted from the card the gesture started on, not the card
    // nearest the release point: past halfway that is already the next card,
    // and a minimum-step push from there would skip one.
    const start = panStartRef.current;
    let t = Math.round(position.get() + v * FLICK_PROJECTION);
    if (Math.abs(v) > FLICK_MIN_VELOCITY && t === start) t = start + Math.sign(v);
    t = Math.min(start + MAX_FLICK_CARDS, Math.max(start - MAX_FLICK_CARDS, t));
    commit(t, "spring", v);
  };

  // ── horizontal trackpad wheel ─────────────────────────────────────────────
  useHorizontalWheel(viewportRef, {
    onDelta: (dx) => {
      animRef.current?.stop();
      const raw = position.get() + dx / g.pitch;
      const next = g.loop ? raw : Math.min(COUNT - 1, Math.max(0, raw));
      position.set(next);
      // Keep the target in step, so an arrow key or button pressed mid-scrub
      // steps from where the strip is, not from where the scrub began.
      targetRef.current = Math.round(next);
      scrubbingRef.current = true;
    },
    onEnd: () => {
      // Skip if a key or button already committed a target mid-stream.
      if (scrubbingRef.current) commit(Math.round(position.get()), "tween");
    },
  });

  // ── card links ────────────────────────────────────────────────────────────
  const restingIndexNow = () =>
    Math.abs(position.get() - targetRef.current) < REST_EPSILON ? mod(targetRef.current, COUNT) : null;

  const handleSelect = (index: number, e: MouseEvent<HTMLAnchorElement>) => {
    // A keyboard-initiated click (detail 0) activates the focused link, which
    // focus has already made the target, so it can't open a different card.
    if (e.detail === 0) {
      if (index !== mod(targetRef.current, COUNT)) {
        e.preventDefault();
        goTo(index, "tween");
      }
      return;
    }
    // A pointer click navigates only if the strip was at rest on this very
    // card when the press began. Mid-snap, or on any other card, it centres
    // the clicked card instead, so it never opens a card other than the one
    // under the pointer.
    const pressed = pressRestIndexRef.current;
    const restIndex = pressed === undefined ? restingIndexNow() : pressed;
    pressRestIndexRef.current = undefined;
    if (movedRef.current || restIndex !== index) {
      e.preventDefault();
      if (!movedRef.current) goTo(index, "tween");
    }
  };

  const handleLinkFocus = (index: number, e: FocusEvent<HTMLAnchorElement>) => {
    // Only keyboard focus recentres; a mouse-down focus would fight the drag.
    if (e.currentTarget.matches(":focus-visible")) goTo(index, "tween");
  };

  const active = projects[activeIndex];
  const counter = `${String(activeIndex + 1).padStart(2, "0")} / ${String(COUNT).padStart(2, "0")}`;
  const mask = maskFor(g);
  const viewportStyle: CSSProperties = {
    position: "relative",
    height: geometry ? g.stageHeight : "clamp(300px, 34vw, 540px)",
    visibility: geometry ? "visible" : "hidden",
    // `clip`, not `hidden`: a hidden box is still a scroll container, and
    // focusing an off-centre link would scroll it sideways.
    overflow: "clip",
    touchAction: "pan-y",
    maskImage: mask,
    WebkitMaskImage: mask,
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected projects"
      onKeyDown={handleKeyDown}
    >
      <motion.div
        ref={viewportRef}
        className="cursor-grab select-none data-[dragging]:cursor-grabbing"
        style={viewportStyle}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerUpCapture={settleAfterPress}
        onPointerCancelCapture={settleAfterPress}
        onPanStart={handlePanStart}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
      >
        <div
          id={stageId}
          style={{
            position: "absolute",
            inset: 0,
            perspective: g.reduced ? "none" : `${g.radius}px`,
            perspectiveOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          {projects.map((project, i) => (
            <CarouselSlide
              key={project.id}
              project={project}
              index={i}
              count={COUNT}
              position={position}
              geometry={g}
              onSelect={handleSelect}
              onLinkFocus={handleLinkFocus}
              linkRef={(el) => {
                linkRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </motion.div>

      <div
        className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between"
        style={{ paddingLeft: "8%", paddingRight: "8%" }}
      >
        <p className="text-body-sm" style={{ color: colors.text.muted, margin: 0, maxWidth: "34ch" }}>
          Drag, swipe or use the arrow keys to browse. Open a project for the full write-up.
        </p>
        <div className="flex items-center gap-4">
          <NavButton direction="prev" controls={stageId} onClick={() => step(-1)} />
          <span
            aria-hidden
            className="text-label"
            style={{
              color: colors.text.muted,
              minWidth: "4.5rem",
              textAlign: "center",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {counter}
          </span>
          <NavButton direction="next" controls={stageId} onClick={() => step(1)} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {`Project ${activeIndex + 1} of ${COUNT}: ${active.title}`}
      </p>
    </div>
  );
}

// ─── prev / next ─────────────────────────────────────────────────────────────

type NavButtonProps = {
  direction: "prev" | "next";
  controls: string;
  onClick: () => void;
};

function NavButton({ direction, controls, onClick }: NavButtonProps) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-controls={controls}
      aria-label={direction === "prev" ? "Previous project" : "Next project"}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--nav-bg)] transition-colors hover:bg-[var(--nav-bg-hover)] motion-reduce:transition-none"
      style={
        {
          "--nav-bg": colors.bg.primary,
          "--nav-bg-hover": colors.bg.secondary,
          border: `1px solid ${colors.border.subtle}`,
          color: colors.text.primary,
          transitionDuration: durationMs.fast,
          transitionTimingFunction: easing.swift,
        } as CSSProperties
      }
    >
      <Icon size={20} strokeWidth={1.75} aria-hidden />
    </button>
  );
}
