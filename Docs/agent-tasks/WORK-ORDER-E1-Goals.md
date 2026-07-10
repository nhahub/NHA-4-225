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
> **Execution model: single agent, sequential**, same as `WORK-ORDER-E0-Foundation.md`. Work
> E1-1 → E1-2 in order.
>
> **Gate: do not start this epic until E0 is fully complete.** Specifically you need, from E0:
> auth working end-to-end (E0-5), the `controllers/routes/middleware` request pattern established
> (E0-3/E0-5), i18n dictionaries + `LocaleProvider` (E0-2), and the app shell with route guards
> (E0-6). If any of those aren't done, stop and finish E0 first — don't build goal features
> against a shell that doesn't exist yet.

---

## 0. Current State

**Already exists and verified — do not recreate:**
- `hadaf/server/models/Goal.js` — full schema (`userId`, `title`, `description`, `category` enum
  `education_work|family|health|religion_spirituality|other`, `customCategory`, `measure`,
  `relevance`, `cycleStart`, `cycleEnd`, `manualProgress`, `status` enum
  `active|completed|archived|replaced`, `deletionReason`), compound index `{userId, status}`, a
  `pre('deleteOne')` cascade hook that deletes the goal's milestones and unsets `goalId` on its
  tasks, plus co-located `Goal.createGoalSchema` and `Goal.softDeleteGoalSchema` (Zod).
- `hadaf/server/models/Milestone.js` — `goalId`, `title`, `sort_order`, `is_completed`,
  `completed_at`, index `{goalId, sort_order}`, co-located `Milestone.milestoneValidationSchema`.
- Both carry a header comment confirming they were checked against `Architecture.md` §3.1 in
  E0-3.1. If the live files disagree with this description, trust the live files and note the
  drift back to the team lead.

**Net-new — everything else in this epic:**
- No `server/controllers/goalController.js`, no `server/routes/goalRoutes.js` — `controllers/`
  and `routes/` currently hold only placeholder files.
- No `server/utils/goalProgress.js` (the domain math). `team-task-breakdown.md` marks
  `domain/goal-progress.ts` functions as done — that's stale/aspirational, not real; the file
  doesn't exist. `Architecture.md` §6.2 names it `goal-progress.js` (kebab-case, per its naming
  table) but every committed `server/utils/*.js` file so far uses camelCase
  (`appError.js`, `catchAsync.js`, `errorHandler.js`) — follow the real convention:
  **`goalProgress.js`**.
- No `hadaf/client/src/features/goals/` — Impulse's copy only brought `features/{auth,dashboard,tasks}`.
  Everything client-side for goals (wizard, dashboard, detail page, hooks, components) is built
  fresh, following the folder shape of Impulse's existing `features/tasks/` as the pattern to
  copy (api/, components/, hooks/, pages/, stores/ as needed — PascalCase component files per
  `Architecture.md` §4.1).

## Idiom translation (source doc → what to actually build)

`team-task-breakdown.md`'s E1 checklists still describe the abandoned Postgres/Drizzle/Next.js
plan. Translate as you read it:

| Stale wording | Build this instead |
|---|---|
| "goal_category / goal_status enums", "goals table", "milestones table" | Already satisfied by `Goal.js`/`Milestone.js` above — nothing to create |
| `features/goals/actions.ts` | `server/controllers/goalController.js` + `server/routes/goalRoutes.js` |
| `data/repositories/goals.repo.ts` | Controller calls `Goal`/`Milestone` models directly — no repository layer |
| `domain/goal-progress.ts` | `server/utils/goalProgress.js` |
| `ActionResult` | `ApiResponse<T>` (`Architecture.md` §3.3) |
| kebab-case component files (`goal-card.tsx`) | PascalCase (`GoalCard.tsx`) |

---

## E1-1 — SMART Goal Wizard

**Goal:** User can create a goal via a 3-step wizard with SMART-style fields, seeding milestones.

**Tasks — Backend:**

- `server/utils/goalProgress.js` (pure, no Express/Mongoose imports — SRP per
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

**Tasks — Backend:**

- `getGoals` (list, scoped to user, supports status/category filter — gap-fill: filtering wasn't
  itemized in the PRD but is required for the dashboard's search/filter UI), `getGoalById`
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
- `WeeklyHeatmap` — **cross-epic dependency**: needs completed-task density data
  (`Task.status === 'completed'` grouped by date) that only exists once E2 is built. Build the
  heatmap UI against a typed placeholder/empty data shape in E1-2, then wire it to the real
  endpoint (from `E2-2`, task completion) as a follow-up task once E2 lands — don't block the
  rest of E1-2 on this. Flag it explicitly in your hand-off notes as the one item deferred past
  E1-2's initial pass.
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
wiring depends on `E2-2` (task completion) — see the note above; do not block E1-2's other tasks
on E2.

---

## Hand-off notes

Report against each story's AC explicitly. Call out the heat-map deferral in your hand-off even
if you did wire it against real data (i.e., confirm which state it shipped in). See
`AGENT-OPERATING-INSTRUCTIONS.md` §9 for the full honesty/review requirement.
