import { useQueries } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getTasks } from '@/features/tasks/api/taskApi';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useActiveGoals } from '@/features/goals/hooks/useGoals';
import { getDailySummary } from '@/features/dashboard/api/dashboardApi';
import type { Task } from '@/features/tasks/types';
import type { Habit } from '@/features/habits/types';
import type { Goal } from '@/features/goals/types';
import type { DailySummary, CapacityData } from '@/features/dashboard/api/dashboardApi';
import { getCapacity } from '@/features/dashboard/api/dashboardApi';

export interface HomeData {
  selectedDate: Date;
  dateStr: string;
  tasks: Task[];
  habits: Habit[];
  backlogCount: number;
  activeGoals: Goal[];
  summary: DailySummary | undefined;
  capacity: CapacityData | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * HOME-2 parallel fetch — every endpoint the home screen renders starts at
 * mount, not after one another. Uses `useQueries` for the two date-scoped
 * task queries (today's list + backlog) plus independent `useQuery` hooks
 * for the rest. React Query batches these into concurrent HTTP requests
 * instead of a sequential waterfall.
 *
 * Note: `queryKeys.ts` is frozen per the prompt — local home keys use the
 * literal `['home', ...]` namespace instead of the shared registry.
 */
export const useHomeData = (selectedDate: Date): HomeData => {
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const tasksQuery = useQueries({
    queries: [
      {
        queryKey: ['home', 'tasks', dateStr] as const,
        queryFn: async (): Promise<Task[]> => {
          const data = await getTasks({ date: dateStr });
          return Array.isArray(data) ? data : (data as { data: Task[] }).data ?? [];
        },
      },
      {
        queryKey: ['home', 'tasks', 'backlog'] as const,
        queryFn: async (): Promise<Task[]> => {
          const data = await getTasks({ view: 'backlog' });
          return Array.isArray(data) ? data : (data as { data: Task[] }).data ?? [];
        },
      },
    ],
  });

  const habitsQuery = useHabits();
  const goalsQuery = useActiveGoals();
  const summaryQuery = useQueries({
    queries: [
      {
        queryKey: ['home', 'daily-summary', dateStr] as const,
        queryFn: () => getDailySummary(dateStr),
      },
      {
        queryKey: ['home', 'daily-summary', 'capacity'] as const,
        queryFn: getCapacity,
      },
    ],
  });

  const tasks: Task[] = tasksQuery[0].data ?? [];
  const backlog: Task[] = tasksQuery[1].data ?? [];
  const summary = summaryQuery[0].data;
  const capacity = summaryQuery[1].data;

  const isLoading =
    tasksQuery.some((q) => q.isLoading) ||
    habitsQuery.isLoading ||
    goalsQuery.isLoading ||
    summaryQuery.some((q) => q.isLoading);

  const isError =
    tasksQuery.some((q) => q.isError) ||
    habitsQuery.isError ||
    goalsQuery.isError ||
    summaryQuery.some((q) => q.isError);

  return {
    selectedDate,
    dateStr,
    tasks,
    habits: habitsQuery.data ?? [],
    backlogCount: backlog.length,
    activeGoals: goalsQuery.data ?? [],
    summary,
    capacity,
    isLoading,
    isError,
  };
};