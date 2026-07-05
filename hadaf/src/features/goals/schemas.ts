import { z } from "zod";

export const GOAL_CATEGORIES = [
  "education_work",
  "family",
  "health",
  "religion_spirituality",
  "other",
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const CATEGORY_LABEL_EN: Record<GoalCategory, string> = {
  education_work: "Education / Work",
  family: "Family",
  health: "Health",
  religion_spirituality: "Spirituality",
  other: "Other",
};

export const CATEGORY_GLYPH_EN: Record<GoalCategory, string> = {
  education_work: "📚",
  family: "👨‍👩‍👧",
  health: "💪",
  religion_spirituality: "🌙",
  other: "✨",
};

export const GOAL_HEALTH = [
  "at_risk",
  "behind",
  "needs_attention",
  "on_track",
] as const;

export type GoalHealth = (typeof GOAL_HEALTH)[number];

export const GOAL_HEALTH_LABEL_EN: Record<GoalHealth, string> = {
  at_risk: "At risk",
  behind: "Behind",
  needs_attention: "Needs attention",
  on_track: "On track",
};

const milestoneSchema = z.object({
  id: z.string().min(1, "Milestone needs an id"),
  title: z
    .string()
    .min(2, "Give the milestone a slightly longer name")
    .max(120, "Keep milestones under 120 characters"),
  sortOrder: z.number().int().min(0),
  isCompleted: z.boolean(),
  completedAt: z.coerce.date().optional(),
});

export type Milestone = z.infer<typeof milestoneSchema>;
export type MilestoneInput = Milestone;

export const goalWizardSchema = z
  .object({
    title: z
      .string()
      .min(3, "Give your goal a name (at least 3 characters)")
      .max(80, "Keep goal titles under 80 characters"),
    description: z
      .string()
      .max(500, "Keep descriptions under 500 characters")
      .optional()
      .or(z.literal("")),
    measure: z
      .string()
      .min(5, "How will you know you've succeeded? (at least 5 characters)")
      .max(200, "Keep the measure under 200 characters"),

    category: z.enum(GOAL_CATEGORIES),
    customCategory: z
      .string()
      .max(40, "Keep custom category names under 40 characters")
      .optional()
      .or(z.literal("")),
    relevance: z
      .string()
      .min(5, "Why does this matter to you? (at least 5 characters)")
      .max(300, "Keep relevance under 300 characters"),
    cycleStart: z.coerce.date(),
    cycleEnd: z.coerce.date(),

    milestones: z.array(milestoneSchema).default([]),
  })
  .refine(
    (d) => {
      const diff = Math.round(
        (d.cycleEnd.getTime() - d.cycleStart.getTime()) / 86_400_000,
      );
      return diff === 84;
    },
    {
      message: "A goal cycle must be exactly 12 weeks (84 days)",
      path: ["cycleEnd"],
    },
  )
  .refine(
    (d) => d.category !== "other" || (d.customCategory ?? "").length >= 2,
    {
      message: "Name your custom category (at least 2 characters)",
      path: ["customCategory"],
    },
  );

export type GoalWizardInput = z.infer<typeof goalWizardSchema>;
export type GoalWizardFormInput = z.input<typeof goalWizardSchema>;
export type GoalWizardFormOutput = z.output<typeof goalWizardSchema>;

export const goalSchema = goalWizardSchema.extend({
  id: z.string().min(1),
  createdAt: z.coerce.date(),
  progress: z.number().min(0).max(1),
  health: z.enum(GOAL_HEALTH),
});

export type Goal = z.infer<typeof goalSchema>;

export const STEP_FIELDS = {
  what: ["title", "description", "measure"] as const,
  when: [
    "category",
    "customCategory",
    "relevance",
    "cycleStart",
    "cycleEnd",
  ] as const,
  milestones: ["milestones"] as const,
};

export type StepKey = keyof typeof STEP_FIELDS;

export const STEPS: readonly StepKey[] = [
  "what",
  "when",
  "milestones",
] as const;

export const STEP_TITLE_EN: Record<StepKey, string> = {
  what: "What & how you'll measure",
  when: "When & why it matters",
  milestones: "Milestones",
};