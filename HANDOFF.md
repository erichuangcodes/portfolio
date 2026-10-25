# HANDOFF — Eric Huang portfolio

Notes for a fresh Claude Code session. Read this before you touch anything,
and read `CLAUDE.md` too, since it is loaded automatically. Where the two
disagree, this file reflects what the code does right now (as of 2026-10-24,
commit `c265f3a`).

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
| — | About | — | **Does not exist.** It is the next thing to build after the hero. Right now the Projects section is what rises into view as the hero exits. |
| 2 | Projects: "Selected Work" heading and a 3D rotating carousel | `app/page.tsx` (the heading), `components/projects/ProjectsCarousel.tsx`, data in `lib/projects.ts` | Works. **Placeholder images:** every project has `heroImage: null`, so cards show a gradient placeholder. Some section images are wired up (Aerio); photos sit in `public/projects/`. |
| 3 | Experience | `components/sections/Experience.tsx`, data in `lib/experience.ts` | Done (content comes from `inspirations/resume.md`). |
| 4 | Contact | `components/sections/Contact.tsx` | Done, but it has one lint error (see section 4). |
| — | Project detail pages `/projects/[slug]` | `app/projects/[slug]/page.tsx`, `components/projects/ProjectDetail.tsx` | Work, with placeholder hero images. |

Sections 2–4 are each wrapped in `components/layout/RevealSection.tsx`.
`components/providers/PageTransition.tsx` handles route transitions.

**Unused files** (nothing imports them; they look like 21st.dev imports staged
for later): `components/gallery6.tsx`, `components/glassmorphism-trust-hero.tsx`,
`components/motion-footer.tsx`, `components/scroll-morph-hero.tsx`,
`components/ui/background-gradient-animation.tsx` and its keyframes in
`globals.css`. Leave them alone unless asked.

### Recent commits (newest first)

| Commit | Summary |
|---|---|
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
- The working tree was clean before this file was added.
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
  the visible viewport and `BOUNDS_Z 3.4`. Radii run from 0.5 to 1.7, biased
  small. The layout is built once on mount and is never rebuilt on resize,
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
  - Sphere count by width: 55 below 768px, 95 below 1280px, 150 otherwise.
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

1. **Headless / SwiftShader screenshots don't show the real colours.** The
   software renderer gets nothing from the PMREM env map. This was verified:
   changing envMapIntensity from 1.0 to 0.0 changed headless mean lightness by
   0.002. Since the env map is a main light here, headless captures look
   under-lit and push you toward the wrong fix. **Never judge colour or
   lighting from them.** Use Claude in Chrome (start with `claude --chrome`)
   for screenshots in a real browser, or ask Eric to check. Headless *DOM
   geometry* (sizes, positions, overlap) is still reliable.
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
3. **Liquid-glass pill nav** (reference: olegponyat.com's nav). Use real
   refraction in Chromium (SVG displacement filter via `backdrop-filter: url()`)
   and a frosted `backdrop-filter: blur()` fallback in Safari and Firefox.
   Update `NAV_CLEARANCE` in `Hero.tsx` if the nav size changes.
4. **Add real project photos** to the projects carousel: set `heroImage` in
   `lib/projects.ts`. Photos already exist in `public/projects/` for several
   projects.
5. **Add other 21st.dev components** one at a time, and only where each has a
   clear place. Check each one's license first. Candidates are already sitting
   unused in `components/` and `inspirations/`. Adapt them to the design
   system rather than pasting them in.
