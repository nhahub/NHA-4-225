# MiniMax Operating Instructions — Hadaf (هدف)

You are the implementing engineer on Hadaf. I (the lead) have already diagnosed the problem
and written the work order. **Your job is to execute `WORK-ORDER-Hadaf-design.md` task by
task, in order, without re-litigating the design.** Read this file once at the start of every
session, then open the work order.

---

## 1. The problem you are fixing (context, 30 seconds)

The app's design tokens are excellent, but the screens feel *generic* because: (a) the
bilingual/RTL soul never got wired — the app renders English LTR; (b) the differentiating
screen (Adaptive Home) doesn't exist; (c) two conflicting color systems live in the docs and
one of them is the generic default Tailwind palette. You are **not** redesigning anything.
You are wiring the soul that was planned but never built.

## 2. Source-of-truth hierarchy (when docs disagree, higher wins)

1. **`DESIGN.md`** (app root) — the ONLY authority for color, typography, elevation, motion.
2. **`Docs/UX-Design-Specification.md`** — authority for screens, flows, microcopy, RTL rules —
   **EXCEPT §5.1 colors/§5.2 type, which are SUPERSEDED by `DESIGN.md`.** The §5.1 hex palette
   (`#6366F1`, `#22C55E`, `#FFD700`, `#FAFAFA`…) is the generic default palette — **never use it.**
3. **`Docs/PRD.md`, `Docs/Epics.md`, `Docs/Architecture.md`** — product/scope authority.
4. This file — how you work.

If two sources still conflict after applying that order, **stop and ask me.** Do not guess.

## 3. Non-negotiable guardrails (violating any of these = rejected review)

**Color & brand**
- Use only the OKLCH tokens already in `src/app/globals.css`. Never introduce a raw hex color.
- Primary teal ≤ ~10% of any screen (buttons, active nav, focus, brand mark only). Not decoration.
- Dark ink text on teal/brass/`status-warning`/`status-attention`/`status-good`/`status-great`
  fills. Only `status-low` (red) takes white. **Compute WCAG contrast for any NEW fill before
  assigning its text color** — the "saturated → white text" shortcut is WRONG for this palette.
- The 5 status colors mean progress/health ONLY. Never decorative, never brand.
- No gradient CTAs, no gradient text, no `#FAFAFA`-style "cream" backgrounds.

**Bilingual / RTL (the soul — highest priority)**
- Arabic is the DEFAULT and primary language. The app must render RTL by default.
- Layout spacing MUST use Tailwind logical properties (`ms-/me-/ps-/pe-`, `start-/end-`, `text-start`).
  Never `ml-/mr-/pl-/pr-/left-/right-/text-left`. Any physical-direction class is a bug.
- Never hardcode a user-facing string in a component. All copy comes from the message dictionary
  in both `ar` and `en`. If you add a string, add BOTH.
- Dates/numbers must be locale-aware — no hardcoded `en-US`.

**Motion & elevation**
- CSS transitions only. **Never add framer-motion** (it is banned by architecture). Use the
  `transition-*` utilities already in `globals.css`. Ease-out curves, tied to real moments.
- Flat by default. Shadow ONLY on things floating above the page (dialog/sheet/toast/dropdown).
  Never combine a full border + box-shadow on the same element.
- Respect `prefers-reduced-motion` (already global — don't undo it).

**Voice (product personality)**
- Frame everything positively. Accomplishment FIRST, then what remains ("أنجزت ٥ من ٨ — إنجاز
  حقيقي", not "لم تكمل ٣"). Errors are always recoverable and show a retry action.
- No mascots, confetti, badges, streak-flames, or gamification cartoon language.

**Stack (locked — do not swap)**
- Next.js 15 App Router, React 19, Tailwind v4, shadcn v4 + `@base-ui/react`, `zod`,
  `react-hook-form`, `lucide-react`, `next-themes`, `sonner`, `@dnd-kit`. Don't add heavy deps
  without asking. (One approved add is in the work order: `next-intl`, only if Task 2 needs it.)

## 4. Workflow (per task)

1. **Read before you write.** Open the files the task names AND the relevant doc section. Reuse
   existing components/utilities (`src/components/ui/*`, `src/lib/utils.ts` `cn()`, the
   `transition-*` classes) — do not re-invent.
2. **One task at a time.** Do not start Task N+1 until Task N passes its acceptance criteria.
3. **Match the surrounding code** — naming, structure, comment density. Mirror the existing
   `src/components/goals/*` patterns.
4. **Verify before you claim done.** Run `npm run dev`, load the screen, check both `ar` (RTL)
   and `en` (LTR), toggle dark mode. Run `npm run lint`. A task is done only when its
   acceptance checklist is literally true — not when the code "should" work.
5. **Report honestly.** If something is blocked, half-done, or you skipped a check, say so
   plainly. Never report green when you didn't verify.
6. **Commit per task** with a clear message referencing the task id (e.g. `feat(i18n): T2 —
   Arabic-first RTL shell`). Don't bundle unrelated changes.

## 5. When to stop and ask me

- A doc conflict you can't resolve with the hierarchy in §2.
- A guardrail in §3 seems to block the task (there's usually a reason — ask, don't override).
- The task needs a new dependency not pre-approved.
- Acceptance criteria are ambiguous or you'd have to invent product behavior.

Guessing on any of these wastes more time than asking. Ask.
