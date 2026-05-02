# Monof Template — Intro Animation

URL: https://monof-template.webflow.io/

## Animation sequence

1. **Entrance (0–0.5s):** Full white page. "MONO" wordmark fades in + scales 1.0 → 1.08. Centered. Clean, simple.
2. **Dwell (0.5s–2.2s):** "MONO" holds at full scale. User looks. This pause is intentional — ~1.7s of pure static hold. No motion.
3. **Exit scale (2.2s–3.2s):** "MONO" scales 1.08 → 0.3x, translates up to top-left corner (where the site logo/header lives), blur 0 → 6px. Duration ~1000ms. Easing: smooth, not snappy — probably cubic-bezier(0.25, 0.46, 0.45, 0.94) or similar.
4. **Overlay fade (starts at 2.4s, ends at 3.2s):** White overlay fades opacity 1 → 0 over ~800ms. Overlaps with the scale/translate, creating a unified dissolve effect.
5. **Complete (3.2s+):** Intro done. Page is live.

## Typography

- Font: appears to be a geometric sans (likely **PP Neue Montreal** or **Switzer** — verify in DevTools at the actual site)
- Letter-spacing: appears tight, maybe -0.02em
- Weight: Medium or 500

## Key design principles

- **The dwell matters.** Don't rush this. 1.7s of static hold creates anticipation.
- **Soft easing on exit,** not snappy. This is where most portfolios get it wrong — they use ease-in-out defaults and it feels generic.
- **Blur during exit** is subtle but crucial. Adds a cinematic, "things are dissolving" quality.
- **Overlap the animations.** The fade and scale/translate should start within ~200ms of each other, creating the sense of a unified motion.

## Our version

- **Keep the dwell.** 1.7–2.0s of static hold.
- **Match the easing** — soft cubic-bezier, not the sharp "swift" curve.
- **Add blur to the exit** — same effect.
- **Overlap the overlays** — fade and scale should feel synchronized.
- **Font:** Use the identified Monof font (or its Google Fonts equivalent).