"use client";

// Dev-only Leva panel for the hero scene. Dynamically imported behind
// DEV_TUNING, so neither this file nor Leva reaches a production bundle.
//
// It only ever *writes* to the scene store. The committed values in
// scene-controls.ts stay the source of truth — use "copy values" and paste the
// result back there to make a change stick.

import { button, folder, useControls } from "leva";
import { useEffect } from "react";
import {
  APPROVED_SCENE,
  formatSceneValues,
  setSceneValues,
  type SceneValues,
} from "./scene-controls";

const LIGHT_RANGE = { min: 0, max: 4, step: 0.05 };

export default function SceneTuner() {
  const values = useControls({
    Lighting: folder({
      ambient: { value: APPROVED_SCENE.ambient, ...LIGHT_RANGE },
      key: { value: APPROVED_SCENE.key, ...LIGHT_RANGE },
      rim: { value: APPROVED_SCENE.rim, ...LIGHT_RANGE },
      envMapIntensity: { value: APPROVED_SCENE.envMapIntensity, ...LIGHT_RANGE },
      ao: { value: APPROVED_SCENE.ao, min: 0, max: 2, step: 0.05 },
    }),
    Stage: folder({
      background: { value: APPROVED_SCENE.background },
      fogNear: { value: APPROVED_SCENE.fogNear, min: 0, max: 60, step: 0.5 },
      fogFar: { value: APPROVED_SCENE.fogFar, min: 1, max: 160, step: 0.5 },
      centerPull: { value: APPROVED_SCENE.centerPull, min: 0, max: 2, step: 0.01 },
    }),
    Balloon: folder({
      opacity: { value: APPROVED_SCENE.opacity, min: 0.3, max: 1, step: 0.01 },
      edgeOpacity: { value: APPROVED_SCENE.edgeOpacity, min: 0.3, max: 1, step: 0.01, label: "edge opacity" },
      fresnelPower: { value: APPROVED_SCENE.fresnelPower, min: 0.5, max: 8, step: 0.1, label: "fresnel falloff" },
    }),
    Palette: folder({
      hue1: { value: APPROVED_SCENE.palette[0], label: "1 lavender" },
      hue2: { value: APPROVED_SCENE.palette[1], label: "2 baby blue" },
      hue3: { value: APPROVED_SCENE.palette[2], label: "3 mint" },
      hue4: { value: APPROVED_SCENE.palette[3], label: "4 blush" },
      hue5: { value: APPROVED_SCENE.palette[4], label: "5 peach" },
      hue6: { value: APPROVED_SCENE.palette[5], label: "6 butter" },
    }),
    "copy values": button(async (get) => {
      const snapshot: SceneValues = {
        ambient: get("Lighting.ambient"),
        key: get("Lighting.key"),
        rim: get("Lighting.rim"),
        envMapIntensity: get("Lighting.envMapIntensity"),
        ao: get("Lighting.ao"),
        background: get("Stage.background"),
        fogNear: get("Stage.fogNear"),
        fogFar: get("Stage.fogFar"),
        centerPull: get("Stage.centerPull"),
        palette: [1, 2, 3, 4, 5, 6].map((n) => get(`Palette.hue${n}`)),
        opacity: get("Balloon.opacity"),
        edgeOpacity: get("Balloon.edgeOpacity"),
        fresnelPower: get("Balloon.fresnelPower"),
      };
      const code = formatSceneValues(snapshot);
      try {
        await navigator.clipboard.writeText(code);
        console.info("[SceneTuner] values copied to clipboard\n" + code);
      } catch {
        // Clipboard needs a secure context and focus; the log is the fallback.
        console.info("[SceneTuner] clipboard unavailable — copy from here:\n" + code);
      }
    }),
  });

  useEffect(() => {
    setSceneValues({
      ambient: values.ambient,
      key: values.key,
      rim: values.rim,
      envMapIntensity: values.envMapIntensity,
      ao: values.ao,
      background: values.background,
      fogNear: values.fogNear,
      fogFar: values.fogFar,
      centerPull: values.centerPull,
      opacity: values.opacity,
      edgeOpacity: values.edgeOpacity,
      fresnelPower: values.fresnelPower,
      palette: [
        values.hue1,
        values.hue2,
        values.hue3,
        values.hue4,
        values.hue5,
        values.hue6,
      ],
    });
  }, [values]);

  return null;
}
