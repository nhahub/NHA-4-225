# 📋 Hadaf (هدف) — Epic Breakdown v2.1 — MVP

> **Generated from:** PRD v2.0 MVP + UX Design Spec v2.0
> **Date:** يوليو ٢٠٢٦
> **Scope:** MVP (Phase 1) — 5 days, 5 team members (2 juniors + 3 entry-level, 2 agent-capable)
> **25 vertically-sliced stories, ~99 SP** (see `Docs/team-task-assignments.md` for the authoritative per-story SP/owner breakdown; the per-epic sums below total ~94 SP before that doc's gap-fill)
> **Client stack:** UI imported from the Impulse codebase (Vite + React Router + React Query + Zustand) — see `Docs/Impulse-Migration-Plan.md`
> **Bilingual:** Arabic (RTL) + English (LTR) at parity
> **Submission:** Live deployed + repo + demo video

---

## 1. Overview

### 1.1 MVP Philosophy

> **"Build the simplest thing that proves the core value: Goals → Tasks → Progress + Habits with MVD + Anti-Overwhelm."**

Every story respects these constraints:

| Constraint | Rule |
|---|---|
| **No Framer Motion** | CSS Transitions only |
| **No Auto-save** | Save on Action |
| **No Undo/Redo** | Confirmation Dialogs |
| **No Full Subtasks** | Simple Checklist (JSONB) |
| **No Momentum Snap** | Tap-to-complete |
| **No Prayer Features** | Phase 2 |
| **No Phoenix Bond** | Phase 2 |
| **No Weekly Review** | Phase 2 |
| **React Query + Optimistic Updates** | No polling — cache invalidation after every action |
| **Browser Notifications only** | No FCM |

### 1.2 Team Capacity (5 days, 5 humans + agents)

| Day | Velocity | Focus |
|---|---|---|
| Day 1 | ~20 SP | Foundation — scaffold (client copied from Impulse + server from scratch), design tokens, i18n, RTL conversion, merge-conflict resolution |
| Day 2 | ~24 SP | Project Setup & Identity wrap-up + Goal Management + Habit/Settings/Task Engine starts |
| Day 3 | ~28 SP | Task Completion + Goal Dashboard + Habits UI + Capacity + Scoring Engine |
| Day 4 | ~17 SP | Home Screen + Onboarding starts + Task List/Scoring wrap-up |
| Day 5 | ~10 SP | Onboarding finish + all Polish stories + deploy |
| **Total** | **~99 SP** | See `Docs/team-task-assignments.md` for the per-person day-by-day plan |

**Velocity assumptions:** 2 agent-capable humans dispatch BMAD-role subagents (`ba`, `pm`, `designer`, `frontend`, `backend`, `qa`). 3 entry-level humans do manual work, illustration, copy, QA. Agents deliver ~3–5× human-only velocity on well-scoped tasks. Human + agent pairing handles the rest. Reusing Impulse's client codebase (see `Docs/Impulse-Migration-Plan.md`) is what makes the 5-day timeline viable — Day 1 is largely adaptation, not from-scratch scaffolding.

---

## 2. MVP Epic Overview (Vertically Sliced)

| Epic ID | Epic Name | Stories | Total SP | Day |
|---|---|---|---|---|
| **E0** | Project Setup & Identity | 6 | 18 | Day 1-2 |
| **E1** | Goal Management | 2 | 12 | Day 2-3 |
| **E2** | Task Management & Time Blocking | 3 | 16 | Day 2-4 |
| **E3** | Habit Tracking | 2 | 8 | Day 2-3 |
| **E4** | Capacity & Scoring | 3 | 12 | Day 2-4 |
| **HOME** | Home Screen | 2 | 8 | Day 4 |
| **ONB** | Onboarding | 3 | 9 | Day 4-5 |
| **POL** | System States & Polish | 4 | 11 | Day 5 |
| | **TOTAL** | **25** | **~94** | |

*(Note: the per-epic SP sum here is ~94; `Docs/team-task-assignments.md` carries the authoritative ~99 SP per-story total after gap-fill — see that doc's §5.)*

---

## 3. Day Plan (5 days, bilingual)

Full per-person breakdown lives in `Docs/team-task-assignments.md`; this is the epic-level view.

| Day | Focus | Stories |
|---|---|---|
| **Day 1** | Foundation & Brand | Client scaffold (copied from Impulse, merge conflicts resolved), server scaffold, DB connection, OKLCH design tokens (converted from Impulse Violet, in `tailwind.config.js`), i18n + RTL conversion, E0-5 (Auth) starts |
| **Day 2** | Setup, Auth & Goals | E0-6, E1-1, E3-1, E4-1, E2-1 starts |
| **Day 3** | Tasks & Habits | E1-2, E2-1 finishes → E2-2, E2-3 starts, E3-2, E4-2, E4-3 starts |
| **Day 4** | Capacity, Scoring & Home | E2-3 finishes, E4-3 finishes, HOME-1, HOME-2, ONB-1/ONB-2/ONB-3 start |
| **Day 5** | Onboarding + Polish + Ship | ONB-1/ONB-2/ONB-3 finish, POL-1, POL-2, POL-3, POL-4, deploy (client + server) |

### Day-by-Day Demos

| Day | What We Demo |
|---|---|
| **Day 1** | App shell reachable → brand mark visible → language toggle works (AR ↔ EN) → RTL renders correctly → design tokens applied |
| **Day 2** | Login (Email/Password) → responsive shell → dark/light theme → Goal creation wizard (both languages) |
| **Day 3** | Create goal → create linked task (auto-type) → complete tasks → track Boolean/Counter habits → see MVD toggle |
| **Day 4** | See Daily Capacity gauge → Progress bar with 4 colors → 5 day states → Daily Pulse card on Home |
| **Day 5** | Full end-to-end user journey in both languages → all polish states → Lighthouse ≥ 85 desktop / ≥ 75 mobile → live on production (client + server) |

---

## 4. Full Story Breakdown by Epic (Vertical Slices)

> **Core Principle:** Database tables are created *only* when the feature requires them. No monolithic DB setup.

---

## Epic E0: Project Setup & Identity (6 stories, 18 SP)

**Goal:** Establish the foundation, design system, and user authentication.

### E0-1: Project Scaffold & Design System Foundation
Copy the Impulse client codebase into `hadaf/client/`, rebrand it, and establish CSS design tokens (see `Docs/Impulse-Migration-Plan.md` for the reuse map).
**AC:** Client scaffold runs locally (Vite dev server), 3 pre-existing merge conflicts resolved, OKLCH design tokens converted from Impulse's Violet hex scale directly in `tailwind.config.js`/stylesheet, CSS transitions defined.

### E0-2: Typography & RTL Foundation
Configure Tajawal + IBM Plex Sans Arabic fonts with RTL support, and convert Impulse's physical CSS properties to logical ones.
**AC:** Fonts self-hosted, `<html> dir="rtl">`, all `ml-`/`mr-`/`left-`/`right-` classes converted to Tailwind logical properties (`ms-`/`me-`/`start-`/`end-`) per the RTL Conversion Checklist in `Docs/Impulse-Migration-Plan.md`.

### E0-3: Layered Architecture Setup
Set up all architectural layers on both client and server.
**AC:** Client: `app/`, `features/`, `components/`, `providers/`, `lib/`, `stores/`, `i18n/` exist (Impulse's existing feature-slice layout, extended). Server: `models/`, `controllers/`, `routes/`, `middleware/`, `utils/` exist. `server/utils/` is framework-agnostic (zero Express/Mongoose imports).

### E0-4: Database Connection & Analytics Schema
Connect MongoDB via Mongoose and create the basic schemas.
**AC:** Connect to MongoDB. Create `analytics_events` schema/collection for telemetry.

### E0-5: Email/Password Authentication
Sign in/up with Email and Password and establish the user.
**AC:** Create `User` schema. Email/password login via `jsonwebtoken` (JWT). Refresh token rotation. Analytics event logged on login/register. Client `useAuthStore` (Zustand, from Impulse) wired to the new endpoints.

### E0-6: App Shell & Route Guards
Responsive app shell and protected routes.
**AC:** Client-side `RequireAuth`/`RedirectIfAuth` route guards (React Router) call the Express `auth.js` middleware-protected endpoints to validate the session. Mobile Bottom Nav, Desktop Sidebar. Dark/Light Theme toggle. A11y keyboard navigation.

---

## Epic E1: Goal Management (2 stories, 12 SP)

**Goal:** User can create 12-week goals via SMART wizard, break them into milestones, and see progress visually.

### E1-1: SMART Goal Wizard & Foundation
Implement goal creation wizard and underlying data structures.
**AC:** Create `goals` and `milestones` database tables. 3-step SMART wizard. 5-goal limit enforced. Domain logic for hybrid progress.

### E1-2: Goal Dashboard & Detail View
Visual dashboard for goals and deep-dive detail views.
**AC:** 12-Week Bar segmenting. Goal cards with SVG progress ring and health dot (🟢🟡🟠🔴). Detail view with milestones (checkable/reorderable) and linked tasks.

---

## Epic E2: Task Management & Time Blocking (3 stories, 16 SP)

**Goal:** User can create tasks with auto-type detection and complete them with dynamic flows.

### E2-1: Task Engine & Auto-Type Creation
Implement task creation with intelligent type inference.
**AC:** Create `tasks` table. Quick Add Bottom Sheet. Auto-detect type (Quick, Scheduled, Flexible) based on user input. Preview expected points.

### E2-2: Task Completion Flows
Implement the 3 completion types and point calculation.
**AC:** Domain scoring logic. Smart Complete (Scheduled), Manual Complete (Flexible), Quick Complete (Quick). Contribution Pulse fires on completion.

### E2-3: Task List & Backlog
Manage today's tasks and overdue backlog.
**AC:** Sort logic (scheduled by time, others by priority). Backlog ribbon ("N tasks from previous days"). Backlog management (reschedule, delete).

---

## Epic E3: Habit Tracking (2 stories, 8 SP)

**Goal:** User can track Boolean/Counter habits with MVD support and Quit habits with relapse tracking.

### E3-1: Build Habits & MVD
Implement daily habits and Minimum Viable Day toggle.
**AC:** Create `habits` and `habit_logs` tables. Boolean (✅/☐) and Counter ([+]/[-]). MVD indicator shows minimal version on Light Days. 

### E3-2: Quit Habits & Relapse Tracking
Track habits to break with auto-incrementing counters.
**AC:** Counter auto-increments daily. "Log Relapse" button resets counter and provides encouragement. No negative points.

---

## Epic E4: Capacity & Scoring (3 stories, 12 SP)

**Goal:** User configures their day types, the system calculates their capacity, and dynamically updates their daily progress.

### E4-1: Day Types & Settings
Configuration for how the system treats different days.
**AC:** Update `users.settings` JSONB. Configure Work/Light/Off days. Configure work hours. Manual day type override.

### E4-2: Daily Capacity Intelligence
System calculates daily capacity without asking the user.
**AC:** Formula `(end_work - start_work - breaks) × 80%`. Light Day = 50%. Warn user if planned tasks exceed capacity.

### E4-3: Scoring Engine & Progress Bar
Implement dynamic progress bar and day states.
**AC:** Create `daily_summaries` table. Progress bar with 4 CSS color states (🔴🟠🟣🟢). 5 Day States (Legendary to Low). Good Enough Day badge.

---

## Epic HOME: Home Screen (2 stories, 8 SP)

**Goal:** Adaptive home screen with morning greeting and daily overview.

### HOME-1: Adaptive Morning Greeting
Context-aware morning greeting.
**AC:** Handles 3 scenarios: Has tasks, No tasks (has goals), New user. Daily Summary Toast on first open.

### HOME-2: Home Screen Layout Assembly
Assemble all home screen components into one view.
**AC:** Greeting → Today's tasks → Habits section → Backlog ribbon → Daily progress bar.

---

## Epic ONB: Onboarding (3 stories, 9 SP)

**Goal:** New user completes 3-step onboarding wizard in ≤ 5 minutes.

### ONB-1: Onboarding Wizard — Step 1 (Goal)
Goal vs Habit dialog + create first goal.
**AC:** Cannot skip. SMART wizard for first goal.

### ONB-2: Onboarding Wizard — Step 2 (Habits + MVD)
Choose habits from library with MVD setup.
**AC:** Suggested habits library. "What's the MINIMUM? MVD" setup.

### ONB-3: Onboarding Wizard — Step 3 (Settings + First Task)
Quick settings + create first task.
**AC:** Work hours, Days off. Create first task pre-filled with goal link. Set `onboarding_completed`.

---

## Epic POL: System States & Polish (4 stories, 11 SP)

**Goal:** Every screen has proper empty, loading, error, and confirmation states.

### POL-1: Empty States for Every Screen
Illustration + CTA for every empty screen.
**AC:** Positive, inviting empty state messages.

### POL-2: Loading Skeletons for Every Data Area
Skeleton loading states matching final layout.
**AC:** Shimmer animation (1500ms). Handle backend cold starts gracefully (free-tier Node host sleeps on inactivity — see `Architecture.md` §1.3).

### POL-3: Error Toasts with Retry
Error handling with retry for all failed actions.
**AC:** Validation errors. DB failures ("فشل الحفظ"). Network offline banner.

### POL-4: Confirmation Dialogs
Confirmation before every destructive action.
**AC:** Delete goal (requires reason), delete task, delete habit, log relapse. No Undo/Redo.

---

## 5. FR Coverage Map (MVP)

| PRD FR | Epic | Story |
|---|---|---|
| FR1, FR1.1, FR2, FR3, FR4, FR11 | E1 | E1-1 |
| FR5, FR6, FR6.2, FR6.3, FR7, FR9, FR10 | E1 | E1-1, E1-2 |
| FR8 (لوحة أهداف بصرية) | E1 | E1-2 |
| FR6.1 | E2 | E2-2 |
| FR11.2, FR11.3 | E1 | E1-2 |
| FR12, FR12.1, FR12.2, FR12.3, FR13-16 | E2 | E2-1 |
| FR17-21 (Checklist) | E2 | E2-1 |
| FR26, FR26.1, FR26.2, FR26.3, FR27-28 | E2 | E2-2 |
| FR29, FR30, FR31, FR31.1 | E2 | E2-3 |
| FR32-33 | E2 | E2-3 |
| FR34, FR34.1, FR35, FR36, FR36.1, FR37 | E3 | E3-1 |
| FR41, FR42, FR42.1, FR43 | E3 | E3-2 |
| FR44, FR45 | E4 | E4-3 |
| FR46, FR47 | E4 | E4-3 |
| FR53, FR55, FR55.1-3 | E4 | E4-1 |
| FR60 | HOME | HOME-1 |
| FR83, FR83.1-3 | E4 | E4-2 |
| FR84, FR84.1 | HOME | HOME-1 |
| FR90 | E2 | E2-3 |
