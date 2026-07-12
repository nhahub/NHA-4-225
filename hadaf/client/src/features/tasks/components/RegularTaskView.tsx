import { Trash2, Edit2, Clock, Check, Zap, CalendarClock } from 'lucide-react';
import { useState } from 'react';
import { Task, TaskPriority } from '../types';
import { useDeleteTask } from '../hooks/useTasks';
import { useUIStore } from '@/shared/stores/useUIStore';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { cn } from '@/shared/utils/cn';
import { formatTime } from '../utils/taskUtils';
import { useTranslation } from '@/providers/useLocale';

interface RegularTaskViewProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

const priorityAccent: Record<TaskPriority, string> = {
  urgent: 'border-s-red-600',
  high: 'border-s-orange-500',
  medium: 'border-s-blue-500',
  low: 'border-s-emerald-500',
};

const priorityBadgeLight: Record<TaskPriority, string> = {
  urgent: 'text-red-700 bg-red-50 border-red-100',
  high: 'text-orange-700 bg-orange-50 border-orange-100',
  medium: 'text-blue-700 bg-blue-50 border-blue-100',
  low: 'text-emerald-700 bg-emerald-50 border-emerald-100',
};



export const RegularTaskView = ({ task, onEdit, className }: RegularTaskViewProps) => {
  const { t } = useTranslation();
  const deleteTask = useDeleteTask();
  const setTaskToComplete = useUIStore((state) => state.setTaskToComplete);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isDone = task.status === 'completed';

  const handleCheckClick = () => {
    if (!isDone) {
      setTaskToComplete(task);
    } else {
      // to un-complete a task, the server has no "uncomplete" endpoint —
      // call complete with no actualDurationMinutes for re-toggle is risky.
      // Best UX: simply reload via cache invalidation. For now we no-op
      // and rely on edit flow.
    }
  };

  return (
    <div
      className={cn(
        'group relative p-4 rounded-xl transition-all duration-200 ease-out h-full flex flex-col shadow-sm hover:shadow-md',
        'border border-gray-200 dark:border-gray-800',
        'border-s-[4px]',
        isDone ? 'border-s-gray-300' : priorityAccent[task.priority],
        'bg-white dark:bg-background-paper',
        isDone && 'opacity-75 grayscale-[0.1]',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleCheckClick}
          className={cn(
            'mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shrink-0',
            isDone
              ? 'bg-brand-600 border-brand-600'
              : 'border-gray-300 bg-white hover:border-brand-500 dark:border-gray-600 dark:bg-transparent',
          )}
          aria-label={isDone ? t('tasks.markPending') : t('tasks.markComplete')}
        >
          {isDone && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        <div 
          onClick={() => onEdit?.(task)}
          className="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer text-left group/body"
        >
          <div className="flex flex-wrap items-center gap-2 pe-12 leading-none">
            <h3
              className={cn(
                'text-base font-bold text-gray-900 dark:text-gray-100 truncate max-w-full group-hover/body:text-brand-600 transition-colors',
                isDone && 'text-gray-500 line-through decoration-gray-300',
              )}
            >
              {task.title}
            </h3>
            <span
              className={cn(
                'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border',
                priorityBadgeLight[task.priority],
                'dark:bg-transparent dark:border-opacity-30',
              )}
            >
              {task.priority}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 ms-auto sm:ms-0">
              <Zap size={14} fill="currentColor" />
              <span className="text-sm">{task.pointsEarned}</span>
              <span className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">
                {t('tasks.pts')}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 leading-snug font-medium">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span className="font-mono text-gray-600 dark:text-gray-300 text-xs">
                {formatTime(task.timeBlockStart)}
                <span className="text-gray-300 mx-1">-</span>
                {formatTime(task.timeBlockEnd)}
              </span>
              {task.plannedDurationMinutes !== undefined && (
                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-bold text-[10px]">
                  {task.plannedDurationMinutes}m
                </span>
              )}
            </div>

            {isDone && task.completedAt && task.actualDurationMinutes !== undefined && (
              <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 px-2 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/30">
                <CalendarClock size={14} />
                <span className="font-bold ms-1">({task.actualDurationMinutes}m)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-3 end-3 flex gap-1 opacity-100 transition-opacity duration-200 bg-transparent p-1">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors"
          >
            <Edit2 size={15} />
          </button>
        )}
        <button
          onClick={() => setConfirmDelete(true)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        variant="danger"
        title={t('pol.taskDelete.title')}
        body={t('pol.taskDelete.body')}
        cancelLabel={t('pol.confirm.cancel')}
        confirmLabel={t('pol.taskDelete.confirm')}
        isPending={deleteTask.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteTask.mutate(task._id);
          setConfirmDelete(false);
        }}
      />
    </div>
  );
};
