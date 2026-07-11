import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { useTranslation } from '@/providers/useLocale';
import {
  getDailySummaryByDate,
  markDailySummaryShown,
  type DailySummary,
} from '../api/dashboardApi';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

/**
 * FR84 / FR84.1 — on first open after the day's start, show yesterday's
 * summary ("Yesterday: 5 tasks ✅ | 7 habits ✅ | 45 points"), then never
 * again that day. `getDailySummaryByDate` returns `summaryShown: true` for
 * any date with no real record (a brand-new account has no "yesterday" to
 * report), so this naturally no-ops for new users without extra logic here.
 */
export const DailySummaryToast = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const shownRef = useRef(false); // guards against StrictMode's double-invoke in dev

  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const { data } = useQuery({
    queryKey: [...QUERY_KEYS.DAILY_SUMMARY, 'yesterday', yesterday] as const,
    queryFn: () => getDailySummaryByDate(yesterday),
  });

  const markShown = useMutation({
    mutationFn: () => markDailySummaryShown(yesterday),
  });

  useEffect(() => {
    if (!data || data.summaryShown || shownRef.current) return;
    shownRef.current = true;

    const summary = data as DailySummary;
    toast(t(`dashboard.dayState.${summary.dayState}`), {
      description: t('dashboard.yesterdaySummary', {
        tasks: summary.tasksCompleted,
        habits: summary.habitsCompleted,
        points: summary.pointsEarned,
      }),
      duration: 6000,
    });

    markShown.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [...QUERY_KEYS.DAILY_SUMMARY, 'yesterday', yesterday] as const,
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return null;
};
