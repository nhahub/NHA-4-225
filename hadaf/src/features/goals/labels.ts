import type { Locale } from "@/i18n/messages";
import {
  CATEGORY_GLYPH_EN,
  CATEGORY_LABEL_AR,
  CATEGORY_LABEL_EN,
  GOAL_HEALTH_LABEL_AR,
  GOAL_HEALTH_LABEL_EN,
  STEP_TITLE_AR,
  STEP_TITLE_EN,
  type GoalCategory,
  type GoalHealth,
  type StepKey,
} from "@/features/goals/schemas";

export function categoryLabel(locale: Locale, category: GoalCategory): string {
  return locale === "ar" ? CATEGORY_LABEL_AR[category] : CATEGORY_LABEL_EN[category];
}

export function categoryGlyph(_locale: Locale, category: GoalCategory): string {
  // Glyphs are visually language-agnostic; keep using the same set for both.
  return CATEGORY_GLYPH_EN[category];
}

export function healthLabel(locale: Locale, health: GoalHealth): string {
  return locale === "ar" ? GOAL_HEALTH_LABEL_AR[health] : GOAL_HEALTH_LABEL_EN[health];
}

export function stepTitle(locale: Locale, step: StepKey): string {
  return locale === "ar" ? STEP_TITLE_AR[step] : STEP_TITLE_EN[step];
}