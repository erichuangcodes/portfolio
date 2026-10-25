"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { AboutPhoto } from "@/lib/about";
import { bezier, colors, easing, shadow, spherePalette } from "@/lib/tokens";

const SWIPE_PX = 40;

export default function PhotoViewer({ photos }: { photos: readonly AboutPhoto[] }) {
  const reduced = useReducedMotion() === true;
  const [index, setIndex] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const count = photos.length;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const photo = photos[index];

  return (
    <div>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos"
        tabIndex={0}
        className="photo-frame"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        }}
        onPointerDown={(e) => { pointerStart.current = e.clientX; }}
        onPointerUp={(e) => {
          if (pointerStart.current === null) return;
          const dx = e.clientX - pointerStart.current;
          pointerStart.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => { pointerStart.current = null; }}
        style={{
          position: "relative",
          aspectRatio: "4 / 5",
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          background: colors.bg.tertiary,
          boxShadow: shadow.card,
          touchAction: "pan-y",
        }}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={index}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}: ${photo.alt}`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: bezier.swift }}
            style={{ position: "absolute", inset: 0 }}
          >
            {photo.src ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 100vw, 40vw"
                style={{ objectFit: "cover" }}
                draggable={false}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  background: `${spherePalette[index % spherePalette.length]}33`,
                  color: colors.text.secondary,
                }}
              >
                <ImageIcon size={22} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-label">Photo {index + 1}: add to /public/about</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {count > 1 && (
          <>
            <ArrowButton side="left" onClick={() => go(-1)} />
            <ArrowButton side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      <p
        aria-live="polite"
        className="text-label"
        style={{
          margin: "0.75rem 0 0",
          textAlign: "center",
          color: colors.text.muted,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {index + 1} / {count}
      </p>

      <style>{`
        .photo-arrow { opacity: 0.55; transition: opacity 300ms ${easing.swift}, background 300ms ${easing.swift}; }
        .photo-frame:hover .photo-arrow, .photo-arrow:focus-visible { opacity: 1; }
        .photo-arrow:hover { background: ${colors.bg.primary}; }
        .photo-frame:focus-visible, .photo-arrow:focus-visible {
          outline: 2px solid ${colors.text.primary};
          outline-offset: 3px;
        }
        @media (hover: none) { .photo-arrow { opacity: 0.85; } }
      `}</style>
    </div>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      className="photo-arrow"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        top: "50%",
        [side]: "12px",
        transform: "translateY(-50%)",
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(${colors.glass.tintRgb}, 0.72)`,
        color: colors.text.primary,
        cursor: "pointer",
        zIndex: 2,
      }}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}
