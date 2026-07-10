# Work Order — Epic E4: Day Types, Capacity & Scoring

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.1 (schema), §6.3 (capacity), §6.4 (day state),
> §5 (directory structure); `Docs/Epics.md` E4; `Docs/team-task-breakdown.md` E4-1/E4-2/E4-3
> (full itemized detail, translate stale idioms per the table below).
>
> **Execution model: single agent, sequential.** Work E4-1 → E4-2 → E4-3 in strict order — this
> is the one epic where the internal sequencing is load-bearing, not just convention: E4-2 needs
> E4-1's day-type data, and E4-3 is explicitly this epic's capstone, hooking into code from E2 and
> E3 as well.
>
> **Gate: do not start until E0 is fully complete**, and until **E2-2** (task points) and **E3-1**
> (habit points) exist — E4-3 modifies both of their controllers (see below).

---

## 0. Current State

**Already exists and verified — do not recreate:**
- `hadaf/server/models/DailySummary.js` — `userId`, `date`, `dayType` enum
  `work|light|off`, `tasksCompleted`, `habitsCompleted`, `pointsEarned`, `dailyTarget`,
  `dayState` enum `legendary|amazing|perfect|good_enough|low`, `summaryShown`; unique compound
  index `{userId, date}` (this satisfies `team-task-breakdown.md`'s "`daily_summaries` table +
  `UNIQUE(user_id, date)`" line — nothing to create); co-located
  `DailySummary.dailySummaryValidationSchema`.
- `hadaf/server/models/User.js` — `settings` sub-document already has `work_hours_start`,
  `work_hours_end`, `day_start` (default `"04:00"`), `off_days: [String]`, `theme`, `language`,
  `notifications.time_block_reminder`, plus a co-located **`User.updateSettingsSchema`** (a
  `.partial()` of the full settings Zod schema) — this already satisfies E4-1's
  `updateSettingsSchema` task, don't recreate it.

**Net-new:**
- No `server/controllers/{settingsController,dailySummaryController}.js` /
  matching routes.
- No `server/utils/capacity.js` or `server/utils/dayState.js`. `Architecture.md` §6 names them
  `capacity.js`/`day-state.js`; follow the real committed camelCase convention:
  **`capacity.js`** (no change) and **`dayState.js`** (not `day-state.js`).
- No `DayTypeProvider` client context, no `SettingsPage`, no capacity gauge, no progress bar.

**A schema question you need to resolve, not assume — flag it either way in your hand-off:**
`team-task-breakdown.md` E4-1 says *"Database: None new — uses `users.settings`"* and separately
lists a frontend task *"Day Type config per weekday (Work/Light/Off)"* — a **3-state** value per
weekday. But the actual, verified `User.js` settings only has `off_days: [String]` — a
**2-state** (off / not-off) concept, with no field for a per-weekday "light" designation.
Something has to give: either (a) "light day" isn't actually a per-weekday stored setting and is
instead a manual daily override only (see E4-1's "Manual day-type override control (today only)"
task — plausible, since that task already implies a same-day override exists somewhere), or (b)
`User.settings` genuinely needs a small additive field (e.g. `lightDays: [String]` alongside the
existing `off_days`, plus the matching Zod schema update) to represent a weekday-level template.
**Read `team-task-breakdown.md`'s full E4-1 section and `Architecture.md` §3.1 once more before
deciding** — if it's still ambiguous, implement option (a) (manual override only, no new field)
since it requires no schema change, and say explicitly in your hand-off that you made this call
and why, so it can be corrected if wrong.

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

**Tasks — Backend:**

- `server/controllers/settingsController.js` + `server/routes/settingsRoutes.js`:
  `updateSettings` — validates with the **already-existing** `User.updateSettingsSchema`, updates
  `req.user`'s `settings` sub-document. Response: `ApiResponse<User['settings']>`.
- **Day-start time**: `updateSettingsSchema`'s Zod definition already enforces the HH:MM regex,
  but does **not** currently constrain it to the documented FR55.2 valid range (01:00–06:00,
  default 04:00) — add that range constraint to `userSettingsValidationSchema`/
  `updateSettingsSchema` in `User.js` as part of this story (a real, scoped schema edit, unlike
  the flagged question above).

**Tasks — Frontend:**

- `SettingsPage` (route `/settings`): work-hours start/end pickers, day-start picker (constrained
  range per above), off-days picker, theme toggle (dark/light, FR53), language display (this
  screen doesn't need to duplicate E0-6's language switcher — read-only or a shortcut back to it
  is enough), notification-preferences toggle (gap-fill, FR-adjacent per
  `team-task-breakdown.md` §2.1 — the single `notifications.time_block_reminder` boolean).
  Day-type-per-weekday config or manual-override-only control per whichever resolution you picked
  in §0 above.
- `DayTypeProvider` context + `useDayType` hook — exposes the resolved day type for "today"
  (needed by `E3-1`'s MVD indicator, which was stubbed against a local placeholder pending this
  story — go confirm/finish that wiring once this lands, and say so in your hand-off).

**AC:** Settings persist and reflect immediately. Day-start time rejects values outside
01:00–06:00 (validated server-side, not just client-side). `DayTypeProvider` correctly resolves
today's day type per whichever model you settled on in §0. Theme toggle and notification
preference both work.

**Dependencies:** E0 complete (settings schema already exists from E0's model work; this story
adds the controller/route/frontend layer).

---

## E4-2 — Daily Capacity Intelligence

**Goal:** Compute and visually surface how much of today's work capacity is planned/free.

**Tasks — Backend:**

- `server/utils/capacity.js` (pure): `calculateDailyCapacity(input)` —
  `(work_end - work_start - lunch) × 0.80` on a work day; `× 0.50` on a light day; `0` on an off
  day (`Architecture.md` §6.3). **The `lunch` deduction has no dedicated settings field anywhere
  in the schema** — no doc specifies its value either. Use a fixed 60-minute constant inside
  `capacity.js` (name it clearly, e.g. `LUNCH_BREAK_MINUTES = 60`) and note in your hand-off that
  this was an assumption, not a spec — flag it for a design/PM decision rather than treating it
  as settled. `calculatePlannedTime(tasks)` — sum of today's tasks' `plannedDurationMinutes` (fall
  back to `actualDurationMinutes` for already-completed tasks without a planned value, if that
  case comes up). `parseTimeToMinutes(time)` — `"HH:MM"` → integer minutes. Unit-test all three
  against Work/Light/Off day types, custom hours, and the time-parsing edge cases
  (`team-task-breakdown.md` flags this test suite P0).
- No new controller strictly required — capacity is computed on request, not persisted
  (`team-task-breakdown.md`: "None new — capacity is computed, not persisted"). Expose it via a
  small `getCapacity` action (could live on `dailySummaryController.js` since it's read-only and
  date-scoped, or its own thin controller — your call) that calls `calculateDailyCapacity` +
  `calculatePlannedTime` against the day's real task list and today's resolved day type from
  `DayTypeProvider`'s server-side equivalent (i.e., `req.user.settings` + the day-type resolution
  logic from E4-1).

**Tasks — Frontend:**

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

**Tasks — Backend:**

- `server/utils/dayState.js` (pure): `calculateDayState(points, target)` — ratio = points/target:
  ≥150% `legendary`, ≥120% `amazing`, ≥100% `perfect`, ≥50% `good_enough`, <50% `low`
  (`Architecture.md` §6.4). `calculateAdaptiveDailyTarget(recentDailyPoints, dayType)` — rolling
  7-day average of points, then `× 0.5` on a light day, `× 0.2` on an off day. Unit-test all 5
  state boundaries exactly at 49/50/100/120/150% plus a zero-target edge case
  (`team-task-breakdown.md` flags this P0).
- `server/controllers/dailySummaryController.js` + routes: `getToday` (read-only, computes/
  returns today's `DailySummary`, creating one via upsert if it doesn't exist yet for the date),
  `upsertDailySummary` (internal helper, not necessarily its own public route — called from the
  hook points below).
- **This story edits code from E2 and E3, not just new files** — hook a `DailySummary` recompute
  (recalculate `tasksCompleted`/`habitsCompleted`/`pointsEarned`/`dayState` for today, via an
  upsert on `{userId, date}`) into the **end of** `E2-2`'s `taskController.completeTask` and
  `E3-1`'s `habitController.logHabit`. **Also hook in `E1-2`'s milestone `toggleComplete` action**
  — it awards a +10 point bonus (`Architecture.md` §6.1, added to `scoring.js` in that work
  order) that must roll into the same day's `pointsEarned`/`dayState`, not just task/habit points.
  Keep the recompute logic itself inside
  `dailySummaryController.js` or a small shared helper — don't duplicate the roll-up math inline
  in both controllers; import and call it.

**Tasks — Frontend:**

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

Report against each story's AC explicitly. Two items need an explicit call either way in your
hand-off regardless of which way you resolved them: the E4-1 day-type-per-weekday schema question
(§0), and the E4-2 lunch-break constant assumption. See `AGENT-OPERATING-INSTRUCTIONS.md` §9.
