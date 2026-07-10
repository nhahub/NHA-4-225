# Work Order — Epic ONB: Onboarding

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/PRD.md` FR1.1, FR36.1; `Docs/Architecture.md` §3.1 (schema);
> `Docs/Epics.md` ONB; `Docs/team-task-breakdown.md` ONB-1/ONB-2/ONB-3 (full itemized detail,
> translate stale idioms per the table below).
>
> **Execution model: single agent, sequential.** Work ONB-1 → ONB-2 → ONB-3 in order — this
> mirrors the actual 3-step wizard the user experiences.
>
> **Gate: this epic is almost entirely reuse.** It depends on E1-1 (goal creation), E3-1 (habit
> creation), E4-1 (settings), and E2-1 (task creation) all being done — ONB's own net-new surface
> is small (a stepper shell + a few onboarding-specific components), it wires existing flows into
> a first-run sequence. Confirm those 4 stories are complete before starting.

---

## 0. Current State

**Already exists (once the gate above is satisfied):** `Goal` creation (E1-1), `Habit` creation
(E3-1), `updateSettings` (E4-1), `Task` creation (E2-1) — ONB reuses all four rather than
reimplementing them.

**One field-name correction worth flagging up front:** `team-task-breakdown.md` writes
`onboarding_completed` (snake_case) throughout — the actual, verified field on
`hadaf/server/models/User.js` is **`onboardingCompleted`** (camelCase, matching every other
field on that model). Use the real field name.

**Net-new:**
- `server/controllers/onboardingController.js` (or a couple of small actions on an existing
  controller) for `completeOnboarding`.
- `hadaf/client/src/features/onboarding/` — fully new: stepper shell, the 3 step components, and
  the route.

## Idiom translation

| Stale wording | Build this instead |
|---|---|
| `features/onboarding/actions.ts` | `server/controllers/onboardingController.js` + route |
| `onboarding_completed` | `onboardingCompleted` (real field name on `User.js`, camelCase) |
| `lib/constants.ts` (suggested-habits list) | Same idea, just confirm the actual constants file location Impulse/E0 established (`shared/constants/` or similar — check what's there) |
| `components/onboarding/*.tsx` | PascalCase file names per `Architecture.md` §4.1 |

---

## ONB-1 — Onboarding Step 1 (Goal)

**Goal:** A non-skippable first step that gets the user to create their first goal, reusing
E1-1's wizard.

**Tasks — Backend:** None new — reuses E1-1's `createGoal` controller action as-is. Wizard
step-progression state is client-side only until `ONB-3`'s final `completeOnboarding` call.

**Tasks — Frontend:**

- `OnboardingWizard` — stepper shell showing progress (Step 1/3, 2/3, 3/3).
- `GoalReadinessStep` — wraps E1-1's `GoalReadinessDialog` + `GoalWizard` (built specifically to
  be embeddable for this reason, per that work order's note) — **cannot be skipped**, no "skip
  for now" affordance anywhere on this step.
- `OnboardingPage` (route `/onboarding`).

**AC:** A brand-new user is routed to `/onboarding` and cannot proceed past Step 1 without
completing E1-1's goal wizard. The created goal is the same real `Goal` document E1-1 produces
(no separate onboarding-only goal shape).

**Dependencies:** E1-1.

---

## ONB-2 — Onboarding Step 2 (Habits + MVD)

**Goal:** Offer a suggested-habits picker (chips) with an MVD prompt per selected habit.

**Tasks — Backend:**

- A static suggested-habits list (no DB collection — it's a constant, not one of the 8 schema
  collections). **Categories: `health`, `educational`/`education_work`, `family`/`relationships`
  only — no `religion_spirituality` entries in the suggested list** (FR36.1). This doesn't block
  a user from creating their own spiritual habit manually afterward via E3-1's free-text habit
  creation (`isSpiritual: true` is a real field on `Habit.js`) — the restriction is only on what
  the *suggested* list offers, not a platform-wide ban.
- Reuses E3-1's `createHabit` controller action.

**Tasks — Frontend:**

- `HabitsStep` — chip picker sourced from the suggested-habits constant.
- Per-selected-habit "What's the MINIMUM? (MVD)" prompt, writing to `Habit.mvdValue`/
  `mvdDescription` on creation.

**AC:** Suggested chips never include a religious/spiritual category habit. Selecting a chip and
setting an MVD creates a real `Habit` via E3-1's existing endpoint. Manually creating a spiritual
habit is still possible elsewhere in the app (not this screen) — don't accidentally block it at
the schema/validation level while restricting the suggestion list.

**Dependencies:** E3-1.

---

## ONB-3 — Onboarding Step 3 (Settings + First Task)

**Goal:** Condensed settings capture, a pre-filled first task tied to the goal from ONB-1, and
completion.

**Tasks — Backend:**

- Reuses E4-1's `updateSettings` action.
- `completeOnboarding` — sets `User.onboardingCompleted = true` (see the field-name correction in
  §0 — not `onboarding_completed`). Log an `AnalyticsEvent` (`eventType: 'onboarding_complete'`).
- Reuses E2-1's `createTask`, pre-filled with the `goalId` from the goal created in ONB-1.

**Tasks — Frontend:**

- `SettingsStep` — condensed version of E4-1's `SettingsPage` (just work hours + off days, not
  the full settings surface).
- First-task quick-create, pre-filled from ONB-1's goal (title/goalId defaulted, user can still
  edit before submitting).
- Completion screen — `team-task-breakdown.md`'s copy is *"🎉 Welcome! Start with one."* then
  redirect to Home. A single celebratory emoji on a one-time, final onboarding screen is a
  judgment call against the no-gamification voice guardrail (which targets mascots/confetti/
  badges/streak-flame language specifically, not literally every emoji) — ship it, but flag it
  for a copy-review pass rather than treating it as automatically settled either way.

**AC:** Settings save correctly. A real `Task` is created with `goalId` set to ONB-1's goal.
`User.onboardingCompleted` flips to `true` and the user is redirected to `/` (Home) — verify a
completed user is never routed back to `/onboarding` on subsequent logins (this is the guard
`E0-6`'s route protection should already handle once `onboardingCompleted` is true — confirm it
does, don't assume).

**Dependencies:** E4-1, E2-1; sequenced after ONB-1/ONB-2 (needs the goal from ONB-1).

---

## Hand-off notes

Report against each story's AC explicitly, including confirmation that a completed user can't
loop back into onboarding. See `AGENT-OPERATING-INSTRUCTIONS.md` §9.
