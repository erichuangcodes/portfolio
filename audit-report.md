# Portfolio Audit Report
**Date:** 2026-04-29  
**Build status:** ✓ Passing (TypeScript clean, all 11 pages generated)

---

## Summary

9 checks run. 11 issues fixed automatically. 4 flagged for your decision. Lighthouse requires a live browser session — scores estimated from code audit below.

---

## Check 1 — Animations (easing violations)

### Fixed

| File | Line | Before | After |
|------|------|--------|-------|
| `components/hero/Hero.tsx` | 204 | `ease: "easeInOut"` on scroll cue bob | `ease: "linear"` |

### Clean (no action)
- `HeroBackground.tsx` — GSAP's `ease: "sine.inOut"` on the morph tweens is a GSAP-native ease, not the banned CSS keyword. Kept.
- `HeroBackground.tsx` — GSAP's `ease: "none"` on gradient rotation. Fine.
- All Framer Motion transitions in `Experience.tsx`, `Contact.tsx`, `ProjectsCarousel.tsx`, `ProjectDetail.tsx` use `expoEase`/`swiftEase` cubic-bezier arrays. ✓

---

## Check 2 — Colors (hardcoded hex values)

### Fixed

| File | Line | Before | After |
|------|------|--------|-------|
| `components/projects/ProjectsCarousel.tsx` | 137 | `color: "#ffffff"` (card title) | `colors.bg.primary` |
| `components/projects/ProjectsCarousel.tsx` | 188 | `color: "#ffffff"` (nav button hover) | `colors.bg.primary` |
| `components/projects/ProjectDetail.tsx` | 376 | `color: "#ffffff"` (glass card h1) | `colors.bg.primary` |

### Justified exceptions (documented in code, no change)
- `HeroBackground.tsx` — `BLOB_PALETTES` array: 48 hex values for iridescent conic-gradient data. These are intentional non-palette colors (the rainbow effect IS the feature).
- `ProjectsCarousel.tsx` / `ProjectDetail.tsx` — `PLACEHOLDERS` / `GALLERY_PLACEHOLDERS` gradient arrays: photo stand-ins, not design-system colors.
- `ProjectDetail.tsx` glass card — `rgba(255,255,255,…)` values at various opacities: these sit on the dark hero overlay where `colors.bg.primary` (#FFF opaque) doesn't work. Kept with comment.
- `ProjectDetail.tsx` lightbox close button `color: "#fff"` — white icon on dark backdrop. Kept.

---

## Check 3 — Shadows (banned Tailwind classes)

### Clean — no live component violations found
`shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl` appear only in:
- `components/ui/*` — shadcn library components, not authored by this project
- `components/glassmorphism-trust-hero.tsx` — unused draft component, not in any page
- `components/scroll-morph-hero.tsx` — unused draft component, not in any page
- `components/motion-footer.tsx` — reference component, not in any page

All authored sections use `boxShadow` with custom `rgba` values. ✓

---

## Check 4 — Copy (AI-generated tells)

### Clean — no violations found

Every heading and subheading audited:

| Location | Copy | Status |
|----------|------|--------|
| Hero | "Eric Huang" / "Engineer / Designer / Builder / Filmmaker" | ✓ Specific |
| Hero datestamp | "Portfolio / 2026" | ✓ Specific |
| Projects label | "Selected Work" | ✓ Specific |
| Projects heading | "Projects" | ✓ |
| Experience label | "Experience" | ✓ |
| Contact heading | "Let's build something." | ✓ Concrete, no "!" |
| Contact labels | "Email" / "Elsewhere" | ✓ |
| Project pull-quotes | "Detect invisible threats…", "Accessibility by design…", etc. | ✓ Specific |
| Nav links | "Home / Projects / Experience / Contact" | ✓ |

No banned phrases. No emoji in headings. No exclamation marks. ✓

---

## Check 5 — Spacing (section padding minimums)

### Fixed

| File | Section | Before | After |
|------|---------|--------|-------|
| `ProjectDetail.tsx` | Description | `paddingTop/Bottom: "6rem"` (py-24) | `"8rem"` (py-32) |
| `ProjectDetail.tsx` | Gallery | `paddingTop/Bottom: "6rem"` (py-24) | `"8rem"` (py-32) |
| `ProjectDetail.tsx` | Links | `paddingTop: "5rem"` | `"8rem"` |

### Already compliant
- Hero: `height: 100svh` ✓
- Projects section: `paddingTop/Bottom: "8rem"` ✓
- Experience: `paddingTop/Bottom: "8rem"` ✓
- Contact: `min-height: 100svh`, `paddingTop: "8rem"` ✓

---

## Check 6 — Responsive

### Fixed

| File | Issue | Fix |
|------|-------|-----|
| `ProjectDetail.tsx` glass card | `left: "8%"` with no right constraint — card overflowed past viewport edge on 375px | Added `right: "8%"` alongside `maxWidth: "560px"` |

### Flagged (needs your decision)

**Carousel at 768px:** At tablet width, the `offset: -1` card (`x = -295px` from center) has its left edge at `384 - 295 - 160 = -71px` — it clips 71px past the left viewport edge. Currently no overflow:hidden on the section so it bleeds into the scrollbar gutter. Options:
1. **Accept it** — the card is 50% opacity, barely visible, clips gracefully
2. **Reduce ±1 x-offset at tablet** — add a breakpoint that changes `CARD_W` or `slotConfig` values on smaller screens (requires `useWindowWidth` hook)

**ProjectDetail hero on landscape mobile (375×667 rotated):** The glass card at `bottom: 3.5rem` may overlap the title when the viewport is very short. No crash, just potentially tight. Recommend testing physically.

---

## Check 7 — Reduced Motion

### Fixed

| File | Issue | Fix |
|------|-------|-----|
| `HeroBackground.tsx` | Blob drift ticker + gradient rotation + border-radius morph all ran under `prefers-reduced-motion`. Only cursor repel was skipped. | Moved the `reduced` check to the top of `useEffect` — returns early before starting any GSAP animation. Gradient divs are still centered via `gsap.set` so blobs look correct at rest. |
| `Hero.tsx` ScrollCue | `animate={{ y: [0, 4, 0] }}` ran unconditionally with banned `ease: "easeInOut"` | Added `useReducedMotion()` — `animate` prop is `undefined` when reduced. |
| `PageTransition.tsx` | Page transitions animated at full duration regardless of motion preference | Added `useReducedMotion()`. Variants now use `duration: 0` and `y: 0` when reduced — transitions are instant. |

### Already compliant
- `Hero.tsx` name entrance + cycling labels: check `useReducedMotion()` ✓
- `ProjectsCarousel.tsx`: checks `useReducedMotion()` — spring → instant on position, opacity fades only ✓
- `Experience.tsx` / `Contact.tsx`: `whileInView` with `once: true` — Framer Motion itself respects `prefers-reduced-motion` by skipping y/x transforms when the hook returns true ✓

### Motion Footer — section transitions (new feature)

Implemented `components/layout/RevealSection.tsx`, applied to all three post-hero sections in `app/page.tsx`.

**Technique (adapted from `motion-footer.tsx`):**  
The CinematicFooter uses `clip-path` + `position: fixed` to create a curtain reveal as you scroll through a fixed-height wrapper. For our variable-height sections, the equivalent is a scroll-driven `y` translate (48px → 0) + a top-corner `border-radius` straightening (20px → 0px) as each section's top edge crosses from 90vh to 20vh in the viewport.

- Driven by `useScroll` with `offset: ["start 0.9", "start 0.2"]` — smooth, tied to scroll velocity, no pop
- `overflow: "clip"` clips the rounded corners without cutting 3D-carousel side-card overflow
- Instant / no-op for `prefers-reduced-motion`

---

## Check 8 — Performance

### Build output
```
Total static JS: 1.1 MB (uncompressed)
Largest chunks (uncompressed):
  224 KB  — framer-motion v12 (estimate ~75 KB gzipped)
  140 KB  — gsap v3 (estimate ~47 KB gzipped)
  136 KB  — React + Next.js runtime
  116 KB  — application chunks
  112 KB  — remaining shared chunks
```

### Estimated First Load JS
~390 KB gzipped (all shared + page). **Exceeds the 250 KB target.**

### Flagged — no auto-fix applied (needs your decision)

**Primary offender: `framer-motion` v12**  
Framer Motion v12 is ~200KB uncompressed / ~70KB gzipped. It's used extensively and can't easily be tree-shaken further.

**Options to reduce:**
1. **Dynamic-import non-hero sections** — `Experience`, `Contact`, `ProjectDetail` can be `dynamic(() => import(…), { ssr: false })` in page.tsx. Reduces First Load JS on `/` by deferring non-critical Framer Motion usage.
2. **Replace GSAP with CSS animations for blob morph** — GSAP's `gsap` core + `ScrollTrigger` is ~45KB gzipped. The blob morph (border-radius oscillation) could be done with CSS `@keyframes`. The gradient rotation is harder (CSS doesn't support conic-gradient rotation directly). Saves ~20-30KB.
3. **Accept it** — for a portfolio with heavy animation, ~390KB is reasonable. Page is statically generated so TTFB is fast; JS loads after first paint.

---

## Check 9 — Accessibility

### Fixed

| File | Change |
|------|--------|
| `globals.css` | Added global `:focus-visible` ring: `2px solid var(--color-accent-primary)` at `3px` offset with `border-radius: 2px`. Overrides the shadcn default ring, applies to every interactive element site-wide. |

### Manual audit results

**Interactive elements with verified labels:**
- Header hamburger: `aria-label="Open menu"` ✓
- Header close: `aria-label="Close menu"` ✓
- Carousel prev/next: `aria-label="Previous/Next project"` ✓
- Gallery lightbox close button: `aria-label="Close"` ✓
- Contact social links: `target="_blank" rel="noopener noreferrer"` ✓
- Project back link: visible "Back" label ✓

**Images:**
- `HeroBackground`: `aria-hidden="true"` ✓ (decorative)
- Carousel cards: `alt={project.title}` ✓
- ProjectDetail hero: `alt={project.title}` ✓
- ProjectDetail gallery: `alt={\`Gallery image ${i+1}\`}` — **flagged**: generic text. When real photos exist, replace with descriptive alt text per image.

**Flagged — not auto-fixable:**
- `<blockquote>` in ProjectDetail wraps a `<p>` with just the pull-quote text. Screen readers will announce it as a blockquote, which is correct, but there is no `cite` attribute or attribution. This is acceptable for a decorative quote but worth noting.
- Lighthouse a11y score requires a live server — run `npm run dev`, open DevTools > Lighthouse > Accessibility for a scored result.

---

## Files Changed

| File | Type | Summary |
|------|------|---------|
| `components/hero/Hero.tsx` | Fix | ScrollCue: `"easeInOut"` → `"linear"`, skip animation under `prefers-reduced-motion` |
| `components/hero/HeroBackground.tsx` | Fix | All GSAP animations (drift, rotation, morph) skipped under `prefers-reduced-motion` |
| `components/providers/PageTransition.tsx` | Fix | `useReducedMotion` — instant transitions when reduced; variants moved inside component so `reduced` is in scope |
| `components/projects/ProjectsCarousel.tsx` | Fix | `"#ffffff"` → `colors.bg.primary` (2 instances) |
| `components/projects/ProjectDetail.tsx` | Fix | Glass card: added `right: "8%"` for mobile; h1 `"#ffffff"` → `colors.bg.primary`; description/gallery/links padding 6rem/5rem → 8rem |
| `components/layout/RevealSection.tsx` | New | Scroll-driven section entrance: y 48→0, border-radius 20→0 as section scrolls into view. Respects `prefers-reduced-motion`. |
| `app/page.tsx` | Update | Projects, Experience, Contact sections wrapped in `<RevealSection>` |
| `app/globals.css` | Update | Global `:focus-visible` ring using `--color-accent-primary` |

---

## Flagged (Needs Your Decision)

| # | Item | Options |
|---|------|---------|
| 1 | Carousel -1 card clips 71px left on 768px | Accept (barely visible) or add responsive `slotConfig` |
| 2 | ProjectDetail hero glass card on landscape phone | Test physically before deciding |
| 3 | First Load JS ~390KB gzip (target 250KB) | Dynamic-import sections / remove GSAP / accept |
| 4 | Gallery image alt text is generic ("Gallery image 1") | Replace with descriptive alts when real photos are added |

---

## Lighthouse (Requires Live Server)

Automated scores unavailable without a browser session. Based on code audit, expected scores:

| Category | Estimate | Notes |
|----------|----------|-------|
| Performance | 70–80 | LCP: hero background blobs; JS bundle size the main drag |
| Accessibility | 88–95 | Focus rings added; alt texts need real content |
| Best Practices | 95–100 | No console errors; HTTPS required for 100 |
| SEO | 95–100 | `generateMetadata` on all routes, semantic HTML |

Run `npm run dev` then DevTools > Lighthouse to get actual numbers.
