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
} as const;

// ---------------------------------------------------------------------------
// Easing curves
// ---------------------------------------------------------------------------
export const easing = {
  expo: "cubic-bezier(0.16, 1, 0.3, 1)",   // entrance animations
  swift: "cubic-bezier(0.65, 0, 0.35, 1)",  // UI transitions
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // emphasis / overshoot
} as const;

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
