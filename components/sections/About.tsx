"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { about, type AboutLink } from "@/lib/about";
import { colors, easing } from "@/lib/tokens";
import MusicWidget from "./MusicWidget";
import PhotoViewer from "./PhotoViewer";
import TypingGreeting from "./TypingGreeting";

const expoEase = [0.16, 1, 0.3, 1] as const;

export default function About() {
  const reduced = useReducedMotion() === true;

  return (
    <section
      id="about"
      aria-label="About"
      className="py-16 md:py-32"
      style={{ background: colors.bg.secondary }}
    >
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 0.8, ease: expoEase }}
        className="grid grid-cols-1 gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-16 lg:gap-24"
        style={{ paddingLeft: "8%", paddingRight: "8%" }}
      >
        {/* Left: greeting + copy */}
        <div style={{ minWidth: 0 }}>
          <p className="text-eyebrow" style={{ color: colors.text.muted, margin: "0 0 1.25rem" }}>
            About
          </p>
          <TypingGreeting phrases={about.greetings} />
          <div style={{ marginTop: "2rem", maxWidth: "52ch" }}>
            {about.paragraphs.map((text, i) => (
              <p
                key={i}
                style={{
                  margin: i === 0 ? 0 : "1.1rem 0 0",
                  fontSize: "1.0625rem",
                  lineHeight: 1.75,
                  color: colors.text.secondary,
                }}
              >
                {text}
              </p>
            ))}
          </div>
        </div>

        {/* Right: photos, links, music */}
        <div style={{ minWidth: 0, width: "100%", maxWidth: "440px" }} className="md:justify-self-end">
          <PhotoViewer photos={about.photos} />

          <div style={{ display: "flex", gap: "1.5rem", margin: "1.25rem 0 1.5rem" }}>
            <ExternalLink link={about.links.resume} />
            <ExternalLink link={about.links.secondary} />
          </div>

          <MusicWidget song={about.song} />
        </div>
      </motion.div>

      <style>{`
        .about-link { transition: color 300ms ${easing.swift}; }
        .about-link:hover { color: ${colors.accent.deep} !important; }
        .about-link:focus-visible {
          outline: 2px solid ${colors.text.primary};
          outline-offset: 3px;
          border-radius: 4px;
        }
      `}</style>
    </section>
  );
}

function ExternalLink({ link }: { link: AboutLink }) {
  if (!link.href) return null;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="about-link text-eyebrow"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.25rem",
        color: colors.text.primary,
        textDecoration: "none",
        fontSize: "0.9375rem",
      }}
    >
      {link.label.toLowerCase()}
      <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
