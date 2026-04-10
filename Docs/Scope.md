# 📋 Hadaf (هدف) — Internship Scope Summary

> **Version:** 1.0 | **Date:** June 2025
> **Team:** 5 interns (Next.js learners) | **Duration:** 8 weeks (4 × 2-week sprints)
> **Language:** Arabic-only (RTL)

---

## 1. What is Hadaf?

**Hadaf (هدف)** is a smart goal and habit management system that flows from **12-week strategic goals → daily tasks → visible progress**, combined with flexible habit tracking. The philosophy is **Elastic Motivation** — the system protects the user's momentum even on bad days and normalizes "good enough" as a real achievement.

**Tagline:** "كل يوم تقتطع قطعة من هدفك" — every day you chip away at your goal.

**The Four Pillars:**

| Pillar | What It Means |
|---|---|
| Strategic Goals (12-Week Year) | From vision to execution — quarterly goals broken into milestones and tasks |
| Habits (Build + MVD) | Daily behaviors tracked as Boolean or Counter — with a Minimum Viable Day version |
| Fair Scoring | Points based on actual effort + estimation accuracy — not just checkboxes |
| Anti-Overwhelm Design | Day Types, capacity awareness, "Good Enough Day" messaging — the system thinks so you don't have to |

---

## 2. What the Internship Builds

The internship delivers the **core product loop** — enough to prove the value proposition end-to-end.

### Included Epics & Stories (34 stories, ~115 SP)

| Epic | Stories | SP | What's Delivered |
|---|---|---|---|
| **INF** (Infrastructure) | 10 | 31 | Auth (Google OAuth + JWT), PostgreSQL (Neon), responsive shell, RTL, dark/light mode, CI/CD, accessibility |
| **E1** (Goals) | 4 | 18 | Goals repository + domain logic, SMART wizard (3 steps), Goal Dashboard with rings + 12-week bar, Goal Detail with milestones |
| **E2** (Tasks) | 4 | 16 | Tasks repository + scoring domain, Task Creation with auto-type detection, 3 Completion Types (Smart/Manual/Quick), Task list with sorting |
| **E3** (Habits) | 3 | 8 | Habits repository, Build Habits (Boolean + Counter), MVD System |
| **E4** (Scoring) | 2 | 8 | Scoring Engine integration, Dynamic Progress Bar + 5 Day States |
| **E6** (Settings) | 1 | 3 | Day Types configuration (Work/Light/Off) + work hours + day start |
| **E12** (Capacity) | 1 | 3 | Daily Capacity calculation (backend only) |
| **HOME** (Home Screen) | 2 | 8 | Adaptive morning greeting (3 scenarios), Home screen layout assembly |
| **ONB** (Onboarding) | 3 | 9 | 3-step wizard: Goal → Habits + MVD → Settings + First Task |
| **POL** (Polish) | 4 | 11 | Empty states, loading skeletons, error toasts with retry, confirmation dialogs |
| **Total** | **34** | **~115** | |

### Key Internship Constraints

| Constraint | Rule |
|---|---|
| **Language** | Arabic-only. RTL infrastructure is built, but no language toggle UI |
| **Motion** | CSS Transitions only — no Framer Motion |
| **Quick Add** | Accessible from Home screen only (not floating on every screen) |
| **Task Sorting** | Priority-based only (no manual drag reorder) |
| **Capacity** | Backend calculation exists; no visual gauge on Home screen |
| **Habits** | Boolean + Counter only. Users type habit names (no suggested library) |
| **Persistence** | Save on Action — no auto-save |
| **Destructive Actions** | Confirmation Dialogs — no Undo/Redo |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS + Shadcn UI |
| **Motion** | CSS Transitions only |
| **Backend** | Next.js Server Actions (Vercel Serverless) |
| **Database** | PostgreSQL (Neon free tier) + Drizzle ORM |
| **Auth** | JWT via `jose` + Google OAuth |
| **Data Fetching** | SWR with Optimistic Updates (`mutate()` after actions — no polling) |
| **Validation** | Zod schemas (client + server) |
| **CI/CD** | GitHub Actions (lint + type-check + test + build) → Vercel auto-deploy |
| **Testing** | Vitest (domain unit tests) + manual testing |

**Runtime dependencies:** 7 (next, react, drizzle-orm, @neondatabase/serverless, jose, swr, zod)

---

## 4. Sprint Plan

| Sprint | Weeks | Focus | Stories | SP |
|---|---|---|---|---|
| **Sprint 1** | 1-2 | Infrastructure & Foundation | INF-1 through INF-10 | 31 |
| **Sprint 2** | 3-4 | Core CRUD (Goals + Tasks + Habits) | E1-1, E1-2, E1-3, E1-4, E2-1, E2-2, E3-1, E2-5 | 31 |
| **Sprint 3** | 5-6 | Features & Integration | E2-3, E3-2, E3-3, E6-2, E12-1, E4-1, E4-3, HOME-1, HOME-2 | 33 |
| **Sprint 4** | 7-8 | Onboarding + Polish | ONB-1, ONB-2, ONB-3, POL-1, POL-2, POL-3, POL-4 | 20 |
| **Total** | **8 weeks** | | **34 stories** | **~115 SP** |

### Sprint Demos

| Sprint | What We Demo |
|---|---|
| **Sprint 1** | Login → see responsive shell → RTL Arabic → dark mode toggle → navigate tabs → empty states |
| **Sprint 2** | Create goal via wizard → create linked task (auto-type) → see dashboard with rings → see task list |
| **Sprint 3** | Complete tasks (3 types) → points awarded → progress bar colors → habits + MVD → Day Types → Home screen |
| **Sprint 4** | Full onboarding flow → all polish states → end-to-end user journey |

---

## 5. Success Criteria

| Category | Criteria |
|---|---|
| **Core Loop** | Create goal → create linked task → complete task → see points + progress bar update |
| **Habits** | Create Boolean + Counter habits → log daily → see MVD auto-switch on Light Day |
| **Onboarding** | New user finishes 3-step wizard in ≤ 5 minutes |
| **Resilient UI** | Every screen has empty state + loading skeleton + error toast with retry |
| **Quality** | RTL correct in Arabic, dark mode correct, mobile responsive (375px+), Lighthouse ≥ 85 Desktop |
| **Architecture** | Domain logic pure (no React/Drizzle imports), DB queries in repositories only, clean folder structure |
| **Deployment** | Running on Vercel with CI/CD green on every push to `main` |
| **Code Quality** | TypeScript strict, ESLint clean, unit tests for all domain functions |

---

## 6. Database

All **8 tables** are created in Sprint 1:

| Table | Purpose |
|---|---|
| `users` | Profile + settings JSONB (work hours, day start, off days, theme, language) |
| `goals` | 12-week strategic goals with 5 categories + status lifecycle |
| `milestones` | Ordered phases within goals |
| `tasks` | 3 auto-detected types, scoring, checklist JSONB |
| `habits` | Boolean / Counter / Quit types with MVD values |
| `habit_logs` | Daily habit completion records |
| `daily_summaries` | Pre-computed daily totals + day state |
| `analytics_events` | Product event tracking for KPIs |

---

## 7. Architecture Highlights

| Principle | Implementation |
|---|---|
| **Layered Architecture** | `domain/` (pure logic) → `data/repositories/` (DB) → `features/` (actions + hooks) → `components/` (UI) |
| **Server Actions** | Every mutation goes through `'use server'` functions with auth + Zod validation |
| **Optimistic Updates** | SWR `mutate()` fires immediately on client; server confirms; no polling |
| **Domain Purity** | `domain/*.ts` has **zero** imports from React, Next.js, or Drizzle — fully unit-testable |
| **RTL-First** | Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) everywhere — no `ml-`/`mr-` |
| **Graceful Degradation** | Loading Skeletons (Neon cold start 2-5s), Empty States (CTA), Error Toasts (retry) |

---