# Work Order — Epic E2: Task Management & Time Blocking

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.1 (scoring), §6.5 (task-type
> detection), §5 (directory structure); `Docs/Epics.md` E2; `Docs/team-task-breakdown.md`
> E2-1/E2-2/E2-3 (full itemized detail, translate its stale idioms per the table below).
>
> **Execution model: single agent, sequential.** Work E2-1 → E2-2 → E2-3 in order.
>
> **Gate: do not start until E0 is fully complete** (auth, controller/route/middleware pattern,
> i18n, app shell — see `WORK-ORDER-E0-Foundation.md`). E2 does not depend on E1, but the two are
> intended to land close together — E1-2's weekly heat map needs E2-2's completed-task data (see
> the cross-epic note in `WORK-ORDER-E1-Goals.md`'s E1-2 section).

---

## 0. Current State

**Already exists and verified — do not recreate:** `hadaf/server/models/Task.js` — full schema
(`userId`, `goalId` optional, `title`, `description`, `type` enum `scheduled|flexible|quick`,
`difficulty` enum `easy|medium|hard`, `priority` enum `high|medium|low`, `date` as `YYYY-MM-DD`
string, `timeBlockStart`/`timeBlockEnd` as `HH:MM` strings, `plannedDurationMinutes`,
`actualDurationMinutes`, `checklist[]` (`title`, `is_completed`), `status` enum
`pending|completed|postponed`, `pointsEarned`, `completedAt`), index `{userId, date, priority}`,
co-located `Task.createTaskSchema` and `Task.completeTaskSchema` (Zod). Carries an E0-3.1
verification comment — trust the live file over this description if they disagree.

**Net-new — everything else:**
- No `server/controllers/taskController.js` / `server/routes/taskRoutes.js`.
- No `server/utils/scoring.js` or `server/utils/taskType.js`. `team-task-breakdown.md` marks
  these domain functions `[x]` — that's aspirational, not real. `Architecture.md` §6 names them
  `scoring.js`/`task-type.js`; follow the real committed camelCase convention:
  **`scoring.js`** (already camelCase, no change needed) and **`taskType.js`** (not
  `task-type.js`).
- No `hadaf/client/src/features/tasks/` business logic wired to real endpoints — Impulse's
  existing `features/tasks/api/taskApi.ts` was only stubbed to compile cleanly in E0-1.2 (a
  `// TODO(E2): rewire to Express task endpoints` comment marks where this epic's work begins).
  Reuse Impulse's existing `features/tasks/` component shells where they fit; don't discard them
  wholesale.

## Idiom translation

| Stale wording (`team-task-breakdown.md`) | Build this instead |
|---|---|
| "task_type / difficulty / priority / status enums", "tasks table" | Already satisfied by `Task.js` — nothing to create |
| `features/tasks/actions.ts` | `server/controllers/taskController.js` + `server/routes/taskRoutes.js` |
| `data/repositories/tasks.repo.ts` | Controller calls `Task` directly — no repository layer |
| `domain/scoring.ts`, `domain/task-type.ts` | `server/utils/scoring.js`, `server/utils/taskType.js` |
| `ActionResult` | `ApiResponse<T>` |
| FCM / push notifications | Browser `Notification` API only — no FCM, no service worker push (`Architecture.md` doesn't scope a push infra) |

---

## E2-1 — Task Engine & Auto-Type Detection

**Goal:** Quick-add a task; the system infers its type and previews likely points.

**Tasks — Backend:**

- `server/utils/taskType.js` (pure): `detectTaskType(input)` — `timeBlockStart` AND
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

**Tasks — Frontend:**

- `QuickAddSheet` — single-input-first quick add (title required, everything else optional/
  progressive disclosure), shows the `predictTaskPoints` preview once enough fields are filled.
- `ChecklistInput` — add/remove/reorder checklist items matching `Task.checklist[]`'s shape.
- `useCreateTask` — React Query mutation, invalidates the task-list query for the task's `date`.

**AC:** Creating a task with only a title defaults it to `quick`; adding a time block flips it to
`scheduled`; adding only a planned duration flips it to `flexible` — verified against
`detectTaskType`'s exact branching, not just "looks right." Points preview updates live as fields
change. Query scoped to the authenticated user.

**Dependencies:** E0 complete.

---

## E2-2 — Task Completion Flows

**Goal:** Mark a task complete (smart-detect vs. manual duration entry), award points, show the
Contribution Pulse.

**Tasks — Backend:**

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

**Tasks — Frontend:**

- `SmartCompleteDialog` (task had a planned duration — offer "on time" as a one-tap default,
  manual override available) and `ManualCompleteDialog` (task had no planned duration — ask for
  actual time spent) — two distinct flows per `team-task-breakdown.md`, not one generic dialog.
- `ContributionPulse` — **exact spec, don't improvise**: text-only (no icon/badge/confetti — the
  no-gamification voice guardrail applies directly here), positioned inline directly above the
  completed task's card, CSS-only 3-second fade (`transition`, not Framer Motion — motion
  guardrail).
- `useCompleteTask` — mutation, invalidates the task-list query and (once E1-2 wires its real
  heat-map data source) the goal heat-map query for any date this task touches.

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

**Tasks — Backend:**

- `getTasks` (list, scoped to user, filter by `date` — sorted server- or client-side by priority
  then time block, your call, but the ordering must be deterministic), `rescheduleTask` (updates
  `date`/time block), `deleteTask`, `postponeTask` (sets `status: 'postponed'`), search/filter
  query params (gap-fill — same rationale as E1-2's: required for the list UI, not itemized in
  the PRD as its own FR).

**Tasks — Frontend:**

- `TaskList` — sorted per the above; a `BacklogRibbon` surfaces postponed/overdue tasks
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
