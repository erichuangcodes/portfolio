"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { DepthOfField, EffectComposer, N8AO } from "@react-three/postprocessing";
import { Physics } from "@react-three/rapier";
import { useInView, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/tokens";
import CursorRepeller from "./CursorRepeller";
import SphereField from "./SphereField";
import { DEV_TUNING, useSceneValues } from "./scene-controls";
import { buildEnvironment } from "./sphere-environment";
import { CAMERA, sphereCountForViewport } from "./sphere-scene";

// Dev-only Leva panel. DEV_TUNING is statically false in production, so this
// import is dropped and Leva never ships.
const SceneTuner = DEV_TUNING
  ? dynamic(() => import("./SceneTuner"), { ssr: false, loading: () => null })
  : null;

function Atmosphere() {
  const gl = useThree((state) => state.gl);
  const get = useThree((state) => state.get);
  const scene = useSceneValues();

  // Built and disposed in the same effect. A useMemo + cleanup pair breaks
  // under React Strict Mode (dev only): the cleanup disposes the target, the
  // remount reuses the disposed one, and the env map silently goes dark in
  // dev while working in production.
  useEffect(() => {
    const environment = buildEnvironment(gl);
    const { scene: threeScene, invalidate } = get();
    threeScene.environment = environment.texture;
    invalidate();
    return () => {
      threeScene.environment = null;
      environment.dispose();
    };
  }, [gl, get]);

  // The env map comes from scene.environment, whose strength is
  // scene.environmentIntensity. A material's envMapIntensity only applies to
  // its own envMap, so it would have no effect here.
  useEffect(() => {
    const { scene: threeScene, invalidate } = get();
    threeScene.environmentIntensity = scene.envMapIntensity;
    invalidate();
  }, [get, scene.envMapIntensity]);

  return (
    <>
      <color attach="background" args={[scene.background]} />
      <fog attach="fog" args={[scene.background, scene.fogNear, scene.fogFar]} />
      {/* ───────────────────────────────────────────────────────────────────
          APPROVED LOOK — the values from commit 5ece2e2, confirmed by the user
          on a real GPU. Do not re-tune without being asked.

          These look high but are not: three divides diffuse by PI and does not
          pre-scale irradiance, so an intensity near PI renders a surface at its
          true albedo.

          A high ambient against a soft key is the whole point. The env map
          (SphereField's envMapIntensity) supplies most of the modelling, so the
          directionals only need to round the spheres off. Raising the key to
          "add contrast" is what produces the dusty rose/olive/rust look that
          was rejected — the key stacks on top of the env map and drives the
          shadow sides down into mud.

          Cannot be judged from a headless capture: under SwiftShader the env
          map contributes nothing, so a software screenshot of this setup looks
          under-lit and invites exactly the wrong correction.
          ─────────────────────────────────────────────────────────────────── */}
      <ambientLight intensity={scene.ambient} />
      {/* Soft key: the off-white stage supplies the contrast, so the spheres
          only need enough directional light to round them off. */}
      <directionalLight position={[-7, 9, 7]} intensity={scene.key} color={colors.scene.key} />
      {/* Rim from behind, aimed back at the camera — puts a bright edge on each
          silhouette so spheres separate from the stage. */}
      <directionalLight position={[3, -2, -9]} intensity={scene.rim} color={colors.scene.rim} />
    </>
  );
}

type Props = {
  /** Stop rendering (e.g. while the hero is shrunk to a speck). */
  paused?: boolean;
};

export default function HeroSpheres({ paused = false }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scene = useSceneValues();
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
        background: scene.background,
        // Match the card's animated corners and clip the canvas to them, so the
        // square canvas never pokes out past the rounded edge.
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    >
      {SceneTuner ? <SceneTuner /> : null}
      <Canvas
        frameloop={frozen ? "demand" : inView && !paused ? "always" : "never"}
        dpr={[1, 2]}
        camera={CAMERA}
        // Default measurement is debounced and scroll-aware, which lets the
        // very first paint keep a stale size until something resizes the
        // window. The scene must be correct on load, so measure immediately.
        //
        // offsetSize switches react-use-measure from getBoundingClientRect to
        // offsetWidth/offsetHeight. Required here: the hero card carries a
        // scroll-linked `scale`, and a bounding rect reports the *scaled* box,
        // so a measurement taken at any scale below 1 sizes the canvas smaller
        // than the card and leaves a bare strip down the bottom and right.
        // Offset sizes ignore transforms.
        resize={{ scroll: false, debounce: 0, offsetSize: true }}
        // `flat` = NoToneMapping. R3F forces ACES otherwise, and ACES is built
        // for HDR film: it desaturates bright colours toward khaki and turns
        // these pastels muddy. Untonemapped, each sphere renders the colour it
        // was authored as, so the lights above stay near 1.0 to avoid clipping.
        // (Setting gl.toneMapping directly does not work — R3F overwrites it.)
        flat
        gl={{
          // Covers the direct-render path (phones and reduced motion skip the
          // composer); the composer has its own multisampling below.
          antialias: true,
          powerPreference: "high-performance",
          }}
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
          <EffectComposer multisampling={4}>
            {/* APPROVED LOOK — contact shadows where spheres meet, so the
                cluster reads as separate objects instead of one flat mass.
                intensity 0.45 with the warm `ao` tint is the approved level;
                1.2 was tried and is too heavy, and removing the pass entirely
                flattens the cluster. */}
            <N8AO
              aoRadius={1.6}
              distanceFalloff={1.0}
              intensity={scene.ao}
              color={colors.scene.ao}
              quality="medium"
              halfRes
            />
            <DepthOfField target={[0, 0, 0]} focalLength={0.08} bokehScale={1.1} height={480} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
