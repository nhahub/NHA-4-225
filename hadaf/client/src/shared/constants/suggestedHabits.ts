// Suggested-habits list for the onboarding (ONB-2) chip picker.
//
// Restriction (per PRD FR36.1): suggested chips must NOT contain any
// `religion_spirituality` entry — a religious/spiritual habit is still
// perfectly creatable manually later via E3-1's free-text habit creation
// (`isSpiritual: true` is a real field on the Habit model). The restriction
// is ONLY on this suggestion surface, never on the schema or validation.
//
// `i18nKey` resolves under the `onboarding.suggestedHabits.*` namespace in
// both ar.ts and en.ts so the picker renders bilingual copy without any
// string literalization in the component itself.

import type { HabitCategory, HabitType } from '@/features/habits/types';

export interface SuggestedHabit {
  /** i18n key under `onboarding.suggestedHabits.*` (the label shown on the chip). */
  i18nKey: string;
  category: HabitCategory;
  type: HabitType;
  /** Optional default MVD numeric target (units depend on `type`). */
  defaultTarget?: number;
  /** Optional i18n key for the suggested MVD copy shown in the MVD prompt. */
  suggestedMvd?: string;
}

export const SUGGESTED_HABITS: ReadonlyArray<SuggestedHabit> = [
  {
    i18nKey: 'walk',
    category: 'health',
    type: 'boolean',
    suggestedMvd: 'mvdWalk',
  },
  {
    i18nKey: 'sleep',
    category: 'health',
    type: 'boolean',
    suggestedMvd: 'mvdSleep',
  },
  {
    i18nKey: 'water',
    category: 'health',
    type: 'counter',
    defaultTarget: 8,
    suggestedMvd: 'mvdWater',
  },
  {
    i18nKey: 'reading',
    category: 'education_work',
    type: 'counter',
    defaultTarget: 20,
    suggestedMvd: 'mvdReading',
  },
  {
    i18nKey: 'study',
    category: 'education_work',
    type: 'boolean',
    suggestedMvd: 'mvdStudy',
  },
  {
    i18nKey: 'familyCall',
    category: 'family',
    type: 'boolean',
    suggestedMvd: 'mvdFamilyCall',
  },
  {
    i18nKey: 'familyTime',
    category: 'family',
    type: 'boolean',
    suggestedMvd: 'mvdFamilyTime',
  },
  {
    i18nKey: 'exercise',
    category: 'health',
    type: 'counter',
    defaultTarget: 30,
    suggestedMvd: 'mvdExercise',
  },
  {
    i18nKey: 'meditation',
    category: 'health',
    type: 'boolean',
    suggestedMvd: 'mvdMeditation',
  },
];