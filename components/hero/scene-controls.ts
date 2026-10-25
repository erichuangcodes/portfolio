"use client";

// Live values for the hero scene, plus the approved defaults they start from.
//
// In production this store is written once (never) and every read returns
// APPROVED_SCENE, so the scene renders exactly the committed look. In
// development SceneTuner writes to it from a Leva panel, which is the only
// thing that ever calls setSceneValues.

import { useSyncExternalStore } from "react";
import { colors, spherePalette } from "@/lib/tokens";
import { CENTER_PULL, FOG_FAR, FOG_NEAR } from "./sphere-scene";

/** Dev-only tuning panel. Statically replaced, so Leva tree-shakes out of prod. */
export const DEV_TUNING = process.env.NODE_ENV === "development";

// ---------------------------------------------------------------------------
// APPROVED LOOK — tuned by the user in the dev panel on a real GPU and pasted
// back here. These supersede the 5ece2e2 values; the earlier note claiming a
// strong key muddies the pastels was written from software renders and was
// wrong. Do not re-tune without being asked.
//
// Still true: these cannot be judged from a headless capture, because
// SwiftShader contributes nothing from the PMREM env map.
// ---------------------------------------------------------------------------
export const APPROVED_SCENE = {
  /** Fill. High on purpose: three divides diffuse by PI without pre-scaling
      irradiance, so ~PI renders a surface at its true albedo. */
  ambient: 3,
  key: 1.6,
  /** Cool rim from behind, to separate silhouettes from the stage. */
  rim: 1.85,
  /** The PMREM env map — a major light here, invisible under SwiftShader. */
  envMapIntensity: 1.5,
  /** N8AO contact shadows. */
  ao: 0.5,
  /** Zero alpha: the WebGL scene clears transparent and the card's own
      off-white surface shows through. See isTransparent(). */
  background: "#00000000",
  /** Fog from the camera out to 160 units. The cluster sits inside ~20 units,
      so this is a very light haze rather than the old close fog. */
  fogNear: FOG_NEAR,
  fogFar: FOG_FAR,
  centerPull: CENTER_PULL,
  palette: [...spherePalette] as string[],
} as const satisfies SceneShape;

type SceneShape = {
  ambient: number;
  key: number;
  rim: number;
  envMapIntensity: number;
  ao: number;
  background: string;
  fogNear: number;
  fogFar: number;
  centerPull: number;
  palette: readonly string[];
};

export type SceneValues = {
  -readonly [K in keyof SceneShape]: SceneShape[K] extends readonly string[]
    ? string[]
    : SceneShape[K];
};

const DEFAULTS: SceneValues = {
  ...APPROVED_SCENE,
  palette: [...APPROVED_SCENE.palette],
};

let current: SceneValues = DEFAULTS;
const listeners = new Set<() => void>();

/** Dev only — called by SceneTuner as the Leva panel changes. */
export function setSceneValues(next: Partial<SceneValues>): void {
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

export function useSceneValues(): SceneValues {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The panel's "copy values" payload: a paste-ready diff of the approved look. */
export function formatSceneValues(v: SceneValues): string {
  const changed = (label: string, now: number | string, was: number | string) =>
    `${label}: ${typeof now === "number" ? now : `"${now}"`}${
      now === was ? "" : `   // was ${typeof was === "number" ? was : `"${was}"`}`
    }`;

  return [
    "// Hero scene values from the dev tuning panel.",
    "// HeroSpheres.tsx / SphereField.tsx:",
    `  ambientLight          ${changed("intensity", v.ambient, APPROVED_SCENE.ambient)}`,
    `  directionalLight key  ${changed("intensity", v.key, APPROVED_SCENE.key)}`,
    `  directionalLight rim  ${changed("intensity", v.rim, APPROVED_SCENE.rim)}`,
    `  N8AO                  ${changed("intensity", v.ao, APPROVED_SCENE.ao)}`,
    `  meshPhysicalMaterial  ${changed("envMapIntensity", v.envMapIntensity, APPROVED_SCENE.envMapIntensity)}`,
    "// lib/tokens.ts:",
    `  colors.scene.${changed("bg", v.background, APPROVED_SCENE.background)}`,
    "  spherePalette = [",
    ...v.palette.map(
      (hex, i) =>
        `    "${hex}",${hex === APPROVED_SCENE.palette[i] ? "" : `   // was "${APPROVED_SCENE.palette[i]}"`}`,
    ),
    "  ]",
    "// components/hero/sphere-scene.ts:",
    `  ${changed("FOG_NEAR", v.fogNear, APPROVED_SCENE.fogNear)}`,
    `  ${changed("FOG_FAR", v.fogFar, APPROVED_SCENE.fogFar)}`,
    `  ${changed("CENTER_PULL", v.centerPull, APPROVED_SCENE.centerPull)}`,
  ].join("\n");
}

/**
 * Leva's colour input carries an alpha channel, so it can hand back 8-digit
 * hex. THREE.Color only parses 3- and 6-digit forms — it warns and keeps its
 * previous value for anything else — so a zero-alpha pick has to be handled as
 * a transparent clear rather than passed through as a colour.
 */
export function isTransparent(hex: string): boolean {
  return /^#[0-9a-f]{6}00$/i.test(hex.trim());
}

/** A three-safe colour for `hex`, falling back to the stage colour. */
export function sceneColor(hex: string): string {
  const v = hex.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return v;
  if (/^#([0-9a-f]{6})[0-9a-f]{2}$/i.test(v)) return v.slice(0, 7);
  return colors.scene.bg;
}
