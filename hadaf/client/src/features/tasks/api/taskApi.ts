import { apiClient } from '@/shared/lib/api-client';
import type {
  Task,
  CreateTaskInput,
  CompleteTaskInput,
  RescheduleTaskInput,
} from '../types';

export interface GetTasksParams {
  date?: string;
  status?: string;
  type?: string;
  view?: 'backlog';
}

export interface GetTasksMeta {
  count?: number;
  overLimit?: boolean;
}

export const getTasks = async (
  params: GetTasksParams = {},
): Promise<Task[] | { data: Task[]; meta: GetTasksMeta }> => {
  const response = await apiClient.get<Task[] | { data: Task[]; meta: GetTasksMeta }>(
    '/tasks',
    { params },
  );
  return response.data;
};

export const getBacklogTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>('/tasks', {
    params: { view: 'backlog' },
  });
  return (response.data as Task[]) || [];
};

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  const response = await apiClient.post<Task>('/tasks', input);
  return response.data;
};

export const completeTask = async (
  id: string,
  input: CompleteTaskInput = {},
): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/tasks/${id}/complete`, input);
  return response.data;
};

export const postponeTask = async (id: string): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/tasks/${id}/postpone`);
  return response.data;
};

export const rescheduleTask = async (
  id: string,
  input: RescheduleTaskInput,
): Promise<Task> => {
  const response = await apiClient.patch<Task>(
    `/tasks/${id}/reschedule`,
    input,
  );
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};
