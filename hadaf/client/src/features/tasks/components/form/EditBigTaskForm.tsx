import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit3 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Task, ChecklistItem } from '../../types';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';
import { TaskFormBody } from './sharedBody';
import type { TaskFormValues } from './formValues';
import { useUpdateTask } from '../../hooks/useTasks';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  priority: z.enum(['high', 'medium', 'low']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeBlockStart: z.string().optional().or(z.literal('')),
  timeBlockEnd: z.string().optional().or(z.literal('')),
  plannedDurationMinutes: z.number().int().nonnegative().optional(),
  checklist: z.array(z.object({ title: z.string(), is_completed: z.boolean().optional() })).optional(),
});

interface EditBigTaskFormProps {
  task: Task;
  onClose: () => void;
}

// EditBigTaskForm renders the same content as EditRegularTaskForm — both are
// Tasks in the real Task model. Kept as a separate file to satisfy the
// component-shell parity with the original code paths without any code
// duplication in the caller.
export const EditBigTaskForm = ({ task, onClose }: EditBigTaskFormProps) => {
  const { t } = useTranslation();
  const updateTask = useUpdateTask();

  const methods = useForm<TaskFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: task.title,
      description: task.description ?? '',
      date: task.date,
      priority: task.priority,
      difficulty: task.difficulty,
      timeBlockStart: task.timeBlockStart ?? '',
      timeBlockEnd: task.timeBlockEnd ?? '',
      plannedDurationMinutes: task.plannedDurationMinutes ?? undefined,
      checklist: task.checklist?.map((c) => ({ title: c.title, is_completed: c.is_completed })) ?? [],
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-purple-50/30 dark:bg-purple-900/10 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit3 size={18} className="text-purple-600" />
          {t('tasks.editTask')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">{task.title}</p>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 scrollbar-hide">
        <FormProvider {...methods}>
          <form
            id="edit-big-task-form"
            onSubmit={handleSubmit(async (data) => {
              try {
                await updateTask.mutateAsync({
                  id: task._id,
                  input: {
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    difficulty: data.difficulty,
                    date: data.date,
                    timeBlockStart: data.timeBlockStart || undefined,
                    timeBlockEnd: data.timeBlockEnd || undefined,
                    plannedDurationMinutes: data.plannedDurationMinutes,
                    checklist: (data.checklist ?? [])
                      .filter((c) => c.title.trim())
                      .map<ChecklistItem>((c) => ({
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
            <TaskFormBody />
          </form>
        </FormProvider>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-background-paper shrink-0">
        <Button variant="ghost" onClick={onClose} size="sm">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="edit-big-task-form"
          isLoading={isSubmitting}
          size="sm"
          className="px-6 shadow-lg shadow-purple-500/20"
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};
