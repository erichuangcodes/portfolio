"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { colors } from "@/lib/tokens";

// ─── constants ────────────────────────────────────────────────────────────────

const swiftEase = [0.65, 0, 0.35, 1] as const;

const EMAIL = "huangeric1029@gmail.com";

// Brand icons — Lucide doesn't ship social platform icons.
// All use 24×24 viewBox with stroke to match Lucide's visual language.

function LinkedInIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function InstagramIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill={color} stroke="none" />
    </svg>
  );
}

function TikTokIcon({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIALS: { label: string; href: string; Icon: React.ElementType }[] = [
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/eric-huang-49346a36a/", Icon: LinkedInIcon  },
  { label: "Instagram", href: "https://www.instagram.com/stemmics_/",              Icon: InstagramIcon },
  { label: "TikTok",    href: "https://www.tiktok.com/@bonsyfilms",                Icon: TikTokIcon   },
];

// ─── email link ───────────────────────────────────────────────────────────────
// On hover: text transitions to accent color; an accent underline scales in
// from the left. No character splitting — nothing to clip.

function EmailLink() {
  const [hovered, setHovered] = useState(false);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <a
        href={`mailto:${EMAIL}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display:        "block",
          textDecoration: "none",
          color:          hovered ? colors.accent.primary : colors.text.primary,
          transition:     "color 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {EMAIL}
      </a>

      {/* Underline — scales left → right on hover */}
      <motion.span
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: swiftEase }}
        style={{
          display:         "block",
          position:        "absolute",
          bottom:          "-3px",
          left:            0,
          height:          "2px",
          width:           "100%",
          background:      colors.accent.primary,
          transformOrigin: "left center",
        }}
      />
    </span>
  );
}

// ─── social row ───────────────────────────────────────────────────────────────

function SocialRow({
  label,
  href,
  Icon,
}: {
  label: string;
  href: string;
  Icon: React.ElementType;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            "0.75rem",
        textDecoration: "none",
        color:          colors.text.primary,
        padding:        "0.75rem 0",
      }}
    >
      {/* Platform icon */}
      <span style={{ display: "flex", flexShrink: 0, color: colors.text.muted }}>
        <Icon size={20} strokeWidth={1.75} />
      </span>

      {/* Label with grow-from-left underline */}
      <span style={{ position: "relative", flex: 1 }}>
        <span className="text-body-md" style={{ color: colors.text.primary }}>
          {label}
        </span>
        <motion.span
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.2, ease: swiftEase }}
          style={{
            display:         "block",
            position:        "absolute",
            bottom:          "-1px",
            left:            0,
            height:          "1px",
            width:           "100%",
            background:      colors.accent.primary,
            transformOrigin: "left center",
          }}
        />
      </span>

      {/* Arrow — slides right on hover */}
      <motion.span
        animate={{ x: hovered ? 8 : 0 }}
        transition={{ duration: 0.2, ease: swiftEase }}
        style={{ display: "flex", color: colors.text.muted, flexShrink: 0 }}
      >
        <ChevronRight size={18} strokeWidth={1.5} />
      </motion.span>
    </a>
  );
}

// ─── local time ───────────────────────────────────────────────────────────────

function LocalTime() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hour:     "numeric",
        minute:   "2-digit",
        hour12:   true,
      }).format(new Date());

    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;
  return <>{time} EST</>;
}

// ─── contact ──────────────────────────────────────────────────────────────────

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        background:     colors.bg.primary,
        minHeight:      "100svh",
        display:        "flex",
        flexDirection:  "column",
        justifyContent: "space-between",
        paddingTop:     "8rem",
        paddingBottom:  "3rem",
        paddingLeft:    "8%",
        paddingRight:   "8%",
      }}
    >
      {/* ── Main content ────────────────────────────────────────────────── */}
      <div>
        {/* Headline — nowrap so the phrase stays on one line at 1280px+ */}
        <h2
          className="text-display-xl"
          style={{
            color:         colors.text.primary,
            margin:        "0 0 4rem",
            fontSize:      "clamp(2.5rem, 7vw, 6rem)",
            whiteSpace:    "nowrap",
            letterSpacing: "-0.025em",
          }}
        >
          Open to Opportunities.
        </h2>

        {/* Two-column row */}
        <div className="contact-cols">

          {/* Left — email */}
          <div>
            <p
              className="text-mono-label"
              style={{ color: colors.text.muted, margin: "0 0 1rem" }}
            >
              Email
            </p>
            <span
              className="text-display-md"
              style={{ color: colors.text.primary, display: "block" }}
            >
              <EmailLink />
            </span>
          </div>

          {/* Right — social links */}
          <div>
            <p
              className="text-mono-label"
              style={{ color: colors.text.muted, margin: "0 0 0.25rem" }}
            >
              Elsewhere
            </p>
            <div
              style={{
                borderTop: `1px solid ${colors.border.subtle}`,
                marginTop: "0.25rem",
              }}
            >
              {SOCIALS.map((s) => (
                <div
                  key={s.label}
                  style={{ borderBottom: `1px solid ${colors.border.subtle}` }}
                >
                  <SocialRow label={s.label} href={s.href} Icon={s.Icon} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer row ──────────────────────────────────────────────────── */}
      <div
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          paddingTop:     "2rem",
          borderTop:      `1px solid ${colors.border.subtle}`,
          flexWrap:       "wrap",
          gap:            "0.5rem",
        }}
      >
        <span className="text-mono-label" style={{ color: colors.text.muted }}>
          © 2026 Eric Huang
        </span>
        <span className="text-mono-label" style={{ color: colors.text.muted }}>
          Brooklyn, NY&nbsp;·&nbsp;<LocalTime />
        </span>
      </div>

      {/* Responsive layout */}
      <style>{`
        .contact-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
          max-width: 72rem;
        }
        @media (max-width: 767px) {
          .contact-cols {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }
      `}</style>
    </section>
  );
}
