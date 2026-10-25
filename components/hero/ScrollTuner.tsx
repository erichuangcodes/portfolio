"use client";

// Dev-only Leva panel for the hero's shrink-on-scroll timing. Dynamically
// imported behind DEV_TUNING, so neither this file nor Leva reaches a
// production bundle.
//
// It only ever *writes* to the transition store. The committed values in
// scroll-controls.ts stay the source of truth — use "copy values" and paste
// the result back there to make a change stick.

import { button, folder, useControls } from "leva";
import { useEffect } from "react";
import {
  APPROVED_TRANSITION,
  formatTransitionValues,
  setTransitionValues,
  type TransitionShape,
} from "./scroll-controls";

export default function ScrollTuner() {
  const values = useControls({
    Shrink: folder({
      settlePoint: { value: APPROVED_TRANSITION.settlePoint, min: 0, max: 1, step: 0.01 },
      settleScale: { value: APPROVED_TRANSITION.settleScale, min: 0.5, max: 1, step: 0.01 },
      settlePower: { value: APPROVED_TRANSITION.settlePower, min: 0.5, max: 4, step: 0.1 },
      speckScale: { value: APPROVED_TRANSITION.speckScale, min: 0.005, max: 0.3, step: 0.005 },
      collapsePower: { value: APPROVED_TRANSITION.collapsePower, min: 0.5, max: 6, step: 0.1 },
      pauseBelowScale: { value: APPROVED_TRANSITION.pauseBelowScale, min: 0.01, max: 0.3, step: 0.005 },
    }),
    "copy values": button(async (get) => {
      const snapshot: TransitionShape = {
        settlePoint: get("Shrink.settlePoint"),
        settleScale: get("Shrink.settleScale"),
        settlePower: get("Shrink.settlePower"),
        speckScale: get("Shrink.speckScale"),
        collapsePower: get("Shrink.collapsePower"),
        pauseBelowScale: get("Shrink.pauseBelowScale"),
      };
      const code = formatTransitionValues(snapshot);
      try {
        await navigator.clipboard.writeText(code);
        console.info("[ScrollTuner] values copied to clipboard\n" + code);
      } catch {
        // Clipboard needs a secure context and focus; the log is the fallback.
        console.info("[ScrollTuner] clipboard unavailable — copy from here:\n" + code);
      }
    }),
  });

  useEffect(() => {
    setTransitionValues({
      settlePoint: values.settlePoint,
      settleScale: values.settleScale,
      settlePower: values.settlePower,
      speckScale: values.speckScale,
      collapsePower: values.collapsePower,
      pauseBelowScale: values.pauseBelowScale,
    });
  }, [values]);

  return null;
}
