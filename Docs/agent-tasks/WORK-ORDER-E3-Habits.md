# Work Order — Epic E3: Habit Tracking

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.1 (habit points), §5 (directory
> structure); `Docs/PRD.md` FR36.1 (no religious habits in the suggested library); `Docs/Epics.md`
> E3; `Docs/team-task-breakdown.md` E3-1/E3-2 (full itemized detail, translate stale idioms per
> the table below).
>
> **Updated 2026-07-10 — this epic's backend has shipped.** See
> `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` for the current big-picture build sequence
> across all epics (this epic is Step 4 of 5, after Settings/`DayTypeProvider` — see the gate note
> below, now resolved in this epic's favor). The **Backend** subsections below are now a
> verification checklist, not a build list; the **Frontend** is still fully net-new.
>
> **Execution model: single agent, sequential.** Work E3-1 → E3-2 in order.
>
> **Gate: E0 complete (verified).** The forward dependency this file originally flagged —
> E3-1's MVD indicator needing a `DayTypeProvider` context from `E4-1` — is resolved by
> `WORK-ORDER-FRONTEND-CATCHUP.md`'s sequencing: Settings/`DayTypeProvider` is Step 2, ahead of this
> epic's Step 4. If you're following that sequence, `DayTypeProvider` already exists by the time
> you reach E3-1 — wire to it directly, skip the temporary-stub advice below.

---

## 0. Current State — updated 2026-07-10, backend shipped

**Already exists and verified — do not recreate:**
- `hadaf/server/models/Habit.js` — `userId`, `title`, `category` enum
  `education_work|family|health|religion_spirituality|other`, `type` enum
  `boolean|counter|quit`, `frequency.type` (default `"daily"`), `targetValue`, `mvdValue`,
  `mvdDescription`, `isSpiritual`, `isArchived`; co-located `Habit.createHabitSchema`.
- `hadaf/server/models/HabitLog.js` — `habitId`, `date` (`YYYY-MM-DD`), `value`, `isMvd`,
  `isRelapse`; **unique compound index `{habitId, date}`** (one log per habit per day — the
  controller must upsert, not blind-insert, or a same-day re-log will throw a duplicate-key
  error); co-located `HabitLog.logHabitSchema`.
- Both carry an E0-3.1 verification comment — trust the live files over this description if they
  disagree.

**Backend — SHIPPED:**
- `server/controllers/habitController.js` + `server/routes/habitRoutes.js` — live endpoints:
  `GET/POST /api/habits`, `GET /api/habits/logs`, `POST /api/habits/:id/log`,
  `POST /api/habits/:id/relapse`.
- Habit-point functions in `server/utils/scoring.js` (shared with E2, as this file anticipated) —
  verified matching `Architecture.md` §6.1's point table exactly (boolean full=5/MVD=3, counter
  full=5/partial=4/mvd-only=3, quit=0).
- Relapse/streak-since-relapse logic lives in **`server/utils/habit-streak.js`** — a read-time
  calculation as E3-2 below specifies, not a stored counter. Note this is a **kebab-case**
  filename (same pattern as `goal-progress.js`/`task-type.js` in E1/E2) — it wasn't originally
  named in this section, but this is where that logic ended up.

**Still net-new — this is what's actually left in this epic:**
- `hadaf/client/src/features/habits/` — still doesn't exist beyond a stub `HabitsPage.tsx`
  ("Coming Soon" placeholder). Fully new — Impulse has no habits feature to adapt from.

See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` Step 4 for how this epic's frontend fits
into the overall build sequence (after Settings/`DayTypeProvider`, so the MVD indicator below can
wire to the real thing from the start).

## Idiom translation

| Stale wording | Build this instead |
|---|---|
| "habit_type enum", "habits table", "habit_logs table" | Already satisfied by `Habit.js`/`HabitLog.js` — nothing to create |
| `features/habits/actions.ts` | `server/controllers/habitController.js` + `server/routes/habitRoutes.js` |
| `data/repositories/habits.repo.ts` | Controller calls `Habit`/`HabitLog` directly — no repository layer |
| `domain/*.ts` habit-scoring functions | `server/utils/scoring.js` (shared with E2) |
| `ActionResult` | `ApiResponse<T>` |

---

## E3-1 — Build Habits & MVD

**Goal:** Create boolean/counter habits, log daily progress, show the Minimum Viable Dose (MVD)
fallback.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/utils/scoring.js` (pure, shared with E2 — see note above): `calculateHabitPoints(type,
  isMvd)` — boolean: full=5, MVD=3. `calculateCounterHabitPoints(value, target, mvd)` — full
  (value ≥ target) = 5, partial (mvd ≤ value < target) = 4, MVD-only (value < mvd but ≥ some
  logged value) = 3. `quit` type = 0 (its scoring lives in E3-2's `logRelapse` flow, not here).
  Values per `Architecture.md` §6.1's "Habit points" table exactly — unit-test each branch.
- `server/controllers/habitController.js` + `server/routes/habitRoutes.js`: `createHabit`
  (validates with `Habit.createHabitSchema`, scoped to `req.user.id`), `logHabit` (validates with
  `HabitLog.logHabitSchema`, **upserts** on `{habitId, date}` — don't let the unique index throw
  on a same-day re-log, that's a legitimate "user changed their mind" case), `getHabits` (list,
  scoped to user), `getHabitLogs` (for a date range, used by the habit's history view).

**Tasks — Frontend (fully net-new):**

- `HabitCard` / `HabitList` — boolean habits show a single toggle; counter habits show a
  numeric-stepper (`HabitCounter`) against `targetValue`.
- **MVD indicator:** per `WORK-ORDER-FRONTEND-CATCHUP.md`'s sequencing, `DayTypeProvider` (built in
  Settings/Step 2) already exists by the time you reach this story — wire the indicator directly
  to it, no stub needed. *(Only fall back to a local read/TODO comment if you're working this epic
  out of that sequence, i.e. before Settings/`DayTypeProvider` exists.)*
- `useCreateHabit`, `useLogHabit`, `useHabits` — React Query hooks, wired to the real endpoints in
  §0 above.
- `HabitsPage` (route `/habits`) — replaces the current "Coming Soon" stub.

**AC:** Boolean and counter habits can be created and logged. Re-logging the same habit on the
same date updates the existing log (upsert), doesn't error. `calculateHabitPoints`/
`calculateCounterHabitPoints` match `Architecture.md` §6.1's point values exactly for every
tested branch. MVD indicator renders against the real `DayTypeProvider` (or the temporary local
read, only if built out of sequence — see above).

**Dependencies:** E0 complete. Shares `scoring.js` with E2 (both already shipped on the backend).
MVD indicator's `DayTypeProvider` wiring depends on Settings/Step 2 of
`WORK-ORDER-FRONTEND-CATCHUP.md`, which precedes this epic in that sequence.

---

## E3-2 — Quit Habits & Relapse Tracking

**Goal:** A `quit`-type habit variant that tracks streak-since-relapse instead of daily completion,
with a non-punitive relapse flow.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `logRelapse` controller action: writes a `HabitLog` for today with `isRelapse: true`. The
  "counter resets" behavior described in `team-task-breakdown.md` is a **read-time**
  calculation, not a stored field — compute "days since last relapse" by querying the habit's
  `HabitLog`s for the most recent `isRelapse: true` entry and diffing dates; don't add a
  redundant `currentStreak` field to the schema for this (`Habit.js`/`HabitLog.js` are already
  verified against `Architecture.md` §3.1 — don't modify them for this story unless the streak
  calculation genuinely can't be done from existing fields, in which case flag it rather than
  silently adding a column).

**Tasks — Frontend:**

- Quit-habit card variant: shows days-since-relapse instead of a completion toggle/counter.
- `RelapseConfirmationDialog` — a deliberate extra confirmation step before logging a relapse
  (this is the one habit action that should NOT be a single tap, unlike boolean/counter logging).
- **Voice — exact tone anchor from the PRD, use it verbatim as the reference for this flow's
  copy**: *"لا بأس. التقدم ليس خطًا مستقيمًا. 💪"* ("It's okay. Progress isn't a straight line.")
  — encouraging, never punitive, no streak-shaming language. Ship both `ar` and `en` versions in
  the same commit per the i18n guardrail; the English version should carry the same warmth, not a
  literal stiff translation.

**AC:** Logging a relapse writes a `HabitLog` with `isRelapse: true` and the UI immediately
reflects a reset days-since-relapse count (computed from log history, not a stored counter,
unless you flagged and got sign-off on adding one). Relapse requires an explicit confirmation
step. Microcopy matches the PRD's non-punitive tone in both languages.

**Dependencies:** E3-1 (habit creation/model wiring).

---

## Hand-off notes

Report against each story's AC explicitly. Explicitly state whether E3-1's MVD indicator shipped
against the temporary local read or the real `DayTypeProvider` (only possible if E4-1 was already
done when you reached this epic). See `AGENT-OPERATING-INSTRUCTIONS.md` §9.
