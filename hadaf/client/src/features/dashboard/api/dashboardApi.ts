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
