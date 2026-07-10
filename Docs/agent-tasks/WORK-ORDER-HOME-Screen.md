# Work Order — Epic HOME: Home Screen

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs**: `Docs/Architecture.md` §1.3 (cold-start/loading expectations), §3.1
> (schema); `Docs/Epics.md` HOME; `Docs/team-task-breakdown.md` HOME-1/HOME-2 (full itemized
> detail, translate stale idioms per the table below).
>
> **Execution model: single agent, sequential.** Work HOME-1 → HOME-2 in order.
>
> **Gate: this epic is an integration point, not a from-scratch build.** It depends on E1-1
> (goals-exist check), E2-1 and E2-3 (today's task list), E3-1 (today's habits), E4-2 (capacity
> gauge), and E4-3 (`DailySummary`) all being done first — HOME-2 in particular is described in
> `team-task-breakdown.md` as "the last story that can land in this phase" for exactly this
> reason. Confirm E0/E1/E2/E3/E4 are complete before starting.

---

## 0. Current State

**Already exists (by the time this epic's gate is satisfied):** every piece of data HOME needs
— today's tasks (E2), today's habits (E3), the capacity gauge (E4-2), and today's `DailySummary`
(E4-3) — already has a working endpoint and, per `team-task-breakdown.md`, HOME adds **no new
database or backend actions of its own for HOME-2** (pure composition) and only one small
backend piece for HOME-1 (the greeting decision logic).

**Net-new:**
- `server/controllers/homeController.js` (or extend an existing analytics/dashboard controller if
  one already exists by the time you reach this epic — check first) for HOME-1's greeting
  decision endpoint.
- `hadaf/client/src/features/home/` — fully new (Impulse's existing `features/dashboard/` is a
  reasonable structural reference to adapt from, but its content doesn't apply to Hadaf's home
  screen).

## Idiom translation

| Stale wording | Build this instead |
|---|---|
| `features/home/actions.ts` (decision logic) | `server/controllers/homeController.js` + route |
| `components/home/*.tsx` | Same names, PascalCase file convention (`AdaptiveGreeting.tsx`, `DailyOverview.tsx`) per `Architecture.md` §4.1 |
| `daily-summary-toast.tsx` from E4-3 | `DailySummaryToast.tsx` (reuse the actual component E4-3 built, don't rebuild it) |

---

## HOME-1 — Adaptive Morning Greeting

**Goal:** Show one of 4 greeting branches depending on the user's state, plus a one-time
yesterday's-summary toast.

**Tasks — Backend:**

- Greeting-decision endpoint: given the authenticated user, resolve which of 4 branches applies —
  **has planned tasks today** / **no tasks today but has active goals** (surface a suggestion) /
  **new user** (no goals, no tasks, account just created) / **no goals at all** (empty state,
  copy anchor: "ابدأ بهدف واحد" / "Start with one goal"). Query `Goal`/`Task` counts scoped to
  `req.user.id` to decide.
- On first render after the user's configured day-start time, mark yesterday's `DailySummary.
  summaryShown = true` (reuse E4-3's `dailySummaryController` upsert logic — don't duplicate it).
  If yesterday's `DailySummary` doesn't exist yet (user completed things but the roll-up never
  ran, or it's genuinely their first day), compute it on the fly using E4-3's day-state utilities
  before showing the toast.

**Tasks — Frontend:**

- `AdaptiveGreeting` — the 4 branches above. This is the single most voice-sensitive component in
  the app (per `team-task-breakdown.md`'s explicit call-out) — every branch's copy must follow
  the accomplishment-first, non-punitive voice guardrail, in both `ar` and `en`, shipped together.
- Reuse `DailySummaryToast` from E4-3 as-is; dismiss after 3s or on tap (matches E4-3's existing
  spec, don't redefine).

**AC:** All 4 greeting branches render correctly for their respective user states (test with real
accounts in each state, not just code review). Yesterday's summary toast shows once, then
`summaryShown` prevents it from repeating on subsequent loads the same day.

**Dependencies:** E1-1 (goals-exist check), E2-1 (tasks-exist check), E4-3 (`DailySummary`).

---

## HOME-2 — Home Screen Layout Assembly

**Goal:** Assemble every previously-built piece into the actual `/` route.

**Tasks — Backend:** None new — this story is pure client-side composition against endpoints
that already exist by this point (`team-task-breakdown.md` is explicit about this).

**Tasks — Frontend:**

- `HomePage` (route `/`): on mount, fetch in parallel (not waterfalled) — today's tasks, today's
  habits, backlog count, today's `DailySummary`. Use React Query's parallel-queries pattern, not
  sequential `await`s.
- `DailyOverview` — composes, **in this exact order**: Greeting → Today's Tasks → Habits →
  Backlog Ribbon → Progress Bar. The order is specified, not incidental — don't rearrange it for
  visual preference without flagging why.
- Full-page loading skeleton while the parallel fetch is in flight — the backend has a documented
  2-5s cold start (`Architecture.md` §1.3, relevant if deployed to a free-tier host that sleeps),
  so this isn't a cosmetic nicety, it's covering a real wait. Reuse `POL-2`'s shared
  `LoadingSkeleton` if that epic has already landed by the time you build this; otherwise build a
  local skeleton now and swap it for the shared one once POL-2 exists (same
  build-against-a-stub-then-upgrade pattern used elsewhere in these work orders).
- Mobile (`BottomNav`, <768px) and desktop (`Sidebar`, >1024px) responsive layout — both already
  exist from E0-6, this story just needs `HomePage`'s content to render correctly inside either
  shell.

**AC:** `/` loads all 4 data sources in parallel (verify via network tab, not just "it works").
Section order matches the spec exactly. Loading skeleton shows during the fetch window. Layout is
correct at both mobile and desktop breakpoints, in both RTL and LTR.

**Dependencies:** HOME-1, E2-3 (backlog), E3-1 (habits), E4-2 (capacity gauge — feeds the
Progress Bar section, from E4-3, being present here too).

---

## Hand-off notes

Report against each story's AC explicitly, including which loading-skeleton state you shipped
(local stub vs. `POL-2`'s shared component) if POL hasn't landed yet. See
`AGENT-OPERATING-INSTRUCTIONS.md` §9.
