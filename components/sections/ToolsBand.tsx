"use client";

// Sliding band of tool logos between About and Projects. Content comes from
// `about.tools` in lib/about.ts. Pure CSS transform animation: the list is
// rendered twice and the track slides by exactly half its width, so the loop
// has no seam.

import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  siArduino,
  siAutocad,
  siCoreldraw,
  siCplusplus,
  siDavinciresolve,
  siJavascript,
  siLvgl,
  siNodedotjs,
  siPython,
  siQmk,
  siReact,
} from "simple-icons";
import { about, type AboutTool } from "@/lib/about";
import { colors, easing } from "@/lib/tokens";

type Icon = { title: string; path: string };

// Named imports keep the bundle to these icons only (the full set is ~3k).
const ICONS: Record<string, Icon> = {
  arduino: siArduino,
  autocad: siAutocad,
  coreldraw: siCoreldraw,
  cplusplus: siCplusplus,
  davinciresolve: siDavinciresolve,
  javascript: siJavascript,
  lvgl: siLvgl,
  nodedotjs: siNodedotjs,
  python: siPython,
  qmk: siQmk,
  react: siReact,
};

/** Seconds per item for one pass, so speed stays steady as the list changes. */
const SECONDS_PER_ITEM = 1.8;

export default function ToolsBand() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const { heading, items } = about.tools;
  const duration = `${(items.length * SECONDS_PER_ITEM).toFixed(1)}s`;

  return (
    // Sits inside the Projects section, so the parent owns spacing and background.
    <div role="group" aria-label={heading ?? "Tools"} style={{ marginTop: "5rem" }}>
      {heading && (
        <p
          className="text-eyebrow"
          style={{ color: colors.text.muted, margin: "0 0 1.5rem", paddingLeft: "8%", paddingRight: "8%" }}
        >
          {heading}
        </p>
      )}

      <div ref={ref} className="tools-band" data-playing={inView ? "true" : "false"}>
        <div className="tools-track" style={{ animationDuration: duration }}>
          <ToolList items={items} />
          {/* Second copy fills the gap as the first slides out. */}
          <ToolList items={items} hidden />
        </div>
      </div>

      <style>{`
        .tools-band {
          --tool-size: 48px;
          --tool-gap: 4rem;
          /* About 10 logos visible at once, centred rather than full-bleed. */
          width: min(100%, calc(10 * (var(--tool-size) + var(--tool-gap))));
          margin: 0 auto;
          overflow: hidden;
          padding: 0.5rem 0 1.75rem;
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent);
        }
        .tools-track {
          display: flex;
          width: max-content;
          animation-name: tools-slide;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .tools-band:hover .tools-track,
        .tools-band[data-playing="false"] .tools-track { animation-play-state: paused; }
        @keyframes tools-slide {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .tools-list { display: flex; align-items: center; margin: 0; padding: 0; list-style: none; }
        .tool {
          position: relative;
          display: flex;
          align-items: center;
          height: var(--tool-size);
          padding: 0 calc(var(--tool-gap) / 2);
          color: ${colors.accent.primary};
        }
        .tool-mark {
          display: flex;
          align-items: center;
          opacity: 0.42;
          transition: opacity 300ms ${easing.swift};
        }
        .tool-mark svg { width: var(--tool-size); height: var(--tool-size); display: block; fill: currentColor; }
        .tool-text {
          font-family: var(--font-geist-sans);
          font-weight: 600;
          font-size: calc(var(--tool-size) * 0.5);
          letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .tool-name {
          position: absolute;
          left: 50%;
          top: calc(100% + 0.5rem);
          transform: translate(-50%, -4px);
          font-family: var(--font-geist-sans);
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          color: ${colors.accent.text};
          opacity: 0;
          pointer-events: none;
          transition: opacity 250ms ${easing.swift}, transform 250ms ${easing.swift};
        }
        .tool:hover .tool-mark { opacity: 1; }
        .tool:hover .tool-name { opacity: 1; transform: translate(-50%, 0); }

        @media (max-width: 767px) {
          .tools-band { --tool-size: 32px; --tool-gap: 2.5rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tools-track { animation: none; }
          .tools-list[aria-hidden="true"] { display: none; }
        }
      `}</style>
    </div>
  );
}

function ToolList({ items, hidden = false }: { items: readonly AboutTool[]; hidden?: boolean }) {
  return (
    <ul className="tools-list" aria-hidden={hidden || undefined}>
      {items.map((tool) => {
        const icon = tool.icon ? ICONS[tool.icon] : undefined;
        return (
          <li key={tool.name} className="tool" aria-label={hidden ? undefined : tool.name}>
            <span className="tool-mark" aria-hidden="true">
              {icon ? (
                <svg viewBox="0 0 24 24" role="img">
                  <path d={icon.path} />
                </svg>
              ) : (
                <span className="tool-text">{tool.name}</span>
              )}
            </span>
            {icon && (
              <span className="tool-name" aria-hidden="true">
                {tool.name}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
