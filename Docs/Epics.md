# 📋 Hadaf (هدف) — Epic Breakdown v2.0 — MVP

> **Generated from:** PRD v2.0 MVP + UX Design Spec v2.0
> **Date:** يونيو ٢٠٢٥
> **Scope:** MVP (Phase 1) — 8 weeks, 5 students
> **34 stories, ~115 SP**

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
| **SWR + Optimistic Updates** | No polling — `mutate()` after every action |
| **Browser Notifications only** | No FCM |

### 1.2 Team Capacity

| Sprint | Weeks | Velocity | Focus |
|---|---|---|---|
| Sprint 1 | 1-2 | ~31 SP | Infrastructure + Foundation |
| Sprint 2 | 3-4 | ~31 SP | Core CRUD (Goals + Tasks + Habits) |
| Sprint 3 | 5-6 | ~33 SP | Scoring + Home + Settings + Capacity |
| Sprint 4 | 7-8 | ~20 SP | Onboarding + Polish |
| **Total** | **8 weeks** | **~115 SP** | |

---

## 2. MVP Epic Overview

| Epic ID | Epic Name | Stories | Total SP | Sprint |
|---|---|---|---|---|
| **INF** | Infrastructure & Foundation | 10 | 31 | Sprint 1 |
| **E1** | Goal Management | 4 | 18 | Sprint 2 |
| **E2** | Task Management & Time Blocking | 4 | 16 | Sprint 2 |
| **E3** | Habit Tracking | 3 | 8 | Sprint 2 |
| **E4** | Scoring & Gamification | 2 | 8 | Sprint 3 |
| **E6** | Settings & Day Types | 1 | 3 | Sprint 3 |
| **E12** | Daily Capacity | 1 | 3 | Sprint 3 |
| **HOME** | Home Screen | 2 | 8 | Sprint 3 |
| **ONB** | Onboarding | 3 | 9 | Sprint 4 |
| **POL** | System States & Polish | 4 | 11 | Sprint 4 |
| | **TOTAL** | **34** | **~115** | |

---

## 3. Sprint Plan

| Sprint | Weeks | Focus | Stories | SP |
|---|---|---|---|---|
| **Sprint 1** | 1-2 | Infrastructure & Foundation | INF-1 through INF-10 | 31 |
| **Sprint 2** | 3-4 | Core CRUD (Goals + Tasks + Habits) | E1-1, E1-2, E1-3, E1-4, E2-1, E2-2, E3-1, E2-3 | 31 |
| **Sprint 3** | 5-6 | Features & Integration | E2-4, E3-2, E3-3, E6-2, E12-1, E4-1, E4-3, HOME-1, HOME-2 | 33 |
| **Sprint 4** | 7-8 | Onboarding + Polish | ONB-1, ONB-2, ONB-3, POL-1, POL-2, POL-3, POL-4 | 20 |

### Sprint Demos

| Sprint | What We Demo |
|---|---|
| **Sprint 1** | Login → see responsive shell → RTL Arabic → dark mode toggle → navigate tabs → empty states |
| **Sprint 2** | Create goal via wizard → create linked task (auto-type) → see dashboard with rings → see task list |
| **Sprint 3** | Complete tasks (3 types) → points awarded → progress bar colors → habits + MVD → Day Types → Home screen |
| **Sprint 4** | Full onboarding flow → all polish states → end-to-end user journey |

---

## 4. Full Story Breakdown by Epic

---

## Epic INF: Infrastructure & Foundation (10 stories, 31 SP)

**Goal:** The team has a running project with auth, database, responsive shell, RTL, theming, CI/CD, and the analytics table.

**Definition of Done:**
- [ ] App runs on localhost and deploys to Vercel
- [ ] Google OAuth login works end-to-end
- [ ] Protected routes redirect unauthenticated users
- [ ] Responsive shell with Bottom Nav (mobile) and Sidebar (desktop)
- [ ] Arabic RTL renders correctly
- [ ] Dark and Light themes toggle correctly
- [ ] Database connected with all 8 tables created
- [ ] CI pipeline runs lint + type-check + build on every push
- [ ] analytics_events table exists and can log events

---

### INF-1: Project Scaffold & Design System Foundation
**SP: 3 | Priority: P0 | Sprint: 1**

Initialize Next.js project with Tailwind, Shadcn UI, and CSS design tokens.

**AC:**
- `create-next-app` with TypeScript strict, Tailwind, App Router, `src/`, Turbopack
- Shadcn UI initialized with `components/ui/`
- HSL CSS variables for color system (light + dark mode)
- CSS transition utility classes defined
- App runs on `localhost:3000`

---

### INF-2: Typography, RTL Foundation & Number Formatting
**SP: 2 | Priority: P0 | Sprint: 1**

Configure Tajawal + IBM Plex Sans Arabic fonts with RTL support.

**AC:**
- Tajawal for headings, IBM Plex Sans Arabic for body
- `<html>` element has `dir="rtl"` and `lang="ar"`
- Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) used throughout
- Fonts self-hosted from `/public/fonts/`
- `lib/i18n/number-format.ts` provides locale-aware formatting
- Arabic UI renders ١٢٣٤٥

---

### INF-3: Layered Architecture & Folder Structure
**SP: 2 | Priority: P0 | Sprint: 1**

Complete folder structure with all architectural layers.

**AC:**
- All layers exist: `app/`, `features/`, `domain/`, `data/`, `components/`, `lib/`, `hooks/`
- `domain/` has zero imports from React, Next.js, or Drizzle
- `lib/constants.ts` contains: difficulty multipliers, scoring config, categories

---

### INF-4: Database Connection & Core Schema
**SP: 5 | Priority: P0 | Sprint: 1**

Neon PostgreSQL connected via Drizzle ORM with all 8 core tables.

**AC:**
- `data/db/client.ts` connects using `@neondatabase/serverless` with `-pooler`
- `data/db/schema.ts` defines all 8 tables: users, goals, milestones, tasks, habits, habit_logs, daily_summaries, analytics_events
- All indexes created
- `drizzle.config.ts` configured for migrations
- `npm run db:push` creates all tables on Neon

---

### INF-5: Google OAuth Authentication
**SP: 5 | Priority: P0 | Sprint: 1**

Sign in with Google account using JWT via `jose`.

**AC:**
- Google OAuth 2.0 consent screen
- JWT access token (15min, httpOnly cookie) + refresh token (7-day, DB)
- New user record on first login with default settings JSONB
- `lib/auth/jwt.ts` exports `signToken()`, `verifyToken()`
- Analytics event logged on login
- Silent refresh on expired access token

---

### INF-6: Protected Routes & Edge Middleware
**SP: 3 | Priority: P0 | Sprint: 1**

Edge Middleware validates JWT on every `/app/*` route.

**AC:**
- Valid token → request proceeds with userId in headers
- Invalid/expired → silent refresh attempt → redirect to login if both fail
- Login/auth routes exempt from JWT validation
- Logged-in users redirected away from `/login`

---

### INF-7: Responsive App Shell & Navigation
**SP: 5 | Priority: P0 | Sprint: 1**

Navigation shell adapts to device (Bottom Nav mobile, Sidebar desktop).

**AC:**
- **Mobile (<768px):** Single column + Bottom Nav (4 items: Home | Goals | Habits | More)
- **Tablet (768-1024px):** Two columns + toggleable sidebar
- **Desktop (>1024px):** Three columns + fixed sidebar (right side, RTL)
- Touch targets ≥ 44×44px
- Active nav item highlighted

---

### INF-8: Dark Mode & Theme Toggle
**SP: 2 | Priority: P1 | Sprint: 1**

Toggle between light and dark themes.

**AC:**
- CSS variables swap between tokens
- Preference stored in `users.settings.theme`
- `prefers-color-scheme` respected on first load
- Contrast ≥ 4.5:1 in both modes

---

### INF-9: CI/CD Pipeline
**SP: 2 | Priority: P1 | Sprint: 1**

GitHub Actions pipeline runs on every push.

**AC:**
- Runs: ESLint, TypeScript type-check, unit tests, build
- Pipeline fails if any step has errors
- Push to `main` → Vercel auto-deploy
- PR checks appear as status checks

---

### INF-10: Accessibility Foundation
**SP: 2 | Priority: P1 | Sprint: 1**

Full keyboard navigation and screen reader support in app shell.

**AC:**
- All interactive elements reachable via Tab/Enter/Escape
- Focus indicators with ≥ 3:1 contrast
- Skip-to-content link as first focusable element
- `aria-label` on all nav items, `aria-current="page"` on active
- `prefers-reduced-motion` disables CSS transitions

---

## Epic E1: Goal Management (4 stories, 18 SP)

**Goal:** User can create 12-week goals via SMART wizard, break them into milestones, see progress with Goal Health dots.

**Dependencies:** INF (all stories)

---

### E1-1: Goals Database & Repository
**SP: 3 | Priority: P0 | Sprint: 2**

Goals and milestones repository layer with CRUD + domain logic.

**AC:**
- `data/repositories/goals.repo.ts` provides: createGoal, getActiveGoals, getGoalWithMilestones, updateGoal, softDeleteGoal, replaceGoal, createMilestone, completeMilestone, reorderMilestones, getLinkedTaskCount, getCompletedLinkedTaskCount, getTotalTimeInvested
- `domain/goal-progress.ts` provides: calculateHybridProgress(), calculateGoalHealth(), calculateWeeklyExecutionScore()
- All mutations log to analytics_events
- Unit tests for hybrid progress, goal health, execution score

---

### E1-2: SMART Goal Wizard with Goal-Readiness Dialog
**SP: 5 | Priority: P0 | Sprint: 2**

Create 12-week goal through guided wizard that teaches goal vs habit difference.

**AC:**
- Goal-Readiness Dialog: two cards (Goal vs Habit) + active goal count vs max
- Step 1/3: Title + Metric + Smart Habit Detection
- Step 2/3: 5 Categories (education_work, family, health, religion, other) + Relevance
- Step 3/3: 12-week cycle + Milestones (add/reorder)
- 5-goal limit enforced with clear dialog
- Analytics event on goal creation

---

### E1-3: Goal Dashboard with Progress Rings & 12-Week Bar
**SP: 5 | Priority: P0 | Sprint: 2**

All active goals on dashboard with progress rings, health dots, 12-week bar.

**AC:**
- Loading Skeleton while loading
- 12-Week Bar: 12 segments, current week highlighted
- Goal cards: SVG progress ring, health dot (🟢🟡🟠🔴), title, category, milestone count, task count
- Goals ordered by category
- Weekly Execution Score at bottom
- Empty State with CTA when no goals
- RTL: Week 1 on right

---

### E1-4: Goal Detail View with Milestones & Linked Tasks
**SP: 5 | Priority: P0 | Sprint: 2**

Single goal details with milestones, linked tasks, and progress override.

**AC:**
- Large progress ring + health dot + category + metric + relevance + cycle dates
- Total time invested from completed linked tasks
- Milestones list (checkable, editable, reorderable)
- Linked tasks list with completion status
- Manual override via slider with "يدوي" badge
- Goal delete with reason (soft-delete)
- Goal replace mid-cycle

---

## Epic E2: Task Management & Time Blocking (4 stories, 16 SP)

**Goal:** User can create 3 types of tasks (auto-detected), complete them via 3 types of completion, manage backlog.

**Dependencies:** INF, E1-1

---

### E2-1: Tasks Repository & Scoring Domain Logic
**SP: 3 | Priority: P0 | Sprint: 2**

Tasks repository and scoring domain logic.

**AC:**
- `data/repositories/tasks.repo.ts`: createTask (auto-type), getTasksByDate, getBacklogTasks, getBacklogCount, completeTask, postponeTask, deleteTask, updateChecklist, getTasksForGoal
- `domain/scoring.ts`: calculateTaskPoints() with formula (duration/10 × difficulty × accuracy × streak)
- Quick = 2 fixed, Time Cap = 3×, Math.ceil
- Streak = consecutive days with ≥1 completed task
- Unit tests for all scoring scenarios

---

### E2-2: Task Creation with Auto-Type Detection & Quick Add
**SP: 5 | Priority: P0 | Sprint: 2**

Create tasks via Quick Add where system auto-detects type.

**AC:**
- Quick Add Bottom Sheet: title (required), goal dropdown, priority, difficulty
- Collapsible sections: [Add Time] [Add Duration] [Add Checklist]
- Title only → Quick. + Time → Scheduled. + Duration → Flexible.
- Time and Duration mutually exclusive
- Expected points preview (updates live)
- Capacity warning when over-planning
- User never sees type labels

---

### E2-3: 3 Completion Types (Smart / Manual / Quick)
**SP: 5 | Priority: P0 | Sprint: 2-3**

Complete tasks via auto-selected completion flow.

**AC:**
- **Scheduled → Smart Complete:** Planned vs Actual time, accuracy bonus, points calc
- **Flexible → Manual Complete:** "كم أخذت؟" slider, points calc
- **Quick → Quick Complete:** One tap, 2 points, no dialog
- Contribution Pulse fires if linked to goal
- Completed card fades to 50% + strikethrough
- Points update on progress bar immediately (optimistic)

---

### E2-4: Task List with Backlog & Sorting
**SP: 3 | Priority: P1 | Sprint: 3**

Today's task list with backlog ribbon and sorting.

**AC:**
- Task list sorted: Scheduled by time_block_start, others by priority → created_at
- Backlog ribbon: "لديك [N] مهام من أيام سابقة" → opens backlog list
- Backlog: sorted by date (oldest first). Actions: reschedule today, reschedule date, delete
- "تنظيف شامل" button deletes all backlog
- Warning if backlog > 10 tasks
- When all tasks complete: "أنجرت كل مهامك! 🎉" + smart suggestion

---

## Epic E3: Habit Tracking (3 stories, 8 SP)

**Goal:** User can track Boolean and Counter habits with MVD, create quit habits with relapse tracking.

**Dependencies:** INF, E1-1

---

### E3-1: Habits Repository & Domain Logic
**SP: 3 | Priority: P0 | Sprint: 2**

Habits repository with logging and MVD support.

**AC:**
- `data/repositories/habits.repo.ts`: createHabit, getActiveHabits, logHabit, getHabitLog, getHabitStreak, createQuitHabit, incrementQuitCounter, logRelapse
- `domain/scoring.ts`: calculateHabitPoints() — Boolean: 5/3, Counter: 5/4/3/0, Quit: always 0
- MVD: Full = 100% points, Minimal = 50% points
- Light Day auto-switches to MVD
- Unit tests for all habit point scenarios

---

### E3-2: Build Habits (Boolean + Counter) with MVD
**SP: 3 | Priority: P0 | Sprint: 2-3**

Track daily habits with Boolean and Counter types, MVD support.

**AC:**
- Habit list: Boolean (✅/☐), Counter ([+]/[-] with target)
- MVD indicator: shows minimal version on Light Days
- Full completion = green check, MVD = amber check with "MVD" badge
- Streak display per habit
- Suggested habits library (chips — no religious habits)
- Custom habit creation with type, category, frequency, target, MVD value

---

### E3-3: Quit Habits with Auto-Counter & Relapse
**SP: 2 | Priority: P1 | Sprint: 3**

Quit habits with auto-incrementing counter and relapse tracking.

**AC:**
- Counter auto-increments daily (+1 day) — no daily question
- "سجل انتكاسة" button (non-prominent): resets counter
- Encouragement message on relapse: "لا بأس. التقدم ليس خطًا مستقيمًا. 💪"
- No points deducted ever
- Stats: longest streak, total relapses, average between relapses

---

## Epic E4: Scoring & Gamification (2 stories, 8 SP)

**Goal:** Fair scoring system with dynamic progress bar and 5 day states.

**Dependencies:** E2-1, E3-1

---

### E4-1: Scoring Engine Integration
**SP: 5 | Priority: P0 | Sprint: 3**

Scoring engine integrated with tasks and habits.

**AC:**
- Task completion → points calculated and stored
- Habit completion → points calculated and stored
- Daily target: adaptive based on last 7 days average
- Points displayed as Arabic numerals (١٢٣ not 123)
- Milestone Bonus: 10 points per milestone completion
- All scoring uses Math.ceil (always integers)
- Same scoring function runs client-side (optimistic) and server-side (authoritative)

---

### E4-3: Dynamic Progress Bar + 5 Day States
**SP: 3 | Priority: P0 | Sprint: 3**

Progress bar with dynamic colors and day state calculation.

**AC:**
- Progress bar colors: 0-30%=🔴, 31-60%=🟠, 61-85%=🟣, 86-100%+=🟢
- CSS transition on width (500ms ease-out)
- Day States: Legendary ≥150%, Amazing ≥120%, Perfect ≥100%, Good Enough 50-99%, Low <50%
- Good Enough Day badge: "💪 يوم جيد بما فيه الكفاية"
- Low Day: "غدًا يوم جديد" (no negative message)
- Day state recalculates on every completion

---

## Epic E6: Settings & Day Types (1 story, 3 SP)

**Goal:** User can configure Day Types, work hours, and day start time.

**Dependencies:** INF

---

### E6-2: Day Types Configuration
**SP: 3 | Priority: P0 | Sprint: 3**

Day Types settings with Work/Light/Off and work hours configuration.

**AC:**
- Day Types: Work (full), Light (50%), Off (habits only)
- Off days: weekly schedule (default: Fri+Sat, editable)
- Work hours: start/end time (default: 9:00-17:00)
- Day start: default 4:00 AM, range 1:00-6:00
- Manual day type override for any specific day
- Settings stored in `users.settings` JSONB
- Theme toggle (dark/light)

---

## Epic E12: Daily Capacity (1 story, 3 SP)

**Goal:** Backend calculation of daily capacity from settings.

**Dependencies:** E6-2

---

### E12-1: Daily Capacity Calculation
**SP: 3 | Priority: P0 | Sprint: 3**

Auto-calculate daily capacity from one-time settings.

**AC:**
- Formula: `(end_work - start_work - breaks) × 80%`
- Light Day: × 50%. Off Day: capacity = 0
- Warning when Time Blocks > capacity (soft, non-blocking)
- Suggestion when Time Blocks < 30% capacity
- No daily questions — calculated from settings
- `domain/capacity.ts`: calculateDailyCapacity()

---

## Epic HOME: Home Screen (2 stories, 8 SP)

**Goal:** Adaptive home screen with morning greeting and daily overview.

**Dependencies:** E2, E3, E4

---

### HOME-1: Adaptive Morning Greeting
**SP: 5 | Priority: P0 | Sprint: 3**

Context-aware morning greeting handling 3 scenarios.

**AC:**
- **Has tasks:** "صباح الخير [اسم]. عندك [N] مهام و[N] عادات اليوم." + first task prominent + progress bar + goal progress
- **No tasks (has goals):** "صباح الخير. عندك [N] عادات اليوم." + suggestion: "هدفك [X] يحتاج اهتمام. أضف مهمة؟"
- **New user:** "صباح الخير! ابدأ بمهمتك الأولى:" + one task + habits
- Daily Summary Toast on first open: "أمس: X مهام ✅ | Y عادات ✅ | Z نقطة"
- Toast auto-dismisses after 3 seconds or on tap

---

### HOME-2: Home Screen Layout Assembly
**SP: 3 | Priority: P1 | Sprint: 3**

Assemble all home screen components into one cohesive view.

**AC:**
- Section 1: Adaptive greeting (HOME-1)
- Section 2: Today's tasks (sorted, with Quick Add)
- Section 3: Habits section (Boolean + Counter + MVD indicator)
- Section 4: Backlog ribbon (if any)
- Section 5: Daily progress bar
- Quick Add accessible from home screen
- All sections have empty/loading/error states

---

## Epic ONB: Onboarding (3 stories, 9 SP)

**Goal:** New user completes 3-step onboarding wizard in ≤ 5 minutes.

**Dependencies:** E1-2, E3-2, E6-2

---

### ONB-1: Onboarding Wizard — Step 1 (Goal)
**SP: 3 | Priority: P0 | Sprint: 4**

First step: Goal vs Habit dialog + create first goal.

**AC:**
- Goal vs Habit Clarity Dialog: two cards with examples
- "ابدأ بهدف واحد. واحد بس."
- SMART wizard for first goal (same as E1-2)
- Skip not allowed — user must create one goal

---

### ONB-2: Onboarding Wizard — Step 2 (Habits + MVD)
**SP: 3 | Priority: P0 | Sprint: 4**

Second step: Choose habits from library with MVD setup.

**AC:**
- Suggested habits library (chips): health, education, relationships
- Tap to select, tap again to deselect
- For each selected habit: "ما الحد الأدنى في أصعب يوم؟" (MVD setup)
- Skip allowed (0 habits)
- No religious habits in MVP library

---

### ONB-3: Onboarding Wizard — Step 3 (Settings + First Task)
**SP: 3 | Priority: P0 | Sprint: 4**

Third step: Quick settings + create first task.

**AC:**
- Work hours: [9:00] to [17:00] (defaults, editable)
- Days off: [✅ الجمعة] [✅ السبت] (defaults, editable)
- "إنشاء أول مهمة لليوم": pre-filled with goal link
- On completion: "🎉 مرحبًا [اسم]! ابدأ بواحدة. واحدة بس."
- `onboarding_completed` flag set to true
- User redirected to Home screen

---

## Epic POL: System States & Polish (4 stories, 11 SP)

**Goal:** Every screen has proper empty, loading, error, and confirmation states.

**Dependencies:** All previous epics

---

### POL-1: Empty States for Every Screen
**SP: 3 | Priority: P0 | Sprint: 4**

Illustration + CTA for every empty screen.

**AC:**
- Goals empty: "حدد أول هدف لك" + [أنشئ هدف]
- Tasks empty: "لا مهام اليوم. هدفك [X] يحتاج مهمة!" + [أضف مهمة]
- Habits empty: "أضف عادتك الأولى" + [إضافة عادة]
- Home empty (no goals/tasks/habits): "ابدأ بهدف واحد" + [ابدأ الآن]
- Each empty state has relevant illustration + single clear CTA

---

### POL-2: Loading Skeletons for Every Data Area
**SP: 3 | Priority: P0 | Sprint: 4**

Skeleton loading states matching final layout.

**AC:**
- Goal cards skeleton (3 placeholder cards)
- Task list skeleton (4-5 placeholder rows)
- Habits skeleton (3-4 placeholder rows)
- Home screen skeleton
- Skeleton uses shimmer animation (1500ms)
- Respects `prefers-reduced-motion`

---

### POL-3: Error Toasts with Retry
**SP: 3 | Priority: P1 | Sprint: 4**

Error handling with retry for all failed actions.

**AC:**
- Validation errors: field-level error messages
- DB failures: "فشل الحفظ. [حاول مرة أخرى]"
- Network offline: persistent banner "لا يوجد اتصال"
- Server errors: "حدث خطأ. [حاول مرة أخرى]"
- Auto-retry (3×) before showing error
- All error messages lead with positive framing

---

### POL-4: Confirmation Dialogs
**SP: 2 | Priority: P1 | Sprint: 4**

Confirmation before every destructive action.

**AC:**
- Shadcn AlertDialog before: delete goal, delete task, delete habit, postpone task, log relapse
- Goal deletion requires reason (quick-select + free text)
- Cancel always available
- Dialog text is clear and non-threatening
- No Undo/Redo — confirmation prevents mistakes

---

## 5. FR Coverage Map (MVP)

| PRD FR | Epic | Story |
|---|---|---|
| FR1, FR1.1, FR2, FR3, FR4, FR11 | E1 | E1-2 |
| FR5, FR6, FR6.2, FR6.3, FR7, FR9, FR10 | E1 | E1-1, E1-3, E1-4 |
| FR6.1 | E1 | E1-5 (integrated in E2-3) |
| FR11.2, FR11.3 | E1 | E1-4 |
| FR12, FR12.1, FR12.2, FR12.3, FR13-16 | E2 | E2-2 |
| FR17-21 (Checklist) | E2 | E2-2 |
| FR26, FR26.1, FR26.2, FR26.3, FR27-28 | E2 | E2-3 |
| FR29, FR30, FR31, FR31.1 | E2 | E2-4 |
| FR32-33 | E2 | E2-4 |
| FR34, FR34.1, FR35, FR36, FR36.1, FR37 | E3 | E3-2 |
| FR41, FR42, FR42.1, FR43 | E3 | E3-3 |
| FR44, FR45 | E4 | E4-1 |
| FR46, FR47 | E4 | E4-3 |
| FR53, FR55, FR55.1-3 | E6 | E6-2 |
| FR60 | HOME | HOME-1 |
| FR83, FR83.1-3 | E12 | E12-1 |
| FR84, FR84.1 | HOME | HOME-1 |
| FR90 | E2 | E2-4 (browser notifications) |
