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

function computeColors(
  colorA: Float32Array,
  colorB: Float32Array,
  seeds: SphereInstance[],
  time: number,
  scratch: THREE.Color,
) {
  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    const phase = seed.huePhase + time / seed.huePeriod;

    paletteColorAt(phase, scratch);
    colorA[i * 3] = scratch.r;
    colorA[i * 3 + 1] = scratch.g;
    colorA[i * 3 + 2] = scratch.b;

    paletteColorAt(phase + seed.huePair, scratch);
    colorB[i * 3] = scratch.r;
    colorB[i * 3 + 1] = scratch.g;
    colorB[i * 3 + 2] = scratch.b;
  }
}

// Balloon translucency. Shared uniforms, so tuning never recompiles the shader.
const BALLOON_UNIFORMS = {
  uOpacity: { value: 0.85 },
  uEdgeOpacity: { value: 1 },
  uFresnelPower: { value: 2.5 },
};

/**
 * Copies the physics mesh's instances into the draw mesh, farthest first.
 * three.js sorts transparent objects, not the instances inside one, so
 * without this a near sphere drawn before a far one hides it through depth
 * and the overlap reads as a hole instead of a see-through balloon.
 */
function writeSorted(
  source: THREE.InstancedMesh,
  target: THREE.InstancedMesh,
  colorBAttr: THREE.InstancedBufferAttribute,
  colorA: Float32Array,
  colorB: Float32Array,
  camera: THREE.Camera,
  order: number[],
  depth: Float32Array,
) {
  const src = source.instanceMatrix.array as Float32Array;
  const dst = target.instanceMatrix.array as Float32Array;
  const colA = target.instanceColor!.array as Float32Array;
  const colB = colorBAttr.array as Float32Array;
  const c = camera.position;
  const n = order.length;

  for (let i = 0; i < n; i++) {
    const dx = src[i * 16 + 12] - c.x;
    const dy = src[i * 16 + 13] - c.y;
    const dz = src[i * 16 + 14] - c.z;
    depth[i] = dx * dx + dy * dy + dz * dz;
  }
  order.sort((a, b) => depth[b] - depth[a]);

  for (let j = 0; j < n; j++) {
    const i = order[j];
    dst.set(src.subarray(i * 16, i * 16 + 16), j * 16);
    colA[j * 3] = colorA[i * 3];
    colA[j * 3 + 1] = colorA[i * 3 + 1];
    colA[j * 3 + 2] = colorA[i * 3 + 2];
    colB[j * 3] = colorB[i * 3];
    colB[j * 3 + 1] = colorB[i * 3 + 1];
    colB[j * 3 + 2] = colorB[i * 3 + 2];
  }
  target.instanceMatrix.needsUpdate = true;
  target.instanceColor!.needsUpdate = true;
  colorBAttr.needsUpdate = true;
}

function applyGradientShader(shader: {
  vertexShader: string;
  fragmentShader: string;
  uniforms: Record<string, { value: unknown }>;
}) {
  Object.assign(shader.uniforms, BALLOON_UNIFORMS);
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
      varying float vGradMix;
      uniform float uOpacity;
      uniform float uEdgeOpacity;
      uniform float uFresnelPower;`,
    )
    // color_fragment has just folded in instanceColor (hue A); blend toward B
    .replace(
      "#include <color_fragment>",
      `#include <color_fragment>
      diffuseColor.rgb = mix( diffuseColor.rgb, vGradColor, smoothstep( 0.0, 1.0, vGradMix ) );`,
    )
    // Balloon alpha: see-through in the middle, denser toward the rim
    // (fresnel). Specular highlights are kept opaque so they stay crisp.
    .replace(
      "#include <opaque_fragment>",
      `float balloonFacing = clamp( abs( dot( normalize( normal ), normalize( vViewPosition ) ) ), 0.0, 1.0 );
      float balloonEdge = pow( 1.0 - balloonFacing, uFresnelPower );
      float balloonSpec = dot( reflectedLight.directSpecular + reflectedLight.indirectSpecular, vec3( 0.299, 0.587, 0.114 ) );
      diffuseColor.a = max( mix( uOpacity, uEdgeOpacity, balloonEdge ), clamp( balloonSpec * 2.0, 0.0, 1.0 ) );
      #include <opaque_fragment>`,
    );
}

export default function SphereField({ count, frozen }: Props) {
  const bodiesRef = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const drawRef = useRef<THREE.InstancedMesh>(null);
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
  const [{ seeds, instances, colorBArray, colorASrc, colorBSrc, order, depth }] = useState(() => {
    const built = buildInstances(count);
    const bx = Math.max(viewport.width, 1) * BOUNDS_X;
    const by = Math.max(viewport.height, 1) * BOUNDS_Y;

    return {
      seeds: built,
      colorBArray: new Float32Array(built.length * 3),
      colorASrc: new Float32Array(built.length * 3),
      colorBSrc: new Float32Array(built.length * 3),
      order: built.map((_, i) => i),
      depth: new Float32Array(built.length),
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

  useEffect(() => {
    BALLOON_UNIFORMS.uOpacity.value = scene.opacity;
    BALLOON_UNIFORMS.uEdgeOpacity.value = scene.edgeOpacity;
    BALLOON_UNIFORMS.uFresnelPower.value = scene.fresnelPower;
    invalidate();
  }, [scene.opacity, scene.edgeOpacity, scene.fresnelPower, invalidate]);

  useLayoutEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;
    // Allocates instanceColor; writeSorted fills it every frame.
    draw.setColorAt(0, scratch.current.setRGB(1, 1, 1));
    invalidate();
  }, [invalidate]);

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
    const draw = drawRef.current;
    const time = state.clock.elapsedTime;

    if (mesh && draw && draw.instanceColor && colorB.current) {
      computeColors(colorASrc, colorBSrc, seeds, time, scratch.current);
      writeSorted(mesh, draw, colorB.current, colorASrc, colorBSrc, state.camera, order, depth);
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

  // Physics (or the frozen layout) writes into this mesh; it is never drawn.
  // Its radius-1 geometry is what the ball colliders are sized from.
  const mesh = (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      visible={false}
    >
      <sphereGeometry args={[1, 8, 6]} />
    </instancedMesh>
  );

  // What you actually see: the same instances, sorted back-to-front each frame.
  // treatAsOpaque keeps N8AO using these spheres for AO; they still write
  // depth, so AO sees their front surfaces exactly as before.
  const drawMesh = (
    <instancedMesh
      ref={drawRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
      userData={{ treatAsOpaque: true }}
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
      {/* APPROVED LOOK — lighting and colour values are unchanged; only the
          balloon alpha (opacity / edgeOpacity / fresnelPower) is new. */}
      <meshPhysicalMaterial
        onBeforeCompile={applyGradientShader}
        customProgramCacheKey={GRADIENT_CACHE_KEY}
        transparent
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

  if (frozen) {
    return (
      <>
        {mesh}
        {drawMesh}
      </>
    );
  }

  return (
    <>
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
      {drawMesh}
    </>
  );
}
