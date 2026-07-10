---
project_name: 'Hadaf (NHA-4-225)'
user_name: 'Mostafa'
date: '2026-07-09'
sections_completed: ['source_of_truth_hierarchy', 'settled_decisions', 'technology_stack', 'guardrails', 'anti_hallucination', 'review_requirement']
existing_patterns_found: 6
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents (BMad skills and plain Claude Code
sessions alike) must follow when planning or implementing anything for Hadaf. It is the canonical
source — other briefing documents (e.g. `Docs/AGENT-OPERATING-INSTRUCTIONS.md`, the standing
playbook for whichever coding agent — MiniMax, Gemini, Claude, etc. — is implementing) should be
kept consistent with it, not contradict it._

---

## Source-of-Truth Hierarchy

When documents disagree, the higher one wins. Do not average conflicting docs — pick the winner
per this order, and if the conflict isn't resolved by it, stop and ask instead of guessing.

1. **The client's own design tokens** — `hadaf/client/tailwind.config.js` + global stylesheet —
   are the ONLY authority for color, typography, elevation, and motion. There is no separate
   `DESIGN.md`/`PRODUCT.md` design-system document; those files were deliberately deleted by the
   project owner and must not be recreated. The token layer supersedes the UX spec below wherever
   they overlap.
2. **`Docs/UX-Design-Specification.md`** — authority for screens, flows, and microcopy, **except**:
   - §5.1 (colors) and §5.2 (type) — superseded by the client's real token layer (see rung 1). The
     §5.1 hex palette (`#6366F1`, `#22C55E`, `#FFD700`, `#FAFAFA`…) is a generic default palette
     — never use it.
   - §8.7 ("Arabic-only in MVP") — stale. Bilingual parity (Arabic + English, both first-class)
     is the actual mandate everywhere else in this doc set.
3. **`Docs/PRD.md`** and **`Docs/Epics.md`** — current source of truth for product scope and the
   story list. **`Docs/Scope.md` is stale** (an old 34-story/~115 SP horizontal split, superseded
   by the 25-story vertically-sliced `Epics.md`) — do not plan from it. If `Scope.md` and
   `Epics.md` ever disagree again, trust `Epics.md`.
4. **`Docs/Architecture.md`** — schema (8 tables), layered folder structure, naming conventions,
   ADRs. Very reliable for deriving exact file paths per story.
5. **`Docs/Impulse-Migration-Plan.md`** — authority for exactly which client-side pieces are
   copied from the Impulse codebase vs. built new, the component reuse map, and the RTL
   conversion checklist. The backend is untouched by this doc — it just follows `Architecture.md`
   §3 as already written.
6. **`_bmad-output/implementation-artifacts/sprint-status.yaml`** and
   **`Docs/team-task-breakdown.md`** — authority for what has actually been built so far. Docs
   describe intent; these describe reality. Check them before claiming a story is done, in
   progress, or not started.

## Settled Decisions (override the docs above)

These resolve live contradictions in the documents and take priority over what's written there
until the docs themselves are patched:

- **Client-Server split inside `hadaf/`**: The codebase is split into `hadaf/client/` (Vite + React SPA, UI base imported from the Impulse codebase) and `hadaf/server/` (Node.js/Express MVC backend in pure JavaScript).
- **Auth is Email/Password** (bcryptjs + JWT via `jsonwebtoken` + refresh rotation stored in cookies with `sameSite: 'none'` and `secure: true`), **not Google OAuth**.
- **Client UI is imported from Impulse, backend is not**: see `Docs/Impulse-Migration-Plan.md`. The backend stack below was never in question — only the client framework/data-fetching/state layer changed (Next.js/SWR → Vite/React Router/React Query).

## Technology Stack & Conventions

- **Frontend**: Vite 7 + React 19 + React Router 7 (**TypeScript strict**) located inside `hadaf/client/`. UI component base (`ui/`, layouts, CVA patterns) imported from Impulse — see `Docs/Impulse-Migration-Plan.md`.
- **Backend**: Node.js/Express REST API in **pure JavaScript** located inside `hadaf/server/`.
- **Tailwind v4** (CVA-based components from Impulse) **+ shadcn v4 additions** where Impulse doesn't already cover a primitive (AlertDialog, Sheet, Tabs, DropdownMenu, Progress, Tooltip) — component set is intentionally limited, don't add new UI libraries.
- **MongoDB + Mongoose ODM** (8 collections: User, Goal, Milestone, Task, Habit, HabitLog, DailySummary, AnalyticsEvent).
- **JWT via `jsonwebtoken` + `bcryptjs`** for password hashing (cookie-based session delivery with `sameSite: 'none'` and `secure: true` flags).
- **TanStack React Query v5 for data fetching** — optimistic updates via mutations calling backend routes mapped to `VITE_API_URL`. (Not SWR — that was a stale reference from an earlier Next.js-era draft.)
- **Zustand** for client auth/UI/date state (from Impulse) + React Context for DayType/Locale/Theme providers.
- **Express Global Error Handling** — dedicated catch blocks in `error-handler.js` for MongoDB/Mongoose specific execution exceptions (like duplicate key code `11000`).
- **Vitest for unit testing** (the backend `utils/` calculations are pure JavaScript and remain unit-testable; Impulse's Vitest client setup carries over too).
- **Custom Locale Provider** cookie-based translation layer for i18n. Arabic is the default locale.
- **Backend MVC Layering**: `routes/` (Express endpoint mappings) ➔ `controllers/` (request logic and validations) ➔ `models/` (Mongoose schemas/DB layer).
- Deployment: client on Vercel/Netlify (preview per PR, production on `main`); server on a persistent Node host (Render/Railway — a standalone Express+MongoDB process doesn't fit Vercel's serverless/static model). See `Docs/Impulse-Migration-Plan.md` Day 5.

## Non-Negotiable Guardrails

**Color**
- Use only the OKLCH tokens defined directly in `hadaf/client/tailwind.config.js` and the
  client's global stylesheet, converted from Impulse's Violet hex tokens during E0-1 and refined
  during the build. There is no separate `DESIGN.md` — the token layer itself is authoritative.
  Never introduce a raw hex color.
- Compute real WCAG contrast for any new fill before assigning its text color — never assume a
  saturated color automatically takes white text. Don't skip this check for any token, including
  ones inherited from Impulse.
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
- Treat `Docs/Scope.md` and `UX-Design-Specification.md §5.1/§5.2/§8.7` as known-stale — do not
  cite them as current without flagging the staleness. `Architecture.md` has been fully
  reconciled with the Vite/React Query client + Express/MongoDB server stack (see
  `Docs/Impulse-Migration-Plan.md`) and no longer carries stale sections as of this doc's last
  update.

## Review Requirement

No task or story is complete until:
1. Its acceptance criteria are literally verified true (run it, view both `ar`/RTL and `en`/LTR,
   check dark mode) — not assumed because the code "should" work.
2. A review pass has happened before hand-off (e.g. `bmad-code-review`, or a manual pass against
   the guardrails above).

Report honestly — if something is blocked, half-done, or unverified, say so plainly.
