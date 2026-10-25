"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { spherePalette } from "@/lib/tokens";
import { useSceneValues } from "./scene-controls";
import {
  ANGULAR_DAMPING,
  BOUNDS_X,
  BOUNDS_Y,
  BOUNDS_Z,
  CONTAINMENT_GAIN,
  FRICTION,
  LINEAR_DAMPING,
  RESTITUTION,
  type SphereInstance,
  buildInstances,
} from "./sphere-scene";

type Props = {
  count: number;
  /** Reduced-motion path: no physics, one static frame. */
  frozen: boolean;
};

const PALETTE = spherePalette.map((hex) => new THREE.Color(hex));

/** Dev tuning writes into PALETTE in place; the ring length is fixed at 6. */
function syncPalette(hexes: readonly string[]): void {
  for (let i = 0; i < PALETTE.length; i++) PALETTE[i].set(hexes[i % hexes.length]);
}

function paletteColorAt(phase: number, out: THREE.Color): THREE.Color {
  const ring = ((phase % 1) + 1) % 1 * PALETTE.length;
  const index = Math.floor(ring);
  const t = ring - index;
  return out
    .copy(PALETTE[index % PALETTE.length])
    .lerp(PALETTE[(index + 1) % PALETTE.length], t * t * (3 - 2 * t));
}

// Each sphere carries a second instanced colour and blends to it across its own
// local Y axis, giving a soft two-hue gradient per ball. Physics slowly rotates
// the bodies, so the gradient directions drift apart instead of lining up.
const GRADIENT_CACHE_KEY = () => "hero-sphere-gradient";

function writeColors(
  mesh: THREE.InstancedMesh,
  attribute: THREE.InstancedBufferAttribute,
  seeds: SphereInstance[],
  time: number,
  scratch: THREE.Color,
) {
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const phase = seed.huePhase + time / seed.huePeriod;

    mesh.setColorAt(i, paletteColorAt(phase, scratch));

    paletteColorAt(phase + seed.huePair, scratch);
    attribute.setXYZ(i, scratch.r, scratch.g, scratch.b);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  attribute.needsUpdate = true;
}

function applyGradientShader(shader: { vertexShader: string; fragmentShader: string }) {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
      attribute vec3 aColorB;
      varying vec3 vGradColor;
      varying float vGradMix;`,
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vGradColor = aColorB;
      vGradMix = clamp( position.y * 0.5 + 0.5, 0.0, 1.0 );`,
    );

  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
      varying vec3 vGradColor;
      varying float vGradMix;`,
    )
    // color_fragment has just folded in instanceColor (hue A); blend toward B
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      diffuseColor.rgb = mix( diffuseColor.rgb, vGradColor, smoothstep( 0.0, 1.0, vGradMix ) );`,
    );
}

export default function SphereField({ count, frozen }: Props) {
  const bodiesRef = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scratch = useRef(new THREE.Color());
  const scene = useSceneValues();

  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);

  // Dev tuning only: recolour the palette ring in place and redraw. In
  // production scene.palette is the frozen approved array, so this runs once
  // with the same values PALETTE already holds.
  useEffect(() => {
    syncPalette(scene.palette);
    invalidate();
  }, [scene.palette, invalidate]);

  // Built once on mount: the seeded unit-ball layout scaled to the viewport.
  // Deliberately not recomputed on resize — that would restart the simulation.
  const [{ seeds, instances, colorBArray }] = useState(() => {
    const built = buildInstances(count);
    const bx = Math.max(viewport.width, 1) * BOUNDS_X;
    const by = Math.max(viewport.height, 1) * BOUNDS_Y;

    return {
      seeds: built,
      colorBArray: new Float32Array(built.length * 3),
      instances: built.map<InstancedRigidBodyProps>((seed, i) => ({
        key: i,
        position: [
          seed.position[0] * bx,
          seed.position[1] * by,
          seed.position[2] * BOUNDS_Z,
        ],
        scale: [seed.radius, seed.radius, seed.radius],
      })),
    };
  });

  const colorB = useRef<THREE.InstancedBufferAttribute>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !colorB.current) return;

    writeColors(mesh, colorB.current, seeds, 0, scratch.current);
    invalidate();
  }, [seeds, invalidate]);

  // Without physics driving them, the static path writes its matrices by hand.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!frozen || !mesh) return;

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();

    instances.forEach((instance, i) => {
      const p = instance.position as [number, number, number];
      const s = instance.scale as [number, number, number];
      mesh.setMatrixAt(i, matrix.compose(position.set(...p), quaternion, scale.set(...s)));
    });
    mesh.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [frozen, instances, invalidate]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const time = state.clock.elapsedTime;

    if (mesh && colorB.current) {
      writeColors(mesh, colorB.current, seeds, time, scratch.current);
    }

    const bodies = bodiesRef.current;
    if (frozen || !bodies) return;

    // Soft ellipsoidal pull toward the centre, stiffening past the bounds, so
    // the cluster holds its shape without ever collapsing into a tight ball.
    const bx = Math.max(state.viewport.width, 1) * BOUNDS_X;
    const by = Math.max(state.viewport.height, 1) * BOUNDS_Y;
    const dt = Math.min(delta, 1 / 30);

    for (const body of bodies) {
      const p = body.translation();
      const nx = p.x / bx;
      const ny = p.y / by;
      const nz = p.z / BOUNDS_Z;
      const n = Math.sqrt(nx * nx + ny * ny + nz * nz);

      const pull = scene.centerPull;
      const gain = n > 1 ? pull + (n - 1) * CONTAINMENT_GAIN : pull;
      const k = -body.mass() * gain * dt;

      body.applyImpulse({ x: k * nx, y: k * ny, z: k * nz }, true);
    }
  });

  const mesh = (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 64, 48]}>
        {/* Attached declaratively so it lands on this geometry — setting it
            imperatively races R3F attaching the geometry to the mesh, and a
            missing attribute reads as black in the shader. */}
        <instancedBufferAttribute
          ref={colorB}
          attach="attributes-aColorB"
          args={[colorBArray, 3]}
        />
      </sphereGeometry>
      {/* APPROVED LOOK (5ece2e2) — envMapIntensity is the scene's main soft
          light. Lowering it flattens the spheres and tempts a key-light
          increase, which is exactly what made them muddy. */}
      <meshPhysicalMaterial
        onBeforeCompile={applyGradientShader}
        customProgramCacheKey={GRADIENT_CACHE_KEY}
        roughness={0.52}
        metalness={0}
        clearcoat={0.25}
        clearcoatRoughness={0.55}
        sheen={0.9}
        sheenRoughness={0.6}
        envMapIntensity={scene.envMapIntensity}
      />
    </instancedMesh>
  );

  if (frozen) return mesh;

  return (
    <InstancedRigidBodies
      ref={bodiesRef}
      instances={instances}
      colliders="ball"
      linearDamping={LINEAR_DAMPING}
      angularDamping={ANGULAR_DAMPING}
      restitution={RESTITUTION}
      friction={FRICTION}
    >
      {mesh}
    </InstancedRigidBodies>
  );
}
