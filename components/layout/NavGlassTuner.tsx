"use client";

// Dev-only Leva folder for the nav glass. Writes to the nav-glass store only;
// paste "copy values" output into nav-glass-controls.ts to make it stick.

import { button, folder, useControls } from "leva";
import { useEffect } from "react";
import {
  APPROVED_NAV_GLASS,
  formatNavGlassValues,
  setNavGlassValues,
} from "./nav-glass-controls";

export default function NavGlassTuner() {
  const values = useControls({
    "Nav glass": folder({
      refraction: { value: APPROVED_NAV_GLASS.refraction, min: 0, max: 150, step: 1 },
      edgeWidth: { value: APPROVED_NAV_GLASS.edgeWidth, min: 0, max: 12, step: 0.5 },
      backgroundOpacity: { value: APPROVED_NAV_GLASS.backgroundOpacity, min: 0, max: 1, step: 0.01 },
      saturation: { value: APPROVED_NAV_GLASS.saturation, min: 0.5, max: 3, step: 0.05 },
      fallbackBlur: { value: APPROVED_NAV_GLASS.fallbackBlur, min: 0, max: 40, step: 1 },
      forceFallback: { value: false, label: "force fallback" },
      "copy nav values": button(async (get) => {
        const code = formatNavGlassValues({
          refraction: get("Nav glass.refraction"),
          edgeWidth: get("Nav glass.edgeWidth"),
          backgroundOpacity: get("Nav glass.backgroundOpacity"),
          saturation: get("Nav glass.saturation"),
          fallbackBlur: get("Nav glass.fallbackBlur"),
        });
        try {
          await navigator.clipboard.writeText(code);
          console.info("[NavGlassTuner] values copied to clipboard\n" + code);
        } catch {
          console.info("[NavGlassTuner] clipboard unavailable — copy from here:\n" + code);
        }
      }),
    }),
  });

  useEffect(() => {
    setNavGlassValues({
      refraction: values.refraction,
      edgeWidth: values.edgeWidth,
      backgroundOpacity: values.backgroundOpacity,
      saturation: values.saturation,
      fallbackBlur: values.fallbackBlur,
      forceFallback: values.forceFallback,
    });
  }, [values]);

  return null;
}
