# PROMPT C — Polish pass (Epic POL) — for a coding agent (MiniMax/Gemini/any)

> **Sequencing: this prompt must only be started AFTER the HOME (PROMPT-A) and Onboarding
> (PROMPT-B) work is merged** — POL touches every feature folder, so it cannot run in parallel
> with anything.
>
> **You are a senior frontend engineer working on "Hadaf" (هدف)**, an Arabic-first RTL
> productivity app. Client: Vite + React 19 + TypeScript + Tailwind v4 + TanStack React Query v5.
> Server: Express + MongoDB, envelope `{success, data}` / `{success:false, errorCode, error}`.
>
> **Read first:** `Docs/AGENT-OPERATING-INSTRUCTIONS.md`, `Docs/project-context.md`, then
> `Docs/agent-tasks/WORK-ORDER-POL-Polish.md` (original spec — its ACs apply; this prompt
> corrects its stale current-state and re-prioritizes for limited time).

---

## 1. Corrected current state (verify before building — don't rebuild what exists)

Much of POL's surface already exists:
- `shared/components/ui/Skeleton.tsx` — exists, used by Dashboard, Analytics (`features/overview/components/AnalyticsSkeleton.tsx`), and HOME (`features/home/components/HomePageSkeleton.tsx`). POL-2 is **verify/extend coverage**, not build.
- `shared/components/ui/AlertDialog.tsx` — exists. POL-4 is a **sweep to apply it everywhere destructive**, not build.
- `shared/components/ErrorBoundary.tsx` — exists at app root.
- `sonner` toaster — installed and mounted; some mutations already toast errors, many don't.
- `features/habits/components/RelapseConfirmationDialog.tsx` — exists (don't duplicate).
- Analytics/Overview, HOME, and Onboarding all shipped with their own empty states — POL-1 covers the OTHER screens (Tasks, Goals, Habits) if missing.

## 2. Priority order (do in this order; stop where time runs out)

1. **POL-3 Error toasts (client)** — wrap every `useMutation`'s `onError` across
   `features/{tasks,goals,habits,settings,home,onboarding}` with a bilingual toast via the
   existing error-handler util + `sonner`. Network-offline banner with a retry affordance.
2. **POL-1 Empty states** — one shared `shared/components/EmptyState.tsx` (icon + title + body +
   CTA, positive voice) applied to: Tasks list (no tasks today), Goals dashboard (no goals),
   Habits page (no habits). Match the visual language of
   `features/overview/components/AnalyticsEmptyState.tsx`.
3. **POL-4 Confirmation dialogs** — AlertDialog before every destructive action (task delete,
   habit archive, goal archive/delete). Goal deletion requires a reason (dropdown + optional
   text) hitting the existing `deletionReason` field. **No Undo (by design).**
4. **POL-2 Skeleton audit** — every route shows a skeleton during initial fetch; add
   `prefers-reduced-motion` handling to the shimmer if missing.

## 3. File ownership

You may touch feature folders' components/pages for the wiring above, plus create
`shared/components/EmptyState.tsx`. **Forbidden:** `router.tsx`, `providers.tsx`, `app.js`,
`package.json` (no new dependencies), `tailwind.config.js`, `src/index.css`, server code except
(if needed for POL-4) `goalController`'s deletion-reason validation. i18n: append ONE `pol:`
namespace (or extend each feature's existing namespace keys where the string belongs there —
your call, but never rename/move existing keys), both `ar.ts` and `en.ts` together.

## 4. Non-negotiables (grep-checked at merge)

Logical properties only (`ms-/me-/ps-/pe-/start-/end-`); no raw hex; no framer-motion; no new
deps; all strings via `t()` in BOTH dictionaries; touch targets ≥44px; accomplishment-first voice
(never punitive), e.g. deletion confirmations state what will happen, not blame.

## 5. Definition of done + hand-off

- `cd hadaf/client && npm run type-check && npm run lint && npm run build` — zero errors/warnings.
- `cd hadaf/server && npm test && npm run test:api` — ALL suites green.
- Hand-off: list which of POL-1/2/3/4 you completed vs skipped (time), every file changed, and
  what you exercised in a browser vs only type-checked. Per `AGENT-OPERATING-INSTRUCTIONS.md` §9.
