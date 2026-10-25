"use client";

// Live values for the nav's liquid-glass pill, plus the approved defaults.
// Production never writes to this store, so it always renders
// APPROVED_NAV_GLASS; in development NavGlassTuner writes to it from Leva.

import { useSyncExternalStore } from "react";

/** Dev-only tuning panel. Statically replaced, so Leva tree-shakes out of prod. */
export const DEV_TUNING = process.env.NODE_ENV === "development";

export const APPROVED_NAV_GLASS = {
  /** feDisplacementMap scale: how far the backdrop is bent (Chromium only). */
  refraction: 95,
  /** Width in px of the bright/dark inset bevel that reads as a glass edge. */
  edgeWidth: 12,
  /** Opacity of the white tint over the backdrop. */
  backgroundOpacity: 0.35,
  /** Backdrop saturation boost, applied on both paths. */
  saturation: 2.15,
  /** Blur in px for the frosted fallback (Safari, Firefox). */
  fallbackBlur: 16,
} as const satisfies NavGlassShape;

export type NavGlassShape = {
  refraction: number;
  edgeWidth: number;
  backgroundOpacity: number;
  saturation: number;
  fallbackBlur: number;
};

export type NavGlassValues = NavGlassShape & {
  /** Dev only: render the frosted fallback even in Chromium. */
  forceFallback: boolean;
};

const DEFAULTS: NavGlassValues = { ...APPROVED_NAV_GLASS, forceFallback: false };

let current: NavGlassValues = DEFAULTS;
const listeners = new Set<() => void>();

export function setNavGlassValues(next: Partial<NavGlassValues>): void {
  current = { ...current, ...next };
  for (const notify of listeners) notify();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function useNavGlassValues(): NavGlassValues {
  return useSyncExternalStore(subscribe, () => current, () => DEFAULTS);
}

export function formatNavGlassValues(v: NavGlassShape): string {
  const keys = Object.keys(APPROVED_NAV_GLASS) as (keyof NavGlassShape)[];
  return [
    "// Nav glass values from the dev tuning panel.",
    "// components/layout/nav-glass-controls.ts, APPROVED_NAV_GLASS:",
    ...keys.map((k) =>
      `  ${k}: ${v[k]}${v[k] === APPROVED_NAV_GLASS[k] ? "" : `   // was ${APPROVED_NAV_GLASS[k]}`}`,
    ),
  ].join("\n");
}
