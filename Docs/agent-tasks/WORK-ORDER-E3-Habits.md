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
> **Execution model: single agent, sequential.** Work E3-1 → E3-2 in order.
>
> **Gate: do not start until E0 is fully complete.** E3 also has a **forward dependency worth
> knowing about now**: E3-1's MVD indicator is specified to read a `DayTypeProvider` context that
> isn't built until `E4-1` (later in epic order). See the note inside E3-1 below for how to
> sequence around this without blocking on E4.

---

## 0. Current State

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

**Net-new — everything else:**
- No `server/controllers/habitController.js` / `server/routes/habitRoutes.js`.
- No habit-point functions in `server/utils/scoring.js` yet. **These extend the same file E2-2
  creates** — `calculateHabitPoints`/`calculateCounterHabitPoints` are scoring-domain functions
  per `Architecture.md` §6.1, not a separate habits-domain file. If E2 hasn't landed yet,
  `scoring.js` doesn't exist — create it here with just the habit functions, and E2-2 (or you,
  if doing both) adds the task-scoring functions alongside them. Either order works; don't
  duplicate the file.
- No `hadaf/client/src/features/habits/` — fully new, Impulse has no habits feature to adapt from.

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

**Tasks — Backend:**

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

**Tasks — Frontend:**

- `HabitCard` / `HabitList` — boolean habits show a single toggle; counter habits show a
  numeric-stepper (`HabitCounter`) against `targetValue`.
- **MVD indicator — forward-dependency note:** the spec calls for this to read the active day
  type from `DayTypeProvider`, which is built in `E4-1` (not yet built when you reach E3 in
  sequence). Build the indicator now against a minimal local read — e.g. a prop or a lightweight
  query for "is today a light/off day" sourced from whatever's available at the time (worst case:
  hardcode to "work day" behavior and leave a
  `// TODO(E4-1): wire to DayTypeProvider once it exists` comment) — don't block E3-1 on E4. If
  you're the one implementing both epics later, come back and do the real wiring once `E4-1`
  lands, and confirm it in your E4-1 hand-off notes.
- `useCreateHabit`, `useLogHabit`, `useHabits` — React Query hooks.
- `HabitsPage` (route `/habits`).

**AC:** Boolean and counter habits can be created and logged. Re-logging the same habit on the
same date updates the existing log (upsert), doesn't error. `calculateHabitPoints`/
`calculateCounterHabitPoints` match `Architecture.md` §6.1's point values exactly for every
tested branch. MVD indicator renders (even if against the temporary local read noted above).

**Dependencies:** E0 complete. Shares `scoring.js` with E2 — see the Current State note on
sequencing that file. MVD indicator's real `DayTypeProvider` wiring depends on E4-1 (non-blocking,
see above).

---

## E3-2 — Quit Habits & Relapse Tracking

**Goal:** A `quit`-type habit variant that tracks streak-since-relapse instead of daily completion,
with a non-punitive relapse flow.

**Tasks — Backend:**

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
