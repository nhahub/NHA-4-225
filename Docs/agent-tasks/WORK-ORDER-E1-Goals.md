# Work Order — Epic E1: Goal Management

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.2 (goal-progress formulas), §5
> (directory structure); `Docs/Epics.md` E1; `Docs/team-task-breakdown.md` E1-1/E1-2 (full
> itemized detail — this work order re-scopes it against real progress and translates its stale
> Next.js/Drizzle idioms, see the translation table below).
>
> **Updated 2026-07-10 — this epic's backend has shipped.** See
> `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` for the current big-picture build sequence
> across all epics (this epic is Step 3 of 5). Read that file first if you're picking up epics in
> priority order rather than working this one standalone — it corrects the backend assumptions
> below and tells you what's actually left. Only the **Frontend** tasks in this file remain to be
> built; the **Backend** subsections are now a verification checklist, not a build list.
>
> **Execution model: single agent, sequential**, same as `WORK-ORDER-E0-Foundation.md`. Work
> E1-1 → E1-2 in order.
>
> **Gate: none — E0 is complete (verified).** Auth, the `controllers/routes/middleware` pattern,
> i18n/`LocaleProvider`, and the app shell with route guards are all in place and working. Start
> immediately.

---

## 0. Current State — updated 2026-07-10, backend shipped

**Already exists and verified — do not recreate:**
- `hadaf/server/models/Goal.js` — full schema (`userId`, `title`, `description`, `category` enum
  `education_work|family|health|religion_spirituality|other`, `customCategory`, `measure`,
  `relevance`, `cycleStart`, `cycleEnd`, `manualProgress`, `status` enum
  `active|completed|archived|replaced`, `deletionReason`), compound index `{userId, status}`, a
  `pre('deleteOne')` cascade hook that deletes the goal's milestones and unsets `goalId` on its
  tasks, plus co-located `Goal.createGoalSchema` and `Goal.softDeleteGoalSchema` (Zod).
- `hadaf/server/models/Milestone.js` — `goalId`, `title`, `sort_order`, `is_completed`,
  `completed_at`, index `{goalId, sort_order}`, co-located `Milestone.milestoneValidationSchema`.
- **`server/controllers/goalController.js` + `server/routes/goalRoutes.js` — SHIPPED.** Live
  endpoints: `POST /api/goals`, `GET /api/goals/active`, `GET/PATCH/DELETE /api/goals/:id`,
  `POST /api/goals/:id/replace`, `PATCH /api/goals/:id/override`, `POST /api/goals/:id/milestones`,
  plus `PATCH /api/milestones/:id/toggle` and `PUT /api/milestones/reorder` on a separate
  `milestoneRoutes.js`. Verified matching this epic's formulas below, including the milestone +10
  point bonus rolled into `scoring.js`/`DailySummary` (E4-3's hook — confirmed present as
  `MILESTONE_BONUS_POINTS` in `dailySummaryController.js`).
- **`server/utils/goal-progress.js` — SHIPPED.** Note the real filename is **kebab-case**
  (`goal-progress.js`), not `goalProgress.js` as originally instructed below — the camelCase
  convention didn't end up applying to this file (`task-type.js` and `habit-streak.js` share the
  same kebab-case pattern in E2/E3). Don't create a second, camelCase copy. Implements
  `calculateHybridProgress`/`calculateGoalHealth`/`getCurrentWeek`/`calculateWeeklyExecutionScore`
  matching E1-1's formulas below exactly.
- All of the above carry a header comment confirming they were checked against `Architecture.md`
  §3.1 in E0-3.1. If the live files disagree with this description, trust the live files.

**One real backend gap — small, fold it into E1-2 below:** there is no generic filterable goal
list, only the hardcoded `GET /api/goals/active`. E1-2's dashboard needs
`completed`/`archived`/`replaced` too. Add a `getGoals` action + route
(`GET /api/goals?status=&category=`, scoped to `req.user.id`, same pattern as every other list
endpoint in this codebase) — a small, established-pattern addition, not a design decision.

**Still net-new — this is what's actually left in this epic:**
- `hadaf/client/src/features/goals/` — still doesn't exist beyond a stub `GoalsPage.tsx`
  ("Coming Soon" placeholder). Everything client-side for goals (wizard, dashboard, detail page,
  hooks, components) is still to be built, following the folder shape of Impulse's existing
  `features/tasks/` as the pattern to copy (api/, components/, hooks/, pages/, stores/ as needed —
  PascalCase component files per `Architecture.md` §4.1).

See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` Step 3 for how this epic's remaining work
fits into the overall build sequence.

## Idiom translation (source doc → what to actually build)

`team-task-breakdown.md`'s E1 checklists still describe the abandoned Postgres/Drizzle/Next.js
plan. Translate as you read it:

| Stale wording | Build this instead |
|---|---|
| "goal_category / goal_status enums", "goals table", "milestones table" | Already satisfied by `Goal.js`/`Milestone.js` above — nothing to create |
| `features/goals/actions.ts` | `server/controllers/goalController.js` + `server/routes/goalRoutes.js` |
| `data/repositories/goals.repo.ts` | Controller calls `Goal`/`Milestone` models directly — no repository layer |
| `domain/goal-progress.ts` | `server/utils/goal-progress.js` (kebab-case — shipped, see §0) |
| `ActionResult` | `ApiResponse<T>` (`Architecture.md` §3.3) |
| kebab-case component files (`goal-card.tsx`) | PascalCase (`GoalCard.tsx`) |

---

## E1-1 — SMART Goal Wizard

**Goal:** User can create a goal via a 3-step wizard with SMART-style fields, seeding milestones.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/utils/goal-progress.js` (pure, no Express/Mongoose imports — SRP per
  `AGENT-OPERATING-INSTRUCTIONS.md` §5):
  - `calculateHybridProgress(input)` — `(tasksProgress × 0.6) + (milestonesProgress × 0.4)`
    (`Architecture.md` §6.2, FR6).
  - `calculateGoalHealth(actual, expected)` — ratio = actual/expected: ≥85% → `green`, ≥70% →
    `yellow`, ≥50% → `orange`, <50% → `red` (FR6.3).
  - `getCurrentWeek(cycleStart, today)` — which week of the goal's cycle `today` falls in.
  - `calculateWeeklyExecutionScore(completed, total)`.
  - Unit test each in isolation (Vitest, `server/tests/unit/`) — no DB needed.
- `server/controllers/goalController.js` + `server/routes/goalRoutes.js`:
  - `createGoal` — validates with `Goal.createGoalSchema`, creates the `Goal`, then creates a
    `Milestone` per title in the wizard's optional `milestones` array (schema already supports
    this — see `createGoalSchema`'s `milestones: z.array(z.string().min(1)).optional()`).
    Response: `ApiResponse<Goal>`.
  - Scope every query to `req.user.id` (`Architecture.md` §9.2 / operating-instructions §7 — no
    exceptions).
- Log an `AnalyticsEvent` (`eventType: 'goal_created'`) on success.

**Tasks — Frontend** (new `features/goals/`):

- `GoalReadinessDialog` — a pre-wizard confirmation step (per `team-task-breakdown.md`'s
  goal-readiness-dialog) before the wizard opens.
- `GoalWizard` — 3 steps (fields per `createGoalSchema`: title, category, `customCategory` when
  `category === 'other'`, measure, relevance, cycle dates, optional milestone titles). Both `ar`
  and `en` labels from day one (i18n guardrail).
- `useCreateGoal` — React Query mutation hook, invalidates the goals list query on success.
- Route wiring: wizard is reachable from the Goals dashboard (E1-2) and reused, not
  reimplemented, by `ONB-1` (onboarding's non-skippable first goal) — build it as a standalone,
  embeddable component for that reason.

**AC:** A user can complete the 3-step wizard in both languages/RTL+LTR, submit, and see the new
goal persisted with any milestones created. All goal/milestone queries are scoped to the
authenticated user. `calculateHybridProgress`/`calculateGoalHealth`/`getCurrentWeek`/
`calculateWeeklyExecutionScore` are unit-tested and match `Architecture.md` §6.2 exactly.

**Dependencies:** E0 complete (see gate above).

---

## E1-2 — Goal Dashboard & Detail View

**Goal:** List/search goals, view a single goal's progress and milestones, manually override
progress.

**Backend — mostly shipped, one gap-fill still needed (see §0):**

- `getGoals` (list, scoped to user, supports status/category filter — **this is the one gap-fill
  endpoint that doesn't exist yet**, required for the dashboard's search/filter UI), `getGoalById`
  (includes its milestones), `updateGoal`, `softDeleteGoal` (uses the existing
  `Goal.softDeleteGoalSchema`; sets `status: 'archived'` + `deletionReason`, does not hard-delete
  — the cascade hook on `Goal.js` only fires on `deleteOne`, which this flow doesn't use),
  `overrideProgress` (writes `manualProgress`), milestone `toggleComplete`/`reorder` endpoints on
  `goalRoutes.js` (or a small `milestoneController.js` if that reads cleaner — controller-per-
  collection is the established E0 pattern, use your judgment on whether milestones warrant their
  own file given they're always accessed goal-scoped). **`toggleComplete` awards a +10 point
  bonus** when a milestone flips to completed (`Architecture.md` §6.1: "Milestone bonus=10") —
  this is a scoring-domain constant, so add it to `server/utils/scoring.js` (the same file `E2-2`
  creates the task-scoring formula in — if E2 hasn't landed yet, create the file here with just
  this constant/function) rather than hardcoding the number inline in the controller. Roll it
  into that day's `DailySummary.pointsEarned` the same way `E4-3` hooks in task/habit points —
  flag this specific hook-in explicitly to whoever implements `E4-3`, since that work order
  doesn't independently know about this milestone bonus.

**Tasks — Frontend:**

- `GoalDashboardPage` (route `/goals`): `GoalCard` (title, category, progress ring, health dot —
  `ProgressRing`/`HealthDot` as small shared components), a 12-week bar visualization per goal,
  search/filter (gap-fill, same note as backend), empty state (hand off to `POL-1`'s shared
  component once that epic lands — stub with plain text until then).
- `WeeklyHeatmap` — needs completed-task density data (`Task.status === 'completed'` grouped by
  date). **E2-2 (task completion) has now shipped on the backend** — the original "build against a
  placeholder, defer the real wiring" advice no longer applies. Wire this directly to real data
  from the start, once the client-side Tasks rewire (`WORK-ORDER-FRONTEND-CATCHUP.md` Step 1) has
  landed — if you're working this epic per that file's Step 3, Step 1 is already done by the time
  you reach this story.
- `GoalDetailPage` (route `/goals/:id`): `MilestoneList` (toggle/reorder), a manual-override
  slider wired to `overrideProgress`, goal edit/delete actions (delete routes through
  `POL-4`'s confirmation dialog once that epic exists — stub with a plain `window.confirm` or a
  local AlertDialog until then, don't skip the confirmation itself).
- `useGoals`, `useGoal(id)`, `useUpdateGoal`, `useToggleMilestone`, `useOverrideProgress` — React
  Query hooks; components receive view-model shapes, not raw Mongoose documents (ISP, per
  `AGENT-OPERATING-INSTRUCTIONS.md` §5).

**AC:** `/goals` lists the user's goals with working search/filter, correct health-dot colors per
the ratio thresholds in `Architecture.md` §6.2. `/goals/:id` shows milestones (toggleable,
reorderable) and a working manual-progress override. Heat map renders against placeholder data
with the real wiring explicitly noted as deferred to post-E2.

**Dependencies:** E1-1 (goal creation must exist to have anything to list). Heat-map's real data
wiring depends on `E2-2` (task completion) — already shipped on the backend; per
`WORK-ORDER-FRONTEND-CATCHUP.md`'s sequencing, the client Tasks rewire (Step 1) lands before this
epic (Step 3), so there's no need to stub it.

---

## Hand-off notes

Report against each story's AC explicitly. Call out the heat-map deferral in your hand-off even
if you did wire it against real data (i.e., confirm which state it shipped in). See
`AGENT-OPERATING-INSTRUCTIONS.md` §9 for the full honesty/review requirement.
