"use client";

import Image from "next/image";
import Link from "next/link";
import type { FocusEvent, MouseEvent } from "react";
import { getCoverImage, type Project } from "@/lib/projects";
import { colors } from "@/lib/tokens";
import { CARD_RADIUS, META_HEIGHT } from "./carousel-geometry";

type ProjectCardProps = {
  project: Project;
  index: number;
  imageHeight: number;
  onSelect: (index: number, e: MouseEvent<HTMLAnchorElement>) => void;
  onLinkFocus: (index: number, e: FocusEvent<HTMLAnchorElement>) => void;
  linkRef: (el: HTMLAnchorElement | null) => void;
};

const META_GAP = 12;

// Card face: cover image (or a token placeholder), then title and year below
// it, inside the 3D slide so the text curves with the card.
export default function ProjectCard({
  project,
  index,
  imageHeight,
  onSelect,
  onLinkFocus,
  linkRef,
}: ProjectCardProps) {
  const cover = getCoverImage(project);
  const radius = `${CARD_RADIUS}px`;

  return (
    <Link
      ref={linkRef}
      href={`/projects/${project.slug}`}
      draggable={false}
      aria-label={`${project.title}, ${project.year}. View project`}
      onClick={(e) => onSelect(index, e)}
      onFocus={(e) => onLinkFocus(index, e)}
      className="block"
      style={{ borderRadius: radius }}
    >
      <div
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
            sizes="(max-width: 639px) 74vw, (max-width: 1023px) 38vw, 400px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span
            className="text-mono-label"
            style={{ position: "absolute", left: 16, bottom: 16, right: 16, color: colors.text.muted }}
          >
            {project.role}
          </span>
        )}
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

      <div
        style={{
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
        <span className="text-mono-label" style={{ color: colors.text.muted, flexShrink: 0 }}>
          {project.year}
        </span>
      </div>
    </Link>
  );
}
