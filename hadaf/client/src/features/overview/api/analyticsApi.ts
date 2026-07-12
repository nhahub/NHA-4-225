import { apiClient } from '@/shared/lib/api-client';
import type { AnalyticsOverview, HabitsAnalyticsResponse } from '../types';

export interface AnalyticsRangeParams {
  from?: string;
  to?: string;
}

export const getAnalyticsOverview = async (
  params: AnalyticsRangeParams = {},
): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverview>(
    '/analytics/overview',
    { params },
  );
  return response.data;
};

export const getHabitsAnalytics = async (
  params: AnalyticsRangeParams = {},
): Promise<HabitsAnalyticsResponse> => {
  const response = await apiClient.get<HabitsAnalyticsResponse>(
    '/analytics/habits',
    { params },
  );
  return response.data;
};
