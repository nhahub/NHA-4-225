import { apiClient } from '@/shared/lib/api-client';
import type {
  Goal,
  CreateGoalInput,
  GoalDetailResponse,
  Milestone,
  GoalStatus,
  GoalCategory,
} from '../types';

export interface GetGoalsParams {
  status?: GoalStatus;
  category?: GoalCategory;
}

export const getActiveGoals = async (): Promise<Goal[]> => {
  const response = await apiClient.get<Goal[]>('/goals/active');
  return response.data;
};

export const getGoals = async (params: GetGoalsParams = {}): Promise<Goal[]> => {
  const response = await apiClient.get<Goal[]>('/goals', { params });
  return response.data;
};

export const getGoalDetail = async (id: string): Promise<GoalDetailResponse> => {
  const response = await apiClient.get<GoalDetailResponse>(`/goals/${id}`);
  return response.data;
};

export const createGoal = async (input: CreateGoalInput): Promise<Goal> => {
  const response = await apiClient.post<Goal>('/goals', input);
  return response.data;
};

export const updateGoal = async (
  id: string,
  patch: Partial<CreateGoalInput>,
): Promise<Goal> => {
  const response = await apiClient.patch<Goal>(`/goals/${id}`, patch);
  return response.data;
};

export const archiveGoal = async (id: string, reason: string): Promise<void> => {
  await apiClient.delete(`/goals/${id}`, { data: { reason } });
};

export const replaceGoal = async (
  id: string,
  input: CreateGoalInput & { reason: string },
): Promise<Goal> => {
  const response = await apiClient.post<Goal>(`/goals/${id}/replace`, input);
  return response.data;
};

export const reorderMilestones = async (
  milestones: Array<{ id: string; sort_order: number }>,
): Promise<void> => {
  await apiClient.put('/milestones/reorder', { milestones });
};

export const addMilestone = async (
  goalId: string,
  title: string,
  dates?: { startDate?: string; endDate?: string },
): Promise<Milestone> => {
  const response = await apiClient.post<Milestone>(`/goals/${goalId}/milestones`, {
    title,
    ...dates,
  });
  return response.data;
};
