import type { HealthLevel } from '@/shared/components/ui/healthTokens';

export type GoalCategory =
  | 'education_work'
  | 'family'
  | 'health'
  | 'religion_spirituality'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'archived' | 'replaced';

/** Goals-domain alias for the shared HealthLevel union. */
export type GoalHealth = HealthLevel;

export const GOAL_CATEGORY_LABELS: Record<GoalCategory, { ar: string; en: string }> = {
  education_work: { ar: 'تعليم/عمل', en: 'Education/Work' },
  family: { ar: 'أسرة', en: 'Family' },
  health: { ar: 'صحة', en: 'Health' },
  religion_spirituality: { ar: 'روحانية/دين', en: 'Spirituality' },
  other: { ar: 'أخرى', en: 'Other' },
};

export const GOAL_STATUS_LABELS: Record<GoalStatus, { ar: string; en: string }> = {
  active: { ar: 'نشطة', en: 'Active' },
  completed: { ar: 'مكتملة', en: 'Completed' },
  archived: { ar: 'مؤرشفة', en: 'Archived' },
  replaced: { ar: 'مستبدلة', en: 'Replaced' },
};

export interface Milestone {
  _id: string;
  goalId: string;
  title: string;
  /** Date range this milestone (sub-goal) covers within the cycle. Absent for plain checklist-style milestones. */
  startDate?: string | null;
  endDate?: string | null;
  sort_order: number;
  is_completed: boolean;
  completed_at?: string | null;
  /** Derived fields attached by the server when returned from goal detail. */
  progress?: number;
  tasksCount?: number;
  completedTasksCount?: number;
}

/** Draft shape used while composing a goal in the wizard, before dates are resolved server-side. */
export interface MilestoneDraft {
  title: string;
  startDate?: string;
  endDate?: string;
}

export interface GoalStats {
  tasksCount: number;
  completedTasksCount: number;
  milestonesCount: number;
  completedMilestonesCount: number;
  targetPoints: number;
  earnedPoints: number;
}

export interface WeeklyCompletionBucket {
  week: number;
  total: number;
  completed: number;
  /** Completion percentage 0–100. */
  ratio: number;
}

export interface Goal {
  _id: string;
  userId?: string;
  title: string;
  description?: string;
  category: GoalCategory;
  customCategory?: string;
  /** Target points pool the goal is measured against — earned via its linked tasks. */
  targetPoints: number;
  relevance?: string;
  cycleStart: string;
  cycleEnd: string;
  status: GoalStatus;
  deletionReason?: string;
  createdAt?: string;
  updatedAt?: string;

  /** Compile-progress fields — added by the server's `compileGoalProgress`. */
  progress?: number;
  health?: GoalHealth;
  weeklyExecutionScore?: number;
  stats?: GoalStats;
  /** Total weeks in this goal's cycle (derived from cycleStart/cycleEnd; 12 by default). */
  totalWeeks?: number;
  /** Current week number within the cycle (1–totalWeeks). */
  currentWeek?: number;
  /** Per-week completion buckets — one entry per week of the cycle. */
  weeklyCompletion?: WeeklyCompletionBucket[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  customCategory?: string;
  targetPoints: number;
  relevance?: string;
  cycleStart: string;
  cycleEnd: string;
  milestones?: MilestoneDraft[];
}

export interface GoalDetailResponse {
  goal: Goal;
  milestones: Milestone[];
  tasks: Array<{
    _id: string;
    title: string;
    status: 'pending' | 'completed' | 'postponed';
    date: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    milestoneId?: string;
    goalPointsPlanned?: number;
    goalPointsEarned?: number;
  }>;
}
