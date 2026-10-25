"use client";

// The liquid-glass surface behind the nav pill. Fills its positioned parent
// and inherits its radius; the nav content sits above it.
//
// Chromium bends the backdrop through an SVG displacement filter
// (`backdrop-filter: url(#…)`). Safari and Firefox can't apply SVG filters as
// backdrop filters, so they get a frosted blur instead. Detection runs after
// hydration, so the server and first client render both use the fallback.

import { useId, useSyncExternalStore } from "react";
import { colors } from "@/lib/tokens";
import { useNavGlassValues } from "./nav-glass-controls";

function isChromium(): boolean {
  const data = (navigator as Navigator & {
    userAgentData?: { brands?: { brand: string }[] };
  }).userAgentData;
  return !!data?.brands?.some((b) => b.brand === "Chromium");
}

const noopSubscribe = () => () => {};

export default function NavGlass() {
  const v = useNavGlassValues();
  const filterId = `nav-glass-${useId().replace(/:/g, "")}`;
  const supportsRefraction = useSyncExternalStore(noopSubscribe, isChromium, () => false);
  const refract = supportsRefraction && !v.forceFallback;

  const backdrop = refract
    ? `url(#${filterId}) saturate(${v.saturation})`
    : `blur(${v.fallbackBlur}px) saturate(${v.saturation})`;

  const e = v.edgeWidth;
  const edge = [
    `inset 0 0 0 1px ${colors.glass.rim}`,
    `inset ${e}px ${e}px ${e / 2}px -${e}px ${colors.glass.edgeLight}`,
    `inset -${e}px -${e}px ${e / 2}px -${e}px ${colors.glass.edgeShade}`,
    colors.glass.shadow,
  ].join(", ");

  const layer = {
    position: "absolute",
    inset: 0,
    borderRadius: "inherit",
    pointerEvents: "none",
  } as const;

  return (
    <>
      <span
        aria-hidden="true"
        data-glass-path={refract ? "refraction" : "fallback"}
        style={{
          ...layer,
          overflow: "hidden",
          backdropFilter: backdrop,
          WebkitBackdropFilter: backdrop,
          background: `rgba(${colors.glass.tintRgb}, ${v.backgroundOpacity})`,
        }}
      />
      <span aria-hidden="true" style={{ ...layer, boxShadow: edge }} />

      {refract && (
        <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }}>
          <filter
            id={filterId}
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05 0.05"
              numOctaves="1"
              seed="1"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="softNoise"
              scale={v.refraction}
              xChannelSelector="R"
              yChannelSelector="B"
              result="bent"
            />
            <feGaussianBlur in="bent" stdDeviation="2" />
          </filter>
        </svg>
      )}
    </>
  );
}
