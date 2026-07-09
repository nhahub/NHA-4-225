# Hadaf (هدف)

Bilingual (Arabic + English, at parity) productivity app built around an "Elastic Motivation"
philosophy — MVD, Day Types, hybrid goal progress, auto-detected task types. Built in a 5-day
sprint (5 developers, 25 stories) as a competition submission (DEPI). Client UI is imported from
the Impulse codebase (Vite + React Router + React Query + Zustand); the Express/MongoDB backend
is a fresh build. The app lives in `hadaf/`; planning docs live in `Docs/`.

@Docs/project-context.md

Full detail beyond the rules above:
- `Docs/PRD.md` — vision, KPIs, functional requirements, user journeys
- `Docs/Epics.md` — the current epic/story breakdown (not `Docs/Scope.md` — see project-context)
- `Docs/Architecture.md` — schema, layered folders, naming conventions, ADRs
- `Docs/Impulse-Migration-Plan.md` — what's copied from Impulse vs. built new, component reuse
  map, RTL conversion checklist, 5-day team schedule
- `Docs/AGENT-OPERATING-INSTRUCTIONS.md` — standing playbook for whichever coding agent
  (MiniMax, Gemini, Claude, etc.) implements a work order: role, guardrails, SOLID, API contract,
  workflow. Design authority is the client's own token layer (`hadaf/client/tailwind.config.js` +
  global stylesheet, OKLCH, converted from Impulse's Violet tokens) — there is no separate
  DESIGN.md/PRODUCT.md; those were deliberately deleted and must not be recreated.
