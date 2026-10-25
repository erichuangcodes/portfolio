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
// APPROVED LOOK (commit 5ece2e2) — the values the user signed off on a real
// GPU. The Leva panel is initialised from these and must not change them.
// Anything the panel produces is a proposal until it is pasted back in here.
// ---------------------------------------------------------------------------
export const APPROVED_SCENE = {
  /** Fill. High on purpose: three divides diffuse by PI without pre-scaling
      irradiance, so ~PI renders a surface at its true albedo. */
  ambient: 1.35,
  /** Soft key. Raising this is what turns the pastels dusty. */
  key: 0.95,
  /** Cool rim from behind, to separate silhouettes from the stage. */
  rim: 0.55,
  /** The scene's main soft light — the PMREM env map. */
  envMapIntensity: 1.15,
  /** N8AO contact shadows. 0.45 is approved; 1.2 is too heavy. */
  ao: 0.45,
  background: colors.scene.bg,
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
