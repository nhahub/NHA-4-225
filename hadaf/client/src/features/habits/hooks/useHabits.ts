import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  getHabits,
  createHabit as apiCreateHabit,
  logHabit as apiLogHabit,
  logRelapse as apiLogRelapse,
  getHabitLogs as apiGetHabitLogs,
} from '../api/habitApi';
import type { Habit, CreateHabitInput, LogHabitInput } from '../types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { useApiErrorHandler } from '@/shared/hooks/useApiErrorHandler';

export const useHabits = () =>
  useQuery({
    queryKey: QUERY_KEYS.HABITS,
    queryFn: getHabits,
  });

export const useHabitLogs = (
  startDate?: Date,
  endDate?: Date,
) =>
  useQuery({
    queryKey: [
      ...QUERY_KEYS.HABITS,
      'logs',
      startDate ? format(startDate, 'yyyy-MM-dd') : null,
      endDate ? format(endDate, 'yyyy-MM-dd') : null,
    ] as const,
    queryFn: () =>
      apiGetHabitLogs({
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      }),
  });

export const useCreateHabit = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: (input: CreateHabitInput) => apiCreateHabit(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HABITS });
    },
    onError: (err, input) =>
      handleError(err, {
        title: 'habits.errors.createFailed',
        retry: () => apiCreateHabit(input),
      }),
  });
};

export const useLogHabit = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: LogHabitInput }) =>
      apiLogHabit(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HABITS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_SUMMARY });
    },
    onError: (err, vars) =>
      handleError(err, {
        title: 'habits.errors.logFailed',
        retry: () => apiLogHabit(vars.id, vars.input),
      }),
  });
};

export const useLogRelapse = () => {
  const qc = useQueryClient();
  const handleError = useApiErrorHandler();
  return useMutation({
    mutationFn: (id: string) => apiLogRelapse(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.HABITS });
    },
    onError: (err, id) =>
      handleError(err, { title: 'habits.errors.relapseFailed', retry: () => apiLogRelapse(id) }),
  });
};

/** Returns a per-habit today's log, derived from the most recent habit-logs query. */
export function useTodayLog(habitId: string, todayStr: string, logs?: Habit[]): Habit | undefined {
  // Placeholder hook structure — actual log lookup is in useHabitLogs per-date.
  void habitId; void todayStr; void logs;
  return undefined;
}
