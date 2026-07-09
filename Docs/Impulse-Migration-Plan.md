# Hadaf (هدف) — Migration Plan from Impulse

> **Status**: ✅ APPROVED — All decisions resolved
> **Timeline**: 5 working days, 5 developers (matches `team-task-assignments.md`)
> **Source**: Impulse (React 19 + Vite + Tailwind v4 + Zustand)
> **Target**: Hadaf — **client stack imported from Impulse**; **backend stack as already documented in `Architecture.md`** (Express + MongoDB/Mongoose — this plan does not change the backend)
> **Supersedes**: nothing — this is the canonical record of the stack decision. `Docs/project-context.md`, `Docs/Architecture.md`, `Docs/Epics.md`, and the team-task docs are patched to match this plan (see §"Docs Updated" at the bottom).

---

## Stack Split (read this first)

This migration reuses Impulse for **the client only**. The backend is **not** touched — it follows `Docs/Architecture.md` §3 as already written (Express, MongoDB, Mongoose, `jsonwebtoken`, `bcryptjs`, Zod, Vitest). Nothing here overrides the schema, auth flow, or API contract already documented there.

| Layer | Source | Notes |
|---|---|---|
| Client framework | **Impulse** → Vite 7 + React 19 + React Router 7 | Not Next.js. Replaces the stale App Router references in older docs. |
| Client data fetching | **Impulse** → TanStack React Query v5 | Replaces the stale SWR references in older docs. |
| Client local/UI state | **Impulse** → Zustand 5 (auth, UI, date) + React Context (DayType, Locale, Theme) | |
| Client styling | **Impulse** → Tailwind v4 (CVA-based `ui/` components) | Palette re-tokenized for Hadaf, see Decision 3. |
| Backend framework | **`Architecture.md` §3.3, unchanged** → Express (MVC: routes → controllers → models) | |
| Backend DB | **`Architecture.md` §3.1, unchanged** → MongoDB + Mongoose, 8 collections | |
| Backend auth | **`Architecture.md` §3.2, unchanged** → JWT (`jsonwebtoken`) + `bcryptjs`, httpOnly cookies, refresh rotation | |
| Backend business logic | **`Architecture.md` §6, unchanged** → pure JS utils in `server/src/utils/` | |

---

## Settled Decisions

| # | Decision | Resolution |
|---|----------|------------|
| 1 | **Client Framework** | **Vite + React Router** (Impulse as-is; easier approach, matches team experience) |
| 2 | **Client Data Fetching** | **Keep React Query** (TanStack React Query v5, already wired in Impulse) — this is the client-side counterpart to the server's documented Express/Mongoose API, not a replacement for anything on the backend |
| 3 | **Colors** | **Seed from Impulse's Violet OKLCH tokens.** `hadaf/client/DESIGN.md` is authored Day 1 (Khaled) starting from these tokens and becomes the sole design authority from that point forward — refine freely during the build once it exists |
| 4 | **Victory Dialog** | **Keep but redesign** — remove cartoon trophy/confetti, make it mature and elegant. Keep the score-breakdown concept. Align naming with the product docs: the completion micro-feedback is the **Contribution Pulse** (text/CSS fade), and the redesigned dialog is its expanded form — not a new "victory" concept and not a departure from the no-mascot/no-confetti voice guardrail in `project-context.md` |
| 5 | **Islamic Quote** | **Keep** — it's a motivational/wisdom section, distinct from a prayer app |

---

## Architecture Overview

```
NHA-4-225/
├── Docs/                          # All existing planning docs (PRD, Architecture, Epics, UX, etc.)
├── hadaf/
│   ├── client/                    # Frontend — Adapted from Impulse
│   │   ├── public/
│   │   │   ├── fonts/             # Tajawal + IBM Plex Sans
│   │   │   └── illustrations/    # Empty state SVGs, onboarding assets
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.tsx        # Root: ErrorBoundary → AppProviders → AppRouter
│   │   │   │   ├── providers.tsx  # QueryClient, BrowserRouter, Toaster, ThemeProvider, LocaleProvider, DayTypeProvider
│   │   │   │   └── router.tsx    # Routes with lazy loading, RequireAuth, RedirectIfAuth
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── ui/           # ← FROM IMPULSE: Button, Card, Input, Skeleton, LazyImage (CVA-based)
│   │   │   │   │                 #   + ADD: shadcn AlertDialog, Sheet, Tabs, DropdownMenu, Progress, Tooltip
│   │   │   │   ├── shared/       # ← FROM IMPULSE: ErrorBoundary
│   │   │   │   └── layouts/      # ← ADAPTED FROM IMPULSE: AppLayout, Header, Sidebar
│   │   │   │                     #   + ADD: BottomNav (mobile), adapt Sidebar for RTL
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── auth/         # ← ADAPTED FROM IMPULSE
│   │   │   │   │   ├── api/      # Rewire to Express endpoints
│   │   │   │   │   ├── pages/    # LoginPage (sliding dual-panel — keep)
│   │   │   │   │   ├── stores/   # useAuthStore (Zustand persist — keep)
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   ├── goals/        # [NEW BUILD]
│   │   │   │   │   ├── api/      # Goals + Milestones CRUD
│   │   │   │   │   ├── components/  # GoalWizard (3-step SMART), GoalCard, GoalDetail
│   │   │   │   │   │               # 12WeekBar, SVGRing, HealthDot, MilestoneList
│   │   │   │   │   ├── hooks/    # useGoals, useCreateGoal, useMilestones
│   │   │   │   │   ├── pages/    # GoalDashboardPage, GoalDetailPage
│   │   │   │   │   ├── types/
│   │   │   │   │   └── utils/    # goalProgress.ts, goalHealth.ts
│   │   │   │   │
│   │   │   │   ├── tasks/        # ← ADAPTED FROM IMPULSE
│   │   │   │   │   ├── api/      # Rewire to Express, remove Spring Boot transforms
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── TaskFormModal.tsx      # ADAPT: remove Big Task, add auto-type detection,
│   │   │   │   │   │   │                          #   goal linking, difficulty, checklist, points preview
│   │   │   │   │   │   ├── TaskItem.tsx           # ADAPT: new task types (Quick/Flexible/Scheduled)
│   │   │   │   │   │   ├── TaskCompletionModal.tsx # ADAPT: new scoring formulas + Contribution Pulse
│   │   │   │   │   │   ├── VictoryOverlay.tsx     # REDESIGN: elegant, no cartoon, keep score breakdown
│   │   │   │   │   │   ├── BacklogRibbon.tsx      # [NEW]
│   │   │   │   │   │   └── form/                  # ADAPT: remove Big Task forms, add new fields
│   │   │   │   │   ├── hooks/    # useTasks (adapted)
│   │   │   │   │   ├── pages/    # TasksPage (adapted + backlog)
│   │   │   │   │   └── utils/    # scoringUtils.ts (REWRITE with Hadaf formulas)
│   │   │   │   │
│   │   │   │   ├── habits/       # [NEW BUILD]
│   │   │   │   │   ├── api/
│   │   │   │   │   ├── components/  # HabitCard (Boolean/Counter/Quit), MVDIndicator,
│   │   │   │   │   │               # SuggestedHabitsLibrary, RelapseLogger
│   │   │   │   │   ├── hooks/
│   │   │   │   │   ├── pages/    # HabitsPage
│   │   │   │   │   └── types/
│   │   │   │   │
│   │   │   │   ├── scoring/      # [NEW BUILD]
│   │   │   │   │   ├── components/  # ProgressBar (adapted from HeaderProgressBar),
│   │   │   │   │   │               # DayStateBadge, ContributionPulse, CapacityGauge
│   │   │   │   │   ├── hooks/
│   │   │   │   │   └── utils/    # dayState.ts, adaptiveTarget.ts, capacity.ts
│   │   │   │   │
│   │   │   │   ├── home/         # [NEW BUILD]
│   │   │   │   │   ├── components/  # AdaptiveGreeting, DailySummaryToast,
│   │   │   │   │   │               # TasksSection, HabitsSection, BacklogSection
│   │   │   │   │   └── pages/    # HomePage
│   │   │   │   │
│   │   │   │   ├── onboarding/   # [NEW BUILD]
│   │   │   │   │   ├── components/  # Step1Goal, Step2HabitsMVD, Step3SettingsTask
│   │   │   │   │   └── pages/    # OnboardingPage (3-step wizard)
│   │   │   │   │
│   │   │   │   ├── settings/     # [NEW BUILD]
│   │   │   │   │   ├── components/  # DayTypeSelector, WorkHoursPicker, DayStartPicker,
│   │   │   │   │   │               # ThemeToggle (adapted), LanguageToggle
│   │   │   │   │   └── pages/    # SettingsPage
│   │   │   │   │
│   │   │   │   └── dashboard/    # ← ADAPTED FROM IMPULSE (overview/analytics)
│   │   │   │       ├── api/
│   │   │   │       └── pages/
│   │   │   │
│   │   │   ├── i18n/             # [NEW BUILD]
│   │   │   │   ├── ar.ts         # Arabic dictionary (default)
│   │   │   │   ├── en.ts         # English dictionary
│   │   │   │   └── index.ts      # useTranslation hook, LocaleProvider
│   │   │   │
│   │   │   ├── providers/        # [NEW BUILD]
│   │   │   │   ├── ThemeProvider.tsx    # ← adapted from Impulse's localStorage toggle
│   │   │   │   ├── LocaleProvider.tsx   # [NEW] cookie-based, AR default
│   │   │   │   └── DayTypeProvider.tsx  # [NEW] Work/Light/Off context
│   │   │   │
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts       # ← ADAPTED: fix merge conflicts, point to Express
│   │   │   │   ├── react-query.ts      # ← FROM IMPULSE: keep as-is
│   │   │   │   └── mock-server.ts      # ← FROM IMPULSE: adapt for Hadaf endpoints (optional)
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── useUIStore.ts       # ← FROM IMPULSE: extend for Hadaf modals
│   │   │   │   └── useDateStore.tsx    # ← FROM IMPULSE: keep as-is
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── cn.ts               # ← FROM IMPULSE: clsx + tailwind-merge
│   │   │       ├── errorHandler.ts     # ← FROM IMPULSE: keep
│   │   │       └── rateLimiter.ts      # ← FROM IMPULSE: keep
│   │   │
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.js          # Updated: OKLCH colors, Tajawal+IBM Plex, logical properties
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── DESIGN.md                   # [NEW] Design system authority — authored Day 1, seeded from Impulse Violet
│   │
│   └── server/                         # Express/MongoDB backend — per Architecture.md §3, unchanged by this plan
│       ├── src/
│       │   ├── config/
│       │   │   └── db.js              # Mongoose connection
│       │   ├── models/                # 8 Mongoose models
│       │   │   ├── User.js
│       │   │   ├── Goal.js
│       │   │   ├── Milestone.js
│       │   │   ├── Task.js
│       │   │   ├── Habit.js
│       │   │   ├── HabitLog.js
│       │   │   ├── DailySummary.js
│       │   │   └── AnalyticsEvent.js
│       │   ├── controllers/
│       │   │   ├── authController.js
│       │   │   ├── goalController.js
│       │   │   ├── taskController.js
│       │   │   ├── habitController.js
│       │   │   ├── scoringController.js
│       │   │   └── settingsController.js
│       │   ├── routes/
│       │   │   ├── authRoutes.js
│       │   │   ├── goalRoutes.js
│       │   │   ├── taskRoutes.js
│       │   │   ├── habitRoutes.js
│       │   │   └── settingsRoutes.js
│       │   ├── middleware/
│       │   │   ├── auth.js            # JWT verification
│       │   │   ├── rateLimiter.js     # In-memory rate limiting (100 req/min)
│       │   │   └── errorHandler.js    # Global error handler (11000, ValidationError)
│       │   ├── utils/                 # Pure business logic (testable)
│       │   │   ├── scoring.js         # calculateTaskPoints, calculateHabitPoints, predictTaskPoints
│       │   │   ├── goalProgress.js    # calculateHybridProgress, calculateGoalHealth
│       │   │   ├── capacity.js        # calculateDailyCapacity, calculatePlannedTime
│       │   │   ├── dayState.js        # calculateDayState, calculateAdaptiveDailyTarget
│       │   │   └── taskType.js        # detectTaskType, calculateBlockDuration
│       │   └── server.js              # Express bootstrap
│       ├── package.json
│       └── .env
│
├── CLAUDE.md                           # AI agent rules (update with settled decisions)
└── README.md
```

---

## Routing Map

| Path | Component | Auth | Layout |
|------|-----------|------|--------|
| `/login` | LoginPage | RedirectIfAuth | Standalone |
| `/onboarding` | OnboardingPage | RequireAuth | Standalone |
| `/` | HomePage | RequireAuth | AppLayout |
| `/goals` | GoalDashboardPage | RequireAuth | AppLayout |
| `/goals/:id` | GoalDetailPage | RequireAuth | AppLayout |
| `/tasks` | TasksPage | RequireAuth | AppLayout |
| `/habits` | HabitsPage | RequireAuth | AppLayout |
| `/settings` | SettingsPage | RequireAuth | AppLayout |

**Navigation:**
- Mobile (<768px): Bottom Nav → 🏠 Home | 🎯 Goals | ✅ Habits | ⋯ More
- Desktop (>1024px): Sidebar on RIGHT side (logical positioning, automatically flips for RTL)
- Sidebar items: Home, Goals, Habits, Overview, Settings + Islamic Quote + Daily Summary widget + Sign Out
- **Quick Add is Home-screen only** (per `Architecture.md` §0.1 constraint) — no FAB on other screens

---

## Component Reuse Map (Impulse → Hadaf)

### ✅ Direct Reuse (copy, minimal changes)

| Impulse Component | Hadaf Location | Changes Needed |
|-------------------|---------------|----------------|
| `shared/components/ui/Button.tsx` | `components/ui/Button.tsx` | Update brand color tokens only |
| `shared/components/ui/Card.tsx` | `components/ui/Card.tsx` | Update brand color tokens only |
| `shared/components/ui/Input.tsx` | `components/ui/Input.tsx` | Add RTL support for icons |
| `shared/components/ui/Skeleton.tsx` | `components/ui/Skeleton.tsx` | No changes |
| `shared/components/ui/LazyImage.tsx` | `components/ui/LazyImage.tsx` | No changes |
| `shared/components/ErrorBoundary.tsx` | `components/shared/ErrorBoundary.tsx` | No changes |
| `shared/utils/cn.ts` | `utils/cn.ts` | No changes |
| `shared/utils/errorHandler.ts` | `utils/errorHandler.ts` | Bilingual error messages |
| `shared/utils/rateLimiter.ts` | `utils/rateLimiter.ts` | No changes |
| `shared/lib/react-query.ts` | `lib/react-query.ts` | No changes |
| `shared/stores/useDateStore.tsx` | `stores/useDateStore.tsx` | No changes |
| `shared/constants/queryKeys.ts` | Add new keys for goals, habits, scoring | Extend |

### 🟡 Adapt (significant modifications)

| Impulse Component | Changes |
|-------------------|---------|
| `shared/components/layout/AppLayout.tsx` | Add BottomNav for mobile, adapt for RTL logical properties |
| `shared/components/layout/Header.tsx` | Add Day Type badge, language toggle. Remove clock or make smaller. (Add Task stays on Home, not a Header FAB.) |
| `shared/components/layout/header/HeaderProgressBar.tsx` | Map 5 color tiers to Day States with labels (Low/Good Enough/Perfect/Amazing/Legendary) |
| `shared/components/layout/header/HeaderContent.tsx` | Add language toggle, Day Type indicator |
| `shared/components/layout/Sidebar.tsx` | Convert all physical→logical CSS. Keep Islamic quote. Keep Daily Summary widget. Add nav items (Home, Goals, Habits, Settings) |
| `features/auth/pages/LoginPage.tsx` | Bilingual labels, RTL layout, point to Express API |
| `features/auth/stores/useAuthStore.ts` | Add refresh token rotation, update JWT decode |
| `features/auth/api/authApi.ts` | **RESOLVE MERGE CONFLICTS FIRST.** Rewire to Express endpoints |
| `shared/lib/api-client.ts` | **RESOLVE MERGE CONFLICTS FIRST.** Point to Express, add CSRF header, credentials: true |
| `features/tasks/components/TaskFormModal.tsx` | Remove Big Task type. Add: auto-type detection, goal dropdown, difficulty (Easy/Medium/Hard), checklist, points preview |
| `features/tasks/components/TaskItem.tsx` | New task type badges (Quick/Flexible/Scheduled), goal link indicator |
| `features/tasks/components/completion/VictoryOverlay.tsx` | **REDESIGN**: Remove trophy cartoon. Keep score breakdown. Make elegant (subtle animation, clean typography, brand gradient background). Add Contribution Pulse text. |
| `features/tasks/components/TaskCompletionModal.tsx` | New scoring formulas (duration×difficulty×accuracy×streak), Smart/Manual/Quick completion flows |
| `features/tasks/pages/TasksPage.tsx` | Add backlog ribbon, browser notifications, remove Big Task grid logic |
| `features/tasks/utils/scoringUtils.ts` | **REWRITE** with Hadaf formulas — see PRD §scoring |
| `features/tasks/hooks/useTasks.ts` | Adapt for new API shape, fix @ts-ignore suppresions |
| `shared/stores/useUIStore.ts` | Extend for new modals (goal wizard, habit creation, onboarding) |
| `shared/lib/mock-server.ts` | Optional: adapt for Hadaf's API shape if keeping mock mode |

### 🔴 New Build (no Impulse equivalent)

| Feature | Components to Build |
|---------|-------------------|
| **Goals (E1)** | GoalWizard (3-step SMART), GoalCard, GoalDetail, 12WeekBar, SVGProgressRing, HealthDot, MilestoneList, ManualOverrideSlider, GoalCategorySelector (5 categories per `Architecture.md` §3.1: `education_work`/`family`/`health`/`religion_spirituality`/`other`) |
| **Habits (E3)** | HabitCard, BooleanHabit, CounterHabit, QuitHabit, MVDIndicator, MVDToggle, SuggestedHabitsChips, RelapseLogger, HabitFrequencySelector |
| **Home Screen (HOME)** | AdaptiveGreeting (3 scenarios), TasksSection, HabitsSection, BacklogRibbon, ProgressBarAssembly, DailySummaryToast |
| **Scoring (E4)** | DayStateBadge, ContributionPulse (text CSS fade), CapacityGauge (visual), OverloadWarning, AdaptiveDailyTarget |
| **Settings (E4-1)** | DayTypeSchedule (Work/Light/Off per weekday), WorkHoursPicker, DayStartPicker, ThemeSelector, LanguageSelector, NotificationToggle |
| **Onboarding (ONB)** | GoalVsHabitDialog, OnboardingStep1Goal, OnboardingStep2HabitsMVD, OnboardingStep3SettingsTask, ProgressIndicator |
| **i18n System** | LocaleProvider, useTranslation hook, AR dictionary, EN dictionary, locale-aware date/number formatting |
| **DayType System** | DayTypeProvider, DayTypeContext, UI adaptation logic (Work=full, Light=50%, Off=habits only) |
| **Polish (POL)** | EmptyState (per screen with illustration+CTA), LoadingSkeletons (per screen), ErrorToastWithRetry, ConfirmationDialog (with deletion reason) |
| **Bottom Nav** | BottomNav component (4 items: Home, Goals, Habits, More) |
| **Entire Backend** | Express server, 8 Mongoose models, all controllers/routes/middleware/utils — per `Architecture.md` §3/§5/§6, unchanged by this plan |

---

## RTL Conversion Checklist

> [!CAUTION]
> This is the single highest-risk task. Every Impulse component uses physical CSS properties that break in RTL.

### Find-and-Replace Rules (across ALL `.tsx` and `.css` files)

| Physical (Impulse) | Logical (Hadaf) |
|--------------------|-----------------|
| `ml-` | `ms-` |
| `mr-` | `me-` |
| `pl-` | `ps-` |
| `pr-` | `pe-` |
| `left-` | `start-` |
| `right-` | `end-` |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `border-l` | `border-s` |
| `border-r` | `border-e` |
| `rounded-l` | `rounded-s` |
| `rounded-r` | `rounded-e` |
| `-translate-x-full` | `-translate-x-full` (keep — but wrap in RTL-aware logic) |
| `float-left` | `float-start` |
| `float-right` | `float-end` |

### Sidebar-Specific RTL Changes
```
BEFORE (Impulse):
  fixed left-0 → fixed start-0 (or use logical inset-inline-start)
  -translate-x-full → need RTL flip
  border-r → border-e

AFTER (Hadaf):
  Sidebar positions itself using logical properties
  Automatically appears on RIGHT in RTL, LEFT in LTR
```

### HTML Root
```html
<!-- Arabic (default) -->
<html lang="ar" dir="rtl">

<!-- English -->
<html lang="en" dir="ltr">
```

---

## Scoring Formulas (Hadaf — per `Architecture.md` §6, client mirrors server exactly)

### Task Points
```
points = (actual_duration_min / 10) × difficulty_multiplier × accuracy_bonus × streak_bonus

Difficulty: Easy=1.0, Medium=1.2, Hard=1.4
Accuracy: ±15min of planned = ×1.15
Streak: ×1.05/day, capped at ×1.5
Quick tasks: always 2 points flat
Time cap: actual capped at 3× planned
```

### Habit Points
```
Boolean: Full=5, MVD=3
Counter: Full=5, Partial(≥50%)=4, MVD=3
Quit: always 0 points
```

### Goal Progress (Hybrid)
```
progress = (completed_tasks/total_tasks × 60%) + (completed_milestones/total_milestones × 40%)
```

### Goal Health
```
health = (actual_progress / expected_progress_by_week) × 100
🟢 ≥85%  |  🟡 70-84%  |  🟠 50-69%  |  🔴 <50%
```

### Daily Capacity
```
capacity = (work_end - work_start - breaks) × 80%
Light Day: capacity × 50%
Off Day: 0 (habits only)
```

### Day States
```
≥150% → Legendary (Gold)
≥120% → Amazing (Green)
≥100% → Perfect (Blue)
≥50%  → Good Enough (Amber) ← celebrate this!
<50%  → Low (Red)
```

---

## 5-Day Team Schedule

This is the migration-execution view of `Docs/team-task-assignments.md`'s 5-day / 25-story schedule — same people, same days, framed around the Impulse-copy + new-build work involved in each story.

### Day 1: Foundation

| Person | Task | Deliverables |
|--------|------|-------------|
| **Mustafa** | Project scaffold + Auth | Copy Impulse → hadaf/client/. Resolve 3 merge conflicts (`authApi.ts`, `taskApi.ts`, `api-client.ts`). Rebrand Impulse→Hadaf. Rewire auth API to Express endpoints. Refresh token rotation. |
| **Ziad** | Backend foundation | Express server setup. MongoDB connection. All 8 Mongoose models. Auth routes (register, login, refresh, logout). CORS + CSRF middleware. |
| **Hamza** | RTL + i18n conversion | Convert ALL physical→logical CSS in every component. Set up `<html lang="ar" dir="rtl">`. Create LocaleProvider + AR/EN dictionaries. Wire language toggle. |
| **Khaled** | Design system | Create `DESIGN.md`, seeded from Impulse's Violet OKLCH tokens. Convert tailwind.config to OKLCH tokens. Install Tajawal+IBM Plex fonts. Update index.css. Test both themes. |
| **Mohamed** | App shell + Bottom Nav | Build BottomNav component. Update Sidebar nav items (Home, Goals, Habits, Settings). Prepare Settings page skeleton. Study remaining docs. |

### Day 2: Core Features Begin

| Person | Task | Deliverables |
|--------|------|-------------|
| **Mustafa** | Goal Wizard (E1-1) | Goals + Milestones API hooks. 3-step SMART wizard UI. GoalCard component. 5-goal limit. Hybrid progress formula. 5-category selector (per `Architecture.md` §3.1 enum). |
| **Ziad** | Habits backend + App Shell | Habits + HabitLogs controllers/routes. Boolean/Counter/Quit logic. App Shell refinement (E0-6). Language toggle wiring. |
| **Hamza** | Day Types & Settings (E4-1) | DayTypeProvider context. Work/Light/Off selector per weekday. Work hours picker. Day start picker (01:00-06:00). Theme toggle. Notification preferences. |
| **Khaled** | Task Engine adaptation (E2-1) | Remove Big Task from TaskFormModal. Add auto-type detection logic. Add goal linking dropdown. Add difficulty selector (Easy/Medium/Hard). Add checklist. Add live points preview. Quick Add sheet (Home screen only). |
| **Mohamed** | Task List adaptation (E2-3) | Task list with new task types. Backlog ribbon. Sort logic (done→priority→type→startTime). Browser notification setup (5-min before time block). |

### Day 3: Core Product Loop

| Person | Task | Deliverables |
|--------|------|-------------|
| **Mustafa** | Task Completion (E2-2) | New scoring formula integration. Smart Complete (auto-log if ±15min). Manual Complete (slider). Quick Complete (one tap, 2pts). Contribution Pulse CSS fade. |
| **Ziad** | Habits UI (E3-1 + E3-2) | HabitsPage. BooleanHabit (✅/☐). CounterHabit ([+]/[-]). QuitHabit (auto-counter + relapse log). MVD indicator. Suggested habits library (no religious). |
| **Hamza** | Goal Dashboard (E1-2) | 12-week bar (12 segments, current highlighted). Goal cards grid (SVG ring + health dot). Weekly Execution Score. Goal detail page (milestones, linked tasks, manual override slider). |
| **Khaled** | Daily Capacity (E4-2) | calculateDailyCapacity formula. Visual gauge on Home. Overload warning ribbon. <30% suggestion ("consider moving tasks to backlog"). |
| **Mohamed** | Scoring Engine (E4-3) | DailySummaries API. Adapt HeaderProgressBar to show Day State labels. 5 Day States with correct colors. Good Enough badge. Adaptive daily target calculation. |

### Day 4: Home + Onboarding

| Person | Task | Deliverables |
|--------|------|-------------|
| **Mustafa** | Integration + bug fixes | Cross-feature API consistency. Fix broken flows. End-to-end test: register → onboard → create goal → add task → complete → see progress. |
| **Ziad** | Scoring backend + analytics | Wire scoring utils to task/habit completion. Daily summary auto-calculation. Analytics events (login, register, task_created, task_complete, habit_logged, goal_created, onboarding_complete). |
| **Hamza** | Home Screen (HOME-1 + HOME-2) | Adaptive morning greeting (3 scenarios). Today's tasks section. Habits section (Build then Quit). Backlog ribbon. Progress bar assembly. Daily Summary Toast (first open). |
| **Khaled** | Onboarding (ONB-1 + ONB-2) | Goal vs Habit dialog. Step 1: SMART goal wizard (non-skippable). Step 2: Suggested habits + MVD setup. |
| **Mohamed** | Onboarding (ONB-3) + Empty States (POL-1) | Step 3: Work hours + days off + first task + onboarding_completed flag. Empty state illustrations + CTA + positive message for every screen (Home, Goals, Tasks, Habits). |

### Day 5: Polish + Deploy

| Person | Task | Deliverables |
|--------|------|-------------|
| **Mustafa** | Final integration + deploy | **Client** → production deployment to Vercel/Netlify. **Server** → deployment to a persistent Node host (Render/Railway, default recommendation — confirm with team). CORS configuration for production URLs on both sides. Environment variables. Smoke test all features. |
| **Ziad** | Backend hardening | Rate limiting (100 req/min). Error handler (11000, ValidationError). Input validation (Zod on controllers). Backend unit tests for scoring/capacity utils. |
| **Hamza** | Loading Skeletons (POL-2) | Shimmer skeleton per screen (1500ms). prefers-reduced-motion support. Backend cold-start handling (loading state while the Node host wakes). |
| **Khaled** | Error Toasts (POL-3) + Victory Redesign | Validation error toasts. DB error toasts. Network offline banner with retry. Redesign VictoryOverlay: elegant, no cartoon, clean typography, brand gradient, score breakdown, Contribution Pulse text. |
| **Mohamed** | Confirmation Dialogs (POL-4) | AlertDialog for all destructive actions. Goal delete requires reason (dropdown + optional text). Task delete confirmation. No Undo (by design). |

---

## Database Schema Quick Reference (8 Collections)

Unchanged from `Architecture.md` §3.1 — reproduced here for quick reference only. `Architecture.md` is authoritative if these ever diverge.

| Collection | Key Fields | Indexes |
|-----------|------------|---------|
| **Users** | email, passwordHash, refreshToken, refreshTokenExp, onboardingCompleted, settings {work_hours_start, work_hours_end, day_start, off_days[], theme, language, notifications} | email (unique) |
| **Goals** | userId, title, description, category (`education_work`/`family`/`health`/`religion_spirituality`/`other`), customCategory, measure, relevance, cycleStart, cycleEnd, manualProgress, status (active/completed/archived/replaced), deletionReason | userId |
| **Milestones** | goalId, title, sort_order, is_completed, completed_at | goalId |
| **Tasks** | userId, goalId?, title, description, type (scheduled/flexible/quick), difficulty (easy/medium/hard), priority, date (YYYY-MM-DD), timeBlockStart, timeBlockEnd, plannedDurationMinutes, actualDurationMinutes, checklist [{title, is_completed}], status, pointsEarned, completedAt | userId+date |
| **Habits** | userId, title, category, type (boolean/counter/quit), frequency, targetValue, mvdValue, mvdDescription, isSpiritual, isArchived | userId |
| **HabitLogs** | habitId, date, value, isMvd, isRelapse | habitId+date (unique) |
| **DailySummaries** | userId, date, dayType, tasksCompleted, habitsCompleted, pointsEarned, dailyTarget, dayState, summaryShown | userId+date (unique) |
| **AnalyticsEvents** | userId, eventType, eventData (Map), createdAt | userId+createdAt |

---

## Auth Flow (Express Backend — per `Architecture.md` §3.2, unchanged)

```
Register: POST /api/auth/register
  → bcryptjs hash (cost 10) → create User → generate access JWT (15min) + refresh JWT (7 days)
  → set refresh token as httpOnly cookie (sameSite: 'none', secure: true)
  → return { accessToken, user }

Login: POST /api/auth/login
  → validate email/password → bcryptjs compare → same token flow as register

Refresh: POST /api/auth/refresh
  → read httpOnly cookie → verify → rotate refresh token (old → new)
  → detect token reuse → invalidate all sessions if reuse detected

Logout: POST /api/auth/logout
  → clear refresh token from DB + clear cookie

Protected Routes:
  → Authorization: Bearer <accessToken>
  → X-Requested-With: XMLHttpRequest (CSRF protection)
  → CORS: origin = FRONTEND_URL, credentials: true
```

---

## Non-Negotiable Rules (from `Docs/project-context.md`)

1. **Color**: Only OKLCH tokens. Never raw hex. WCAG contrast ≥4.5:1.
2. **RTL**: Arabic default. Tailwind logical properties ONLY. Never `ml-`/`mr-`/`left-`/`right-`.
3. **Strings**: All user-visible text from i18n dictionaries. Both AR and EN.
4. **Dates/Numbers**: Locale-aware formatting.
5. **Motion**: CSS transitions only. **Framer Motion is BANNED.**
6. **Voice**: Accomplishment-first. "أنجزت ٥ من ٨" not "لم تكمل ٣ مهام". No mascots, confetti, badges, or gamification cartoon language — this constrains the VictoryOverlay redesign in Decision 4.
7. **Shadows**: Flat by default. Shadow only on floating elements.
8. **Touch targets**: ≥44×44px on all interactive elements.
9. **Progress bars**: Fill right-to-left in RTL.

---

## Files with Merge Conflicts to Resolve First

These 3 Impulse files have unresolved `<<<<<<< HEAD` / `>>>>>>>` markers (verified present as of this plan):

1. `src/features/auth/api/authApi.ts` — resolve toward Express backend endpoints
2. `src/features/tasks/api/taskApi.ts` — resolve toward Express backend endpoints
3. `src/shared/lib/api-client.ts` — resolve toward the full-featured version with mock support

Also remove the duplicate `src/shared/api/apiClient.ts` (legacy leftover), if present.

---

## Docs Updated (as a result of this plan)

| Document | What changed |
|----------|---------------|
| `CLAUDE.md` | Stack line updated: client = Vite+React Router+React Query+Zustand (UI from Impulse); server = Express/MongoDB (unchanged). Points to this file. |
| `Docs/project-context.md` | Tech stack section rewritten to Vite/React Router/React Query/Zustand; palette guardrail points to Impulse-Violet-seeded `DESIGN.md`; stale-doc flags refreshed. |
| `Docs/Architecture.md` | §0.1/§1.2/§1.3/§1.4/§2/§3.4/§3.5/§4/§9/§10/§11 rewritten to remove Next.js/Drizzle/Neon/jose/SWR/Edge references; §3.1/§3.2/§3.3/§6 (schema, auth, API pattern, business logic) untouched. Story count 34→25. |
| `Docs/Epics.md` | Timeline reframed to 5 days/25 stories; SWR→React Query; stale scaffold/layer/Edge Middleware references fixed. |
| `Docs/team-task-assignments.md` | Reconciled with this plan's Day 1 split; "Edge Middleware" language fixed. |
| `Docs/PRD.md` | Stack references (Next.js/Neon/SWR/jose/Drizzle) find-replaced to current stack. Product content untouched. |
| `Docs/team-task-breakdown.md` | Per-story technical task descriptions rewritten to Vite/React Query/Express/Mongoose. |
| `Docs/Scope.md`, `Docs/UX-Design-Specification.md` | Minor stale-reference cleanup; both remain flagged as secondary/stale per the source-of-truth hierarchy. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| RTL conversion takes >1 day | Medium | 🔴 High | Hamza dedicated full Day 1. Use regex find-replace. Test with `dir="rtl"` on `<html>` immediately. |
| Team unfamiliar with MongoDB | Low | 🟡 Medium | Ziad owns all backend solo. Others only call API hooks. |
| 3 merge conflicts in Impulse | Low | 🟢 Low | Resolve morning of Day 1 before any feature work. |
| 25 stories too many for 5 days | High | 🔴 High | Impulse reuse saves ~30%. If behind by Day 3, cut: ONB (manual setup instead) and POL-2/POL-4. |
| No `DESIGN.md` exists yet | Low | 🟡 Medium | Khaled creates it Day 1, seeded from Impulse Violet, as part of E0-1. |
| Backend host not yet chosen | Medium | 🟡 Medium | Default to Render/Railway; confirm with team before Day 5 deploy. Client (Vercel) and server (Node host) are separate deploys — do not assume a single Vercel deploy covers both. |

---

## Definition of Done (per story)

- [ ] Feature works in both Arabic and English
- [ ] RTL layout renders correctly
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (Bottom Nav appears, Sidebar hides)
- [ ] Loading skeleton shown during data fetch
- [ ] Error state handled with bilingual toast
- [ ] Analytics event fired where specified
- [ ] No console errors/warnings
