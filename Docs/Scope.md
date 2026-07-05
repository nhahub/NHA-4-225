# 📋 Hadaf (هدف) — Project Scope Summary

> **Version:** 2.0 | **Date:** June 2026
> **Team:** 5 humans (2 juniors + 3 entry-level, 2 agent-capable) | **Duration:** 20 days (5 × 4-day sprints)
> **Language:** Bilingual parity — Arabic (RTL) + English (LTR), both first-class
> **Methodology:** Agile (daily standups, weekly demos) + BMAD agent roles + agentic coding
> **Submission:** Live deployed app (Vercel) + public code repo + cinematic demo video (1–3 min)

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
| **INF** (Infrastructure) | 10 | 31 | Auth (Email/Password + JWT), PostgreSQL (Neon), responsive shell, RTL, dark/light mode, CI/CD, accessibility |
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

### Key Project Constraints

| Constraint | Rule |
|---|---|
| **Language** | Bilingual parity — Arabic (RTL) and English (LTR) ship together, both first-class. i18n from day 1, full string catalog in both languages. No language is "fallback." |
| **Voice / Tone** | Non-formal but high-quality — conversational, friendly, polished. Not corporate / stiff, not slangy. AI-assisted translation produces this naturally. Same person should feel to have written both languages. |
| **Design** | Current UX spec is a baseline. Final design direction is owned and elevated separately to an impeccable bar. **No pre-existing assets (logo, illustrations, Figma)** — all designed from scratch in-Sprint 0. |
| **Motion** | CSS Transitions only — no Framer Motion. Push CSS to its limits (View Transitions API, `@keyframes`, scroll-bound animations) for premium feel. |
| **Quick Add** | Accessible from Home screen only (not floating on every screen) |
| **Task Sorting** | Priority-based only (no manual drag reorder) |
| **Capacity** | **Visual gauge on Home screen is required** (the moat) — not backend-only as in v1.0 |
| **Habits** | Boolean + Counter only. Users type habit names (no suggested library) |
| **Persistence** | Save on Action — no auto-save |
| **Destructive Actions** | Confirmation Dialogs — no Undo/Redo |
| **Deployment** | Live on Vercel from Day 2 onwards (preview deploys per PR, production on `main`) |
| **Demo Video** | Cinematic 1–3 min video using **Khaled's story arc** (loses streak → discovers MVD → never loses momentum). Bilingual (Arabic VO + English subtitles). |

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS + Shadcn UI |
| **Motion** | CSS Transitions only |
| **Backend** | Next.js Server Actions (Vercel Serverless) |
| **Database** | PostgreSQL (Neon free tier) + Drizzle ORM |
| **Auth** | JWT via `jose` + Email/Password |
| **Data Fetching** | SWR with Optimistic Updates (`mutate()` after actions — no polling) |
| **Validation** | Zod schemas (client + server) |
| **CI/CD** | GitHub Actions (lint + type-check + test + build) → Vercel auto-deploy |
| **Testing** | Vitest (domain unit tests) + manual testing |

**Runtime dependencies:** 7 (next, react, drizzle-orm, @neondatabase/serverless, jose, swr, zod)

---

## 4. Sprint Plan (20 days)

| Sprint | Days | Focus | Stories | SP (target) |
|---|---|---|---|---|
| **Sprint 0** | 1-2 | Foundation & Brand | Scaffold, design tokens, i18n, fonts, 10 illustrations, Vercel deploy | ~20 |
| **Sprint 1** | 3-7 | Infrastructure & Core | INF (all), App Shell, Auth, DB (all 8 tables), Domain logic (5 modules) | ~35 |
| **Sprint 2** | 8-12 | Goals + Tasks + Habits (3 parallel tracks) | E1 (4) + E2 (4) + E3 (3) | ~42 |
| **Sprint 3** | 13-16 | Home, Onboarding, Scoring | E4 (2), E6 (1), E12 (1), HOME (2), ONB (3) | ~31 |
| **Sprint 4** | 17-20 | Polish, Deploy, Demo | POL (4), perf, accessibility, demo video, final deploy | ~17 |
| **Total** | **20 days** | | **~34 stories + 5 demos** | **~145 SP** |

> **SP estimate is recalibrated** for the new team (5 humans + 2 agent-capable dispatching BMAD-role subagents). Agents deliver ~3–5× human-only velocity on well-scoped tasks.

### Sprint Demos

| Sprint | What We Demo |
|---|---|
| **Sprint 0** | Vercel preview deploys "Coming soon" landing page → brand mark visible → language toggle works (AR ↔ EN) → 10 illustrations shipped → design tokens applied |
| **Sprint 1** | Login (Email/Password) → responsive shell (mobile + desktop) → RTL/LTR both render correctly → dark/light theme → all 8 tables connected → domain logic passes unit tests → first skeleton + empty states visible |
| **Sprint 2** | Create goal via wizard (both languages) → create linked task (auto-type detection) → see dashboard with rings + 12-week bar → create Boolean + Counter habit → see MVD toggle → first scoring points awarded |
| **Sprint 3** | Complete tasks (3 types, both languages) → Contribution Pulse animation → progress bar with 4 colors → 5 day states visible → Daily Pulse card on Home → full 3-step onboarding flow |
| **Sprint 4** | Full end-to-end user journey in both languages → loading + empty + error states all polished → Lighthouse ≥ 85 desktop / ≥ 75 mobile → demo video → live on production |

### Critical Decision Point — Day 12

After Sprint 2, a real user (any human, even non-team) must complete: **create goal → create task → complete task → see progress** without help, in both languages. If they cannot, the UX has a problem and we address it before Sprint 3.

---

## 5. Success Criteria

| Category | Criteria |
|---|---|
| **Core Loop** | Create goal → create linked task → complete task → see points + progress bar update (in both languages) |
| **Habits** | Create Boolean + Counter habits → log daily → see MVD auto-switch on Light Day |
| **Onboarding** | New user finishes 3-step wizard in ≤ 5 minutes |
| **Resilient UI** | Every screen has empty state + loading skeleton + error toast with retry |
| **Bilingual** | Every screen renders perfectly in Arabic (RTL) and English (LTR). No "missing translation" placeholders. i18n keys fully covered. |
| **Voice** | Microcopy is non-formal, friendly, polished — same person wrote both languages. No corporate stiffness, no slang. |
| **Quality** | RTL/LTR correct, dark mode correct, mobile responsive (375px+), Lighthouse ≥ 85 Desktop / ≥ 75 Mobile |
| **Architecture** | Domain logic pure (no React/Drizzle imports), DB queries in repositories only, clean folder structure |
| **Deployment** | Live on Vercel with CI/CD green on every push to `main` — preview deploys per PR |
| **Demo Video** | 1–3 min cinematic video, Arabic VO + English subtitles, telling **Khaled's story arc** (loses streak → discovers MVD → never loses momentum) |
| **Code Quality** | TypeScript strict, ESLint clean, unit tests for all domain functions |
| **Capacity Gauge** | Visual daily capacity gauge on Home screen (the moat — not backend-only) |

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
| **i18n-First (Bilingual)** | `next-intl` (or equivalent) from day 1. Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`) work in both RTL (Arabic) and LTR (English). `<html dir>` and `<html lang>` set from URL or user preference. |
| **Graceful Degradation** | Loading Skeletons (Neon cold start 2-5s), Empty States (CTA), Error Toasts (retry) |

---

## 8. Team & Coordination

### 8.1 Team Composition

| Role | Count | Responsibility |
|---|---|---|
| **Junior developer** (agent-capable) | 2 | Dispatch BMAD-role subagents (BA, PM, Designer, Frontend, Backend, QA). Review agent output, unblock edge cases, merge PRs. |
| **Entry-level developer** | 3 | Manual implementation on well-scoped tasks, illustration/icon work, copy/i18n catalog, QA passes, demo video production. |
| **Product owner (you)** | 1 | Final say on scope, design direction, voice/tone, demo narrative. Daily 15-min standup. Sign off on Done. |

### 8.2 Daily Cadence

- **Standup (15 min, async OK):** What shipped yesterday? What's shipping today? Blockers?
- **PR review:** At least one other human reviews every PR before merge.
- **Demo at end of each sprint** (Day 2, 7, 12, 16, 20): Live walkthrough in both languages.

### 8.3 BMAD Agent Roles (used by agent-capable humans)

| Role | Responsibility |
|---|---|
| `ba` | User stories, acceptance criteria, edge cases, bilingual copy briefs |
| `pm` | Sprint ordering, scope cuts, dependency mapping, critical-path |
| `designer` | Design tokens, illustrations, motion specs, RTL/LTR layouts, brand mark |
| `frontend` | Components, screens, responsive layouts, i18n string usage |
| `backend` | Server actions, repositories, Drizzle queries, Zod schemas |
| `qa` | Unit tests, manual test cases, edge case hunts, accessibility audit, Lighthouse checks |

### 8.4 Definition of Done (per story)

1. Feature works in both Arabic (RTL) and English (LTR) — verified manually
2. Domain logic has unit tests (where applicable)
3. Loading + empty + error states exist
4. Lighthouse score ≥ 85 desktop / ≥ 75 mobile on the affected page
5. PR reviewed by at least one other human
6. No `any` in TypeScript, ESLint clean
7. No hard-coded strings (all in i18n catalog)
8. No new technical debt introduced (defer is OK, hack is not)

---

---