import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DayTypeContext, type DayTypeContextValue } from './DayTypeContextValue';
import { getDailySummary } from '@/features/dashboard/api/dashboardApi';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { resolveDayType, type DayType } from '@/features/settings/hooks/useDayType';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { format } from 'date-fns';

function deriveDayType(
  settings: ReturnType<typeof useSettings>['data'] | undefined,
  dailySummary: { dayType?: DayType } | undefined,
  now: Date,
): DayType {
  if (dailySummary?.dayType) return dailySummary.dayType;
  return resolveDayType(settings, now);
}

interface DayTypeProviderProps {
  children: React.ReactNode;
  /** Override "now" — useful for tests. */
  now?: Date;
}

export const DayTypeProvider: React.FC<DayTypeProviderProps> = ({ children, now }) => {
  const { data: settings } = useSettings();
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: QUERY_KEYS.DAILY_SUMMARY,
    queryFn: getDailySummary,
  });

  const value = useMemo<DayTypeContextValue>(() => {
    const nowDate = now ?? new Date();
    const dayType = deriveDayType(
      settings,
      summary as { dayType?: DayType } | undefined,
      nowDate,
    );
    return {
      dayType,
      dayTypeDate: format(nowDate, 'yyyy-MM-dd'),
      isLoading: summaryLoading,
    };
  }, [settings, summary, summaryLoading, now]);

  return <DayTypeContext.Provider value={value}>{children}</DayTypeContext.Provider>;
};
