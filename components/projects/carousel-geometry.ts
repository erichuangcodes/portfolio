// Pure geometry for the curved projects carousel. No React in here.
//
// The cards sit on the inside of a vertical cylinder and the camera sits on
// the cylinder's axis (CSS `perspective` equals the radius). That makes the
// centre card flat and smallest, and cards toward both edges turn inward and
// grow by exactly 1 / cos(angle). `position` is measured in card units: 0 is
// the first project centred, 1 the second, and so on.

// ─── config ──────────────────────────────────────────────────────────────────

// Every parameter is a continuous function of the measured container width,
// so there is no breakpoint where cards jump in size or the curve snaps, and
// card width never shrinks as the container grows.

/** Card width (px) at container widths (px); linear between, flat past the ends. */
const CARD_WIDTH_STOPS: readonly (readonly [number, number])[] = [
  [0, 0],
  [400, 296], // phones: 74% of the width
  [1440, 317],
  [1920, 400],
];
/** Container widths between which the curve, gap and mask ease from compact to wide. */
const COMPACT_WIDTH = 480;
const WIDE_WIDTH = 1280;
/** Angle (deg) at which the screen edge sits: the "curve strength" knob. */
const EDGE_ANGLE_DEG = { compact: 26, wide: 50 } as const;
const GAP = { compact: 10, wide: 14 } as const;
/** Width of the left/right fade mask, as a fraction of the container. */
const MASK_FADE = { compact: 0.04, wide: 0.1 } as const;

export const IMAGE_ASPECT = 4 / 3;
/** 12px gap plus a 24px title row below the image. */
export const META_HEIGHT = 36;
export const CARD_RADIUS = 14;
/** Room above and below the tallest card for the focus ring. */
const STAGE_PADDING = 16;
/** Minimum horizontal breathing room (px) kept around the centre card. */
const SIDE_MARGIN = 32;
const THETA_LIMIT_DEG = 84;
const CULL_MARGIN_DEG = 2;
/** How much a card dims (opacity) as it reaches the screen edge. */
const EDGE_DIM = 0.35;
/**
 * The title/year row fades out earlier than the image (as a fraction of the
 * edge angle), so cards cut by the screen edge never leave stray text behind.
 */
const META_FADE_START = 0.55;
const META_FADE_END = 0.9;

const DEG = Math.PI / 180;

// ─── types ───────────────────────────────────────────────────────────────────

export type CarouselGeometry = {
  containerWidth: number;
  count: number;
  reduced: boolean;
  cardWidth: number;
  imageHeight: number;
  shellHeight: number;
  /** Edge angle (rad). */
  edge: number;
  /** Cylinder radius and CSS perspective (px). */
  radius: number;
  /** Pixels per card unit (exact on-screen speed at the centre). */
  pitch: number;
  /** Radians per card unit. */
  dTheta: number;
  /** Half the card's angular width (rad). */
  halfAngle: number;
  /** |offset| (card units) past which a card is fully off screen. */
  cullDistance: number;
  loop: boolean;
  stageHeight: number;
  maskFade: number;
};

export type SlidePose = {
  transform: string;
  opacity: number;
  /** Extra opacity for the title/year row, on top of `opacity`. */
  metaOpacity: number;
  culled: boolean;
};

// ─── helpers ─────────────────────────────────────────────────────────────────

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** Wraps a signed card offset into [-count/2, count/2). */
export function wrapOffset(offset: number, count: number): number {
  return mod(offset + count / 2, count) - count / 2;
}

/**
 * The integer target equivalent to `index` (mod count) that is closest to
 * `from`, so looping always takes the shortest way round.
 */
export function nearestEquivalent(index: number, from: number, count: number): number {
  return from + Math.round(wrapOffset(index - from, count));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function interpolateStops(x: number, stops: readonly (readonly [number, number])[]): number {
  const last = stops[stops.length - 1];
  if (x >= last[0]) return last[1];
  const i = stops.findIndex(([sx]) => sx > x);
  if (i <= 0) return stops[0][1];
  const [x0, y0] = stops[i - 1];
  const [x1, y1] = stops[i];
  return lerp(y0, y1, (x - x0) / (x1 - x0));
}

// ─── geometry ────────────────────────────────────────────────────────────────

export function computeGeometry(containerWidth: number, count: number, reduced: boolean): CarouselGeometry {
  const k = Math.min(1, Math.max(0, (containerWidth - COMPACT_WIDTH) / (WIDE_WIDTH - COMPACT_WIDTH)));
  const cardWidth = Math.round(
    Math.max(0, Math.min(interpolateStops(containerWidth, CARD_WIDTH_STOPS), containerWidth - SIDE_MARGIN)),
  );
  const imageHeight = Math.round(cardWidth / IMAGE_ASPECT);
  const shellHeight = imageHeight + META_HEIGHT;

  const edge = lerp(EDGE_ANGLE_DEG.compact, EDGE_ANGLE_DEG.wide, k) * DEG;
  const radius = containerWidth / 2 / Math.tan(edge);
  const pitch = cardWidth + lerp(GAP.compact, GAP.wide, k);
  const dTheta = pitch / radius;
  const halfAngle = cardWidth / 2 / radius;

  const cullDistance = reduced
    ? (containerWidth / 2 + cardWidth / 2) / pitch
    : (edge + CULL_MARGIN_DEG * DEG + halfAngle) / dTheta;

  const stageHeight = reduced
    ? shellHeight + STAGE_PADDING
    : Math.ceil(shellHeight / Math.cos(edge)) + STAGE_PADDING;

  return {
    containerWidth,
    count,
    reduced,
    cardWidth,
    imageHeight,
    shellHeight,
    edge,
    radius,
    pitch,
    dTheta,
    halfAngle,
    cullDistance,
    // With too few cards, the wrap seam would be visible on screen.
    loop: count > 2 * cullDistance + 0.1,
    stageHeight,
    maskFade: lerp(MASK_FADE.compact, MASK_FADE.wide, k),
  };
}

/** Signed distance (card units) of slide `index` from the current position. */
export function slideOffset(position: number, index: number, g: CarouselGeometry): number {
  const d = index - position;
  return g.loop ? wrapOffset(d, g.count) : d;
}

export function slidePose(position: number, index: number, g: CarouselGeometry): SlidePose {
  const d = slideOffset(position, index, g);

  if (g.reduced) {
    const culled = Math.abs(d) * g.pitch - g.cardWidth / 2 > g.containerWidth / 2;
    return {
      transform: `translateX(${d * g.pitch}px)`,
      opacity: culled ? 0 : 1,
      metaOpacity: 1,
      culled,
    };
  }

  const theta = d * g.dTheta;
  const limit = THETA_LIMIT_DEG * DEG - g.halfAngle;
  const clamped = Math.sign(theta) * Math.min(Math.abs(theta), limit);
  const innerEdge = Math.abs(theta) - g.halfAngle;
  const culled = innerEdge >= g.edge + CULL_MARGIN_DEG * DEG;

  // translateZ(R) rotateY(-θ) translateZ(-R) puts the card on a cylinder of
  // radius R around the camera, turned to face the axis.
  const transform = `translateZ(${g.radius}px) rotateY(${-clamped}rad) translateZ(${-g.radius}px)`;
  const edgeProgress = innerEdge / g.edge;
  const opacity = culled ? 0 : 1 - EDGE_DIM * smoothstep(0.35, 1, edgeProgress);
  const metaOpacity = 1 - smoothstep(META_FADE_START, META_FADE_END, edgeProgress);

  return { transform, opacity, metaOpacity, culled };
}
