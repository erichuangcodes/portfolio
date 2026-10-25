"use client";

// Dev-only Leva panel for the hero's scroll-out collapse. Writes to the
// transition store only; paste "copy values" output into scroll-controls.ts
// to make a change stick.

import { button, folder, useControls } from "leva";
import { useEffect } from "react";
import {
  APPROVED_TRANSITION,
  formatTransitionValues,
  setTransitionValues,
  type TransitionShape,
} from "./scroll-controls";

const PHASE = { min: 0, max: 1, step: 0.01 };

export default function ScrollTuner() {
  const values = useControls({
    Shrink: folder({
      shrinkStart: { value: APPROVED_TRANSITION.shrinkStart, ...PHASE },
      shrinkEnd: { value: APPROVED_TRANSITION.shrinkEnd, ...PHASE },
      fadeStart: { value: APPROVED_TRANSITION.fadeStart, ...PHASE },
      collapsePower: { value: APPROVED_TRANSITION.collapsePower, min: 0.5, max: 6, step: 0.1 },
    }),
    "copy values": button(async (get) => {
      const snapshot: TransitionShape = {
        shrinkStart: get("Shrink.shrinkStart"),
        shrinkEnd: get("Shrink.shrinkEnd"),
        fadeStart: get("Shrink.fadeStart"),
        collapsePower: get("Shrink.collapsePower"),
      };
      const code = formatTransitionValues(snapshot);
      try {
        await navigator.clipboard.writeText(code);
        console.info("[ScrollTuner] values copied to clipboard\n" + code);
      } catch {
        console.info("[ScrollTuner] clipboard unavailable — copy from here:\n" + code);
      }
    }),
  });

  useEffect(() => {
    setTransitionValues({
      shrinkStart: values.shrinkStart,
      shrinkEnd: values.shrinkEnd,
      fadeStart: values.fadeStart,
      collapsePower: values.collapsePower,
    });
  }, [values]);

  return null;
}
