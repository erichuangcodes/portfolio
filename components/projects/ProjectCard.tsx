"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import { getCoverImage, type Project } from "@/lib/projects";
import { bezier, colors, duration } from "@/lib/tokens";
import { CARD_RADIUS, META_HEIGHT } from "./carousel-geometry";

type ProjectCardProps = {
  project: Project;
  index: number;
  imageHeight: number;
  metaOpacity: MotionValue<number>;
  onSelect: (index: number, e: MouseEvent<HTMLAnchorElement>) => void;
  onLinkFocus: (index: number, e: FocusEvent<HTMLAnchorElement>) => void;
  linkRef: (el: HTMLAnchorElement | null) => void;
};

const META_GAP = 12;
/** Tilt (deg) with the pointer at the card's edge. */
const MAX_TILT_DEG = 3;
const TILT_SPRING = { stiffness: 180, damping: 22 };
const TILT_PERSPECTIVE = 1000;
const SPOTLIGHT_SIZE = 220;

// Card face: cover image (or a token placeholder), then title and year below
// it, inside the 3D slide so the text curves with the card. Mouse hover adds a
// pointer-tracked sheen and a small tilt; touch, drag and reduced motion don't.
export default function ProjectCard({
  project,
  index,
  imageHeight,
  metaOpacity,
  onSelect,
  onLinkFocus,
  linkRef,
}: ProjectCardProps) {
  const cover = getCoverImage(project);
  const radius = `${CARD_RADIUS}px`;
  const reduced = useReducedMotion();

  const imageRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotOpacity = useMotionValue(0);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, TILT_SPRING);
  const rotateY = useSpring(tiltY, TILT_SPRING);
  const spotlight = useMotionTemplate`radial-gradient(${SPOTLIGHT_SIZE}px circle at ${spotX}px ${spotY}px, ${colors.overlay.spotlight}, transparent 70%)`;

  const fadeSpotlight = (to: number) =>
    animate(spotOpacity, to, { duration: duration.fast / 1000, ease: bezier.swift });

  const endHover = () => {
    if (!hoveringRef.current) return;
    hoveringRef.current = false;
    fadeSpotlight(0);
    tiltX.set(0);
    tiltY.set(0);
  };

  const handlePointerMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const dragging = e.currentTarget.closest("[data-dragging]") !== null;
    const image = imageRef.current;
    if (e.pointerType !== "mouse" || reduced || dragging || !image) {
      endHover();
      return;
    }
    // The rect is the projected (3D) box; scale back to the card's own pixels.
    const rect = image.getBoundingClientRect();
    const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    spotX.set(nx * image.offsetWidth);
    spotY.set(ny * image.offsetHeight);
    tiltY.set((nx - 0.5) * 2 * MAX_TILT_DEG);
    tiltX.set(-(ny - 0.5) * 2 * MAX_TILT_DEG);
    if (!hoveringRef.current) {
      hoveringRef.current = true;
      fadeSpotlight(1);
    }
  };

  return (
    <Link
      ref={linkRef}
      href={`/projects/${project.slug}`}
      draggable={false}
      aria-label={`${project.title}, ${project.year}. View project`}
      onClick={(e) => onSelect(index, e)}
      onFocus={(e) => onLinkFocus(index, e)}
      onPointerMove={handlePointerMove}
      onPointerLeave={endHover}
      className="block"
      style={{ borderRadius: radius }}
    >
      <motion.div style={{ rotateX, rotateY, transformPerspective: TILT_PERSPECTIVE }}>
        <div
          ref={imageRef}
          style={{
            position: "relative",
            height: imageHeight,
            borderRadius: radius,
            // Safari won't clip overflow + radius on 3D-transformed layers, so
            // clip-path does the rounding as well.
            clipPath: `inset(0 round ${radius})`,
            overflow: "hidden",
            background: colors.bg.secondary,
          }}
        >
          {cover ? (
            <Image
              src={cover}
              alt=""
              fill
              draggable={false}
              sizes="(max-width: 400px) 74vw, 400px"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <span
              className="text-label"
              style={{ position: "absolute", left: 16, bottom: 16, right: 16, color: colors.text.secondary }}
            >
              {project.role}
            </span>
          )}
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background: spotlight,
              opacity: spotOpacity,
              pointerEvents: "none",
            }}
          />
          {/* Hairline edge drawn on top of the image */}
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: radius,
              boxShadow: `inset 0 0 0 1px ${colors.border.subtle}`,
              pointerEvents: "none",
            }}
          />
        </div>

        <motion.div
          style={{
            opacity: metaOpacity,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "1rem",
            height: META_HEIGHT - META_GAP,
            marginTop: META_GAP,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              fontWeight: 500,
              lineHeight: "24px",
              color: colors.text.primary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {project.title}
          </span>
          <span className="text-label" style={{ color: colors.text.muted, flexShrink: 0 }}>
            {project.year}
          </span>
        </motion.div>
      </motion.div>
    </Link>
  );
}
