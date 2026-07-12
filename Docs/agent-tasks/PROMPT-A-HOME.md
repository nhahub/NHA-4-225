# PROMPT A — Build the HOME Screen (Epic HOME) — for a coding agent (MiniMax/Gemini/any)

> **You are a senior frontend-leaning full-stack engineer working on "Hadaf" (هدف)**, an
> Arabic-first RTL productivity app. Client: Vite + React 19 + TypeScript + Tailwind v4 +
> TanStack React Query v5 + Zustand. Server: Express + MongoDB/Mongoose, response envelope
> `{success, data}` / `{success:false, errorCode, error}`.
>
> **Before writing any code, read these repo files in order:**
> 1. `Docs/AGENT-OPERATING-INSTRUCTIONS.md` — guardrails, API contract, workflow, honesty rules. Binding.
> 2. `Docs/project-context.md` — non-negotiable product rules (RTL, OKLCH, i18n, voice).
> 3. `Docs/agent-tasks/WORK-ORDER-HOME-Screen.md` — the original task spec. **Its "Current
>    State" and backend instructions are superseded by this prompt** (see §1 below); its
>    frontend AC and section-ordering requirements still apply.
>
> Work from repo root `NHA-4-225/`. Client code: `hadaf/client/`. Server code: `hadaf/server/`.

---

## 1. Corrected current state (2026-07-12 — trust this over the work order)

Everything HOME depends on is **already built and wired to the real backend**:

- Today's tasks: `GET /api/tasks?date=YYYY-MM-DD` via `features/tasks/api/taskApi.ts` + `features/tasks/hooks/useTasks.ts`. Backlog: `GET /api/tasks?view=backlog`.
- Today's habits + logs: `features/habits/api/habitApi.ts` + `features/habits/hooks/useHabits.ts`.
- Active goals: `features/goals/api/goalApi.ts` (`getActiveGoals`) + `features/goals/hooks/useGoals.ts`.
- Today's `DailySummary`: `GET /api/daily-summaries/today`; capacity: `GET /api/daily-summaries/capacity`.
- **Already-built components you must IMPORT, not rebuild** (all in `hadaf/client/src/features/dashboard/components/`): `ProgressBar.tsx` (5 day-states), `DayStateBadge.tsx`, `CapacityGauge.tsx`, `DailySummaryToast.tsx`. Hooks: `features/dashboard/hooks/useCapacity.ts`, `useDashboardStats.ts`.
- Auth user object in `features/auth/stores/useAuthStore.ts` already includes `onboardingCompleted`.
- i18n: `src/i18n/ar.ts` + `src/i18n/en.ts`, consumed via `useTranslation` from the locale provider. Dark mode: class-based, works. Sidebar/BottomNav already have a Home nav entry — **do not edit them**.

**Correction #1 — no `homeController.js`.** The work order's "greeting decision endpoint" is
cancelled. Derive the greeting branch **client-side** as a pure function of data HOME-2 already
fetches (goals + tasks). No new endpoint, no `app.js` changes.

**Correction #2 — the only backend work in this epic** is the `summaryShown` toast gating
(HOME-1), detailed in §3.

---

## 2. File ownership — STRICT

You may create/modify **ONLY** these files. Another agent and a lead are working in the same
tree in parallel; touching anything else causes merge conflicts and your work will be rejected.

**Yours (create):**
- `hadaf/client/src/features/home/**` — everything under it (pages/, components/, hooks/, types/ as needed)

**Yours (modify):**
- `hadaf/server/models/DailySummary.js` — add one field (§3)
- `hadaf/server/controllers/dailySummaryController.js` — add one action (§3)
- `hadaf/server/routes/dailySummaryRoutes.js` — register one route (§3)
- `hadaf/client/src/i18n/ar.ts` + `en.ts` — **append-only**: add exactly ONE new top-level
  namespace `home:` at the END of the dictionary object in BOTH files in the same change.
  Never modify or reorder existing keys.
- `hadaf/server/tests/api/` — you may ADD a new test file for the summary-shown endpoint (e.g. `epicH-home.test.js`). Do not modify existing test files.

**Forbidden (read-only for you):** `router.tsx`, `providers.tsx`, `app.js`, `package.json`
(both — **no new dependencies**), `queryKeys.ts`, `routes.ts`, `Sidebar.tsx`, `BottomNav.tsx`,
`features/dashboard/**`, `features/tasks/**`, `features/goals/**`, `features/habits/**`,
`features/settings/**`, `shared/**`. Import from them freely.

**Do NOT wire the route.** Export `HomePage` from
`hadaf/client/src/features/home/pages/HomePage.tsx` (named export, lazy-loadable — follow the
pattern of `DashboardPage`). The lead wires `/` → `HomePage` at merge time.

For React Query keys, use literal arrays namespaced `['home', ...]` — do not edit the shared
`queryKeys.ts`.

---

## 3. Backend task (HOME-1 toast gating) — small and surgical

1. `models/DailySummary.js`: add `summaryShown: { type: Boolean, default: false }` to the schema.
2. `controllers/dailySummaryController.js`: add `exports.markSummaryShown` (catchAsync-wrapped):
   `PATCH /api/daily-summaries/:date/summary-shown` — validate `:date` is `YYYY-MM-DD` (mirror
   how `updateDayType` at the top of the file validates), find-or-create the user's summary for
   that date (**reuse `exports.upsertDailySummaryHelper(userId, dateStr)` at line ~103 — do not
   duplicate its logic**), set `summaryShown = true`, return `{success:true, data: summary}`.
3. `routes/dailySummaryRoutes.js`: register the route next to the existing `PATCH /:date/day-type`.
4. Test it in your new test file (register/login → complete something yesterday-ish or just call
   the endpoint → assert `summaryShown: true` and idempotency on second call; 401 without auth).

## 4. Frontend tasks

### 4.1 `AdaptiveGreeting.tsx` — 4 branches (most voice-sensitive component in the app)

Pure function of already-fetched data (no new fetches):
1. **Has planned tasks today** (`tasksToday.length > 0`) — greet + count, accomplishment-first.
2. **No tasks today, has active goals** — greet + gentle suggestion to plan one task toward a goal.
3. **New user** (no goals AND no tasks) — welcome branch.
4. **No goals at all** (but maybe has tasks) — empty-state nudge, copy anchor: "ابدأ بهدف واحد" / "Start with one goal".

Voice guardrail (binding, from `project-context.md`): accomplishment-first, never punitive
("أنجزت ٥ من ٨" never "لم تكمل ٣"). No mascots/confetti/streak-flame language. Every string in
BOTH `ar` and `en` under the `home:` namespace, shipped together.

### 4.2 `HomePage.tsx` + `DailyOverview.tsx` (HOME-2 assembly)

- On mount fetch **in parallel** (React Query parallel queries — multiple `useQuery` calls or
  `useQueries`, never sequential awaits): today's tasks, today's habits, backlog count, today's
  DailySummary (+ capacity for the gauge).
- `DailyOverview` composes **in this exact contractual order**: Greeting → Today's Tasks →
  Habits → Backlog Ribbon → Progress Bar. Do not rearrange.
- Today's Tasks / Habits sections: reuse the list-item components from `features/tasks` /
  `features/habits` (import their components/hooks; if a component is page-coupled, build a thin
  local wrapper in `features/home/components/` rather than modifying theirs).
- Backlog Ribbon: count from `GET /api/tasks?view=backlog`; link to `/tasks`.
- Progress Bar section: import `ProgressBar` + `CapacityGauge` from `features/dashboard`.
- `DailySummaryToast`: import from `features/dashboard`. Show once per day: if yesterday's
  summary `summaryShown === false`, show toast (dismiss after 3s or on tap), then call your new
  `PATCH /summary-shown` endpoint. Note: `GET /api/daily-summaries/today` returns TODAY's summary
  — for yesterday's you'll need to check what the toast component already expects; if there is no
  yesterday endpoint, compute the date client-side and call your `PATCH` with yesterday's date and
  read its response (the upsert helper computes the summary server-side). Flag your approach in
  the hand-off.
- Full-page loading skeleton while the parallel fetch is in flight (backend can cold-start 2-5s).
  Build a local skeleton from `shared/components/ui/Skeleton.tsx` composition — POL will replace
  it later.
- Responsive: content must render correctly inside the existing AppLayout at mobile (<768px,
  BottomNav) and desktop (>1024px, Sidebar), RTL and LTR.

## 5. Non-negotiable project rules (will be grep-checked at merge)

- Tailwind **logical properties only**: `ms-/me-/ps-/pe-/start-/end-/text-start/text-end`.
  Any `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left`, `text-right` = rejected.
- **No raw hex colors** — only existing token classes / CSS vars (OKLCH token layer).
- **No framer-motion** (CSS transitions only). No new npm dependencies at all.
- Every user-visible string via `t('home.…')`, present in BOTH `ar.ts` and `en.ts`.
- Touch targets ≥44×44px. Progress bars fill right-to-left in RTL. Flat shadows.

## 6. Definition of done + hand-off

Run and pass, from the respective directories:
- `cd hadaf/client && npm run type-check && npm run lint && npm run build` — zero errors/warnings
- `cd hadaf/server && npx vitest run` — ALL suites green, including pre-existing ones

Write a hand-off report (per `AGENT-OPERATING-INSTRUCTIONS.md` §9) covering: each AC from
`WORK-ORDER-HOME-Screen.md` HOME-1/HOME-2 explicitly; which greeting branches you actually saw
render in a browser vs only unit-reasoned; the yesterday-summary approach you chose; confirmation
you touched no forbidden file (list every file you changed).
