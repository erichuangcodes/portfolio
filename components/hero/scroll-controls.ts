"use client";

// Live values for the hero's scroll-out collapse, plus the approved defaults.
// In production nothing writes to this store; in development ScrollTuner does.

import { useSyncExternalStore } from "react";

/** Dev-only tuning panel. Statically replaced, so Leva tree-shakes out of prod. */
export const DEV_TUNING = process.env.NODE_ENV === "development";

// Progress runs 0 → 1 as the hero scrolls from filling the viewport to fully
// above it. It scrolls normally until shrinkStart, then collapses to nothing.
export const APPROVED_TRANSITION = {
  /** Progress where the collapse begins (0.5 = half the hero scrolled out). */
  shrinkStart: 0.5,
  /** Progress where scale and opacity reach 0. */
  shrinkEnd: 0.8,
  /** Progress where the fade to opacity 0 begins. */
  fadeStart: 0.6,
  /** Ease-in exponent for the collapse: higher = slower start, faster end. */
  collapsePower: 2.4,
} as const satisfies TransitionShape;

export type TransitionShape = {
  shrinkStart: number;
  shrinkEnd: number;
  fadeStart: number;
  collapsePower: number;
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

export function useTransitionValues(): TransitionShape {
  return useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
}

function easedSpan(progress: number, start: number, end: number, power: number): number {
  if (progress <= start) return 0;
  if (progress >= end || end <= start) return 1;
  return Math.pow((progress - start) / (end - start), power);
}

export function collapseScale(progress: number, v: TransitionShape): number {
  return 1 - easedSpan(progress, v.shrinkStart, v.shrinkEnd, v.collapsePower);
}

export function collapseOpacity(progress: number, v: TransitionShape): number {
  return 1 - easedSpan(progress, v.fadeStart, v.shrinkEnd, v.collapsePower);
}

/** The panel's "copy values" payload: a paste-ready diff of the approved timing. */
export function formatTransitionValues(v: TransitionShape): string {
  const keys = Object.keys(APPROVED_TRANSITION) as (keyof TransitionShape)[];
  return [
    "// Hero collapse timing from the dev tuning panel.",
    "// components/hero/scroll-controls.ts, APPROVED_TRANSITION:",
    ...keys.map((k) =>
      `  ${k}: ${v[k]}${v[k] === APPROVED_TRANSITION[k] ? "" : `   // was ${APPROVED_TRANSITION[k]}`}`,
    ),
  ].join("\n");
}
