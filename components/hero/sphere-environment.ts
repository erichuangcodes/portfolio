import * as THREE from "three";
import { colors } from "@/lib/tokens";

type Panel = {
  color: string;
  intensity: number;
  size: [number, number];
  position: [number, number, number];
};

// A dark room with two soft light panels. Prebaked into an env map so the
// spheres get real reflections without fetching an external HDRI.
const PANELS: Panel[] = [
  { color: colors.scene.key, intensity: 3.2, size: [14, 14], position: [-9, 11, 8] },
  { color: colors.scene.rim, intensity: 0.9, size: [16, 10], position: [11, -4, -9] },
  { color: colors.scene.key, intensity: 0.35, size: [20, 20], position: [0, -14, 0] },
];

/** Caller owns the returned target and must dispose it. */
export function buildEnvironment(gl: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const room = new THREE.Scene();
  room.background = new THREE.Color(colors.scene.bg);

  const meshes = PANELS.map(({ color, intensity, size, position }) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size[0], size[1]),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.set(position[0], position[1], position[2]);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
    return mesh;
  });

  const pmrem = new THREE.PMREMGenerator(gl);
  const target = pmrem.fromScene(room, 0.06);
  pmrem.dispose();

  for (const mesh of meshes) {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }

  return target;
}
