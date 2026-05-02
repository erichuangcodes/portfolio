"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { colors } from "@/lib/tokens";

// ─── nav links ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home",       href: "/",           sectionId: "home"       },
  { label: "Projects",   href: "/#projects",  sectionId: "projects"   },
  { label: "Experience", href: "/#experience",sectionId: "experience" },
  { label: "Contact",    href: "/#contact",   sectionId: "contact"    },
] as const;

// ─── easing arrays for framer ─────────────────────────────────────────────────

const expoEase  = [0.16, 1, 0.3, 1]  as const;
const swiftEase = [0.65, 0, 0.35, 1] as const;

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
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        position:       "relative",
        display:        "inline-flex",
        alignItems:     "center",
        gap:            "6px",
        padding:        "4px 0",
        color:          isActive ? colors.text.primary : colors.text.muted,
        fontFamily:     "var(--font-jetbrains-mono)",
        fontSize:       "0.75rem",
        fontWeight:     isActive ? 700 : 500,
        letterSpacing:  "0.05em",
        textDecoration: "none",
        transition:     `color 200ms cubic-bezier(${expoEase.join(",")}), font-weight 0ms`,
        whiteSpace:     "nowrap",
      }}
      className="group"
    >
      {/* Active dot — layoutId shared across all NavLink instances for spring animation */}
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
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        )}
      </span>

      {/* Label + grow-from-left underline */}
      <span style={{ position: "relative" }}>
        {label}
        <span
          style={{
            position:        "absolute",
            bottom:          "-1px",
            left:            0,
            height:          "1px",
            width:           "100%",
            background:      colors.text.primary,
            transformOrigin: "left center",
            transform:       "scaleX(0)",
            transition:      `transform 200ms cubic-bezier(${expoEase.join(",")})`,
          }}
          className="nav-underline"
        />
      </span>

      <style>{`
        .group:hover .nav-underline { transform: scaleX(1) !important; }
      `}</style>
    </Link>
  );
}

// ─── mobile overlay ───────────────────────────────────────────────────────────

const overlayVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: swiftEase } },
  exit:    { opacity: 0, transition: { duration: 0.2,  ease: swiftEase } },
};

const mobileLinkVariants = {
  hidden:  { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.4, ease: expoEase, delay: i * 0.06 },
  }),
  exit: { y: -10, opacity: 0, transition: { duration: 0.2, ease: swiftEase } },
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
            className="text-mono-label"
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
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    function onScroll() {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking.current = false;
        });
        ticking.current = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Branding label — top-right corner ─────────────────────────────── */}
      <div
        style={{
          position:   "fixed",
          top:        "24px",
          right:      "24px",
          zIndex:     100,
        }}
        className="header-branding"
      >
        <span
          className="text-mono-label"
          style={{ color: colors.text.muted }}
        >
          Engineering Portfolio
        </span>
      </div>

      {/* ── Pill nav ──────────────────────────────────────────────────────── */}
      <header
        style={{
          position:       "fixed",
          top:            "1.5rem",
          left:           "50%",
          transform:      "translateX(-50%)",
          zIndex:         100,
          borderRadius:   "9999px",
          padding:        "10px 20px",
          display:        "flex",
          alignItems:     "center",
          background:     scrolled ? "rgba(255,255,255,0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          border:         scrolled
            ? `1px solid ${colors.border.subtle}`
            : "1px solid transparent",
          boxShadow:      scrolled
            ? "0 4px 24px rgba(10,10,10,0.06)"
            : "none",
          transition:     `background 300ms cubic-bezier(${swiftEase.join(",")}),
                           border-color 300ms cubic-bezier(${swiftEase.join(",")}),
                           box-shadow 300ms cubic-bezier(${swiftEase.join(",")}),
                           backdrop-filter 300ms cubic-bezier(${swiftEase.join(",")})`,
        }}
      >
        <nav
          style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}
          className="header-nav"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={link.href === activeHref}
            />
          ))}
        </nav>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{
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
      </header>

      <style>{`
        @media (max-width: 767px) {
          .header-nav        { display: none !important; }
          .header-hamburger  { display: flex !important; }
          .header-branding   { display: none !important; }
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
