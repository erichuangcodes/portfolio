# Eric Huang — portfolio

Personal portfolio site for Eric Huang, a designer and engineer. It opens on
an interactive 3D hero of pastel physics spheres, then moves through About,
a curved projects carousel, Experience and Contact. Each project has its own
detail page at `/projects/[slug]`.

Built with Next.js (App Router), React, TypeScript and Tailwind CSS. The hero
uses React Three Fiber, Rapier and postprocessing; motion uses framer-motion
and Lenis. Deployed on Vercel from `main`.

## Run it locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint
npx tsc --noEmit   # typecheck
```

In development, a Leva panel lets you tune the hero scene, the hero's scroll
collapse and the nav glass. It isn't included in production builds.

## Editing content

- Projects: `lib/projects.ts` (images in `public/projects/`)
- About section: `lib/about.ts` (photos in `public/about/`)
- Experience: `lib/experience.ts`
- Colours, easings and other design tokens: `lib/tokens.ts`; the site accent
  is `--accent` in `app/globals.css`

## Working on this codebase

Read [HANDOFF.md](HANDOFF.md) first. It covers the current state, the approved
hero look, known issues, lessons learned and the working rules.
