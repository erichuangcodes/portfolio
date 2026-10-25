# Projects section: curved carousel plan

Planner output for the planner → executor → reviewer pipeline. Branch: `cleanup`.
Baseline commit: `b2e5fb9`. Written 2026-10-24 while Eric was away. Every judgement
call is listed under **Decisions**, so Eric can overturn any of them.

---

## 1. Summary

Replace `components/projects/ProjectsCarousel.tsx` (a 5-slot "coverflow" driven by
React state and springs per card) with a **concave cylinder carousel**. The camera
sits on the cylinder's axis, so the centre card is flat and smallest, and cards
toward both edges turn inward, grow taller and fade into the white page. One
framer-motion `MotionValue` (`position`, in card units) drives everything. Each
slide derives its `transform`/`opacity` from it with `useTransform`, so nothing
re-renders per frame. Input: drag/swipe (velocity snap), horizontal trackpad
wheel (axis-locked, so vertical page scroll is never trapped), arrow keys,
focus, prev/next buttons. Desktop mouse hover adds a spotlight sheen and a ≤3°
tilt.

### Reference check (`inspirations/carouselimage.png`, viewed)
Confirmed: concave interior view. The centre-left card is the smallest
(~0.21 × page width) and flat. The outer edge of the left card is ~1.8× the
centre card's height, the edge cards are cut off by the viewport and fade to
white, the corners are rounded (~14px), the gaps are ~10px, the headline is two
lines and centred, and a small grey two-line caption sits below. A fit of the
screenshot gives a radius of about 0.40 × width, with the camera near the axis.

### Decisions
1. **Missing references.** `reference/curved-carousel.png` and
   `reference/hero-carousel.tsx` do not exist (the `reference/` folder didn't
   exist before this file). The plan is built from `inspirations/carouselimage.png`
   plus the technique list in the brief.
2. **Licenses.**
   - *Tilted Grid Hero* (21st.dev, author `ruixen.ui`): the page lists **MIT**.
     Its source is behind 21st.dev auth (the registry JSON returned
     `authentication_required`), so nothing was read. Its description, "curved,
     endlessly streaming row of images that bends toward the viewer at the edges
     and fades out", matches our concept. **Concept only, no code copied.**
   - *Spotlight Card* (21st.dev, Hossain Jahed / EaseMize UI): license
     **"unknown"**. **No code copied, concept only** (a pointer-tracked radial
     gradient driven by custom properties).
3. **True CSS 3D, not a 2D fake.** Use `perspective` plus `rotateY` and
   `translateZ` on a cylinder. scaleY+skew can't produce the correct
   foreshortening (the edge closer to the camera gets taller, with trapezoid
   edges), and the 3D version costs the same: one composited transform per card.
4. **Camera on the axis (`perspective = R`).** This gives an apparent scale of
   exactly `1/cos θ`, and no vertex can ever reach the camera plane while
   |θ| < 90°.
5. **Infinite loop.** A finite strip shows an empty half-cylinder at both ends,
   which breaks the "curves in from one edge, flattens, curves away" ribbon. With
   6 projects, the loop is safe while `N > 2 × cullD` (see §3). Guard: if that
   fails (fewer projects, ultra-wide screen), fall back to finite mode.
6. **Cards always link to `/projects/[slug]`.** Every project has a detail page
   (`generateStaticParams` covers all of them), and external links such as the
   bonsyfilms TikTok are already shown there. Clicking a non-centre card first
   centres it. Clicking the centre card navigates.
7. **Images: no data changes.** Add `getCoverImage(p) = p.heroImage ??
   first section image ?? null` to `lib/projects.ts`. Don't set `heroImage`,
   because `ProjectDetail` renders it full-bleed at 100vw and all the PNGs are
   ≤ 850px wide, so it would turn the detail heroes blurry, which is out of
   scope. The fallback produces exactly the mapping in §2.3.
8. **Placeholder** for projects with no images is a token surface
   (`colors.bg.secondary`) showing `project.role` as a mono label. It does not
   use `project.gradient`, because that would be a generic gradient (anti-AI
   rule 1). The `gradient` field stays in the data for `ProjectDetail`.
9. **Headline is left-aligned on the 8% column, not centred.** CLAUDE.md
   anti-AI rule 4 forbids symmetric centred section layouts and overrides the
   reference image. Centring it is a one-line change if Eric wants it. Copy:
   mono label **"Selected Work"** (kept), then h2 **"From CAD model / to the
   real thing."** The caption is "Drag, swipe or use the arrow keys to browse.
   Open a project for the full write-up."
10. **Title and year sit below the image, inside the 3D card**, so they curve
    with it. This means no dark scrim, which keeps the reference's clean image
    tiles.
11. **Small controls are kept** (counter "02 / 06" plus 44px prev/next
    buttons) on the right of the caption row. A mouse-wheel-only user (no
    trackpad) needs a discoverable control, and the APG carousel pattern
    expects them. The old spinning-button animation is dropped.
12. **Hover effects are gated by `pointerType === "mouse"` and not reduced
    motion**, which in practice equals `(hover: hover) and (pointer: fine)`
    without a media-query hook. They are also off while dragging.
13. **Reduced motion gives a flat strip** (`translateX` only, no perspective).
    Snaps jump instantly, and there is no tilt or spotlight.
14. **Drop the `layoutId="project-image-…"` shared transition.** Layout
    projection measures bounding boxes and breaks inside a 3D-transformed
    parent. It also doesn't animate across routes here, because `PageTransition`
    swaps the whole tree. The `layoutId` in `ProjectDetail.tsx` stays and is
    harmless.
15. **Wheel vs Lenis.** Don't use `data-lenis-prevent-wheel`, because it would
    make vertical scrolling over the carousel native and un-smoothed. Instead, a
    native `wheel` listener on the viewport (`passive: false`) calls
    `preventDefault()` and `stopPropagation()` **only for horizontal-locked
    streams**. Lenis (1.0.42) listens on `window`, so it never sees those events.
    Vertical streams aren't touched, and Lenis scrolls the page as usual.
    (`useLenis()` always returns `null`, see `SmoothScroll.tsx:50`, so don't rely
    on it.)
16. **Add easing arrays to `lib/tokens.ts`** (`bezier.expo/swift/spring` as
    number tuples). framer-motion needs arrays, and this stops the hardcoded
    `[0.16,1,0.3,1]` copies from spreading. Also add one token,
    `colors.overlay.spotlight = "rgba(255, 255, 255, 0.22)"`.
17. **No test framework is added.** The repo has none, and installing one is out
    of scope. The geometry is kept pure (`carousel-geometry.ts`) so it can be
    unit-tested later. Verification is tsc, lint, build, and the browser
    checklist in §7.
18. Section padding stays at the existing inline `8rem` top and bottom, which is
    at or above the py-32 / py-16 minimums. Fonts come from the existing
    utilities: `.text-display-*` uses `var(--font-display)` (Plus Jakarta Sans),
    `.text-mono-label` uses `var(--font-jetbrains-mono)`, and the body uses
    `var(--font-geist-sans)`.

---

## 2. Files

### 2.1 New
| File | Role | Size |
|---|---|---|
| `components/projects/carousel-geometry.ts` | Pure code: breakpoint config, `computeGeometry(width, cardCount, reduced)`, `slidePose(position, index, geometry)`, `wrapOffset`, `nearestEquivalent`. No React. | ~120 lines |
| `components/projects/CurvedCarousel.tsx` | `"use client"`. Region, measurement (ResizeObserver), `position` MotionValue, drag/keys/focus/buttons, live region, caption row. | ~250 lines |
| `components/projects/CarouselSlide.tsx` | One 3D shell. `useTransform` → transform, opacity, pointerEvents. Wraps `ProjectCard`. | ~70 lines |
| `components/projects/ProjectCard.tsx` | Card face: `next/link`, image or placeholder, title and year, spotlight and tilt. | ~130 lines |
| `hooks/useHorizontalWheel.ts` | Native wheel listener with stream axis-lock and an idle callback. Creates the `hooks/` folder (CLAUDE.md convention). | ~60 lines |

### 2.2 Changed
- `app/page.tsx`: import `CurvedCarousel` instead of `ProjectsCarousel`, and
  replace the heading block (label plus two-line h2 with `<br />`, class
  `text-display-md`). Section wrapper, id `#projects`, background and padding
  stay as they are.
- `lib/projects.ts`: add `export function getCoverImage(p: Project): string | null`.
  Don't change any project data.
- `lib/tokens.ts`: **add** `bezier` and `colors.overlay.spotlight` (Decision 16).
  Don't change any existing value.

### 2.3 Image mapping (via `getCoverImage`, no data edits)
| Project (slug) | Cover | Source |
|---|---|---|
| aerio | `/projects/version2aerio.png` (450×306 product render) | sections[0].images[0] |
| adaptive-standing-desk | placeholder | no images |
| chair-design | `/projects/chairgallery.png` (515×473, gallery shot) | sections[0].images[0] |
| mechanical-keyboard | placeholder | no images |
| ftc-robot-2026 | `/projects/ftcrobotirl.png` (372×354, real photo) | sections[0].images[0] |
| bonsyfilms | placeholder | no images |

Note for Eric: these source files are low resolution (≤ 850px), so they'll be
slightly soft at 2× DPR on desktop cards (~320–400 CSS px). Higher-resolution
exports would fix it. `ftcrobotcadrealistic.png` has a white background that
would disappear into the page, so don't use it as a cover.
`inspirations/project-images/` is empty.

### 2.4 Deleted
- `components/projects/ProjectsCarousel.tsx`. Its only importer is
  `app/page.tsx:2`. Grep confirms nothing else.
- **Left alone:** `components/ui/carousel.tsx` and the `embla-carousel-react`
  dependency. They're imported only by `components/gallery6.tsx`, which is
  itself unused (HANDOFF lists it). Note this for Eric, but don't delete it.

### 2.5 Must not change
`components/hero/**`, `components/layout/Header.tsx`, `components/providers/**`,
`app/layout.tsx`, `app/globals.css` (no edits needed), the APPROVED LOOK values,
`ProjectDetail.tsx`, and `RevealSection.tsx`.

---

## 3. Geometry (all in `carousel-geometry.ts`)

### 3.1 Breakpoints (by measured container width `Wc` = viewport element `clientWidth`)
| Name | Wc | `cardFraction` | min / max card w | `edgeAngle` | `gap` | mask fade |
|---|---|---|---|---|---|---|
| compact | < 640 | 0.74 | 260 / 340 | 26° | 10px | 4% |
| medium | 640–1023 | 0.38 | 260 / 360 | 38° | 12px | 6% |
| wide | ≥ 1024 | 0.22 | 260 / 400 | 50° | 14px | 10% |

Other constants: `IMAGE_ASPECT = 4 / 3`, `META_HEIGHT = 36` (12px gap plus a
24px text row), `CARD_RADIUS = 14`, `THETA_LIMIT_DEG = 84`,
`CULL_MARGIN_DEG = 2`, `EDGE_DIM = 0.35`.

### 3.2 Derived values (`computeGeometry`)
```
w      = min(max(Wc·cardFraction, minW), maxW, Wc − 32)    // card width (px)
imageH = round(w / IMAGE_ASPECT);  shellH = imageH + META_HEIGHT
e      = edgeAngle (rad)        // angle at which the screen edge sits
R      = (Wc / 2) / tan(e)      // cylinder radius; ALSO the CSS perspective
pitch  = w + gap                // px per card unit (exact on-screen speed at centre)
dθ     = pitch / R              // rad per card unit (arc-length spacing)
a      = (w / 2) / R            // half-card angle
cullD  = (e + CULL_MARGIN + a) / dθ   // |offset| at which a card's inner edge leaves the screen
loop   = cardCount > 2·cullD + 0.1
stageH = ceil(shellH / cos(e)) + 16  // tallest visible slice + focus-ring room
```
Checked numerically (camera on axis):

| Wc | w (% of Wc) | R | dθ | cullD | edge scale | neighbour visible |
|---|---|---|---|---|---|---|
| 375 | 278 (74%) | 384 | 42.8° | 1.14 | 1.11 | ~30px sliver each side |
| 768 | 292 (38%) | 491 | 35.4° | 1.61 | 1.27 | ±1 fully, ±2 not |
| 1024 | 260 (25%) | 430 | 36.5° | 1.90 | 1.56 | ±1 fully, ±2 partly |
| 1440 | 317 (22%) | 604 | 31.4° | 2.14 | 1.56 | ±1 fully, ±2 partly (~4 cards, as in the reference) |
| 1920 | 400 (21%) | 806 | 29.4° | 2.25 | 1.56 | same |
| 2560 | 400 (16%) | 1074 | 22.1° | 2.84 | 1.56 | loop still OK (6 > 5.78) |

`edgeAngle` is the single "curve strength" knob. 50° gives an edge scale of
1.56; the reference is about 1.8 (≈ 56°). Eric can tune it.

### 3.3 Per-slide pose (`slidePose(position, i, g)`)
```
d   = g.loop ? wrapOffset(i − position, N) : i − position   // wrapOffset → [−N/2, N/2)
θ   = d · dθ
θc  = sign(θ) · min(|θ|, THETA_LIMIT − a)     // never let the outer edge pass 84°
φ   = |θ| − a                                 // inner-edge angle
culled  = φ ≥ e + CULL_MARGIN
transform = `translateZ(${R}px) rotateY(${-θc}rad) translateZ(${-R}px)`
            // = translate3d(R·sinθ, 0, R(1−cosθ)) rotateY(−θ): on the cylinder, facing the axis
opacity = culled ? 0 : 1 − EDGE_DIM · smoothstep(0.35, 1, φ / e)
pointerEvents = culled ? "none" : "auto"
```
- **Concave check:** a card at θ>0 moves toward the viewer by `R(1−cosθ)`.
  With perspective `R`, its scale is `1/cosθ`, so it gets taller toward the
  edges, and its outer edge is taller than its inner one. That matches the
  reference. The centre card has θ=0: flat, scale 1, the smallest on screen.
- **Reduced motion (flat):** `transform = translateX(${d·pitch}px)`,
  `culled = |d|·pitch − w/2 > Wc/2`, no perspective on the stage,
  `stageH = shellH + 16`.
- **Culled cards** keep their clamped transform and stay focusable (opacity 0,
  no `visibility: hidden`). Focus brings them to the centre (§4.5).
- **Z-order:** none is set. Inside `preserve-3d` the browser depth-sorts by z,
  cylinder cards never intersect, and the gap keeps the slivers apart.
  `z-index` is ignored in the 3D context, so don't add it.

### 3.4 DOM / CSS structure (order matters for Safari)
```
div.viewport  (motion.div — pan handlers, wheel listener, onKeyDown)
  style: position:relative; height:stageH; overflow:clip; touch-action:pan-y;
         cursor:grab (grabbing while panning); user-select:none;
         mask-image + WebkitMaskImage: linear-gradient(to right,
           transparent 0, black F, black calc(100% − F), transparent 100%)
         ↳ the mask is alpha only, not a design colour. Use the CSS keywords
           `transparent`/`black` and add a comment saying so.
  div.stage   style: position:absolute; inset:0; perspective:${R}px;
              perspective-origin:50% 50%; transform-style:preserve-3d
    CarouselSlide × N  (motion.div) style: position:absolute; left:50%; top:50%;
              width:w; height:shellH; margin:-shellH/2 0 0 -w/2;
              transform/opacity/pointerEvents = MotionValues;
              backface-visibility:hidden (+Webkit); will-change:transform,opacity
      ProjectCard (no 3D on the slide's children except its own tilt)
```
Safari and Chromium pitfalls to respect:
- Use `overflow: clip`, **not `hidden`**. A `hidden` box is still a scroll
  container, and focusing an off-centre link would scroll it sideways and
  desync the strip.
- Don't put any grouping property (`overflow`, `opacity`, `filter`, `mask`)
  on `.stage`, because it would flatten the 3D. Mask and clip go on
  `.viewport`, which sits outside the 3D context.
- `.stage` must be the **direct** parent of the slides, since preserve-3d
  doesn't pass through extra wrappers.
- Round corners with `clip-path: inset(0 round 14px)` **and** `border-radius: 14px`
  on the image box. Safari fails to clip `overflow:hidden` + radius on
  3D-transformed layers.
- Tilt goes on the card face with framer `transformPerspective: 1000`, so it
  doesn't need an extra 3D context and can't intersect its neighbours.
- `perspective` is a plain px value from state, and it only changes on resize.
- The whole thing sits inside `RevealSection`'s `overflow: clip` +
  `translateY` wrapper. That's fine, because it's outside our 3D context.

### 3.5 Measurement
`ResizeObserver` on `.viewport`. Its callback calls
`setGeometry(computeGeometry(entry.contentRect.width, N, reduced))`. Don't
measure synchronously inside the effect body: the repo's `react-hooks`
set-state-in-effect rule forbids it, and RO's first callback already fires
before paint. Keep `geometry` as `null` until then. While it's `null`, render
the viewport with `visibility:hidden` and `height: clamp(300px, 34vw, 540px)`.
The section is ~2 viewports below the fold, so a one-frame size change can't be
seen. Server and client markup stay identical, so there's no hydration mismatch.
Only branch on `useReducedMotion()` inside effects and handlers, and in
`computeGeometry` after mount. Re-run the computation when `reduced` changes.
`position` is in card units, so resizing never jumps the strip.

Lint traps in this repo (react-hooks v7 rules): don't read `ref.current` during
render, don't call `setState` synchronously in an effect body, and don't use
`Math.random` in render.

---

## 4. Interactions

State: `position = useMotionValue(0)` (unbounded real number in loop mode,
clamped to `[0, N−1]` in finite mode), `targetRef` (an integer), `animRef`
(current `AnimationPlaybackControls`), `activeIndex` (React state, set **only**
when a target is committed, never per frame), and `movedRef` (whether the
current pointer gesture dragged).

Helpers:
- `goTo(index, mode)`: `t = nearestEquivalent(index, targetRef.current, N)`
  (the shortest way round, via `wrapOffset`), then call `commit(t, mode)`.
- `commit(t, mode)`: set `targetRef`, `setActiveIndex(mod(t,N))`,
  `animRef.current?.stop()`, then:
  - reduced → `position.set(t)`
  - mode `"tween"` → `animate(position, t, { duration: duration.base/1000, ease: bezier.expo })`
  - mode `"spring"` → `animate(position, t, { type:"spring", stiffness:220, damping:32, mass:1, velocity, restDelta:0.001 })`

### 4.1 Drag / swipe
framer-motion `onPanStart` / `onPan` / `onPanEnd` on `.viewport`
(`touch-action: pan-y` lets the browser keep vertical touch scrolling).
- `onPointerDownCapture`: `movedRef = false`, then stop any running animation.
- `onPanStart(e, info)`: if `|info.offset.y| > |info.offset.x|`, mark the
  gesture ignored and return (axis lock). Otherwise set `data-dragging` on the
  viewport (CSS cursor plus hover suppression).
- `onPan`: `position.set(position.get() − info.delta.x / pitch)`. Set
  `movedRef = true` once `|info.offset.x| > CLICK_SLOP (6px)`. In finite mode,
  rubber-band past the ends at 0.3× the delta.
- `onPanEnd`: `v = −info.velocity.x / pitch` (units/s).
  `t = round(position + v·0.2)`. Clamp `t` to `round(position) ± 2`. If
  `|v| > 0.6` and `t === round(position)`, push it one step in the direction
  of `v`. Then `commit(t, "spring")` with `velocity: v`.
- `draggable={false}` on `<a>` and `<img>`, so the native link or image drag
  ghost doesn't steal the gesture.

### 4.2 Click vs drag
In `ProjectCard`'s link `onClick`: if `movedRef.current` is true, call
`e.preventDefault()` and stop. Else if this slide isn't the active one
(`index !== activeIndex`), call `e.preventDefault()` and `goTo(index,"tween")`.
Otherwise let `next/link` navigate. Pass `isActive` and an `onSelect(index, e)`
callback down, and keep `movedRef` in the carousel.

### 4.3 Wheel / trackpad (`hooks/useHorizontalWheel(ref, { onDelta, onEnd, enabled })`)
- `el.addEventListener("wheel", h, { passive: false })`. React's `onWheel` is
  passive and can't `preventDefault`.
- Normalise: `px = delta × (deltaMode===1 ? 16 : deltaMode===2 ? el.clientWidth : 1)`.
- Ignore `e.ctrlKey` (pinch zoom).
- **Stream lock:** a new stream starts after `WHEEL_IDLE_MS = 140` with no
  events. Its axis is decided by the first event: `"x"` if `|dx| > |dy|`,
  else `"y"`.
  - `"y"` stream: do nothing. Don't preventDefault and don't stopPropagation.
    Lenis scrolls the page. **Vertical scrolling is never trapped.**
  - `"x"` stream: `preventDefault()` (stops the browser's back-swipe and
    overscroll), `stopPropagation()` (Lenis never sees it), then
    `onDelta(dx)` → `position.set(position.get() + dx / pitch)` with any
    running animation stopped.
- Each event resets the idle timer. On idle, call `onEnd()` →
  `commit(round(position), "tween")` (reduced: set).
- Clean up the listener and the timer on unmount. Keep the latest callbacks in
  refs that are updated in an effect, not during render.

### 4.4 Keyboard
`onKeyDown` on the carousel **region** (not `window`, because the old carousel
captured arrow keys site-wide).
- `ArrowRight` → `goTo(targetRef+1)` and `ArrowLeft` → `−1`.
  `Home`/`End` → index 0 / N−1. Call `preventDefault()`. Build from `targetRef`
  so key repeat stacks up cleanly.
- If the focused element was a slide link, move focus to the new active link
  with `linkRefs[i].focus({ preventScroll: true })`. If focus is on a
  prev/next button, leave it there.

### 4.5 Focus
On each link's `onFocus`: if `e.currentTarget.matches(":focus-visible")`
(keyboard focus, not a mouse-down focus that would fight a drag), call
`goTo(index, "tween")`. If it's already the target, do nothing. Tab order
follows the DOM (project order), and every link stays tabbable.

### 4.6 Buttons
Prev/next `<button type="button">`, 44×44px, `aria-controls` = stage id, Lucide
`ChevronLeft`/`ChevronRight` (20px, stroke 1.75). Styling: `bg.primary`,
`1px border.subtle` ring. On hover (mouse) the background goes to
`bg.secondary` with a CSS transition of `durationMs.fast` + `easing.swift`.
No scale, spin or glow.

### 4.7 Resize
RO → new geometry → slides re-render once with the new closure.
`useTransform` re-binds every render (framer 12 `useCombineMotionValues`), so
the poses update immediately. `position` stays as it is.

---

## 5. Card, hover, reduced motion, a11y, responsive

### 5.1 ProjectCard
- `<Link href={"/projects/" + slug} draggable={false} aria-label="{title}, {year}. View project"
  className="block rounded-[14px]">`. The global `:focus-visible` ring (2px
  accent, 3px offset) shows outside the image. Don't clip the link.
- Image box `height: imageH`, `borderRadius` + `clipPath` 14px,
  `boxShadow: inset 0 0 0 1px ${colors.border.subtle}`.
  - Cover: `<Image fill alt="" draggable={false} sizes="(max-width: 639px) 74vw, (max-width: 1023px) 38vw, 400px" style={{objectFit:"cover"}} />`.
    The alt is empty because the link already carries the name, so the image is
    decorative.
  - Placeholder: `background: colors.bg.secondary`, with `project.role` in
    `.text-mono-label` in `colors.text.muted`, bottom-left, 16px inset.
- Meta row (12px gap, 24px tall, flex, space-between, baseline): the title uses
  `font-family: var(--font-display)`, 1rem, weight 500, `colors.text.primary`,
  single line with ellipsis. The year uses `.text-mono-label` in
  `colors.text.muted`.
- **Spotlight:** an absolute overlay inside the image box,
  `pointer-events:none`. The background comes from `useMotionTemplate`:
  `radial-gradient(220px circle at ${x}px ${y}px, ${colors.overlay.spotlight}, transparent 70%)`.
  `x`/`y` are motion values set in `onPointerMove` from
  `getBoundingClientRect()` of the image box. Opacity is a MotionValue
  animated to 1 on enter and 0 on leave (`duration.fast/1000`,
  `bezier.swift`). It's active only when `e.pointerType === "mouse"`, not
  reduced, and the carousel isn't dragging.
- **Tilt:** face `rotateX`/`rotateY` come from
  `useSpring(mv, { stiffness: 180, damping: 22 })`, plus
  `transformPerspective: 1000`. `rotateY = nx · 3°` and `rotateX = −ny · 3°`,
  with `nx`/`ny` in [−0.5, 0.5]. Reset to 0 on leave. It uses the same gating
  as the spotlight.
- No hover scale, no shimmer, no gradient border (anti-AI rules 6 and 8).

### 5.2 Reduced motion
Flat strip (§3.3). Snaps jump. Drag still follows the finger 1:1, since that's
direct manipulation, and releasing jumps to the nearest card. No tilt or
spotlight, and no CSS transitions on the buttons (use `motion-reduce:transition-none`).

### 5.3 Accessibility
- Region: `<div role="region" aria-roledescription="carousel" aria-label="Selected projects">`.
- Slide: `role="group" aria-roledescription="slide" aria-label="{i+1} of {N}"`.
- Live region: a `<p className="sr-only" aria-live="polite">` reading "Project
  {i+1} of {N}: {title}", updated from `activeIndex` (on commit only, so it
  stays quiet during drag or wheel scrubbing).
- Counter: `aria-hidden` (it duplicates the live region).
- Caption contrast: `colors.text.muted` `#737373` on white is 4.7:1, which
  passes AA.

### 5.4 Responsive specifics
375px: card is 74% of the width (278px), the curve is gentle (edge scale 1.11),
and a ~30px sliver of each neighbour shows. The caption row stacks (caption
above, controls below, both left-aligned at 8%). Controls are 44px touch
targets. At 768px, 1024px and 1440px, see the table in §3.2. Heading and
caption use the existing `paddingLeft/Right: 8%`. The carousel viewport is full
section width, with no side padding.

---

## 6. Build order (one commit per step; `npx tsc --noEmit` after each)

1. `feat: add cover-image helper and motion easing tokens`.
   `getCoverImage` in `lib/projects.ts`, plus `bezier` and
   `colors.overlay.spotlight` in `lib/tokens.ts`.
2. `feat: add curved carousel geometry helper`.
   `carousel-geometry.ts` with breakpoints, `computeGeometry`, `slidePose`,
   `wrapOffset`, `nearestEquivalent`, and the flat or reduced variant. Spot-check
   the §3.2 table with a throwaway node script in the scratchpad. Don't commit
   the script.
3. `feat: add curved projects carousel with drag and snapping`.
   `CurvedCarousel` + `CarouselSlide` + `ProjectCard` (no hover effects yet):
   RO measurement, poses, pan with velocity snap, click vs drag, prev/next
   buttons, counter, live region, keyboard and focus. It isn't mounted yet.
4. `feat: add horizontal wheel scrubbing to the projects carousel`.
   `hooks/useHorizontalWheel.ts`, wired in.
5. `feat: add spotlight and tilt hover to project cards`.
6. `refactor: replace ProjectsCarousel with the curved carousel`.
   `app/page.tsx` gets the new import and the new heading copy. Delete
   `components/projects/ProjectsCarousel.tsx`.
7. Verify (§7). If anything needs fixing: `fix: …` commits.

Don't touch the hero, nav or provider files. Don't install packages.

---

## 7. Acceptance criteria

**Build health**
- [ ] `npx tsc --noEmit` is clean.
- [ ] `npx eslint app/page.tsx components/projects hooks lib` reports **0
      problems in touched and new files**. Pre-existing failures elsewhere
      (`SmoothScroll.tsx`, `Contact.tsx`, unused 21st.dev files) are allowed.
- [ ] `npm run build` passes.
- [ ] `git diff --stat b2e5fb9..HEAD -- components/hero components/layout components/providers app/layout.tsx app/globals.css`
      is empty. (Use `b2e5fb9`, not `main`, because `main..HEAD` already
      contains earlier hero work.)
- [ ] `grep -r ProjectsCarousel app components` returns nothing. The
      `ProjectsCarousel.tsx` file is gone.
- [ ] No `ease-in-out`, `easeInOut`, `shadow-md` or `shadow-lg`, and no
      hardcoded hex or cubic arrays in new files (`grep -nE "#[0-9a-fA-F]{3,6}|easeInOut|ease-in-out|0\.16, ?1" components/projects hooks` shows nothing new).

**Look (check in a real browser; headless is OK for DOM geometry only)**
- [ ] At 1440×900, the centre card is flat (computed transform has no Y
      rotation at rest) and is the shortest card. The d=±1 cards' outer edges
      are taller than their inner edges. About 4 cards are visible, and the edge
      cards fade into white.
- [ ] At 375px, the centre card's rendered width is ≥ 70% of the viewport
      (≈278px), with neighbour slivers visible on both sides.
- [ ] At 768px and 1024px, the layout matches the §3.2 table (±1 fully
      visible), and there's no horizontal page scrollbar at any width
      (`document.documentElement.scrollWidth === innerWidth`).
- [ ] Cards with an image show the cover from §2.3. The other three show the
      token placeholder with the role label. Every card shows its title and year.

**Interaction**
- [ ] A vertical mouse wheel or a vertical trackpad scroll with the pointer over
      the carousel scrolls the page smoothly (Lenis), and the strip doesn't
      move.
- [ ] A horizontal two-finger trackpad swipe moves the strip, doesn't scroll
      the page or trigger browser back navigation, and settles on a card about
      140ms after the gesture ends.
- [ ] Mouse drag and touch swipe move the strip 1:1. A fast flick advances 1–2
      cards. A vertical touch swipe over the carousel scrolls the page.
- [ ] A drag that ends over a card doesn't navigate. A click on a side card
      centres it. A click on the centre card opens `/projects/[slug]`.
- [ ] With focus inside the carousel, ArrowRight advances exactly one card and
      ArrowLeft goes back one. Arrow keys **outside** the carousel do nothing to
      it. Home and End jump to the first and last project.
- [ ] Tab moves through all 6 links in project order, each focused card
      animates to the centre, and the focus ring is visible.
- [ ] It loops: ArrowRight from bonsyfilms (6) goes to Aerio (1) with no visible
      jump or flash at the wrap seam.
- [ ] Resizing the window mid-way keeps the same centred project.
- [ ] Mouse hover over a card shows a soft sheen following the cursor and a tilt
      of ≤ 3°. Neither shows on touch or during a drag.
- [ ] DevTools Performance during a drag: no React commits per frame (only
      `activeIndex` commits on snap), and the main thread is free of layout or
      recalc-style storms. Only transform and opacity change.

**Reduced motion (emulate in DevTools)**
- [ ] The strip is flat (no `rotateY` in the transforms), arrows and buttons
      jump instantly, and there's no tilt or sheen. The page loads without a
      hydration warning from the carousel.

**Accessibility**
- [ ] The region has `aria-roledescription="carousel"` and a label. Slides
      are labelled "n of 6". The live region announces "Project n of 6: Title"
      after each move. The buttons have labels and are 44×44px.
