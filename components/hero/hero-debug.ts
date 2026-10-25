// TEMPORARY — dev-only diagnostics for the "spheres frozen" report.
// Remove this file, HeroDebugOverlay.tsx and every `heroDebug` write once
// Eric confirms the spheres move again.

export const heroDebug = {
  /** Set when a component inside <Physics> mounts (Rapier WASM loaded). */
  rapierLoaded: false,
  /** Physics world steps so far; should climb ~60/s while running. */
  steps: 0,
  /** R3F frameloop mode: "always" runs physics; "demand"/"never" do not. */
  frameloop: "unknown" as string,
  pauseReason: "none" as string,
  reducedMotionHook: null as boolean | null,
  reducedMotionMedia: false,
  heroInView: false,
  shrinkScale: 1,
  /** True when SphereField renders the static (no-physics) path. */
  frozenPath: false,
  pointerEvents: 0,
  cursorBody: [0, 0, 0] as [number, number, number],
  cursorInfluence: 0,
  /** R3F frames rendered (counts toward FPS). */
  frames: 0,
};
