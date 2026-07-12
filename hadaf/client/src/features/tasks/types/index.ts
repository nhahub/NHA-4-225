export type TaskType = 'scheduled' | 'flexible' | 'quick';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'completed' | 'postponed';

export interface ChecklistItem {
  _id?: string;
  title: string;
  is_completed: boolean;
}

export interface Task {
  _id: string;
  userId?: string;
  goalId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  date: string;
  timeBlockStart?: string;
  timeBlockEnd?: string;
  plannedDurationMinutes?: number;
  actualDurationMinutes?: number;
  checklist: ChecklistItem[];
  status: TaskStatus;
  pointsEarned: number;
  /** Points this task is worth toward its parent goal's targetPoints. Only set when goalId is set. */
  goalPointsPlanned?: number;
  /** Points actually confirmed delivered toward the goal at completion time. */
  goalPointsEarned?: number;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  predictedPoints?: number;
  streakDays?: number;
}

export interface CreateTaskInput {
  goalId?: string;
  milestoneId?: string;
  title: string;
  description?: string;
  date: string;
  priority?: TaskPriority;
  type?: TaskType;
  timeBlockStart?: string;
  timeBlockEnd?: string;
  plannedDurationMinutes?: number;
  goalPointsPlanned?: number;
  checklist?: { title: string; is_completed?: boolean }[];
}

export interface CompleteTaskInput {
  actualDurationMinutes?: number;
  goalPointsEarned?: number;
}

export interface RescheduleTaskInput {
  date: string;
  timeBlockStart?: string;
  timeBlockEnd?: string;
}
