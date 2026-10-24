"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { DepthOfField, EffectComposer } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { colors } from "@/lib/tokens";
import CursorRepeller from "./CursorRepeller";
import SphereField from "./SphereField";
import { buildEnvironment } from "./sphere-environment";
import { CAMERA, FOG_FAR, FOG_NEAR, sphereCountForViewport } from "./sphere-scene";

function Atmosphere() {
  const gl = useThree((state) => state.gl);
  const environment = useMemo(() => buildEnvironment(gl), [gl]);

  useEffect(() => () => environment.dispose(), [environment]);

  return (
    <>
      <primitive object={environment.texture} attach="environment" />
      <color attach="background" args={[colors.scene.bg]} />
      <fog attach="fog" args={[colors.scene.bg, FOG_NEAR, FOG_FAR]} />
      {/* ───────────────────────────────────────────────────────────────────
          APPROVED LOOK — do not soften without checking a render first.

          These look high but are not: three divides diffuse by PI and does not
          pre-scale irradiance, so an intensity near PI renders a surface at its
          true albedo. Dialling them toward "1.0" halves the pastels' brightness
          and they read as mud.

          The ratio matters as much as the level. A strong key against a low
          ambient is what keeps the pastels saturated; raising ambient and
          lowering the key flattens them into grey-browns (measured: saturation
          0.24 vs 0.70 for this setup).
          ─────────────────────────────────────────────────────────────────── */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[-7, 9, 7]} intensity={1.6} color={colors.scene.key} />
      {/* Rim from behind, aimed back at the camera — puts a bright edge on each
          silhouette so spheres separate from the stage. */}
      <directionalLight position={[3, -2, -9]} intensity={0.9} color={colors.scene.rim} />
    </>
  );
}

export default function HeroSpheres() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(wrapperRef, { margin: "100px" });

  const [{ count, postprocessing }] = useState(() => {
    const width = typeof window === "undefined" ? 1280 : window.innerWidth;
    return { count: sphereCountForViewport(width), postprocessing: width >= 768 };
  });

  const frozen = reduced === true;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: colors.scene.bg,
      }}
    >
      <Canvas
        frameloop={frozen ? "demand" : inView ? "always" : "never"}
        dpr={[1, 2]}
        camera={CAMERA}
        // Default measurement is debounced and scroll-aware, which lets the
        // very first paint keep a stale size until something resizes the
        // window. The scene must be correct on load, so measure immediately.
        resize={{ scroll: false, debounce: 0 }}
        // `flat` = NoToneMapping. R3F forces ACES otherwise, and ACES is built
        // for HDR film: it desaturates bright colours toward khaki and turns
        // these pastels muddy. Untonemapped, each sphere renders the colour it
        // was authored as, so the lights above stay near 1.0 to avoid clipping.
        // (Setting gl.toneMapping directly does not work — R3F overwrites it.)
        flat
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Atmosphere />

        {frozen ? (
          <SphereField count={count} frozen />
        ) : (
          <Physics gravity={[0, 0, 0]}>
            <SphereField count={count} frozen={false} />
            <CursorRepeller />
          </Physics>
        )}

        {!frozen && postprocessing && (
          <EffectComposer multisampling={0}>
            {/* APPROVED LOOK — no ambient occlusion pass. AO was tried at 1.2
                and 0.45: both darken every contact point, and with a cluster
                this dense that is most of the frame, which is what turned the
                pastels dusty. Depth of field alone gives the separation. */}
            <DepthOfField target={[0, 0, 0]} focalLength={0.08} bokehScale={1.1} height={480} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
