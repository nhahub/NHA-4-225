# Work Order — Epic E0: Project Setup & Identity

> **Read `Docs/AGENT-OPERATING-INSTRUCTIONS.md` first** — role, guardrails, SOLID mapping, the
> API response contract, workflow, and review requirement all live there and apply to every task
> below. This file is the task list, not the playbook.
>
> **Reference docs** (don't ask for these to be restated — read them): `Docs/Architecture.md` §3
> (schema, auth, API pattern) and §5 (directory structure); `Docs/Impulse-Migration-Plan.md`
> (component reuse map, RTL conversion checklist); `Docs/team-task-breakdown.md` Epic E0 section
> (per-story DB/Backend/Frontend checklists — this work order summarizes and re-scopes it against
> real progress, but that doc has the full itemized detail if you need it).
>
> **Execution model: single agent, sequential.** This work order is a contract for **one**
> implementer working through E0-1 → E0-6 in strict order, not a parallel team split.
> `Docs/team-task-assignments.md` describes how the *human* team divides Epic E0 across 5 people
> (Ziad/Mustafa/etc.) — that's a separate, parallel plan for human contributors and doesn't apply
> here. Ignore any "Owners" attribution you see referenced elsewhere; there is one owner: you.
> Do not attempt to parallelize stories against yourself or skip ahead because a later story
> "looks independent" — dependencies are listed per story precisely because sequencing matters.

---

## 0. Current State — read this before touching anything

This is not a from-scratch build. Real work already exists on `main`. Verify this section against
the live repo before starting (`git log --oneline -5`, `find hadaf -maxdepth 4`) — if more has
landed since this was written, trust the repo over this doc and note the gap back to the team lead.

**What exists (`hadaf/server/`, commit `f9ba0af` and later):**
- `models/` — all 8 Mongoose collections (`User`, `Goal`, `Milestone`, `Task`, `Habit`,
  `HabitLog`, `DailySummary`, `AnalyticsEvent`), each with a co-located Zod validation schema.
  `User.js` and `Goal.js` were checked against `Architecture.md` §3.1 and matched field-for-field
  (including `Goal`'s cascade-delete hook and composite indexes) — the other 6 were not
  individually checked; see Task E0-3.1 below.
- `utils/appError.js`, `utils/catchAsync.js`, `utils/errorHandler.js` — a working Express error
  pipeline, but its response shape doesn't yet match the documented contract (see Task E0-3.2).
- `config/db.js` — MongoDB connection, reads `process.env.MONGO_URL` (not `MONGODB_URI` — the
  docs have been corrected to match this; use `MONGO_URL`).
- `app.js` — Express bootstrap, CORS (already allow-lists `localhost:5173` for the Vite client),
  `cookie-parser`, static `/upload` route.
- `package.json` — `express`, `mongoose`, `zod`, `cors`, `cookie-parser`, `dotenv`, `bcrypt`,
  `nodemon`, and a spurious `crypto` entry (Node built-in, remove it — see Task E0-3.3).

**Installed majors: Express 5, Mongoose 9 — keep them, don't downgrade or pin to older majors.**
`Architecture.md` doesn't pin exact versions; build against what's actually installed:
- **Express 5** natively propagates rejected promises from async route handlers to the error
  middleware — you no longer need a manual try/catch or a `catchAsync`-style wrapper in *new*
  route handlers for this to work. The already-committed `utils/catchAsync.js` stays as-is (see
  the grandfathered exception in `AGENT-OPERATING-INSTRUCTIONS.md` §5) — don't remove it and
  don't feel obligated to keep using it in code you write from here; either is fine as long as
  errors reach `errorHandler.js`.
- **Mongoose 9** may differ from older-version API assumptions baked into any example snippet
  you find (including in this doc set). If something doesn't behave as expected, verify against
  the installed version (`node_modules/mongoose/package.json`) and its actual behavior rather
  than assuming an older Mongoose API.

**What does not exist:** `hadaf/client/` — zero client-side work has started. Everything in
Stories E0-1, E0-2, and the client half of E0-5/E0-6 is a full build, not a completion.

**Do not build on or merge the `feat-base-architecture-UI` branch.** It's an abandoned Next.js 15
scaffold from before the Impulse-reuse decision — it predates `Impulse-Migration-Plan.md`, its
docs are behind `main`, and it doesn't have `hadaf/server/`'s work either. If you're pointed at it
by anything else, treat that pointer as stale.

**The API response contract is a three-way mismatch right now** — this is the single most
important thing to get right in this epic, because every future controller and every future React
Query hook inherits whatever shape you settle on here:

| | Shape |
|---|---|
| `Architecture.md` §3.3 (documented, target) | `{success: true, data: T}` \| `{success: false, error, errorCode, field}` |
| `hadaf/server/utils/errorHandler.js` (current) | `{status: 'error'\|'fail', message}` |
| Impulse's `api-client.ts` interceptor (current) | success: returns `response.data` as-is (would be the whole envelope, not `T`); error: reads `.messageEn`/`.message`, not `.error`/`.errorCode` |

Target the documented shape (§3.3) and fix **both ends** — see Task E0-3.2 (backend) and Task
E0-1.3 (client interceptor). Fixing only one side leaves a contract that looks right in isolation
and breaks at runtime the first time client actually talks to server.

---

## Story order

Strict sequential order: **E0-1 → E0-2 → E0-3 → E0-4 → E0-5 → E0-6.** (`team-task-assignments.md`
shows E0-3/E0-4's server work running in parallel with E0-1/E0-2 — that's only valid for the
5-person human split; a single sequential implementer works the list top to bottom.)

---

## E0-1 — Project Scaffold & Design System Foundation

**Status: 0% done. Full scope.**

**Goal:** Copy Impulse's client into `hadaf/client/`, make it compile clean, establish the design
token foundation.

**Tasks:**

- **E0-1.1** — Copy `Impulse/frontend/` → `hadaf/client/`. `npm install`. Rebrand: app name,
  favicon, `index.html` metadata, Impulse → Hadaf.
- **E0-1.2** — Resolve all 3 pre-existing merge conflicts:
  - `shared/lib/api-client.ts` — resolve toward the mock-support side of the conflict (the
    `fb437f2` branch: keeps `setupMockServer`, the 401 auto-logout interceptor, richer error
    extraction). Then layer on top: `withCredentials: true` (needed for the httpOnly refresh
    cookie, see E0-5) and an `X-Requested-With: XMLHttpRequest` header on every request (CSRF
    requirement, `Architecture.md` §3.2).
  - `features/auth/api/authApi.ts` — **do not pick either conflict side** — both call endpoints
    that don't match Hadaf's real contract (`/auth/create-account`, `/auth/register` vs. the
    actual `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`).
    Rewrite clean against the real endpoints. Full implementation happens once E0-5's backend
    routes exist — for now, get it to a compiling state with the correct URLs and types.
  - `features/tasks/api/taskApi.ts` — clear the conflict markers to a compiling stub (pick the
    mock-support side as the base). Full Express rewiring is **out of scope for E0-1** (it's E2
    work) — leave a `// TODO(E2): rewire to Express task endpoints` comment. The only requirement
    here is that `tsc` doesn't fail on leftover `<<<<<<<` markers.
  - Also remove `shared/api/apiClient.ts` if it still exists (legacy duplicate).
- **E0-1.3** — `api-client.ts` response-contract conformance (see §0 above): adapt the response
  interceptor to unwrap `response.data.data` on a successful `{success: true, data}` response
  (components should receive `T`, not the envelope), and read `error.response.data.error` /
  `.errorCode` on failure (not `.messageEn`/`.message`). This only becomes testable once E0-3.2's
  backend fix lands, but write it now against the documented contract, not the current backend
  shape.
- **E0-1.4** — Design tokens: convert Impulse's **hex** brand scale (`tailwind.config.js` →
  `colors.brand.50`...`950`, e.g. `500: "#8B5CF6"`) to real OKLCH values, directly in
  `tailwind.config.js` and the client's global stylesheet — there is no separate design-system
  document to author; the token layer itself is the authority (see
  `AGENT-OPERATING-INSTRUCTIONS.md` §3). This is a conversion, not a copy — Impulse has no OKLCH
  tokens to seed from. Compute actual WCAG contrast for text-on-fill pairings per the color
  guardrail; don't assume. While in `tailwind.config.js`, flag (don't silently keep or remove)
  the `card-hover` and `glow` box-shadow tokens against the "flat by default, shadow only on
  floating elements, never border+shadow together" guardrail — note the conflict in your
  hand-off for a design-token review pass, don't decide it unilaterally.
  - `npx shadcn@latest add alert-dialog sheet tabs dropdown-menu progress tooltip` — primitives
    Impulse doesn't already have.
  - Apply the converted OKLCH tokens (light + dark) to the client's global stylesheet.
  - Confirm no `framer-motion` dependency exists (Impulse doesn't ship it — keep it that way).
- **E0-1.5** — `npm run dev` runs clean, no lint/type errors.

**AC:** Client scaffold runs locally (Vite dev server on :5173). All 3 merge conflicts resolved
with zero `<<<<<<<` markers anywhere in `hadaf/client/`. `tailwind.config.js` + global stylesheet
carry real OKLCH tokens with documented contrast computations. `api-client.ts` conforms to the
§3.3 response contract.

**Dependencies:** None — first story.

---

## E0-2 — Typography & RTL Foundation

**Status: 0% done. Full scope.**

**Goal:** Arabic-default RTL rendering, bilingual i18n scaffold, correct fonts.

**Tasks:**

- Self-host Tajawal + IBM Plex Sans Arabic in `hadaf/client/public/fonts/`. `@font-face` +
  Tailwind `fontFamily` config, replacing Impulse's current `Inter`.
- `<html dir>` / `<html lang>` wired to active locale in `App.tsx`/`providers.tsx`.
- **Convert every physical CSS property Impulse ships to a logical one**, across the entire copied
  codebase: `ml-`→`ms-`, `mr-`→`me-`, `pl-`→`ps-`, `pr-`→`pe-`, `left-`→`start-`, `right-`→`end-`,
  `text-left`→`text-start`, `text-right`→`text-end`, `border-l`→`border-s`, `border-r`→`border-e`,
  `rounded-l`→`rounded-s`, `rounded-r`→`rounded-e`, `float-left`→`float-start`,
  `float-right`→`float-end`. Full checklist and the Sidebar-specific RTL notes are in
  `Impulse-Migration-Plan.md`'s RTL Conversion Checklist — follow it exactly, this is the
  highest-risk task in the whole epic (every Impulse component uses physical properties).
- `providers/LocaleProvider.tsx` — cookie-based locale state, Arabic default.
- `i18n/ar.ts` + `i18n/en.ts` dictionaries + `useTranslation` hook.
- Verify `Intl.NumberFormat`/`Intl.DateTimeFormat` locale plumbing works for both locales.

**AC:** Fonts self-hosted. `<html dir="rtl">` by default. Zero physical-direction Tailwind classes
remain anywhere in `hadaf/client/src/`. `LocaleProvider` + dictionaries wired and toggleable.

**Dependencies:** E0-1.

---

## E0-3 — Layered Architecture Setup

**Status: server ~80% done, client 0% (folds into E0-1/E0-2).**

**Goal:** Complete the missing server folders, audit and fix what already exists.

**Tasks:**

- **E0-3.1 — Model audit (do this first).** Diff all 8 models in `hadaf/server/models/` against
  `Architecture.md` §3.1's schema definitions, field by field, including indexes and pre-hooks.
  `User.js` and `Goal.js` were already checked and matched — audit the remaining 6
  (`Milestone`, `Task`, `Habit`, `HabitLog`, `DailySummary`, `AnalyticsEvent`) and fix any drift
  found. Also confirm `AnalyticsEvent`'s `{userId: 1, createdAt: -1}` compound index is present.
- **E0-3.2 — Fix the response contract (backend half).** Rewrite `hadaf/server/utils/errorHandler.js`
  to emit `Architecture.md` §3.3's `ApiResponse<T>` shape (`{success: false, error, errorCode,
  field}`) instead of its current `{status, message}`. Preserve the existing error-classification
  logic (`CastError`, duplicate-key `11000`, `ValidationError`, JWT errors) — only change the
  output shape, not the classification. Success responses from controllers (once they exist, from
  E0-5 onward) must use `{success: true, data}`.
- **E0-3.3 — Dependency cleanup.** Remove the `crypto` entry from `package.json` (Node built-in,
  the npm package is a deprecated no-op stub — nothing should `require('crypto')` via the
  dependency, only via Node's native module).
- **E0-3.4 — CSRF validation middleware.** Build `server/middleware/csrf.js` per the
  `Architecture.md` §3.2 snippet: reject state-changing requests (`POST`/`PUT`/`PATCH`/`DELETE`)
  that are missing the `X-Requested-With: XMLHttpRequest` header, with a
  `{success: false, errorCode: 'AUTH', error: 'errors.csrfDetected'}` response (§3.3 contract).
  Wire it into `app.js` ahead of the route handlers. This is the server-side half of the CSRF
  requirement — the client already sends the header as of Task E0-1.2.
- Create the still-missing server folders: `controllers/`, `routes/`. Empty/stub files are fine
  here — they get populated by E0-5 (auth) and later epics. (`middleware/` now has `csrf.js` from
  E0-3.4; `auth.js` and `rateLimiter.js` are added in E0-5/E0-6.)
- Confirm `hadaf/server/tests/` + a Vitest config exist for backend unit tests.

**AC:** All 8 models verified against §3.1 (drift fixed where found). `errorHandler.js` emits the
documented contract. `crypto` dependency removed. CSRF middleware rejects state-changing requests
missing the header. `controllers/`, `routes/`, `middleware/` folders exist.

**Dependencies:** None technically (the audit/fix tasks don't need E0-1/E0-2's output) — but per
the strict sequential order above, do it in position 3, after E0-2.

---

## E0-4 — Database Connection & Analytics Schema

**Status: ~90% done.**

**Goal:** Verify what exists, wire the one missing piece.

**Tasks:**

- `config/db.js` already connects via `MONGO_URL` — no change needed unless E0-3.1's audit found
  an issue with `AnalyticsEvent`'s schema/index.
- No controller calls `AnalyticsEvent.create()` yet, because no controllers exist yet — this
  wiring happens naturally as E0-5 builds the auth controller and logs `login`/`register` events.
  Nothing to do here in isolation; just confirm `AnalyticsEvent.create({ userId, eventType,
  eventData })` works via a quick connectivity smoke test.

**AC:** MongoDB connection confirmed working. `AnalyticsEvent` model verified (via E0-3.1).

**Dependencies:** E0-3 (folder structure).

---

## E0-5 — Email/Password Authentication

**Status: `User` model done (~25% of story). Everything else outstanding, including 100% of the client side.**

**Goal:** Working register/login/refresh/logout, both ends.

**Tasks — Backend:**

- Add `jsonwebtoken` to `hadaf/server/package.json` (not currently a dependency).
- Swap `bcrypt` → `bcryptjs` in `package.json` and every import site — pure JS, no native compile
  step, matters for free-tier host portability (`Architecture.md` §3.2 specifies `bcryptjs`
  explicitly).
- `server/utils/jwt.js` — sign/verify via `jsonwebtoken`, HS256, 15-minute access token.
- `server/utils/password.js` — hash/verify via `bcryptjs`.
- `server/middleware/auth.js` — verify JWT from `Authorization: Bearer` header, attach
  `req.user`.
- `server/routes/authRoutes.js` + `server/controllers/authController.js` — register,
  login, refresh, logout. Every response uses the `ApiResponse<T>` contract (E0-3.2).
- Refresh token: generate a random 7-day token, `bcryptjs`-hash it, and store **the hash in the
  existing `User.refreshToken` field** (`String` — already in the model, no schema change or
  migration needed) alongside `refreshTokenExp`. Send the **raw** (unhashed) token to the client
  as an httpOnly cookie (`sameSite: 'none'`, `secure: true`) — the raw value never touches the
  database. On refresh, compare the incoming cookie token against the stored hash
  (`bcrypt.compare`), then rotate: generate a new token, hash it, overwrite `refreshToken`/
  `refreshTokenExp`. Detect reuse (incoming token doesn't match the current stored hash but is
  structurally valid) → invalidate the session (clear `refreshToken`) and require re-login.
- Log `AnalyticsEvent`s for `login` and `register`.

**Tasks — Client** (all net-new, since `hadaf/client/` doesn't exist until E0-1 lands):

- Adapt Impulse's `features/auth/stores/useAuthStore.ts`:
  - **Remove the `roles: string[]` field** — no equivalent in Hadaf's `User` schema
    (`Architecture.md` §3.1: `email`, `name`, `avatarUrl`, `onboardingCompleted`, `settings` — no
    roles concept).
  - Align the `User` type to the real schema.
  - **Add refresh-token rotation support** — the current store has zero concept of a refresh
    token at all, only a single opaque `token`.
  - Keep the existing mechanism for the access token: Zustand `persist` to `localStorage` (this is
    Impulse's current pattern and the settled approach — access token client-visible via
    `Authorization` header, refresh token *only* in the httpOnly cookie, never touched by JS).
    This split is deliberate, not something to redesign.
- Adapt Impulse's `features/auth/pages/LoginPage.tsx` (keep the sliding dual-panel layout) —
  bilingual labels (uses E0-2's `i18n` dictionaries), RTL layout, points at the real endpoints via
  the (now-fixed) `authApi.ts`.
- Redirect-after-login handling (`?redirect={path}`).

**AC:** Register/login/refresh/logout work end-to-end against a real MongoDB instance. Refresh
rotation verified (old refresh token invalidated after use). `useAuthStore` has no `roles` field
and correctly persists only the access token client-side. Analytics events logged on
login/register.

**Dependencies:** E0-4 (DB pattern), E0-1 (client must exist for the frontend tasks).

---

## E0-6 — App Shell & Route Guards

**Status: 0% done. Blocked on E0-1 and E0-5.**

**Goal:** Responsive shell, protected routes, language switcher.

**Tasks:**

- `hadaf/client/src/app/router.tsx` — `RequireAuth` / `RedirectIfAuth` React Router guards.
- Backend: confirm `middleware/auth.js` (from E0-5) protects every `/api/*` route that needs a
  session. Add a silent-refresh endpoint the client calls before redirecting to `/login`.
- Rate limiting — in-memory `Map`, 100 req/min/user.
- Adapt Impulse's `components/layouts/Sidebar.tsx` — desktop >1024px, fixed on the *right* for
  RTL, converted to logical CSS (depends on E0-2's conversion pass already being done). **5 nav
  items: Home, Goals, Habits, Overview, Settings** — this resolves the open question in
  `team-task-breakdown.md` §2.2 about whether "Overview" is a real route or a Home alias: **it's
  a real route.** Add a stub `/overview` page (e.g. a placeholder/"coming soon" state) and the
  matching sidebar item now; the real Overview screen content is out of scope for E0 — a later
  epic fills it in.
- New `components/layouts/BottomNav.tsx` — mobile <768px, 4 items (🏠 الرئيسية | 🎯 الأهداف | ✅
  العادات | ⋯ المزيد) — Overview isn't one of the 4 bottom-nav slots, it's sidebar/desktop-only
  for now, consistent with "More" absorbing secondary items on mobile.
- Adapt Impulse's `ThemeProvider` — dark/light toggle, `data-theme` attribute.
- Language switcher, visible from any screen in the shell — toggles AR↔EN, updates
  `LocaleProvider`. **Client-only for E0-6**: persist the choice the same way `LocaleProvider`
  already does (cookie/localStorage) — do **not** call a `/api/user/settings` endpoint, it
  doesn't exist yet (that's E4-1's Day Types & Settings story). Leave a
  `// TODO(E4-1): sync language choice to users.settings.language once the settings endpoint exists`
  comment at the point where server persistence would hook in. (Gap-fill note: a language
  switcher was missing from the original PRD's story list — it's required per `Architecture.md`
  §3's Infrastructure row even though no single FR names it.)
- **`api-client.ts` 401 handling**: now that E0-5 has real refresh rotation, upgrade the
  interceptor from Impulse's current naive "401 → clear storage → redirect to /login" to
  refresh-then-retry: on a 401, call the refresh endpoint once; if it succeeds, retry the original
  request; if it also fails, then clear and redirect.
- Keyboard navigation / focus states (accessibility pass).

**AC:** Protected routes redirect unauthenticated users to `/login` with a `redirect` param.
Language switcher works from any screen and persists client-side across a reload (server sync
deferred to E4-1, not required here). Sidebar (desktop, 5 items including the `/overview` stub) /
BottomNav (mobile, 4 items) render correctly in both RTL and LTR. A 401 triggers a silent refresh
attempt before logging the user out.

**Dependencies:** E0-5 (JWT to protect routes), E0-2 (LocaleProvider must exist before the
switcher can flip it).

---

## Hand-off notes

When each story is done, report against its AC explicitly — don't just say "done." If you had to
deviate from this work order (a file didn't exist where expected, an AC turned out unsatisfiable
as written, you found more drift than what's documented in §0), say so plainly rather than
silently working around it.
