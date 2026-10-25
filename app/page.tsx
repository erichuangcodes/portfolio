import Hero from "@/components/hero/Hero";
import About from "@/components/sections/About";
import CurvedCarousel from "@/components/projects/CurvedCarousel";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import RevealSection from "@/components/layout/RevealSection";
import { colors } from "@/lib/tokens";

export default function Home() {
  return (
    <main>
      <Hero />

      <About />

      {/* ── Projects section ─────────────────────────────────────────────── */}
      <section
        id="projects"
        style={{
          background:    colors.bg.primary,
          paddingTop:    "8rem",
          paddingBottom: "8rem",
        }}
      >
        <div
          style={{
            paddingLeft:  "8%",
            paddingRight: "8%",
            marginBottom: "4rem",
          }}
        >
          <p
            className="text-eyebrow"
            style={{ color: colors.text.muted, marginBottom: "0.75rem" }}
          >
            Selected Work
          </p>
          <h2
            className="text-display-md"
            style={{ color: colors.text.primary, margin: 0 }}
          >
            From CAD model
            <br />
            to the real thing.
          </h2>
        </div>
        <CurvedCarousel />
      </section>

      {/* ── Experience section ───────────────────────────────────────────── */}
      <RevealSection>
        <Experience />
      </RevealSection>

      {/* ── Contact section ──────────────────────────────────────────────── */}
      <RevealSection>
        <Contact />
      </RevealSection>
    </main>
  );
}
