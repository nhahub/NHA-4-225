import type { TaskDifficulty, TaskPriority } from '../../types';

export interface ChecklistFormValue {
  title: string;
  is_completed?: boolean;
}

export interface TaskFormValues {
  title: string;
  description?: string;
  date: string;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  timeBlockStart?: string;
  timeBlockEnd?: string;
  plannedDurationMinutes?: number;
  checklist?: ChecklistFormValue[];
}
