# PROMPT B — Build Onboarding (Epic ONB) — for a coding agent (Gemini/MiniMax/any)

> **You are a senior full-stack engineer working on "Hadaf" (هدف)**, an Arabic-first RTL
> productivity app. Client: Vite + React 19 + TypeScript + Tailwind v4 + TanStack React Query v5
> + Zustand. Server: Express + MongoDB/Mongoose, response envelope `{success, data}` /
> `{success:false, errorCode, error}`.
>
> **Before writing any code, read these repo files in order:**
> 1. `Docs/AGENT-OPERATING-INSTRUCTIONS.md` — guardrails, API contract, workflow, honesty rules. Binding.
> 2. `Docs/project-context.md` — non-negotiable product rules (RTL, OKLCH, i18n, voice).
> 3. `Docs/agent-tasks/WORK-ORDER-ONB-Onboarding.md` — the original task spec (ONB-1 → ONB-2 →
>    ONB-3). Still the source of truth for ACs; **this prompt corrects its current-state notes
>    and pins down file placement** (§1, §2).
>
> Work from repo root `NHA-4-225/`. Client: `hadaf/client/`. Server: `hadaf/server/`.

---

## 1. Corrected current state (2026-07-12 — trust this over the work order)

All four dependencies are **built and live**:
- Goal creation: `features/goals/components/GoalWizard.tsx` (3-step SMART wizard, embeddable) +
  `GoalReadinessDialog.tsx`, hooks in `features/goals/hooks/useGoals.ts`, hitting `POST /api/goals`.
- Habit creation: `features/habits` (`habitApi.ts` `POST /api/habits`, `useHabits.ts`); `Habit`
  model has `mvdValue`, `mvdDescription`, `isSpiritual`.
- Settings: `features/settings` (`useSettings`/`useUpdateSettings` → `PATCH /api/user/settings`);
  the full `SettingsPage.tsx` exists — your `SettingsStep` is a condensed reuse of its form
  pieces (work hours + off days ONLY).
- Task creation: `features/tasks` (`taskApi.ts` `POST /api/tasks`, `TaskFormModal` and hooks).
- `User.onboardingCompleted` exists (camelCase) AND is **already returned in the auth `user`
  payload** on register/login/refresh (verified in `authController.js` — you do NOT need to touch
  the auth controller or auth store).
- Routing: `/onboarding` route does NOT exist yet, and `RequireAuth` in `router.tsx` does NOT
  check onboarding. **You do not wire routing** — see §2.

## 2. File ownership — STRICT

Another agent and a lead work in the same tree in parallel. You may create/modify **ONLY**:

**Yours (create):**
- `hadaf/client/src/features/onboarding/**` — everything under it:
  - `pages/OnboardingPage.tsx` (named export)
  - `components/OnboardingWizard.tsx` (stepper shell, Step 1/3 → 3/3 progress indicator)
  - `components/GoalReadinessStep.tsx`, `components/HabitsStep.tsx`,
    `components/SettingsStep.tsx`, `components/CompletionStep.tsx`
  - `components/RequireOnboarding.tsx` — a wrapper `({children})` that reads
    `useAuthStore`'s user: if authenticated AND `user.onboardingCompleted === false` AND current
    path ≠ `/onboarding`, `<Navigate to="/onboarding" replace />`; if `onboardingCompleted ===
    true` and path IS `/onboarding`, `<Navigate to="/" replace />`; else render children. The
    lead mounts it inside the router at merge time.
  - `api/onboardingApi.ts` (`completeOnboarding()` → `POST /api/user/onboarding/complete`)
- `hadaf/client/src/shared/constants/suggestedHabits.ts` — new file, see §4.
- `hadaf/server/controllers/onboardingController.js` — see §3.
- `hadaf/server/tests/api/epicONB-onboarding.test.js` — new test file only.

**Yours (modify):**
- `hadaf/server/routes/userRoutes.js` — register ONE route (§3). Do not restructure the file.
- `hadaf/client/src/i18n/ar.ts` + `en.ts` — **append-only**: exactly ONE new top-level namespace
  `onboarding:` at the END of the dictionary object, in BOTH files together. Never touch existing keys.

**Forbidden (read-only):** `router.tsx`, `providers.tsx`, `app.js`, `package.json` (both — **no
new dependencies**), `queryKeys.ts`, `routes.ts`, `Sidebar.tsx`, `BottomNav.tsx`, `authController.js`,
`User.js`, `features/{auth,dashboard,tasks,goals,habits,settings,overview,home}/**`, all other
`shared/**`. Import from them freely. React Query keys: literal `['onboarding', ...]` arrays.

## 3. Backend task — one endpoint

`hadaf/server/controllers/onboardingController.js`:
- `exports.completeOnboarding` (catchAsync-wrapped, same pattern as neighbors): set
  `req.user`'s `onboardingCompleted = true` (fetch + save or `findByIdAndUpdate`), create an
  `AnalyticsEvent` `{ userId, eventType: 'onboarding_complete' }` (copy the exact pattern used in
  `authController.js` for `login`/`register` events), return `{success:true, data:{ user: {…} }}`
  with the same user shape authController returns (so the client can refresh its store).
- Register in `routes/userRoutes.js`: `POST /onboarding/complete` behind the existing `protect`
  middleware (final path: `POST /api/user/onboarding/complete`). **No new mount in app.js.**
- Test: authenticated call flips the flag and is idempotent; 401 unauthenticated; AnalyticsEvent
  row written.

## 4. Frontend tasks (ONB-1 → ONB-2 → ONB-3)

**Suggested habits constant** (`shared/constants/suggestedHabits.ts`): ~8-10 entries, each
`{ i18nKey, category, type, defaultTarget?, suggestedMvd? }`. Categories from the real Goal/Habit
enum: `health`, `education_work`, `family` ONLY — **no `religion_spirituality` entries**
(PRD FR36.1). This restricts the suggestion list only; do not add any validation blocking
spiritual habits elsewhere.

**ONB-1 — Step 1 (Goal, non-skippable):**
- `GoalReadinessStep` wraps the existing `GoalReadinessDialog` + `GoalWizard` from
  `features/goals`. NO "skip" affordance anywhere on this step. Advancing requires the wizard's
  success (a real `Goal` document via the real endpoint). Keep the created goal's `_id` in wizard
  state — ONB-3 needs it.

**ONB-2 — Step 2 (Habits + MVD):**
- `HabitsStep`: chip picker from the constant. Per selected chip, an inline "What's the minimum?
  (MVD)" prompt writing `mvdValue` (+ `mvdDescription` optional). Creates real Habits via
  `features/habits` hooks. This step MAY be skippable (creating zero habits is allowed).

**ONB-3 — Step 3 (Settings + first task) + completion:**
- `SettingsStep`: condensed — work hours start/end + off-days only, via `useUpdateSettings`.
- First-task quick-create: pre-filled `title` (from the ONB-1 goal's title, editable) and
  `goalId` (fixed to ONB-1's goal), via the real `POST /api/tasks`.
- On finish: call `completeOnboarding`, update the auth store's user (`onboardingCompleted:
  true`) from the response, show `CompletionStep` — copy: "🎉 أهلاً بك! ابدأ بواحدة." /
  "🎉 Welcome! Start with one." (single emoji is approved; nothing more celebratory), then
  navigate to `/`.
- `OnboardingPage` is a standalone full-page layout (like `LoginPage`, NOT inside `AppLayout`) —
  RTL-first, dark-mode aware, mobile-responsive stepper.

## 5. Non-negotiable project rules (grep-checked at merge)

- Tailwind **logical properties only** (`ms-/me-/ps-/pe-/start-/end-`); any `ml-/mr-/pl-/pr-/
  left-/right-/text-left/text-right` = rejected.
- **No raw hex** — token classes/CSS vars only. **No framer-motion**; CSS transitions only.
  **No new npm dependencies.**
- Every string via `t('onboarding.…')` present in BOTH `ar.ts` and `en.ts`. Touch targets ≥44px.

## 6. Definition of done + hand-off

- `cd hadaf/client && npm run type-check && npm run lint && npm run build` — zero errors/warnings.
- `cd hadaf/server && npx vitest run` — ALL suites green.
- Hand-off report (per `AGENT-OPERATING-INSTRUCTIONS.md` §9): each AC of ONB-1/2/3 explicitly;
  confirm the created goal/habits/task are the real documents (IDs from real API responses);
  state that `RequireOnboarding` is exported but NOT mounted (lead mounts it); list every file
  you changed; note what you exercised in a browser vs only type-checked.
