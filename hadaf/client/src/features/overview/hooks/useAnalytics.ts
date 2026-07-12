import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { getAnalyticsOverview, getHabitsAnalytics } from '../api/analyticsApi';
import type { RangePreset } from '../types';

/** Local YYYY-MM-DD (client wall-clock; server clamps to its logical day). */
const localDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const presetToRange = (preset: RangePreset) => {
  const to = new Date();
  const from = new Date(to.getTime() - (preset - 1) * 24 * 60 * 60 * 1000);
  return { from: localDateStr(from), to: localDateStr(to) };
};

export const useAnalyticsOverview = (preset: RangePreset) => {
  const range = presetToRange(preset);
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS_OVERVIEW(range.from, range.to),
    queryFn: () => getAnalyticsOverview(range),
  });
};

export const useHabitsAnalytics = (preset: RangePreset) => {
  const range = presetToRange(preset);
  return useQuery({
    queryKey: QUERY_KEYS.ANALYTICS_HABITS(range.from, range.to),
    queryFn: () => getHabitsAnalytics(range),
  });
};
