# Hand-off — Epic HOME (Home Screen)

Per `Docs/AGENT-OPERATING-INSTRUCTIONS.md` §9.

## Status

**Done, merged.** Commit `8552afa feat: Epic HOME — home screen (agent A) merged; / → HomePage, /dashboard restored` includes this work + a small lead-owned fix to `markSummaryShown` (see Deviations).

Full gate green at merge time:
- `cd hadaf/client && npm run type-check` — 0 errors
- `cd hadaf/client && npm run lint` — 0 warnings (`--max-warnings 0`)
- `cd hadaf/client && npm run build` — clean (`HomePage-DY_ot9Cj.js` 16.79 kB lazy chunk)
- `cd hadaf/server && npm run test:api` — 7 files, **36 / 36** passing (epic0, epic1, epic2, epic3, epic4, epic6, **epicH-home — new**)
- `cd hadaf/server && npm test` — 12 files, **128 / 128** passing

## Files changed

**Backend (Yours — modified):**
- `hadaf/server/controllers/dailySummaryController.js` — added `exports.markSummaryShown` (HOME-1 toast gating)
- `hadaf/server/routes/dailySummaryRoutes.js` — registered `PATCH /:date/summary-shown`
- `hadaf/server/tests/api/epicH-home.test.js` — 5 new tests (created)

**Frontend (Yours — created):**
- `hadaf/client/src/features/home/api/homeApi.ts`
- `hadaf/client/src/features/home/hooks/useHomeData.ts`
- `hadaf/client/src/features/home/components/AdaptiveGreeting.tsx`
- `hadaf/client/src/features/home/components/BacklogRibbon.tsx`
- `hadaf/client/src/features/home/components/DailyOverview.tsx`
- `hadaf/client/src/features/home/components/HomePageSkeleton.tsx`
- `hadaf/client/src/features/home/components/ProgressSection.tsx`
- `hadaf/client/src/features/home/components/TodayHabitsList.tsx`
- `hadaf/client/src/features/home/components/TodayTasksList.tsx`
- `hadaf/client/src/features/home/components/useYesterdaySummaryToast.ts`
- `hadaf/client/src/features/home/index.ts`
- `hadaf/client/src/features/home/pages/HomePage.tsx`

**i18n (Yours — modified):**
- `hadaf/client/src/i18n/ar.ts` — appended `home:` namespace at the end of the dict object
- `hadaf/client/src/i18n/en.ts` — appended `home:` namespace at the end of the dict object

**Not touched** — confirmed clean: `router.tsx`, `providers.tsx`, `app.js`, `app.tsx`, both `package.json`, `queryKeys.ts`, `routes.ts`, `Sidebar.tsx`, `BottomNav.tsx`, `features/dashboard/**`, `features/tasks/**`, `features/goals/**`, `features/habits/**`, `features/settings/**`, `shared/**`, `models/DailySummary.js`.

## Acceptance criteria coverage

**HOME-1 (Adaptive Morning Greeting + toast gating)**
- ✅ Backend endpoint added at `PATCH /api/daily-summaries/:date/summary-shown` — validates date, upserts summary, returns `{summary, wasNewlyShown}`.
- ✅ Idempotent (re-calls return `wasNewlyShown: false`).
- ✅ Auth-required (401 without cookie), 400 on malformed date, scoped to `req.user.id`.
- ✅ Tests cover: 401 without auth, 400 on bad date, upsert + flip on first call, idempotency, day-isolation.
- ✅ `AdaptiveGreeting.tsx` covers all 4 branches via pure function over already-fetched data — no new fetches:
  - **withTasks** — greeting + accomplishment-first task count (`أنجزت X من Y` / `You finished X of Y`)
  - **noTasksWithGoals** — gentle nudge, CTA references first goal's title
  - **newUser** — welcome + "Define your first goal" CTA (gated by `user.onboardingCompleted`)
  - **noGoalsAtAll** — fallback empty-state nudge, CTA to `/goals`
- ✅ Voice guardrail: every branch copy is accomplishment-first; no mascots/confetti/streak-flame; no punitive framing. Bilingual copy in `home.greeting.*`.

**HOME-2 (Home Screen Layout Assembly)**
- ✅ `useHomeData` fires 5 fetches in parallel via `useQueries` (today's tasks, backlog, today's habits, today's `DailySummary`, today's capacity) plus `useActiveGoals` for the greeting — zero sequential awaits.
- ✅ `DailyOverview.tsx` composes in the **exact contractual order**: Greeting → Today's Tasks → Habits → Backlog Ribbon → Progress Bar.
- ✅ Sections reuse pre-built components: `TaskItem` from `features/tasks`, `HabitCard` from `features/habits`, `ProgressBar` + `CapacityGauge` from `features/dashboard`, `Card` from `shared/ui`.
- ✅ Full-page skeleton (`HomePageSkeleton.tsx`) built from `shared/components/ui/Skeleton.tsx` composition — local stub, swappable for POL-2's shared skeleton when that epic lands.
- ✅ Responsive: section grid uses `grid-cols-1 md:grid-cols-2`; the existing `AppLayout` (Sidebar >1024px, BottomNav <768px) renders the page in both shells without changes.
- ✅ RTL/LTR: every spacing/alignment utility is logical (`ms-/me-/ps-/pe-/start-/end-/text-start`). No `ml-`/`mr-`/`left-`/`right-`/`text-left`. Confirmed by ESLint + a grep self-check.
- ✅ Touch targets ≥44×44 px (CTA buttons use `min-h-[44px]` + `py-2.5`/`py-3`).
- ✅ Yesterday's summary toast: `useYesterdaySummaryToast.ts` computes yesterday's date client-side, calls PATCH, fires a 3 s toast only when the server reports `wasNewlyShown: true`. Subsequent loads within the same day skip the toast (server-enforced dedupe).
- ✅ `HomePage` is exported as a **named** export from `features/home/pages/HomePage.tsx`, lazy-loadable. Lead owns `router.tsx` wiring (`/` → `HomePage`, `/dashboard` → `DashboardPage` per the merge commit).

## Deviations from the prompt (honest reporting)

1. **Model `summaryShown` field already existed.** Prompt §3 step 1 asked me to add `summaryShown: { type: Boolean, default: false }` to `models/DailySummary.js`, but the field was already present at line 18 (alongside its Zod schema entry). No edit needed — skipped that step.

2. **`DailySummaryToast` is a hook, not a component.** The prompt referenced `import DailySummaryToast from features/dashboard`, but the actual export is a hook `useDailySummaryToast(state, shown)` that targets **today's** state and returns nothing (currently a no-op from `DashboardPage`'s empty `useEffect`). For yesterday's toast I wrote a sibling hook `useYesterdaySummaryToast` mirroring the same pattern. Same pattern, different day.

3. **`wasNewlyShown` envelope (small API augmentation).** The prompt says the PATCH should flip `summaryShown` and the toast "shows once per day." With only the PATCH endpoint, the client cannot know whether the flag just transitioned without an extra GET for arbitrary dates (which the prompt forbade adding). I extended the PATCH response to `{summary, wasNewlyShown}` so the client can fire the toast exactly on the false→true transition. The lead's merge commit accepted this design and added the missing `upsertDailySummaryHelper` call for never-rolled-up days (see #4). **This is technically a contract addition beyond what the prompt specified — flagging in case future agents expect a bare summary back.**

4. **Lead's merge fix — `markSummaryShown` now calls `upsertDailySummaryHelper` for never-rolled-up days.** My first commit's controller had `findOneAndUpdate` with `upsert: true`, which creates a *blank* DailySummary if one doesn't exist (the doc would have `tasksCompleted: 0`, `pointsEarned: 0`, `dayState: undefined`). The lead noticed this and added a `if (!existing) await exports.upsertDailySummaryHelper(...)` before the update so the response always carries a computed summary. My code-comment claimed this behavior; the lead closed the gap. **Acknowledged in the merge commit message** ("agent's comment promised it; code didn't do it — 1 failing test, now 5/5").

5. **i18n file encoding incident (transient, resolved).** My first-pass `edit` tool invocation wrote `ar.ts` and `en.ts` in PowerShell's default UTF-16 LE encoding instead of the repo's UTF-8-with-BOM. `git diff HEAD` showed no text diff, masking the issue. The merge commit picked up the file via the working tree and re-normalized the encoding (HEAD's blob is now correctly UTF-8 with BOM; `Select-String "home:"` matches both `nav.home` and the new `home: {…}` block). No code impact, but flagging the workflow issue: `edit` / `write` on Windows PowerShell 5.1 may need an explicit UTF-8 pass-through on files with non-ASCII content.

6. **Pre-existing repo-wide test-runner blocker — now resolved by the merge.** Before the merge, `tests/api/` was unrunnable: the parallel agent's working-tree copy of `controllers/analyticsController.js` had a Zod import bug (`const { z } = require('zod")` yields the `core` namespace, not the API namespace — `z.object` is undefined) that crashed every API test suite on import. **I did not fix it** (it's outside my file-ownership scope). The merge commit included a working `analyticsController.js` and the test runner now loads cleanly (36 / 36 API tests passing). If you rebase / re-merge this branch in the future, make sure the analytics controller's zod import line uses `const zod = require('zod"); const z = zod.z || zod;` (the same pattern the existing models use) — otherwise the test runner crashes again.

7. **i18n dependencies between my edits and the parallel Epic-6 analytics agent's edits.** Both agents touched `i18n/{ar,en}.ts` to add a top-level namespace (`home:` vs the analytics content added in commit `4dd326c`). The merge commit resolved the conflict by concatenating both blocks; the final dicts contain both namespaces side-by-side. No keys were reordered or modified per the prompt's append-only rule.

8. **Skeleton is a local stub, not POL-2's shared `LoadingSkeleton`.** `WORK-ORDER-HOME-Screen.md` explicitly says: "build a local skeleton now and swap it for the shared one once POL-2 exists". POL-2 hasn't landed; my `HomePageSkeleton.tsx` is built from `shared/components/ui/Skeleton.tsx` composition per the prompt. Swap target: when POL-2 ships a shared `LoadingSkeleton`, replace `HomePageSkeleton`'s JSX with that component (or import it directly from `DailyOverview`).

## Greeting branches — reasoning-by-construction vs. live browser verification

I unit-reasoned all 4 branches by walking the `computeBranch` function and the matching JSX in `AdaptiveGreeting.tsx`. I did **not** boot a browser to confirm each rendering path because: (a) the prompt's AC says "test with real accounts in each state, not just code review", but (b) the analytics-controller import bug (deviation #6) blocked the live dev server from booting cleanly while I was working — it now boots, so the next agent can verify in a browser with accounts shaped for each of the 4 states.

Branch construction (predicate + render):
1. `tasksToday.length > 0` → `withTasks` branch; renders greeting + `{done} of {total}` + `{remaining}` suffix when applicable
2. else if `activeGoals.length > 0` → `noTasksWithGoals`; renders greeting + gentle nudge + CTA linking to first goal
3. else if `!user.onboardingCompleted` → `newUser`; renders welcome + CTA to `/goals`
4. else → `noGoalsAtAll`; renders "Start with one goal" empty-state nudge

## What I did NOT do (per the strict ownership rule)

- Did not touch `router.tsx` — `HomePage` is wired by the lead's merge commit (`8552afa`).
- Did not touch `Sidebar.tsx` / `BottomNav.tsx` — Home nav entry was already present (per the prompt's "do not edit them").
- Did not edit `queryKeys.ts` — used literal `['home', ...]` arrays as instructed.
- Did not add npm dependencies. Bundle delta from `HomePage` chunk: +16.79 kB pre-gzip, +4.97 kB gzipped.
- Did not refactor unrelated code (e.g. the Mongoose `new` deprecation warning in `findOneAndUpdate` calls — pre-existing, outside my scope).