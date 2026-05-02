# Portfolio Project — Claude Code Instructions

This file is loaded automatically by Claude Code at the start of every session. Everything here is permanent context. Do not violate these rules without explicit user approval.

---

## Project overview

Personal portfolio site for a designer/engineer. Stack: Next.js (App Router) + TypeScript + Tailwind + shadcn/ui (Radix + Lucide + Geist preset).

The site has these sections:
1. Hero with name, cycling role labels, and an animated background
2. 3D rotating project carousel
3. Experience section (resume content)
4. Contact section
5. Project detail pages at `/projects/[slug]`

The site is built section-by-section through staged prompts. Do not build sections out of order. Do not pre-build sections the user hasn't asked for.

---

## Design system — STRICT
 
### Color tokens (Antimetal palette inverted to a light base)
 
Use semantic naming, not numeric. Defined in `lib/tokens.ts` and exposed
through `tailwind.config.ts` as CSS custom properties.
 
**Background scale** (light to subtle to muted):
- `bg.plain` — pure white (#FFFFFF) — main canvas
- `bg.disabled` — #F5F5F4 — disabled surfaces, large washes
- `bg.ghost` — #EFEEED — input backgrounds, subtle separation
- `bg.muted` — #E7E5E4 — pressed states, cards on white
**Text scale** (loudest to quietest):
- `text.loud` — #08122D — headlines, hero text (deep ink-blue, NOT pure black)
- `text.default` — #1F2937 — body text, default reading
- `text.secondary` — #4B5563 — secondary copy, captions
- `text.muted` — #6B7280 — placeholders, helper text
- `text.disabled` — #9CA3AF — disabled state
**Icon scale** (parallel to text but tuned for icons):
- `icon.loud` — #08122D
- `icon.default` — #4B5563
- `icon.muted` — #9CA3AF
- `icon.disabled` — #D1D5DB
**Border scale** (lightest to strongest):
- `border.faint` — rgba(8, 18, 45, 0.06)
- `border.ghost` — rgba(8, 18, 45, 0.10)
- `border.muted` — rgba(8, 18, 45, 0.16)
**Card surfaces**:
- `card.full` — #FFFFFF with subtle inner shadow
- `card.loud` — #08122D (for inverted cards, rare)
**Hero accent system** (Antimetal's signature move — opacity variants of one color):
- `hero` base — TODO: confirm exact accent from antimetal.com via DevTools.
  Likely a saturated lime, electric green, or warm amber. Set as a single
  hex value, then expose `hero/4`, `hero/6`, `hero/40`, `hero/56`, `hero/90`
  as opacity variants in Tailwind config.
- Usage: `bg-hero/6` for ambient washes, `bg-hero/40` for emphasis,
  `text-hero` for full color
- The point of this system: one accent color, used at many opacities,
  creates depth without introducing more colors.
### Easing curves (use these exact values, never Tailwind defaults)
- `ease-expo`: `cubic-bezier(0.16, 1, 0.3, 1)` — entrance animations
- `ease-swift`: `cubic-bezier(0.65, 0, 0.35, 1)` — UI transitions
- `ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — emphasis/overshoot
- `ease-soft`: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — for the Monof intro
  exit specifically (softer than swift, no spring)
`ease-in-out` is **banned**. If you find yourself reaching for it, you're
using the wrong curve.
 
### Durations (ms)
`instant: 150`, `fast: 300`, `base: 500`, `slow: 800`, `deliberate: 1200`
 
### Typography
 
**Inter is the only font.** Period.
 
This was confirmed by inspecting both Monof's template (uses Inter via
Google's WebFont loader) and Antimetal's character (single grotesque
display + body). We're not adding a third font for "decoration."
 
Configuration (in `app/layout.tsx`):
- Inter Variable via `next/font/google`
- Subsets: latin
- Weights: 300, 400, 500, 600, 700 (same as Monof loads)
- Display: swap
Type scale (defined in `lib/typography.ts`, exposed as Tailwind classes):
- `text-display-xl`: clamp(4rem, 12vw, 9rem), line-height 0.9, weight 500, letter-spacing -0.025em
- `text-display-lg`: clamp(3rem, 8vw, 6rem), line-height 0.95, weight 500, letter-spacing -0.02em
- `text-display-md`: clamp(2rem, 5vw, 3.5rem), line-height 1, weight 500, letter-spacing -0.015em
- `text-title-h1`: 3rem, line-height 1.1, weight 600
- `text-title-h2`: 2.25rem, line-height 1.2, weight 600
- `text-title-h3`: 1.5rem, line-height 1.3, weight 600
- `text-body-x-large`: 1.25rem, line-height 1.6, weight 400
- `text-body-large`: 1.125rem, line-height 1.6, weight 400
- `text-body-default`: 1rem, line-height 1.7, weight 400
- `text-body-small`: 0.875rem, line-height 1.6, weight 400
- `text-mono-label`: 0.75rem, weight 500, uppercase, tracking-[0.18em]
For the mono-label class only: use `font-mono` which falls back through
the OS mono stack. We're not loading a separate mono font.
 
### Spacing
 
Section padding: minimum `py-32` on desktop, `py-16` on mobile. Whitespace
is part of the design — don't compress sections to "fit more."
 
### Shadows
 
No `shadow-md`, `shadow-lg`, `shadow-xl`. Use these named shadows:
 
- `shadow-card-soft-small`: `0 2px 8px rgba(8, 18, 45, 0.04)`
- `shadow-card-soft-large`: `0 8px 32px rgba(8, 18, 45, 0.06)`
- `shadow-card-x-small`: `0 1px 2px rgba(8, 18, 45, 0.04), 0 0 0 1px rgba(8, 18, 45, 0.04)`
- `shadow-hero-glow`: `0 0 80px hero/20` (only for accent CTAs, sparingly)
Add these to `tailwind.config.ts` as named utilities.

### Easing curves — use these exact values, never Tailwind defaults
- `ease-expo`: `cubic-bezier(0.16, 1, 0.3, 1)` — entrance animations
- `ease-swift`: `cubic-bezier(0.65, 0, 0.35, 1)` — UI transitions
- `ease-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` — emphasis/overshoot

`ease-in-out` is **banned**. If you find yourself reaching for it, you're using the wrong curve.

### Durations (ms)
`instant: 150`, `fast: 300`, `base: 500`, `slow: 800`, `deliberate: 1200`

### Typography
- One display font (Monof-derived, identified in Prompt 1)
- One body font (Geist, default)
- One mono font (JetBrains Mono) for labels and metadata
- **No third decorative font, ever.**
- Heading letter-spacing: -0.025em on h1, -0.015em on h2

### Spacing
Section padding minimum `py-32` on desktop, `py-16` on mobile. Whitespace is part of the design — don't compress sections to "fit more."

---

## Anti-AI design rules — STRICT

These are the patterns that scream "AI-generated portfolio." Do not produce any of them:

1. **No generic gradients.** No purple→blue, no pink→orange, no rainbow. Only the Antimetal-derived palette.
2. **No glow-on-everything.** Drop shadows have offset and tint, not blur halos centered on elements.
3. **No emoji decoration in UI.** No ✨, 🚀, 💡 in headings, buttons, or labels. Lucide icons only.
4. **No symmetrical centered layouts** for major sections. Use asymmetric, editorial composition. Hero name lives in the lower-left third, not dead center. Section titles align to one column of an underlying grid.
5. **No "AI assistant" copy.** Banned phrases include: "Crafted with passion", "Where ideas come to life", "Let's build the future", "Transforming visions", "At the intersection of", "Bringing your ideas to reality". Use specific, concrete copy.
6. **No floating chat bubbles, sparkle icons, or gradient borders on cards.**
7. **No default Tailwind shadows.** `shadow-md` and `shadow-lg` are banned. Use custom shadows like `shadow-[0_8px_32px_rgba(10,10,10,0.06)]`.
8. **No third-party "AI hero" patterns** — no animated underlines on every link, no shimmer effects on every button, no spotlight cursors site-wide. Pick effects intentionally, sparingly.

---

## Inspirations folder

Reference material lives in `/inspirations/`. When the user says "use [file] as a reference," **structurally adapt** — don't copy verbatim. The point of references is to learn the pattern, not paste the code. Rebuild adapted versions in our design system.

Key files (created as the project progresses):
- `inspirations/gallery6.tsx` — 21st.dev carousel button structure
- `inspirations/scroll-morph-hero.tsx` — card construction pattern
- `inspirations/text-parallax.tsx` — scroll animation reference
- `inspirations/bg-gradient.tsx` — background gradient (Aceternity)
- `inspirations/glass-hero.tsx` — project detail hero
- `inspirations/eric-huang-notes.md` — what to learn from / avoid in his portfolio
- `inspirations/webflow-3d-carousel.md` — description + recordings
- `inspirations/monof-intro.md` — description + recordings
- `inspirations/resume.md` — content source for experience section + project descriptions

Always check this folder before building anything new. If the user references a URL, also check if a corresponding file exists locally.

---

## Conventions

### File structure
- Components live in `components/` organized by purpose: `components/layout/`, `components/hero/`, `components/projects/`, `components/sections/`, `components/providers/`
- shadcn components go in `components/ui/` (don't move them)
- Reusable hooks in `hooks/`
- Tokens, typography, utilities in `lib/`

### Naming
- Components: PascalCase, one component per file, file matches export name
- Hooks: `useThing.ts`, camelCase
- Utility files: kebab-case (`design-tokens.ts`)

### Animations
- Framer Motion for component-level animation (mount/unmount, hover, layout)
- GSAP for complex timelines (intro overlay, scroll-driven sequences)
- Lenis for smooth scrolling (configured globally in `components/providers/SmoothScroll.tsx`)
- Always respect `prefers-reduced-motion` — provide an instant variant for users who enable it

### Performance
- Images use `next/image` with explicit width/height
- Below-the-fold sections are dynamically imported when reasonable
- No client components above what's needed — keep server components as the default
- Total JS bundle target: under 250kb gzipped

### Accessibility
- Every interactive element has a visible focus ring on `:focus-visible`
- Color contrast meets WCAG AA on body text, AAA where feasible
- All images have meaningful alt text (or empty alt for decorative)
- Animations have a `prefers-reduced-motion` fallback

---

## How to work with the user

The user prompts in stages. Each prompt is intentionally scoped. Behaviors:

1. **Stay in scope.** If the user asks for the hero, don't also build the contact section.
2. **Use the design tokens.** Never hardcode colors, durations, or easings.
3. **Reference inspirations.** Before writing animation code from scratch, check if a relevant inspiration file exists and use it for structure.
4. **Flag uncertainty.** If a prompt is ambiguous, ask one focused clarifying question before building. Don't guess.
5. **Show, don't narrate.** When a task is done, briefly summarize what was built and which files changed. Don't write essays explaining the code.
6. **No premature optimization.** Don't add abstractions, generic helpers, or "future-proofing" the user didn't ask for.
7. **No drift between prompts.** If a previous prompt established a pattern (e.g., a specific way of structuring sections), follow it in subsequent prompts unless the user says otherwise.

---

## Definition of done for any prompt

Before considering a task complete:
- Code uses tokens from `lib/tokens.ts`, never hardcoded values
- Animations use the named easing curves
- No banned patterns (see Anti-AI rules above)
- TypeScript has no errors (`npm run typecheck` passes if available)
- ESLint has no errors (`npm run lint` passes)
- The change works at 375px, 768px, 1024px, and 1440px viewports
- `prefers-reduced-motion` is handled if animations were added