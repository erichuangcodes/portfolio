// Pure geometry for the curved projects carousel. No React in here.
//
// The cards sit on the inside of a vertical cylinder and the camera sits on
// the cylinder's axis (CSS `perspective` equals the radius). That makes the
// centre card flat and smallest, and cards toward both edges turn inward and
// grow by exactly 1 / cos(angle). `position` is measured in card units: 0 is
// the first project centred, 1 the second, and so on.

// ─── config ──────────────────────────────────────────────────────────────────

type Breakpoint = {
  /** Lower bound of the container width (px) this breakpoint applies from. */
  minWidth: number;
  /** Card width as a fraction of the container, before clamping. */
  cardFraction: number;
  minCardWidth: number;
  maxCardWidth: number;
  /** Angle (deg) at which the screen edge sits. The "curve strength" knob. */
  edgeAngleDeg: number;
  gap: number;
  /** Width of the left/right fade mask, as a fraction of the container. */
  maskFade: number;
};

// Widest first, so the first match wins.
const BREAKPOINTS: readonly Breakpoint[] = [
  { minWidth: 1024, cardFraction: 0.22, minCardWidth: 260, maxCardWidth: 400, edgeAngleDeg: 50, gap: 14, maskFade: 0.1 },
  { minWidth: 640, cardFraction: 0.38, minCardWidth: 260, maxCardWidth: 360, edgeAngleDeg: 38, gap: 12, maskFade: 0.06 },
  { minWidth: 0, cardFraction: 0.74, minCardWidth: 260, maxCardWidth: 340, edgeAngleDeg: 26, gap: 10, maskFade: 0.04 },
];

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

function breakpointFor(width: number): Breakpoint {
  return BREAKPOINTS.find((b) => width >= b.minWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
}

// ─── geometry ────────────────────────────────────────────────────────────────

export function computeGeometry(containerWidth: number, count: number, reduced: boolean): CarouselGeometry {
  const bp = breakpointFor(containerWidth);
  const cardWidth = Math.round(
    Math.max(
      0,
      Math.min(
        Math.max(containerWidth * bp.cardFraction, bp.minCardWidth),
        bp.maxCardWidth,
        containerWidth - SIDE_MARGIN,
      ),
    ),
  );
  const imageHeight = Math.round(cardWidth / IMAGE_ASPECT);
  const shellHeight = imageHeight + META_HEIGHT;

  const edge = bp.edgeAngleDeg * DEG;
  const radius = containerWidth / 2 / Math.tan(edge);
  const pitch = cardWidth + bp.gap;
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
    maskFade: bp.maskFade,
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
  const opacity = culled ? 0 : 1 - EDGE_DIM * smoothstep(0.35, 1, innerEdge / g.edge);

  return { transform, opacity, culled };
}
