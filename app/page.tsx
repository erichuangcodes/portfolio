import Hero from "@/components/hero/Hero";
import ProjectsCarousel from "@/components/projects/ProjectsCarousel";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";
import RevealSection from "@/components/layout/RevealSection";
import SectionBridge from "@/components/sections/SectionBridge";
import { colors } from "@/lib/tokens";
import { projects } from "@/lib/projects";
import { Cpu, Wrench, Pencil, Video, Zap, Code2 } from "lucide-react";

// ─── Bridge 3 interest icons ──────────────────────────────────────────────────
// Typed as a generic icon component so the array is stable for JSX usage.
type IconComp = React.ComponentType<{
  size?: number;
  strokeWidth?: number;
  color?: string;
}>;

const INTERESTS: { Icon: IconComp; label: string }[] = [
  { Icon: Cpu,    label: "Robotics"    },
  { Icon: Wrench, label: "Engineering" },
  { Icon: Pencil, label: "Design"      },
  { Icon: Video,  label: "Filmmaking"  },
  { Icon: Zap,    label: "Electronics" },
  { Icon: Code2,  label: "Software"    },
];

export default function Home() {
  return (
    <main>
      <Hero />

      {/* ── Bridge 1: Hero → Projects ────────────────────────────────────── */}
      {/* Theme: who I am → what I've made. Marquee of project cards builds  */}
      {/* anticipation for the carousel that follows.                         */}
      <SectionBridge
        previousLabel="HERO"
        nextLabel="PROJECTS"
        background={colors.bg.secondary}
      >
        <div>
          <p
            className="text-mono-label"
            style={{
              color:       colors.text.muted,
              margin:      "0 0 2rem",
              paddingLeft: "8%",
            }}
          >
            WHAT I&apos;VE BUILT
          </p>

          {/* Infinite horizontal marquee — two copies for seamless loop */}
          <div style={{ overflow: "hidden" }}>
            <div
              style={{
                display:   "flex",
                gap:       "1.5rem",
                width:     "max-content",
                animation: "bridge-marquee 30s linear infinite",
                paddingLeft: "1.5rem",
              }}
            >
              {[...projects, ...projects].map((p, i) => {
                const num = String((i % projects.length) + 1).padStart(2, "0");
                return (
                  <div
                    key={i}
                    style={{
                      display:    "flex",
                      alignItems: "center",
                      gap:        "1rem",
                      padding:    "0.875rem 1.25rem",
                      border:     `1px solid ${colors.border.subtle}`,
                      borderRadius: "8px",
                      background: colors.bg.primary,
                      minWidth:   "210px",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      className="text-mono-label"
                      style={{ color: colors.accent.primary, flexShrink: 0 }}
                    >
                      {num}
                    </span>
                    <span
                      className="text-body-sm"
                      style={{ color: colors.text.primary, flexShrink: 0 }}
                    >
                      {p.title}
                    </span>
                    <span
                      className="text-mono-label"
                      style={{ color: colors.text.muted, marginLeft: "auto", flexShrink: 0 }}
                    >
                      {p.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SectionBridge>

      {/* ── Projects section ─────────────────────────────────────────────── */}
      <RevealSection>
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
              className="text-mono-label"
              style={{ color: colors.text.muted, marginBottom: "0.75rem" }}
            >
              Selected Work
            </p>
            <h2
              className="text-display-lg"
              style={{ color: colors.text.primary, margin: 0 }}
            >
              Projects
            </h2>
          </div>
          <ProjectsCarousel />
        </section>
      </RevealSection>

      {/* ── Bridge 2: Projects → Experience ──────────────────────────────── */}
      {/* Theme: what I've made → where I've worked. A pull-quote from the   */}
      {/* chair project (first-place award) bridges the two worlds.           */}
      <SectionBridge
        previousLabel="PROJECTS"
        nextLabel="EXPERIENCE"
        background={colors.bg.primary}
      >
        <div
          style={{
            paddingLeft:  "8%",
            paddingRight: "8%",
            maxWidth:     "64rem",
            margin:       "0 auto",
            textAlign:    "center",
          }}
        >
          <blockquote style={{ margin: 0 }}>
            <p
              style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "clamp(1.75rem, 4vw, 3rem)",
                fontStyle:     "italic",
                fontWeight:    400,
                lineHeight:    1.2,
                letterSpacing: "-0.02em",
                color:         colors.text.primary,
                margin:        "0 0 2rem",
              }}
            >
              &ldquo;Form follows material —<br />until they become the same thing.&rdquo;
            </p>
            <footer
              className="text-mono-label"
              style={{ color: colors.text.muted }}
            >
              — Eric Huang, on chair design
            </footer>
          </blockquote>
        </div>
      </SectionBridge>

      {/* ── Experience section ───────────────────────────────────────────── */}
      <RevealSection>
        <Experience />
      </RevealSection>

      {/* ── Bridge 3: Experience → Contact ───────────────────────────────── */}
      {/* Theme: what I've done → what's next. An icon grid of disciplines   */}
      {/* primes the viewer for the "let's work together" contact section.    */}
      <SectionBridge
        previousLabel="EXPERIENCE"
        nextLabel="CONTACT"
        background={colors.bg.tertiary}
      >
        <div
          style={{
            paddingLeft:  "8%",
            paddingRight: "8%",
            textAlign:    "center",
          }}
        >
          <div className="bridge-icon-grid">
            {INTERESTS.map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  gap:            "0.75rem",
                }}
              >
                <Icon size={26} strokeWidth={1.5} color={colors.text.muted} />
                <span
                  className="text-mono-label"
                  style={{ color: colors.text.muted }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <p
            className="text-mono-label"
            style={{
              color:         colors.accent.primary,
              marginTop:     "3rem",
              letterSpacing: "0.15em",
            }}
          >
            READY FOR THE NEXT BUILD
          </p>
        </div>
      </SectionBridge>

      {/* ── Contact section ──────────────────────────────────────────────── */}
      <RevealSection>
        <Contact />
      </RevealSection>
    </main>
  );
}
