<!-- SEED: colors and typography below are resolved (via palette.mjs's OKLCH seed library plus a structured composition pass, not placeholders). Spacing scale, elevation specifics, and components are NOT resolved — no screen exists yet to derive them from. Re-run `$impeccable document` once real screens are built to capture those and generate the `.impeccable/design.json` sidecar. -->

---
name: Hadaf (هدف)
description: A calm strategist for turning 12-week goals into today's small, doable pieces — bilingual (Arabic/English) at parity.
colors:
  primary: "oklch(0.720 0.100 188)"
  accent: "oklch(0.68 0.135 74)"
  bg: "oklch(1 0 0)"
  bg-dark: "oklch(0.09 0 0)"
  surface: "oklch(0.975 0.003 188)"
  surface-dark: "oklch(0.16 0.004 188)"
  ink: "oklch(0.18 0.006 188)"
  ink-dark: "oklch(0.96 0.004 188)"
  muted: "oklch(0.50 0.006 188)"
  muted-dark: "oklch(0.62 0.006 188)"
  destructive: "oklch(0.55 0.22 25)"
  destructive-dark: "oklch(0.65 0.19 22)"
  status-low: "oklch(0.58 0.21 25)"
  status-warning: "oklch(0.68 0.15 45)"
  status-attention: "oklch(0.80 0.15 95)"
  status-good: "oklch(0.66 0.15 300)"
  status-great: "oklch(0.65 0.16 145)"
typography:
  display:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Arabic, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Arabic, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Arabic, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans, IBM Plex Sans Arabic, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
---

# Design System: Hadaf (هدف)

## 1. Overview

**Creative North Star: "The Quiet Navigator"**

Hadaf is a chart table, not a control panel. A navigator plots a course (the 12-week goal), reads the conditions (Day Type, capacity), and adjusts heading without ever panicking or re-planning the whole voyage from scratch. That's the register this system holds: instruments that are precise but never loud, confidence that comes from having already thought it through, and a quiet certainty that today's small heading-adjustment still gets you to the destination.

The interface explicitly rejects three things named in `PRODUCT.md`: it is not a **generic SaaS dashboard** (no card-grid-of-everything, no purple/blue gradient CTAs, no stock analytics iconography — this is a personal tool opened by choice, not enterprise software imposed on someone); it is not a **cold enterprise tool** (no dense gray tables, no admin-panel starkness); and it is not a **gamified habit-tracker cartoon** (no mascots, no confetti, no badge-and-streak-flame visual language — Hadaf's MVP has no badges or challenges at all, and the personality wouldn't fit them even if it did).

**Key Characteristics:**
- One considered brand color (teal), used sparingly, never decoratively
- A completely separate five-color status system (progress bar, goal health) that the brand color must never be mistaken for
- Flat by default; elevation is functional, not decorative
- One type family carries both Arabic and English, by design, not convenience
- Motion answers real moments; it does not perform on page load

## 2. Colors

The palette is restrained: pure neutrals carry almost the entire surface, and the one brand color (teal) is reserved for what's actually interactive or brand-carrying — never spent on decoration.

### Primary
- **Chart-Table Teal** (`oklch(0.720 0.100 188)`): The single brand color. Primary buttons, active nav state, focus rings, the brand mark. Used on ≤10% of any given screen — its rarity is what makes it register as "the app," not wallpaper. **Pairs with dark ink text, not white** — see The Contrast Discipline Rule below.

### Accent
- **Brass Instrument** (`oklch(0.68 0.135 74)`): The warm counterpart to the cool primary — literally the brass fitting on a navigator's instrument. Used for one purpose only: marking genuine achievement moments (a completed milestone, a "Legendary Day" state, the Contribution Pulse text color). If teal is "the app," brass is "you did something today." Never used for standard interactive chrome — that dilutes what it's for. **Pairs with dark ink text, not white** — see The Contrast Discipline Rule below.

### Neutral
- **Paper White** (`oklch(1 0 0)`, light) / **Deep Chart-Room** (`oklch(0.09 0 0)`, dark): The background. Pure, no hidden warmth or tint — the mood lives in primary and accent, not the canvas. This is the single biggest thing to get right: a warm-tinted "cream" background here would read as the generic AI-productivity-app default this system is explicitly avoiding.
- **Chart Paper** (`oklch(0.975 0.003 188)`, light) / **Raised Slate** (`oklch(0.16 0.004 188)`, dark): Surface for cards, sheets, and panels — background pulled toward ink with the barest whisper of the brand hue, not a visible tint.
- **Ink** (`oklch(0.18 0.006 188)`, light) / **Paper Ink** (`oklch(0.96 0.004 188)`, dark): Body text. ≥7:1 contrast against background in both themes — checked, not assumed.
- **Muted Ink** (`oklch(0.50 0.006 188)`, light) / **Muted Paper** (`oklch(0.62 0.006 188)`, dark): Secondary text, timestamps, helper copy. ≥3.5:1 contrast minimum.
- **Signal Red** (`oklch(0.55 0.22 25)`, light) / (`oklch(0.65 0.19 22)`, dark): Destructive actions only — confirmation dialogs, delete buttons.

### Status Colors (separate system — do not blend with brand colors)
Hadaf's progress bar and goal-health indicators are load-bearing product mechanics, not decoration, and they run on their own five-color system, deliberately built to share no hue with primary or accent:

| Token | Value | Text on fill | Meaning |
|---|---|---|---|
| `status-low` | `oklch(0.58 0.21 25)` red | White (4.76:1) | Progress 0–30%, Day State "Low", Goal Health "at risk" |
| `status-warning` | `oklch(0.68 0.15 45)` orange | Dark ink (6.17:1) | Progress 31–60%, Goal Health "behind" |
| `status-attention` | `oklch(0.80 0.15 95)` yellow | Dark ink (10.07:1) | Goal Health "needs attention" (this tier only exists in the goal-health dot, not the 4-color progress bar) |
| `status-good` | `oklch(0.66 0.15 300)` purple | Dark ink (5.70:1) | Progress 61–85% — the PRD deliberately uses purple, not green, for this tier; don't "fix" it to green. Lightness nudged from an earlier 0.60 draft, which cleared neither text color at a full 4.5:1. |
| `status-great` | `oklch(0.65 0.16 145)` green | Dark ink (6.19:1) | Progress 86–100%+, Goal Health "on track" |

All ratios above are computed WCAG contrast (OKLCH → linear sRGB → relative luminance), not estimated from lightness alone — see The Contrast Discipline Rule.

### Named Rules
**The Ten-Percent Rule.** Primary teal never exceeds roughly 10% of any screen's surface. If a screen feels like it needs more teal to feel "branded," the problem is contrast/hierarchy elsewhere, not an under-used brand color.

**The Signal Independence Rule.** Status colors (above) mean exactly one thing each: progress and goal health. They are never repurposed for decoration, illustration accents, or anything else — and primary/accent are never used where a status color's meaning could apply. A user should never have to wonder "is that teal button telling me something is good, or is it just a button?"

**The Contrast Discipline Rule.** Every text-on-fill pairing in this system is verified by computed WCAG contrast, not assumed from a general heuristic. Primary and accent look like classic "saturated mid-luminance → white text" candidates, but they're cool-hued and comparatively low-chroma (teal C=0.100, brass C=0.135) — the Helmholtz-Kohlrausch brightness boost that lets warm, high-chroma fills carry white text doesn't apply here. White-on-primary measures 2.37:1 (fails even large text); dark-ink-on-primary measures 7.92:1 (AAA). That's why primary and accent both take dark ink text while `status-low` red — genuinely warm and saturated — correctly takes white. **Before assigning a text color to any new saturated fill, compute the actual ratio.** Don't extrapolate this rule to a color it wasn't checked against.

## 3. Typography

**Display Font:** IBM Plex Sans (with IBM Plex Sans Arabic for Arabic text, system-ui/sans-serif fallback)
**Body Font:** IBM Plex Sans / IBM Plex Sans Arabic (same family — see rule below)
**Label Font:** Same family, medium weight

**Character:** Considered and even-handed — a geometric-humanist sans with enough warmth to avoid feeling clinical, and enough restraint to avoid feeling playful. It does not perform; it reads.

### Hierarchy
- **Display** (600, `clamp(1.75rem, 4vw, 2.75rem)`, line-height 1.15, letter-spacing -0.02em): Page-level titles — "Goals," "Habits," a goal's own title in Goal Detail. Never a marketing-scale hero; this is a tool, not a landing page.
- **Headline** (600, 1.375rem, line-height 1.25, letter-spacing -0.01em): Section headers within a screen, card titles.
- **Title** (500, 1.125rem, line-height 1.3): Task/habit titles, dialog titles.
- **Body** (400, 1rem, line-height 1.6): All running text. Cap at 65–75ch measure where text wraps freely (descriptions, empty-state copy).
- **Label** (500, 0.8125rem, letter-spacing 0.01em): Form labels, chip text, timestamps, badge text. Sentence case, never uppercase-tracked (see Do's and Don'ts).

### Named Rules
**The One Family Rule.** IBM Plex Sans and IBM Plex Sans Arabic are the same type family, designed by the same foundry specifically for multi-script consistency. This is a deliberate choice over the story plan's original Tajawal-led pairing: Hadaf's own brand principle is "the same person wrote both languages," and a single shared family carries that promise at the typographic level too, not just in copy tone. **This is a change from `Architecture.md`/`Epics.md` E0-2's original font spec — flagging it explicitly, not swapping it silently.**

**The No-Serif Rule.** No serif anywhere, in either language. A serif display face would need a genuinely matching Arabic serif counterpart to keep bilingual parity, and those are rare and hard to source well; a shared sans avoids that trap entirely rather than compromising on it.

## 4. Elevation

Flat by default. Hadaf's surfaces sit at one of exactly two levels — background and surface (card/panel) — distinguished by the barest lightness shift, not by shadow. Shadows are reserved entirely for things that are actually floating above the page: dialogs, sheets, toasts, dropdowns. A card sitting in the normal document flow never gets a shadow; if it needs visual separation, that's a surface-color shift or a single hairline border, never both at once.

### Shadow Vocabulary
- **Overlay** (`box-shadow: 0 8px 24px oklch(0 0 0 / 0.12)`): Dialogs, the Quick Add sheet, dropdown menus. The only shadow weight in the system — no small/medium/large ladder to maintain, because nothing else in this flat system needs one.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. A shadow appears only when something has actually left the document flow to float above it. Never combine a shadow with a full border on the same element — pick one.

## 5. Components

*(Intentionally omitted — this is a pre-implementation seed. No components exist yet to document. Re-run `$impeccable document` once the first real screens are built; that pass extracts actual component shapes and generates the `.impeccable/design.json` sidecar the live-iteration panel needs.)*

## 6. Do's and Don'ts

### Do:
- **Do** keep primary teal (`oklch(0.720 0.100 188)`) to ≤10% of any screen — buttons, active states, the brand mark, nothing more.
- **Do** use pure white (`oklch(1 0 0)`) or pure near-black (`oklch(0.09 0 0)`) as background — no hidden warmth, no "cream" tint.
- **Do** keep the five status colors (`status-low/warning/attention/good/great`) reserved exclusively for progress and goal-health meaning.
- **Do** use dark ink text on primary, accent, `status-warning`, `status-attention`, `status-good`, and `status-great` fills — computed contrast (see The Contrast Discipline Rule), not the general saturated-fill heuristic. Only `status-low` (red) takes white text.
- **Do** compute contrast for any new saturated fill before assigning its text color. The "saturated mid-luminance → white text" shortcut assumes warm, high-chroma colors; it is wrong for this palette's cool, lower-chroma primary and accent, and it was wrong in this file's first draft until checked.
- **Do** use Tailwind logical properties everywhere (`ms-`, `me-`, `ps-`, `pe-`) — every layout must work natively in both RTL (Arabic) and LTR (English).
- **Do** keep motion to CSS transitions only, ease-out curves, tied to real moments (task completion, progress-bar fill, the Contribution Pulse) — see the existing `transition-*` utilities in `globals.css`, which already match this register.
- **Do** respect `prefers-reduced-motion` everywhere motion exists (already implemented in `globals.css`).

### Don't:
- **Don't** build a generic SaaS dashboard — no card-grid-of-everything, no purple/blue gradient CTAs, no stock dashboard iconography.
- **Don't** build a cold enterprise tool — no dense gray tables, no admin-panel starkness.
- **Don't** build a gamified habit-tracker cartoon — no mascots, no confetti, no badge/streak-flame visual language.
- **Don't** use bouncy/elastic motion or Framer Motion — CSS transitions with ease-out curves only, per the project's own architecture decision.
- **Don't** reuse a status color (red/orange/yellow/purple/green) for anything decorative or brand-related — that collision is exactly what the Signal Independence Rule exists to prevent.
- **Don't** pair a 1px border with a soft wide box-shadow on the same card or button (the "ghost-card" pattern) — pick a full border or a shadow, never both.
- **Don't** use `border-left`/`border-right` as a colored accent stripe on cards or list items — use a full border, a background tint, or a leading icon instead.
- **Don't** use gradient text (`background-clip: text` + gradient) anywhere — emphasis comes from weight or size, never a gradient fill.
- **Don't** round cards, sheets, or inputs beyond 12–16px — a full pill radius is fine for tags/buttons only.
- **Don't** use a tiny uppercase tracked "eyebrow" label above every section, or numbered section markers (01 / 02 / 03) as default scaffolding — neither fits a product register to begin with.
- **Don't** use more than one type family across both languages — IBM Plex Sans / IBM Plex Sans Arabic is the whole system.
- **Don't** frame any message negatively. Even the capacity-overload warning is a gentle accent, not an alert; "Good Enough Day" is a real, positive outcome, never a consolation prize.
