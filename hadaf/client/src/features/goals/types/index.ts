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
  sort_order: number;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface GoalStats {
  tasksCount: number;
  completedTasksCount: number;
  milestonesCount: number;
  completedMilestonesCount: number;
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
  measure: string;
  relevance?: string;
  cycleStart: string;
  cycleEnd: string;
  manualProgress?: number;
  status: GoalStatus;
  deletionReason?: string;
  createdAt?: string;
  updatedAt?: string;

  /** Compile-progress fields — added by the server's `compileGoalProgress`. */
  progress?: number;
  health?: GoalHealth;
  isOverride?: boolean;
  weeklyExecutionScore?: number;
  stats?: GoalStats;
  /** Per-week completion buckets (12 entries, week 1–12). */
  weeklyCompletion?: WeeklyCompletionBucket[];
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  customCategory?: string;
  measure: string;
  relevance?: string;
  cycleStart: string;
  cycleEnd: string;
  milestones?: string[];
}

export interface GoalDetailResponse {
  goal: Goal;
  milestones: Milestone[];
  tasks: Array<{
    _id: string;
    title: string;
    status: 'pending' | 'completed' | 'postponed';
    date: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}
