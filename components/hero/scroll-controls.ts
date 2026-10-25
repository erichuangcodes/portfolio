"use client";

// Live values for the hero's shrink-on-scroll timing, plus the approved
// defaults they start from.
//
// In production this store is written once (never) and every read returns
// APPROVED_TRANSITION, so the transition runs exactly the committed timing. In
// development ScrollTuner writes to it from a Leva panel, which is the only
// thing that ever calls setTransitionValues.

import { useSyncExternalStore } from "react";

/** Dev-only tuning panel. Statically replaced, so Leva tree-shakes out of prod. */
export const DEV_TUNING = process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// APPROVED TIMING — two-segment shrink: the card barely moves through most of
// the scroll, then collapses fast at the end. Do not re-tune without being
// asked.
// ---------------------------------------------------------------------------
export const APPROVED_TRANSITION = {
  /** Scroll progress (0–1) where the "mostly full size" phase ends and the
      fast collapse begins. */
  settlePoint: 0.7,
  /** Scale at settlePoint — a subtle settle, not a real shrink yet. */
  settleScale: 0.85,
  /** Ease-out exponent for the settle segment (0 → settlePoint): higher eases
      in harder. 1 = linear. */
  settlePower: 1.6,
  /** Scale at progress 1 — a speck at the centre of the screen. */
  speckScale: 0.015,
  /** Ease-in exponent for the collapse segment (settlePoint → 1): higher
      stays flatter for longer, then drops faster at the very end. */
  collapsePower: 2.4,
  /** Below this scale the speck is too small to read, so the WebGL scene
      stops rendering until the card grows back past it. */
  pauseBelowScale: 0.04,
} as const satisfies TransitionShape;

export type TransitionShape = {
  settlePoint: number;
  settleScale: number;
  settlePower: number;
  speckScale: number;
  collapsePower: number;
  pauseBelowScale: number;
};

const DEFAULTS: TransitionShape = { ...APPROVED_TRANSITION };

let current: TransitionShape = DEFAULTS;
const listeners = new Set<() => void>();

/** Dev only — called by ScrollTuner as the Leva panel changes. */
export function setTransitionValues(next: Partial<TransitionShape>): void {
  current = { ...current, ...next };
  for (const notify of listeners) notify();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => DEFAULTS;

export function useTransitionValues(): TransitionShape {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** scale(progress) for the two-segment settle-then-collapse curve. */
export function shrinkScale(progress: number, v: TransitionShape): number {
  if (progress <= v.settlePoint) {
    const u = v.settlePoint <= 0 ? 1 : progress / v.settlePoint;
    const eased = 1 - Math.pow(1 - u, v.settlePower);
    return v.settleScale + (1 - v.settleScale) * (1 - eased);
  }
  const span = 1 - v.settlePoint;
  const u = span <= 0 ? 1 : (progress - v.settlePoint) / span;
  const eased = Math.pow(u, v.collapsePower);
  return v.settleScale + (v.speckScale - v.settleScale) * eased;
}

/** The panel's "copy values" payload: a paste-ready diff of the approved timing. */
export function formatTransitionValues(v: TransitionShape): string {
  const changed = (label: string, now: number) =>
    `${label}: ${now}${now === APPROVED_TRANSITION[label as keyof TransitionShape] ? "" : `   // was ${APPROVED_TRANSITION[label as keyof TransitionShape]}`}`;

  return [
    "// Hero shrink timing from the dev tuning panel.",
    "// components/hero/scroll-controls.ts, APPROVED_TRANSITION:",
    `  ${changed("settlePoint", v.settlePoint)}`,
    `  ${changed("settleScale", v.settleScale)}`,
    `  ${changed("settlePower", v.settlePower)}`,
    `  ${changed("speckScale", v.speckScale)}`,
    `  ${changed("collapsePower", v.collapsePower)}`,
    `  ${changed("pauseBelowScale", v.pauseBelowScale)}`,
  ].join("\n");
}
