import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useUpdateTask } from '../../hooks/useTasks';
import type { Task } from '../../types';
import { TaskHeader } from './TaskHeader';
import { TaskScheduling } from './TaskScheduling';
import { TaskPriority } from './TaskPriority';
import { differenceInMinutes, parse } from 'date-fns';

const regularTaskSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  day: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type RegularFormValues = z.infer<typeof regularTaskSchema>;

interface EditRegularTaskFormProps {
  task: Task;
  onClose: () => void;
}

export const EditRegularTaskForm = ({ task, onClose }: EditRegularTaskFormProps) => {
  const updateTask = useUpdateTask();

  const methods = useForm<RegularFormValues>({
    resolver: zodResolver(regularTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || '',
      day: task.day,
      priority: task.priority,
      startTime: task.startTime,
      endTime: task.endTime,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  const calculateDuration = (start: string, end: string) => {
    try {
      const s = parse(start, 'HH:mm', new Date());
      const e = parse(end, 'HH:mm', new Date());
      let diff = differenceInMinutes(e, s);
      if (diff < 0) diff += 1440;
      return diff;
    } catch { return 60; }
  };

  const onSubmit = async (data: RegularFormValues) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        updates: {
          ...data,
          expectedTime: calculateDuration(data.startTime, data.endTime),
          type: 'regular'
        }
      });
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    // ✅ FIX: Set explicit height constraints
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 size={18} className="text-brand-600" />
          Edit Regular Task
        </h2>
        <p className="text-xs text-gray-500 mt-1">Update details for "{task.name}"</p>
      </div>

      {/* Body - ✅ FIX: min-h-0 allows scrolling inside flex item */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 scrollbar-hide">
        <FormProvider {...methods}>
          <form id="edit-regular-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TaskHeader />
            <TaskScheduling />
            <TaskPriority />
          </form>
        </FormProvider>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button 
          type="submit" 
          form="edit-regular-form" 
          isLoading={isSubmitting} 
          size="sm" 
          className="px-6"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};