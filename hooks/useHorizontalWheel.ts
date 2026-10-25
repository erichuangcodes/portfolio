import { useEffect, useRef, type RefObject } from "react";

/** A new wheel stream starts after this long without wheel events. */
const WHEEL_IDLE_MS = 140;
const LINE_HEIGHT_PX = 16;

type HorizontalWheelOptions = {
  /** Horizontal travel in px for each event of a horizontal stream. */
  onDelta: (dx: number) => void;
  /** Called once a horizontal stream goes idle. */
  onEnd: () => void;
};

/**
 * Turns horizontal trackpad swipes over `ref` into deltas, without ever
 * trapping vertical page scroll.
 *
 * Each wheel stream is locked to the axis of its first event. Vertical
 * streams are left alone, so the page (and Lenis on `window`) scrolls as
 * usual. Horizontal streams are consumed: `preventDefault` stops the browser's
 * back-swipe and overscroll, and `stopPropagation` keeps them from Lenis.
 */
export function useHorizontalWheel(
  ref: RefObject<HTMLElement | null>,
  { onDelta, onEnd }: HorizontalWheelOptions,
): void {
  const onDeltaRef = useRef(onDelta);
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onDeltaRef.current = onDelta;
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let axis: "x" | "y" | null = null;
    let idleTimer: number | undefined;

    const endStream = () => {
      idleTimer = undefined;
      const wasHorizontal = axis === "x";
      axis = null;
      if (wasHorizontal) onEndRef.current();
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom
      const scale =
        e.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? LINE_HEIGHT_PX
          : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? el.clientWidth
            : 1;
      const dx = e.deltaX * scale;
      const dy = e.deltaY * scale;

      if (axis === null) axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(endStream, WHEEL_IDLE_MS);

      if (axis !== "x") return;
      e.preventDefault();
      e.stopPropagation();
      onDeltaRef.current(dx);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      window.clearTimeout(idleTimer);
    };
  }, [ref]);
}
