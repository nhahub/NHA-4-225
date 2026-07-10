# Work Order — Epic E2: Task Management & Time Blocking

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.1 (scoring), §6.5 (task-type
> detection), §5 (directory structure); `Docs/Epics.md` E2; `Docs/team-task-breakdown.md`
> E2-1/E2-2/E2-3 (full itemized detail, translate its stale idioms per the table below).
>
> **Updated 2026-07-10 — this epic's backend has shipped; the frontend is the actual priority.**
> See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` for the current big-picture build sequence
> across all epics — **this epic is Step 1 of 5, the highest-priority step**, because a full
> Impulse-ported task UI already exists but is disconnected from the real API (`@ts-nocheck` on 16
> files). Read that file first. The **Backend** subsections below are now a verification checklist,
> not a build list.
>
> **Execution model: single agent, sequential.** Work E2-1 → E2-2 → E2-3 in order.
>
> **Gate: none — E0 is complete (verified).** E2 does not depend on E1; E1's weekly heat map
> depends on this epic's task-completion data, which is exactly why this epic is sequenced first
> in `WORK-ORDER-FRONTEND-CATCHUP.md`.

---

## 0. Current State — updated 2026-07-10, backend shipped, frontend is the real gap

**Already exists and verified — do not recreate:** `hadaf/server/models/Task.js` — full schema
(`userId`, `goalId` optional, `title`, `description`, `type` enum `scheduled|flexible|quick`,
`difficulty` enum `easy|medium|hard`, `priority` enum `high|medium|low`, `date` as `YYYY-MM-DD`
string, `timeBlockStart`/`timeBlockEnd` as `HH:MM` strings, `plannedDurationMinutes`,
`actualDurationMinutes`, `checklist[]` (`title`, `is_completed`), `status` enum
`pending|completed|postponed`, `pointsEarned`, `completedAt`), index `{userId, date, priority}`,
co-located `Task.createTaskSchema` and `Task.completeTaskSchema` (Zod). Carries an E0-3.1
verification comment — trust the live file over this description if they disagree.

**Backend — SHIPPED:**
- `server/controllers/taskController.js` + `server/routes/taskRoutes.js` — live endpoints:
  `GET/POST /api/tasks`, `PATCH /api/tasks/:id/complete`, `PATCH /api/tasks/:id/postpone`,
  `PATCH /api/tasks/:id/reschedule`, `DELETE /api/tasks/:id`.
- `server/utils/scoring.js` — matches `Architecture.md` §6.1 exactly, including the specific
  edge-case ordering this file calls out below (accuracy bonus checked against raw actual before
  the 3× cap is applied).
- `server/utils/task-type.js` — **note the real filename is kebab-case**, not `taskType.js` as
  originally instructed here (same pattern as `goal-progress.js`/`habit-streak.js` in E1/E3). Don't
  create a second, camelCase copy.
- **One gap vs. this epic's original scope:** no free-text search/filter beyond
  `date`/`status`/`type`/`view=backlog` query params — minor, only matters if E2-3's search UI
  (below) needs it.

**Still net-new — this is the actual epic-1-priority gap across the whole project:**
`hadaf/client/src/features/tasks/` has a **full UI already ported from Impulse** — forms,
completion flows, a victory overlay, score breakdown, drag/drop list — but it is **not wired to
the real endpoints above**. 16 of ~20 files carry `@ts-nocheck`, and
`features/tasks/types/index.ts` still models Impulse's shape (`day: Date`,
`priority: 'LOW'|'MEDIUM'|...`, `startTime/endTime`) instead of the real `Task` model described
above. The real, shipped component names also differ from what this file originally suggested
building — **don't create duplicates, adapt what's already there**:

| This work order originally said to build | What's actually there (adapt, don't duplicate) |
|---|---|
| `QuickAddSheet` | `TaskFormModal` (+ `components/form/*`) |
| `SmartCompleteDialog` / `ManualCompleteDialog` | `TaskCompletionModal`, `GlobalTaskCompletion` (+ `components/completion/*`) |
| `ContributionPulse` | `VictoryOverlay`, `ScoreBreakdown` — confirm these already satisfy the text-only/no-gamification guardrail below; adjust rather than replace if not |
| `TaskList` | `RegularTaskView`, `BigTaskView` |

See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` Step 1 for the exact rewire task list (types,
API layer, hooks, dropping `@ts-nocheck`) — that file is the priority-ordered version of the
Frontend tasks below.

## Idiom translation

| Stale wording (`team-task-breakdown.md`) | Build this instead |
|---|---|
| "task_type / difficulty / priority / status enums", "tasks table" | Already satisfied by `Task.js` — nothing to create |
| `features/tasks/actions.ts` | `server/controllers/taskController.js` + `server/routes/taskRoutes.js` |
| `data/repositories/tasks.repo.ts` | Controller calls `Task` directly — no repository layer |
| `domain/scoring.ts`, `domain/task-type.ts` | `server/utils/scoring.js`, `server/utils/task-type.js` (kebab-case — shipped, see §0) |
| `ActionResult` | `ApiResponse<T>` |
| FCM / push notifications | Browser `Notification` API only — no FCM, no service worker push (`Architecture.md` doesn't scope a push infra) |

---

## E2-1 — Task Engine & Auto-Type Detection

**Goal:** Quick-add a task; the system infers its type and previews likely points.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/utils/task-type.js` (pure): `detectTaskType(input)` — `timeBlockStart` AND
  `timeBlockEnd` present → `'scheduled'`; else `plannedDurationMinutes > 0` → `'flexible'`; else
  `'quick'` (`Architecture.md` §6.5). `calculateBlockDuration(start, end)` — minutes between two
  `HH:MM` strings.
- `server/utils/scoring.js` (pure — same file E2-2 extends): `predictTaskPoints(type, difficulty,
  planned)` — a preview-only estimate shown in the quick-add UI before the task is completed (the
  full `calculateTaskPoints` scoring formula is E2-2's task, since it needs actual-vs-planned
  data that only exists after completion).
- `server/controllers/taskController.js` + `server/routes/taskRoutes.js`: `createTask` —
  validates with `Task.createTaskSchema`, calls `detectTaskType` to set `type` when the client
  didn't already resolve it, scoped to `req.user.id`. Response: `ApiResponse<Task>`.

**Frontend — this is the real work (rewire, not rebuild — see the component-name table in §0):**

- `TaskFormModal` (was suggested as `QuickAddSheet`) — single-input-first quick add (title
  required, everything else optional/progressive disclosure), shows the `predictTaskPoints`
  preview once enough fields are filled. Rewire to real `createTask`, drop `@ts-nocheck`.
- `ChecklistInput` (in `components/form/`) — add/remove/reorder checklist items matching
  `Task.checklist[]`'s shape — confirm it already matches; adjust if it's still Impulse's shape.
- `useCreateTask` — React Query mutation, invalidates the task-list query for the task's `date`.
  Rewire to `POST /api/tasks`.

**AC:** Creating a task with only a title defaults it to `quick`; adding a time block flips it to
`scheduled`; adding only a planned duration flips it to `flexible` — verified against
`detectTaskType`'s exact branching, not just "looks right." Points preview updates live as fields
change. Query scoped to the authenticated user.

**Dependencies:** E0 complete.

---

## E2-2 — Task Completion Flows

**Goal:** Mark a task complete (smart-detect vs. manual duration entry), award points, show the
Contribution Pulse.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/utils/scoring.js` — `calculateTaskPoints(input)`, the full formula (`Architecture.md`
  §6.1): quick tasks always 2 points; otherwise `(actualDurationMinutes / 10) × difficultyMult ×
  accuracyBonus × streakBonus`, where `difficultyMult` is easy ×1.0/medium ×1.2/hard ×1.4,
  `accuracyBonus` is ×1.15 if `actualDurationMinutes` is within ±15 min of
  `plannedDurationMinutes`, `streakBonus` is ×1.05 per consecutive completed day capped at ×1.5,
  and `actualDurationMinutes` itself is capped at 3× planned before any of the above is applied.
  Final result: `Math.ceil(...)`. Unit-test every branch (quick-task shortcut, each difficulty
  tier, accuracy on/off, streak cap, duration cap) — this formula has the most edge cases in the
  whole epic.
- `completeTask` controller action: validates with `Task.completeTaskSchema`
  (`taskId`, `actualDurationMinutes`), computes the caller's current streak (consecutive prior
  days with ≥1 completed task — implement inside `taskController.js` or as a small query helper,
  it needs `Task` DB access so it doesn't belong in the pure `scoring.js`), calls
  `calculateTaskPoints`, sets `status: 'completed'`, `completedAt`, `pointsEarned`. Log an
  `AnalyticsEvent` (`eventType: 'task_completed'`).

**Frontend — this is the real work (rewire, not rebuild — see the component-name table in §0):**

- `TaskCompletionModal`/`GlobalTaskCompletion` (was suggested as `SmartCompleteDialog`/
  `ManualCompleteDialog`) — task had a planned duration → offer "on time" as a one-tap default,
  manual override available; no planned duration → ask for actual time spent. Confirm the existing
  components already distinguish these two flows; adjust if they've collapsed into one generic
  dialog. Rewire to `PATCH /api/tasks/:id/complete`.
- `VictoryOverlay`/`ScoreBreakdown` (was suggested as `ContributionPulse`) — **check against this
  exact spec, don't assume the Impulse original already matches it**: text-only (no icon/badge/
  confetti — the no-gamification voice guardrail applies directly here), CSS-only fade
  (`transition`, not Framer Motion — motion guardrail). Adjust if the ported version has
  gamification flourishes Impulse used that Hadaf's guardrails don't allow.
- `useCompleteTask` — mutation, invalidates the task-list query and the goal heat-map query (E1-2,
  now unblocked — see that work order's updated note) for any date this task touches.

**AC:** Completing a task computes points matching `calculateTaskPoints` exactly for each tested
branch. `ContributionPulse` renders text-only, fades via CSS in ~3s, no icon/animation library
involved. Smart vs. manual dialog selection matches whether the task had a planned duration.

**Dependencies:** E2-1. This story is also what `E1-2`'s weekly heat map and `E4-3`'s scoring
engine both consume downstream — once this lands, go back and confirm E1-2's heat-map wiring
(flagged as deferred in that work order) if you're the one implementing both epics.

---

## E2-3 — Task List & Backlog

**Goal:** Sorted daily task list, backlog for overdue/postponed items, reschedule/delete actions,
time-block reminders, an "all done" end state.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `getTasks` (list, scoped to user, filter by `date` — sorted server- or client-side by priority
  then time block, your call, but the ordering must be deterministic), `rescheduleTask` (updates
  `date`/time block), `deleteTask`, `postponeTask` (sets `status: 'postponed'`), search/filter
  query params (gap-fill — same rationale as E1-2's: required for the list UI, not itemized in
  the PRD as its own FR).

**Frontend — partly rewire (`RegularTaskView`/`BigTaskView`, was suggested as `TaskList`), partly
still net-new (backlog ribbon, notifications, search):**

- `RegularTaskView`/`BigTaskView` — sorted per the above; a `BacklogRibbon` surfaces postponed/overdue tasks
  separately from today's list, not interleaved.
- Reschedule/delete/postpone actions on each `TaskCard` (delete routes through `POL-4`'s
  confirmation dialog once that epic exists — stub with a local confirmation until then, same
  pattern as E1-2's delete action).
- Browser notifications: request `Notification` permission, fire a local notification 5 minutes
  before a `scheduled`-type task's `timeBlockStart`. No FCM, no server-side push — this is a
  client-only `setTimeout`/`Notification` API use, nothing in the backend changes for this.
- Search/filter UI (gap-fill, same note as backend).
- "All done" empty state (FR33): once every task for the day is `completed`/`postponed`, show a
  positive completion message plus a smart follow-up suggestion (e.g. surface a backlog item or
  suggest reviewing tomorrow) rather than just a blank list.

**AC:** Task list sorts deterministically. Backlog shows postponed/overdue items separately.
Reschedule/delete/postpone all work and reflect immediately (React Query invalidation, not a
manual refetch). A scheduled task fires a browser notification 5 minutes before its time block
(verify with a near-future test task, not just code review). "All done" state matches FR33: not
just an empty list, an actual completion message + suggestion.

**Dependencies:** E2-1, E2-2 (postpone/complete both touch `status`, keep them consistent).

---

## Hand-off notes

Report against each story's AC explicitly, including the streak-computation and scoring-formula
edge cases you actually tested. See `AGENT-OPERATING-INSTRUCTIONS.md` §9.
