"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { FocusEvent, MouseEvent } from "react";
import type { Project } from "@/lib/projects";
import { slidePose, type CarouselGeometry } from "./carousel-geometry";
import ProjectCard from "./ProjectCard";

type CarouselSlideProps = {
  project: Project;
  index: number;
  count: number;
  position: MotionValue<number>;
  geometry: CarouselGeometry;
  onSelect: (index: number, e: MouseEvent<HTMLAnchorElement>) => void;
  onLinkFocus: (index: number, e: FocusEvent<HTMLAnchorElement>) => void;
  linkRef: (el: HTMLAnchorElement | null) => void;
};

// One card on the cylinder. Its pose is derived from the shared `position`
// MotionValue, so scrubbing never re-renders React.
export default function CarouselSlide({
  project,
  index,
  count,
  position,
  geometry,
  onSelect,
  onLinkFocus,
  linkRef,
}: CarouselSlideProps) {
  const transform = useTransform(position, (p) => slidePose(p, index, geometry).transform);
  const opacity = useTransform(position, (p) => slidePose(p, index, geometry).opacity);
  const metaOpacity = useTransform(position, (p) => slidePose(p, index, geometry).metaOpacity);
  const pointerEvents = useTransform(position, (p) =>
    slidePose(p, index, geometry).culled ? "none" : "auto",
  );

  const { cardWidth, shellHeight, imageHeight } = geometry;

  return (
    <motion.div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: cardWidth,
        height: shellHeight,
        marginLeft: -cardWidth / 2,
        marginTop: -shellHeight / 2,
        transform,
        opacity,
        pointerEvents,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform, opacity",
      }}
    >
      <ProjectCard
        project={project}
        index={index}
        imageHeight={imageHeight}
        metaOpacity={metaOpacity}
        onSelect={onSelect}
        onLinkFocus={onLinkFocus}
        linkRef={linkRef}
      />
    </motion.div>
  );
}
