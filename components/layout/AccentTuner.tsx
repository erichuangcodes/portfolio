"use client";

// Dev-only Leva folder for the site accent. It overrides --accent on <html>
// live; --accent-soft and --accent-text derive from it in CSS. Production
// never mounts this, so it uses the default in app/globals.css (:root).

import { button, folder, useControls } from "leva";
import { useEffect, useRef } from "react";

/** Must match --accent in app/globals.css. */
const APPROVED_ACCENT = "#6e56f8";

const PRESETS = {
  Iris: "#6e56f8",
  Cobalt: "#2f5bff",
  Coral: "#ff6b4a",
  Ink: "#1a1a2e",
} as const;

export default function AccentTuner() {
  const setRef = useRef<(v: { accent: string }) => void>(() => {});

  const [values, set] = useControls(() => ({
    Accent: folder({
      accent: { value: APPROVED_ACCENT },
      ...Object.fromEntries(
        Object.entries(PRESETS).map(([name, hex]) => [
          `${name} ${hex}`,
          button(() => setRef.current({ accent: hex })),
        ]),
      ),
      "copy accent value": button(async (get) => {
        const now = String(get("Accent.accent")).slice(0, 7).toLowerCase();
        const code = [
          "/* Accent from the dev tuning panel. app/globals.css, :root: */",
          `  --accent: ${now};${now === APPROVED_ACCENT ? "" : `   /* was ${APPROVED_ACCENT} */`}`,
        ].join("\n");
        try {
          await navigator.clipboard.writeText(code);
          console.info("[AccentTuner] value copied to clipboard\n" + code);
        } catch {
          console.info("[AccentTuner] clipboard unavailable — copy from here:\n" + code);
        }
      }),
    }),
  }));

  useEffect(() => {
    setRef.current = set;
  }, [set]);

  useEffect(() => {
    // Leva's colour picker can return 8-digit hex; CSS accepts it, but keep
    // the opaque form so the derived colours stay predictable.
    const hex = String(values.accent).slice(0, 7);
    const root = document.documentElement;
    root.style.setProperty("--accent", hex);
    return () => {
      root.style.removeProperty("--accent");
    };
  }, [values.accent]);

  return null;
}
