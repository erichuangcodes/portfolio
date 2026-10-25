"use client";

import { useInView } from "framer-motion";
import { Music } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { colors, easing, spherePalette } from "@/lib/tokens";

const BAR_COUNT = 30;
const BAR_WIDTH = 3;
const BAR_GAP = 3;
const ROW_WIDTH = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP;

// Seeded so server and client render the same bars.
function barTiming(i: number) {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * n) * 10000;
    return x - Math.floor(x);
  };
  return {
    duration: 0.7 + r(12.9898) * 0.9,
    delay: -r(78.233) * 1.6,
    rest: 0.25 + r(37.719) * 0.35,
  };
}

const PALETTE_GRADIENT = `linear-gradient(90deg, ${spherePalette.join(", ")})`;

type Song = { title: string; artist: string; albumArt: string | null };

export default function MusicWidget({ song }: { song: Song }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "1rem",
        padding: "0.875rem",
        borderRadius: "16px",
        background: colors.bg.primary,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "56px",
          height: "56px",
          flexShrink: 0,
          borderRadius: "10px",
          overflow: "hidden",
          background: `${spherePalette[0]}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: colors.text.secondary,
        }}
      >
        {song.albumArt ? (
          <Image src={song.albumArt} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
        ) : (
          <Music size={20} strokeWidth={1.5} aria-hidden="true" />
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p className="text-eyebrow" style={{ margin: 0, color: colors.text.muted, fontSize: "0.8125rem" }}>
          On repeat lately
        </p>
        <p
          style={{
            margin: "0.125rem 0 0",
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: colors.text.primary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: colors.text.muted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {song.artist}
        </p>
      </div>

      <div
        aria-hidden="true"
        className="eq"
        data-playing={inView ? "true" : "false"}
        style={{
          display: "flex",
          alignItems: "center",
          gap: `${BAR_GAP}px`,
          height: "36px",
          flexShrink: 0,
        }}
      >
        {Array.from({ length: BAR_COUNT }, (_, i) => {
          const t = barTiming(i);
          return (
            <span
              key={i}
              className="eq-bar"
              style={{
                width: `${BAR_WIDTH}px`,
                height: "100%",
                borderRadius: "9999px",
                backgroundImage: PALETTE_GRADIENT,
                backgroundSize: `${ROW_WIDTH}px 100%`,
                backgroundPosition: `-${i * (BAR_WIDTH + BAR_GAP)}px 0`,
                transform: `scaleY(${t.rest})`,
                animationDuration: `${t.duration.toFixed(2)}s`,
                animationDelay: `${t.delay.toFixed(2)}s`,
              }}
            />
          );
        })}
      </div>

      <style>{`
        .eq-bar {
          transform-origin: 50% 50%;
          animation-name: eq-bounce;
          animation-iteration-count: infinite;
          animation-direction: alternate;
          animation-timing-function: ${easing.swift};
          will-change: transform;
        }
        .eq[data-playing="false"] .eq-bar { animation-play-state: paused; }
        @keyframes eq-bounce {
          0% { transform: scaleY(0.18); }
          100% { transform: scaleY(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .eq-bar { animation: none; will-change: auto; }
        }
        @media (max-width: 479px) {
          .eq { order: 3; flex-basis: 100%; justify-content: space-between; height: 28px !important; }
        }
      `}</style>
    </div>
  );
}
