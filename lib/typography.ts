// Typography presets — consume via the `text-*` utility classes wired into
// globals.css, or import the `prose` object for inline Framer Motion styles.

export const prose = {
  displayXl: {
    fontSize: "clamp(4rem, 12vw, 9rem)",
    lineHeight: 0.9,
    fontWeight: 500,
    letterSpacing: "-0.025em",
    fontFamily: "var(--font-display)",
  },
  displayLg: {
    fontSize: "clamp(3rem, 8vw, 6rem)",
    lineHeight: 0.95,
    fontWeight: 500,
    letterSpacing: "-0.025em",
    fontFamily: "var(--font-display)",
  },
  displayMd: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    lineHeight: 1,
    fontWeight: 500,
    letterSpacing: "-0.015em",
    fontFamily: "var(--font-display)",
  },
  bodyLg: {
    fontSize: "1.25rem",
    lineHeight: 1.6,
    fontFamily: "var(--font-geist-sans)",
  },
  bodyMd: {
    fontSize: "1rem",
    lineHeight: 1.7,
    fontFamily: "var(--font-geist-sans)",
  },
  bodySm: {
    fontSize: "0.875rem",
    lineHeight: 1.6,
    fontFamily: "var(--font-geist-sans)",
  },
  monoLabel: {
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase" as const,
    letterSpacing: "0.18em",
    fontFamily: "var(--font-jetbrains-mono)",
  },
} as const;
