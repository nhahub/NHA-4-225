import type { TaskPriority } from '../../types';

export interface ChecklistFormValue {
  title: string;
  is_completed?: boolean;
  // Client-only, used to auto-calculate a big task's time-block end (see
  // TaskFormModal's auto-calc effect). Never sent to the API — the backend
  // checklist schema only has title/is_completed.
  durationMinutes?: number;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  date: string;
  priority: TaskPriority;
  goalId?: string;
  milestoneId?: string;
  goalPointsPlanned?: number;
  timeBlockStart?: string;
  timeBlockEnd?: string;
  plannedDurationMinutes?: number;
  checklist?: ChecklistFormValue[];
}
