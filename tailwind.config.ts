import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background scale
        background: {
          plain: "#FFFFFF",
          disabled: "#F5F5F4",
          ghost: "#EFEEED",
          muted: "#E7E5E4",
        },

        // Text scale
        text: {
          loud: "#08122D",
          default: "#1F2937",
          secondary: "#4B5563",
          muted: "#6B7280",
          disabled: "#9CA3AF",
        },

        // Icon scale
        icon: {
          loud: "#08122D",
          default: "#4B5563",
          muted: "#9CA3AF",
          disabled: "#D1D5DB",
        },

        // Border scale
        border: {
          faint: "rgba(8, 18, 45, 0.06)",
          ghost: "rgba(8, 18, 45, 0.10)",
          muted: "rgba(8, 18, 45, 0.16)",
        },

        // Card surfaces
        card: {
          full: "#FFFFFF",
          loud: "#08122D",
        },

        // Hero accent system (single color, multiple opacities)
        // Base: #edd97e (warm golden-amber)
        hero: {
          DEFAULT: "#edd97e",
          // Opacity variants (for bg-hero/4, text-hero/40, etc.)
          4: "rgba(237, 217, 126, 0.04)",
          6: "rgba(237, 217, 126, 0.06)",
          15: "rgba(237, 217, 126, 0.15)", // glow variant
          20: "rgba(237, 217, 126, 0.20)",
          40: "rgba(237, 217, 126, 0.40)",
          56: "rgba(237, 217, 126, 0.56)",
          90: "rgba(237, 217, 126, 0.90)",
        },
      },

      // Typography — use these class names in components
      fontSize: {
        "display-xl": ["clamp(4rem, 12vw, 9rem)", { lineHeight: "0.9", fontWeight: "500" }],
        "display-lg": ["clamp(3rem, 8vw, 6rem)", { lineHeight: "0.95", fontWeight: "500" }],
        "display-md": ["clamp(2rem, 5vw, 3.5rem)", { lineHeight: "1", fontWeight: "500" }],
        "title-h1": ["3rem", { lineHeight: "1.1", fontWeight: "600" }],
        "title-h2": ["2.25rem", { lineHeight: "1.2", fontWeight: "600" }],
        "title-h3": ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        "body-x-large": ["1.25rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-large": ["1.125rem", { lineHeight: "1.6", fontWeight: "400" }],
        "body-default": ["1rem", { lineHeight: "1.7", fontWeight: "400" }],
        "body-small": ["0.875rem", { lineHeight: "1.6", fontWeight: "400" }],
        "mono-label": ["0.75rem", { lineHeight: "1", fontWeight: "500" }],
      },

      letterSpacing: {
        "display-xl": "-0.025em",
        "display-lg": "-0.02em",
        "display-md": "-0.015em",
        "mono-label": "0.18em", // uppercase tracking
      },

      // Easing curves
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
        swift: "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        soft: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },

      // Durations
      transitionDuration: {
        instant: "150ms",
        fast: "300ms",
        base: "500ms",
        slow: "800ms",
        deliberate: "1200ms",
      },

      // Shadows
      boxShadow: {
        "card-soft-small": "0 2px 8px rgba(8, 18, 45, 0.04)",
        "card-soft-large": "0 8px 32px rgba(8, 18, 45, 0.06)",
        "card-x-small": "0 1px 2px rgba(8, 18, 45, 0.04), 0 0 0 1px rgba(8, 18, 45, 0.04)",
        "hero-glow": "0 0 80px rgba(237, 217, 126, 0.20)",
      },

      // Animation durations can also be extended if needed
      animation: {
        // Add custom animations here if needed later
      },
    },
  },
  plugins: [],
};

export default config;