"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { House, Menu, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { bezier, colors } from "@/lib/tokens";
import NavGlass from "./NavGlass";
import { DEV_TUNING } from "@/lib/dev-tuning";

// Dev-only Leva folder for the glass. Statically dropped from production.
const NavGlassTuner = DEV_TUNING
  ? dynamic(() => import("./NavGlassTuner"), { ssr: false, loading: () => null })
  : null;

// ─── nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home",       href: "/",           sectionId: "home"       },
  { label: "About",      href: "/#about",     sectionId: "about"      },
  { label: "Projects",   href: "/#projects",  sectionId: "projects"   },
  { label: "Experience", href: "/#experience",sectionId: "experience" },
  { label: "Contact",    href: "/#contact",   sectionId: "contact"    },
] as const;

// ─── scroll-driven active section detection ───────────────────────────────────
// IntersectionObserver fires when a section's top portion enters the top 55%
// of the viewport, making it the "dominant" section. The first section in
// DOM order that satisfies this is considered active.

function useActiveSection(): string {
  const [active, setActive] = useState<string>("/");

  useEffect(() => {
    const visible = new Set<string>();
    const map = new Map<Element, string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const href = map.get(e.target);
          if (!href) return;
          if (e.isIntersecting) visible.add(href);
          else visible.delete(href);
        });
        const first = NAV_LINKS.find((s) => visible.has(s.href));
        if (first) setActive(first.href);
      },
      // rootMargin bottom = -45% means only the top 55% of viewport counts
      { threshold: 0.1, rootMargin: "0px 0px -45% 0px" },
    );

    NAV_LINKS.forEach(({ sectionId, href }) => {
      const el = document.getElementById(sectionId);
      if (el) { map.set(el, href); observer.observe(el); }
    });

    return () => observer.disconnect();
  }, []);

  return active;
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  isActive,
  reduced,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  reduced: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "true" : undefined}
      aria-label={href === "/" ? "Home" : undefined}
      className="nav-link"
      style={{
        position:       "relative",
        display:        "inline-flex",
        alignItems:     "center",
        gap:            "6px",
        padding:        "4px 0",
        color:          isActive ? colors.text.primary : colors.text.secondary,
        fontFamily:     "var(--font-fraunces)",
        fontOpticalSizing: "auto",
        fontSize:       "0.875rem",
        fontWeight:     isActive ? 600 : 400,
        letterSpacing:  "0",
        textDecoration: "none",
        transition:     `color 300ms cubic-bezier(${bezier.swift.join(",")})`,
        whiteSpace:     "nowrap",
      }}
    >
      {/* Active dot — one shared layoutId, so it glides between links */}
      <span style={{ width: "4px", display: "flex", justifyContent: "center" }}>
        {isActive && (
          <motion.span
            layoutId="active-dot"
            style={{
              width:        "4px",
              height:       "4px",
              borderRadius: "50%",
              background:   colors.accent.primary,
              display:      "block",
            }}
            transition={
              reduced
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 35 }
            }
          />
        )}
      </span>
      {href === "/" ? (
        <House size={15} strokeWidth={isActive ? 2 : 1.5} aria-hidden="true" />
      ) : (
        label
      )}
    </Link>
  );
}

// ─── mobile overlay ───────────────────────────────────────────────────────────

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: bezier.swift } },
  exit:    { opacity: 0, transition: { duration: 0.2,  ease: bezier.swift } },
};

const mobileLinkVariants = {
  hidden:  { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.4, ease: bezier.expo, delay: i * 0.06 },
  }),
  exit: { y: -10, opacity: 0, transition: { duration: 0.2, ease: bezier.swift } },
};

function MobileOverlay({
  isOpen,
  activeHref,
  onClose,
}: {
  isOpen: boolean;
  activeHref: string;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position:      "fixed",
            inset:         0,
            zIndex:        200,
            background:    colors.bg.primary,
            display:       "flex",
            flexDirection: "column",
            padding:       "2rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              aria-label="Close menu"
              style={{
                background: "none",
                border:     "none",
                cursor:     "pointer",
                padding:    "8px",
                color:      colors.text.primary,
              }}
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <nav
            style={{
              flex:          1,
              display:       "flex",
              flexDirection: "column",
              justifyContent:"center",
              gap:           "2.5rem",
              paddingLeft:   "1rem",
            }}
          >
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                variants={mobileLinkVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  style={{
                    fontFamily:     "var(--font-display)",
                    fontSize:       "clamp(2rem, 8vw, 3.5rem)",
                    fontWeight:     link.href === activeHref ? 600 : 500,
                    letterSpacing:  "-0.02em",
                    color:          link.href === activeHref
                      ? colors.text.primary
                      : colors.text.muted,
                    textDecoration: "none",
                    lineHeight:     1,
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <p
            className="text-eyebrow"
            style={{ color: colors.text.muted, paddingLeft: "1rem" }}
          >
            Engineering Portfolio
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const activeHref = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion() === true;

  return (
    <>
      {NavGlassTuner ? <NavGlassTuner /> : null}

      {/* ── Liquid-glass pill nav ─────────────────────────────────────────── */}
      <motion.header
        initial={reduced ? false : { y: -96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, delay: 0.75, ease: bezier.expo }}
        style={{
          position:     "fixed",
          top:          "1.5rem",
          left:         "50%",
          x:            "-50%",
          zIndex:       100,
          borderRadius: "9999px",
          padding:      "10px 20px",
          display:      "flex",
          alignItems:   "center",
        }}
      >
        <NavGlass />

        <nav
          style={{ position: "relative", display: "flex", alignItems: "center", gap: "1.75rem" }}
          className="header-nav"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={link.href === activeHref}
              reduced={reduced}
            />
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{
            position:   "relative",
            background: "none",
            border:     "none",
            cursor:     "pointer",
            padding:    "4px",
            color:      colors.text.primary,
            display:    "none",
          }}
          className="header-hamburger"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </motion.header>

      <style>{`
        .nav-link:hover { color: ${colors.text.primary} !important; }
        .nav-link:focus-visible {
          outline: 2px solid ${colors.text.primary};
          outline-offset: 4px;
          border-radius: 4px;
        }
        @media (max-width: 767px) {
          .header-nav        { display: none !important; }
          .header-hamburger  { display: flex !important; }
        }
      `}</style>

      <MobileOverlay
        isOpen={menuOpen}
        activeHref={activeHref}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
