# Work Order — Epic POL: System States & Polish

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §3.3 (API contract); `Docs/Epics.md` POL;
> `Docs/team-task-breakdown.md` POL-1/2/3/4 (full itemized detail, translate stale idioms per the
> table below).
>
> **Execution model: single agent, sequential**, within reason — POL-1/POL-2 can be done in
> either order relative to each other (both are pure additive UI), but **POL-3 and POL-4 must
> come last**, since both require every other screen/action in the app to already exist to wire
> into.
>
> **Gate: this is the last epic.** Every other epic (E0–E4, HOME, ONB) must be functionally
> complete before starting POL — its entire job is retrofitting shared states onto screens that
> already work.

---

## 0. Current State

Nothing in this epic has a schema or net-new backend model — per `team-task-breakdown.md`, POL-1
and POL-2 are pure frontend, POL-3 is mostly a backend **audit** (not new endpoints), and POL-4 is
mostly frontend wiring plus one backend enforcement check. Everything referenced below (goal/
task/habit delete, quit-habit relapse, every mutation call site) already exists by this point —
this epic touches existing files across every feature folder, it doesn't add new ones except the
shared components themselves.

## Idiom translation

| Stale wording | Build this instead |
|---|---|
| `ActionResult` error shape | `ApiResponse<T>` (`Architecture.md` §3.3) — same contract established since E0 |
| `features/*/actions.ts` | Every existing `server/controllers/*.js` file (audit target for POL-3) |
| `components/shared/*.tsx` | PascalCase (`EmptyState.tsx`, `LoadingSkeleton.tsx`, `ErrorToast.tsx`, `ErrorBoundary.tsx`) |
| `deletion_reason` | `deletionReason` (real field name on `Goal.js`, camelCase) |

---

## POL-1 — Empty States for Every Screen

**Goal:** A shared, positively-framed empty state, applied everywhere a list/collection can be
empty.

**Tasks:**

- `EmptyState` (props: illustration, headline, CTA) — positive tone per the voice guardrail, not
  "nothing here" flatness.
- Apply to: Goals Dashboard (no goals), Habits (no habits), Task List (no tasks today), Backlog
  (no ribbon shown at all when empty — confirm this means the ribbon container doesn't render,
  not that it renders with an empty-state message inside it), Home's no-goals branch (this is the
  same branch `HOME-1`'s `AdaptiveGreeting` already handles at the greeting level — confirm
  you're not duplicating messaging, `EmptyState` here is for the rest of the Home layout below
  the greeting, if anything below it also needs an empty treatment).
- Confirm the brand/illustration set referenced in `team-task-breakdown.md` §7 ("brand &
  foundation prep... feeds POL-1's empty states") actually exists by the time you reach this
  story. If it doesn't, use a simple text/icon placeholder rather than blocking on it, and flag
  the gap in your hand-off — illustration production is explicitly out of scope for any of these
  work orders.

**AC:** Every listed screen shows `EmptyState` (not a raw blank area) when its data is empty, in
both languages, with positive copy.

**Dependencies:** Every screen it decorates (E1, E2, E3, HOME) must exist first.

---

## POL-2 — Loading Skeletons for Every Data Area

**Goal:** A shared shimmer skeleton, applied to every screen with a data fetch.

**Tasks:**

- `LoadingSkeleton` — shimmer animation, 1500ms infinite linear.
- Apply to: Home, Goals Dashboard, Goal Detail, Task List, Habits.
- Respect `prefers-reduced-motion` — disable the shimmer animation (show a static placeholder
  instead) when that media query is active; this guardrail is already global per
  `project-context.md`, this story is just one more place it applies.
- If `HOME-2` already shipped a local loading-skeleton stub (per that work order's note about
  building against a stub before this epic existed), replace it with this shared component here.

**AC:** Every listed screen shows the shared skeleton during its data fetch, shimmer disabled
under `prefers-reduced-motion`, verified in both light and dark themes.

**Dependencies:** Every screen it decorates.

---

## POL-3 — Error Toasts with Retry

**Goal:** Every backend failure surfaces a bilingual, retryable toast; the app never fails
silently.

**Tasks — Backend:**

- **Audit** every controller written across E0–HOME (`authController`, `goalController`,
  `taskController`, `habitController`, `settingsController`, `dailySummaryController`,
  `onboardingController`, and any others) and confirm each one's error paths emit the full
  `ApiResponse<T>` failure shape (`{success: false, error, errorCode, field?}`) with a correct
  `errorCode` (`VALIDATION`/`AUTH`/`DB_ERROR`/`RATE_LIMIT`/`UNKNOWN`) — this is a real audit, not
  a formality; earlier epics may have been inconsistent about which `errorCode` they used. Fix
  any drift found.
- Add auto-retry (×3) on a transient DB failure before the controller gives up and returns the
  error response — this lives at the point where a controller calls a Mongoose operation that
  might transiently fail (connection blip), not as a blanket wrapper around every single query;
  use judgment about where it actually matters (writes that matter, not every read).

**Tasks — Frontend:**

- `ErrorToast` (sonner-based) with a retry action — copy anchor: *"فشل الحفظ. [حاول مرة أخرى]"*
  ("Save failed. [Try again]") — ship the matching English version in the same commit.
- `ErrorBoundary` — catches render-time crashes, shows a recoverable fallback, not a blank white
  screen.
- Persistent offline banner — copy anchor: *"لا يوجد اتصال"* ("No connection") — shown when the
  browser goes offline (`navigator.onLine`/`online`/`offline` events), dismisses when connectivity
  returns.
- Wire `ErrorToast` into every mutation call site across every feature — this is the widest-reach
  task in the whole POL epic, touch every `useMutation` hook built since E1.

**AC:** Every controller's error responses conform to the audited contract (spot-check at least
one failure path per feature area). A simulated network failure on any mutation shows the
bilingual retry toast, not a silent failure or an unhandled promise rejection. A render crash hits
the error boundary, not a white screen. Going offline shows the banner; coming back online
dismisses it.

**Dependencies:** Every action from every other epic must exist first — this is explicitly a
last-epic audit-and-wire story.

---

## POL-4 — Confirmation Dialogs

**Goal:** Every destructive action requires an explicit confirmation; no Undo/Redo pattern exists
anywhere.

**Tasks — Backend:**

- Confirm destructive actions that require a payload actually enforce it server-side, not just in
  the UI — specifically, `Goal.softDeleteGoalSchema` already requires a `reason` field
  (`hadaf/server/models/Goal.js`, verified) and the controller must actually validate against it,
  not accept a delete request without one.

**Tasks — Frontend:**

- A shared shadcn `AlertDialog` wrapper (the `alert-dialog` primitive was already added to the
  project in `E0-1.4` — reuse it, don't reinstall or reimplement).
- Wire into: goal delete (reason required — the dialog must actually collect and submit
  `deletionReason`, not just confirm intent), task delete, habit delete/archive, quit-habit
  relapse (`E3-2`'s `RelapseConfirmationDialog` — confirm it's using this same shared wrapper
  rather than a bespoke one, consolidate if it drifted).
- Sweep the app for any Undo/Redo affordance and confirm none exists (`AGENT-OPERATING-
  INSTRUCTIONS.md`/`project-context.md`'s NFR14 guardrail) — this is a negative-verification task,
  not something to build.

**AC:** Every destructive action listed above requires and blocks on explicit confirmation. Goal
deletion cannot succeed without a `deletionReason`. No Undo/Redo control exists anywhere in the
app (confirmed by a deliberate sweep, not assumed).

**Dependencies:** Every delete/relapse action from every other epic must exist first.

---

## Hand-off notes

Report against each story's AC explicitly. POL-3's controller audit and POL-4's Undo/Redo sweep
should each list exactly what was checked, not just "confirmed clean." See
`AGENT-OPERATING-INSTRUCTIONS.md` §9.
