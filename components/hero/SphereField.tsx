"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  InstancedRigidBodies,
  type InstancedRigidBodyProps,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useLayoutEffect, useRef, useState } from "react";
import * as THREE from "three";
import { spherePalette } from "@/lib/tokens";
import {
  ANGULAR_DAMPING,
  BOUNDS_X,
  BOUNDS_Y,
  BOUNDS_Z,
  CENTER_PULL,
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

function paletteColorAt(seed: SphereInstance, time: number, out: THREE.Color): THREE.Color {
  const ring = ((seed.huePhase + time / seed.huePeriod) % 1) * PALETTE.length;
  const index = Math.floor(ring);
  const t = ring - index;
  return out
    .copy(PALETTE[index % PALETTE.length])
    .lerp(PALETTE[(index + 1) % PALETTE.length], t * t * (3 - 2 * t));
}

export default function SphereField({ count, frozen }: Props) {
  const bodiesRef = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const scratch = useRef(new THREE.Color());

  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);

  // Built once on mount: the seeded unit-ball layout scaled to the viewport.
  // Deliberately not recomputed on resize — that would restart the simulation.
  const [{ seeds, instances }] = useState(() => {
    const built = buildInstances(count);
    const bx = Math.max(viewport.width, 1) * BOUNDS_X;
    const by = Math.max(viewport.height, 1) * BOUNDS_Y;

    return {
      seeds: built,
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

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < seeds.length; i++) {
      mesh.setColorAt(i, paletteColorAt(seeds[i], 0, scratch.current));
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
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

    if (mesh) {
      for (let i = 0; i < seeds.length; i++) {
        mesh.setColorAt(i, paletteColorAt(seeds[i], time, scratch.current));
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
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

      const gain = n > 1 ? CENTER_PULL + (n - 1) * CONTAINMENT_GAIN : CENTER_PULL;
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
      <sphereGeometry args={[1, 28, 18]} />
      <meshPhysicalMaterial
        roughness={0.52}
        metalness={0}
        clearcoat={0.25}
        clearcoatRoughness={0.55}
        sheen={0.9}
        sheenRoughness={0.6}
        envMapIntensity={0.35}
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
