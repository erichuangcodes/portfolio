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
// 12.6..19.4. User-approved setting: fog runs from the camera out to 160, far
// past the back of the cluster, so depth reads as a very light haze rather
// than the close fog this started with.
export const FOG_NEAR = 0;
export const FOG_FAR = 160;

// ─── Physics ──────────────────────────────────────────────────────────────────
// Damping dominates the pull so motion stays heavy and never springs back.
// CENTER_PULL is cohesion, not gravity: the bounds below are what hold the
// overall shape. User-approved at 0.75, which is firm enough to be felt and
// keeps the cluster tighter than the 0.32 it started at.
export const LINEAR_DAMPING = 2.0;
export const ANGULAR_DAMPING = 1.5;
export const RESTITUTION = 0.04;
export const FRICTION = 0.4;
export const CENTER_PULL = 0.75;
export const CONTAINMENT_GAIN = 14;

// ─── Cluster bounds ───────────────────────────────────────────────────────────
// X/Y are fractions of the visible viewport at z=0, over half so the cluster
// bleeds past the edges instead of reading as a ball floating in frame.
export const BOUNDS_X = 0.58;
export const BOUNDS_Y = 0.62;
export const BOUNDS_Z = 3.4;

// No small spheres: the smallest is about the old median size. Sizes are
// weighted toward medium-large (see buildInstances).
export const RADIUS_MIN = 0.9;
export const RADIUS_MAX = 1.8;
const RADIUS_BIAS = 0.8; // < 1 leans the distribution toward the large end

// Counts per viewport tier. Cut from 150/95/55 when the spheres grew: the
// average sphere now has about 2.4x the volume, so this keeps a similar fill.
export const COUNT_DESKTOP = 64; // >= 1280px
export const COUNT_TABLET = 40; // >= 768px
export const COUNT_MOBILE = 24;

// Extra spheres added on top of the random spread, for a slightly denser
// cluster: a fixed number of big ones and medium ones per viewport tier.
export type ExtraSpheres = { large: number; medium: number };
export const EXTRAS_DESKTOP: ExtraSpheres = { large: 5, medium: 5 };
export const EXTRAS_TABLET: ExtraSpheres = { large: 3, medium: 3 };
export const EXTRAS_MOBILE: ExtraSpheres = { large: 2, medium: 2 };

// Where the extras fall inside [minRadius, maxRadius], as fractions.
const LARGE_BAND: [number, number] = [0.75, 1];
const MEDIUM_BAND: [number, number] = [0.35, 0.55];

export function extraSpheresForViewport(width: number): ExtraSpheres {
  if (width < 768) return EXTRAS_MOBILE;
  if (width < 1280) return EXTRAS_TABLET;
  return EXTRAS_DESKTOP;
}

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
  /** Ring distance to this sphere's second hue — kept small so the two
   *  colours are neighbours on the ring and blend softly. */
  huePair: number;
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
// the width does, so phones get far fewer spheres.
export function sphereCountForViewport(
  width: number,
  counts: { countDesktop: number; countTablet: number; countMobile: number },
): number {
  if (width < 768) return counts.countMobile;
  if (width < 1280) return counts.countTablet;
  return counts.countDesktop;
}

/**
 * `count` is the total. The last `extras.large + extras.medium` spheres get
 * sizes from fixed bands; the rest use the random spread. Extras are appended
 * after the seeded spheres, so adding them never moves the existing ones.
 */
export function buildInstances(
  count: number,
  minRadius: number = RADIUS_MIN,
  maxRadius: number = RADIUS_MAX,
  extras: ExtraSpheres = { large: 0, medium: 0 },
): SphereInstance[] {
  const rand = mulberry32(SEED);
  const out: SphereInstance[] = [];
  const base = Math.max(0, count - extras.large - extras.medium);
  const span = maxRadius - minRadius;
  const inBand = ([lo, hi]: [number, number]) => minRadius + span * (lo + (hi - lo) * rand());

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
      // Leans toward medium-large; the extras use fixed size bands.
      radius:
        i < base
          ? minRadius + span * Math.pow(rand(), RADIUS_BIAS)
          : inBand(i < base + extras.large ? LARGE_BAND : MEDIUM_BAND),
      huePhase: rand(),
      huePeriod: HUE_PERIOD_MIN + rand() * (HUE_PERIOD_MAX - HUE_PERIOD_MIN),
      huePair: 0.06 + rand() * 0.08,
    });
  }

  return out;
}
