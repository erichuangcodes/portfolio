# Summary for Eric (read this first)

**Built:** a new curved projects carousel that replaces the old one. It is the inside of a
cylinder, like `inspirations/carouselimage.png`. The centre card is flat and smallest, and
cards turn inward, grow taller and fade toward both edges. It loops through all 6 projects.

- **Input:** drag and swipe snap by velocity, one card per normal swipe. Horizontal trackpad
  scrolling moves the strip, and vertical scrolling always scrolls the page. Arrow keys, Home
  and End work when focus is inside the carousel. There are 44px previous/next buttons.
- **Hover (desktop only):** a soft spotlight sheen and a tilt of up to 3°.
- **Reduced motion:** the strip is flat and moves instantly.
- **Accessibility:** cards are focusable links, the region is labelled as a carousel, and a
  live region announces the current card.
- **Checks:** 3 review rounds, ending in PASS. `tsc`, ESLint on the touched files and
  `npm run build` are clean. The hero, nav, providers, layout and globals are unchanged since
  `b2e5fb9`, and no APPROVED LOOK value was touched.

**Decisions I made without you:**
- **Missing references:** `reference/curved-carousel.png` and `reference/hero-carousel.tsx`
  don't exist. I worked from `inspirations/carouselimage.png` and your written list of
  techniques.
- **No 21st.dev code copied:** the Spotlight Card's license is "unknown", and the Tilted Grid
  Hero (MIT) source is behind a login. Both were used as concepts only. No install was run.
- **Headline:** "From CAD model / to the real thing.", left-aligned. CLAUDE.md bans centred
  section layouts, so I didn't centre it like the reference.
- **Images:** the first section image of each project serves as its cover. That gives Aerio
  `version2aerio.png`, the chair `chairgallery.png` and the FTC robot `ftcrobotirl.png`. The
  desk, keyboard and bonsyfilms cards show a token-coloured placeholder with the role. I didn't
  set `heroImage`, because the PNGs (≤850px) would look blurry as detail-page heroes.
- **Clicks and navigation:** clicking a side card centres it, and clicking the centred card
  opens `/projects/[slug]`. The strip loops instead of ending.
- **Background:** the section stays pure white, as it was before, which matches the reference.
- **Card size:** card width now changes smoothly with screen width instead of jumping at
  breakpoints.

**Check first (I couldn't verify these):**
1. **Colour and feel in a real browser.** Claude in Chrome wasn't connected, and headless
   screenshots don't show true colour. Look at the sheen, the placeholders and the edge fade.
2. **Real trackpad and real phone.** Check horizontal swipes, vertical scrolling over the
   strip, and that the browser's back-swipe gesture doesn't fire.
3. **Curve and density (N1).** 1440 shows 3 full cards plus slivers. For more cards or a
   stronger curve, edit `components/projects/carousel-geometry.ts`: `CARD_WIDTH_STOPS`
   (1440 → 317px) and `EDGE_ANGLE_DEG.wide` (50°; the reference is about 56°).
4. **Soft covers on retina screens.** Higher-resolution photos would fix this.
5. **Leva panel in dev.** At 375px, the hero tuning panel covers the carousel. This is
   dev only and doesn't affect production.

---

# Round 3

Reviewed `457c02e..7cf2a50` (1 commit, `CurvedCarousel.tsx` only). The harness is
`scratchpad\carousel-round3.mjs` and `carousel-round3b.mjs` (headless Edge, with `#leva__root`
and the Next dev badge hidden). Colour is still unverified.

## Verdict: PASS

N3 is fixed and the regression pass is clean. No BLOCKER, HIGH or MEDIUM issues remain apart
from N1, which the orchestrator kept by decision (as with N2).

## Per-item status
| Item | Status | Evidence (1440 mouse unless noted) |
|---|---|---|
| N3: incoming card clicked mid-snap | **Fixed** | Clicked Next, then clicked the incoming card at +120ms (strip 0.16 from it) and at +40ms (strip 0.5 away). Neither navigated, and both ended centred on the clicked card. Touch at 375 (+120ms): same result. |
| N3: outgoing card clicked mid-snap | **Fixed** | At +25ms (strip −0.5) and at +200ms (strip already 0.05 from the *next* card): no navigation, and the strip returned and centred the clicked outgoing card. |
| At-rest side card click | ✅ | Centres the card without navigating. At 375, a touch tap on the visible 24px sliver centres it without navigating. |
| At-rest centre card click | ✅ | Navigates (`/projects/bonsyfilms` with the mouse at 1440, `/projects/adaptive-standing-desk` with touch at 375). |
| A drag never navigates | ✅ | Two 0.61-card drags each moved exactly +1, ended exactly centred, and the path stayed `/`. |
| Keyboard Enter | ✅ (the deviation behaves as stated) | Tab to card 2, then Enter at +60ms (strip 0.38 away) opens `/projects/adaptive-standing-desk`. Enter at rest opens it too. ArrowRight then Enter at +60ms opens the new card. |
| **Enter deviation: acceptable?** | **Yes** | Keyboard focus has already made the focused card the target, and that card's accessible name is what was just announced. So Enter opens exactly the card the user chose, never the one under a moving strip. Blocking Enter until the tween settles would break normal link activation and make Enter feel dead for about 500ms. One untested caveat (LOW, no action): screen-reader activations that don't move DOM focus (NVDA/JAWS browse mode, `detail === 0`) on a non-target card will centre it rather than open it. A second activation opens it. That's acceptable. |
| Regression | ✅ | `tsc` exits 0. ESLint on the touched paths exits 0. `npm run build` passes. The protected-files diff against `b2e5fb9` is empty, and the hex/rgba/cubic/banned-pattern grep is empty. Horizontal wheel: +1, no page scroll, settled. Vertical wheel: page +400px, strip unchanged. ArrowRight outside the carousel does nothing. ArrowRight/ArrowLeft inside give exactly ±1. No page exceptions. |
| N1, N2 | Kept by decision, not re-raised | Not re-tested. The geometry was untouched in this round. |

Code note: `pressRestIndexRef` is cleared on every pointer click, so a press always refreshes it.
I found no new issues in the diff.

---

# Round 2

Reviewed `de14df0..457c02e` (6 fix commits) with my own repros: a headless Edge CDP harness
(`scratchpad\carousel-round2.mjs`, with the dev-only Leva panel and the Next dev badge hidden
before every interaction) and a pure sweep of `computeGeometry`/`slidePose` from 320 to 2600px
(`scratchpad\geom-sweep.mjs`). As in round 1, colour is unverified (no real-colour browser).

## Verdict: PASS WITH ISSUES

H1 is fixed and there are no BLOCKER or HIGH findings. Every claimed fix holds up under my own
repros, and the regression pass is clean. One MEDIUM is still open: the 1440 card count. It isn't
a regression, but it's still below the "about 4 cards" target.

## Build and regression pass
- ✅ `npx tsc --noEmit` exits 0. `npx eslint app/page.tsx components/projects hooks lib` exits 0 with no output. `npm run build` passes.
- ✅ The protected-files diff against `b2e5fb9` is empty. `grep ProjectsCarousel` finds nothing. The hardcoded hex/rgba/cubic/banned-pattern grep on the new files is empty.
- ✅ Wheel: a vertical stream over the carousel scrolls the page 400px and the strip doesn't move. A horizontal stream moves it one card, the page doesn't scroll, and it settles exactly on a card.
- ✅ Keys: ArrowRight with focus outside does nothing. Tab visits all 6 links in order, each `:focus-visible` and centred exactly, and the 7th Tab goes to "Previous project". ArrowRight from bonsyfilms wraps to Aerio, then ArrowLeft, Home and End work.
- ✅ Click: a side click centres the card without navigating, and a centre click opens `/projects/aerio`. At 375 a touch tap on the centre card navigates.
- ✅ Reduced motion: `perspective: none`, `translateX` only, ArrowRight applied on the next frame, and a drag gives +1. The only console error is the known pre-existing Hero/PageTransition hydration mismatch under reduced motion. A normal-motion load logs no errors.

## Status of round-1 findings
| ID | Status | Evidence |
|---|---|---|
| **H1** swipe skips a card | **Fixed** | At 1440 (mouse): a 0.61-card drag at ~330 px/s gave **+1 four times out of four** (round 1 gave +2). A 0.91-card drag gave +1 (2/2). A 0.3-card slow drag held then released snaps back to 0 (2/2). A 0.3-card fast flick gives +1 (2/2), and a 1.5-card fast drag gives +2 (2/2), so it stays within 1–2. At 375 (touch): a 180px swipe at ~940 px/s gave **+1 three times out of three** (round 1 gave +2). A slow 90px swipe snaps back (2/2). A vertical touch swipe leaves the strip still. Every run ends exactly centred. The code now counts from `panStartRef` (`CurvedCarousel.tsx` `handlePanStart`/`handlePanEnd`), and the clamp is applied after the minimum step. |
| **M1** breakpoint jump at 1024 | **Fixed** | The sweep from 320 to 2600px shows card width is **monotonic** (no decreases), changes by **at most 1px per 1px** of width, and loops at **every** width. Values: 1009 → 308, 1023/1024/1025 → 309, 1280 → 314, 1440 → 317, 1920 → 400. In the browser, a 1024 window (1009 container) and a 1009 window (994 container) both give 308px, so a Windows scrollbar no longer changes the layout. At 375 the centre card is 278px = **74.1%** ✅. |
| M1 extra: "~4–5 cards at 1440" | **Not met (unchanged)** | At 1440 there are still 3 full cards (±1 100% on screen), and the ±2 cards show only ~34px of image (≈2–3% of their width) at opacity 0.65 under the 10% mask. See N1. |
| **L1** edge text fragments at 1440 | **Fixed** | `metaOpacity` is 0 on both ±2 cards (34px of their meta row is on screen but invisible), and it stays 1 on the centre and ±1 cards. The 1440 screenshot no longer shows "26" or "Av". At 375 the ±1 meta opacity is 0.05 (only a 24px sliver). There's a residual issue at 450–640px, see N2. |
| **L2** placeholder label contrast | **Fixed** | The label is now `colors.text.secondary` `#404040` on `#F5F5F4`, about 9.6:1 (AA and AAA). |
| **L3** wheel scrub then arrow jumps back | **Fixed** | Repro: a 2.3-card wheel scrub, then ArrowRight inside the 140ms idle window. The final card is 0 → **3** (expected 3), the per-frame centred-card sequence is `0,1,2,3` (never backwards), and focus followed to card 4's link. `onDelta` now keeps `targetRef` in step, and `onEnd` skips if a commit happened mid-stream. |
| **L4** press doesn't catch a snap | **Fixed** | Repro: click Next, and 90ms later press on an empty spot in the viewport. The strip **holds still** while pressed (centred-card offset 71px at both +0 and +350ms). On release it settles exactly on the nearest card (offset 0), with the live region consistent and no navigation. |
| **L6** unused `enabled` option | **Fixed** | Removed from `useHorizontalWheel`, along with its dependency. |
| M2, M3, L5, L7, L8, L9 | **Deferred by the orchestrator, not re-raised** | No change was observed in any of them. L5 now runs 4 `slidePose` calls per slide per frame instead of 3 (the new `metaOpacity` transform). That's still negligible and is only noted for completeness. |

## New findings
- **N1 — MEDIUM (open, not a regression): about 3 cards at 1440, not about 4–5.** `carousel-geometry.ts` `CARD_WIDTH_STOPS` (`[1440, 317]`) with `EDGE_ANGLE_DEG.wide = 50`. With pitch 331 and a 604px radius, the ±2 card's inner edge sits at ~48° against a 50° edge, so only a 2–3% sliver shows, and it's inside the fade mask. To get ~4–5 cards, narrow the 1440 stop to ≈ 260–270px (18–19%, closer to the reference's measured 0.21 × width at its smaller page). That puts the ±2 inner edge at ~40°, so roughly 200px of each ±2 card shows. Leave `edgeAngle` alone, because a stronger curve reduces the count. This is a look decision for Eric. The current result is coherent, and it's the same as round 1.
- **N2 — LOW: half-faded title fragments for the ±1 cards at ~450–640px containers.** `slidePose` fades the meta row by the card's *inner*-edge angle. At 480 the ±1 card is only 15% on screen but its meta opacity is 0.56, so "2025-" and "Adaptiv…" show cut off at the screen edges (`review-shots-r2\w480.png`). This is the same kind of thing as the M2 partial neighbours the orchestrator accepted, so it's optional. A fix would key the fade on the *outer* edge, or on the on-screen fraction (for example, `(|θ| + halfAngle) / edge`).
- **N3 — LOW / informational: a click during a snap now resolves against the settled target.** `handleSelect` compares against `targetRef` after `settleAfterPress`. Measured: clicking the *incoming* card 120ms into a Next snap opens it (`/projects/bonsyfilms`), which round 1 also did. New behaviour (from reading the code, not measured): clicking the *outgoing* card before the halfway point snaps back and opens it, where round 1 would re-centre it. Either way the user opens the card nearest the centre that they clicked on. I think this is acceptable; it's listed only so the change is visible.

---

# Projects carousel review — round 1

Reviewer: independent, did not see the build. Branch `cleanup`, reviewed `b2e5fb9..de14df0`
(6 commits). Evidence comes from tsc, eslint, `npm run build`, git diffs, code reading, and a
headless Edge (CDP) harness run against the `npm run dev` server already on :3000.
Claude in Chrome was **not available** in this session, so **all colour judgements are
unverified**: headless SwiftShader screenshots are used only for geometry, layout and behaviour.

## Verdict: PASS WITH ISSUES

The build is healthy and the protected areas are untouched. The curve matches the reference
in shape: the centre card is flat and smallest, the outer edges are taller, the sides fade out.
Keyboard, Tab, loop, click-vs-drag, wheel axis-lock, reduced motion and ARIA all behave as
specified. There is **one HIGH defect to fix before merge**: the snap logic skips a card on
ordinary swipes and drags. The remaining findings are MEDIUM and LOW polish items, plus two
plan/requirement mismatches that Eric needs to decide on.

---

## Acceptance checklist (plan §7)

**Build health**
- ✅ `npx tsc --noEmit` is clean (exit 0, no output).
- ✅ `npx eslint app/page.tsx components/projects hooks lib` reports 0 problems (exit 0, no output). The old `ProjectsCarousel` `index` warning went away with the file.
- ✅ `npm run build` passes. `/` is static and all 6 `/projects/[slug]` are SSG.
- ✅ `git diff --stat b2e5fb9..HEAD -- components/hero components/layout components/providers app/layout.tsx app/globals.css` is empty.
- ✅ `grep -rn ProjectsCarousel app components` finds nothing, and the file is gone. `ProjectDetail.tsx` is unchanged.
- ✅ No `ease-in-out`/`easeInOut`/`shadow-md`/`shadow-lg`, hex, `rgba(` or cubic arrays in the new files (grep is empty). The `lib/tokens.ts` diff only adds lines (`overlay.spotlight`, `bezier`), and no existing value changed.

**Look**
- ⚠️ At 1440: the centre card is flat (`rotateY(0rad)`) and the shortest (236px tall). The ±1 cards' outer edges are taller than their inner ones (329 vs 238px, from content quads). The sides fade (mask 10% plus EDGE_DIM). **But only 3 cards read clearly.** The ±2 cards show only ~45px slivers inside the masked zone, so the "about 4 cards, as in the reference" claim is a stretch (see L1). The fade colour is unverified.
- ✅ At 375: the centre card is 278px (74% of the viewport), with ~24px neighbour slivers on both sides. There's no overflow.
- ❌ At 768 and 1024, "±1 fully visible": **not met.** At 768 the ±1 card spans x 552→1013 in a 768px viewport (≈47% visible). At 1024 on Windows (1009px container, see M1) it spans 707→1237 in 1009 (≈57% visible). The plan's §3.2 table is wrong: with the plan's own constants, the ±1 outer edge sits at 52° vs a 38° edge (768) and at 54° vs a 50° edge (1024). Horizontal page scroll is fine everywhere (`scrollWidth === clientWidth` at 375/768/1009/1024/1440).
- ✅ Covers match §2.3: Aerio, Chair and FTC have images, and Desk, Keyboard and bonsyfilms show the `bg.secondary` placeholder with their role label. Every card shows its title and year, and no title is clipped (`scrollWidth ≤ clientWidth` at every width).

**Interaction**
- ✅ Vertical wheel (4 × deltaY 100) over the carousel scrolled the page by 400px, and the strip's transforms were byte-identical. Lenis smoothness itself wasn't judged.
- ✅ A horizontal wheel stream (14 × deltaX 30) left `scrollY` unchanged, moved the strip one card and settled after idle (not yet at +100ms, done by +1s). Browser back-swipe can't be tested headless (⚠️).
- ❌ "A fast flick advances 1–2 cards" holds, but **an ordinary drag or swipe past half a card advances two cards** (H1). A vertical touch swipe over the carousel scrolls the page (✅, +210px, strip unchanged). A horizontal touch swipe moves the strip (✅).
- ✅ A 40px drag released on the same centre card doesn't navigate. A 300px drag doesn't navigate either. A click on the right-hand card centres it without navigating, and a click on the centre card goes to `/projects/aerio`. A touch tap on the centre card navigates.
- ✅ ArrowRight/Left inside the carousel move exactly one card. ArrowRight with focus outside does nothing. Home goes to 1 and End to 6. Focus follows the active link.
- ✅ Tab visits all 6 links in project order. Each one is `:focus-visible` with a 2px solid outline and centres itself, and the 7th Tab lands on "Previous project". The ring fits inside the clipped viewport (link bottom 652 vs viewport bottom 736). The ring colour is unverified.
- ✅ Loop: ArrowRight from bonsyfilms (6) goes to Aerio (1). By construction the wrap happens at |d| = 3, beyond `cullDistance` (2.14 at 1440, 2.84 at 2560), so the seam card is always at opacity 0. No flash showed in a per-frame recorder, though headless can't fully rule out a visual artefact.
- ✅ Resize from 1440 to 800 to 1440 with project 4 centred keeps project 4 centred at both sizes.
- ✅ Mouse hover gives spotlight opacity 1 and tilt `rotateX(0.9deg) rotateY(-0.96deg)` (the code caps it at 3°). During a drag the spotlight fades to 0 and the cursor is `grabbing`. After touch input, every spotlight's opacity is 0. The sheen colour is unverified.
- ✅ (headless proxy) During a 20-step drag there were 0 text and 0 childList mutations in the carousel (no React commits reach the DOM), 1 layout, and 147 style recalcs (these come with inline-transform writes; they're not layout). The 2 text mutations come only at snap (counter plus live region). The DevTools Performance panel wasn't run (⚠️).

**Reduced motion**
- ⚠️ (behaviour ✅, hydration unproven) The strip is flat (`translateX` only, `perspective: none`, stage 288px), ArrowRight is instant (all transforms shifted a full pitch on the next frame), and there's no tilt or sheen. ⚠️ The page throws a hydration error under reduced motion, and its diff points at `PageTransition` and `Hero` (the known pre-existing issue). React regenerates that whole tree, so a carousel mismatch would be masked at runtime. On code inspection the carousel's render output doesn't depend on `reduced` (it's used only in effects and handlers, and SSR and first render both use `FALLBACK_GEOMETRY`), so I expect it to be clean. A normal-motion reload logs no errors.

**Accessibility**
- ✅ Region: `role="region" aria-roledescription="carousel" aria-label="Selected projects"`. Slides: `role="group" aria-roledescription="slide" aria-label="n of 6"`. The live region reads "Project n of 6: Title" and updates on commit only. The buttons have labels, measure 44×44, and point `aria-controls` at the stage id (which exists).

**Other requirements from the original brief (not in §7)**
- ⚠️ "Off-white page": the section is `colors.bg.primary` `#FFFFFF`, pure white (M3).
- ✅ Hero, nav, providers and the APPROVED LOOK values are untouched.
- ✅ The old carousel is fully removed. `embla`/`components/ui/carousel.tsx` stay (unused, pre-existing, left alone per plan).
- ✅ Fonts: titles use `var(--font-display)` (Plus Jakarta Sans), and the year, role and counter use `.text-mono-label` (JetBrains Mono).
- ✅ Only transforms and opacity animate. Real-hardware fps wasn't measured.
- ⚠️ 21st.dev licensing: no copied code is evident (the code is idiomatic to this repo, and grep finds no upstream identifiers). The upstream sources are behind 21st.dev auth, so I couldn't diff against them.

---

## Findings (ranked)

### HIGH

**H1. A one-card swipe or drag lands two cards on.**
`components/projects/CurvedCarousel.tsx:158-164` (`handlePanEnd`)
```ts
const base = Math.round(current);
let t = Math.round(current + v * FLICK_PROJECTION);
...
if (Math.abs(v) > FLICK_MIN_VELOCITY && t === base) t = base + Math.sign(v);
```
`base` is the card nearest the *current* position, not the card the gesture *started* on. Once
a drag passes the halfway point, `base` is already the next card. If the pointer is still moving
at more than 0.6 cards/s (≈190 px/s at 1440, ≈173 px/s at 375, so almost any release that isn't
a full stop), the "push one step" rule fires and adds a second card. Simulating the function:
any drag of 0.5–0.95 cards with v ≥ 0.7 cards/s gives +2.
- **Repro (headless, measured):** at 1440, drag 200px (0.61 card) at ~330 px/s: 1 → 3. At 375, swipe 180px (0.63 card): 1 → 3. A 300px drag at 1440 (0.91 card): 2 → 4. Results vary a little with CDP release timing, but the function is deterministic.
- **Impact:** on phones only one card is visible, so a normal swipe silently skips a project. This is the primary touch interaction.
- **Fix:** record the start index on pan start (`startRef.current = Math.round(position.get())` or `targetRef.current`). Apply the minimum-flick step and the ±2 clamp relative to it: `if (|v| > MIN && t === start) t = start + sign(v)`, and clamp `t` to `start ± MAX_FLICK_CARDS`. Then re-test that a slow 0.6-card drag gives +1 and a fast short flick gives +1.

### MEDIUM

**M1. The breakpoint by container width makes cards jump in size at ~1024. Windows 1024 gets the tablet layout.** (question 5)
`components/projects/carousel-geometry.ts:26-30, 103-105`
- Measured: on a 1024 viewport with a classic 15px scrollbar, the container is 1009px, which falls in the `medium` row (card 360px, curve 38°). Above a 1024px *container* the card drops to 260px and the curve jumps to 50°. So card width goes 360 → 260 (−28%) across one pixel. It's also non-monotonic: the card is **larger at 1009 (360px) than at 1440 (314px)**. Every Windows desktop window between 1024 and ~1038px gets the medium layout, which contradicts the §7 "at 1024" check.
- **Assessment:** this is not a functional defect. The 1009 layout is coherent, with no overflow and no clipping, and the centre card and ±1 halves look fine. It *is* a design defect: the discontinuity is the real problem, and the scrollbar only decides which side of it a 1024 laptop lands on. A user resizing the window sees the cards shrink while the window grows.
- **Fix (pick one):** (a) make the parameters continuous, interpolating `cardFraction`, `maxCardWidth` and `edgeAngleDeg` between ~640 and ~1280 so threshold placement stops mattering (preferred); or (b) key the breakpoint on `window.innerWidth`/`matchMedia("(min-width: 1024px)")` to match the CSS and `sizes` breakpoints, *and* fix the non-monotonic card width (for example, cap medium's `maxCardWidth` at ≤ wide's width at 1024).

**M2. "±1 fully visible at 768 and 1024" is false, because the plan's §3.2 table is wrong.**
`reference/projects-plan.md:197-198`, `carousel-geometry.ts:27-28`
- At 768 the ±1 card spans 18°–52° against a 38° screen edge, so about half of it is off screen. At 1024 (wide) it spans 19°–54° against 50°. Screenshots show half-cut neighbours with their titles cut ("Adaptive Standing De…" at 768).
- This arguably still reads well (the reference also cuts its edge cards), but it fails the acceptance criterion as written. **Eric decides:** accept it, or raise `edgeAngleDeg` / lower `cardFraction` at medium so ±1 fits (for example 768: `cardFraction` ≈ 0.30 or edge ≈ 46°).

**M3. The "off-white page" requirement isn't met or recorded as a decision.**
`app/page.tsx:18` uses `colors.bg.primary` = `#FFFFFF`. The brief asked for an off-white page. The plan quietly treats the page as white ("fade into the white page"), and neither the Decisions list nor the code addresses it. Candidates are `colors.bg.secondary` `#F5F5F4` (but then the placeholder cards, also `bg.secondary`, would vanish) or the hero's `colors.scene.page` `#ECE7DF`. This needs Eric's call, and it can't be judged without a real-colour browser.

### LOW

- **L1. Edge debris at 1440.** The ±2 cards (opacity 0.65, 45px inside the 10% mask) leave title and year fragments at the bottom corners ("26" on the left, "Av" on the right, around y≈700). The meta row projects below and outside the image line, so these read as disconnected text. Fix: fade the meta row harder than the image near the edge (for example, its own opacity driven by `innerEdge/edge`), or widen the mask at wide.
- **L2. Placeholder role label contrast is 4.35:1.** `ProjectCard.tsx:129-134`: `#737373` on `#F5F5F4`, 12px uppercase, is below AA 4.5:1. Year labels on white are 4.74:1 (pass). Fix: use `text.secondary` for the placeholder label.
- **L3. A wheel scrub followed quickly by an arrow key or button can jump backwards.** `CurvedCarousel.tsx:118, 169-174`: `onDelta` moves `position` but not `targetRef`. An ArrowRight or Next pressed during a scrub (within 140ms of the last wheel event) commits `oldTarget + 1`, and then the stream's `onEnd` commits `round(position)` again. Fix: in `onDelta`, set `targetRef.current = Math.round(position.get())`, or have `onEnd` skip when a commit happened mid-stream.
- **L4. `onPointerDownCapture` doesn't stop a running snap animation**, which plan §4.1 calls for (`CurvedCarousel.tsx:221-223`). A press without movement during a tween lets it keep running under the cursor. Fix: add `animRef.current?.stop()` there (only if the press-to-catch feel is wanted).
- **L5. `slidePose` runs 3× per slide per frame** (`CarouselSlide.tsx:32-36`, separate `useTransform` calls for transform, opacity and pointerEvents). 18 calls per frame is cheap, but one `useTransform` returning the pose with derived values would avoid it. Optional.
- **L6. Unused option.** `useHorizontalWheel`'s `enabled` (`hooks/useHorizontalWheel.ts:12, 38`) is never passed (YAGNI). Optional removal.
- **L7. Spotlight position is approximate on side cards.** `ProjectCard.tsx:79-83` maps the cursor through the 3D card's *bounding box*, which is a trapezoid, so on ±1 cards the sheen drifts from the cursor by up to ~20%. It's fine on the centre card. Acceptable, or limit hover effects to the active card.
- **L8. Headline is left-aligned, not centred like the reference.** This was a deliberate decision (plan Decision 9, CLAUDE.md anti-AI rule 4). Flagging it only so Eric sees it.
- **L9. Dev-only console noise.** The Next `Image ... detected as LCP` warning for `version2aerio.png` appeared only because the harness scrolled programmatically; the carousel sits well below the fold. No action needed.

---

## What I could not verify, and why

- **All colour:** card surfaces, the white spotlight sheen, the focus-ring accent, the fade into the page, and off-white vs white (M3). Claude in Chrome wasn't connected, and headless SwiftShader doesn't render true colour (HANDOFF lesson 1).
- **Real trackpad gestures:** browser back-swipe suppression, inertial scroll streams, and Lenis smoothness on vertical scroll. CDP wheel events don't reproduce OS gesture or inertia behaviour.
- **Real touch devices** (iOS Safari or Android), including the momentum feel of the spring snap. CDP touch events and `synthesizeScrollGesture` worked, but they're synthetic.
- **Safari and Firefox:** `preserve-3d`, `clip-path` rounding, and `-webkit-mask`.
- **The DevTools Performance panel and real-hardware 60fps.** I used MutationObserver plus `Performance.getMetrics` as a proxy.
- **Screen reader output** (NVDA/VoiceOver). I verified attributes and live-region text only.
- **Finite (non-loop) mode** on ultra-wide containers (≳2700px), which wasn't exercised.
- **Whether the carousel itself hydrates cleanly under reduced motion at runtime**, because it's masked by the pre-existing Hero/PageTransition mismatch (code inspection says yes).
- **21st.dev source comparison**, because upstream is auth-gated.

Harness scripts and screenshots (scratch, not committed):
`C:\Users\shari\AppData\Local\Temp\claude\c--CSdevelopment-eric-portfolio\26beca52-36d8-4f2a-a12a-bb546e5ab84b\scratchpad\carousel-review.mjs`,
`...\scratchpad\carousel-review2.mjs`, `...\scratchpad\carousel-review3.mjs`, and
`...\scratchpad\review-shots\` (`clean-1440.png`, `clean-768.png`, `clean-375.png`,
`1024.png`, `1440-focus.png`, `1440-reduced.png`, `results.json`, `results2.json`).
