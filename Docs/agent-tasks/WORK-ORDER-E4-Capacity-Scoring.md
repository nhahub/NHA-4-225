# Work Order — Epic E4: Day Types, Capacity & Scoring

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.3 (capacity), §6.4 (day state),
> §5 (directory structure); `Docs/Epics.md` E4; `Docs/team-task-breakdown.md` E4-1/E4-2/E4-3
> (full itemized detail, translate stale idioms per the table below).
>
> **Updated 2026-07-10 — this epic's backend has shipped, including E4-3's cross-epic hooks into
> E2/E3.** See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` for the current big-picture build
> sequence across all epics — this epic's frontend is split across Step 2 (E4-1
> Settings/`DayTypeProvider`, moved early because E3's Habits/Step 4 needs it) and Step 5 (E4-2/
> E4-3, still last, since that's genuinely dependent on Steps 1/2/4). The **Backend** subsections
> below are now a verification checklist, not a build list.
>
> **Execution model: single agent, sequential.** Work E4-1 → E4-2 → E4-3 in strict order — this
> is the one epic where the internal sequencing is load-bearing, not just convention: E4-2 needs
> E4-1's day-type data, and E4-3 is explicitly this epic's capstone, hooking into code from E2 and
> E3 as well.
>
> **Gate: E0 complete (verified), and E2-2/E3-1 backend both shipped** — the cross-epic hooks
> E4-3 needs into task/habit completion are already live server-side. Only the frontend (E4-1's
> Settings page, E4-2's gauge, E4-3's progress bar) remains, per the sequence above.

---

## 0. Current State — updated 2026-07-10, backend shipped, both flagged questions resolved

**Already exists and verified — do not recreate:**
- `hadaf/server/models/DailySummary.js` — `userId`, `date`, `dayType` enum
  `work|light|off`, `tasksCompleted`, `habitsCompleted`, `pointsEarned`, `dailyTarget`,
  `dayState` enum `legendary|amazing|perfect|good_enough|low`, `summaryShown`; unique compound
  index `{userId, date}`; co-located `DailySummary.dailySummaryValidationSchema`.
- `hadaf/server/models/User.js` — `settings` sub-document has `work_hours_start`,
  `work_hours_end`, `day_start` (default `"04:00"`), `off_days: [String]`, `theme`, `language`,
  `notifications.time_block_reminder`, plus a co-located `User.updateSettingsSchema`.

**Backend — SHIPPED:**
- `server/controllers/settingsController.js` + `server/controllers/dailySummaryController.js` —
  live endpoints: `PATCH /api/user/settings` (mounted under `userRoutes.js`, not a separate
  `settingsRoutes.js` — a naming deviation, functionally the same thing), `GET
  /api/daily-summaries/today`, `GET /api/daily-summaries/capacity`,
  `PATCH /api/daily-summaries/:date/day-type`.
- `server/utils/capacity.js` / `server/utils/dayState.js` — filenames match what this section
  originally specified (camelCase `dayState.js`). Verified matching `Architecture.md` §6.3/§6.4
  exactly: day-state boundaries at precisely 150/120/100/50%, capacity 80%/50%/0% by day type.
- **Day-start range validation (part of E4-1's AC) is done** — `User.js`'s
  `userSettingsValidationSchema`/`updateSettingsSchema` already constrain `day_start` to
  01:00–06:00 via regex (confirmed directly in the model file).

**Both flagged open questions from this section are now resolved — verified directly against the
live code, not inferred:**
1. **The day-type-per-weekday schema question: resolved as option (a).** `User.js`'s `settings`
   still only has `off_days: [String]` — confirmed no `lightDays`/`light_days` field or any other
   3-state addition exists. So "light day" is a same-day manual override only, not a stored
   per-weekday template. Build `SettingsPage`'s day-type control (below) around a manual
   override, not a weekday config grid.
2. **The E4-2 lunch-break constant: resolved, already flagged in code.** `capacity.js` hardcodes
   `LUNCH_BREAK_MINUTES = 60` with a comment marking it as an assumption pending a design/PM
   decision (matches this file's own guidance below) — nothing further to do here besides
   inheriting the same flag if you ever revisit the value.

**One item that's still genuinely open** (not resolved by the backend work, carry it forward):
`server/utils/dayState.js` has an explicit `// TODO (Product Sign-off): Multipliers for adaptive
targets on light/off days are assumed.` comment — the 0.5×/0.2× multipliers in
`calculateAdaptiveDailyTarget` (E4-3 below) are shipped but still awaiting real product sign-off.

**Still net-new — this is what's actually left in this epic:**
`DayTypeProvider` client context, `SettingsPage`, capacity gauge, progress bar — none of it exists
yet beyond a stub `SettingsPage.tsx` ("Coming Soon" placeholder).

See `Docs/agent-tasks/WORK-ORDER-FRONTEND-CATCHUP.md` Steps 2 (E4-1) and 5 (E4-2/E4-3) for how
this epic's frontend fits into the overall build sequence.

## Idiom translation

| Stale wording | Build this instead |
|---|---|
| "day_type / day_state enums", "`daily_summaries` table" | Already satisfied by `DailySummary.js` — nothing to create |
| "`users.settings` JSONB" | `User.settings` sub-document (already exists, Mongoose not Postgres JSONB) |
| `features/settings/actions.ts`, `features/scoring/actions.ts` | `server/controllers/settingsController.js`, `server/controllers/dailySummaryController.js` + matching route files |
| `data/repositories/users.repo.ts`, `data/repositories/daily-summaries.repo.ts` | Controllers call `User`/`DailySummary` directly — no repository layer |
| `domain/capacity.ts`, `domain/day-state.ts` | `server/utils/capacity.js`, `server/utils/dayState.js` |
| `providers/day-type.tsx`, `hooks/use-day-type.ts` | `providers/DayTypeProvider.tsx`, `hooks/useDayType.ts` (PascalCase/camelCase per `Architecture.md` §4.1) |

---

## E4-1 — Day Types & Settings

**Goal:** A settings screen covering work hours, day-start time, day-type behavior, theme, and
notification preferences.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/controllers/settingsController.js` + route (mounted under `userRoutes.js`):
  `updateSettings` — validates with `User.updateSettingsSchema`, updates `req.user`'s `settings`
  sub-document. Response: `ApiResponse<User['settings']>`.
- **Day-start time range (01:00–06:00, FR55.2): done.** Confirmed directly in `User.js` — the
  regex constraint is already in place, not just the basic HH:MM format check.

**Frontend — net-new, this is the actual priority (Step 2 of
`WORK-ORDER-FRONTEND-CATCHUP.md` — build this early, ahead of Habits/Step 4):**

- `SettingsPage` (route `/settings`): work-hours start/end pickers, day-start picker (already
  range-constrained server-side, see above), off-days picker, theme toggle (dark/light, FR53),
  language display (this screen doesn't need to duplicate E0-6's language switcher — read-only or
  a shortcut back to it is enough), notification-preferences toggle (the single
  `notifications.time_block_reminder` boolean). **Manual day-type override control (today only)**
  — per §0's resolved schema question, this is a same-day override, not a per-weekday config grid.
- `DayTypeProvider` context + `useDayType` hook — exposes the resolved day type for "today". Build
  this **before** Habits (Step 4 in the sequence) so `E3-1`'s MVD indicator can wire to the real
  thing directly instead of a temporary stub.

**AC:** Settings persist and reflect immediately. Day-start time rejects values outside
01:00–06:00 (already enforced server-side — verify, don't re-implement). `DayTypeProvider`
correctly resolves today's day type per the manual-override model. Theme toggle and notification
preference both work.

**Dependencies:** none — E0 complete, backend done. This is the epic's frontend priority precisely
because Habits (Step 4) depends on it.

---

## E4-2 — Daily Capacity Intelligence

**Goal:** Compute and visually surface how much of today's work capacity is planned/free.

**Backend — already shipped (verify against this checklist, don't rebuild):**

- `server/utils/capacity.js` (pure): `calculateDailyCapacity(input)` —
  `(work_end - work_start - lunch) × 0.80` on a work day; `× 0.50` on a light day; `0` on an off
  day (`Architecture.md` §6.3). **The lunch constant is resolved** — `LUNCH_BREAK_MINUTES = 60` is
  hardcoded and flagged in a comment as an assumption pending design/PM sign-off, exactly per this
  section's original guidance. `calculatePlannedTime(tasks)` and `parseTimeToMinutes(time)` are
  also shipped.
- `getCapacity` exists on `dailySummaryController.js` (`GET /api/daily-summaries/capacity`),
  computed on request against the day's real task list and resolved day type — not persisted.

**Tasks — Frontend (net-new, Step 5 in `WORK-ORDER-FRONTEND-CATCHUP.md` — after Tasks/Settings/
Goals/Habits, since it needs all of their real data):**

- **Visual capacity gauge on the Home screen** — required, not optional; this is the product's
  signature visual per the PRD, give it real design attention (SVG-based, animated fill).
- Overload warning: a gentle/subtle accent (not a hard error/red alert) when planned time exceeds
  capacity (FR83.1).
- Task-suggestion prompt: triggers specifically when planned time is **<30% of capacity**
  (FR83.2 — this exact threshold, not a vague "looks light" heuristic).
- `useCapacity` hook. A visible entry point back to `SettingsPage`'s work-hours config (FR83.3).

**AC:** `calculateDailyCapacity`/`calculatePlannedTime`/`parseTimeToMinutes` unit-tested and
correct for Work/Light/Off + custom hours. Gauge renders on Home and updates as tasks are
added/removed for today. Overload warning is visually gentle, not alarming. Suggestion prompt
fires only below the 30% threshold, verified with a test case near the boundary.

**Dependencies:** E4-1 (day type resolution).

---

## E4-3 — Scoring Engine & Progress Bar

**Goal:** Roll up a day's points into a `DailySummary`, classify the day into one of 5 states,
show a live progress bar.

**Backend — already shipped, including the cross-epic hooks (verify against this checklist, don't
rebuild):**

- `server/utils/dayState.js` (pure): `calculateDayState(points, target)` — ratio = points/target:
  ≥150% `legendary`, ≥120% `amazing`, ≥100% `perfect`, ≥50% `good_enough`, <50% `low`
  (`Architecture.md` §6.4). `calculateAdaptiveDailyTarget(recentDailyPoints, dayType)` — rolling
  7-day average of points, `× 0.5`/`× 0.2` on light/off days (still flagged pending product
  sign-off — see §0). Confirmed matching all 5 state boundaries exactly.
- `server/controllers/dailySummaryController.js` — `getToday` (`GET /api/daily-summaries/today`,
  upserts if today's `DailySummary` doesn't exist yet).
- **The cross-epic recompute hooks are confirmed wired**: a `DailySummary` recompute
  (`tasksCompleted`/`habitsCompleted`/`pointsEarned`/`dayState`) fires at the end of
  `taskController.completeTask` and `habitController.logHabit`, and the milestone `toggleComplete`
  +10 point bonus (`MILESTONE_BONUS_POINTS` in `dailySummaryController.js`) rolls into the same
  day's total — exactly as this section originally specified.

**Tasks — Frontend (net-new, part of Step 5 in `WORK-ORDER-FRONTEND-CATCHUP.md`):**

- `ProgressBar` — 4 CSS color states (red/orange/purple/green per the existing status-color
  guardrail — verify the real token names in `tailwind.config.js` rather than assuming exact hex/
  OKLCH values), animated width transition (`transition: width 500ms ease-out`, CSS only, no
  Framer Motion).
- `DayStateBadge` — all 5 states. The `good_enough` state's copy/framing must read as genuinely
  positive ("a good enough day is a win," not a consolation prize) — this is a direct application
  of the voice guardrail, not a generic badge.
- `DailySummaryToast` — surfaced once per day (respects `DailySummary.summaryShown`, flip it to
  `true` after showing so it doesn't repeat on every load).

**AC:** `calculateDayState` matches all 5 boundary tests exactly. `DailySummary` recomputes
automatically after completing a task or logging a habit (verify end-to-end, not just that the
util function works in isolation). Progress bar animates smoothly and uses real token colors.
"Good Enough Day" state copy reads as positive in both languages.

**Dependencies:** E2-2 (task points), E3-1 (habit points), E4-1 (day type) — this is the epic's
capstone, sequence it last within E4 as noted at the top of this file.

---

## Hand-off notes

Report against each story's AC explicitly. Both items this file used to flag as open questions are
now resolved (§0: day-type is manual-override-only, lunch constant is hardcoded-and-flagged) — no
need to re-litigate either, just confirm the frontend respects the manual-override model. The one
still-genuinely-open item to carry forward: `dayState.js`'s adaptive-target multipliers remain
unconfirmed by product — flag it again if you touch that code. See
`AGENT-OPERATING-INSTRUCTIONS.md` §9.
