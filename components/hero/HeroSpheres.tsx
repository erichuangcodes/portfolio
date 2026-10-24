"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer } from "@react-three/postprocessing";
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
      <ambientLight intensity={0.02} />
      <directionalLight position={[-7, 9, 7]} intensity={1.6} color={colors.scene.key} />
      <directionalLight position={[8, -4, -7]} intensity={0.55} color={colors.scene.rim} />
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
            <DepthOfField target={[0, 0, 0]} focalLength={0.08} bokehScale={2.2} height={480} />
            <Bloom
              intensity={0.45}
              luminanceThreshold={0.55}
              luminanceSmoothing={0.25}
              mipmapBlur
              height={300}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
