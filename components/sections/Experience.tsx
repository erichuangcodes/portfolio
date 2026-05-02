"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/tokens";
import { EXPERIENCE, type ExperienceEntry } from "@/lib/experience";

const expoEase = [0.16, 1, 0.3, 1] as const;
const N = EXPERIENCE.length;

// ─── LogoCell ─────────────────────────────────────────────────────────────────

function LogoCell({
  entry,
  isHovered,
}: {
  entry: ExperienceEntry;
  isHovered: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: inView ? (isHovered ? 1 : 0.7) : 0,
        scale: inView ? 1 : 0.95,
      }}
      transition={{ duration: 0.8, ease: expoEase }}
      style={{ paddingTop: "0.25rem" }}
    >
      {entry.logoPath && !imgError ? (
        <Image
          src={entry.logoPath}
          alt={entry.company}
          width={64}
          height={64}
          onError={() => setImgError(true)}
          style={{ objectFit: "contain", width: "64px", height: "64px" }}
        />
      ) : (
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "12px",
            border: `1px solid ${colors.border.subtle}`,
            background: colors.bg.tertiary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            color: colors.text.muted,
          }}
        >
          {entry.initials}
        </div>
      )}
    </motion.div>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

export default function Experience() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Track which entry is in the viewport's upper-middle band.
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    entryRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveIdx(i);
        },
        { rootMargin: "-30% 0px -50% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Scroll-driven timeline: progress 0→1 as user scrolls through the section.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.9", "end 0.5"],
  });
  const springProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const indicatorTop = useTransform(springProgress, [0, 1], ["0%", "100%"]);
  const fillHeight   = useTransform(springProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      style={{
        background:    colors.bg.secondary,
        paddingTop:    "8rem",
        paddingBottom: "8rem",
      }}
    >
      <div style={{ paddingLeft: "8%", paddingRight: "8%" }}>
        <p
          className="text-mono-label"
          style={{ color: colors.text.muted, margin: "0 0 5rem" }}
        >
          Experience
        </p>

        {/*
          3-column grid. Timeline (col 1) spans all entry rows via gridRow.
          Entry cells (col 2) and logo cells (col 3) each occupy their own row,
          keeping logos height-aligned with their corresponding entries.
        */}
        <div className="exp-grid">

          {/* ── Col 1: Scroll-driven timeline ─────────────────────────── */}
          <div
            className="exp-timeline-col"
            style={{
              gridColumn: "1",
              gridRow: `1 / ${N + 1}`,
              alignSelf: "stretch",
              position: "relative",
            }}
          >
            {/* Track line */}
            <div
              style={{
                position: "absolute",
                left: "18px",
                top: "10px",
                bottom: "10px",
                width: "1px",
                background: colors.border.subtle,
              }}
            />

            {/* Animated fill — grows downward with scroll */}
            {!reduced && (
              <motion.div
                style={{
                  position: "absolute",
                  left: "18px",
                  top: "10px",
                  width: "1px",
                  height: fillHeight,
                  background: colors.accent.primary,
                  transformOrigin: "top",
                }}
              />
            )}

            {/* Indicator glow dot — rides the fill */}
            {!reduced && (
              <motion.div
                style={{
                  position: "absolute",
                  left: "12px",
                  top: indicatorTop,
                  translateY: "-50%",
                  width: "13px",
                  height: "13px",
                  borderRadius: "50%",
                  background: colors.accent.primary,
                  boxShadow: `0 0 10px ${colors.accent.primary}, 0 0 22px ${colors.accent.primary}50`,
                  zIndex: 2,
                }}
              />
            )}

            {/* Year markers — equally spaced; circles light up as activeIdx changes */}
            {EXPERIENCE.map((entry, i) => {
              const pct      = N === 1 ? 50 : (i / (N - 1)) * 100;
              const isActive = i === activeIdx;
              return (
                <div
                  key={entry.company}
                  style={{
                    position: "absolute",
                    top: `${pct}%`,
                    left: 0,
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      marginLeft: "14px",
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      position: "relative",
                      zIndex: 1,
                      background: isActive ? colors.accent.primary : colors.bg.primary,
                      border: `1px solid ${isActive ? colors.accent.primary : colors.border.strong}`,
                      transition: "background 0.3s, border-color 0.3s",
                    }}
                  />
                  <span
                    style={{
                      marginLeft: "8px",
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.62rem",
                      fontWeight: 500,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      color: isActive ? colors.text.secondary : colors.text.muted,
                      transition: "color 0.3s",
                    }}
                  >
                    {entry.year}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Cols 2 + 3: Entry + logo pairs ──────────────────────────── */}
          {EXPERIENCE.flatMap((entry, i) => {
            const isLast = i === EXPERIENCE.length - 1;
            return [
              /* Entry cell */
              <div
                key={`e-${entry.company}`}
                className="exp-entry-cell"
                style={{ gridColumn: "2", gridRow: String(i + 1) }}
                ref={(el) => { entryRefs.current[i] = el; }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <motion.h3
                  className="text-display-md"
                  style={{ color: colors.text.primary, margin: "0 0 0.5rem" }}
                  initial={{ x: -40, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: expoEase }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  {entry.company}
                </motion.h3>

                <motion.p
                  className="text-body-md"
                  style={{ color: colors.text.muted, margin: "0 0 1.25rem" }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: expoEase, delay: 0.2 }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  {entry.role}&nbsp;·&nbsp;{entry.dates}
                </motion.p>

                <motion.p
                  className="text-body-md"
                  style={{
                    color:      colors.text.secondary,
                    margin:     "0 0 1.5rem",
                    maxWidth:   "52ch",
                    lineHeight: 1.65,
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: expoEase, delay: 0.25 }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  {entry.description}
                </motion.p>

                <motion.div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: expoEase, delay: 0.3 }}
                  viewport={{ once: true, margin: "-20%" }}
                >
                  {entry.tech.map((tag) => (
                    <span
                      key={tag}
                      className="text-mono-label"
                      style={{
                        padding:      "0.3rem 0.75rem",
                        border:       `1px solid ${colors.border.subtle}`,
                        borderRadius: "9999px",
                        color:        colors.text.muted,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </motion.div>

                {!isLast && (
                  <div
                    style={{
                      marginTop:    "4rem",
                      height:       "1px",
                      background:   colors.border.subtle,
                      marginBottom: "4rem",
                    }}
                  />
                )}
                {isLast && <div style={{ height: "1rem" }} />}
              </div>,

              /* Logo cell */
              <div
                key={`l-${entry.company}`}
                className="exp-logo-cell"
                style={{ gridColumn: "3", gridRow: String(i + 1) }}
              >
                <LogoCell entry={entry} isHovered={hoveredIdx === i} />
              </div>,
            ];
          })}
        </div>
      </div>

      <style>{`
        .exp-grid {
          display: grid;
          grid-template-columns: 120px 1fr 200px;
          gap: 0 3rem;
          align-items: start;
        }
        @media (max-width: 1023px) {
          .exp-grid {
            grid-template-columns: 120px 1fr;
          }
          .exp-logo-cell {
            display: none;
          }
        }
        @media (max-width: 767px) {
          .exp-grid {
            display: flex;
            flex-direction: column;
          }
          .exp-timeline-col,
          .exp-logo-cell {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
