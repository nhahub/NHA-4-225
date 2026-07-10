# Work Order — Frontend Catch-Up (post-E0/E1-E4 backend)

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Why this file exists:** `WORK-ORDER-E1-Goals.md`, `-E2-Tasks.md`, `-E3-Habits.md`, and
> `-E4-Capacity-Scoring.md` were each written assuming backend AND frontend were both starting from
> scratch, epic by epic, in lockstep. **That's no longer true.** As of today, the backend for all
> four epics is fully shipped, tested, and verified against `Architecture.md` — but almost none of
> the corresponding client work happened. This file does not replace those four work orders — their
> **"Tasks — Frontend" and "AC" sections are still the source of truth for what to build** — it
> re-sequences and corrects their **"Current State"/backend sections** (now stale) and layers in
> the specific bugs/gaps a 2026-07-10 review found. Read this file first, then open each epic's
> work order only for its Frontend/AC section when you reach that step.
>
> **Execution model: single agent, sequential.** Work the steps in the order below — the order is
> deliberate (see the "why this order" note on each step), not the original E1→E2→E3→E4 numbering.
>
> **Gate: none.** E0 is done — auth, RTL/i18n, app shell, route guards all verified present and
> working (login/register functional against the real backend, RTL via logical properties
> throughout, `tsc`/`eslint` clean). Start immediately.

---

## 0. Current State — corrected

**Backend is done for all four epics — do not rebuild any of this, just wire the client to it:**

| Resource | Base path | Endpoints |
|---|---|---|
| Auth | `/api/auth` | `register`, `login`, `logout`, `refresh`, `verify/:token`, `forgotPassword`, `exchangeResetToken`, `resetPassword`, `updatePassword` |
| Goals | `/api/goals` | `POST /`, `GET /active`, `GET/PATCH/DELETE /:id`, `POST /:id/replace`, `PATCH /:id/override`, `POST /:id/milestones` |
| Milestones | `/api/milestones` | `PATCH /:id/toggle`, `PUT /reorder` |
| Tasks | `/api/tasks` | `GET/POST /`, `PATCH /:id/complete`, `PATCH /:id/postpone`, `PATCH /:id/reschedule`, `DELETE /:id` |
| Habits | `/api/habits` | `GET/POST /`, `GET /logs`, `POST /:id/log`, `POST /:id/relapse` |
| Settings | `/api/user` | `PATCH /settings` (file is `userRoutes.js`, not `settingsRoutes.js` — same thing, just a naming note) |
| Daily summary | `/api/daily-summaries` | `GET /today`, `GET /capacity`, `PATCH /:date/day-type` |

All routes above (except auth) require the `protect` middleware — Bearer token or `accessToken`
cookie, both already handled by `src/shared/lib/api-client.ts`'s interceptor. Response envelope is
`{success, data}` (or `{success:false, errorCode, error, field}` on failure) — `api-client.ts`
already unwraps this, so client code should just consume the resolved `data`.

**One real backend gap that blocks part of E1-2 (Goals dashboard):** there is no generic
filterable `GET /api/goals` list — only the hardcoded `GET /api/goals/active`. The Goals dashboard
needs to show completed/archived/replaced goals too (search/filter, per E1-2's AC). **Default:**
add a `getGoals` action + route (`GET /api/goals?status=&category=`, scoped to `req.user.id`,
same pattern as every other list endpoint in this codebase) as part of Step 3 below — it's a small,
established-pattern addition, not a design decision. Flag in your hand-off if you instead chose to
scope the dashboard to active-only for now.

**One bug this review found that isn't in any epic work order — fix it in Step 1:**
`hadaf/client/src/features/dashboard/api/dashboardApi.ts` calls `GET /dashboard` — **this route
does not exist anywhere in `app.js`** (confirmed against the full route-mount list above). The
Dashboard page's stats query currently 404s against the real backend. **Default fix:** drop the
phantom `/dashboard` call; compose `DashboardStats` client-side from `GET /api/daily-summaries/today`
(`pointsEarned` → `dailyScore`, `dailyTarget` → `dailyTarget`) plus `GET /api/tasks?date=<today>`
(derive `pendingTasks`/`completedTasks` counts and `totalFocusTime` from `actualDurationMinutes`/
`plannedDurationMinutes`) — no new backend aggregate endpoint needed, consistent with this
codebase's "no repository/aggregation layer" pattern. If you'd rather add a thin
`GET /api/dashboard` backend action instead, that's fine too — just pick one and don't leave the
phantom call in place.

**Where each feature actually stands right now:**
- **Auth** (`features/auth/`) — done, wired to real endpoints, functional.
- **Dashboard** (`features/dashboard/`) — wired but broken (see bug above); "Advanced Analytics"
  panel is a hardcoded mock with a "Coming Soon" overlay — leave that as-is, out of scope here.
- **Tasks** (`features/tasks/`) — UI fully ported from Impulse (forms, completion flows, victory
  overlay, score breakdown all exist) but **not wired to the real `/api/tasks` contract** — 16 of
  20 files carry `@ts-nocheck`, and `features/tasks/types/index.ts` still models Impulse's task
  shape (`day: Date`, `priority: 'LOW'|...`, `startTime/endTime`) instead of the real one
  (`date` as `YYYY-MM-DD` string, `type: scheduled|flexible|quick`, `difficulty`, `checklist[]`,
  `timeBlockStart/End`). `src/shared/lib/mock-server.ts` is also stale (Impulse fixtures, storage
  key literally `impulse_tasks_db`) — leave it working or delete it, your call, but don't let
  `VITE_USE_MOCK=true` silently serve Impulse-shaped data once the real wiring is in.
- **Goals / Habits / Overview / Settings** (`features/{goals,habits,overview,settings}/`) — each
  is a single `*Page.tsx` file rendering a "Coming Soon" placeholder. Nothing else exists in these
  folders (no `api/`, `hooks/`, `components/`).

**Known bugs to fix while you're touching the relevant areas (found in the same review, verified
directly, not just flagged by a linter):**
- **Dark mode is broken across the whole shell.** `tailwind.config.js` maps `background-dark`,
  `background-paper-dark`, `foreground-dark`, `foreground-muted-dark`, `border-dark` to CSS custom
  properties (`var(--color-background-dark)` etc.) — but `src/index.css`'s `:root.dark` block only
  ever redefines the **non-suffixed** variable names (`--color-background`, `--color-foreground`,
  etc.), never the `-dark`-suffixed ones. So every `dark:bg-background-dark` /
  `dark:border-border-dark` / etc. class (used in `AppLayout.tsx`, `Sidebar.tsx`, `BottomNav.tsx`,
  `AlertDialog.tsx`, `DropdownMenu.tsx`, `Sheet.tsx`, `Tabs.tsx`, `TaskItem.tsx`,
  `RegularTaskView.tsx`) resolves to an undefined variable in dark mode. **Fix:** delete the
  `-dark`-suffixed color tokens from `tailwind.config.js` and the `dark:*-dark` utility classes
  from every file listed above, relying on `:root.dark` overriding the base variable names
  directly (which is how `body`/`*`/`::before`/`::after` already correctly pick up dark mode) —
  simpler than declaring five more custom properties, and matches the pattern the rest of the
  token layer already uses.
- **Hardcoded English strings bypass the working i18n system**, inconsistent with the bilingual-
  parity guardrail: `LoginPage.tsx` (all copy + toasts), `DashboardPage.tsx` ("Overview", "Welcome
  back, …", "Total Focus Time", etc.), `HeaderContent.tsx` ("Today"/"Tomorrow"/"Yesterday",
  "Search...", "Add Task"), `TaskItem.tsx`/`TaskFormModal.tsx` ("pts", "New Task", "Regular Task",
  "Big Task (Project)"). Route every one of these through `ar.ts`/`en.ts` + `useTranslation` as you
  touch each file in the steps below — don't do a separate blanket i18n pass, fold it into the
  relevant step.
- Two files have encoding-mangled (mojibake) Arabic/emoji comments from the Impulse copy —
  `TaskItem.tsx` (line ~3), `TaskScheduling.tsx` (line ~38), `GlobalTaskCompletion.tsx` (line ~14).
  Fix while you're in those files for the Tasks rewire (Step 1); not worth a dedicated pass.

---

## Step 1 — Rewire Tasks to the real API (highest priority)

**Why first:** it's the largest existing chunk of broken/disabled code (`@ts-nocheck` on 16
files), it's what a demo will show first, and it unblocks two downstream dependencies: E1-2's
weekly heat map (needs real completed-task data) and E4-2's capacity gauge (needs real planned/
actual task time).

- Rewrite `features/tasks/types/index.ts` to match the real `Task` model (see table above / the
  full field list in `WORK-ORDER-E2-Tasks.md`'s Current State section).
- Rewrite `features/tasks/api/taskApi.ts` to call the real endpoints (`GET/POST /api/tasks`,
  `PATCH /:id/complete|postpone|reschedule`, `DELETE /:id`) instead of the mock/Impulse shape.
- Fix `features/tasks/hooks/useTasks.ts` — the current `useUpdateTask` cache-lookup workaround
  (comment: "التاريخ هنا مشكلة بسيطة") scans the whole query cache with a loose `==` comparison and
  an `@ts-ignore`. Replace with a proper keyed React Query cache update once the real `Task` shape
  (with a real `_id`) is in place — this workaround was compensating for Impulse's mismatched data
  model, which no longer applies once Step 1 is done.
- Remove `@ts-nocheck` from all 16 affected files as you fix each one's types — don't leave it in
  "to be safe."
- Wire `QuickAddSheet`/`TaskFormModal` to real `type` auto-detection (client mirrors
  `detectTaskType`'s branching from `WORK-ORDER-E2-Tasks.md` E2-1, or just trusts the server's
  response — server already sets `type` on create, so the client doesn't need to reimplement the
  detection logic, just display what comes back).
- Wire `SmartCompleteDialog`/`ManualCompleteDialog` to `PATCH /:id/complete`, confirm
  `pointsEarned` displays from the real response (`ScoreBreakdown`/`VictoryOverlay` components
  already exist — just feed them real data instead of mock).
- Fix the Dashboard `/dashboard` 404 (see §0 above) while you're in this area, since the dashboard
  stats are task-derived.
- Fix the two mojibake comments (§0) and the dark-mode classes on `TaskItem.tsx`/
  `RegularTaskView.tsx` while touching those files.

**AC:** Creating, completing, postponing, rescheduling, and deleting a task all round-trip through
the real backend with no `@ts-nocheck` remaining anywhere in `features/tasks/`. Task type reflects
what the server actually returns. Dashboard stats load without a 404. `npm run build`/`tsc --noEmit`
stay clean.

---

## Step 2 — Settings + `DayTypeProvider` (small scope, unlocks Step 4 and 5)

**Why here, ahead of Goals/Habits despite being "E4" in the original numbering:** `DayTypeProvider`
is a forward dependency both `E3-1`'s MVD indicator and `E4-2`'s capacity gauge need. Building it
now means Habits (Step 4) and the capacity gauge (Step 5) can wire against the real thing instead
of a temporary stub-then-rewire, which the original work orders explicitly allowed for but which is
wasted effort now that nothing is actually gated on backend anymore.

- Follow `WORK-ORDER-E4-Capacity-Scoring.md`'s **E4-1 "Tasks — Frontend"** section exactly:
  `SettingsPage` (work hours, day-start, off-days, theme toggle, notification toggle) plus a
  **manual day-type override control (today only)** — the schema question that work order's §0
  used to flag is now resolved: `User.settings` only has `off_days`, confirmed no per-weekday
  "light day" field exists, so build the override control, not a weekday config grid. `DayTypeProvider` + `useDayType`.
- Wire to the real `PATCH /api/user/settings` endpoint.

**AC:** per `WORK-ORDER-E4-Capacity-Scoring.md` E4-1's AC section.

---

## Step 3 — Goals (E1-1 + E1-2 frontend)

- Add the small `getGoals` list-with-filter backend endpoint (§0 gap-fill) first.
- Then follow `WORK-ORDER-E1-Goals.md`'s **E1-1 and E1-2 "Tasks — Frontend"** sections in full
  (`GoalReadinessDialog`, `GoalWizard`, `GoalDashboardPage`, `GoalDetailPage`, `MilestoneList`,
  manual-override slider, etc.) — those sections are still accurate, just build them now instead
  of "once E0 lands" (E0 already landed).
- **Wire the weekly heat map to real data now** — `WORK-ORDER-E1-Goals.md` deferred this pending
  E2-2's completed-task endpoint; Step 1 above already delivered that, so don't stub it, wire it
  directly.

**AC:** per `WORK-ORDER-E1-Goals.md`'s E1-1/E1-2 AC sections, plus: heat map shows real
completed-task data, not a placeholder.

---

## Step 4 — Habits (E3-1 + E3-2 frontend)

- Follow `WORK-ORDER-E3-Habits.md`'s **E3-1 and E3-2 "Tasks — Frontend"** sections in full.
- **Wire the MVD indicator directly to the real `DayTypeProvider`** from Step 2 — the work order's
  "temporary local read" fallback no longer applies since `DayTypeProvider` already exists by the
  time you reach this step.
- Ship the quit-habit relapse flow with the exact PRD voice line in both languages, per that work
  order's E3-2 section.

**AC:** per `WORK-ORDER-E3-Habits.md`'s E3-1/E3-2 AC sections, plus: MVD indicator reads the real
day type, not a stub.

---

## Step 5 — Capacity gauge + scoring/progress bar (E4-2 + E4-3 frontend)

**Why last:** genuinely depends on Tasks (Step 1), Habits (Step 4), and Settings/DayTypeProvider
(Step 2) all being real by this point — this was already the original epic's internal ordering
(E4-2 → E4-3 last), it just now also depends on Steps 1/3/4 above instead of their backend
counterparts.

- Follow `WORK-ORDER-E4-Capacity-Scoring.md`'s **E4-2 and E4-3 "Tasks — Frontend"** sections in
  full (capacity gauge on Home, overload warning, suggestion prompt at the 30% threshold,
  `ProgressBar`, `DayStateBadge` for all 5 states, `DailySummaryToast`).

**AC:** per `WORK-ORDER-E4-Capacity-Scoring.md`'s E4-2/E4-3 AC sections.

---

## Explicitly out of scope for this work order

`HOME-Screen` and `ONB-Onboarding` (both depend on Goals/Habits/Settings existing, which this work
order delivers, but assembling the Home screen and onboarding wizard is its own epic — pick those
up next via their own work orders) and `POL-Polish` (empty states, skeletons, confirm dialogs —
comes after the features it's polishing exist). Don't start these until Steps 1-5 above are done.

---

## Hand-off notes

Report against each step's AC explicitly. Call out, either way: (1) whether you added the
`getGoals` filter endpoint or scoped the dashboard to active-only, (2) whether you fixed the
`/dashboard` 404 by composing client-side or by adding a backend aggregate endpoint, (3) the
E4-1 day-type schema resolution (inherited flag from `WORK-ORDER-E4-Capacity-Scoring.md`). See
`AGENT-OPERATING-INSTRUCTIONS.md` §9 for the full honesty/review requirement — in particular, run
`npm run build`, `tsc --noEmit`, and `eslint` clean before reporting any step done, and note which
steps you actually exercised in the browser versus only type-checked.
