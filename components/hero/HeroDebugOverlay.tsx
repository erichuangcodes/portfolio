"use client";

// TEMPORARY — dev-only readout for the "spheres frozen" report. Polls the
// heroDebug store 4×/s so it never re-renders per frame.

import { useEffect, useRef, useState } from "react";
import { heroDebug } from "./hero-debug";

type Snapshot = typeof heroDebug & { fps: number; stepsPerSec: number };

export default function HeroDebugOverlay() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const last = useRef({ t: 0, frames: 0, steps: 0 });

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last.current.t) / 1000 || 1;
      const fps = (heroDebug.frames - last.current.frames) / dt;
      const stepsPerSec = (heroDebug.steps - last.current.steps) / dt;
      last.current = { t: now, frames: heroDebug.frames, steps: heroDebug.steps };
      setSnap({
        ...heroDebug,
        reducedMotionMedia: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        cursorBody: [...heroDebug.cursorBody],
        fps,
        stepsPerSec,
      });
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  if (!snap) return null;
  const yes = (b: boolean | null) => (b === null ? "?" : b ? "yes" : "no");
  const rows: [string, string][] = [
    ["rapier loaded", yes(snap.rapierLoaded)],
    ["frameloop", snap.frameloop],
    ["physics paused", `${yes(snap.frameloop !== "always" || snap.frozenPath)} (${snap.pauseReason})`],
    ["static path", yes(snap.frozenPath)],
    ["reduced motion", `hook ${yes(snap.reducedMotionHook)} / media ${yes(snap.reducedMotionMedia)}`],
    ["hero in view", yes(snap.heroInView)],
    ["shrink scale", snap.shrinkScale.toFixed(3)],
    ["physics steps", `${snap.steps} (${snap.stepsPerSec.toFixed(0)}/s)`],
    ["pointer events", String(snap.pointerEvents)],
    ["cursor body", snap.cursorBody.map((n) => n.toFixed(2)).join(", ")],
    ["cursor influence", snap.cursorInfluence.toFixed(2)],
    ["fps", snap.fps.toFixed(0)],
    ["body speed avg", snap.bodySpeed.toFixed(3)],
    ["source sum", snap.sourceChecksum.toFixed(3)],
    ["draw sum", snap.drawChecksum.toFixed(3)],
  ];

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "16px",
        bottom: "16px",
        zIndex: 50,
        padding: "10px 12px",
        borderRadius: "8px",
        background: "rgba(0, 0, 0, 0.78)",
        color: "#fff",
        font: "11px/1.5 ui-monospace, monospace",
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {"HERO DEBUG (temporary, dev only)\n"}
      {rows.map(([k, v]) => `${k.padEnd(17)}${v}`).join("\n")}
    </div>
  );
}
