import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  getTasks,
  createTask as apiCreateTask,
  completeTask as apiCompleteTask,
  postponeTask as apiPostponeTask,
  rescheduleTask as apiRescheduleTask,
  deleteTask as apiDeleteTask,
} from '../api/taskApi';
import type {
  Task,
  CreateTaskInput,
  CompleteTaskInput,
  RescheduleTaskInput,
} from '../types';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';

/**
 * useUpdateTask — partial-update shim. The backend currently has no general
 * PATCH /tasks/:id endpoint; only the action-specific PATCH /:id/{complete,
 * postpone, reschedule} routes. Consumers that previously expected a generic
 * update get date/time-block routed through useRescheduleTask; everything
 * else is a known gap surfaced via the checklistEditHint in TaskFormModal.
 */
export interface UpdateTaskInput {
  id: string;
  input: Partial<CreateTaskInput> & {
    title?: string;
    description?: string;
    priority?: Task['priority'];
    difficulty?: Task['difficulty'];
    date?: string;
    timeBlockStart?: string;
    timeBlockEnd?: string;
    plannedDurationMinutes?: number;
    checklist?: Task['checklist'];
  };
}

export const tasksQueryKey = (dateStr: string) =>
  [...QUERY_KEYS.TASKS, dateStr] as const;

export const useTasksByDate = (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return useQuery({
    queryKey: tasksQueryKey(dateStr),
    queryFn: () => getTasks({ date: dateStr }),
    select: (data): Task[] => (Array.isArray(data) ? data : (data as any).data ?? []),
  });
};

export const useBacklogTasks = () =>
  useQuery({
    queryKey: [...QUERY_KEYS.TASKS, 'backlog'] as const,
    queryFn: () => getTasks({ view: 'backlog' }),
    select: (data): Task[] =>
      Array.isArray(data) ? data : (data as any).data ?? [],
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => apiCreateTask(input),
    onSuccess: (task) => {
      const key = tasksQueryKey(task.date);
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_SUMMARY });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: CompleteTaskInput }) =>
      apiCompleteTask(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_SUMMARY });
    },
  });
};

export const usePostponeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiPostponeTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
    },
  });
};

export const useRescheduleTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RescheduleTaskInput }) =>
      apiRescheduleTask(id, input),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(task.date) });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDeleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DAILY_SUMMARY });
    },
  });
};

/**
 * useUpdateTask — see UpdateTaskInput doc above. Only the date/time-block
 * path is implemented today (via the backend's reschedule endpoint); other
 * changes are silently dropped, with a console warning so a future agent can
 * close the gap by adding a generic PATCH /tasks/:id endpoint.
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: UpdateTaskInput) => {
      const changedTime =
        input.date !== undefined ||
        input.timeBlockStart !== undefined ||
        input.timeBlockEnd !== undefined;
      if (changedTime && input.date) {
        return apiRescheduleTask(id, {
          date: input.date,
          timeBlockStart: input.timeBlockStart,
          timeBlockEnd: input.timeBlockEnd,
        });
      }
      // Other edits have no backend route yet. Surface the gap.
      if (
        input.title !== undefined ||
        input.description !== undefined ||
        input.priority !== undefined ||
        input.difficulty !== undefined ||
        input.checklist !== undefined ||
        input.plannedDurationMinutes !== undefined
      ) {
        console.warn(
          '[useUpdateTask] partial task-edit fields have no backend route yet; ignored. ' +
            'Add a generic PATCH /tasks/:id endpoint to close this gap.',
        );
      }
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TASKS] });
    },
  });
};
