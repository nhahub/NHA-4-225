# Architecture Decision Document — Hadaf (هدف) v2.0 — MVP

> **Date:** June 2026
> **Aligned with:** PRD v2.0 + UX Design Spec v2.0 + Epics v2.0
> **Team:** 5 humans — 20 days
> **Scope:** This document covers the MVP (Phase 1) only. The full Hadaf project spans 4 phases. After MVP, the same codebase and architecture carry forward with zero migration.
> **Bilingual:** Arabic (RTL) + English (LTR) at parity — i18n from day 1, no language is fallback.

---

## 0.1 MVP Scope (20 days, 5 humans + agents, bilingual)

All 8 database tables are created in Sprint 1 with all columns — including columns not used immediately (e.g., `is_spiritual`, `checklist`). Folder structure, patterns, domain logic, and CI/CD are designed for the complete product.

**During the 20-day build (5 humans + agents, ~145 SP),** the team implements 34 stories + brand + i18n + demo video:

| Area | What's Built |
|---|---|
| Foundation (Sprint 0) | Scaffold, design tokens, **i18n setup (AR + EN)**, font self-hosting, **10 illustrations**, brand mark, Vercel deploy |
| Infrastructure | Auth, DB (all 8 tables), App Shell, RTL/LTR parity, Dark Mode, CI/CD, Accessibility |
| Goals | Repository, SMART Wizard, Dashboard (rings + health + 12-week bar), Goal Detail + Milestones |
| Tasks | Repository + Scoring Domain, Task Creation with Auto-Type, 3 Completion Types, Task List, **Backlog** |
| Habits | Repository, Build Habits (Boolean + Counter + Quit), MVD System |
| Scoring | Scoring Engine, Progress Bar + 5 Day States |
| Settings | Day Types (Work/Light/Off) + work hours + day start |
| Capacity | **Visual gauge on Home screen** (the moat — not backend-only) |
| Home | Adaptive greeting, **Daily Pulse signature card**, assembled daily view |
| Onboarding | 3-step wizard, Goal vs Habit dialog |
| Polish | Empty States, Loading Skeletons, Error Toasts, Confirmation Dialogs |
| Demo | Cinematic 1–3 min video (Khaled's story arc, AR VO + EN subtitles) |

**Project constraints:**

| Constraint | Rule |
|---|---|
| **Language** | **Bilingual parity** — Arabic (RTL) + English (LTR), both first-class. i18n from day 1. No language is "fallback." |
| **Voice / Tone** | **Non-formal but high-quality** — conversational, friendly, polished. Same person writes both. AI-assisted translation handles bilingual copy. |
| **Design assets** | **None pre-existing** — logo, illustrations, brand mark all created from scratch in Sprint 0. Current UX spec is a baseline; final design direction owned separately. |
| **Motion** | CSS Transitions only — no Framer Motion. Push CSS limits (View Transitions API, `@keyframes`, scroll-bound animations) for premium feel. |
| **Quick Add** | Home screen only (not FAB on every screen) |
| **Task Sort** | Priority-based only (no manual drag reorder) |
| **Capacity** | **Visual gauge on Home screen required** (the differentiator) |
| **Habits** | Boolean + Counter only; users type habit names (no suggested library) |
| **Persistence** | Save on Action — no auto-save |
| **Destructive Actions** | Confirmation Dialogs — no Undo/Redo |
| **Deployment** | Live on Vercel from Day 2 onwards. Preview deploys per PR. Production on `main`. |

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
| **Security** | HTTPS/TLS 1.3, JWT (15min) via `jose`, Rate limiting (100 req/min) |
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
- 5 humans (2 juniors + 3 entry-level) — 2 of them agent-capable
- 20-day timeline (compressed from original 8-week plan)
- BMAD method: agents dispatched in `ba` / `pm` / `designer` / `frontend` / `backend` / `qa` roles
- No dedicated UX designer for v1.0 — Shadcn UI as component foundation; final design direction elevated separately
- No budget — every service must have a free tier
- No pre-existing design assets (logo, illustrations, Figma) — designed from scratch in Sprint 0

**External Dependencies:** Neon PostgreSQL, Vercel, GitHub

### 1.4 Cross-Cutting Concerns

| # | Concern | Approach |
|---|---|---|
| 1 | **Authentication** | JWT via `jose` at Edge; Email/Password (register + login) — login flow on Node.js runtime (bcrypt), JWT validation on Edge (jose). Final runtime decision: E0-5. |
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
npx create-next-app@latest hadaf --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm

# UI Foundation
npx shadcn@latest init
npx shadcn@latest add button dialog sheet input select toast progress card

# Database
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# Core Dependencies
npm install jose zod swr

# Development
npm install -D @types/node vitest
```

**7 runtime dependencies:** next, react, drizzle-orm, @neondatabase/serverless, jose, swr, zod

### 2.2 Key Choices

| Layer | Choice |
|---|---|
| Language | TypeScript strict, Next.js App Router, Turbopack |
| Styling | Tailwind CSS (cheat sheet provided for team) + Shadcn UI (limited to 8 components) + HSL CSS variables (light/dark) |
| Motion | CSS Transitions only |
| Testing | Vitest |

### 3.1 Database Schema (8 Collections)

Instead of a SQL-based relational schema, Hadaf uses a document-oriented MongoDB schema managed through Mongoose models. Relationships are maintained via ObjectIDs.

```javascript
// ═══════════════════════════════════════
// USERS COLLECTION
// ═══════════════════════════════════════
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String },
  avatarUrl: { type: String },
  passwordHash: { type: String, required: true },
  refreshToken: { type: String },
  refreshTokenExp: { type: Date },
  onboardingCompleted: { type: Boolean, default: false },
  settings: {
    work_hours_start: { type: String, default: "09:00" },
    work_hours_end: { type: String, default: "17:00" },
    day_start: { type: String, default: "04:00" },
    off_days: { type: [String], default: ["friday", "saturday"] },
    theme: { type: String, enum: ["light", "dark", "system"], default: "light" },
    language: { type: String, enum: ["ar", "en"], default: "ar" },
    notifications: {
      time_block_reminder: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

// ═══════════════════════════════════════
// GOALS COLLECTION
// ═══════════════════════════════════════
const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['education_work', 'family', 'health', 'religion_spirituality', 'other'], 
    required: true 
  },
  customCategory: { type: String },
  measure: { type: String, required: true },
  relevance: { type: String },
  cycleStart: { type: Date, required: true },
  cycleEnd: { type: Date, required: true },
  manualProgress: { type: Number },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'archived', 'replaced'], 
    default: 'active',
    index: true
  },
  deletionReason: { type: String }
}, { timestamps: true });

// Composite index for fast goal list queries
goalSchema.index({ userId: 1, status: 1 });

// Cascade delete milestones and nullify tasks on goal delete
goalSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  await Promise.all([
    mongoose.model('Milestone').deleteMany({ goalId: this._id }),
    mongoose.model('Task').updateMany({ goalId: this._id }, { $unset: { goalId: "" } })
  ]);
  next();
});

// ═══════════════════════════════════════
// MILESTONES COLLECTION
// ═══════════════════════════════════════
const milestoneSchema = new mongoose.Schema({
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', required: true, index: true },
  title: { type: String, required: true },
  sort_order: { type: Number, default: 0 },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date }
}, { timestamps: true });

// Index for ordering milestones within a specific goal
milestoneSchema.index({ goalId: 1, sort_order: 1 });

// ═══════════════════════════════════════
// TASKS COLLECTION
// ═══════════════════════════════════════
const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  goalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Goal', index: true },
  title: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['scheduled', 'flexible', 'quick'], default: 'quick' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium', index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  timeBlockStart: { type: String }, // Format: HH:MM
  timeBlockEnd: { type: String },
  plannedDurationMinutes: { type: Number },
  actualDurationMinutes: { type: Number },
  checklist: [{
    title: { type: String, required: true },
    is_completed: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['pending', 'completed', 'postponed'], default: 'pending' },
  pointsEarned: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

// Index for query sorting: scheduled by priority + date
taskSchema.index({ userId: 1, date: 1, priority: -1 });

// ═══════════════════════════════════════
// HABITS COLLECTION
// ═══════════════════════════════════════
const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['education_work', 'family', 'health', 'religion_spirituality', 'other'], 
    required: true 
  },
  type: { type: String, enum: ['boolean', 'counter', 'quit'], default: 'boolean' },
  frequency: {
    type: { type: String, default: "daily" } // Frequency config (e.g. daily, weekly)
  },
  targetValue: { type: Number },
  mvdValue: { type: Number },
  mvdDescription: { type: String },
  isSpiritual: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

// ═══════════════════════════════════════
// HABIT LOGS COLLECTION
// ═══════════════════════════════════════
const habitLogSchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  value: { type: Number, default: 0 },
  isMvd: { type: Boolean, default: false },
  isRelapse: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

// Prevent duplicate log for same habit on same date
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

// ═══════════════════════════════════════
// DAILY SUMMARIES COLLECTION
// ═══════════════════════════════════════
const dailySummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
  dayType: { type: String, enum: ['work', 'light', 'off'], default: 'work' },
  tasksCompleted: { type: Number, default: 0 },
  habitsCompleted: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  dailyTarget: { type: Number, default: 0 },
  dayState: { 
    type: String, 
    enum: ['legendary', 'amazing', 'perfect', 'good_enough', 'low'] 
  },
  summaryShown: { type: Boolean, default: false }
}, { timestamps: true });

dailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });

// ═══════════════════════════════════════
// ANALYTICS EVENTS COLLECTION
// ═══════════════════════════════════════
const analyticsEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventType: { type: String, required: true },
  eventData: { type: mongoose.Schema.Types.Map, of: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
});

analyticsEventSchema.index({ userId: 1, createdAt: -1 });
```

### 3.2 Authentication & Security

Authentication is structured around standard JSON Web Tokens (JWT) and Bcrypt hashing, decoupled from edge execution context.

```
Login: Email/Password flow, password hashed using bcryptjs (cost 10)
Tokens:
├── Access Token: Short-lived JWT (15 min), signed on server
├── Refresh Token: 7-day token, stored hashed in User model, rotated on use
└── Cookie Transport: Delivered via httpOnly secure cookies
```

* **Cross-Origin Cookie Configuration**: The Express backend must deliver the authentication JWT cookies with the following configurations:
  * `httpOnly: true` (prevents client-side scripts from reading the token)
  * `sameSite: "none"` (allows browser to pass the cookie cross-origin from Next.js client)
  * `secure: true` (requires HTTPS context. Note: browsers treat localhost as secure)
* **CORS Origin Policy Binding**: If cookies are transmitted, CORS must strictly map to `process.env.FRONTEND_URL` and enable credentials. Wildcard origins (`*`) are prohibited:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
    credentials: true
  }));
  ```
* **CSRF Mitigation (Custom Headers)**: State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) are protected by validating custom client-side headers. If the `X-Requested-With` header is absent, the backend rejects the request:
  ```javascript
  app.use((req, res, next) => {
    const isStateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (isStateChanging && req.headers['x-requested-with'] !== 'XMLHttpRequest') {
      return res.status(403).json({ success: false, errorCode: 'AUTH', error: 'errors.csrfDetected' });
    }
    next();
  });
  ```
* **Refresh Token Rotation**: Each token refresh request invalidates the old refresh token and issues a new pair. If token reuse is detected (indicating token theft), all active refresh sessions for the user are invalidated.
* **Rate Limiting**: Configured via backend Express rate limiter middleware (e.g. 100 requests per minute per user ID/IP address).

**Indexes summary:**

### 3.3 API Pattern — MVC REST Controller

Backend endpoints follow a standard Model-View-Controller (MVC) API pattern built with Express.js:

```
Request ➔ Routes ➔ Auth Middleware ➔ Controller (Zod Validation) ➔ Mongoose Models ➔ JSON Response
```

Every endpoint returns a standardized JSON contract matching this format:

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode: 'VALIDATION' | 'AUTH' | 'DB_ERROR' | 'RATE_LIMIT' | 'UNKNOWN'; field?: string }
```

* **Express Routes Mapping**:
  * `/api/auth/*`: Signup, Login, Logout, Refresh endpoints.
  * `/api/user/settings`: PATCH endpoint to update language (RTL/LTR), theme, and work targets.
  * `/api/goals/*`: SMART Goal dashboard queries and wizard mutations.
  * `/api/tasks/*` and `/api/habits/*`: Everyday action inputs.
* **Global Error Handling & Route Fallbacks**: The global Express error-handler middleware and route fallbacks catch unmatched paths and parse MongoDB/Mongoose specific exceptions into a clean validation response layout instead of returning raw database traces:
  ```javascript
  // Express fallback for unmatched routes (placed right before error handler)
  app.use((req, res, next) => {
    res.status(404).json({
      success: false,
      errorCode: 'UNKNOWN',
      error: 'errors.routeNotFound'
    });
  });

  // Express global error-handler.js snippet
  app.use((err, req, res, next) => {
    // Mongoose Schema Validation Failures
    if (err.name === 'ValidationError') {
      const field = Object.keys(err.errors)[0];
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION',
        error: err.errors[field].message || 'errors.validationFailed',
        field
      });
    }

    // MongoDB Duplicate Key (Code 11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION',
        error: `auth.errors.${field}Exists`, // e.g. auth.errors.emailExists
        field
      });
    }
    
    res.status(500).json({ success: false, errorCode: 'UNKNOWN', error: 'errors.internalServer' });
  });
  ```

### 3.4 Frontend Architecture

**State Management:**

| State | Solution |
|---|---|
| Server data (tasks, goals, habits) | SWR hooks performing client-side queries fetching from `process.env.NEXT_PUBLIC_API_URL` with credentials enabled. |
| UI state (modals, forms) | React `useState` / `useReducer` |
| Day Type | React Context (`DayTypeProvider`) |
| Auth | React auth context calling backend endpoints |
| Forms | React Hook Form + Zod |
| Theme | CSS variables + `data-theme` attribute |
| **Language (i18n)** | Custom cookie-based `LocaleProvider` (Arabic primary RTL, English first-class LTR). |

**API Fetcher Guideline**:
Frontend data mutations must target absolute backend addresses via environment variables. Relative routes to the Next.js server are prohibited:
```typescript
// client/src/lib/api.ts
export const fetcher = (url: string) => 
  fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    credentials: 'include' // Crucial for cross-origin httpOnly cookies
  }).then(res => res.json());
```

### 3.5 Infrastructure

**CI/CD (GitHub Actions):** Runs test checks on frontend and backend separate scripts.

**Environment Variables:**

| Variable | Scope | Purpose |
|---|---|---|
| `MONGODB_URI` | Server | MongoDB Connection String |
| `JWT_SECRET` | Server | jsonwebtoken signature key |
| `NEXT_PUBLIC_API_URL` | Client | Absolute backend server URL |
| `PORT` | Server | Express listener port (default `5000`) |

**Monitoring**: Global Express error handler logs + client-side Error Boundary alerts.

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
├── client/                               # Next.js Frontend App
│   ├── public/fonts/                     # Fonts (Tajawal, IBM Plex Sans Arabic)
│   ├── src/
│   │   ├── app/                          # Pages & Layouts (App Router)
│   │   │   ├── globals.css               # Tailwind + HSL tokens + CSS transitions
│   │   │   ├── layout.tsx                # Root layout (dir, lang, font, theme)
│   │   │   ├── page.tsx                  # Landing ➔ Redirect to /app
│   │   │   ├── (auth)/                   # Login, Register pages
│   │   │   └── app/                      # Authenticated Routes (wrapped in AppShell)
│   │   │       ├── goals/                # Goals List, SMART Wizard, Detail pages
│   │   │       └── more/                 # Settings & Analytics
│   │   ├── components/                   # Reusable client components
│   │   │   ├── ui/                       # Radix / shadcn primitives
│   │   │   ├── shared/                   # Language switcher, theme toggle, states
│   │   │   └── layouts/                  # Sidebar, BottomNav, AppShell
│   │   ├── features/                     # Frontend Hook Slices (SWR query, validations)
│   │   ├── providers/                    # Context providers (Theme, Locale)
│   │   ├── i18n/                         # i18n translation catalogs & formatters
│   │   └── lib/                          # Client-side utility functions
│   ├── package.json
│   └── tsconfig.json
│
└── server/                               # Node.js / Express Backend (MVC in pure JS)
    ├── src/
    │   ├── config/                       # Mongoose connection & configs
    │   │   └── db.js
    │   ├── models/                       # M (Model): Mongoose collections
    │   │   ├── User.js
    │   │   ├── Goal.js
    │   │   ├── Milestone.js
    │   │   ├── Task.js
    │   │   ├── Habit.js
    │   │   ├── HabitLog.js
    │   │   ├── DailySummary.js
    │   │   └── AnalyticsEvent.js
    │   ├── controllers/                  # C (Controller): Express handlers
    │   │   ├── auth.controller.js
    │   │   ├── user.controller.js        # User settings update
    │   │   ├── goals.controller.js
    │   │   ├── milestones.controller.js  # Milestone status/order mutations
    │   │   ├── tasks.controller.js
    │   │   └── habits.controller.js
    │   ├── routes/                       # Express Endpoints
    │   │   ├── auth.routes.js
    │   │   ├── user.routes.js
    │   │   ├── goals.routes.js
    │   │   ├── milestones.routes.js      # Milestone routes
    │   │   ├── tasks.routes.js
    │   │   └── habits.routes.js
    │   ├── middleware/                   # Express custom middleware
    │   │   ├── auth.js                   # JWT parse & injection
    │   │   ├── rate-limiter.js
    │   │   └── error-handler.js          # Mongoose code 11000 exception handling
    │   ├── utils/                        # Password hashing & JWT sign/verify
    │   └── server.js                     # Express bootstrap
    └── package.json
```

---

## 6. Business Logic Specifications (Backend Utils)

All core mathematical calculations and business rules are handled by pure, unit-testable JavaScript utility files under **`hadaf/server/src/utils/`**. These utilities have zero database or HTTP framework dependencies.

### 6.1 Scoring (`server/src/utils/scoring.js`)

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

### 6.2 Goal Progress (`server/src/utils/goal-progress.js`)

**Hybrid Progress (FR6):** `(tasks × 60%) + (milestones × 40%)`

**Goal Health (FR6.3):** ratio = actual/expected. ≥85%→🟢, ≥70%→🟡, ≥50%→🟠, <50%→🔴

**Key functions:** `calculateHybridProgress(input)`, `calculateGoalHealth(actual, week, total)`, `getCurrentWeek(cycleStart, today)`, `calculateWeeklyExecutionScore(completed, total)`

### 6.3 Capacity (`server/src/utils/capacity.js`)

```
capacity = (work_end - work_start - lunch) × 0.80
if light_day: capacity × 0.50
if off_day: capacity = 0
```

**Key functions:** `calculateDailyCapacity(input)`, `calculatePlannedTime(tasks)`, `parseTimeToMinutes(time)`

### 6.4 Day State (`server/src/utils/day-state.js`)

| Ratio | State |
|---|---|
| ≥150% | legendary |
| ≥120% | amazing |
| ≥100% | perfect |
| ≥50% | good_enough |
| <50% | low |

**Adaptive Target:** Rolling 7-day avg. Light day ×0.5, Off day ×0.2.

**Key functions:** `calculateDayState(points, target)`, `calculateAdaptiveDailyTarget(recent, dayType)`

### 6.5 Task Type Detection (`server/src/utils/task-type.js`)

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
npm install
cp .env.example .env.local   # Fill: DATABASE_URL, JWT_SECRET
npm run db:generate && npm run db:migrate
npm run dev                     # → http://localhost:3000
```

### 10.2 Scripts

`dev`, `build`, `start`, `lint`, `type-check`, `test`, `db:generate`, `db:migrate`, `db:studio`

### 10.3 Pre-Deploy Checklist

1. `npm run type-check` + `npm run lint` + `npm run test` + `npm run build`
2. Env vars in Vercel
3. `npm run db:migrate`
4. RTL + dark mode + mobile verified
5. Lighthouse ≥85 Desktop, ≥75 Mobile

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
