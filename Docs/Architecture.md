# Architecture Decision Document — Hadaf (هدف) v2.0 — MVP

> **Date:** June 2025
> **Aligned with:** PRD v2.0 + UX Design Spec v2.0 + Epics v2.0
> **Team:** 5 interns learning Next.js — 8 weeks
> **Scope:** This document covers the MVP (Phase 1) only. The full Hadaf project spans 4 phases. After the internship, the same codebase and architecture carry forward with zero migration.

---

## 0.1 Internship Scope

All 8 database tables are created in Sprint 1 with all columns — including columns not used immediately (e.g., `is_spiritual`, `checklist`). Folder structure, patterns, domain logic, and CI/CD are designed for the complete product.

**During the internship (8 weeks, 5 interns, ~115 SP),** the team implements 34 stories:

| Area | What's Built |
|---|---|
| Infrastructure | Auth, DB (all 8 tables), App Shell, RTL, Dark Mode, CI/CD, Accessibility |
| Goals | Repository, SMART Wizard, Dashboard (rings + health + 12-week bar), Goal Detail + Milestones |
| Tasks | Repository + Scoring Domain, Task Creation with Auto-Type, 3 Completion Types, Task List |
| Habits | Repository, Build Habits (Boolean + Counter), MVD System |
| Scoring | Scoring Engine, Progress Bar + 5 Day States |
| Settings | Day Types (Work/Light/Off) + work hours + day start |
| Capacity | Backend calculation only |
| Home | Adaptive greeting, assembled daily view |
| Onboarding | 3-step wizard |
| Polish | Empty States, Loading Skeletons, Error Toasts, Confirmation Dialogs |

**Internship constraints:**

| Constraint | Rule |
|---|---|
| Language | Arabic-only (RTL infrastructure built, no toggle UI) |
| Motion | CSS Transitions only — no Framer Motion |
| Quick Add | Home screen only (not FAB on every screen) |
| Task Sort | Priority-based only (no manual drag reorder) |
| Capacity | Backend calculation; no visual gauge |
| Habits | Boolean + Counter only; users type habit names (no suggested library) |
| Persistence | Save on Action — no auto-save |
| Destructive Actions | Confirmation Dialogs — no Undo/Redo |

---

## 1. Project Context

### 1.1 Architecturally Significant Requirements

| FR | Significance |
|---|---|
| **3 Auto-Detected Task Types** (FR12-12.3) | Single creation form silently classifies tasks as scheduled/flexible/quick based on user input |
| **3 Auto-Selected Completion Types** (FR26-26.2) | Smart Complete / Manual Complete / Quick Complete — each with different dialogs and point calculations |
| **Scoring Engine** (FR44) | `(duration/10) × difficulty × accuracy × streak` — runs identically client-side (optimistic) and server-side (authoritative) |
| **Hybrid Goal Progress** (FR6) | `(tasks 60% + milestones 40%)` — bidirectional with automatic recalculation |
| **Goal Health** (FR6.3) | Real-time health indicator (🟢🟡🟠🔴) based on expected vs actual progress by week |
| **MVD System** (FR35) | Habits have Full/Minimal versions, Light Days auto-switch to MVD |
| **Day Types** (FR55) | Work/Light/Off affect capacity, habit display, and daily target |
| **Daily Capacity** (FR83) | Auto-calculated from one-time settings, no daily questions |

### 1.2 Non-Functional Targets

| Category | Target |
|---|---|
| **Performance** | ≤2s page load, Lighthouse ≥85 Desktop / ≥75 Mobile |
| **Security** | HTTPS/TLS 1.3, JWT (15min) via `jose`, Rate limiting (100 req/min), Google OAuth |
| **Accessibility** | WCAG 2.1 AA, RTL-native, ≥4.5:1 contrast, ≥44px touch targets |
| **Scale** | 100 concurrent users |
| **Data Freshness** | SWR + Optimistic Updates + `mutate()` — no polling |

### 1.3 Technical Constraints

**Serverless (Hard):**
- No persistent connections — no WebSockets, no polling
- No `jsonwebtoken` or `bcrypt` on Edge — `jose` + Web Crypto API mandatory
- No in-memory state between invocations — all state via Neon PostgreSQL with `-pooler` suffix
- 10s function timeout on Serverless, limited execution on Edge

**Free-Tier Boundaries:**

| Service | Limit | Mitigation |
|---|---|---|
| **Vercel** | 100 GB-hours | No polling (SWR optimistic only) |
| **Neon** | 512 MB storage, auto-suspend | Loading Skeletons handle 2-5s cold start |

**Team Constraints:**
- 5 interns learning Next.js
- 8-week timeline
- No dedicated UX designer — Shadcn UI as component foundation
- No budget — every service must have a free tier

**External Dependencies:** Neon PostgreSQL, Vercel, GitHub, Google OAuth

### 1.4 Cross-Cutting Concerns

| # | Concern | Approach |
|---|---|---|
| 1 | **Authentication** | JWT via `jose` at Edge; Google OAuth only |
| 2 | **RTL-Native** | Arabic-first with Tailwind logical properties; `Intl.NumberFormat` for locale numbers |
| 3 | **Save on Action** | Every mutation saves immediately — no auto-save, no debouncing |
| 4 | **Confirmation Before Destruction** | Shadcn AlertDialog before every delete/archive |
| 5 | **Optimistic Updates** | SWR `mutate()` after every server action |
| 6 | **Free-Tier Discipline** | No polling, projection queries, optimized joins |
| 7 | **Graceful Degradation** | Loading Skeletons, Empty States, Error Toasts (retry) |
| 8 | **Day Type Adaptation** | Settings-driven (Work/Light/Off) affects capacity, habits, scoring |
| 9 | **Spiritual Data Privacy** | `habits.is_spiritual` column exists but unused until future phases |

---

## 2. Starter Template & Setup

### 2.1 Initialization

```bash
npx create-next-app@latest hadaf --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm

# UI Foundation
npx shadcn@latest init

# Database
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit

# Core Dependencies
pnpm add jose zod swr

# Development
pnpm add -D @types/node vitest
```

**7 runtime dependencies:** next, react, drizzle-orm, @neondatabase/serverless, jose, swr, zod

### 2.2 Key Choices

| Layer | Choice |
|---|---|
| Language | TypeScript strict, Next.js App Router, Turbopack |
| Styling | Tailwind CSS + Shadcn UI + HSL CSS variables (light/dark) |
| Motion | CSS Transitions only |
| Testing | Vitest (domain unit tests) + manual testing |

---

## 3. Core Architecture

### 3.1 Database Schema (8 Tables)

```sql
-- ═══════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  name        TEXT,
  avatar_url  TEXT,
  settings    JSONB NOT NULL DEFAULT '{
    "work_hours_start": "09:00",
    "work_hours_end": "17:00",
    "day_start": "04:00",
    "off_days": ["friday", "saturday"],
    "theme": "light",
    "language": "ar",
    "notifications": { "time_block_reminder": true }
  }',
  refresh_token       TEXT,
  refresh_token_exp   TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- GOALS
-- ═══════════════════════════════════════
CREATE TYPE goal_category AS ENUM ('education_work', 'family', 'health', 'religion_spirituality', 'other');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'archived', 'replaced');

CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  category        goal_category NOT NULL,
  custom_category TEXT,
  measure         TEXT NOT NULL,
  relevance       TEXT,
  cycle_start     DATE NOT NULL,
  cycle_end       DATE NOT NULL,
  manual_progress INTEGER,
  status          goal_status NOT NULL DEFAULT 'active',
  deletion_reason TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_goals_user_status ON goals(user_id, status);

-- ═══════════════════════════════════════
-- MILESTONES
-- ═══════════════════════════════════════
CREATE TABLE milestones (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id       UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- TASKS — No sort_order column
-- Sort: scheduled by time_block_start, others by priority + created_at
-- ═══════════════════════════════════════
CREATE TYPE task_type AS ENUM ('scheduled', 'flexible', 'quick');
CREATE TYPE task_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'postponed');

CREATE TABLE tasks (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id                  UUID REFERENCES goals(id) ON DELETE SET NULL,
  title                    TEXT NOT NULL,
  description              TEXT,
  type                     task_type NOT NULL DEFAULT 'quick',
  difficulty               task_difficulty NOT NULL DEFAULT 'medium',
  priority                 task_priority NOT NULL DEFAULT 'medium',
  date                     DATE NOT NULL DEFAULT CURRENT_DATE,
  time_block_start         TIME,
  time_block_end           TIME,
  planned_duration_minutes INTEGER,
  actual_duration_minutes  INTEGER,
  checklist                JSONB DEFAULT '[]',
  status                   task_status NOT NULL DEFAULT 'pending',
  points_earned            INTEGER NOT NULL DEFAULT 0,
  completed_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_user_date_priority ON tasks(user_id, date, priority);
CREATE INDEX idx_tasks_user_goal ON tasks(user_id, goal_id);

-- ═══════════════════════════════════════
-- HABITS
-- ═══════════════════════════════════════
CREATE TYPE habit_type AS ENUM ('boolean', 'counter', 'quit');

CREATE TABLE habits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        goal_category NOT NULL,
  type            habit_type NOT NULL DEFAULT 'boolean',
  frequency       JSONB NOT NULL DEFAULT '{"type": "daily"}',
  target_value    INTEGER,
  mvd_value       INTEGER,
  mvd_description TEXT,
  is_spiritual    BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════
-- HABIT LOGS
-- ═══════════════════════════════════════
CREATE TABLE habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  value       INTEGER NOT NULL DEFAULT 0,
  is_mvd      BOOLEAN NOT NULL DEFAULT FALSE,
  is_relapse  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, date);

-- ═══════════════════════════════════════
-- DAILY SUMMARIES
-- ═══════════════════════════════════════
CREATE TYPE day_type AS ENUM ('work', 'light', 'off');
CREATE TYPE day_state AS ENUM ('legendary', 'amazing', 'perfect', 'good_enough', 'low');

CREATE TABLE daily_summaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  day_type          day_type NOT NULL DEFAULT 'work',
  tasks_completed   INTEGER NOT NULL DEFAULT 0,
  habits_completed  INTEGER NOT NULL DEFAULT 0,
  points_earned     INTEGER NOT NULL DEFAULT 0,
  daily_target      INTEGER NOT NULL DEFAULT 0,
  day_state         day_state,
  summary_shown     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ═══════════════════════════════════════
-- ANALYTICS EVENTS
-- ═══════════════════════════════════════
CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  event_data  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_analytics_user_created ON analytics_events(user_id, created_at);
```

**Indexes summary:**

| Table | Index | Purpose |
|---|---|---|
| `goals` | `(user_id, status)` | Active goals query |
| `tasks` | `(user_id, date, priority)` | Daily task list |
| `tasks` | `(user_id, goal_id)` | Goal-linked tasks |
| `habit_logs` | `(habit_id, date)` UNIQUE | Prevent duplicates |
| `daily_summaries` | `(user_id, date)` UNIQUE | Prevent duplicates |
| `analytics_events` | `(user_id, created_at)` | Event queries |

**Caching:** Client = SWR (cache + optimistic, no polling). Server = none. Static config = `lib/constants.ts`.

**Soft-Delete:** Goals → `status`, Tasks → `status`, Habits → `is_archived`. No hard deletes.

### 3.2 Authentication & Security

```
Login: Google OAuth 2.0 (one-click)
Tokens:
├── Access Token: JWT via jose, 15min, httpOnly cookie
├── Refresh Token: 7-day, stored hashed in DB, rotated on use
└── Edge Middleware: validates on every /app/* request
```

- Stateless JWT — fits serverless
- Refresh token rotation prevents theft
- On token reuse (theft indicator): invalidate all user tokens
- Middleware detects expired access token → silent refresh; if fails → redirect to `/login?redirect={currentPath}`
- Rate limiting: 100 req/min per user, in-memory `Map` (sufficient for 100 users)
- `habits.is_spiritual` column exists but unused — seeded as `false`

### 3.3 API Pattern — Server Actions

Every mutation follows this flow:

```
1. 'use server' directive
2. Authenticate (getAuthUser() from cookie)
3. Validate input with Zod schema
4. Call domain logic (pure function from domain/)
5. Persist via repository (from data/repositories/)
6. Log analytics event
7. Return typed ActionResult<T>
```

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode: 'VALIDATION' | 'AUTH' | 'DB_ERROR' | 'RATE_LIMIT' | 'UNKNOWN'; field?: string; shouldRetry?: boolean }
```

**Error Handling:**

| Error Type | User Sees |
|---|---|
| Validation | Field-level error message |
| Auth failure | Redirect to login |
| DB failure (auto-retry 3×) | Error Toast: "فشل الحفظ. [حاول مرة أخرى]" |
| Neon cold start | Loading Skeleton (2-5s) |
| Network offline | Persistent banner: "لا يوجد اتصال" |
| 5th goal creation | Dialog: "لديك ٥ أهداف نشطة. أرشف هدفًا أولاً." |
| Destructive action | Confirmation Dialog before execution |

**Data Freshness:** SWR `mutate()` after every action. No polling. Same scoring function runs client & server.

### 3.4 Frontend Architecture

**State Management:**

| State | Solution |
|---|---|
| Server data (tasks, goals, habits) | SWR (cache + optimistic) |
| UI state (modals, forms) | React `useState` / `useReducer` |
| Day Type | React Context (`DayTypeProvider`) |
| Auth | Edge Middleware + SWR user hook |
| Forms | React Hook Form + Zod |
| Theme | CSS variables + `data-theme` attribute |
| Language | React Context + `<html dir>` — Arabic-only during MVP |

**Component Types:**

| Type | Location | Rules |
|---|---|---|
| Server Components | `app/` | Data fetching, layouts |
| Client Components | `components/` + `features/` | All interactive UI — `"use client"` |
| Shadcn Base | `components/ui/` | No business logic |
| Shared | `components/shared/` | Empty states, skeletons, error boundary |

**Motion:** CSS Transitions only. Tokens: `width 500ms ease-out`, `opacity 300ms ease`, `transform 200ms ease-out`. Shimmer `1500ms infinite linear`. `prefers-reduced-motion` disables all.

**RTL:** Tailwind logical properties (`ms-`/`me-`/`ps-`/`pe-`). `dir="rtl"` on `<html>`. No `left`/`right` CSS. Progress bars fill right-to-left. 12-week bar: Week 1 on right.

### 3.5 Infrastructure

**CI/CD (GitHub Actions):** `pnpm install → lint → type-check → test → build`

**Environment Variables:**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon connection string (with `-pooler`) |
| `JWT_SECRET` | jose signing key |
| `GOOGLE_CLIENT_ID` | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GOOGLE_REDIRECT_URL` | OAuth callback URL |
| `NEXT_PUBLIC_APP_URL` | Base URL for client |

**Monitoring:** Vercel built-in analytics + function logs + `analytics_events` table + client Error Boundary.

---

## 4. Implementation Patterns

### 4.1 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Tables/Columns | `snake_case` | `users`, `user_id`, `is_completed` |
| Indexes | `idx_{table}_{columns}` | `idx_tasks_user_date_priority` |
| Booleans | `is_`/`has_` prefix | `is_mvd`, `is_archived` |
| Timestamps | `{verb}_at` | `created_at`, `completed_at` |
| Components | PascalCase | `GoalCard.tsx` |
| Hooks | `use` prefix, camelCase | `useGoals()` |
| Server Actions | camelCase verb phrases | `createGoal()` |
| Domain functions | camelCase | `calculatePoints()` |
| Repositories | camelCase verb phrases | `goalsRepo.getActiveGoals()` |
| Types | PascalCase | `Task`, `GoalWithProgress` |
| Zod schemas | camelCase + `Schema` suffix | `createGoalSchema` |
| Files/Dirs | kebab-case | `goal-progress.ts` |

### 4.2 File Organization

| What | Where | Rule |
|---|---|---|
| Drizzle schema | `data/db/schema.ts` | Single file for all tables |
| Migrations | `data/db/migrations/` | Auto-generated by `drizzle-kit generate` |
| Server Actions | `features/{name}/actions.ts` | One file per feature |
| SWR hooks | `features/{name}/hooks.ts` | One file per feature |
| Zod schemas | `features/{name}/schemas.ts` | Co-located with feature |
| Pure domain logic | `domain/{name}.ts` | **Zero imports from React, Next.js, or Drizzle** |
| Repository queries | `data/repositories/{name}.repo.ts` | **Only files that import Drizzle** |
| Shadcn components | `components/ui/` | Never add business logic |
| Shared components | `components/shared/` | Empty states, skeletons, error boundary |
| Tests | `tests/domain/` | Unit tests for domain logic |

### 4.3 Format Rules

| Context | Format | Example |
|---|---|---|
| DB storage | `TIMESTAMPTZ` (UTC) | `2025-06-09T08:30:00Z` |
| Date-only | `DATE` type | `2025-06-09` |
| Time blocks | `TIME` (no timezone) | `09:00:00` |
| UI display | `Intl.DateTimeFormat` | `٩ يونيو ٢٠٢٥` |
| Numbers | `Intl.NumberFormat('ar-EG')` | `١٢٣` |
| Time display | Always hours:minutes | `١:٣٠` (not `٩٠ دقيقة`) |
| Points | Always integers (Math.ceil) | `+١٣ نقطة` |

**Drizzle Query Rule:** ALWAYS `.select({specific columns})` — never `SELECT *`. Never write Drizzle queries outside `data/repositories/`.

### 4.4 Server Action Example

```typescript
// features/tasks/actions.ts
'use server'

export async function completeTask(input: unknown): Promise<ActionResult<{ points: number }>> {
  try {
    const userId = await getAuthUser()
    const data = completeTaskSchema.parse(input)
    const task = await tasksRepo.getById(data.taskId)
    const points = calculateTaskPoints({ /* ... */ })
    await tasksRepo.complete(data.taskId, data.actualMinutes, points)
    await analyticsRepo.log(userId, 'task_complete', { /* ... */ })
    return { success: true, data: { points } }
  } catch (error) {
    if (error instanceof ZodError) return { success: false, error: error.message, errorCode: 'VALIDATION' }
    return { success: false, error: 'حدث خطأ', errorCode: 'UNKNOWN', shouldRetry: true }
  }
}
```

### 4.5 SWR Hook Example

```typescript
// features/tasks/hooks.ts — Optimistic update pattern
export function useTasks(date: string) {
  const { data, error, isLoading, mutate } = useSWR(['tasks', date], () => fetchTasksByDate(date))

  const completeTask = async (taskId: string, actualMinutes?: number) => {
    mutate(data?.map(t => t.id === taskId ? { ...t, status: 'completed' } : t), { revalidate: false })
    const result = await completeTaskAction(taskId, actualMinutes)
    mutate() // Revalidate with server truth
    return result
  }

  return { tasks: data ?? [], error, isLoading, completeTask, refresh: mutate }
}
```

### 4.6 Enforcement Rules

**Must:**
1. Never import `drizzle-orm` outside `data/repositories/`
2. Never import React/Next.js in `domain/` — pure TypeScript only
3. Always validate with Zod before DB writes
4. Always use Tailwind logical properties — `ms-`/`me-`, never `ml-`/`mr-`
5. Always use `ActionResult<T>` return type for Server Actions
6. Always show Confirmation Dialog before destructive actions
7. Always provide Empty State + Loading Skeleton for every screen
8. Always test in Arabic RTL before merge
9. Always use CSS Transitions only — no Framer Motion
10. Always use `Intl.NumberFormat` for number display

**Never:**

| Anti-Pattern | Why |
|---|---|
| Drizzle queries in Server Actions | Bypasses repository layer |
| `left`/`right` CSS | Breaks RTL |
| `SELECT *` | Performance + security |
| `jsonwebtoken` | Not Edge-compatible; use `jose` |
| Auto-save / debounced save | Save on Action pattern |
| SWR polling (`refreshInterval`) | Use `mutate()` after actions |
| Negative messaging | Always lead with accomplishments |
| Hard-deleting user data | Soft-delete with status column |

---

## 5. Project Directory Structure

```
hadaf/
├── .github/workflows/ci.yml
├── public/fonts/                         # Tajawal, IBM Plex Sans Arabic
├── scripts/seed.ts                       # Demo account + test data
├── src/
│   ├── app/
│   │   ├── globals.css                   # Tailwind + HSL tokens + CSS transitions
│   │   ├── layout.tsx                    # Root layout (dir, lang, font, theme)
│   │   ├── page.tsx                      # Landing → redirect
│   │   ├── login/page.tsx
│   │   ├── api/auth/callback/google/route.ts
│   │   └── app/                          # Protected routes
│   │       ├── layout.tsx                # App shell + providers
│   │       ├── page.tsx                  # Home
│   │       ├── goals/
│   │       │   ├── page.tsx              # Dashboard
│   │       │   ├── new/page.tsx          # SMART Wizard
│   │       │   └── [id]/page.tsx         # Detail
│   │       ├── habits/page.tsx
│   │       ├── more/
│   │       │   ├── page.tsx              # More menu
│   │       │   ├── analytics/page.tsx
│   │       │   └── settings/page.tsx
│   │       └── onboarding/page.tsx
│   ├── features/                         # APPLICATION LAYER
│   │   ├── auth/    (actions, schemas, types)
│   │   ├── onboarding/ (actions, hooks, schemas)
│   │   ├── goals/   (actions, hooks, schemas, types)
│   │   ├── tasks/   (actions, hooks, schemas, types)
│   │   ├── habits/  (actions, hooks, schemas, types)
│   │   ├── scoring/ (actions, hooks, types)
│   │   ├── capacity/ (hooks, types)
│   │   ├── analytics/ (actions, hooks)
│   │   └── settings/ (actions, hooks)
│   ├── domain/                           # PURE TS — ZERO framework imports
│   │   ├── scoring.ts
│   │   ├── goal-progress.ts
│   │   ├── capacity.ts
│   │   ├── day-state.ts
│   │   ├── task-type.ts
│   │   └── types.ts
│   ├── data/
│   │   ├── db/ (schema.ts, client.ts, migrations/)
│   │   └── repositories/ (users, goals, tasks, habits, daily-summaries, analytics)
│   ├── components/
│   │   ├── ui/                           # Shadcn (no business logic)
│   │   ├── shared/ (empty-state, loading-skeleton, error-toast, error-boundary, contribution-pulse, day-state-badge, category-badge)
│   │   ├── layouts/ (app-shell, sidebar, bottom-nav)
│   │   ├── goals/ (goal-card, goal-wizard, goal-readiness-dialog, goal-detail, goal-progress-ring, goal-health-dot, milestone-list, twelve-week-bar)
│   │   ├── tasks/ (task-card, task-list, quick-add-sheet, smart-complete-dialog, manual-complete-dialog, checklist, backlog-ribbon)
│   │   ├── habits/ (habit-card, habit-list, habit-counter, mvd-indicator)
│   │   ├── scoring/ (progress-bar, daily-summary-toast)
│   │   ├── home/ (adaptive-greeting, daily-overview)
│   │   └── onboarding/ (onboarding-wizard, goal-readiness-step, habits-step, settings-step)
│   ├── hooks/ (use-day-type, use-locale, use-media-query)
│   ├── providers/ (day-type, locale, auth)
│   ├── lib/ (i18n/number-format, auth/{jwt,session}, constants)
│   ├── middleware.ts                      # JWT + rate limiting
│   └── types/globals.d.ts
├── tests/domain/ (scoring, goal-progress, capacity, day-state, task-type)
├── drizzle.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── .env.local / .env.example
└── package.json
```

---

## 6. Domain Logic Specifications

> **Rule:** Everything in `src/domain/` is pure TypeScript. Zero imports from React, Next.js, Drizzle, or any framework. Every function is deterministic and unit-testable.

### 6.1 Domain Types (`domain/types.ts`)

```typescript
export type TaskType = 'scheduled' | 'flexible' | 'quick'
export type TaskDifficulty = 'easy' | 'medium' | 'hard'
export type TaskPriority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'completed' | 'postponed'
export type HabitType = 'boolean' | 'counter' | 'quit'
export type GoalCategory = 'education_work' | 'family' | 'health' | 'religion_spirituality' | 'other'
export type GoalStatus = 'active' | 'completed' | 'archived' | 'replaced'
export type GoalHealth = 'on_track' | 'needs_attention' | 'behind' | 'at_risk'
export type DayType = 'work' | 'light' | 'off'
export type DayState = 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low'
```

### 6.2 Scoring (`domain/scoring.ts`)

**Formula:** `(actual_duration / 10) × difficulty_multiplier × accuracy_bonus × streak_bonus`

| Factor | Rule |
|---|---|
| **Quick tasks** | Always 2 points |
| **Difficulty** | easy ×1.0, medium ×1.2, hard ×1.4 |
| **Accuracy** | ×1.15 if actual within ±15min of planned |
| **Streak** | ×1.05 per consecutive day, capped at ×1.5 |
| **Time cap** | Actual capped at 3× planned |

**Habit points:** boolean_full=5, boolean_mvd=3, counter_full=5, counter_partial=4, counter_mvd=3, quit=0. Milestone bonus=10.

**Key functions:** `calculateTaskPoints(input)`, `calculateCounterHabitPoints(value, target, mvd)`, `calculateHabitPoints(type, isMvd)`, `predictTaskPoints(type, difficulty, planned)`

### 6.3 Goal Progress (`domain/goal-progress.ts`)

**Hybrid Progress (FR6):** `(tasks × 60%) + (milestones × 40%)`

**Goal Health (FR6.3):** ratio = actual/expected. ≥85%→🟢, ≥70%→🟡, ≥50%→🟠, <50%→🔴

**Key functions:** `calculateHybridProgress(input)`, `calculateGoalHealth(actual, week, total)`, `getCurrentWeek(cycleStart, today)`, `calculateWeeklyExecutionScore(completed, total)`

### 6.4 Capacity (`domain/capacity.ts`)

```
capacity = (work_end - work_start - lunch) × 0.80
if light_day: capacity × 0.50
if off_day: capacity = 0
```

**Key functions:** `calculateDailyCapacity(input)`, `calculatePlannedTime(tasks)`, `parseTimeToMinutes(time)`

### 6.5 Day State (`domain/day-state.ts`)

| Ratio | State |
|---|---|
| ≥150% | legendary |
| ≥120% | amazing |
| ≥100% | perfect |
| ≥50% | good_enough |
| <50% | low |

**Adaptive Target:** Rolling 7-day avg. Light day ×0.5, Off day ×0.2.

**Key functions:** `calculateDayState(points, target)`, `calculateAdaptiveDailyTarget(recent, dayType)`

### 6.6 Task Type Detection (`domain/task-type.ts`)

```
if time_block_start AND time_block_end → 'scheduled'
else if planned_duration_minutes > 0 → 'flexible'
else → 'quick'
```

**Key functions:** `detectTaskType(input)`, `calculateBlockDuration(start, end)`

### 6.7 Zod Schemas (Summary)

Each feature has co-located schemas in `features/{name}/schemas.ts`:

- **goals:** `createGoalSchema` (title, category, measure, milestones array), `softDeleteGoalSchema` (goalId + reason)
- **tasks:** `createTaskSchema` (title, goalId, difficulty, priority, date, timeBlock, duration, checklist), `completeTaskSchema` (taskId, actualMinutes)
- **habits:** `createHabitSchema` (title, category, type, frequency, targetValue, mvdValue, mvdDescription), `logHabitSchema` (habitId, date, value, isMvd)
- **settings:** `updateSettingsSchema` (workHours, dayStart, offDays, theme, language, notifications)

---

## 7. Key Algorithms

### 7.1 Task Completion Flow

```
Quick task → One tap (no dialog) → 2 points
Scheduled task → Smart Complete Dialog (planned vs actual) → full scoring
Flexible task → Manual Complete Dialog ("How long?" slider) → full scoring
```

Every completion: optimistic mutate → server action → revalidate.

### 7.2 Streak Calculation

```typescript
// Task streak: consecutive days with ≥1 completed task
// Query last 60 distinct completion dates, count backwards from yesterday

// Habit streak: consecutive days with value > 0
// Query last 90 logs per habit, count backwards from yesterday
// Quit habits: days since creation (auto-counter)
```

---

## 8. Testing

### 8.1 Unit Tests (Vitest)

```typescript
// vitest.config.ts
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'], globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

| File | Key Test Cases | Priority |
|---|---|---|
| `scoring.ts` | Quick=2pts, difficulty multipliers, accuracy ±15min threshold, streak cap at 1.5×, time cap at 3× | P0 |
| `goal-progress.ts` | Hybrid formula, tasks-only, milestones-only, health 4 states, week boundaries | P0 |
| `capacity.ts` | Work/Light/Off day, custom hours, parse time | P0 |
| `day-state.ts` | All 5 states at boundaries (49%/50%/100%/120%/150%), zero target | P0 |
| `task-type.ts` | Title→quick, +duration→flexible, +time→scheduled, both→scheduled | P0 |

### 8.2 Manual Testing (Per Sprint)

| # | Test |
|---|---|
| 1 | Full user journey on Chrome + Safari, mobile viewport |
| 2 | RTL layout — every screen in Arabic |
| 3 | Dark mode toggle — all tokens, no invisible text |
| 4 | Empty states — delete all data, verify CTAs |
| 5 | Loading states — throttle network, verify skeletons |
| 6 | Error states — disconnect network, verify toasts + retry |
| 7 | Mobile responsive at 375px |
| 8 | Number formatting — verify ١٢٣ |
| 9 | Auto-type detection — title only / +duration / +time |
| 10 | Day Type change — Work→Light mid-day, verify MVD switch |

---

## 9. Performance & Security

### 9.1 Performance Targets

FCP ≤1.5s, LCP ≤2.0s, TTI ≤2.5s, CLS ≤0.1, JS ≤150KB gzip, DB query ≤200ms, Server Action ≤500ms

**Optimization:** No Framer Motion (-40KB), self-hosted fonts, font subsetting, dynamic imports, projection queries, SWR dedup, no polling, skeleton loading.

### 9.2 Security

| Area | Implementation |
|---|---|
| JWT | `jose` HS256, 15min access, 7-day refresh, httpOnly cookies |
| Input | Zod client + server, Drizzle parameterized queries |
| Authorization | Every query `WHERE user_id = ?` from JWT |
| Rate limit | 100 req/min, in-memory Map |
| Privacy | `is_spiritual` column, `is_relapse` never exposed |
| Headers | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy |
| HTTPS | Vercel enforced |

---

## 10. Deployment Runbook

### 10.1 Setup

```bash
git clone https://github.com/{org}/hadaf.git && cd hadaf
pnpm install
cp .env.example .env.local   # Fill: DATABASE_URL, JWT_SECRET, GOOGLE_*
pnpm db:push
pnpm dev                     # → http://localhost:3000
```

### 10.2 Scripts

`dev`, `build`, `start`, `lint`, `type-check`, `test`, `test:watch`, `db:push`, `db:generate`, `db:studio`, `seed`

### 10.3 Pre-Deploy Checklist

1. `pnpm type-check` + `pnpm lint` + `pnpm test` + `pnpm build`
2. Env vars in Vercel
3. Google redirect URL updated for production
4. `pnpm db:push`
5. RTL + dark mode + mobile verified
6. Lighthouse ≥85 Desktop, ≥75 Mobile

### 10.4 Rollback

Vercel: Deployments → previous → Promote to Production. DB: Neon → point-in-time restore.

---

## 11. ADR Summary

| # | Decision | Chosen | Rationale |
|---|---|---|---|
| 1 | JWT library | **jose** | Edge Runtime compatible |
| 2 | Database ORM | **Drizzle** | Edge-compatible, SQL-like, smallest bundle |
| 3 | Connection | **Pooled (-pooler)** | Required for serverless |
| 4 | Data freshness | **SWR + Optimistic** | Zero background requests |
| 5 | Motion | **CSS Transitions** | No dependency, smaller bundle |
| 6 | Persistence | **Save on Action** | Simpler than auto-save |
| 7 | Destructive protection | **Confirmation Dialogs** | Simpler than Command Pattern |
| 8 | Subtask model | **Checklist (JSONB)** | 90% value at 10% complexity |
| 9 | Cold start | **Loading Skeletons** | No cron cost, acceptable UX |
| 10 | Rate limiting | **In-memory Map** | Sufficient for 100 users |
| 11 | Task types | **Auto-detect** | Zero decisions for user |
| 12 | Streak storage | **Computed from tasks/logs** | No staleness, no sync issues |
| 13 | Test framework | **Vitest** | Fast, ESM-native |

---

**— End of Architecture v2.0 — MVP —**
