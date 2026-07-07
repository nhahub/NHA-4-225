---
project_name: 'Hadaf (NHA-4-225)'
user_name: 'Mostafa'
date: '2026-07-07'
sections_completed: ['source_of_truth_hierarchy', 'settled_decisions', 'technology_stack', 'guardrails', 'anti_hallucination', 'review_requirement']
existing_patterns_found: 6
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents (BMad skills and plain Claude Code
sessions alike) must follow when planning or implementing anything for Hadaf. It is the canonical
source — other briefing documents (e.g. `hadaf/MINIMAX-INSTRUCTIONS.md`) should be kept
consistent with it, not contradict it._

---

## Source-of-Truth Hierarchy

When documents disagree, the higher one wins. Do not average conflicting docs — pick the winner
per this order, and if the conflict isn't resolved by it, stop and ask instead of guessing.

1. **`hadaf/DESIGN.md`** and **`hadaf/PRODUCT.md`** — the ONLY authority for color, typography,
   elevation, motion, and product framing. These supersede the UX spec below wherever they
   overlap.
2. **`Docs/UX-Design-Specification.md`** — authority for screens, flows, and microcopy, **except**:
   - §5.1 (colors) and §5.2 (type) — superseded by `DESIGN.md`. The §5.1 hex palette
     (`#6366F1`, `#22C55E`, `#FFD700`, `#FAFAFA`…) is a generic default palette — never use it.
   - §8.7 ("Arabic-only in MVP") — stale. Bilingual parity (Arabic + English, both first-class)
     is the actual mandate everywhere else in this doc set.
3. **`Docs/PRD.md`** and **`Docs/Epics.md`** — current source of truth for product scope and the
   story list. **`Docs/Scope.md` is stale** (an old 34-story/~115 SP horizontal split, superseded
   by the 25-story vertically-sliced `Epics.md`) — do not plan from it. If `Scope.md` and
   `Epics.md` ever disagree again, trust `Epics.md`.
4. **`Docs/Architecture.md`** — schema (8 tables), layered folder structure, naming conventions,
   ADRs. Very reliable for deriving exact file paths per story.
5. **`_bmad-output/implementation-artifacts/sprint-status.yaml`** and
   **`Docs/team-task-breakdown.md`** — authority for what has actually been built so far. Docs
   describe intent; these describe reality. Check them before claiming a story is done, in
   progress, or not started.

## Settled Decisions (override the docs above)

These resolve live contradictions in the documents and take priority over what's written there
until the docs themselves are patched:

- **Single `hadaf/` app**, not an npm workspace split. A `hadaf-UI`/`hadaf-BE` split was tried and
  reverted. Backend lives under `hadaf/src/data/` (db + repositories) and `hadaf/src/domain/`
  (pure TS, no framework imports).
- **Auth is Email/Password** (bcrypt + JWT via `jose` + refresh rotation), **not Google OAuth**.
  `Architecture.md §3.2` still says "Google OAuth only" — that section is stale until its
  remediation patch lands; trust this file instead.

## Technology Stack & Conventions

- Next.js 15 (App Router, Turbopack, **TypeScript strict**)
- Tailwind v4 + shadcn v4 + `@base-ui/react` (component set is intentionally limited — don't add
  new UI libraries)
- Drizzle ORM + Neon Postgres (use the `-pooler` connection string)
- JWT via `jose` (Edge-compatible), bcrypt for password hashing
- SWR for data fetching — optimistic updates via `mutate()`, no polling
- Vitest for domain unit tests (the `domain/` layer is pure TS and must stay unit-testable
  without framework imports)
- `next-intl` for i18n — URL structure `/[locale]/...` (e.g. `/ar/goals`, `/en/goals`), messages
  in `messages/ar.json` + `messages/en.json`. Arabic is the default locale.
- Layering: `domain/` (pure business logic) → `data/repositories/` (Drizzle queries) →
  `features/` (feature-scoped hooks/components) → `components/` (shared UI). Follow
  `Architecture.md` for exact naming conventions and where new files belong.
- Vercel deployment: preview per PR, production on `main`.

## Non-Negotiable Guardrails

**Color**
- Use only the OKLCH tokens already defined in `src/app/globals.css`. Never introduce a raw hex
  color.
- Compute real WCAG contrast for any new fill before assigning its text color — the
  "saturated color → white text" heuristic is wrong for this palette (primary teal and accent
  brass both take dark ink text, not white). Don't skip this check.
- The 5 status colors (progress/health) mean progress/health ONLY — never decorative, never used
  for brand.

**Bilingual / RTL (highest priority — this is the product's differentiator)**
- Arabic is the default and primary language; the app renders RTL by default. English ships at
  the same level of polish, not as a fallback.
- Use Tailwind logical properties only: `ms-`/`me-`/`ps-`/`pe-`, `start-`/`end-`, `text-start`.
  Never `ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left` — any physical-direction class is a
  bug.
- Never hardcode a user-facing string in a component. All copy comes from the message
  dictionaries in both `ar` and `en` — add both when adding a string.
- Dates and numbers must be locale-aware. No hardcoded `en-US`.

**Motion & elevation**
- CSS transitions only. Framer Motion is banned by architecture — use the existing
  `transition-*` utilities in `globals.css`.
- Flat by default; shadow only on things floating above the page (dialog/sheet/toast/dropdown).
  Never combine a full border and a box-shadow on the same element.
- Respect `prefers-reduced-motion` (already global).

**Voice**
- Frame everything positively — accomplishment first, then what remains. Errors are always
  recoverable and show a retry action.
- No mascots, confetti, badges, streak-flames, or gamification cartoon language.

**Stack**
- The locked stack above does not get new heavy dependencies without asking first.

## Anti-Hallucination Rule

- Verify claims about current build state against `sprint-status.yaml` and the actual file tree
  — not against what a doc says *should* exist. Docs describe intent; check reality before
  asserting a story is done, in progress, or not started.
- If two sources still conflict after applying the Source-of-Truth Hierarchy above, say so
  explicitly and ask — do not guess or silently pick one.
- Treat `Docs/Scope.md`, `UX-Design-Specification.md §5.1/§5.2/§8.7`, and
  `Architecture.md §3.2` as known-stale — do not cite them as current without flagging the
  staleness.

## Review Requirement

No task or story is complete until:
1. Its acceptance criteria are literally verified true (run it, view both `ar`/RTL and `en`/LTR,
   check dark mode) — not assumed because the code "should" work.
2. A review pass has happened before hand-off (e.g. `bmad-code-review`, or a manual pass against
   the guardrails above).

Report honestly — if something is blocked, half-done, or unverified, say so plainly.
