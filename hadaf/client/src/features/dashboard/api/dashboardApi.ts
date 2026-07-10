import { apiClient } from '@/shared/lib/api-client';

export interface DashboardStats {
  pendingTasks: number;
  completedTasks: number;
  totalFocusTime: number; // in minutes
  dailyScore: number;
  dailyTarget: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiClient.get('/dashboard');
};