# WORK ORDER — Make Hadaf feel like Hadaf (not generic)

**Read `MINIMAX-INSTRUCTIONS.md` first.** Do these tasks **in order**. Do not start a task
until the previous one passes its acceptance checklist. Each task is scoped to be shippable on
its own so we never have a broken tree near the deadline.

**Root cause (why we're here):** the OKLCH design tokens are already correct in
`src/app/globals.css`, but the screens render English-LTR with default shadcn scaffolding, and
the differentiating screen doesn't exist. We are wiring the planned soul, not redesigning.

Legend: 📁 = files to touch · ✅ = acceptance criteria (all must be true to close the task).

---

## T1 — Reconcile the docs (10 min, do first so nothing regresses)

Prevent anyone (human or agent) from re-introducing the generic palette.

📁 `Docs/UX-Design-Specification.md`
- At the top of **§5.1** and **§5.2**, insert a bold note:
  `> ⚠️ SUPERSEDED. Color and typography are now owned by /DESIGN.md (the "Quiet Navigator"
  OKLCH system). The hex values below are historical and MUST NOT be used in code.`

✅ §5.1/§5.2 carry the supersede note. No code changes. No `#6366F1 / #22C55E / #FFD700 /
#F59E0B / #EF4444 / #FAFAFA` value appears anywhere under `src/` (grep to confirm — currently
true; keep it true).

---

## T2 — Arabic-first RTL shell + message dictionary (THE highest-payoff task)

This is what makes the app instantly read as Hadaf. **Sequencing decision (mine):** do NOT do
a full `/[locale]` route refactor first — it's slow and risky near a deadline. Instead:
default the app to **Arabic RTL** and route all copy through a dictionary with an EN toggle.
Full locale routing is optional T2b below.

📁 `src/app/layout.tsx`, new `src/i18n/messages.ts` (or `src/i18n/{ar,en}.ts`), new
`src/i18n/locale-context.tsx` (or reuse `next-themes` pattern), `src/providers/*`

- Default locale = `ar`, default `dir="rtl"`. Persist the choice (cookie or `localStorage`,
  same mechanism style as the theme provider).
- `layout.tsx`: set `<html lang>` and `dir` from the active locale, not hardcoded.
- Create a typed message dictionary with `ar` + `en` for every current UI string. Start by
  extracting the English strings already in: `src/app/page.tsx`, `src/app/goals/page.tsx`,
  `goal-card.tsx`, the wizard/dialog components, and empty states. **Every key needs both
  languages.** Add real Arabic (use the microcopy in UX-Design-Spec §2/§3/§8 as the source —
  e.g. "الأهداف", "هدف جديد", the "Good Enough" lines).
- Add `CATEGORY_LABEL_AR` + `CATEGORY_GLYPH` (locale-agnostic) alongside the existing
  `CATEGORY_LABEL_EN` in `src/features/goals/schemas.ts`; select by active locale.
- Make dates locale-aware: replace the hardcoded `new Intl.DateTimeFormat("en-US", …)` in
  `goal-card.tsx` (and anywhere else) with the active locale + Arabic-Indic numerals under `ar`.
- Add a small locale toggle to the shell so we can demo EN parity.

> If a dictionary-by-hand approach gets unwieldy, `next-intl` is pre-approved (it's the
> standard App Router i18n lib). Prefer the lighter hand-rolled dictionary if it's enough.

✅ App loads in **Arabic, RTL, dark-mode-capable** by default. Toggling to EN flips `dir="ltr"`
and every string. **Zero** user-facing English string remains hardcoded in a component (grep
for stray literals). Dates render Arabic-formatted under `ar`. Layout does not visually break
in RTL — every spacing class is logical (`ms-/me-/ps-/pe-`), verified by toggling.

### T2b — (OPTIONAL, only if time) Full `/[locale]` routing
Move routes under `src/app/[locale]/`, add `next-intl` middleware, `/ar` + `/en` URLs. Skip
unless T3/T4 are done and there's slack. The competition demo does not need URL-based locales.

---

## T3 — Build the Adaptive Home (the soul screen — biggest "not generic" win)

The current `src/app/page.tsx` is a placeholder card. Replace it with the real Home per
**UX-Design-Spec §7.2 + §8.2**. This is the screen that carries "Elastic Motivation" and is the
single most important thing for the app to stop feeling generic.

📁 `src/app/page.tsx` (or `src/app/[locale]/page.tsx` if T2b done), new
`src/components/home/*`, likely new `src/features/day/*` for mock day/task/habit data
(mirror `src/lib/mock-data/goals.ts`).

Sections, top → bottom (§8.2):
1. **Adaptive greeting** — 3 scenarios (has tasks / has goals only / new user), positive voice.
2. **Today's tasks** — sorted by time/priority; tap-to-complete.
3. **Habits** — with MVD (Minimum Viable Day) indicator.
4. **Backlog ribbon** — only if backlog > 0 ("N مهام من أيام سابقة"), unobtrusive.
5. **Daily progress bar** — uses the status-color tiers from `DESIGN.md` §2.
- **Contribution Pulse:** on task completion, show "+X% نحو [هدف]" as a CSS fade (use
  `.transition-fade` / `.transition-fast`), in the brass accent color. This is the heartbeat
  feature — don't skip it.
- **"Good Enough" messaging** (§3): accomplishment first ("أنجزت ٥ من ٨ — إنجاز حقيقي").

✅ Home renders all 5 sections with mock data, RTL + dark mode. Completing a task fires the
Contribution Pulse fade and advances the daily progress bar. No badges/confetti/mascots. All
copy from the dictionary (both languages). No framer-motion. Reuses existing `ui/*` primitives
and `transition-*` utilities.

---

## T4 — Frame the Goals dashboard (turn "bare grid" into "instrument panel")

The grid itself is fine (§8.3 asked for cards). It reads generic because the framing the spec
specified is missing.

📁 `src/app/goals/page.tsx`, new `src/components/goals/twelve-week-overview.tsx`, new
`weekly-execution-score.tsx` (reuse the existing `TwelveWeekBar` / `GoalProgressRing` patterns)

- Add the **12-Week Bar** across the top (12 segments, current week highlighted) — §8.3.
- Add the **Weekly Execution Score** at the bottom — §8.3.
- Keep the existing card grid between them.

✅ Goals page shows 12-Week Bar → card grid → Execution Score. RTL: the week bar fills from the
right; current-week highlight is correct in both directions. Dark mode intact. Copy from dictionary.

---

## T5 — (OPTIONAL) Give DESIGN.md real component specs

`DESIGN.md` §5 Components is empty by design ("pre-implementation seed"). Now that real screens
exist, run the `$impeccable document` pass its header asks for so future screens get concrete
component shapes instead of shadcn defaults. Only if time remains.

---

## Global verification (run before calling the whole order done)

```bash
cd NHA-4-225/hadaf
npm run lint          # clean
npm run dev           # then, in browser:
```
- [ ] Default load = Arabic, RTL, dark-mode works.
- [ ] EN toggle flips dir + every string; no hardcoded English literals remain in components.
- [ ] Home shows adaptive greeting + Contribution Pulse + daily progress (not the placeholder card).
- [ ] Goals dashboard shows 12-Week Bar + cards + Execution Score.
- [ ] grep confirms NO `#6366F1 / #22C55E / #FFD700 / #F59E0B / #EF4444 / #FAFAFA` under `src/`.
- [ ] grep confirms NO physical-direction classes (`\bml-|\bmr-|\bpl-|\bpr-|text-left|text-right`) in touched files.
- [ ] No framer-motion in `package.json`.
- [ ] Toggle RTL + dark together on every touched screen — nothing breaks.

## Priority if the deadline bites
T1 + T2 are the cheap, massive-visual-payoff pair — ship those no matter what. **T3 is the real
fix for "generic"** — protect time for it. T4 is polish. T2b and T5 are cut-first if needed.
