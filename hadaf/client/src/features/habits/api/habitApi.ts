import { apiClient } from '@/shared/lib/api-client';
import type {
  Habit,
  HabitLog,
  CreateHabitInput,
  LogHabitInput,
} from '../types';

export const getHabits = async (): Promise<Habit[]> => {
  const response = await apiClient.get<Habit[] | { data: Habit[] }>('/habits');
  return Array.isArray(response.data)
    ? response.data
    : (response.data as { data: Habit[] }).data ?? [];
};

export const createHabit = async (input: CreateHabitInput): Promise<Habit> => {
  const response = await apiClient.post<Habit>('/habits', input);
  return response.data;
};

export const logHabit = async (
  id: string,
  input: LogHabitInput,
): Promise<HabitLog> => {
  const response = await apiClient.post<HabitLog>(`/habits/${id}/log`, input);
  return response.data;
};

export const logRelapse = async (id: string): Promise<HabitLog> => {
  const response = await apiClient.post<HabitLog>(`/habits/${id}/relapse`);
  return response.data;
};

export interface GetHabitLogsParams {
  startDate?: string;
  endDate?: string;
}

export const getHabitLogs = async (
  params: GetHabitLogsParams = {},
): Promise<HabitLog[]> => {
  const response = await apiClient.get<HabitLog[] | { data: HabitLog[] }>(
    '/habits/logs',
    { params },
  );
  return Array.isArray(response.data)
    ? response.data
    : (response.data as { data: HabitLog[] }).data ?? [];
};
