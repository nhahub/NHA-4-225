# Hadaf

Bilingual (AR + EN) productivity app built around Elastic Motivation: Minimum Viable Day, day types, and adaptive capacity. Built for the DEPI competition sprint.

> **Status - Foundation stories E0-1 through E0-4:** scaffold/design tokens, bilingual RTL foundation, layered folders, and Drizzle/Neon analytics schema are in place. External Neon provisioning and `drizzle-kit push` still need to be confirmed against the team's database.

## Stack

- **Next.js 15** (App Router, Turbopack, TypeScript strict)
- **Tailwind CSS v4** (logical properties preferred for RTL)
- **Shadcn UI** (`base-nova` preset, `@base-ui/react`, OKLCH CSS variables)
- **Motion:** CSS transitions only; `framer-motion` is explicitly prohibited
- **Database:** Drizzle ORM + Neon serverless driver
- **Fonts:** Self-hosted IBM Plex Sans + IBM Plex Sans Arabic
- **Linting:** ESLint flat config (`next/core-web-vitals` + `next/typescript`)
- **Package manager:** npm

## Scripts

```bash
npm run dev       # Next dev server with Turbopack at http://localhost:3000
npm run build     # Production build
npm run start     # Serve the production build
npm run lint      # ESLint
```

## Project Layout

```
hadaf/
|-- public/fonts/ibm-plex/ # Self-hosted IBM Plex font assets
|-- src/
|   |-- app/               # App Router: layout.tsx, pages, globals.css
|   |-- components/        # UI primitives + feature components
|   |-- data/              # Drizzle schema/client + repositories
|   |-- domain/            # Framework-agnostic business logic
|   |-- features/          # Feature schemas, actions, hooks, queries
|   |-- hooks/             # Shared React hooks
|   |-- i18n/              # Locale messages + server locale helper
|   |-- lib/               # Utilities, constants, mock data
|   |-- providers/         # Theme and locale providers
|-- tests/domain/          # Pure domain tests
|-- drizzle.config.ts
|-- vitest.config.ts
|-- package.json
```

## Design Tokens

Defined in `src/app/globals.css`:

- `:root` light theme OKLCH variables
- `.dark` dark theme OKLCH variables
- `@theme inline` exposes variables as Tailwind colors
- `@layer utilities` defines motion utilities
- `@media (prefers-reduced-motion: reduce)` disables all motion

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
