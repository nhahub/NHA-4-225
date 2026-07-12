import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Task } from '../../types';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';
import {
  TaskFormBody as TaskFormBodyFields,
  type TaskFormValues,
} from './sharedBody';
import { useUpdateTask } from '../../hooks/useTasks';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.enum(['urgent', 'high', 'medium', 'low']),
  timeBlockStart: z.string().optional().or(z.literal('')),
  timeBlockEnd: z.string().optional().or(z.literal('')),
  plannedDurationMinutes: z.number().int().nonnegative().optional(),
  checklist: z.array(z.object({ title: z.string(), is_completed: z.boolean().optional() })).optional(),
});

interface EditRegularTaskFormProps {
  task: Task;
  onClose: () => void;
}

export const EditRegularTaskForm = ({ task, onClose }: EditRegularTaskFormProps) => {
  const updateTask = useUpdateTask();
  const { t } = useTranslation();

  const methods = useForm<TaskFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      date: task.date,
      priority: task.priority,
      timeBlockStart: task.timeBlockStart ?? '',
      timeBlockEnd: task.timeBlockEnd ?? '',
      plannedDurationMinutes: task.plannedDurationMinutes ?? undefined,
      checklist: task.checklist?.map((c) => ({ title: c.title, is_completed: c.is_completed })) ?? [],
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 size={18} className="text-brand-600" />
          {t('tasks.editTask')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{task.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 scrollbar-hide">
        <FormProvider {...methods}>
          <form
            id="edit-task-form"
            onSubmit={handleSubmit(async (data) => {
              try {
                await updateTask.mutateAsync({
                  id: task._id,
                  input: {
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    date: data.date,
                    timeBlockStart: data.timeBlockStart || undefined,
                    timeBlockEnd: data.timeBlockEnd || undefined,
                    plannedDurationMinutes: data.plannedDurationMinutes,
                    checklist: (data.checklist ?? [])
                      .filter((c) => c.title.trim())
                      .map((c: any) => ({
                        title: c.title,
                        is_completed: c.is_completed ?? false,
                      })),
                  },
                });
                onClose();
              } catch (e) {
                console.error(e);
              }
            })}
            className={cn('space-y-6')}
          >
            <TaskFormBodyFields />
          </form>
        </FormProvider>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-background-paper shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="edit-task-form"
          isLoading={isSubmitting}
          size="sm"
          className="px-6"
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};
