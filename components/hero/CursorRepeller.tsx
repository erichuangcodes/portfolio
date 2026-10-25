"use client";

import { useFrame, useThree } from "@react-three/fiber";
import {
  BallCollider,
  RigidBody,
  type RapierCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { heroDebug } from "./hero-debug";

// ─── Cursor feel, ported from the data-rain reference ─────────────────────────
// data-rain bakes its coefficients for a fixed 1/60 step (K = 1-exp(-STEP*rate)).
// These are the same continuous-time rates evaluated against the real frame
// delta, so the response is identical but no longer tied to 60fps.
const CURSOR_RATE = 18; // position lerp, ~55ms
const VELOCITY_RATE = 10; // velocity smoothing, 100ms
const INFLUENCE_ATTACK = 1 / 0.06; // ramps in over 60ms
const INFLUENCE_RELEASE = 1 / 0.2; // and out over 200ms, so the cluster settles back
const SNAP_INFLUENCE = 0.05;

// Radius grows with cursor speed, in the reference's pixel units
const BASE_RADIUS_PX = 64;
const RADIUS_SPEED_GAIN = 0.025;
const RADIUS_SPEED_CAP_PX = 36;

const IDLE_INFLUENCE = 0.01;
const PARKED_Z = -400;

// Per-frame scratch, held in a ref so the frame callback has a stable mutable
// home rather than reallocating vectors every tick.
function createScratch() {
  return {
    plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    raycaster: new THREE.Raycaster(),
    ndc: new THREE.Vector2(),
    target: new THREE.Vector3(),
    current: new THREE.Vector3(),
    previous: new THREE.Vector3(),
    instant: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
  };
}

export default function CursorRepeller() {
  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderRef = useRef<RapierCollider>(null);
  const domElement = useThree((state) => state.gl.domElement);

  const pointer = useRef({ active: false, x: 0, y: 0 });
  const prevActive = useRef(false);
  const influence = useRef(0);

  const scratchRef = useRef(createScratch());

  useEffect(() => {
    // Window-level listeners: the canvas is pointerEvents:none so the hero
    // content keeps its own hover handlers. Covers touch via pointer events.
    const onMove = (event: PointerEvent) => {
      heroDebug.pointerEvents++; // TEMPORARY debug
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      pointer.current.active = true;
    };
    const onRelease = () => {
      pointer.current.active = false;
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") onRelease();
    };
    const onVisibility = () => {
      if (document.hidden) onRelease();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onRelease, { passive: true });
    window.addEventListener("blur", onRelease);
    document.documentElement.addEventListener("pointerleave", onRelease);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onRelease);
      window.removeEventListener("blur", onRelease);
      document.documentElement.removeEventListener("pointerleave", onRelease);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useFrame((state, delta) => {
    // TEMPORARY debug (dev only).
    const dbgBody = bodyRef.current?.translation();
    if (dbgBody) heroDebug.cursorBody = [dbgBody.x, dbgBody.y, dbgBody.z];
    heroDebug.cursorInfluence = influence.current;

    const body = bodyRef.current;
    const collider = colliderRef.current;
    if (!body || !collider) return;

    const dt = Math.max(delta, 1e-4);
    const active = pointer.current.active;
    const { plane, raycaster, ndc, target, current, previous, instant, velocity } =
      scratchRef.current;

    if (active) {
      const rect = domElement.getBoundingClientRect();
      ndc.x = ((pointer.current.x - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((pointer.current.y - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(ndc, state.camera);
      raycaster.ray.intersectPlane(plane, target);

      // Snap on acquire, so a re-entering cursor doesn't sweep across the
      // cluster from wherever it was parked.
      if (!prevActive.current && influence.current < SNAP_INFLUENCE) {
        current.copy(target);
        velocity.set(0, 0, 0);
      } else {
        previous.copy(current);
        current.lerp(target, 1 - Math.exp(-dt * CURSOR_RATE));
        instant.subVectors(current, previous).divideScalar(dt);
        velocity.lerp(instant, 1 - Math.exp(-dt * VELOCITY_RATE));
      }
    }
    prevActive.current = active;

    const rate = active ? INFLUENCE_ATTACK : INFLUENCE_RELEASE;
    influence.current += ((active ? 1 : 0) - influence.current) * (1 - Math.exp(-dt * rate));

    const worldPerPx = state.viewport.width / Math.max(state.size.width, 1);
    const speedPx = velocity.length() / worldPerPx;
    const radiusPx =
      BASE_RADIUS_PX + Math.min(speedPx * RADIUS_SPEED_GAIN, RADIUS_SPEED_CAP_PX);
    collider.setRadius(Math.max(radiusPx * worldPerPx * influence.current, 1e-3));

    if (influence.current < IDLE_INFLUENCE) {
      body.setNextKinematicTranslation({ x: 0, y: 0, z: PARKED_Z });
    } else {
      body.setNextKinematicTranslation({ x: current.x, y: current.y, z: 0 });
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[0, 0, PARKED_Z]}
    >
      <BallCollider ref={colliderRef} args={[1]} />
    </RigidBody>
  );
}
