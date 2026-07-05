import {
  pgTable,
  text,
  uuid,
  jsonb,
  boolean,
  timestamp,
  integer,
  date,
  time,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

// ═══════════════════════════════════════
// 0. ENUMS DEFINITIONS
// ═══════════════════════════════════════
export const goalCategoryEnum = pgEnum("goal_category", [
  "education_work",
  "family",
  "health",
  "religion_spirituality",
  "other",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "archived",
  "replaced",
]);

export const taskTypeEnum = pgEnum("task_type", [
  "scheduled",
  "flexible",
  "quick",
]);

export const taskDifficultyEnum = pgEnum("task_difficulty", [
  "easy",
  "medium",
  "hard",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "high",
  "medium",
  "low",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "completed",
  "postponed",
]);

export const habitTypeEnum = pgEnum("habit_type", [
  "boolean",
  "counter",
  "quit",
]);

export const dayTypeEnum = pgEnum("day_type", ["work", "light", "off"]);

export const dayStateEnum = pgEnum("day_state", [
  "legendary",
  "amazing",
  "perfect",
  "good_enough",
  "low",
]);

// ═══════════════════════════════════════
// 1. USERS TABLE
// ═══════════════════════════════════════
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  settings: jsonb("settings")
    .notNull()
    .$defaultFn(() => ({
      work_hours_start: "09:00",
      work_hours_end: "17:00",
      day_start: "04:00",
      off_days: ["friday", "saturday"],
      theme: "light",
      language: "ar",
      notifications: { time_block_reminder: true },
    })),
  refreshToken: text("refresh_token"),
  refreshTokenExp: timestamp("refresh_token_exp", { withTimezone: true }),
  onboardingCompleted: boolean("onboarding_completed")
    .notNull()
    .default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ═══════════════════════════════════════
// 2. GOALS TABLE
// ═══════════════════════════════════════
export const goals = pgTable(
  "goals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: goalCategoryEnum("category").notNull(),
    customCategory: text("custom_category"),
    measure: text("measure").notNull(),
    relevance: text("relevance"),
    cycleStart: date("cycle_start").notNull(),
    cycleEnd: date("cycle_end").notNull(),
    manualProgress: integer("manual_progress"),
    status: goalStatusEnum("status").notNull().default("active"),
    deletionReason: text("deletion_reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    idxGoalsUserStatus: index("idx_goals_user_status").on(
      table.userId,
      table.status,
    ),
  }),
);

// ═══════════════════════════════════════
// 3. MILESTONES TABLE
// ═══════════════════════════════════════
export const milestones = pgTable("milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ═══════════════════════════════════════
// 4. TASKS TABLE
// ═══════════════════════════════════════
export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    goalId: uuid("goal_id").references(() => goals.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    description: text("description"),
    type: taskTypeEnum("type").notNull().default("quick"),
    difficulty: taskDifficultyEnum("difficulty").notNull().default("medium"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    date: date("date")
      .notNull()
      .$defaultFn(() => new Date().toISOString().split("T")[0]),
    timeBlockStart: time("time_block_start"),
    timeBlockEnd: time("time_block_end"),
    plannedDurationMinutes: integer("planned_duration_minutes"),
    actualDurationMinutes: integer("actual_duration_minutes"),
    checklist: jsonb("checklist").$defaultFn(() => []),
    status: taskStatusEnum("status").notNull().default("pending"),
    pointsEarned: integer("points_earned").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    idxTasksUserDatePriority: index("idx_tasks_user_date_priority").on(
      table.userId,
      table.date,
      table.priority,
    ),
    idxTasksUserGoal: index("idx_tasks_user_goal").on(
      table.userId,
      table.goalId,
    ),
  }),
);

// ═══════════════════════════════════════
// 5. HABITS TABLE
// ═══════════════════════════════════════
export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: goalCategoryEnum("category").notNull(),
  type: habitTypeEnum("type").notNull().default("boolean"),
  frequency: jsonb("frequency")
    .notNull()
    .$defaultFn(() => ({ type: "daily" })),
  targetValue: integer("target_value"),
  mvdValue: integer("mvd_value"),
  mvdDescription: text("mvd_description"),
  isSpiritual: boolean("is_spiritual").notNull().default(false),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ═══════════════════════════════════════
// 6. HABIT LOGS TABLE
// ═══════════════════════════════════════
export const habitLogs = pgTable(
  "habit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    value: integer("value").notNull().default(0),
    isMvd: boolean("is_mvd").notNull().default(false),
    isRelapse: boolean("is_relapse").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqHabitLogDate: unique("uniq_habit_log_date").on(
      table.habitId,
      table.date,
    ),
    idxHabitLogsHabitDate: index("idx_habit_logs_habit_date").on(
      table.habitId,
      table.date,
    ),
  }),
);

// ═══════════════════════════════════════
// 7. DAILY SUMMARIES TABLE
// ═══════════════════════════════════════
export const dailySummaries = pgTable(
  "daily_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    dayType: dayTypeEnum("day_type").notNull().default("work"),
    tasksCompleted: integer("tasks_completed").notNull().default(0),
    habitsCompleted: integer("habits_completed").notNull().default(0),
    pointsEarned: integer("points_earned").notNull().default(0),
    dailyTarget: integer("daily_target").notNull().default(0),
    dayState: dayStateEnum("day_state"),
    summaryShown: boolean("summary_shown").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqUserDailySummaryDate: unique("uniq_user_daily_summary_date").on(
      table.userId,
      table.date,
    ),
  }),
);

// ═══════════════════════════════════════
// 8. ANALYTICS EVENTS TABLE
// ═══════════════════════════════════════
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    eventData: jsonb("event_data"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    idxAnalyticsUserCreated: index("idx_analytics_user_created").on(
      table.userId,
      table.createdAt,
    ),
  }),
);
