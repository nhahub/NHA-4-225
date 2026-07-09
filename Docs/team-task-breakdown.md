# Hadaf (هدف) — Team Task Breakdown by Layer

> **Purpose:** For every user story needed to build Hadaf, a checkable Database / Backend / Frontend task list the team lead can hand out and track to completion — cross-checked against the full PRD, not just the epic summaries.
> **Source of truth:** `NHA-4-225/Docs/PRD.md` (read in full, 641 lines) + `Docs/Epics.md` (25 stories) + `Docs/Architecture.md` (schema, folders, conventions).
> **Built from:** current repo state as of 2026-07-02 — only `E0-1` scaffold exists, everything else is `backlog`.
> **Generated:** 2026-07-02 · **Format:** detailed checklist, organized by build-dependency phase (no calendar attached — see §2 for what changed after a full PRD cross-check)

---

## 0. Doc accuracy notes (read once)

- **`Docs/Scope.md` is stale.** It still describes an old 34-story/~115 SP horizontal split (an `INF` epic, isolated "Goals repository" stories, etc.). That structure was replaced after a 2026-06-29 implementation-readiness review flagged it as horizontal/technical slicing. This breakdown is built from the **current** `Docs/Epics.md` (25 stories, vertically sliced) and matches `sprint-status.yaml`.
- **`Docs/Epics.md`'s Epic Overview table sums to 25 stories / ~94 SP**, while `Docs/team-task-assignments.md`'s per-story sum is ~99 SP after gap-fill (see §2 below) — treat 99 as authoritative; the two are close enough that this is a rounding/gap-fill difference, not a scope disagreement.
- **Client stack changed mid-project**: this breakdown, `Epics.md`, and `Architecture.md` were originally written for a Next.js client; the team has since decided to import the client UI from the Impulse codebase (Vite + React Router + React Query + Zustand) — see `Docs/Impulse-Migration-Plan.md`. The **Database** and **Backend** lanes below were never Next.js-specific and are unaffected. The **Frontend** lane descriptions throughout this doc have been updated to match; if you spot a leftover Next.js/SWR reference in a Frontend checklist item (e.g. an `app/[locale]/.../page.tsx` path or "Server Component"), treat it as stale and follow `Docs/Impulse-Migration-Plan.md`'s client tree instead (routes live in `features/{name}/pages/`, wired through `app/router.tsx`).
- **Backend file-pattern references are also partly stale.** Many Backend checklist items below still say `features/{name}/actions.ts` (Next.js Server Actions) or `data/repositories/{name}.repo.ts` (Drizzle repository layer) — an architecture this project no longer uses. The current pattern, per `Architecture.md` §3.3/§4.2, is Express MVC: `server/src/routes/{name}Routes.js` → `server/src/controllers/{name}Controller.js` → Mongoose model calls directly (no separate repository layer) → pure logic in `server/src/utils/{name}.js`. Read every `actions.ts`/`*.repo.ts` mention in this doc as shorthand for "the controller function that does this," not a literal file to create.
- **`Docs/UX-Design-Specification.md` §8.7 says "Language (Arabic-only in MVP)."** This contradicts the bilingual-parity mandate stated everywhere else (PRD, Scope, Architecture, Epics). The UX spec is a known-stale baseline — this breakdown assumes **bilingual AR+EN parity**.
- **i18n technical setup has no explicit story.** Nothing in `Epics.md` mentions the `LocaleProvider`, cookie-based locale detection, or the `ar.ts`/`en.ts` dictionary catalog, though `Architecture.md` §3.4 mandates it as day-1 infrastructure. Placed inside **E0-2**.
- **`FR54` is referenced but never defined.** `PRD.md` §11's phase-allocation appendix lists `FR54` under Epic 6, but §5 (the actual FR definitions) jumps from FR53 straight to the "نظام أنواع الأيام" heading and FR55 — FR54 itself is never written anywhere in the PRD's body. This is a gap in the source PRD, not in this breakdown; flagging for your awareness since I can't guess what it was meant to say.
- Per-story SP is **relative effort weight**, not a schedule — there's no calendar target being fit here. Splits sum correctly to each epic's total (verified in §2).
- **FR references** come from `Epics.md` §5 and a full read of `PRD.md` §5/§11. Infrastructure/polish stories mostly aren't tied to a specific FR — marked `—` or tagged to the relevant NFR instead.

---

## 1. How to use this doc

**Lane definitions:**
- **🗄️ Database** — MongoDB collections & Mongoose schema additions in `hadaf/server/src/models/*.js`.
- **⚙️ Backend** — `routes/*.js` (Express endpoints), `controllers/*.js` (Express MVC handler logic), backend utils (pure logic + Vitest), custom middlewares (auth, error-handler), analytics logging.
- **🎨 Frontend** — Vite/React UI (`components/*`, `features/*/pages/`), UI base imported from the Impulse codebase (see `Docs/Impulse-Migration-Plan.md`), frontend hooks calling `import.meta.env.VITE_API_URL` via TanStack React Query, i18n strings (AR+EN), empty/loading/error states for that screen.

A lane marked `_None_` means genuinely no work in that layer for this story — not an oversight. Items tagged **[PRD gap-fill]** were found by reading the full PRD and were absent from `Epics.md`'s original AC — see §2 for the full accounting.

**Default build order inside a story:** Mongoose model schema ➔ Domain logic (parallel-safe, no DB dependency) ➔ Express Controller & Route ➔ Frontend React Query API hook ➔ UI component. Each story states its own **Sequencing** if it deviates.

**Default owner pairing** (per `Scope.md` §8.1): **Database + Backend** → one of the 2 agent-capable devs, dispatching the BMAD `backend`/`ba` subagent roles (spec-heavy, well-scoped, verifiable via Vitest). **Frontend** → an entry-level dev (manual implementation) once the Backend lane has defined the action/hook contract, or an agent-capable dev dispatching the `frontend` role. Each story states **Owners** only where it deviates from this default.

**Treat Backend + Frontend as one slice, not a handoff.** Two people work the *same* story in parallel once the contract (action signature + hook shape) is agreed — this is why the epics were restructured away from horizontal layers in the first place. Don't re-fragment a story into isolated backend-only/frontend-only tickets owned by unrelated people with no overlap.

**Cross-cutting states aren't deferred to the end.** Per the Definition of Done, every story's Frontend lane ships its own empty/loading/error state and bilingual (AR+EN) strings as it's built — listed as checkboxes within each story, not saved for last. The `POL` epic builds the *shared reusable primitives* (`EmptyState`, `LoadingSkeleton`, `ErrorToast`, `ConfirmDialog`) and does a final consistency sweep — it is not where these states first appear.

**Phases are build-order groupings, not a schedule.** There's no calendar attached to any of this — "Phase" means "what has to exist before what," nothing more. Pull work in dependency order; how many people work which phase concurrently is a resourcing call, not something this doc dictates.

**Summary table:**

| Story | Name | Phase | Est. SP | Owner | Depends on |
|---|---|---|---|---|---|
| E0-1 | Project Scaffold & Design System | 1 | 2 | **Ziad** | — |
| E0-2 | Typography & RTL Foundation | 1 | 3 | **Ziad** | E0-1 |
| E0-3 | Layered Architecture Setup | 1 | 2 | **Ziad** | E0-1 |
| E0-4 | Database Connection & Analytics Schema | 1 | 3 | **Ziad** | E0-3 |
| E0-5 | Email/Password Authentication | 1 | 5 | **Mustafa** | E0-4 |
| E0-6 | App Shell & Route Guards | 1 | 4 † | **Ziad** | E0-5 |
| E1-1 | SMART Goal Wizard & Foundation | 1 | 6 | **Mustafa** | E0-4, E0-5 |
| E1-2 | Goal Dashboard & Detail View | 2 | 8 † | **Hamza** | E1-1 (+ E2-2 for heat map data) |
| E2-1 | Task Engine & Auto-Type Creation | 2 | 6 | **Mustafa** | E1-1 |
| E2-2 | Task Completion Flows | 2 | 6 | **Mustafa** | E2-1 |
| E2-3 | Task List & Backlog | 2 | 5 † | **Mohamed** | E2-2 |
| E3-1 | Build Habits & MVD | 2 | 5 | **Ziad** | E0-4 |
| E3-2 | Quit Habits & Relapse Tracking | 2 | 3 | **Khaled** | E3-1 |
| E4-1 | Day Types & Settings | 3 | 4 † | **Hamza** | E0-5 |
| E4-2 | Daily Capacity Intelligence | 3 | 4 | **Khaled** | E4-1 |
| E4-3 | Scoring Engine & Progress Bar | 3 | 5 | **Ziad** | E2-2, E3-1, E4-1 |
| HOME-1 | Adaptive Morning Greeting | 3 | 4 | **Hamza** | E1-1, E2-1, E4-3 |
| HOME-2 | Home Screen Layout Assembly | 3 | 4 | **Khaled** | HOME-1, E2-3, E3-1, E4-2 |
| ONB-1 | Onboarding Step 1 (Goal) | 4 | 3 | **Hamza** | E1-1 |
| ONB-2 | Onboarding Step 2 (Habits+MVD) | 4 | 3 | **Khaled** | E3-1 |
| ONB-3 | Onboarding Step 3 (Settings+Task) | 4 | 3 | **Mohamed** | E4-1, E2-1 |
| POL-1 | Empty States | 4 | 3 | **Khaled** | all screens |
| POL-2 | Loading Skeletons | 4 | 2 | **Mohamed** | all screens |
| POL-3 | Error Toasts + Retry | 4 | 3 | **Mohamed** | all actions |
| POL-4 | Confirmation Dialogs | 4 | 3 | **Mohamed** | all delete/relapse actions |
| | **Total** | | **99** | |

*† = grew after the full-PRD cross-check in §2 (was 94 SP total before gap-fill).*

Phase names: **1** = Foundation & Identity · **2** = Core Product Loop · **3** = Intelligence & Home · **4** = Onboarding & Polish. Full detail in §3–§6.

---

## 2. Full PRD cross-check — what changed and why

The first pass of this doc was built from `Epics.md`'s AC bullets. Because this is a competition entry and nothing should be silently dropped, I then read `Docs/PRD.md` in full — every FR (1 through 90), every NFR, the KPIs, and the user journeys — and checked each one against the 25 stories. This section is the evidence that nothing was missed, not just a claim of it.

### 2.1 Gaps found and fixed

| Gap | PRD reference | Fixed in | SP impact |
|---|---|---|---|
| Weekly heat map — 3rd required Goal Dashboard visual (only the 12-week bar and progress rings had made it into `Epics.md`'s AC) | FR8 | E1-2 | +1 |
| Search & Filter for tasks and goals — an entire scoped feature with no owning story anywhere in `Epics.md` | §3 scope table, §7.4 "PT6" | E1-2 (+1), E2-3 (+1) | +2 |
| Language switcher UI — the `LocaleProvider` from E0-2 exists, but nothing gives the user an on-screen way to actually switch languages | §3 Infrastructure row | E0-6 | +1 |
| Notification preferences toggle | Epic 6 scope row (§3) | E4-1 | +1 |
| "Manual" badge + revert-to-computed option on the progress override slider | FR7 | E1-2 | folded into the +1 above |
| Contribution Pulse exact spec: text-only, CSS fade over 3s, positioned inline above the completed task card (not a generic "animation") | FR6.1 | E2-2 | refinement, no SP |
| "All tasks done" message needs a smart follow-up suggestion, not just praise | FR33 | E2-3 | refinement, no SP |
| Day-start time has a specific default (04:00) and valid range (01:00–06:00) that must be validated, not left open | FR55.2 | E4-1 | refinement, no SP |
| Capacity overload warning must be "gentle/light, not alarming"; the task-suggestion trigger is specifically <30% of capacity used | FR83.1 / FR83.2 | E4-2 | refinement, no SP |
| Suggested-habits library must exclude religious/spiritual categories (users can still add these manually) | FR36.1 | ONB-2 | refinement, no SP |
| Relapse-encouragement copy has an exact PRD reference line worth preserving as a tone anchor | Journey 4 (§4) | E3-2 | refinement, no SP |

**Net effect: 94 → 99 SP.** Every added item traces to an explicit PRD requirement that had no owning story — this is restoring documented scope, not adding new ideas. Whether all of it gets built is still your call as product owner; nothing here should be built silently or cut silently.

### 2.2 One conflict I found but did not resolve myself

An earlier draft of `Architecture.md` §5 listed a standalone analytics route, and `UX-Design-Specification.md` §8.1 lists a 5th desktop sidebar item, "Overview," alongside Home/Goals/Habits/Settings (the current `Architecture.md` §5 and `Docs/Impulse-Migration-Plan.md`'s Routing Map don't carry a dedicated analytics/overview route either — this conflict predates and is independent of the client-stack migration). But no FR requires a standalone analytics page — `FR60` is explicitly *the Home screen's own* daily overview widget (PRD §5, Epic 7: "النظام يعرض Overview يومي **في الشاشة الرئيسية**"), and no story in `Epics.md` builds a separate page. Two legitimate resolutions:

- **(a)** "Overview" is just an alias for Home — delete the dead route reference and the extra sidebar item.
- **(b)** It's real, deferred scope (e.g. a weekly-trends/goal-history deep-dive) that was never written up — in which case it needs actual acceptance criteria before anyone builds it.

I have not added a 26th story for this. Doing so without an FR or AC to build against would be inventing scope, which is the opposite of what this cross-check is for. Pick (a) or (b) and I'll update accordingly.

### 2.3 Confirmed correctly excluded (the "don't build this" list)

Checked against `PRD.md` §3 and §9's own exclusion tables — none of these appear in any of the 25 stories, and none should: Phoenix Bond / resilience system, Weekly Review wizard, Auto-save, Undo/Redo, full subtask system, Framer Motion, prayer-time integration, religious habits in the suggested habits library, Emergency Mode, Dawn Phase, Starter Mode, FCM push notifications, badges/challenges/advanced gamification, journaling, PWA/offline support, harvest-phase archiving, community features (Constellations/Pods), native mobile app.

If effort starts drifting toward any of these, that's scope creep, not diligence — the PRD itself defers all of them.

### 2.4 Success metrics this build must actually produce data for

These are what "winning" looks like per the PRD (§2), not just "shipped":

| KPI / success criterion | Target | Where the data comes from |
|---|---|---|
| 7-day retention | ≥40% | `analytics_events.login` timestamps (E0-5) |
| 30-day retention | ≥25% | same |
| Avg tasks completed/day | ≥3/user | `analytics_events.task_complete` (E2-2) |
| Task→goal linkage rate | ≥40% | `tasks.goal_id IS NOT NULL` ratio (E2-1) |
| Estimation accuracy improvement | ≥15% over 30 days | `tasks.planned_duration_minutes` vs `actual_duration_minutes` trend (E2-2) |
| Onboarding completion rate | ≥70% | `analytics_events.onboarding_complete` ÷ started (ONB-3) |
| NPS | ≥30 | in-app survey — **deliberately not built in MVP.** PRD §2.3 itself limits MVP measurement to the `analytics_events` table; a survey mechanism is implicitly post-MVP. Not a gap, the PRD scopes it out. |
| SC1: first goal+task within ≤5 min | — | `goal_created` → first `task_created` timestamp delta, same session |
| SC2: first-session bounce ≤30% | — | session length derived from `login` events |
| SC3: visible goal progress within 2 weeks | — | qualitative/demo check, not automatable from events |
| SC4: ≥50% of habit logs on off-days use MVD | — | `habit_logs.is_mvd` ratio where `day_type='off'` |

All 5 of the MVP-required analytics events from PRD §2.3 (`login`, `task_complete`, habit-log, `goal_created`, `onboarding_complete`) are already logged somewhere across the 25 stories — confirmed, nothing missing there. This table exists so the team knows *why* those specific `analytics.repo.ts` calls matter, not just that they're one more checkbox.

---

## 3. Phase 1: Foundation & Identity

### Epic E0 — Project Setup & Identity (19 SP · 6 stories)

#### E0-1 — Project Scaffold & Design System Foundation *(~2 SP)* · 👤 **Ziad**
Epic E0 · FR: — (infra)
> Copy the Impulse client codebase into `hadaf/client/`, rebrand it, resolve its 3 pre-existing merge conflicts, and establish CSS design tokens. **This story's approach changed from "scaffold from scratch" to "adapt from Impulse" — see `Docs/Impulse-Migration-Plan.md` for the full reuse map; the items below reflect the current plan, not the checked-off items from an earlier from-scratch draft.**

**🗄️ Database:** _None._
**⚙️ Backend:** _None._
**🎨 Frontend:**
- [ ] Copy Impulse's `frontend/` into `hadaf/client/`, `npm install`
- [ ] Resolve the 3 merge conflicts: `features/auth/api/authApi.ts`, `features/tasks/api/taskApi.ts`, `shared/lib/api-client.ts`
- [ ] Remove duplicate `shared/api/apiClient.ts` if present
- [ ] `npx shadcn@latest add alert-dialog sheet tabs dropdown-menu progress tooltip` (primitives Impulse doesn't already have)
- [ ] `hadaf/client/DESIGN.md` created, seeded from Impulse's Violet OKLCH tokens
- [ ] OKLCH color tokens (light + dark) applied to the client's global stylesheet
- [ ] CSS transition utility tokens confirmed (Framer Motion is not a dependency — Impulse doesn't ship it)
- [ ] Rebrand: app name, favicon, metadata Impulse → Hadaf
- [ ] `npm run dev` runs clean — no lint/type errors

**Sequencing:** First story, no dependencies. **Owners:** default pairing (Frontend-only story).

---

#### E0-2 — Typography & RTL Foundation *(~3 SP)* · 👤 **Ziad**
Epic E0 · FR: — (enables NFR10 Arabic RTL + PRD bilingual mandate)
> Tajawal + IBM Plex Sans Arabic, convert Impulse's physical CSS to logical (RTL), **bilingual i18n scaffold (gap-fill, see §0)**.

**🗄️ Database:** _None._
**⚙️ Backend:** _None._
**🎨 Frontend:**
- [ ] Self-host Tajawal + IBM Plex Sans Arabic in `public/fonts/`
- [ ] `@font-face` declarations + Tailwind `fontFamily` config
- [ ] `<html dir>` / `<html lang>` wired to active locale in `App.tsx`/`providers.tsx`
- [ ] Convert every Impulse component's physical CSS (`ml-`/`mr-`/`pl-`/`pr-`/`left-`/`right-`/`text-left`/`text-right`/`border-l`/`border-r`) to logical equivalents (`ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`/`text-end`/`border-s`/`border-e`) per the RTL Conversion Checklist in `Docs/Impulse-Migration-Plan.md`
- [ ] `providers/LocaleProvider.tsx` — cookie-based locale state, AR default
- [ ] `i18n/ar.ts` + `i18n/en.ts` dictionaries + `useTranslation` hook
- [ ] Verify `Intl.NumberFormat` / `Intl.DateTimeFormat` locale plumbing

**Sequencing:** Depends on E0-1. **Owners:** agent-capable dev — i18n + a full-codebase RTL conversion pass is spec-heavy and easy to get subtly wrong; this story is bigger than its name suggests since it carries the i18n gap-fill and the RTL conversion of every reused Impulse component.

---

#### E0-3 — Layered Architecture Setup *(~2 SP)* · 👤 **Ziad**
Epic E0 · FR: — (infra)
> All architectural layers exist on both client and server; `server/src/utils/` is framework-agnostic.

**🗄️ Database:** _None (see E0-4)._

**⚙️ Backend:**
- [ ] Create `server/src/{models,controllers,routes,middleware,utils}/` folders
- [ ] `server/vitest.config.ts` + `server/tests/` folder
- [ ] Document/enforce: zero Express/Mongoose/React imports inside `server/src/utils/`

**🎨 Frontend:**
- [ ] Confirm Impulse's existing `components/{ui,shared,layouts}/`, `features/`, `providers/`, `stores/`, `lib/` folders carry over as-is
- [ ] Create `providers/DayTypeProvider.tsx`, `i18n/` folders (Hadaf-specific, no Impulse equivalent)

**Sequencing:** Depends on E0-1. **Owners:** default pairing.

---

#### E0-4 — Database Connection & Analytics Schema *(~3 SP)* · 👤 **Ziad**
Epic E0 · FR: — (infra; underlies every KPI in §2.4)
> Connect MongoDB via Mongoose, create the `AnalyticsEvent` collection.

**🗄️ Database:**
- [ ] Provision MongoDB Atlas project (free/M0 tier)
- [ ] `MONGODB_URI` in `server/.env` + `server/.env.example`
- [ ] `server/src/models/AnalyticsEvent.js`: Mongoose schema (userId ref, eventType, eventData Map, createdAt)
- [ ] `idx_analytics_user_created` compound index (`{ userId: 1, createdAt: -1 }`)
- [ ] `server/src/config/db.js` — Mongoose connection setup

**⚙️ Backend:**
- [ ] Analytics logging helper: `AnalyticsEvent.create({ userId, eventType, eventData })`
- [ ] Connectivity smoke test

**🎨 Frontend:** _None._

**Sequencing:** Depends on E0-3 (needs `server/src/` folders). **Owners:** default pairing (Database+Backend only).

---

#### E0-5 — Email/Password Authentication *(~5 SP)* · 👤 **Mustafa**
Epic E0 · FR: — (NFR6 Security: HTTPS/JWT)
> Sign in/up with Email and Password, establish the user, JWT session.

**🗄️ Database:**
- [ ] `server/src/models/User.js`: Mongoose schema (email unique, passwordHash, name, avatarUrl, `settings` sub-document per Architecture §3.1 including `language` and `theme`, `refreshToken`, `refreshTokenExp`, `onboardingCompleted`, timestamps)

**⚙️ Backend:**
- [ ] `server/src/utils/jwt.js` — sign/verify via `jsonwebtoken`, HS256, 15min access token
- [ ] `server/src/middleware/auth.js` — verify JWT from Authorization header/cookie, attach `req.user`
- [ ] `server/src/utils/password.js` — hash and verify passwords via `bcryptjs`
- [ ] `server/src/routes/authRoutes.js` + `server/src/controllers/authController.js` — register/login/refresh/logout endpoints
- [ ] Refresh token: 7-day, stored hashed, rotated on use, httpOnly cookie (`sameSite: 'none'`, `secure: true`)
- [ ] Token-reuse detection → invalidate all user tokens
- [ ] Analytics event: `login` & `register`

**🎨 Frontend:**
- [ ] Adapt Impulse's `features/auth/pages/LoginPage.tsx` (sliding dual-panel) — bilingual labels, RTL layout
- [ ] Adapt Impulse's `features/auth/stores/useAuthStore.ts` (Zustand persist) — point to Express endpoints, add refresh rotation
- [ ] Redirect-after-login handling (`?redirect={path}`)

**Sequencing:** Depends on E0-4 (DB conn pattern established). **Owners:** default pairing; highest-SP E0 story — keep one owner across DB+Backend for continuity.

---

#### E0-6 — App Shell & Route Guards *(~4 SP †)* · 👤 **Ziad**
Epic E0 · FR: — (NFR6/7/8/10; language switcher is **[PRD gap-fill]**, §3 Infrastructure row)
> Responsive app shell, protected routes, and a real way to switch languages.

**🗄️ Database:** _None._
**⚙️ Backend:**
- [ ] Confirm `server/src/middleware/auth.js` (from E0-5) protects every `/api/*` route that requires a session
- [ ] Silent-refresh on expired access token endpoint; client redirects to `/login?redirect={path}` if refresh fails
- [ ] Rate limiting — in-memory `Map`, 100 req/min/user

**🎨 Frontend:**
- [ ] `app/router.tsx` — `RequireAuth` / `RedirectIfAuth` React Router guards
- [ ] Adapt Impulse's `components/layouts/Sidebar.tsx` — desktop >1024px, fixed right for RTL (Home/Goals/Habits/Settings — see §2.2 re: "Overview"), converted to logical CSS (E0-2)
- [ ] New `components/layouts/BottomNav.tsx` — mobile <768px, 4 items (🏠 الرئيسية | 🎯 الأهداف | ✅ العادات | ⋯ المزيد)
- [ ] Adapt Impulse's `ThemeProvider` — Dark/Light toggle, `data-theme` attribute
- [ ] **[PRD gap-fill]** Language switcher control, visible from any screen in the shell (toggle AR ↔ EN; writes to `users.settings.language` via E4-1's settings endpoint and updates `LocaleProvider`)
- [ ] Keyboard navigation / focus states (a11y pass)

**Sequencing:** Depends on E0-5 (needs JWT to protect routes) and E0-2 (locale provider must exist before the switcher can flip it). **Owners:** default pairing.

---

### Epic E1 — Goal Management, part 1 (Phase 1 slice)

#### E1-1 — SMART Goal Wizard & Foundation *(~6 SP)* · 👤 **Mustafa**
Epic E1 · FR1, FR1.1, FR2, FR3, FR4, FR11 *(+FR5/6/6.2/6.3/7/9/10 shared with E1-2)*
> 3-step SMART wizard, 5-goal limit, hybrid-progress domain logic.

**🗄️ Database:**
- [ ] `goal_category` enum (education_work, family, health, religion_spirituality, other)
- [ ] `goal_status` enum (active, completed, archived, replaced)
- [ ] `goals` table (title, description, category, custom_category, measure, relevance, cycle_start, cycle_end, manual_progress, status, deletion_reason, timestamps)
- [ ] `idx_goals_user_status` index
- [ ] `milestones` table (goal_id FK cascade, title, sort_order, is_completed, completed_at)

**⚙️ Backend:**
- [x] `domain/goal-progress.ts`: `calculateHybridProgress` (tasks 60% + milestones 40%)
- [x] `domain/goal-progress.ts`: `calculateGoalHealth` (≥85%🟢 / ≥70%🟡 / ≥50%🟠 / <50%🔴)
- [x] `domain/goal-progress.ts`: `getCurrentWeek`, `calculateWeeklyExecutionScore` (Scoring Engine domain functions implemented)
- [x] `tests/domain/goal-progress.test.ts` — hybrid formula, tasks-only, milestones-only, 4 health states, week boundaries (P0)
- [x] `data/repositories/goals.repo.ts`: `createGoal`, `getActiveGoals`, `getById` (Implemented in queries & actions)
- [x] `features/goals/schemas.ts`: `createGoalSchema` (Implemented as goalWizardSchema in schemas.ts)
- [x] `features/goals/actions.ts`: `createGoal()` — auth → Zod → enforce 5-active-goal cap → repo → analytics log
- [x] 5-goal-limit dialog copy: "لديك ٥ أهداف نشطة. أرشف هدفًا أولاً."
- [x] Analytics event: `goal_created`

**🎨 Frontend:**
- [x] `components/goals/goal-readiness-dialog.tsx` — Goal vs Habit Clarity (FR1.1)
- [x] `components/goals/goal-wizard.tsx` — Step 1: Goal + Measure
- [x] `components/goals/goal-wizard.tsx` — Step 2: Category + Relevance
- [x] `components/goals/goal-wizard.tsx` — Step 3: Milestones breakdown
- [x] `features/goals/pages/` route wiring (via `app/router.tsx`)
- [ ] `features/goals/hooks/useCreateGoal.ts` (React Query mutation, optimistic cache update)
- [x] i18n strings in `ar.json`/`en.json` (wizard copy, limit dialog - defined in messages.ts)
- [x] Field-level validation error states

**Sequencing:** DB → domain (parallel, no DB dependency) → repo → schema/action → hook → UI. Depends on E0-4 (DB pattern), E0-5 (authed user). **Owners:** default pairing.

---

## 4. Phase 2: Core Product Loop

### Epic E1 — Goal Management, part 2

#### E1-2 — Goal Dashboard & Detail View *(~8 SP †)* · 👤 **Hamza**
Epic E1 · FR8, FR11.2, FR11.3 *(+FR5/6/6.2/6.3/7/9/10 shared with E1-1)*. Heat map + search are **[PRD gap-fill]**, §2.1.
> 12-week bar, progress rings, weekly heat map, health dots, detail view with milestones, and basic search/filter.

**🗄️ Database:** _None new — uses `goals`/`milestones` from E1-1._
**⚙️ Backend:**
- [ ] `data/repositories/goals.repo.ts`: extend `getById` to join milestones + linked tasks
- [ ] `data/repositories/goals.repo.ts`: `reorderMilestones`, `toggleMilestone`
- [ ] `data/repositories/goals.repo.ts`: `softDelete` (sets status + `deletion_reason`)
- [ ] `data/repositories/goals.repo.ts`: `updateManualProgress`
- [ ] `features/goals/schemas.ts`: `softDeleteGoalSchema` (goalId + reason)
- [ ] `features/goals/actions.ts`: `deleteGoal`, `toggleMilestone`, `reorderMilestones`, `overrideProgress`
- [ ] **[PRD gap-fill]** `data/repositories/goals.repo.ts`: query for weekly task-completion density per goal (grouped by week within the 12-week cycle) — powers the heat map (FR8)

**🎨 Frontend:**
- [ ] `components/goals/twelve-week-bar.tsx` — 12 segments, current week highlighted, **week 1 on the right (RTL)**
- [ ] `components/goals/goal-card.tsx`
- [ ] `components/goals/goal-progress-ring.tsx` (SVG)
- [ ] `components/goals/goal-health-dot.tsx` (🟢🟡🟠🔴)
- [ ] **[PRD gap-fill]** `components/goals/weekly-heatmap.tsx` — the 3rd required Goal Dashboard visual per FR8; cell intensity = task-completion density per week
- [ ] `features/goals/pages/GoalDashboardPage.tsx` (route `/goals`) — Dashboard + Weekly Execution Score
- [ ] **[PRD gap-fill]** Basic search/filter input on the Dashboard (client-side, filters by title/category — no new DB query needed for MVP's "basic" bar, PT6)
- [ ] Empty state (no goals)
- [ ] `components/goals/goal-detail.tsx` — ring, health dot, category, measure, relevance, cycle dates, total time invested
- [ ] `components/goals/milestone-list.tsx` — checkable + reorderable
- [ ] `features/goals/pages/GoalDetailPage.tsx` (route `/goals/:id`)
- [ ] Manual progress override slider **+ "Manual" badge + "revert to computed value" option** (FR7 — the override must be visibly distinguishable and reversible)
- [ ] Delete-goal confirmation dialog (reason required — depends on POL-4 primitive; stub inline for now)

**Sequencing:** The core dashboard/detail work depends only on E1-1's schema + repo. **The weekly heat map specifically needs completed-task data — sequence that sub-task after E2-1/E2-2 land**, even though the rest of E1-2 can start right after E1-1. **Owners:** Repo/action extensions → agent-capable dev. Dashboard vs Detail are independently testable screens — consider splitting Frontend across 2 entry-level devs; the heat map is a good fit for whoever is strongest visually, alongside E4-2's capacity gauge.

---

### Epic E2 — Task Management & Time Blocking (17 SP · 3 stories)

#### E2-1 — Task Engine & Auto-Type Creation *(~6 SP)* · 👤 **Mustafa**
Epic E2 · FR12, FR12.1, FR12.2, FR12.3, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21
> `tasks` table, Quick Add sheet, auto-type detection, points preview.

**🗄️ Database:**
- [ ] `task_type` enum (scheduled, flexible, quick)
- [ ] `task_difficulty` enum (easy, medium, hard)
- [ ] `task_priority` enum (high, medium, low)
- [ ] `task_status` enum (pending, completed, postponed)
- [ ] `tasks` table (goal_id FK nullable, title, description, type, difficulty, priority, date, time_block_start/end, planned_duration_minutes, actual_duration_minutes, checklist JSONB, status, points_earned, completed_at, timestamps)
- [ ] `idx_tasks_user_date_priority`, `idx_tasks_user_goal` indexes

**⚙️ Backend:**
- [ ] `domain/task-type.ts`: `detectTaskType` (time block → scheduled; duration only → flexible; neither → quick)
- [ ] `domain/task-type.ts`: `calculateBlockDuration`
- [ ] `tests/domain/task-type.test.ts` — title-only→quick, +duration→flexible, +time→scheduled, both→scheduled (P0)
- [ ] `domain/scoring.ts`: `predictTaskPoints` (live pre-completion preview)
- [ ] `data/repositories/tasks.repo.ts`: `createTask`
- [ ] `features/tasks/schemas.ts`: `createTaskSchema` (title, goalId, difficulty, priority, date, timeBlock, duration, checklist)
- [ ] `features/tasks/actions.ts`: `createTask()`
- [ ] Analytics event: `task_created`

**🎨 Frontend:**
- [ ] `components/tasks/quick-add-sheet.tsx` — title (required, auto-focused)
- [ ] Goal dropdown (optional) + priority/difficulty selectors (default: medium)
- [ ] Collapsible `[+ Add Time]` / `[+ Add Duration]` / `[+ Add Checklist]`
- [ ] Live expected-points preview
- [ ] `components/tasks/checklist.tsx` — JSONB checklist, editable items
- [ ] `features/tasks/hooks.ts`: `useCreateTask`
- [ ] Confirm user never sees "scheduled/flexible/quick" labels anywhere in UI

**Sequencing:** Depends on E1-1 (goal dropdown needs `getActiveGoals`). **Owners:** Domain + schema/action → agent-capable dev. Quick Add sheet UI → entry-level dev.

---

#### E2-2 — Task Completion Flows *(~6 SP)* · 👤 **Mustafa**
Epic E2 · FR6.1, FR26, FR26.1, FR26.2, FR26.3, FR27, FR27.1, FR27.2, FR27.3, FR27.4, FR28
> 3 completion types, full scoring, Contribution Pulse.

**🗄️ Database:** _None new — writes to existing `tasks` columns (`status`, `points_earned`, `completed_at`, `actual_duration_minutes`)._
**⚙️ Backend:**
- [ ] `domain/scoring.ts`: `calculateTaskPoints` — `(actual_duration/10) × difficulty × accuracy × streak`
- [ ] Difficulty multipliers: easy ×1.0, medium ×1.2, hard ×1.4
- [ ] Accuracy bonus ×1.15 if actual within ±15min of planned
- [ ] Streak bonus ×1.05/consecutive day, capped ×1.5
- [ ] Time cap: actual duration capped at 3× planned
- [ ] Quick tasks always = 2 points flat
- [ ] `Math.ceil` on final point value
- [ ] `tests/domain/scoring.test.ts` — every rule above (P0)
- [ ] `data/repositories/tasks.repo.ts`: `completeTask` + 60-day streak lookback query
- [ ] `features/tasks/actions.ts`: `completeTask()` per Architecture §4.4 pattern (auth → Zod → domain calc → repo → analytics log)
- [ ] Analytics event: `task_complete`

**🎨 Frontend:**
- [ ] `components/tasks/smart-complete-dialog.tsx` — Scheduled: planned vs actual, no negative framing (FR27.4)
- [ ] `components/tasks/manual-complete-dialog.tsx` — Flexible: "How long?" duration slider
- [ ] Quick type: one tap, no dialog
- [ ] `components/shared/contribution-pulse.tsx` — **exact spec (FR6.1): text only** ("+X% نحو [اسم الهدف]"), **CSS fade in/out over 3 seconds**, **positioned inline directly above the completed task card** — not a generic animated badge
- [ ] `features/tasks/hooks.ts`: optimistic `mutate()` completion per Architecture §4.5
- [ ] No interruption/alert while task is in progress (FR27.2)

**Sequencing:** Depends on E2-1. **Owners:** Scoring domain is correctness-critical — agent-capable dev, test-first. Completion dialogs → entry-level dev.

---

#### E2-3 — Task List & Backlog *(~5 SP †)* · 👤 **Mohamed**
Epic E2 · FR29, FR30, FR31, FR31.1, FR32, FR32.1, FR32.2, FR32.3, FR33, FR90. Search is **[PRD gap-fill]**, §2.1.
> Sorting, backlog ribbon, backlog management, browser notifications, basic search/filter.

**🗄️ Database:** _None new._
**⚙️ Backend:**
- [ ] `data/repositories/tasks.repo.ts`: `getByDate` — scheduled sorted by `time_block_start`, others by priority+created_at
- [ ] `data/repositories/tasks.repo.ts`: `getBacklog` — status=pending AND date < today
- [ ] `features/tasks/actions.ts`: `rescheduleTask`, `deleteTask`, `postponeTask`

**🎨 Frontend:**
- [ ] `components/tasks/task-list.tsx` — sort logic applied (no manual drag-reorder, FR29)
- [ ] **[PRD gap-fill]** Basic search/filter on the Task List (client-side, by title/priority/goal — PT6)
- [ ] `components/tasks/backlog-ribbon.tsx` — "N tasks from previous days"
- [ ] Backlog list UI — oldest first
- [ ] Backlog actions: `[Schedule Today]` `[Schedule Date]` `[Delete]` `[Clean All]`
- [ ] Backlog-full warning (FR32.3)
- [ ] Browser Notification permission request
- [ ] 5-min-before time-block notification trigger (client-side only, no FCM — FR31/NFR11)
- [ ] Quick Add entry point restricted to Home screen only (not a FAB everywhere)
- [ ] "All tasks done" celebratory message **+ a smart follow-up suggestion** (e.g. a backlog item, an undone habit, or "add another task?") — FR33's full requirement, not just the congratulations half

**Sequencing:** Depends on E2-1 + E2-2. **Owners:** Repo query extensions → agent-capable dev. Backlog UI + notifications → entry-level dev.

---

### Epic E3 — Habit Tracking (8 SP · 2 stories)

#### E3-1 — Build Habits & MVD *(~5 SP)* · 👤 **Ziad**
Epic E3 · FR34, FR34.1, FR35, FR36, FR36.1, FR37
> `habits`+`habit_logs` tables, Boolean+Counter, MVD on Light Days.

**🗄️ Database:**
- [ ] `habit_type` enum (boolean, counter, quit)
- [ ] `habits` table (title, category, type, frequency JSONB, target_value, mvd_value, mvd_description, is_spiritual, is_archived, timestamps)
- [ ] `habit_logs` table (habit_id FK cascade, date, value, is_mvd, is_relapse) + `UNIQUE(habit_id, date)` + `idx_habit_logs_habit_date`

**⚙️ Backend:**
- [ ] `domain/scoring.ts`: `calculateHabitPoints` (boolean_full=5, boolean_mvd=3)
- [ ] `domain/scoring.ts`: `calculateCounterHabitPoints` (full=5, partial=4, mvd=3)
- [ ] `tests/domain/scoring.test.ts` extend — habit point cases
- [ ] `data/repositories/habits.repo.ts`: `createHabit`, `logHabit` (upsert by date), `getTodayHabits`
- [ ] `features/habits/schemas.ts`: `createHabitSchema`, `logHabitSchema`
- [ ] `features/habits/actions.ts`: `createHabit`, `logHabit`
- [ ] Analytics events: `habit_created`, `habit_logged`

**🎨 Frontend:**
- [ ] `components/habits/habit-card.tsx`
- [ ] `components/habits/habit-list.tsx`
- [ ] `components/habits/habit-counter.tsx` — `[+]`/`[-]` stepper
- [ ] Boolean habit toggle (`✅`/`☐`)
- [ ] `components/habits/mvd-indicator.tsx` — reads `DayTypeProvider`; Light Day → MVD version, Off Day → essential-only
- [ ] `features/habits/pages/HabitsPage.tsx` (route `/habits`)
- [ ] `features/habits/hooks/`: `useHabits`, `useLogHabit` (React Query, optimistic)
- [ ] Free-text habit name input (no suggested-library chips here — that's ONB-2 only)

**Sequencing:** Depends on E0-4 only — independent of E1/E2, can run in parallel with them. **Owners:** default pairing; good candidate for the 2nd agent-capable dev to own in parallel with whoever owns E2.

---

#### E3-2 — Quit Habits & Relapse Tracking *(~3 SP)* · 👤 **Khaled**
Epic E3 · FR41, FR42, FR42.1, FR43
> Auto-incrementing counter, relapse logging, no negative points.

**🗄️ Database:** _None new — uses `habit_type='quit'` and `habit_logs.is_relapse`, already in E3-1's schema._
**⚙️ Backend:**
- [ ] `data/repositories/habits.repo.ts`: `logRelapse` (resets counter, sets `is_relapse=true`)
- [ ] `features/habits/actions.ts`: `logRelapse`
- [ ] Streak calc: days since creation OR since last relapse
- [ ] Confirm point value is always 0 for quit habits (never negative)
- [ ] Relapse stats query (FR42.1)

**🎨 Frontend:**
- [ ] Quit-habit card variant — 🚫 + auto-incrementing day counter (e.g. "15 days")
- [ ] "Log Relapse" button
- [ ] Relapse confirmation dialog (depends on POL-4 primitive; stub inline for now)
- [ ] Encouraging (not shaming) microcopy on relapse — **PRD tone anchor (Journey 4): "لا بأس. التقدم ليس خطًا مستقيمًا. 💪"** — mirror this register in the English copy, don't just translate literally
- [ ] Visually separate Build vs Quit habits (FR43)
- [ ] `is_relapse` never exposed outside the user's own view

**Sequencing:** Depends on E3-1. **Owners:** default pairing (quick story, reuses E3-1 patterns).

---

## 5. Phase 3: Intelligence & Home

### Epic E4 — Capacity & Scoring (13 SP · 3 stories)

#### E4-1 — Day Types & Settings *(~4 SP †)* · 👤 **Hamza**
Epic E4 · FR53, FR55, FR55.1, FR55.2, FR55.3. Notification toggle is **[PRD gap-fill]**, §2.1.
> Work/Light/Off configuration, work hours, manual override, notification preferences.

**🗄️ Database:** _None new — uses `users.settings` JSONB from E0-5._
**⚙️ Backend:**
- [ ] `features/settings/schemas.ts`: `updateSettingsSchema` (workHours, dayStart, offDays, theme, **language**, notifications) — `language` here is what E0-6's switcher writes to
- [ ] `features/settings/actions.ts`: `updateSettings`
- [ ] `data/repositories/users.repo.ts`: extend with `updateSettings`

**🎨 Frontend:**
- [ ] `features/settings/pages/SettingsPage.tsx` (route `/settings`)
- [ ] Day Type config per weekday (Work/Light/Off)
- [ ] Work-hours start/end pickers
- [ ] Day-start time picker — **default 04:00, valid range 01:00–06:00, validated in the Zod schema** (FR55.2 — don't leave this an open time field, an out-of-range value breaks the whole day-boundary concept)
- [ ] Manual day-type override control (today only)
- [ ] `providers/day-type.tsx` context
- [ ] `hooks/use-day-type.ts`
- [ ] Theme toggle confirmed here too (dark/light, FR53)
- [ ] **[PRD gap-fill]** Notification preferences toggle (e.g. enable/disable the time-block reminder)

**Sequencing:** Depends on E0-5 (`users.settings` must exist) and E0-6 (language switcher writes here). **Owners:** default pairing.

---

#### E4-2 — Daily Capacity Intelligence *(~4 SP)* · 👤 **Khaled**
Epic E4 · FR83, FR83.1, FR83.2, FR83.3
> System-calculated capacity. **Visual gauge on Home is required — the differentiator, not backend-only.**

**🗄️ Database:** _None new — capacity is computed, not persisted._
**⚙️ Backend:**
- [ ] `domain/capacity.ts`: `calculateDailyCapacity` — `(work_end - work_start - breaks) × 0.80`
- [ ] Light Day → ×0.50; Off Day → 0
- [ ] `domain/capacity.ts`: `calculatePlannedTime` (sum of today's task durations)
- [ ] `domain/capacity.ts`: `parseTimeToMinutes`
- [ ] `tests/domain/capacity.test.ts` — Work/Light/Off, custom hours, time parsing (P0)
- [ ] `features/capacity/types.ts`

**🎨 Frontend:**
- [ ] **Visual capacity gauge on Home screen** — required, not backend-only
- [ ] Overload warning — **gentle/light indicator, not alarming** (a subtle red accent, not a hard error state) when planned time > capacity (FR83.1)
- [ ] Task-suggestion prompt, triggered specifically when planned time is **<30% of capacity** (FR83.2 — this exact threshold, not "whenever it looks light")
- [ ] `features/capacity/hooks.ts`: `useCapacity`
- [ ] Work-hours setup entry point reachable from here too (FR83.3, links to E4-1)

**Sequencing:** Depends on E4-1. **Owners:** Domain fn → agent-capable dev (small, pure, test-first). Gauge component is the product's signature visual — give it to whoever on the team is strongest at visual/SVG work, alongside E1-2's heat map, with extra design review.

---

#### E4-3 — Scoring Engine & Progress Bar *(~5 SP)* · 👤 **Ziad**
Epic E4 · FR44, FR45, FR46, FR47
> `daily_summaries` table, 4-color progress bar, 5 Day States.

**🗄️ Database:**
- [ ] `day_type` enum (work, light, off)
- [ ] `day_state` enum (legendary, amazing, perfect, good_enough, low)
- [ ] `daily_summaries` table (user_id, date, day_type, tasks_completed, habits_completed, points_earned, daily_target, day_state, summary_shown) + `UNIQUE(user_id, date)`

**⚙️ Backend:**
- [ ] `domain/day-state.ts`: `calculateDayState` — ≥150% legendary / ≥120% amazing / ≥100% perfect / ≥50% good_enough / <50% low
- [ ] `domain/day-state.ts`: `calculateAdaptiveDailyTarget` — rolling 7-day avg, Light×0.5, Off×0.2
- [ ] `tests/domain/day-state.test.ts` — all 5 boundaries (49/50/100/120/150%), zero target (P0)
- [ ] `data/repositories/daily-summaries.repo.ts`: `upsertDailySummary`, `getToday`
- [ ] Hook recompute into E2-2's `completeTask` and E3-1's `logHabit` actions

**🎨 Frontend:**
- [ ] `components/scoring/progress-bar.tsx` — 4 CSS color states 🔴🟠🟣🟢, animated width transition (500ms ease-out)
- [ ] `components/shared/day-state-badge.tsx` — 5 states
- [ ] "Good Enough Day" badge — positive framing, not a consolation prize
- [ ] `components/scoring/daily-summary-toast.tsx`

**Sequencing:** Depends on E2-2 (task points), E3-1 (habit points), E4-1 (day type) — this is E4's capstone, sequence it last within the epic. **Owners:** default pairing.

---

### Epic HOME — Home Screen (8 SP · 2 stories)

#### HOME-1 — Adaptive Morning Greeting *(~4 SP)* · 👤 **Hamza**
Epic HOME · FR60, FR84, FR84.1
> 3 greeting scenarios + first-open daily summary toast.

**🗄️ Database:** _None new — reads `daily_summaries.summary_shown`._
**⚙️ Backend:**
- [ ] Greeting-scenario decision logic (has-tasks / no-tasks-has-goals / new-user / no-goals) — implement as an Express endpoint/controller feeding `features/home/`'s React Query hook, or extend the analytics controller
- [ ] Mark `summary_shown=true` on first render after day start
- [ ] Compute yesterday's daily-summary if not already stored

**🎨 Frontend:**
- [ ] `components/home/adaptive-greeting.tsx` — branch: has planned tasks
- [ ] `components/home/adaptive-greeting.tsx` — branch: no tasks but has goals (+ suggestion)
- [ ] `components/home/adaptive-greeting.tsx` — branch: new user
- [ ] `components/home/adaptive-greeting.tsx` — branch: no goals (empty state, "ابدأ بهدف واحد")
- [ ] Reuse `daily-summary-toast.tsx` from E4-3 — dismiss in 3s or on tap

**Sequencing:** Depends on E1-1 (goals-exist check), E2-1 (tasks-exist check), E4-3 (`daily_summaries` table). **Owners:** Decision logic → agent-capable dev. Greeting copy/UI (4 voice-sensitive branches) → entry-level dev + copy review.

---

#### HOME-2 — Home Screen Layout Assembly *(~4 SP)* · 👤 **Khaled**
Epic HOME · FR: — (layout assembly, no new FR)
> Assemble greeting → tasks → habits → backlog → progress bar.

**🗄️ Database:** _None._
**⚙️ Backend:** _None new — reuses existing task/habit/backlog/summary endpoints._

**🎨 Frontend:**
- [ ] `features/home/pages/HomePage.tsx` (route `/`) — parallel React Query fetch on mount: today's tasks, today's habits, backlog count, daily summary
- [ ] `components/home/daily-overview.tsx` — compose: Greeting → Today's Tasks → Habits → Backlog Ribbon → Progress Bar (exact order)
- [ ] Full-page loading skeleton (backend cold start 2–5s, see `Architecture.md` §1.3)
- [ ] Mobile + desktop responsive layout

**Sequencing:** Depends on HOME-1, E2-3, E3-1, E4-2 — this is the last story that can land in this phase, since it integrates all of them. **Owners:** Mostly integration work (low new-logic risk, high integration-correctness risk) — good paired task for one agent-capable + one entry-level dev together.

---

## 6. Phase 4: Onboarding & Polish

### Epic ONB — Onboarding (9 SP · 3 stories)

#### ONB-1 — Onboarding Wizard Step 1 (Goal) *(~3 SP)* · 👤 **Hamza**
Epic ONB · FR: — (reuses FR1.1 dialog + E1-1 wizard)
> Non-skippable Goal vs Habit dialog + first goal.

**🗄️ Database:** _None new._
**⚙️ Backend:**
- [ ] `features/onboarding/actions.ts` — wizard-step state (client-side until final submit in ONB-3)
- [ ] Reuse `features/goals/actions.ts`: `createGoal`

**🎨 Frontend:**
- [ ] `components/onboarding/onboarding-wizard.tsx` — stepper shell (Step 1/3, 2/3, 3/3)
- [ ] `components/onboarding/goal-readiness-step.tsx` — wraps E1-1's Goal-vs-Habit dialog + wizard, cannot be skipped
- [ ] `features/onboarding/pages/OnboardingPage.tsx` (route `/onboarding`)

**Sequencing:** Depends on E1-1. **Owners:** mostly wiring existing E1-1 components → entry-level dev.

---

#### ONB-2 — Onboarding Wizard Step 2 (Habits + MVD) *(~3 SP)* · 👤 **Khaled**
Epic ONB · FR: — (reuses E3-1 habit creation). Category restriction is **[PRD gap-fill]** clarification, §2.1.
> Suggested habits library (chips) + MVD setup.

**🗄️ Database:** _None new._
**⚙️ Backend:**
- [ ] Suggested-habits list as a static constant in `lib/constants.ts` (no DB table — not one of the 8 schema tables). **Categories: health, educational, relationships only — no religious/spiritual suggestions in MVP** (FR36.1). Users can still create a custom spiritual habit manually via free-text in E3-1; `habits.is_spiritual` just isn't set by anything in the suggested list.
- [ ] Reuse `features/habits/actions.ts`: `createHabit`

**🎨 Frontend:**
- [ ] `components/onboarding/habits-step.tsx` — chip picker from suggested-habits constant
- [ ] Per-habit "What's the MINIMUM? (MVD)" prompt

**Sequencing:** Depends on E3-1. **Owners:** entry-level dev.

---

#### ONB-3 — Onboarding Wizard Step 3 (Settings + First Task) *(~3 SP)* · 👤 **Mohamed**
Epic ONB · FR: — (reuses E4-1 settings + E2-1 task creation)
> Quick settings + first task + `onboarding_completed`.

**🗄️ Database:** _None new — writes `users.settings`, `users.onboarding_completed`, one `tasks` row._
**⚙️ Backend:**
- [ ] Reuse `features/settings/actions.ts`: `updateSettings`
- [ ] `features/onboarding/actions.ts`: `completeOnboarding` — sets `onboarding_completed=true`
- [ ] Analytics event: `onboarding_complete`
- [ ] Reuse `features/tasks/actions.ts`: `createTask` (pre-filled `goalId`)

**🎨 Frontend:**
- [ ] `components/onboarding/settings-step.tsx` — condensed work hours + days off
- [ ] First-task quick-create, pre-filled from the goal created in ONB-1
- [ ] Completion screen: "🎉 Welcome! Start with one." → redirect to Home

**Sequencing:** Depends on E4-1, E2-1; last onboarding step, sequence after ONB-1/ONB-2. **Owners:** entry-level dev, with the agent-capable dev on call for `completeOnboarding`.

---

### Epic POL — System States & Polish (11 SP · 4 stories)

#### POL-1 — Empty States for Every Screen *(~3 SP)* · 👤 **Khaled**
Epic POL · FR: — (positive-messaging principle)

**🗄️ Database:** _None._ **⚙️ Backend:** _None._
**🎨 Frontend:**
- [ ] `components/shared/empty-state.tsx` — illustration + headline + CTA props, positive tone
- [ ] Apply: Goals Dashboard empty state
- [ ] Apply: Habits empty state
- [ ] Apply: Task List empty state
- [ ] Apply: Backlog empty state (no ribbon shown)
- [ ] Apply: Home no-goals state
- [ ] Confirm the brand/illustration set (produced during initial foundation work) is ready to plug in

**Sequencing:** Needs the screens it decorates to exist — sequence after every other phase. **Owners:** entry-level dev.

---

#### POL-2 — Loading Skeletons for Every Data Area *(~2 SP)* · 👤 **Mohamed**
Epic POL · FR: — (backend cold-start handling)

**🗄️ Database:** _None._ **⚙️ Backend:** _None._
**🎨 Frontend:**
- [ ] `components/shared/loading-skeleton.tsx` — shimmer, 1500ms infinite linear
- [ ] Apply: Home
- [ ] Apply: Goals Dashboard
- [ ] Apply: Goal Detail
- [ ] Apply: Task List
- [ ] Apply: Habits
- [ ] `prefers-reduced-motion` disables shimmer

**Sequencing:** Same as POL-1. **Owners:** entry-level dev.

---

#### POL-3 — Error Toasts with Retry *(~3 SP)* · 👤 **Mohamed**
Epic POL · FR: — (NFR5 interruption handling, NFR13 Save on Action)

**🗄️ Database:** _None._
**⚙️ Backend:**
- [ ] Audit every `features/*/actions.ts` returns the full `ActionResult` error shape (`VALIDATION`/`AUTH`/`DB_ERROR`/`RATE_LIMIT`/`UNKNOWN`)
- [ ] Auto-retry ×3 on DB failure before surfacing an error

**🎨 Frontend:**
- [ ] `components/shared/error-toast.tsx` — sonner-based + retry action ("فشل الحفظ. [حاول مرة أخرى]")
- [ ] `components/shared/error-boundary.tsx`
- [ ] Persistent offline banner ("لا يوجد اتصال")
- [ ] Wire into every mutation call site across all features

**Sequencing:** Needs all actions from every other phase to exist. **Owners:** Backend audit → agent-capable dev. Toast/banner components → entry-level dev.

---

#### POL-4 — Confirmation Dialogs *(~3 SP)* · 👤 **Mohamed**
Epic POL · FR: — (NFR14 destructive-action confirmation)

**🗄️ Database:** _None._
**⚙️ Backend:**
- [ ] Ensure destructive actions require their confirmation payload (e.g. `deletion_reason` on goal delete)

**🎨 Frontend:**
- [ ] Shared Shadcn `AlertDialog` wrapper component
- [ ] Wire into: goal delete (reason required)
- [ ] Wire into: task delete
- [ ] Wire into: habit delete/archive
- [ ] Wire into: quit-habit relapse (E3-2)
- [ ] Confirm no Undo/Redo pattern exists anywhere in the app

**Sequencing:** Needs all delete/relapse actions to exist. **Owners:** entry-level dev (mostly wiring a shared primitive into existing screens).

---

## 7. What's deliberately not a story above

These need an owner even though they have no Database/Backend/Frontend split and aren't among the 25 stories:

- **Brand & foundation prep:** brand mark, illustration set, initial Vercel deploy — feeds POL-1's empty states and E0-1/E0-2. Per `Scope.md` §8.1 this fits the entry-level roles (illustration, copy, QA).
- **Demo production:** the cinematic demo video (Khaled's story arc, AR VO + EN subtitles), final production deploy, and a Lighthouse pass (≥85 desktop / ≥75 mobile per the PRD's own release criteria) — also entry-level-role work per `Scope.md` §8.1.
- **The "Overview" analytics page** (§2.2) — not built here because no FR backs it. Needs your call: alias it to Home and remove the dead nav/route reference, or write it up as real scope with its own ACs.
