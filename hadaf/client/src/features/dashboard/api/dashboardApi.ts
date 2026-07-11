import { apiClient } from '@/shared/lib/api-client';

export interface CapacityData {
  date: string;
  dayType: 'work' | 'light' | 'off';
  totalCapacityMinutes: number;
  totalPlannedMinutes: number;
}

export const getCapacity = async (): Promise<CapacityData> => {
  const response = await apiClient.get<CapacityData>('/daily-summaries/capacity');
  return response.data;
};

export interface DailySummary {
  userId?: string;
  date: string;
  dayType: 'work' | 'light' | 'off';
  tasksCompleted: number;
  habitsCompleted: number;
  pointsEarned: number;
  dailyTarget: number;
  dayState: 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low';
  summaryShown?: boolean;
}

export const getDailySummary = async (): Promise<DailySummary> => {
  const response = await apiClient.get<DailySummary>('/daily-summaries/today');
  return response.data;
};

// E4-1: manual "today only" day-type override (FR55.1). Upserts today's
// DailySummary with the chosen dayType; DayTypeProvider already prefers
// dailySummary.dayType over the computed off_days fallback, so this is the
// write-side of a read path that already existed.
export const updateDayType = async (
  date: string,
  dayType: 'work' | 'light' | 'off'
): Promise<DailySummary> => {
  const response = await apiClient.patch<DailySummary>(
    `/daily-summaries/${date}/day-type`,
    { dayType }
  );
  return response.data;
};

// HOME-1: fetch any date's summary (used for "yesterday's" Daily Summary
// Toast, FR84/FR84.1). Returns a zeroed placeholder from the server if
// nothing was recorded that day — never a 404.
export const getDailySummaryByDate = async (date: string): Promise<DailySummary> => {
  const response = await apiClient.get<DailySummary>(`/daily-summaries/${date}`);
  return response.data;
};

// HOME-1: mark a day's summary as shown so the toast only ever appears once.
export const markDailySummaryShown = async (date: string): Promise<DailySummary> => {
  const response = await apiClient.patch<DailySummary>(`/daily-summaries/${date}/shown`, {});
  return response.data;
};
