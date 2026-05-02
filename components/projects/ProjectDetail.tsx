"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCode,
  FileText,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { colors } from "@/lib/tokens";
import type { Project, ProjectSection } from "@/lib/projects";

// ─── easing ───────────────────────────────────────────────────────────────────

const expoEase  = [0.16, 1, 0.3, 1]  as const;
const swiftEase = [0.65, 0, 0.35, 1] as const;

// ─── icons ────────────────────────────────────────────────────────────────────

function GithubIcon({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

// ─── link box ─────────────────────────────────────────────────────────────────
// Dark card: icon top-left, label bottom-left, arrow bottom-right.
// Hover: scale 1.02, elevated shadow.

type LinkDef = { label: string; href: string; icon: React.ElementType };

function LinkBox({ label, href, icon: Icon }: LinkDef) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{ scale: hovered ? 1.02 : 1 }}
      transition={{ duration: 0.3, ease: swiftEase }}
      style={{
        display:        "flex",
        flexDirection:  "column",
        justifyContent: "space-between",
        width:          "250px",
        minHeight:      "120px",
        background:     colors.text.primary,
        border:         "1px solid rgba(255,255,255,0.08)",
        borderRadius:   "16px",
        padding:        "1.5rem",
        textDecoration: "none",
        cursor:         "pointer",
        flexShrink:     0,
        boxShadow:      hovered
          ? "0 8px 32px rgba(10,10,10,0.24)"
          : "0 2px 8px rgba(10,10,10,0.08)",
        transition: `box-shadow 300ms cubic-bezier(${swiftEase.join(",")})`,
      }}
      aria-label={label}
    >
      {/* Icon — top-left */}
      <span style={{ display: "flex", color: "rgba(255,255,255,0.45)" }}>
        {/* GithubIcon takes color prop, Lucide icons take color */}
        {Icon === GithubIcon
          ? <GithubIcon size={18} color="rgba(255,255,255,0.45)" />
          : <Icon size={18} strokeWidth={1.5} color="rgba(255,255,255,0.45)" />
        }
      </span>

      {/* Label + arrow — bottom row */}
      <div
        style={{
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          gap:            "0.5rem",
        }}
      >
        <span
          className="text-body-md"
          style={{ color: "#fff", fontWeight: 500, lineHeight: 1.2 }}
        >
          {label}
        </span>
        <motion.span
          animate={{ x: hovered ? 4 : 0, y: hovered ? -4 : 0 }}
          transition={{ duration: 0.3, ease: swiftEase }}
          style={{ display: "flex", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}
        >
          <ArrowUpRight size={16} strokeWidth={1.5} />
        </motion.span>
      </div>
    </motion.a>
  );
}

// ─── section image viewer ─────────────────────────────────────────────────────
// Shows one image at a time; left/right arrows appear on hover for cycling.
// Arrows share the circular style of the main carousel nav.
// If images is empty, renders a subtle placeholder so the layout doesn't collapse.

function SectionImages({ images }: { images: string[] }) {
  const [idx,      setIdx]      = useState(0);
  const [hovering, setHovering] = useState(false);
  const multi = images.length > 1;

  if (images.length === 0) {
    return (
      <div
        style={{
          aspectRatio:  "4/3",
          borderRadius: "16px",
          border:       `1px dashed ${colors.border.subtle}`,
          background:   colors.bg.secondary,
        }}
      />
    );
  }

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position:     "relative",
        borderRadius: "16px",
        overflow:     "hidden",
        aspectRatio:  "4/3",
        background:   colors.bg.secondary,
        border:       `1px solid ${colors.border.subtle}`,
      }}
    >
      {/* Image — fades between slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: swiftEase }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Image
            src={images[idx]}
            alt={`Image ${idx + 1}`}
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows — appear on hover when multiple images */}
      {multi && (
        <AnimatePresence>
          {hovering && (
            <>
              <motion.button
                key="prev"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                aria-label="Previous image"
                style={{
                  position:       "absolute",
                  left:           "0.875rem",
                  top:            "50%",
                  transform:      "translateY(-50%)",
                  zIndex:         2,
                  background:     colors.bg.primary,
                  border:         `1px solid ${colors.border.subtle}`,
                  borderRadius:   "50%",
                  width:          "40px",
                  height:         "40px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  cursor:         "pointer",
                  boxShadow:      "0 2px 8px rgba(10,10,10,0.10)",
                  color:          colors.text.primary,
                  padding:        0,
                }}
              >
                <ChevronLeft size={16} strokeWidth={1.75} />
              </motion.button>

              <motion.button
                key="next"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setIdx((i) => (i + 1) % images.length)}
                aria-label="Next image"
                style={{
                  position:       "absolute",
                  right:          "0.875rem",
                  top:            "50%",
                  transform:      "translateY(-50%)",
                  zIndex:         2,
                  background:     colors.bg.primary,
                  border:         `1px solid ${colors.border.subtle}`,
                  borderRadius:   "50%",
                  width:          "40px",
                  height:         "40px",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  cursor:         "pointer",
                  boxShadow:      "0 2px 8px rgba(10,10,10,0.10)",
                  color:          colors.text.primary,
                  padding:        0,
                }}
              >
                <ChevronRight size={16} strokeWidth={1.75} />
              </motion.button>
            </>
          )}
        </AnimatePresence>
      )}

      {/* Dot indicator */}
      {multi && (
        <div
          style={{
            position:  "absolute",
            bottom:    "0.875rem",
            left:      "50%",
            transform: "translateX(-50%)",
            display:   "flex",
            gap:       "5px",
            zIndex:    2,
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to image ${i + 1}`}
              style={{
                width:      "6px",
                height:     "6px",
                borderRadius: "50%",
                background:  i === idx ? "#fff" : "rgba(255,255,255,0.38)",
                border:      "none",
                padding:     0,
                cursor:      "pointer",
                transition:  "background 200ms",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── content section ──────────────────────────────────────────────────────────
// Two-column layout: index + heading + body text LEFT, image viewer RIGHT.
// On tablet/mobile (<1024px): stacks to single column, text first.

function ContentSection({
  section,
  index,
}: {
  section: ProjectSection;
  index: number;
}) {
  const paragraphs = section.body.split("\n\n").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.8, ease: expoEase }}
      className="detail-section-grid"
      style={{
        maxWidth: "80rem",
        margin:   "0 auto",
        padding:  "0 8%",
      }}
    >
      {/* Left: section index + heading + body */}
      <div>
        <p
          className="text-mono-label"
          style={{ color: colors.accent.primary, marginBottom: "1rem" }}
        >
          {String(index + 1).padStart(2, "0")}
        </p>

        <h2
          className="text-display-md"
          style={{ color: colors.text.primary, margin: "0 0 2rem" }}
        >
          {section.heading}
        </h2>

        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-body-lg"
            style={{
              color:      colors.text.secondary,
              lineHeight: 1.75,
              margin:     i < paragraphs.length - 1 ? "0 0 1.5rem" : 0,
            }}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Right: image viewer */}
      <div>
        <SectionImages images={section.images} />
      </div>
    </motion.div>
  );
}

// ─── project detail ───────────────────────────────────────────────────────────

export default function ProjectDetail({ project }: { project: Project }) {
  // Build link box definitions — only for links that exist
  const links: LinkDef[] = [];
  if (project.links.github)  links.push({ label: "GitHub",    href: project.links.github,  icon: GithubIcon   });
  if (project.links.cad)     links.push({ label: "CAD Files", href: project.links.cad,     icon: FileCode     });
  if (project.links.demo)    links.push({ label: "Demo",      href: project.links.demo,    icon: ExternalLink });
  if (project.links.video)   links.push({ label: "Video",     href: project.links.video,   icon: Play         });
  if (project.links.writeup) links.push({ label: "Write-up",  href: project.links.writeup, icon: FileText     });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", height: "100svh", overflow: "hidden" }}>

        {/* Background: gradient always present, image on top when set */}
        <motion.div
          layoutId={`project-image-${project.slug}`}
          style={{ position: "absolute", inset: 0 }}
        >
          <div style={{ position: "absolute", inset: 0, background: project.gradient }} />
          {project.heroImage && (
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </motion.div>

        {/* Gradient fade: transparent → white @ 90% */}
        <div
          style={{
            position:   "absolute",
            inset:      0,
            background: `linear-gradient(to bottom, transparent 0%, ${colors.bg.primary} 90%)`,
            zIndex:     1,
          }}
        />

        {/* Back link */}
        <Link
          href="/"
          style={{
            position:       "absolute",
            top:            "1.75rem",
            left:           "8%",
            zIndex:         10,
            display:        "inline-flex",
            alignItems:     "center",
            gap:            "0.5rem",
            textDecoration: "none",
            color:          "rgba(255,255,255,0.75)",
          }}
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          <span className="text-mono-label">Back</span>
        </Link>

        {/* Glass card — lower-left */}
        <div
          style={{
            position:             "absolute",
            bottom:               "3.5rem",
            left:                 "8%",
            right:                "8%",
            zIndex:               10,
            maxWidth:             "560px",
            background:           "rgba(255,255,255,0.5)",
            backdropFilter:       "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border:               "1px solid rgba(255,255,255,0.14)",
            borderRadius:         "24px",
            padding:              "2rem",
          }}
        >
          <h1
            className="text-display-lg"
            style={{ color: colors.text.primary, margin: "0 0 0.75rem" }}
          >
            {project.title}
          </h1>

          <p
            className="text-body-md"
            style={{
              color:      colors.text.secondary,
              margin:     "0 0 1.5rem",
              maxWidth:   "46ch",
              lineHeight: 1.55,
            }}
          >
            {project.pitch}
          </p>

          {/* Meta row: year · role · tech chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span
              className="text-mono-label"
              style={{
                color:        colors.text.muted,
                paddingRight: "0.75rem",
                borderRight:  `1px solid ${colors.border.subtle}`,
              }}
            >
              {project.year}
            </span>
            <span
              className="text-mono-label"
              style={{
                color:        colors.text.muted,
                paddingRight: "0.75rem",
                borderRight:  `1px solid ${colors.border.subtle}`,
              }}
            >
              {project.role}
            </span>
            {project.tech.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-mono-label"
                style={{
                  padding:      "0.2rem 0.6rem",
                  border:       `1px solid ${colors.border.subtle}`,
                  borderRadius: "9999px",
                  color:        colors.text.muted,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Link boxes ────────────────────────────────────────────────────── */}
      {/* Dark cards in a horizontal row, immediately below the hero */}
      {links.length > 0 && (
        <section
          style={{
            background:    colors.bg.primary,
            paddingTop:    "4rem",
            paddingBottom: "4rem",
            paddingLeft:   "8%",
            paddingRight:  "8%",
          }}
        >
          <p
            className="text-mono-label"
            style={{ color: colors.text.muted, marginBottom: "1.5rem" }}
          >
            Resources
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {links.map((link) => (
              <LinkBox key={link.label} {...link} />
            ))}
          </div>
        </section>
      )}

      {/* ── Content sections ──────────────────────────────────────────────── */}
      {/* Each section = two-column: index+heading+text LEFT, image viewer RIGHT */}
      {project.sections.length > 0 && (
        <div
          style={{
            background:     colors.bg.primary,
            paddingTop:     links.length > 0 ? "2rem" : "6rem",
            paddingBottom:  "8rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8rem" }}>
            {project.sections.map((section, i) => (
              <ContentSection key={section.heading} section={section} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Responsive styles ─────────────────────────────────────────────── */}
      <style>{`
        .detail-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: start;
        }
        @media (max-width: 1023px) {
          .detail-section-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }
      `}</style>
    </>
  );
}
