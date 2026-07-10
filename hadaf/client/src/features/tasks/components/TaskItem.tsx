import { CheckCircle2, Circle, Clock, Zap } from 'lucide-react';
import { Task, TaskPriority } from '../types';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';

interface TaskItemProps {
  task: Task;
  onCheck?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  className?: string;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  medium: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
  low: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
};

export const TaskItem = ({ task, onCheck, onEdit, className }: TaskItemProps) => {
  const { t } = useTranslation();
  const isDone = task.status === 'completed';

  const formatTime = (hhmm?: string) => {
    if (!hhmm) return '';
    const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return hhmm;
    const h = Number(m[1]);
    const min = m[2];
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${min} ${period}`;
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
        'bg-white dark:bg-background-paper hover:shadow-md border-gray-200 dark:border-gray-800',
        isDone && 'opacity-60 bg-gray-50 dark:bg-gray-900/50',
        className,
      )}
    >
      <button
        onClick={() => onCheck?.(task)}
        className={cn(
          'flex-shrink-0 transition-colors duration-200',
          isDone
            ? 'text-emerald-500'
            : 'text-gray-300 hover:text-emerald-400 dark:text-gray-600 dark:hover:text-emerald-400',
        )}
        aria-label={isDone ? t('tasks.markPending') : t('tasks.markComplete')}
      >
        {isDone ? (
          <CheckCircle2 size={24} className="fill-emerald-50" />
        ) : (
          <Circle size={24} />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={cn(
              'font-semibold text-gray-900 dark:text-white truncate',
              isDone && 'line-through text-gray-500',
            )}
          >
            {task.title}
          </h4>

          <span
            className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border flex items-center gap-1',
              priorityStyles[task.priority],
            )}
          >
            {task.priority}
          </span>

          {task.type === 'scheduled' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800">
              {t('tasks.scheduled')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          {task.timeBlockStart && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>
                {formatTime(task.timeBlockStart)}
                {task.timeBlockEnd && ` - ${formatTime(task.timeBlockEnd)}`}
              </span>
            </div>
          )}

          <div className="ms-auto font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap size={10} fill="currentColor" />
            +{task.pointsEarned} {t('tasks.pts')}
          </div>
        </div>
      </div>

      {onEdit && !isDone && (
        <button
          onClick={() => onEdit(task)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-brand-600 hover:text-brand-700 font-semibold"
        >
          {t('common.edit')}
        </button>
      )}
    </div>
  );
};
