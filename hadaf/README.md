# Hadaf · هدف

Bilingual (AR + EN) productivity app built around **Elastic Motivation** — Minimum Viable Day, day types, and adaptive capacity. Built for the DEPI competition sprint (20 days, BMAD methodology).

> **Status — Sprint 0 / Story E0.1** Project scaffold + design system foundation are live. App shell, auth, and features land in subsequent stories.

## Stack

- **Next.js 15** (App Router, Turbopack, TypeScript strict)
- **Tailwind CSS v4** (logical properties only — RTL-ready from day 1)
- **Shadcn UI** (`base-nova` preset, `@base-ui/react`, OKLCH CSS variables)
- **Motion:** CSS Transitions only — `framer-motion` is explicitly prohibited
- **Linting:** ESLint flat config (`next/core-web-vitals` + `next/typescript`)
- **Package manager:** npm

## Scripts

```bash
npm run dev       # Next dev server with Turbopack → http://localhost:3000
npm run build     # Production build
npm run start     # Serve the production build
npm run lint      # ESLint
```

## Project layout

```
hadaf/
├── public/                # Static assets (fonts land here in E0.2)
├── src/
│   ├── app/               # App Router — layout.tsx, page.tsx, globals.css
│   ├── components/ui/     # Shadcn primitives (button, card, dialog, …)
│   └── lib/utils.ts       # cn() helper
├── components.json        # Shadcn config
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json          # strict mode, path alias @/*
└── package.json
```

## Design tokens

Defined in `src/app/globals.css`:

- `:root` — light theme OKLCH variables
- `.dark` — dark theme OKLCH variables
- `@theme inline` — exposes variables as Tailwind colors (`bg-background`, `text-primary`, …)
- `@layer utilities` — motion utilities (`transition-base`, `transition-fast`, `transition-slow`, `transition-fade`, `shimmer`)
- `@media (prefers-reduced-motion: reduce)` — disables all motion

## Conventions

- **RTL:** Tailwind logical properties only (`ms-*`, `me-*`, `ps-*`, `pe-*`). No `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`.
- **Motion:** No `framer-motion`. Use the CSS utility classes or write inline `transition-*` styles.
- **Components:** Shadcn primitives in `src/components/ui/` are headless — no business logic. Feature components land in `src/components/<feature>/` in E0.3+.

## What's next (Sprint 0 roadmap)

- **E0.2** — Typography & RTL Foundation (Tajawal + IBM Plex Sans Arabic)
- **E0.3** — Layered Architecture (`features/`, `domain/`, `data/`, `hooks/`, `providers/`, `lib/`, `tests/`)
- **E0.4** — Database Connection (Drizzle + Neon)
- **E0.5** — Email/Password Authentication
- **E0.6** — App Shell + Theme Toggle + Protected Routes