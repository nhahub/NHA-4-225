import { apiClient } from '@/shared/lib/api-client';
import type { Task } from '../types';

// TODO(E2): rewire to Express task endpoints — `/api/tasks/*`.
// The current Task type in features/tasks/types still matches Impulse's old
// shape (day/startTime/endTime/subTasks). E2 will introduce the real Task
// model (date, plannedDurationMinutes, checklist, etc.) and rebuild this
// module against it. For E0-1 we just need a compiling stub.

export const getTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>('/tasks');
  return response.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
  const response = await apiClient.post<Task>('/tasks', data);
  return response.data;
};

export const updateTask = async ({
  id,
  updates,
}: {
  id: string | number;
  updates: Partial<Task>;
}): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, updates);
  return response.data;
};

export const deleteTask = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const createBigTask = async (data: Partial<Task>): Promise<Task> => {
  const response = await apiClient.post<Task>('/tasks/big', data);
  return response.data;
};

export const getPoints = async (): Promise<{ points: number }> => {
  const response = await apiClient.get<{ points: number }>('/tasks/points');
  return response.data;
};

export const deleteSubTask = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/tasks/subtasks/${id}`);
};