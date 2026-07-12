import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getTasks } from '@/features/tasks/api/taskApi';
import { getDailySummary } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { Task } from '@/features/tasks/types';

export interface DashboardStats {
  pendingTasks: number;
  completedTasks: number;
  totalFocusMinutes: number;
  dailyScore: number;
  dailyTarget: number;
  isLoading: boolean;
}

/**
 * Composes DashboardStats from real endpoints instead of a phantom
 * `GET /dashboard`. Per the work order's recommended fix:
 *   - dailyScore / dailyTarget  ← GET /api/daily-summaries/today
 *   - pending/completed/focus    ← GET /api/tasks?date=<today> (client-side sum)
 */
export const useDashboardStats = (selectedDate: Date): DashboardStats => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const summary = useQuery({
    queryKey: QUERY_KEYS.DAILY_SUMMARY,
    queryFn: () => getDailySummary(),
  });
  const tasksQ = useQuery({
    queryKey: [...QUERY_KEYS.TASKS, 'dashboard', dateStr] as const,
    queryFn: async () => {
      const data = await getTasks({ date: dateStr });
      return Array.isArray(data) ? data : (data as { data: Task[] }).data ?? [];
    },
  });

  const tasks: Task[] = tasksQ.data ?? [];
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalFocusMinutes = tasks.reduce(
    (sum, t) =>
      sum + (t.actualDurationMinutes ?? t.plannedDurationMinutes ?? 0),
    0,
  );

  return {
    pendingTasks,
    completedTasks,
    totalFocusMinutes,
    dailyScore: (summary.data as { pointsEarned?: number })?.pointsEarned ?? 0,
    dailyTarget: (summary.data as { dailyTarget?: number })?.dailyTarget ?? 0,
    isLoading: summary.isLoading || tasksQ.isLoading,
  };
};
