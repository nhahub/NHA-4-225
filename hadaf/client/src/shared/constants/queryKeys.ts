export const QUERY_KEYS = {
  AUTH: ['auth'],
  TASKS: ['tasks'],
  TASK_DETAIL: (id: string) => ['tasks', id],
  DASHBOARD_STATS: ['dashboard', 'stats'],
} as const;