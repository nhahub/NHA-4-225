import React, { useEffect } from 'react';
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
import { TaskSubtasks } from './TaskSubtasks';
import { differenceInMinutes, parse, addMinutes, format, isValid } from 'date-fns';

const bigTaskSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  day: z.string().min(1, 'Required'),
  startTime: z.string().min(1, 'Required'),
  endTime: z.string().min(1, 'Required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subTasks: z.array(z.object({
    name: z.string().optional(),
    isCompleted: z.boolean().default(false),
    timeEstimate: z.coerce.number().min(1).default(30)
  }).strict()).optional()
});

type BigFormValues = z.infer<typeof bigTaskSchema>;

interface EditBigTaskFormProps {
  task: Task;
  onClose: () => void;
}

export const EditBigTaskForm = ({ task, onClose }: EditBigTaskFormProps) => {
  const updateTask = useUpdateTask();

  const methods = useForm<BigFormValues>({
    resolver: zodResolver(bigTaskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || '',
      day: task.day,
      priority: task.priority,
      startTime: task.startTime,
      endTime: task.endTime,
      subTasks: task.subTasks?.map(st => ({ 
        name: st.name, 
        isCompleted: st.isCompleted,
        timeEstimate: st.timeEstimate || 30
      })) || []
    },
  });

  const { handleSubmit, watch, setValue, formState: { isSubmitting } } = methods;
  const startTime = watch('startTime');
  const subTasks = watch('subTasks');

  useEffect(() => {
    if (subTasks) {
      const validSubTasks = subTasks.filter(st => st.name && st.name.trim().length > 0);
      const totalMinutes = validSubTasks.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);
      const durationToAdd = totalMinutes > 0 ? totalMinutes : 30; 

      if (startTime) {
        const startDate = parse(startTime, 'HH:mm', new Date());
        if (isValid(startDate)) {
          const endDate = addMinutes(startDate, durationToAdd);
          setValue('endTime', format(endDate, 'HH:mm'));
        }
      }
    }
  }, [subTasks, startTime, setValue]);

  const calculateDuration = (start: string, end: string) => {
    try {
      const s = parse(start, 'HH:mm', new Date());
      const e = parse(end, 'HH:mm', new Date());
      let diff = differenceInMinutes(e, s);
      if (diff < 0) diff += 1440;
      return diff;
    } catch { return 60; }
  };

  const onSubmit = async (data: BigFormValues) => {
    try {
      const validSubTasks = data.subTasks
        ?.filter(st => st.name && st.name.trim().length > 0)
        .map(st => ({
          id: crypto.randomUUID(), 
          isCompleted: false, 
          name: st.name!,
          timeEstimate: st.timeEstimate || 30
        }));

      await updateTask.mutateAsync({
        id: task.id,
        updates: {
          ...data,
          expectedTime: calculateDuration(data.startTime, data.endTime),
          subTasks: validSubTasks,
          type: 'big_task'
        }
      });
      onClose();
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh]"> 
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-purple-50/30 dark:bg-purple-900/10 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 size={18} className="text-purple-600" />
          Edit Big Task
        </h2>
        <p className="text-xs text-gray-500 mt-1">Managing project structure</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 scrollbar-hide">
        <FormProvider {...methods}>
          <form id="edit-big-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <TaskHeader />
            <div className="animate-slide-in-up">
              <TaskSubtasks />
            </div>
            
            {/* ✅ FIXED: Removed redundant Grid & Message. TaskScheduling handles it. */}
            <TaskScheduling isAutoScheduled={true} />
            
            <TaskPriority />
          </form>
        </FormProvider>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-gray-900 shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
        <Button 
          type="submit" 
          form="edit-big-form" 
          isLoading={isSubmitting} 
          size="sm" 
          className="px-6 shadow-lg shadow-purple-500/20"
        >
          Update Project
        </Button>
      </div>
    </div>
  );
};