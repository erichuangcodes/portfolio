# HANDOFF — Eric Huang portfolio

Notes for a fresh Claude Code session. Read this before you touch anything,
and read `CLAUDE.md` too, since it is loaded automatically. Where the two
disagree, this file reflects what the code does right now (as of 2026-10-24,
commit `7cf2a50`).

---

## 1. Project overview

This is Eric Huang's personal portfolio. Eric is a designer/engineer, and the
site should feel modern, editorial and restrained, not like a template.

**Stack**
- Next.js 16.2.4 (App Router, Turbopack), React 19.2.4, TypeScript (strict)
- Tailwind CSS v4, configured in `app/globals.css` (there is also a
  `tailwind.config.ts`). shadcn/ui primitives live in `components/ui/`.
- Hero 3D scene: `three` 0.186, `@react-three/fiber` v9, `@react-three/rapier`
  (WASM physics), `@react-three/postprocessing` / `postprocessing` (N8AO and
  depth of field). drei is **not** installed on purpose.
- Motion: `framer-motion` 12 for components, `gsap` is available,
  `@studio-freight/lenis` for smooth scrolling (`components/providers/SmoothScroll.tsx`).
- Dev only: `leva` 0.10.1, used for the hero tuning panel.
- Design tokens: `lib/tokens.ts` and `lib/typography.ts`.

**Run it**
```bash
npm install
npm run dev        # http://localhost:3000 (the Leva panel only shows here)
npx tsc --noEmit   # typecheck (there is no npm "typecheck" script)
npm run lint       # eslint (see Known issues: it does not pass yet)
npm run build
```

**Deploy:** Vercel. There is no `vercel.json` or `.vercel/` in the repo yet,
so the project hasn't been linked from this machine. Default Next.js settings
should work.

**Branches:** work happens on `cleanup`. `main` is the PR base.

---

## 2. Current state

### Homepage, top to bottom (`app/page.tsx`)

| # | Section | File(s) | Status |
|---|---|---|---|
| 0 | Fixed pill nav (Home / Projects / Experience / Contact) | `components/layout/Header.tsx` (mounted in `app/layout.tsx`) | Works. It is a plain pill for now; the liquid-glass version is still to do. No "About" link yet. |
| 1 | Hero: inset card with the 3D sphere scene, name, rotating role, signature, datestamp, scroll cue | `components/hero/Hero.tsx`, plus the scene files in `components/hero/` | Scene **done and approved**. Text styling is **in progress** (still the pre-sphere styling). Scroll transition is **in progress** (see section 3). |
| 1b | About | `components/sections/About.tsx`, content in `lib/about.ts` | Built 2026-10-25 with placeholder copy and photos. See section 3e. |
| 2 | Projects: "Selected Work" label, headline "From CAD model / to the real thing.", curved carousel | `app/page.tsx` (heading), `components/projects/CurvedCarousel.tsx` and friends (see "Projects carousel" below), data in `lib/projects.ts` | **Done** (2026-10-24, reviewed over 3 rounds, PASS). Still to check in a real browser: colour/feel, real trackpad and touch. 3 of 6 projects have a cover image; the rest show a placeholder. |
| 3 | Experience | `components/sections/Experience.tsx`, data in `lib/experience.ts` | Done (content comes from `inspirations/resume.md`). |
| 4 | Contact | `components/sections/Contact.tsx` | Done, but it has one lint error (see section 4). |
| — | Project detail pages `/projects/[slug]` | `app/projects/[slug]/page.tsx`, `components/projects/ProjectDetail.tsx` | Work, with placeholder hero images. |

Sections 2–4 are each wrapped in `components/layout/RevealSection.tsx`.
`components/providers/PageTransition.tsx` handles route transitions.

**Unused files:** removed in the 2026-10-25 cleanup (section 3g).

### Recent commits (newest first)

| Commit | Summary |
|---|---|
| `0268930`…`7cf2a50` | New curved projects carousel (13 commits: geometry helper, carousel, wheel, hover, swap-in and old-carousel removal, then review fixes). See the "Projects carousel" section. |
| `b2e5fb9` | Added these handoff notes. |
| `c265f3a` | Hero stage background set to pure white `#FFFFFF`. The earlier `#00000000` was a slip and was meant to be white. The transparent-clear handling was removed. |
| `ec71d50` | Adopted the user's panel-tuned values: ambient 3, key 1.6, rim 1.85, envMap 1.5, AO 0.5, fog 0→160, centre pull 0.75. |
| `6fdf2a7` | Added the dev-only Leva tuning panel (`SceneTuner.tsx`) and the live store (`scene-controls.ts`). |
| `47e22ed` | Layout fix: the canvas now fills the card exactly (`offsetSize` measurement, inset box-shadow ring instead of a border) and the card clears the nav. |
| `b6ea8ad` | Restored the `5ece2e2` lighting after `927c056` wrongly restored the muddy `99931a5` look. |
| `927c056` | **Mistake:** "restored" the rejected `99931a5` look. Superseded. |
| `573b3ee` | Scroll-linked the hero card into the next section (pin and scale). |
| `b244cf9` | Hero changed to an inset card instead of full-bleed. |
| `5ece2e2` | Warm off-white stage with true pastel spheres. This was the first approved look. |
| `99931a5` | Lighting rework. **Rejected as muddy** (dusty rose, olive, rust). |
| `bc9dc65` | Replaced the CSS blob background with the 3D sphere scene. |

### Uncommitted / half-finished
- Untracked on purpose: `inspirations/carouselimage.png` (the carousel reference image)
  and `reference/projects-review.md` (the review findings, with a summary for Eric at the top).
- Half-finished: the hero text restyle, the scroll-out transition (it doesn't
  match the intended design yet), the About section, the liquid-glass nav and
  the real project photos. Section 7 covers all of these.

---

## 3. The hero (most important)

### Concept
A dense cluster of 3D pastel spheres floating in zero gravity, like a ball pit
with no floor. The mood comes from The Weeknd's *House of Balloons* cover, but
in a **light** key: off-white/white stage, clean pastels, modern and
restrained. It should not feel playful. The cluster bleeds past the card edges
so it reads as a mass, not a ball floating in a frame.

### Files
| File | Role |
|---|---|
| `components/hero/Hero.tsx` | Inset card layout, scroll pin and scale, name, rotating label, signature, datestamp, scroll cue. Loads `HeroSpheres` through `next/dynamic` with `ssr: false` (this has to live in a client component). |
| `components/hero/HeroSpheres.tsx` | The `<Canvas>`: lights, fog, background, env map, postprocessing, frameloop control and the Leva mount. |
| `components/hero/SphereField.tsx` | Instanced spheres plus Rapier bodies, material, two-hue gradient shader, hue cycling and centre pull. |
| `components/hero/CursorRepeller.tsx` | Invisible kinematic ball collider that follows the cursor. |
| `components/hero/sphere-environment.ts` | Builds the PMREM env map from a tiny procedural "room" (no HDRI fetch). |
| `components/hero/sphere-scene.ts` | All physics, bounds, camera, fog and count constants, plus the seeded PRNG. |
| `components/hero/scene-controls.ts` | `APPROVED_SCENE` (single source of truth for the tunable values) and the live store / `useSceneValues()` hook. |
| `components/hero/SceneTuner.tsx` | Dev-only Leva panel. |
| `lib/tokens.ts` | `colors.scene.*` (key/rim/ao tints, card and page colours) and `spherePalette`. |

### How it works
- **Physics:** Rapier, gravity `[0,0,0]`. One `InstancedRigidBodies` with ball
  colliders wraps a single `instancedMesh`, so the whole field is one draw call.
  Motion is heavy and damped: linear damping 2.0, angular damping 1.5,
  restitution 0.04, friction 0.4.
- **Layout:** seeded (`mulberry32`, seed `20260224`). `Math.random` is banned
  in render by the `react-hooks/purity` lint rule. Positions are uniform in a
  unit ball, scaled to an ellipsoid with `BOUNDS_X 0.58` and `BOUNDS_Y 0.62` of
  the visible viewport and `BOUNDS_Z 3.4`. Radii run from 0.9 to 1.8, biased toward
  medium-large (no small spheres since 2026-10-25). The layout is built once on mount and is never rebuilt on resize,
  since a rebuild would restart the sim.
- **Centre pull:** every frame, each body gets an impulse toward the centre
  scaled by `centerPull`. Past the ellipsoid bounds the pull stiffens by
  `CONTAINMENT_GAIN 14` per unit of overshoot. This is cohesion, not gravity.
- **Cursor repulsion:** window-level pointer listeners (the canvas is
  `pointerEvents: none`, so the hero text keeps its hover handlers). The
  pointer is projected onto the z=0 plane and drives a kinematic
  `BallCollider`. The feel is ported from a "data-rain" reference: position
  lerp rate 18, velocity smoothing rate 10, influence attack 60ms, release
  200ms (so the cluster settles back slowly), snap-on-acquire, and a radius
  that grows with speed (base 64px + 0.025×speed, capped at +36px). Touch
  works. There is no autopilot idle orbit, on purpose.
- **Material:** `meshPhysicalMaterial` with roughness 0.52, metalness 0,
  clearcoat 0.25, clearcoat roughness 0.55, sheen 0.9, sheen roughness 0.6,
  and envMapIntensity from the store. The aim is soft latex or balloon.
- **Two-hue gradients:** each sphere has `instanceColor` (hue A) plus a custom
  instanced attribute `aColorB` (hue B). An `onBeforeCompile` shader patch
  blends A→B along the sphere's local Y. The attribute is attached
  declaratively, because attaching it imperatively races R3F and renders black.
- **Hue cycling:** each sphere drifts around the 6-colour palette ring with its
  own phase and a period of 20–45s, using smoothstep interpolation. Hue B sits
  0.06–0.14 further around the ring, so the two hues are always neighbours.
- **Lighting:** ambient, a warm key from the upper left (`colors.scene.key`
  `#FFEFD6`, position `[-7, 9, 7]`), a cool rim from behind
  (`colors.scene.rim` `#8FB4FF`, position `[3, -2, -9]`), and a PMREM env map
  built from three emissive panels. **The env map is a major light source.**
- **Tone mapping:** the Canvas is `flat` (NoToneMapping). ACES desaturated the
  pastels toward khaki. Setting `gl.toneMapping` directly does nothing,
  because R3F overwrites it.
- **AO:** N8AO with aoRadius 1.6, distanceFalloff 1.0, warm tint
  `colors.scene.ao` `#9A8F80`, quality medium, half resolution. It is followed
  by DepthOfField (target origin, focalLength 0.08, bokehScale 1.1, height 480).
- **Fog:** linear fog in the background colour, from `fogNear` to `fogFar`.
- **Camera:** position `[0, 0, 16]`, fov 45, near 0.1, far 60.
- **Performance safeguards:**
  - The scene is lazy-loaded with `ssr: false`, so three/rapier/postprocessing
    stay off the initial payload. `CLAUDE.md` documents this as the one
    exception to the 250kb budget.
  - Sphere count by width: 24 below 768px, 40 below 1280px, 64 otherwise
    (cut from 55/95/150 when the spheres got bigger).
  - Postprocessing only runs at ≥768px.
  - DPR is capped at `[1, 2]` and `antialias: false`.
  - `useInView` (100px margin) switches `frameloop` to `"never"` when the hero
    is off screen.
  - The canvas measures with `resize={{ scroll: false, debounce: 0, offsetSize: true }}`.
    `offsetSize` is required, because the card is CSS-scaled during scroll and
    `getBoundingClientRect` would size the canvas to the scaled box.
- **Reduced motion** (`useReducedMotion`): frameloop `"demand"`, no Physics, no
  cursor, no postprocessing. Spheres are drawn once at their seeded positions.
  The card isn't pinned or scaled, and the text has no entrance animation.

### APPROVED LOOK: do not change without Eric's say-so
Eric tuned these in the Leva panel, in a real browser on a real GPU. They live
in `APPROVED_SCENE` (`components/hero/scene-controls.ts`), with fog and pull
coming from `sphere-scene.ts` and the palette from `lib/tokens.ts`.

| Value | Current | Where |
|---|---|---|
| Ambient light intensity | **3** | `APPROVED_SCENE.ambient` |
| Key light intensity | **1.6** (colour `#FFEFD6`) | `APPROVED_SCENE.key`, `colors.scene.key` |
| Rim light intensity | **1.85** (colour `#8FB4FF`) | `APPROVED_SCENE.rim`, `colors.scene.rim` |
| envMapIntensity | **1.5** | `APPROVED_SCENE.envMapIntensity` |
| N8AO intensity | **0.5** (tint `#9A8F80`) | `APPROVED_SCENE.ao`, `colors.scene.ao` |
| Stage background | **`#FFFFFF`** (pure white) | `APPROVED_SCENE.background` |
| Fog near / far | **0 / 160** | `FOG_NEAR`, `FOG_FAR` in `sphere-scene.ts` |
| Centre pull | **0.75** | `CENTER_PULL` in `sphere-scene.ts` |
| Balloon opacity (centre / edge) | **0.7 / 0.7** | `APPROVED_SCENE.opacity`, `.edgeOpacity` |
| Fresnel falloff | **2.5** | `APPROVED_SCENE.fresnelPower` |
| Sphere radius (min / max) | **0.9 / 1.8** | `RADIUS_MIN`, `RADIUS_MAX` in `sphere-scene.ts` |
| Sphere count (desktop / tablet / phone) | **64 / 40 / 24, plus 5+5 / 3+3 / 2+2 extra big+medium** | `COUNT_*`, `EXTRAS_*` in `sphere-scene.ts` |

Palette (`spherePalette` in `lib/tokens.ts`), in ring order:
1. `#B9A7F0` lavender
2. `#8FC4F2` baby blue
3. `#8ADFC1` mint
4. `#F4A9C0` blush pink
5. `#F8BE96` peach
6. `#F5DE8E` butter yellow

Other colours involved, which were not part of the panel tuning:
- `colors.scene.bg` `#F4F1EC` is the card's own CSS background (it shows only
  before the canvas mounts) and the base of the env-map "room"
  (`sphere-environment.ts`, ×0.95).
- `colors.scene.page` `#ECE7DF` is the frame colour around the card.
- The env panels are key ×1.6 at `[-9,11,8]`, rim ×0.7 at `[11,-4,-9]`, and
  key ×0.35 at `[0,-14,0]`.

**Stale comments to be aware of:** the APPROVED LOOK comment blocks inside
`HeroSpheres.tsx` (above the lights and above N8AO) and `SphereField.tsx`
(above the material) still describe the old `5ece2e2` values (1.35 / 0.95 /
0.55 / 1.15 / 0.45). They also warn that a strong key makes the spheres muddy,
and that turned out to be wrong. **The table above is correct.** If you edit
those files, fix the comments to match, but don't change the values.

### Dev-only Leva tuning panel
- It only appears under `npm run dev`. `DEV_TUNING` is
  `process.env.NODE_ENV === "development"`, which is replaced at build time, so
  Leva is tree-shaken out of production.
- Folders: **Lighting** (ambient, key, rim, envMapIntensity, ao), **Stage**
  (background, fogNear, fogFar, centerPull) and **Palette** (hue1–hue6).
- It starts from `APPROVED_SCENE` and writes into a module-level store
  (`setSceneValues`). The scene reads that store through `useSceneValues()`
  (`useSyncExternalStore`). Panel changes are live and are **never** saved to
  disk by themselves.
- **"copy values"** copies a paste-ready block to the clipboard, with each
  changed value annotated `// was <old>`. If the clipboard is blocked, it logs
  the same text to the console. Eric pastes that block into chat, and the next
  session commits it into `APPROVED_SCENE`, `sphere-scene.ts` and
  `lib/tokens.ts`.
- **Gotcha:** Leva's colour picker can return 8-digit hex with alpha.
  `THREE.Color` only parses 3- or 6-digit hex. Anything else triggers a warning
  and keeps the previous colour. If an 8-digit value shows up in a paste, ask
  what was meant (`#00000000` turned out to mean white).

### Inset card layout
- The outer wrapper is `HERO_SCROLL_RANGE = 170svh` tall. Inside it, a sticky
  `100svh` frame (background `colors.scene.page`) has padding
  `HERO_INSET = clamp(16px, 1.6vw, 24px)` and a top padding of
  `NAV_CLEARANCE = 82px`, so the card starts below the fixed nav (nav at
  top 24px, ~50px tall).
- The card (`<motion.section id="home">`) has height
  `calc(100svh - 82px - HERO_INSET)`, `overflow: hidden`, and an animated
  border radius. Its edge is an **inset box-shadow ring**, not a `border`,
  because `inset: 0` on the canvas resolves against the padding box and a
  border would leave a 1px gap.
- The canvas wrapper uses `borderRadius: inherit` and `overflow: hidden`, so
  the corners clip cleanly.
- Last measured at 1440×900: nav 24→74px, card 82→877px, canvas exactly the
  card size.

### Scroll transition: intended vs. actual
- **Intended (Eric's spec):** the hero stays pinned at near full size for
  about 70% of its scroll, then collapses *quickly* to a tiny speck at the
  centre of the screen (like olegponyat.com). Then the About section scrolls
  in.
- **Actual code today** (`Hero.tsx`): progress runs 0→1 over the 170svh
  container, measured by hand with scroll and resize listeners (`useScroll`
  with a sticky target proved unreliable). Over `[0, PIN_END = 70/170]` the
  card scales **1 → 0.88** and the radius goes **22 → 44px**. After that the
  pin releases and the card simply scrolls away. There is **no speck
  collapse** and there's no About section to hand off to. This needs
  rebuilding together with the About work (section 7). When you do it: keep
  scale near 1 until about 0.7 progress, then use a fast collapse toward 0
  with a named easing (`ease-expo` or `ease-swift`; `ease-in-out` is banned).
  Remember that the canvas keeps its offset size while scaled, which is fine.

---

## 3b. Projects carousel (added 2026-10-24)

The curved carousel replaces the old `ProjectsCarousel.tsx`, which has been deleted.
The spec is `reference/projects-plan.md`. The review and the summary for Eric are in
`reference/projects-review.md`. The target look is `inspirations/carouselimage.png`.

**Files**
| File | Role |
|---|---|
| `components/projects/CurvedCarousel.tsx` | Container. Owns the single `position` MotionValue (in card units), measures with a ResizeObserver, and handles drag with velocity snapping, click-vs-drag, keys, focus, the prev/next buttons and the live region. |
| `components/projects/CarouselSlide.tsx` | Derives one card's transform and opacity from `position` with `useTransform`, so nothing re-renders per frame. |
| `components/projects/ProjectCard.tsx` | Image, title and year. Spotlight sheen plus tilt of up to 3° on hover, only for `(hover: hover) and (pointer: fine)`. Shows a placeholder when there's no image. |
| `components/projects/carousel-geometry.ts` | All geometry and tuning constants: `computeGeometry` and `slidePose`. |
| `hooks/useHorizontalWheel.ts` | Axis-locked wheel handling. It consumes horizontal gestures and stops them before Lenis sees them. Vertical scrolling always reaches the page. |
| `lib/projects.ts` | `getCoverImage(p)` returns `heroImage`, else the first section image, else `null`. |
| `lib/tokens.ts` | Added `bezier` (easing tuples for framer-motion) and `colors.overlay.spotlight`. No existing value changed. |

**How it works:** it's a real CSS 3D concave cylinder. The perspective equals the radius,
so the camera sits on the cylinder's axis and the apparent scale is `1/cos θ`: the centre
card is flat and smallest, and the edges are taller. Each card is placed with
`translateZ(R) rotateY(−θ) translateZ(−R)`. The strip loops, with a fallback to a finite
strip if there are too few projects. Card width interpolates smoothly with container
width (`CARD_WIDTH_STOPS`: 74% of the width on phones, 296px at 400, 317px at 1440,
400px at 1920). The curve strength `EDGE_ANGLE_DEG` goes from 26° to 50°, and the gap
and edge mask also ease between 480 and 1280px. Cards dim toward the edges, and their
title row fades out before the image does. Only transform and opacity animate.

**Interaction rules:**
- A swipe counts snap steps from the card the drag started on: 1 card for a normal
  swipe, at most 2 for a flick.
- Clicking a side card centres it. Clicking the card the strip is resting on opens
  `/projects/[slug]`. A click during a snap never opens a project. Keyboard Enter opens
  the focused card.
- Arrow keys work only with focus inside the carousel. Home and End jump to the first
  and last project.
- Reduced motion gives a flat 2D strip with instant moves and no hover effects.

**Decisions made without Eric (listed in the review file):**
- The headline is left-aligned, because CLAUDE.md bans centred section layouts.
- `heroImage` stays unset. The source images are 850px or smaller, so they'd look soft
  as detail-page heroes.
- The section stays pure white, as before, which matches the reference.
- No 21st.dev code was copied. The Spotlight Card license is unknown, and the Tilted
  Grid Hero source is behind a login.

**Open items:**
- Colour and feel, real trackpad gestures (including the back-swipe), real touch, and
  Safari/Firefox are all unverified. Only headless Edge was used.
- N1: 1440 shows 3 full cards plus slivers. This is a look call; tune it with
  `CARD_WIDTH_STOPS` and `EDGE_ANGLE_DEG.wide`.
- N2: at 450–640px the neighbours' half-faded titles are cut off at the screen edges.
- 3 of 6 projects (desk, keyboard, bonsyfilms) have no photos yet. The covers that do
  exist are low resolution.
- In dev, the Leva panel covers the carousel at 375px. Hide it when testing at that width.
- `components/ui/carousel.tsx` and `embla-carousel-react` are now only used by the unused
  `gallery6.tsx`.

---

## 3c. Liquid-glass nav (added 2026-10-25)

`components/layout/Header.tsx` keeps the same links, mono font, active dot and
fixed position (top 1.5rem, centred). New pieces:

| File | Role |
|---|---|
| `components/layout/NavGlass.tsx` | Glass layers behind the pill: backdrop (refraction or frosted), white tint, inset bevel edge. |
| `components/layout/nav-glass-controls.ts` | `APPROVED_NAV_GLASS` defaults plus the live store. Production only ever reads the defaults. |
| `components/layout/NavGlassTuner.tsx` | Dev-only Leva folder "Nav glass" with a "copy nav values" button. Includes a dev-only "force fallback" toggle. |
| `lib/tokens.ts` | `colors.glass.*` (tint, edge light/shade, rim, shadow). |

- **Refraction (Chromium only):** `backdrop-filter: url(#svg-filter) saturate()`.
  The filter displaces the backdrop with blurred fractal noise. Chromium is
  detected via `navigator.userAgentData` after hydration, so the server
  render and Safari/Firefox use the frosted path: `blur() saturate()`.
- **Approved defaults:** refraction 95, edgeWidth 12, backgroundOpacity 0.35,
  saturation 2.15, fallbackBlur 16. Refraction is subtle over the hero because
  the spheres are large flat colours, so it only shows at colour edges.
- **Motion:** slides down on load (0.75s, 0.75s delay, ease-expo). Link hover
  is a colour change; the old animated underline was removed, per CLAUDE.md
  anti-AI rule 8. The active dot glides via a shared `layoutId`. Reduced
  motion: no slide, the dot jumps.
- **Not verified:** real Safari and Firefox. The fallback was checked by
  forcing it in headless Edge. Claude in Chrome wasn't connected, so the
  screenshots are headless Edge.
- The pasted 21st.dev `liquid-glass-button` was used as a concept only. It
  bundled unrelated Button/MetalButton code and had no license.

---

## 3d. Typography (updated 2026-10-25)

Loaded in `app/layout.tsx` via `next/font/google`:

| Font | CSS variable | Used for |
|---|---|---|
| Plus Jakarta Sans | `--font-display` | Hero name, rotating role, section headlines, project titles (`text-display-*`). Unchanged. |
| Geist | `--font-geist-sans` | Body text, UI, skill pills. Unchanged. |
| Fraunces (variable, `opsz` axis, normal + italic) | `--font-fraunces` (Tailwind `font-serif`) | Nav links, labels, years, captions, counters. |
| Geist Mono | `--font-geist-mono` | Kept only for shadcn internals. |

JetBrains Mono was removed entirely.

- `.text-label`: Fraunces 0.8125rem, regular, sentence case, normal
  tracking. Used for years, card meta, captions, counters, and detail-page
  metadata.
- `.text-eyebrow`: the same in italic, at 0.875rem. Used for section and
  context labels ("Portfolio / 2026", "Selected Work", "Experience", the
  mobile menu footer).
- Both use `font-optical-sizing: auto`, so the opsz axis follows the font size.
- `tabular-nums` is kept only on the carousel counter.
- Note: `CLAUDE.md` still says "Inter is the only font" and describes
  `text-mono-label`. Neither matches the code. Inter was never loaded; the
  body font is Geist.

---

## 3e. About section (added 2026-10-25)

Sits between the hero and Projects (`app/page.tsx`). The hero's wrapper
surface is now `bg.secondary`, the same as About, so the collapse hands off
with no colour seam. Shrink timing is unchanged.

**All editable content is in `lib/about.ts`:** greetings, paragraphs, photos,
links and the song. The current copy is all marked PLACEHOLDER.

| File | Role |
|---|---|
| `components/sections/About.tsx` | Two columns on desktop, stacked on mobile. Off-white, with a fade/slide-in on scroll. |
| `components/sections/TypingGreeting.tsx` | Fraunces headline in `accent.deep` (#5B47B8, about 6.6:1). Types and deletes through the greetings with a blinking cursor. Reduced motion shows the first greeting, static. |
| `components/sections/PhotoViewer.tsx` | Fixed 4:5 frame with arrows overlaid, crossfade, swipe, arrow keys when focused, wraps, and a `n / total` counter. Shows a pastel placeholder when `src` is null. |
| `components/sections/MusicWidget.tsx` | "On repeat lately" card with 30 CSS-animated equaliser bars in a palette gradient. Paused off-screen and static for reduced motion. Below 480px the bars wrap onto their own row. |

**Nav changes:**
- "Home" is now a house icon. The link has `aria-label="Home"`.
- New "About" link to `/#about`. The active dot tracks it.
- The mobile menu still shows "Home" as text.

**Open items:**
- `/public/about/` is empty, so the viewer shows 4 placeholders.
- `/public/resume.pdf` doesn't exist, so the resume link 404s until it's added.
- The second link (LinkedIn) is hidden until its `href` is set.
- The prompt said Inter for body text, but the site's body font is Geist, so
  About uses Geist.

---

## 3f. Site accent (2026-10-25)

The old yellow accent is gone. The accent now comes from CSS variables in
`app/globals.css` (`:root`):
- `--accent`: default `#ff6b4a` (Coral, since 2026-10-25).
- `--accent-soft`: `--accent` mixed 18% into white, for tints.
- `--accent-strong`: `--accent` mixed 90% with black, for large text. Raw
  coral is only about 2.6:1 on the off-white; this is about 3.2:1. Used for
  the "Selected Work" heading and the Contact email.
- `--accent-text`: `--accent` mixed 72% with black, for small text. It clears
  4.5:1 on the off-white for every preset.

`colors.accent.primary`, `.soft`, `.strong` and `.text` in `lib/tokens.ts` point at these
variables.

- There is no Leva control for the accent. The Accent folder was removed at
  Eric's request; change `--accent` in `app/globals.css` directly.
- shadcn's own grey `--accent` was renamed to `--accent-ui`.
- The Experience timeline dot's yellow glow is now a soft accent ring.

---

## 3g. Dead-code cleanup (2026-10-25, branch `cleanup-dead-code`)

**Removed:**
- Unused 21st.dev copies: `gallery6`, `glassmorphism-trust-hero`,
  `motion-footer`, `scroll-morph-hero`. The originals are still in
  `inspirations/`.
- All of `components/ui/`, including the old blob background.
- `lib/typography.ts` and `tailwind.config.ts`. Tailwind v4 never loaded the
  config file, because there is no `@config`.
- `audit-report.md`, plus 9 unreferenced files in `/public` (old screenshots
  and create-next-app SVGs).
- 8 dependencies: the Radix packages, `radix-ui`,
  `class-variance-authority` and `embla-carousel-react`.
- From CSS: the blob keyframes and `--animate-*`, `.text-display-sm`, the
  unused `@theme` colour/ease/duration entries, and Geist Mono.
- Tokens: `colors.accent.glow` and `colors.scene.page`.

**Merged:**
- `DEV_TUNING` now lives in one place, `lib/dev-tuning.ts`.
- The local `expoEase`/`swiftEase` arrays were replaced with `bezier.*` from
  `lib/tokens.ts`.

**Kept on purpose:**
- `lib/utils.ts`, `clsx` and `tailwind-merge`, for future shadcn / 21st.dev
  components.
- shadcn's CSS variables, `.dark` and the `shadcn` / `tw-animate-css` imports.
- `components.json` still points at `@/components/ui`, so `npx shadcn add`
  recreates it.

**Verified:** page and section heights, loaded fonts, and pixel-identical
Projects and Experience screenshots at 1440 and 375, before and after.
`README.md` was rewritten as a short real readme.

---

## 3h. Balloon translucency (2026-10-25)

The spheres are slightly see-through.

- **Shader:** in `SphereField.tsx`, an alpha term in the existing
  `onBeforeCompile` patch goes from `opacity` in the centre to `edgeOpacity`
  at the rim (fresnel, `fresnelPower`). Specular highlights are forced opaque
  so they stay crisp. No transmission is used.
- **Sorting:** three.js doesn't sort instances inside one mesh. The physics
  mesh is now an invisible source (`visible={false}`, low-poly, still used for
  the colliders). Each frame, a visible draw mesh copies its matrices and
  colours sorted back-to-front.
- **AO:** the spheres keep writing depth, and `userData.treatAsOpaque` keeps
  N8AO treating them as opaque.
- **Tuning:** the Leva "Balloon" folder has opacity, edge opacity and fresnel
  falloff. They're included in "copy values".

---

## 3i. Tools band (2026-10-25)

`components/sections/ToolsBand.tsx` sits between About and Projects
(`app/page.tsx`). The content (heading, plus a tool list of name and
simple-icons slug) lives in `about.tools` in `lib/about.ts`.

- **Logos:** from the `simple-icons` package, via named imports in the
  component's `ICONS` map. A new slug must be added there too. The icons are
  tinted with `--accent` at 0.42 opacity and go to full opacity on hover.
- **Text labels:** used for Fusion 360 (only a generic Autodesk logo exists),
  Inventor, Onshape and CapCut (not in simple-icons).
- **Motion:** a CSS marquee. The list is rendered twice and the track slides
  `-50%`, linearly, at about 3.2s per item. The edges fade out with a mask.
- **Pausing:** it pauses on hover (and shows the tool name in Geist) and when
  off-screen (`useInView`).
- **Reduced motion:** a static row.
- **Removing the heading:** set `about.tools.heading` to `null`.

---

## 4. Known issues

- **Hydration warning with prefers-reduced-motion** (`Hero.tsx`, the name
  letters). `useReducedMotion()` returns `null` on the server and `true` on a
  reduced-motion client. The render branches on it with
  `{reduced ? char : <motion.span>}` and `initial={reduced ? false : "hidden"}`,
  so server and client markup differ. Fix: render the same tree on both sides
  and disable the motion through props or variants, or gate it on a mounted
  flag. The sticky/relative switch and `HERO_SCROLL_RANGE` height branch on
  `reduced` in the same way.
- **Scroll transition doesn't match the spec** (see section 3).
- **Hero text was styled for the old background.** The name uses
  `colors.text.primary` and the label uses `colors.text.secondary`, sitting
  straight over the spheres with no treatment. The signature uses
  `mixBlendMode: multiply`. Legibility over bright pastels is unverified.
- **Nav legibility over the scene** hasn't been addressed.
- **Lint does not pass** (`npx eslint app components lib`):
  - `components/providers/SmoothScroll.tsx:50`: reads `lenisRef.current` during
    render (react-hooks error).
  - `components/sections/Contact.tsx:177`: synchronous `setState` inside an
    effect.
  - Unused 21st.dev files (`motion-footer.tsx`, `scroll-morph-hero.tsx`): `any`
    types and `Math.random` in render.
  - Warnings: `easing` and `swiftEase` unused in `Hero.tsx`; `colors` unused in
    `scene-controls.ts` (left over after the white-background change); `index`
    unused in `ProjectsCarousel.tsx`; `colors` unused in `tailwind.config.ts`.
  - Lint over the whole repo also scans `inspirations/`, which produces more
    errors. Those are reference files and not shipped.
- **Typecheck is clean** (`npx tsc --noEmit`).
- **`CLAUDE.md` contradicts itself on typography and colours.** It says "Inter
  is the only font", then later lists Geist + JetBrains Mono + a display font.
  `app/layout.tsx` actually loads Geist, Geist Mono, Plus Jakarta Sans and
  JetBrains Mono. Its colour scale (`bg.plain`, `text.loud`…) doesn't match
  `lib/tokens.ts` (`bg.primary`, `text.primary`…), and the hero accent hex is
  still a TODO (`#edd97e`). Don't "fix" any of this without asking Eric which
  source is right.
- **Fragile:**
  - The env-map room colour comes from `colors.scene.bg` (`#F4F1EC`), not from
    the panel's background. Changing the token shifts the lighting.
  - `NAV_CLEARANCE` (82px) is hard-coded against the current nav size. A new
    nav means updating it.
  - The sphere layout isn't rebuilt on resize, so rotating a phone keeps the
    original bounds.
  - Performance hasn't been profiled on a low-end GPU or phone.

---

## 5. Lessons learned (read these)

1. **Correction (2026-10-25): SwiftShader was not the problem.** The env map
   was dead in dev because of a React Strict Mode bug (useMemo + effect
   cleanup disposed it), and `material.envMapIntensity` never applied because
   the env map comes from `scene.environment` (three uses
   `scene.environmentIntensity` for that). Both are fixed in `HeroSpheres.tsx`:
   dev, production and headless now render the same, so headless screenshots
   are valid for relative comparisons. The approved look has env intensity 0.
2. **`99931a5` is the muddy look Eric rejected** (dusty rose, olive, rust).
   Don't "restore" toward it. It was wrongly chosen once (`927c056`) because I
   ranked commits by colour statistics taken from headless renders, and an
   HSL-saturation metric scores contrasty muddy shading higher than clean
   pastels.
3. **Heavy AO and a low key light make the pastels muddy.** AO at 1.2 was too
   heavy, and removing AO entirely flattened the cluster. The current approved
   values have bright ambient, key and rim. Note: an older note said a strong
   key causes mud, and Eric's tuning proved that wrong.
4. **Lighting and colour changes go through the Leva panel and Eric's
   approval.** Don't adjust these by eye or on your own initiative. Eric tunes,
   presses "copy values" and pastes, and you commit what was pasted, exactly.

6. **Running `npm run build` while the dev server is up corrupts the dev
   server's CSS.** Both write to `.next`. The dev server then keeps serving
   stale `globals.css`, with old variables and missing new classes, and
   changes appear not to apply. After any production build, restart
   `npm run dev`, or build into a separate copy.

---

## 6. Working preferences

- One change at a time, and commit after each one.
- Small tweaks: no plan, no checks at several widths, no full build. Make the
  change and commit; Eric checks it in the browser.
- Bigger changes (layout, new features): a short plan first, then **wait for
  Eric's OK** before building.
- If you're stuck on one issue for about 10 minutes, stop and ask.
- Keep summaries short (a few lines, not a report).
- Stay in scope. Don't build sections that weren't asked for.
- Use the tokens and the named easings. `ease-in-out` is banned. Follow the
  anti-AI-design rules in `CLAUDE.md`.
- Commit messages use conventional commits (`feat:`, `fix:`, `docs:`…), except
  where Eric dictates an exact message.

---

## 7. Next steps, in order

1. **Restyle the hero text** (name and rotating role) so it reads well over the
   spheres, and **fix the hydration warning** while you're in there (section 4).
   Colour and legibility have to be judged in a real browser.
2. **Build the About section** that the hero transitions into. Rebuild the
   hero exit to match the spec: pinned near full size for about 70%, then a
   quick collapse to a speck at the centre, then About scrolls in. Add an
   About link to the nav. This is a bigger change, so plan first.
3. ~~**Liquid-glass pill nav**~~ Done 2026-10-25, see section 3c. (Reference: olegponyat.com's nav.) Use real
   refraction in Chromium (SVG displacement filter via `backdrop-filter: url()`)
   and a frosted `backdrop-filter: blur()` fallback in Safari and Firefox.
   Update `NAV_CLEARANCE` in `Hero.tsx` if the nav size changes.
4. **Add real project photos** to the projects carousel. Cards use
   `getCoverImage` (`heroImage`, then the first section image). The desk, keyboard
   and bonsyfilms projects still have no photos. Higher-resolution covers would also
   help (the current ones are 850px or smaller).
5. **Add other 21st.dev components** one at a time, and only where each has a
   clear place. Check each one's license first. Candidates are already sitting
   unused in `components/` and `inspirations/`. Adapt them to the design
   system rather than pasting them in.
