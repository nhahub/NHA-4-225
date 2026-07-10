export const QUERY_KEYS = {
  AUTH: ['auth'],
  TASKS: ['tasks'],
  TASK_DETAIL: (id: string) => ['tasks', id] as const,
  GOALS: ['goals'] as const,
  GOAL_DETAIL: (id: string) => ['goals', id] as const,
  HABITS: ['habits'] as const,
  DAILY_SUMMARY: ['daily-summaries', 'today'] as const,
  DAILY_CAPACITY: ['daily-summaries', 'capacity'] as const,
  SETTINGS: ['user', 'settings'] as const,
} as const;
