# Webflow 3D Carousel — Reference

URL: https://webflow.com/made-in-webflow/website/3d-carousel-kjp452sc

## Animation behavior

- **Visible cards:** 5 total (center + 2 on each side). Center is largest, full opacity. Cards immediately left/right are ~60% scale, 50% opacity. Cards at ±2 are tiny (~30% scale), barely visible.
- **Navigation:** Click arrows to advance. All cards animate together, not sequentially.
- **3D effect:** Cards rotate on Y-axis (~25deg when off-center), translate back in Z (~-180px when off-center). Center card is straight-on (0deg rotation, z=0).
- **Transition duration:** ~700ms (snappy)
- **Easing:** Feels like cubic-bezier(0.65, 0, 0.35, 1) — fast, clean, no bounce
- **Loop:** Yes, infinite wrap-around
- **Hover:** Subtle scale on cards (1.05x), but no auto-play

## Our version — desired changes

- Duration: 1000-1200ms (slower, more deliberate)
- Easing: cubic-bezier(0.16, 1, 0.3, 1) with 50-100ms overshoot on settle (spring feel)
- Drag support: Users can drag cards manually with inertia/momentum
- Button click: Rotates the button itself (360deg) as an affordance that something is happening
- Same 3D depth effect, but weightier motion overall

## Technical notes

- Container uses CSS perspective: 1200px
- Cards use transform-style: preserve-3d
- Uses rotateY() and translateZ() for positioning
- On click, all transform properties animate together (not staggered)