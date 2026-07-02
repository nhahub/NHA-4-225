# Product

## Register

product

## Users

Four personas (from `Docs/PRD.md` §1.6), all managing real obligations, not hobbyists:

- **University student** — juggling a thesis, lectures, and studying. Pain point: misjudges how long tasks actually take, and works disconnected from any real goal.
- **Disciplined employee** — already trying to improve daily productivity. Pain point: doesn't know where the day's time actually went, or whether it moved a real goal forward.
- **Religiously committed person** — wants productivity connected to their spiritual practice. MVP doesn't build prayer-specific features (Phase 2), but the data model (goal category, `is_spiritual` habit flag) already leaves room without excluding this person's habits today.
- **Achievement-oriented person** — responds to visible tracking and reward. Pain point: loses motivation because most apps don't show real progress, only checkboxes.

Context of use: daily and habitual, opened first thing in the morning (adaptive greeting) and returned to throughout the day for task/habit check-ins. Primarily mobile, with a full desktop experience too. Arabic (RTL) and English (LTR) are both home languages — this is not an English product with a translated Arabic mode, or vice versa.

Job to be done: turn a 12-week strategic goal into a daily rhythm of tasks and habits, without the planning itself becoming a burden, and without losing all motivation the moment a day goes badly.

## Product Purpose

Hadaf (هدف) flows from strategic goals down to daily execution: 12-week goals break into milestones and tasks, habits run alongside on a Boolean/Counter/Quit model, and a fair scoring system rewards actual invested effort and estimation accuracy, not just checkbox completion.

The governing philosophy is **Elastic Motivation**: the system protects the user's momentum on hard days instead of only rewarding perfect ones. A Minimum Viable Day (MVD) exists for every habit so a "light day" still counts. Day Types (Work / Light / Off) and an auto-calculated Daily Capacity mean the system adjusts what's expected of the user instead of asking them to plan around their own limits every morning.

Success looks like: a user opens the app and sees exactly what matters today without deciding anything themselves, and finishes even an imperfect day feeling like it counted rather than feeling behind.

## Brand Personality

**Calm strategist.** Quiet confidence, unhurried, like a good coach who never panics and never over-explains. Reference point: Things 3's restraint, tactility, and considered pacing — not to copy, but as the register to aim for.

This is reinforced by the product's own mechanics, not just a style choice on top of them:
- The capacity-overload warning is explicitly gentle, never alarming (a subtle accent, not a hard error).
- Messaging always leads with what was accomplished, never with what's missing — "Good Enough Day" is treated as a genuine, positive outcome, not a consolation prize.
- Relapse on a Quit habit resets the counter with encouragement, never a penalty or shaming tone.
- Voice/tone (locked project-wide): non-formal but high quality — conversational and warm, never corporate or stiff, never slangy. The same person should sound like they wrote both the Arabic and the English copy; this is an AI-assisted-translation product where tone consistency across languages is a deliberate quality bar, not an afterthought.

The product should feel like it already knows what today needs, so the user doesn't have to decide.

## Anti-references

- **Generic SaaS dashboard.** No card-grid-of-everything, no purple/blue gradient clichés, no stock dashboard iconography. This is a personal daily tool a person opens every morning, not B2B analytics software they're forced to check.
- **Cold enterprise tool.** No dense gray tables, no admin-panel starkness. If it feels like internal tooling rather than something worth opening voluntarily, it's wrong.
- **Gamified habit-tracker cartoon.** No mascots, no confetti, no badge/streak-flame visual language. MVP explicitly excludes badges, challenges, and advanced gamification — and a playful/childish register is incompatible with "calm strategist" regardless of what's in scope.
- **Bouncy/elastic motion.** The project's own architecture bans Framer Motion in favor of CSS transitions with ease-out curves — motion should read as precise and considered, never springy or "fun."

## Design Principles

1. **The system decides, the user confirms.** Anti-overwhelm by design (Hick's Law): task type is auto-detected, day type informs capacity automatically, the home screen always surfaces the single most important next action. Never make the user configure something the system could reasonably infer.
2. **Progress is never zero.** Partial effort, MVD completion, and Good Enough days are visually and verbally real progress, not failure states. No message anywhere in the product is framed negatively.
3. **Arabic and English are both home languages.** Bilingual parity is structural: RTL is a first-class reading direction designed alongside LTR from the start, not a mirrored retrofit. Every layout, icon, and interaction is designed to work natively in both directions.
4. **Quiet until it matters.** Restraint by default, with intensity saved for the few moments that deserve it — a milestone completion, the Contribution Pulse, a Day State reveal. Elevate a few things instead of everything, so the elevated moments actually register.
5. **Precision over decoration.** The scoring formula, capacity math, and progress calculations are real and specific — the visual language should reflect that (considered data density, exact numbers) instead of smoothing everything into vague, decorative progress indicators.

## Accessibility & Inclusion

WCAG 2.1 Level AA. RTL-native — Arabic is a first-class reading direction, not a mirrored LTR layout. Minimum 4.5:1 contrast for body text, ≥3:1 for large text, ≥44px touch targets. `prefers-reduced-motion` fully respected (already implemented in `globals.css`). Both dark and light themes are fully supported via CSS variables, not a naive color-invert.
