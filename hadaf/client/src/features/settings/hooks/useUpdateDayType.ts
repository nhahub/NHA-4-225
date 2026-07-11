import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { updateDayType } from '@/features/dashboard/api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import type { DayType } from './useDayType';

/**
 * FR55.1: the user can manually override today's day type (Work/Light/Off).
 * This writes to today's DailySummary — DayTypeProvider already reads
 * dailySummary.dayType ahead of the computed off_days fallback, so
 * invalidating QUERY_KEYS.DAILY_SUMMARY is enough to make the override take
 * effect everywhere (Home greeting, capacity gauge, habit MVD indicator).
 */
export function useUpdateDayType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dayType: DayType) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      return updateDayType(today, dayType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_SUMMARY });
    },
  });
}
