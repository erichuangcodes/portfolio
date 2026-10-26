// One-shot "the hero scene has drawn" signal, shared by the hero canvas and the
// loading screen. A flag plus listeners, so a listener that subscribes after
// the scene is already up still hears about it.

let ready = false;
const listeners = new Set<() => void>();

export function markHeroReady(): void {
  if (ready) return;
  ready = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

/** Calls `fn` once the hero is ready (immediately if it already is). Returns an unsubscribe. */
export function onHeroReady(fn: () => void): () => void {
  if (ready) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}
