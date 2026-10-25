// Design system tokens — single source of truth.
// Components must consume these; no hardcoded hex/ms/cubic values anywhere.

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const colors = {
  bg: {
    primary: "#FFFFFF",
    secondary: "#F5F5F4",
    tertiary: "#E7E5E4",
  },
  text: {
    primary: "#0A0A0A",
    secondary: "#404040",
    muted: "#737373",
  },
  accent: {
    // TODO: verify exact hex against antimetal.com via DevTools before shipping
    primary: "#edd97e",
    glow: "rgba(126, 181, 237, 0.15)",
  },
  border: {
    subtle: "rgba(0, 0, 0, 0.08)",
    strong: "rgba(0, 0, 0, 0.16)",
  },
  overlay: {
    // Pointer-tracked sheen on project cards: white at low alpha, not a glow.
    spotlight: "rgba(255, 255, 255, 0.22)",
  },
  // Hero sphere scene — warm off-white stage with a warm key and a cool rim
  scene: {
    bg: "#F4F1EC",
    key: "#FFEFD6",
    rim: "#8FB4FF",
    // Occlusion tint: warm, so contact shadows sit in the same family as the
    // stage instead of greying the pastels toward dirt.
    ao: "#9A8F80",
    // The page behind the hero card — same family, a shade down from the card
    // so the card's edge is readable without a heavy border.
    page: "#ECE7DF",
  },
} as const;

// ---------------------------------------------------------------------------
// Hero sphere palette — APPROVED LOOK, do not darken or desaturate.
//
// Each sphere blends two neighbouring entries across its surface and drifts
// slowly around the ring, so the range never leaves pastel. These read as
// pastel only because the hero lighting is bright and un-occluded — see the
// APPROVED LOOK note in components/hero/HeroSpheres.tsx before changing either.
// ---------------------------------------------------------------------------
export const spherePalette = [
  "#B9A7F0", // lavender
  "#8FC4F2", // baby blue
  "#8ADFC1", // mint
  "#F4A9C0", // blush pink
  "#F8BE96", // peach
  "#F5DE8E", // butter yellow
] as const;

// ---------------------------------------------------------------------------
// Shadows — warm-tinted, offset rather than a blur halo
// ---------------------------------------------------------------------------
export const shadow = {
  card: "0 1px 2px rgba(58, 48, 36, 0.05), 0 16px 40px rgba(58, 48, 36, 0.08)",
} as const;

// ---------------------------------------------------------------------------
// Easing curves
// ---------------------------------------------------------------------------
export const easing = {
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",   // entrance animations
  swift: "cubic-bezier(0.65, 0, 0.35, 1)",  // UI transitions
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // emphasis / overshoot
} as const;

// The same curves as control-point tuples, for framer-motion `ease` options
// (framer takes arrays, not CSS strings). Keep in sync with `easing` above.
type Bezier = readonly [number, number, number, number];
export const bezier = {
  expo: [0.16, 1, 0.3, 1],
  swift: [0.65, 0, 0.35, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<keyof typeof easing, Bezier>;

// ---------------------------------------------------------------------------
// Durations (ms)
// ---------------------------------------------------------------------------
export const duration = {
  instant: 150,
  fast: 300,
  base: 500,
  slow: 800,
  deliberate: 1200,
} as const;

// CSS string variants for use in inline styles / framer-motion
export const durationMs = {
  instant: "150ms",
  fast: "300ms",
  base: "500ms",
  slow: "800ms",
  deliberate: "1200ms",
} as const;
