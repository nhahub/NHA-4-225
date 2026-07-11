import React, { useEffect, useState } from 'react';
import { useForm, useWatch, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles, CheckSquare, Layers } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useCreateTask } from '../hooks/useTasks';
import type { Task } from '../types';
import { cn } from '@/shared/utils/cn';
import { format, addMinutes, parse, isValid } from 'date-fns';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './form/formValues';
import { TaskHeader } from './form/TaskHeader';
import { TaskScheduling } from './form/TaskScheduling';
import {
  TaskPriorityPicker,
  TaskDifficultyPicker,
} from './form/TaskPriority';
import { TaskChecklist } from './form/TaskSubtasks';
import { rescheduleTask } from '../api/taskApi';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  priority: z.enum(['high', 'medium', 'low']),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeBlockStart: z.string().optional().or(z.literal('')),
  timeBlockEnd: z.string().optional().or(z.literal('')),
  plannedDurationMinutes: z
    .union([z.number().int().nonnegative(), z.nan(), z.undefined()])
    .optional()
    .transform((v) => (typeof v === 'number' && !isNaN(v) ? v : undefined)),
  checklist: z
    .array(
      z.object({
        title: z.string().min(1),
        is_completed: z.boolean().optional(),
      }),
    )
    .optional(),
});

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialDate?: Date;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  task,
  initialDate,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-background-paper rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-gray-100 dark:border-gray-800">
        <CreateTaskForm
          onClose={onClose}
          initialDate={initialDate}
          editTask={task ?? null}
        />
      </div>
    </div>
  );
};

const CreateTaskForm: React.FC<{
  onClose: () => void;
  initialDate?: Date;
  editTask: Task | null;
}> = ({ onClose, initialDate, editTask }) => {
  const { t } = useTranslation();
  const createTask = useCreateTask();
  const today = new Date();
  const defaultDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(today, 'yyyy-MM-dd');

  const methods = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      title: editTask?.title ?? '',
      description: editTask?.description ?? '',
      date: editTask?.date ?? defaultDate,
      priority: editTask?.priority ?? 'medium',
      difficulty: editTask?.difficulty ?? 'medium',
      timeBlockStart: editTask?.timeBlockStart ?? '',
      timeBlockEnd: editTask?.timeBlockEnd ?? '',
      plannedDurationMinutes: editTask?.plannedDurationMinutes ?? undefined,
      checklist:
        editTask?.checklist?.map((c) => ({ title: c.title, is_completed: c.is_completed })) ??
        [],
    },
  });

  const { handleSubmit, setValue, getValues, formState: { isSubmitting } } = methods;
  const isEdit = !!editTask;
  const hadChecklist = (editTask?.checklist?.length ?? 0) > 0;

  // Regular vs. Big Task is a client-only distinction — the backend has no
  // such field. "Big task" just means: show the subtasks panel, and derive
  // the time-block end from the sum of subtask durations instead of letting
  // the user set it directly.
  const [isProject, setIsProject] = useState(hadChecklist);

  const checklist = useWatch({ control: methods.control, name: 'checklist' });
  const startTime = useWatch({ control: methods.control, name: 'timeBlockStart' });

  useEffect(() => {
    if (!isProject) return;
    const validItems = (checklist ?? []).filter(
      (c) => c?.title && c.title.trim().length > 0,
    );
    const totalMinutes = validItems.reduce((acc, c) => acc + (c.durationMinutes || 0), 0);
    const durationToAdd = totalMinutes > 0 ? totalMinutes : 30;
    if (startTime) {
      const startDate = parse(startTime, 'HH:mm', new Date());
      if (isValid(startDate)) {
        setValue('timeBlockEnd', format(addMinutes(startDate, durationToAdd), 'HH:mm'));
      }
    }
  }, [isProject, checklist, startTime, setValue]);

  const handleSelectRegular = () => {
    setIsProject(false);
    setValue('checklist', []);
  };

  const handleSelectProject = () => {
    setIsProject(true);
    if (!getValues('timeBlockStart')) {
      const now = new Date();
      setValue('timeBlockStart', format(now, 'HH:00'));
      setValue('timeBlockEnd', format(addMinutes(now, 30), 'HH:00'));
    }
  };

  const onSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    try {
      const checklistClean = (data.checklist ?? [])
        .filter((c) => c.title.trim().length > 0)
        .map((c) => ({ title: c.title.trim(), is_completed: c.is_completed ?? false }));

      if (isEdit && editTask) {
        if (editTask.date !== data.date) {
          await rescheduleTask(editTask._id, {
            date: data.date,
            timeBlockStart: data.timeBlockStart || undefined,
            timeBlockEnd: data.timeBlockEnd || undefined,
          });
        }
        // Edit of title/description/priority/difficulty/checklist via a generic
        // PATCH endpoint is not implemented in the backend yet — see work order
        // hand-off notes for the gap. For now we close the modal after the
        // reschedule call only.
        onClose();
        return;
      }

      await createTask.mutateAsync({
        title: data.title,
        description: data.description,
        date: data.date,
        priority: data.priority,
        difficulty: data.difficulty,
        timeBlockStart: data.timeBlockStart || undefined,
        timeBlockEnd: data.timeBlockEnd || undefined,
        plannedDurationMinutes: data.plannedDurationMinutes,
        checklist: checklistClean.length > 0 ? checklistClean : undefined,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={18} className="text-brand-500" />
          {isEdit ? t('tasks.editTask') : t('tasks.newTask')}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"
          aria-label={t('common.cancel')}
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto px-6 py-6 scrollbar-hide flex-1">
        <FormProvider {...methods}>
          <form
            id="task-form"
            onSubmit={handleSubmit(onSubmit)}
            className={cn('space-y-6')}
          >
            <TaskHeader />

            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
              <button
                type="button"
                onClick={handleSelectRegular}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200',
                  !isProject
                    ? 'bg-white dark:bg-gray-700 text-brand-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                )}
              >
                <CheckSquare size={16} /> {t('tasks.regularTask')}
              </button>
              <button
                type="button"
                onClick={handleSelectProject}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200',
                  isProject
                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                )}
              >
                <Layers size={16} /> {t('tasks.bigTask')}
              </button>
            </div>

            {isProject && <div className="animate-slide-in-up"><TaskChecklist /></div>}

            <TaskScheduling isAutoScheduled={isProject} />
            <TaskPriorityPicker />
            <TaskDifficultyPicker />

            {isEdit && hadChecklist && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 italic">
                {t('tasks.checklistEditHint')}
              </p>
            )}
          </form>
        </FormProvider>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
        <Button variant="ghost" onClick={onClose} size="sm">
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="task-form"
          isLoading={isSubmitting}
          size="sm"
          className="px-8 shadow-lg shadow-brand-500/20 rounded-xl"
        >
          {isEdit ? t('common.save') : t('tasks.create')}
        </Button>
      </div>
    </>
  );
};
