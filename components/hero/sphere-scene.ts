// Tuning for the hero sphere field. Every magic number for the scene lives
// here so the feel can be dialled in one place.

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA = {
  position: [0, 0, 16] as [number, number, number],
  fov: 45,
  near: 0.1,
  far: 60,
};

// ─── Atmosphere ───────────────────────────────────────────────────────────────
// Camera sits at z=16 and the cluster spans z=-3.4..3.4, so distance runs
// 12.6..19.4. Fog starting inside that span is what drops the far spheres into
// shadow instead of lighting the cluster evenly front to back.
export const FOG_NEAR = 10;
export const FOG_FAR = 26;

// ─── Physics ──────────────────────────────────────────────────────────────────
// Damping dominates the pull so motion stays heavy and never springs back.
// CENTER_PULL is deliberately weak — it is cohesion, not gravity. Anything
// strong enough to be felt crushes the cluster into a tight ball in the middle
// of the frame; the bounds below are what actually hold the shape.
export const LINEAR_DAMPING = 2.0;
export const ANGULAR_DAMPING = 1.5;
export const RESTITUTION = 0.04;
export const FRICTION = 0.4;
export const CENTER_PULL = 0.25;
export const CONTAINMENT_GAIN = 14;

// ─── Cluster bounds ───────────────────────────────────────────────────────────
// X/Y are fractions of the visible viewport at z=0, over half so the cluster
// bleeds past the edges instead of reading as a ball floating in frame.
export const BOUNDS_X = 0.58;
export const BOUNDS_Y = 0.62;
export const BOUNDS_Z = 3.4;

export const RADIUS_MIN = 0.5;
export const RADIUS_MAX = 1.7;

// Seconds for one trip through the palette ring
export const HUE_PERIOD_MIN = 20;
export const HUE_PERIOD_MAX = 45;

const SEED = 20260224;

export type SphereInstance = {
  /** Position in the unit ball; scaled to world bounds at mount. */
  position: [number, number, number];
  radius: number;
  /** Start offset along the palette ring, 0..1. */
  huePhase: number;
  huePeriod: number;
};

/** Seeded PRNG — the scene must not call Math.random (impure during render). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Counts are tuned against the bounds volume, which shrinks much faster than
// the width does — holding 150 on a phone would jam the spheres solid.
export function sphereCountForViewport(width: number): number {
  if (width < 768) return 55;
  if (width < 1280) return 95;
  return 150;
}

export function buildInstances(count: number): SphereInstance[] {
  const rand = mulberry32(SEED);
  const out: SphereInstance[] = [];

  for (let i = 0; i < count; i++) {
    // Uniform point in the unit ball
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = Math.cbrt(rand());
    const sinPhi = Math.sin(phi);

    out.push({
      position: [
        r * sinPhi * Math.cos(theta),
        r * sinPhi * Math.sin(theta),
        r * Math.cos(phi),
      ],
      // Biased toward the small end so a few large spheres read as foreground
      radius: RADIUS_MIN + (RADIUS_MAX - RADIUS_MIN) * Math.pow(rand(), 1.7),
      huePhase: rand(),
      huePeriod: HUE_PERIOD_MIN + rand() * (HUE_PERIOD_MAX - HUE_PERIOD_MIN),
    });
  }

  return out;
}
