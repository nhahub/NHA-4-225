# Agent Operating Instructions — Hadaf (هدف)

> **Who this is for:** any coding agent working on this project — MiniMax, Gemini, Claude Code,
> or anything else. "You" below means whichever agent is executing.
>
> **Scope:** standing playbook for every work order, not specific to one epic. Read this once,
> then read the current work order (e.g. `WORK-ORDER-E0-Foundation.md`) for the actual tasks. If
> this file and a work order ever disagree on **process** (not on which task to do next), this
> file wins — flag the conflict instead of guessing.

---

## 1. Role

You are the implementer. The team lead (working with the project owner) produces work orders,
reconciles docs, and reviews your output — you don't need to re-derive the plan. Work orders give
you ranked tasks with concrete file paths and acceptance criteria; execute them in order, and
don't re-litigate design decisions already settled in the docs.

**Default execution model is single agent, sequential**, unless a specific work order states
otherwise. `Docs/team-task-assignments.md` describes how the *human* team divides stories across
5 people — that's a separate plan for human contributors, not an instruction to parallelize
yourself. Work each story's task list in the order given; a story's own "Dependencies" line tells
you what must be finished first.

If a work order's instructions conflict with what you find in the actual codebase, or an
acceptance criterion can't be satisfied as written, **stop and flag it** rather than silently
reinterpreting it.

## 2. Source-of-Truth Hierarchy

Every file below exists on disk right now — the hierarchy contains nothing aspirational. Highest
wins:

1. `Docs/project-context.md` — the canonical rules file (guardrails, conventions, review
   requirement). Read it in full before your first task.
2. `Docs/PRD.md` + `Docs/Epics.md` — product scope and the story list. `Docs/Scope.md` is stale
   — never plan from it.
3. `Docs/Architecture.md` — schema (8 collections), API contract, folder structure, naming
   conventions, ADRs.
4. `Docs/Impulse-Migration-Plan.md` — what's copied from the Impulse codebase vs. built new; the
   component reuse map; the RTL conversion checklist.
5. `Docs/UX-Design-Specification.md` — screens, flows, microcopy — **except** §5.1/§5.2 (colors/
   type: superseded, see §3 below) and §8.7 ("Arabic-only": stale, bilingual parity is the real
   mandate).
6. **The actual file tree and git history** — what's really been built. Docs describe intent;
   the codebase describes reality. When a work order's "Current State" section and the live
   codebase disagree (someone shipped more since it was written), trust the codebase and note
   the discrepancy back to the team lead.

**Deleted files — do not resurrect:** `DESIGN.md` and `PRODUCT.md` were deliberately deleted by
the project owner. If any doc still mentions them, treat that mention as stale. Do not recreate
them, do not block waiting for them, and do not invent their contents.

## 3. Design Tokens — the code is the authority

There is no separate design-system document. The design authority is the client's own token
layer: **`hadaf/client/tailwind.config.js` + the global stylesheet.**

- Tokens are **OKLCH only**, converted from Impulse's Violet hex scale (`colors.brand.50`–`950`,
  e.g. `500: "#8B5CF6"`) during E0-1. After that conversion, never introduce a raw hex value in
  application code — extend the token layer instead.
- Compute **real WCAG contrast** (≥4.5:1) for any new fill/text pairing — never assume a
  saturated color takes white text.
- The 5 status colors (progress/health: red/orange/amber/green/gold family) mean progress/health
  ONLY — never decorative, never brand.

## 4. Non-Negotiable Guardrails

Full list in `Docs/project-context.md` — do not skip reading it. The ones most often missed:

- **RTL**: Arabic is default. Tailwind logical properties only (`ms-`/`me-`/`ps-`/`pe-`/
  `start-`/`end-`/`text-start`/`text-end`). `ml-`/`mr-`/`left-`/`right-`/`text-left` are bugs,
  not style choices.
- **i18n**: no hardcoded user-facing strings. Every string ships in **both** `ar` and `en`
  dictionaries in the same commit that introduces it. Dates and numbers are locale-aware
  (`Intl.NumberFormat`/`Intl.DateTimeFormat`) — no hardcoded `en-US`.
- **Motion**: CSS transitions only. Framer Motion is banned — don't add it for any reason.
- **Voice**: accomplishment-first ("أنجزت ٥ من ٨", not "لم تكمل ٣ مهام"). No mascots, confetti,
  badges, or gamification cartoon language.
- **Elevation**: flat by default; shadow only on elements floating above the page
  (dialog/sheet/toast/dropdown); never a full border and a box-shadow on the same element.
- **Touch targets**: ≥44×44px on every interactive element.
- **Stack lock**: the documented stack doesn't get new dependencies without asking first. This
  includes swapping a documented package for a similar one — when a work order tells you to make
  a specific swap (e.g. `bcrypt` → `bcryptjs`), that's one-time permission for that swap, not a
  general license to substitute packages.
- **Version lock**: `Architecture.md` names packages, not exact versions. Build against whatever
  major is actually installed (check `package.json`/`node_modules`) — don't downgrade a package to
  match an assumption from an older doc example, and don't upgrade one without being told to. If
  an installed major behaves differently than an example snippet assumes (e.g. a newer framework
  version changing error-handling or API behavior), trust the installed version's real behavior
  and adapt the code, don't fight the framework to match stale prose.

## 5. SOLID Principles — applied to this codebase specifically

Not abstract definitions — what each one means in Hadaf's actual folder structure:

- **Single Responsibility**: `hadaf/server/utils/*.js` contains pure business logic only
  (scoring, goal-progress, capacity, day-state, task-type calculations) — zero
  Express/Mongoose/HTTP concerns. Controllers do request parsing, calling the right util/model,
  and shaping the response — nothing else. One React component owns one concern (a `TaskCard`
  renders a task; it doesn't also own fetch logic — that's the hook's job).
- **Open/Closed**: adding a new task type or habit type extends the existing type union +
  lookup/switch table. Don't fork a parallel code path (a second `TaskFormModal` variant, a
  second scoring function) for a case the existing one could handle with one more branch.
- **Liskov Substitution**: not generally applicable at this project's scope (no class hierarchies
  or polymorphic domain objects). If you find yourself building one, flag it — it's unusual
  enough here to deserve a second look.
- **Interface Segregation**: React Query hooks return only what the calling component needs — a
  `useGoals()` hook returns goal view-model shapes, not raw Mongoose documents with every
  internal field. Don't leak backend-shaped data structures into the client.
- **Dependency Inversion**: `server/utils/` never imports Express or Mongoose — controllers
  depend on utils, never the reverse. On the client, `lib/api-client.ts` is the single point
  that imports axios; nothing else talks to `axios` directly.

**One grandfathered exception to the `utils/` purity rule:** the error pipeline already committed
to the repo (`utils/appError.js`, `utils/catchAsync.js`, `utils/errorHandler.js`) is
Express-facing glue living in `utils/`. Leave it where it is — don't "fix" it by relocating it,
and don't use it as precedent: every *new* file in `server/utils/` (scoring, goal-progress,
capacity, day-state, task-type) must be pure — plain functions, zero Express/Mongoose/HTTP
awareness, unit-testable in isolation.

## 6. API Response Contract — enforce on both ends

Every backend response must match `Docs/Architecture.md` §3.3's `ApiResponse<T>` shape:

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode: 'VALIDATION' | 'AUTH' | 'DB_ERROR' | 'RATE_LIMIT' | 'UNKNOWN'; field?: string }
```

This is a **two-sided contract** — a controller emitting the right shape is only half of it. The
client's `api-client.ts` interceptor (adapted from Impulse) must also be conformant: unwrap
`response.data.data` on success (so hooks receive `T`, not the `{success, data}` envelope), and
read `.error`/`.errorCode` on failure (not a `messageEn`/`message` field that doesn't exist in
this contract). If you touch either side without checking the other, you will produce a bug that
only shows up at runtime, not at compile time — axios doesn't type-check the actual response
body.

**`error` values are i18n dictionary keys, not display strings** — e.g. `auth.errors.emailExists`,
`errors.validationFailed` (see the §3.3 examples in `Architecture.md`). The client must translate
them through the `ar`/`en` dictionaries before showing them in a toast; never render the raw key
to the user. When the backend adds a new error key, the matching entry ships in both dictionaries
in the same commit (per the i18n guardrail).

## 7. Security Practices

- **Every Mongoose query is scoped to the authenticated user** — `{ ..., userId: req.user.id }`
  on every find/update/delete that touches user-owned data (`Architecture.md` §9.2). This is the
  single easiest security miss for a coding agent: a query that works perfectly in testing but
  lets any user read any other user's data. No exceptions, no "it's filtered client-side."
- **Refresh token lives only in the httpOnly cookie** — never in localStorage, never readable by
  JS, never logged. The short-lived access token is the only token the client-side code handles.
- **Never log secrets or tokens** — no `console.log` of JWTs, password hashes, connection
  strings, or full request headers.
- **Validate with Zod before every DB write** — schemas are co-located on the Mongoose models
  (e.g. `Goal.createGoalSchema`), use them in controllers.

## 8. Workflow

Default build order within a story (deviate only if the story's own section says to):

1. Mongoose model / schema change (if any)
2. Pure domain/business logic in `server/utils/` (parallel-safe, no DB dependency, unit-test it)
3. Express controller + route
4. Client-side React Query hook
5. UI component

**Definition of Done — every story, before marking it complete:**

- [ ] Works in both Arabic and English (real check, not assumed)
- [ ] RTL layout renders correctly
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (BottomNav appears, Sidebar hides at <768px)
- [ ] Loading skeleton shown during data fetch
- [ ] Error state handled with a bilingual toast (+ retry where applicable)
- [ ] Analytics event fired where the story specifies one
- [ ] `npm run dev` (both `client/` and `server/`) starts clean — no console errors/warnings
- [ ] `npm run lint` + `npm run type-check` (client) pass; relevant Vitest suites pass
- [ ] No merge-conflict markers (`<<<<<<<`) remain anywhere you touched

**Repo conventions:**

- Conventional commits, matching the existing history: `feat(server): ...`, `fix(goals): ...`,
  `chore: ...`, `docs(...): ...`. One story's work per commit where practical.
- Never commit secrets. `MONGO_URL`, `JWT_SECRET` live in `hadaf/server/.env.local` (gitignored);
  `.env.example` carries placeholder values only.
- Provisioning that needs human credentials (MongoDB Atlas, deploy hosts) is the project owner's
  job — ask for the value and wait; don't fabricate a connection string or hardcode a workaround.
- Never touch, resume, or merge the `feat-base-architecture-UI` branch — it's a superseded
  Next.js scaffold that contradicts the current architecture (see the E0 work order's Current
  State section).
- Stay on task: implement what the work order specifies. Don't opportunistically refactor
  unrelated code you happen to pass through — flag it in your hand-off notes instead.

## 9. Review Requirement & Honest Reporting

No story is complete until (per `Docs/project-context.md`):

1. Its acceptance criteria are literally verified true — run it, view both `ar`/RTL and `en`/LTR,
   check dark mode. Not assumed because the code "should" work.
2. A review pass has happened against the guardrails above before hand-off.

Report honestly. If something is blocked, half-done, or you had to deviate from the work order
(a file didn't exist where it said, an AC turned out unsatisfiable as written, you found more
drift than documented), say so plainly in your hand-off notes rather than silently marking it
done. A truthful "80% done, blocked on X" is worth more than a false "done."
