# Architecture Decision Document — Hadaf (هدف) v2.1 — MVP

> **Date:** July 2026
> **Aligned with:** PRD v2.0 + UX Design Spec v2.0 + Epics v2.0 + `Docs/Impulse-Migration-Plan.md`
> **Team:** 5 humans — 5 days
> **Scope:** This document covers the MVP (Phase 1) only. The full Hadaf project spans 4 phases. After MVP, the same codebase and architecture carry forward with zero migration.
> **Bilingual:** Arabic (RTL) + English (LTR) at parity — i18n from day 1, no language is fallback.
> **Client stack note:** The client (Vite + React Router + React Query + Zustand) is imported from the Impulse codebase — see `Docs/Impulse-Migration-Plan.md` for the reuse map. The backend below (§3.1–§3.3, §6) was never in question and is unaffected by that reuse.

---

## 0.1 MVP Scope (5 days, 5 humans + agents, bilingual)

All 8 database tables are created on Day 1 with all columns — including columns not used immediately (e.g., `is_spiritual`, `checklist`). Folder structure, patterns, domain logic, and CI/CD are designed for the complete product.

**During the 5-day build (5 humans + agents, ~99 SP),** the team implements 25 stories + brand + i18n:

| Area | What's Built |
|---|---|
| Foundation (Day 1) | Scaffold (client copied from Impulse + server from scratch), design tokens (OKLCH, converted from Impulse's Violet hex tokens directly in `tailwind.config.js`), **i18n setup (AR + EN)**, font self-hosting, brand mark, RTL conversion |
| Infrastructure | Auth, DB (all 8 tables), App Shell, RTL/LTR parity, Dark Mode, Accessibility |
| Goals | Repository, SMART Wizard, Dashboard (rings + health + 12-week bar), Goal Detail + Milestones |
| Tasks | Repository + Scoring Domain, Task Creation with Auto-Type, 3 Completion Types, Task List, **Backlog** |
| Habits | Repository, Build Habits (Boolean + Counter + Quit), MVD System, suggested habits library |
| Scoring | Scoring Engine, Progress Bar + 5 Day States |
| Settings | Day Types (Work/Light/Off) + work hours + day start |
| Capacity | **Visual gauge on Home screen** (the moat — not backend-only) |
| Home | Adaptive greeting, **Daily Pulse signature card**, assembled daily view |
| Onboarding | 3-step wizard, Goal vs Habit dialog |
| Polish | Empty States, Loading Skeletons, Error Toasts, Confirmation Dialogs |

**Project constraints:**

| Constraint | Rule |
|---|---|
| **Language** | **Bilingual parity** — Arabic (RTL) + English (LTR), both first-class. i18n from day 1. No language is "fallback." |
| **Voice / Tone** | **Non-formal but high-quality** — conversational, friendly, polished. Same person writes both. AI-assisted translation handles bilingual copy. |
| **Design assets** | **None pre-existing** — logo, illustrations, brand mark all created from scratch on Day 1. Design tokens converted from Impulse's Violet hex scale to OKLCH directly in `tailwind.config.js`/stylesheet — no separate design-system document. Current UX spec is a baseline; final design direction owned separately. |
| **Motion** | CSS Transitions only — no Framer Motion. Push CSS limits (View Transitions API, `@keyframes`, scroll-bound animations) for premium feel. |
| **Quick Add** | Home screen only (not FAB on every screen) |
| **Task Sort** | Priority-based only (no manual drag reorder) |
| **Capacity** | **Visual gauge on Home screen required** (the differentiator) |
| **Habits** | Boolean + Counter + Quit; users type custom habit names OR pick from a suggested habits library (no religious suggestions) |
| **Persistence** | Save on Action — no auto-save |
| **Destructive Actions** | Confirmation Dialogs — no Undo/Redo |
| **Deployment** | Client (Vite SPA) live on Vercel/Netlify from Day 1 onwards, preview deploys per PR, production on `main`. Server (Express/MongoDB) deployed to a persistent Node host (Render/Railway) — a standalone Express process doesn't fit Vercel's serverless/static model. |

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
| **Security** | HTTPS/TLS 1.3, JWT (15min access token) via `jsonwebtoken`, Rate limiting (100 req/min) |
| **Accessibility** | WCAG 2.1 AA, RTL-native, ≥4.5:1 contrast, ≥44px touch targets |
| **Scale** | 100 concurrent users |
| **Data Freshness** | React Query + Optimistic Updates — no polling |

### 1.3 Technical Constraints

**Runtime:**
- Standard long-running Node.js/Express process (not serverless/Edge) — persistent MongoDB connection pool held in memory across requests
- No WebSockets, no polling — client refetches via React Query after mutations

**Free-Tier Boundaries:**

| Service | Limit | Mitigation |
|---|---|---|
| **Client host (Vercel/Netlify)** | Free-tier bandwidth/build minutes | Static SPA build, no polling (React Query optimistic only) |
| **MongoDB Atlas (free tier / M0)** | 512 MB storage, shared cluster | Loading Skeletons handle cold-start latency |
| **Server host (Render/Railway free tier)** | Sleeps after inactivity | Loading Skeletons handle 2-5s cold start; confirm host choice before Day 5 deploy |

**Team Constraints:**
- 5 humans (2 juniors + 3 entry-level) — 2 of them agent-capable
- 5-day timeline
- BMAD method: agents dispatched in `ba` / `pm` / `designer` / `frontend` / `backend` / `qa` roles
- No dedicated UX designer for v1.0 — Impulse's existing CVA-based components as the client foundation, extended with Shadcn UI where needed; final design direction elevated separately
- No budget — every service must have a free tier
- No pre-existing design assets (logo, illustrations, Figma) — designed from scratch on Day 1; OKLCH tokens converted from Impulse's Violet hex scale directly in `tailwind.config.js`/stylesheet

**External Dependencies:** MongoDB Atlas, client host (Vercel/Netlify), server host (Render/Railway), GitHub

### 1.4 Cross-Cutting Concerns

| # | Concern | Approach |
|---|---|---|
| 1 | **Authentication** | Email/Password (register + login), `bcryptjs` hashing, JWT via `jsonwebtoken` (15min access + 7-day refresh), Express `auth.js` middleware verifies on protected routes. See §3.2. |
| 2 | **RTL-Native** | Arabic-first with Tailwind logical properties; `Intl.NumberFormat` for locale numbers |
| 3 | **Save on Action** | Every mutation saves immediately — no auto-save, no debouncing |
| 4 | **Confirmation Before Destruction** | Shadcn AlertDialog before every delete/archive |
| 5 | **Optimistic Updates** | React Query mutation + cache update after every API call |
| 6 | **Free-Tier Discipline** | No polling, projection queries, optimized indexes |
| 7 | **Graceful Degradation** | Loading Skeletons, Empty States, Error Toasts (retry) |
| 8 | **Day Type Adaptation** | Settings-driven (Work/Light/Off) affects capacity, habits, scoring |
| 9 | **Spiritual Data Privacy** | `habits.is_spiritual` column exists but unused until future phases |

---

## 2. Starter Template & Setup

### 2.1 Initialization

**Client (`hadaf/client/`)** — copied from the Impulse codebase, then rebranded and adapted. See `Docs/Impulse-Migration-Plan.md` for the full reuse map and merge-conflict resolution steps.

```bash
# Copy Impulse's frontend/ as the starting point for hadaf/client/, then:
npm install

# Additional shadcn primitives not already in Impulse
npx shadcn@latest add alert-dialog sheet tabs dropdown-menu progress tooltip
```

Impulse already ships: `vite`, `react` 19, `react-router-dom` 7, `@tanstack/react-query` 5, `zustand`, `tailwindcss` 4, `axios`, `react-hook-form` + `@hookform/resolvers`, `zod`, `sonner`, `lucide-react`, `class-variance-authority`, `tailwind-merge`, `vitest` + `@testing-library/react`.

**Server (`hadaf/server/`)** — new build, plain Express:

```bash
mkdir -p hadaf/server && cd hadaf/server
npm init -y

# Core dependencies
npm install express mongoose jsonwebtoken bcryptjs zod cors cookie-parser dotenv

# Development
npm install -D vitest nodemon
```

### 2.2 Key Choices

| Layer | Choice |
|---|---|
| Client language/tooling | TypeScript strict, Vite 7, React Router 7 |
| Client state | TanStack React Query (server state) + Zustand (auth/UI/date) + React Context (Theme/Locale/DayType) |
| Styling | Tailwind CSS v4 (Impulse's CVA-based `ui/` components, extended with Shadcn UI where Impulse lacks a primitive) + OKLCH CSS variables (light/dark), converted from Impulse's Violet hex tokens directly in `tailwind.config.js`/stylesheet |
| Motion | CSS Transitions only |
| Server language/tooling | Plain JavaScript, Express, Mongoose |
| Testing | Vitest (both client and server) |

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
  * `sameSite: "none"` (allows browser to pass the cookie cross-origin from the Vite client, which is deployed to a different host than the Express server)
  * `secure: true` (requires HTTPS context. Note: browsers treat localhost as secure)
* **CORS Origin Policy Binding**: If cookies are transmitted, CORS must strictly map to `process.env.FRONTEND_URL` and enable credentials. Wildcard origins (`*`) are prohibited:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:5173
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

  // Express global errorHandler.js snippet
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
| Server data (tasks, goals, habits) | TanStack React Query hooks (from Impulse) performing client-side queries/mutations against `import.meta.env.VITE_API_URL`, credentials included. |
| UI state (modals, forms) | Zustand `useUIStore` (from Impulse, extended for Hadaf modals) + local `useState`/`useReducer` |
| Day Type | React Context (`DayTypeProvider`) |
| Auth | Zustand `useAuthStore` (persisted, from Impulse) calling backend endpoints |
| Forms | React Hook Form + Zod |
| Theme | CSS variables + `data-theme` attribute |
| **Language (i18n)** | Custom cookie-based `LocaleProvider` (Arabic primary RTL, English first-class LTR). |

**API Fetcher Guideline**:
Frontend data mutations must target absolute backend addresses via environment variables. Relative routes are prohibited since client and server deploy to different hosts:
```typescript
// client/src/lib/api-client.ts (adapted from Impulse, axios-based)
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Crucial for cross-origin httpOnly cookies
  headers: { 'X-Requested-With': 'XMLHttpRequest' } // CSRF header, see §3.2
});
```

### 3.5 Infrastructure

**CI/CD (GitHub Actions):** Runs test checks on client and server as separate scripts/jobs.

**Environment Variables:**

| Variable | Scope | Purpose |
|---|---|---|
| `MONGO_URL` | Server | MongoDB Connection String (read by `hadaf/server/config/db.js`) |
| `JWT_SECRET` | Server | jsonwebtoken signature key |
| `FRONTEND_URL` | Server | Client origin, for CORS |
| `VITE_API_URL` | Client | Absolute backend server URL |
| `PORT` | Server | Express listener port (default `5000`) |

Server env vars are loaded from `hadaf/server/.env.local` (see `app.js`'s `dotenv.config({ path:
'.env.local' })`) — `.env.example` documents the shape but the actual local file is `.env.local`,
not `.env`.

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
| Controller functions | camelCase verb phrases | `createGoal()` |
| Domain functions | camelCase | `calculatePoints()` |
| Repositories | camelCase verb phrases | `goalsRepo.getActiveGoals()` |
| Types | PascalCase | `Task`, `GoalWithProgress` |
| Zod schemas | camelCase + `Schema` suffix | `createGoalSchema` |
| Files/Dirs | kebab-case | `goal-progress.ts` |

### 4.2 File Organization

| What | Where | Rule |
|---|---|---|
| Mongoose models | `server/models/{Name}.js` | One file per collection |
| Controllers | `server/controllers/{name}Controller.js` | One file per feature |
| Routes | `server/routes/{name}Routes.js` | One file per feature |
| React Query hooks | `client/src/features/{name}/hooks/` | One file per feature |
| Zod schemas | `client/src/features/{name}/schemas.ts` (client) / co-located with the Mongoose model (server, e.g. `Goal.createGoalSchema`) | Co-located with feature |
| Pure domain/business logic | `server/utils/{name}.js` | **Zero imports from Express, Mongoose, or React — plain JS functions, unit-testable** |
| Shadcn/Impulse UI components | `client/src/components/ui/` | Never add business logic |
| Shared components | `client/src/components/shared/` | Empty states, skeletons, error boundary |
| Tests | `server/tests/` (backend utils) + `client/src/**/*.test.tsx` (Vitest, from Impulse) | Unit tests for domain logic + component tests |

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

**Mongoose Query Rule:** ALWAYS `.select('specific fields')` for list queries — avoid returning full documents where a projection suffices. Never write Mongoose queries outside `controllers/` (or `models/` for schema-level statics/hooks).

### 4.4 Express Controller Example

```javascript
// server/controllers/taskController.js
const { calculateTaskPoints } = require('../utils/scoring');
const Task = require('../models/Task');
const AnalyticsEvent = require('../models/AnalyticsEvent');

exports.completeTask = async (req, res, next) => {
  try {
    const data = Task.completeTaskSchema.parse(req.body); // Zod schema co-located on the model, per the pattern in models/Goal.js
    const task = await Task.findOne({ _id: data.taskId, userId: req.user.id });
    if (!task) return res.status(404).json({ success: false, errorCode: 'UNKNOWN', error: 'errors.taskNotFound' });

    const points = calculateTaskPoints({ /* ... */ });
    task.status = 'completed';
    task.pointsEarned = points;
    task.actualDurationMinutes = data.actualMinutes;
    task.completedAt = new Date();
    await task.save();

    await AnalyticsEvent.create({ userId: req.user.id, eventType: 'task_complete', eventData: { taskId: task._id, points } });
    res.json({ success: true, data: { points } });
  } catch (error) {
    next(error); // handled by global errorHandler.js (§3.3)
  }
};
```

### 4.5 React Query Hook Example

```typescript
// client/src/features/tasks/hooks/useTasks.ts — Optimistic update pattern (from Impulse)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useTasks(date: string) {
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery({
    queryKey: ['tasks', date],
    queryFn: () => apiClient.get(`/tasks?date=${date}`).then(res => res.data.data),
  });

  const completeTask = useMutation({
    mutationFn: ({ taskId, actualMinutes }: { taskId: string; actualMinutes?: number }) =>
      apiClient.post(`/tasks/${taskId}/complete`, { actualMinutes }).then(res => res.data.data),
    onMutate: async ({ taskId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', date] });
      queryClient.setQueryData(['tasks', date], (old: Task[]) =>
        old?.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', date] }),
  });

  return { tasks: data ?? [], error, isLoading, completeTask: completeTask.mutate };
}
```

### 4.6 Enforcement Rules

**Must:**
1. Never import `mongoose` outside `models/` or `controllers/`
2. Never import Express/Mongoose/React in `server/utils/` — pure JavaScript only
3. Always validate with Zod before DB writes
4. Always use Tailwind logical properties — `ms-`/`me-`, never `ml-`/`mr-`
5. Always use the `ApiResponse<T>` contract (§3.3) for controller responses
6. Always show Confirmation Dialog before destructive actions
7. Always provide Empty State + Loading Skeleton for every screen
8. Always test in Arabic RTL before merge
9. Always use CSS Transitions only — no Framer Motion
10. Always use `Intl.NumberFormat` for number display

**Never:**

| Anti-Pattern | Why |
|---|---|
| Mongoose queries outside `models/`/`controllers/` | Bypasses the MVC layering (§3.3) |
| `left`/`right` CSS | Breaks RTL |
| Unprojected list queries returning full documents | Performance + security |
| `jose` | Not needed — standard Express is not Edge-constrained; use `jsonwebtoken` (§3.2) |
| Auto-save / debounced save | Save on Action pattern |
| Polling / `refreshInterval` | Use React Query cache invalidation after actions |
| Negative messaging | Always lead with accomplishments |
| Hard-deleting user data | Soft-delete with status column |

---

## 5. Project Directory Structure

```
hadaf/
├── client/                               # Vite + React SPA — UI base imported from Impulse
│   │                                     #   (see Docs/Impulse-Migration-Plan.md for the full reuse map)
│   ├── public/fonts/                     # Fonts (Tajawal, IBM Plex Sans Arabic)
│   ├── src/
│   │   ├── app/
│   │   │   ├── App.tsx                   # Root: ErrorBoundary → AppProviders → AppRouter
│   │   │   ├── providers.tsx             # QueryClient, BrowserRouter, Toaster, ThemeProvider, LocaleProvider, DayTypeProvider
│   │   │   └── router.tsx                # Routes (lazy-loaded), RequireAuth, RedirectIfAuth
│   │   ├── components/                   # Reusable client components
│   │   │   ├── ui/                       # CVA/shadcn primitives (from Impulse + additions)
│   │   │   ├── shared/                   # Language switcher, theme toggle, states, ErrorBoundary
│   │   │   └── layouts/                  # Sidebar, BottomNav, AppLayout, Header
│   │   ├── features/                     # auth/ goals/ tasks/ habits/ scoring/ home/ onboarding/ settings/ dashboard/
│   │   │                                 #   each: api/ (React Query) components/ hooks/ pages/ types/ utils/
│   │   ├── providers/                    # ThemeProvider, LocaleProvider, DayTypeProvider
│   │   ├── i18n/                         # ar.ts, en.ts, useTranslation hook
│   │   ├── stores/                       # useAuthStore, useUIStore, useDateStore (Zustand, from Impulse)
│   │   ├── lib/                          # api-client.ts (axios), react-query.ts
│   │   └── utils/                        # cn.ts, errorHandler.ts, rateLimiter.ts (from Impulse)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js                # OKLCH tokens (converted from Impulse Violet, design authority — no separate DESIGN.md), Tajawal+IBM Plex, logical properties
│   └── tsconfig.json
│
└── server/                               # Node.js / Express Backend (MVC in pure JS)
    ├── config/                           # Mongoose connection & configs
    │   └── db.js
    ├── models/                           # M (Model): Mongoose collections (+ co-located Zod schemas)
    │   ├── User.js
    │   ├── Goal.js
    │   ├── Milestone.js
    │   ├── Task.js
    │   ├── Habit.js
    │   ├── HabitLog.js
    │   ├── DailySummary.js
    │   └── AnalyticsEvent.js
    ├── controllers/                      # C (Controller): Express handlers
    │   ├── authController.js
    │   ├── userController.js             # User settings update
    │   ├── goalController.js
    │   ├── milestoneController.js        # Milestone status/order mutations
    │   ├── taskController.js
    │   └── habitController.js
    ├── routes/                           # Express Endpoints
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── goalRoutes.js
    │   ├── milestoneRoutes.js
    │   ├── taskRoutes.js
    │   └── habitRoutes.js
    ├── middleware/                       # Express custom middleware
    │   ├── auth.js                       # JWT parse & injection
    │   └── rateLimiter.js
    ├── utils/                            # Password hashing, JWT sign/verify, business-logic calculations, error pipeline
    │   ├── appError.js
    │   ├── catchAsync.js
    │   └── errorHandler.js               # Global error handler — Mongoose code 11000, ValidationError, JWT errors
    ├── app.js                            # Express bootstrap
    └── package.json
```

---

## 6. Business Logic Specifications (Backend Utils)

All core mathematical calculations and business rules are handled by pure, unit-testable JavaScript utility files under **`hadaf/server/utils/`**. These utilities have zero database or HTTP framework dependencies.

### 6.1 Scoring (`server/utils/scoring.js`)

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

### 6.2 Goal Progress (`server/utils/goal-progress.js`)

**Hybrid Progress (FR6):** `(tasks × 60%) + (milestones × 40%)`

**Goal Health (FR6.3):** ratio = actual/expected. ≥85%→🟢, ≥70%→🟡, ≥50%→🟠, <50%→🔴

**Key functions:** `calculateHybridProgress(input)`, `calculateGoalHealth(actual, week, total)`, `getCurrentWeek(cycleStart, today)`, `calculateWeeklyExecutionScore(completed, total)`

### 6.3 Capacity (`server/utils/capacity.js`)

```
capacity = (work_end - work_start - lunch) × 0.80
if light_day: capacity × 0.50
if off_day: capacity = 0
```

**Key functions:** `calculateDailyCapacity(input)`, `calculatePlannedTime(tasks)`, `parseTimeToMinutes(time)`

### 6.4 Day State (`server/utils/day-state.js`)

| Ratio | State |
|---|---|
| ≥150% | legendary |
| ≥120% | amazing |
| ≥100% | perfect |
| ≥50% | good_enough |
| <50% | low |

**Adaptive Target:** Rolling 7-day avg. Light day ×0.5, Off day ×0.2.

**Key functions:** `calculateDayState(points, target)`, `calculateAdaptiveDailyTarget(recent, dayType)`

### 6.5 Task Type Detection (`server/utils/task-type.js`)

```
if time_block_start AND time_block_end → 'scheduled'
else if planned_duration_minutes > 0 → 'flexible'
else → 'quick'
```

**Key functions:** `detectTaskType(input)`, `calculateBlockDuration(start, end)`

### 6.7 Zod Schemas (Summary)

Server-side, each schema is co-located directly on its Mongoose model file (e.g.
`server/models/Goal.js` exports `Goal.createGoalSchema` and `Goal.softDeleteGoalSchema` — the
pattern already established in the committed `Goal.js`/`User.js`), not in a separate `schemas/`
folder:

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

Every completion: optimistic React Query mutation → Express controller call → cache invalidation/revalidate.

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

FCP ≤1.5s, LCP ≤2.0s, TTI ≤2.5s, CLS ≤0.1, JS ≤150KB gzip, DB query ≤200ms, API response ≤500ms

**Optimization:** No Framer Motion (-40KB), self-hosted fonts, font subsetting, Vite code-splitting/dynamic imports, projection queries, React Query dedup, no polling, skeleton loading.

### 9.2 Security

| Area | Implementation |
|---|---|
| JWT | `jsonwebtoken` HS256, 15min access, 7-day refresh, httpOnly cookies |
| Input | Zod on client (React Hook Form) + server (controllers), Mongoose schema validation |
| Authorization | Every query scoped to `userId` from the verified JWT |
| Rate limit | 100 req/min, in-memory Map |
| Privacy | `isSpiritual` field, `isRelapse` never exposed |
| Headers | X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy |
| HTTPS | Enforced by client host (Vercel/Netlify) and server host (Render/Railway) |

---

## 10. Deployment Runbook

### 10.1 Setup

```bash
git clone https://github.com/{org}/hadaf.git && cd hadaf

# Client
cd hadaf/client
npm install
cp .env.example .env.local   # Fill: VITE_API_URL
npm run dev                  # → http://localhost:5173

# Server (separate terminal)
cd hadaf/server
npm install
cp .env.example .env.local   # Fill: MONGO_URL, JWT_SECRET, FRONTEND_URL
npm run dev                  # → http://localhost:5000
```

### 10.2 Scripts

Client: `dev`, `build`, `preview`, `lint`, `type-check`, `test`.
Server: `dev` (nodemon), `start`, `test`.

### 10.3 Pre-Deploy Checklist

1. Client: `npm run type-check` + `npm run lint` + `npm run test` + `npm run build`
2. Server: `npm run test`
3. Env vars set on both hosts (client: `VITE_API_URL`; server: `MONGO_URL`, `JWT_SECRET`, `FRONTEND_URL`)
4. RTL + dark mode + mobile verified
5. Lighthouse ≥85 Desktop, ≥75 Mobile

### 10.4 Rollback

Client host (Vercel/Netlify): Deployments → previous → Promote to Production. Server host (Render/Railway): redeploy previous build/commit. DB: MongoDB Atlas → point-in-time restore (if on a tier that supports it) or manual backup restore.

---

## 11. ADR Summary

| # | Decision | Chosen | Rationale |
|---|---|---|---|
| 1 | JWT library | **jsonwebtoken** | Standard Node.js server, no Edge Runtime constraint |
| 2 | Database | **MongoDB + Mongoose** | Document model fits nested settings/checklist fields; team familiarity |
| 3 | Client framework | **Vite + React Router** (via Impulse reuse) | Fast dev loop, team already has a working codebase to adapt — see `Docs/Impulse-Migration-Plan.md` |
| 4 | Data freshness | **React Query + Optimistic Updates** (via Impulse reuse) | Cache-aware, zero background polling |
| 5 | Client local state | **Zustand** (via Impulse reuse) | Already wired for auth/UI/date in Impulse; avoids introducing Redux/other state libs |
| 6 | Motion | **CSS Transitions** | No dependency, smaller bundle |
| 7 | Persistence | **Save on Action** | Simpler than auto-save |
| 8 | Destructive protection | **Confirmation Dialogs** | Simpler than Command Pattern |
| 9 | Subtask model | **Checklist (embedded array)** | 90% value at 10% complexity |
| 10 | Cold start | **Loading Skeletons** | Free-tier Node host sleeps on inactivity; acceptable UX cost |
| 11 | Rate limiting | **In-memory Map** | Sufficient for 100 users |
| 12 | Task types | **Auto-detect** | Zero decisions for user |
| 13 | Streak storage | **Computed from tasks/logs** | No staleness, no sync issues |
| 14 | Test framework | **Vitest** | Fast, ESM-native; shared across client (from Impulse) and server |

---

**— End of Architecture v2.1 — MVP —**
