import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/taskApi';
import { Task } from '../types';

const QUERY_KEYS = {
  TASKS: 'tasks',
  POINTS: 'points',
};

export const useTasks = (date: Date) => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, date],
    queryFn: () => api.getTasks(date),
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTask: Partial<Task>) => {
      if (newTask.type === 'big_task') {
         return api.createBigTask(newTask as Task);
      }
      return api.createTask(newTask);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      
      const tasks = queryClient.getQueryData<Task[]>([QUERY_KEYS.TASKS, /* التاريخ هنا مشكلة بسيطة، هنفترض اننا في نفس الصفحة */]) 
         || queryClient.getQueriesData({ queryKey: [QUERY_KEYS.TASKS] }).map(q => q[1]).flat(); // بحث عميق في كل الكاش

      // @ts-ignore
      const currentTask = tasks?.find((t: Task) => t.id == id); // == عشان لو string/number

      if (!currentTask) {
        throw new Error("Task not found in cache! Cannot update safely.");
      }

      const fullTask = { ...currentTask, ...updates };
      return api.updateTask(fullTask as Task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS] });
    },
  });
};

export const useToggleTaskDone = () => {
  const updateTask = useUpdateTask();
  return {
    mutate: ({ id, done }: { id: string; done: boolean }) => {
      updateTask.mutate({ id, updates: { done } });
    }
  };
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.POINTS] });
    },
  });
};

export const usePoints = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.POINTS],
    queryFn: api.getPoints,
  });
};

// 7. هوك حذف مهمة فرعية
export const useDeleteSubTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSubTask(id),
    onSuccess: () => {
      // تحديث المهام عشان تختفي المهمة الفرعية
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS] });
    },
  });
};