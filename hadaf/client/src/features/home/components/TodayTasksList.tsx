import { useTranslation } from '@/providers/useLocale';
import { TaskItem } from '@/features/tasks/components/TaskItem';
import { useUIStore } from '@/shared/stores/useUIStore';
import { Inbox, Plus } from 'lucide-react';
import type { Task } from '@/features/tasks/types';
import { sortTasks } from '@/features/tasks/utils/taskUtils';
import { cn } from '@/shared/utils/cn';

interface TodayTasksListProps {
  tasks: Task[];
  isLoading?: boolean;
}

/**
 * Home-screen section: today's tasks. Reuses `TaskItem` from
 * features/tasks/components/ rather than re-rendering — wrap-only, not
 * page-coupled, so we keep using the component directly. The list-item
 * contract here is identical to TasksPage, just inside a Card.
 */
export const TodayTasksList = ({ tasks, isLoading }: TodayTasksListProps) => {
  const { t } = useTranslation();
  const openTaskModal = useUIStore((state) => state.openTaskModal);

  const remaining = tasks.filter((tk) => tk.status === 'pending').length;
  const sorted = sortTasks(tasks);

  return (
    <section aria-labelledby="home-tasks-heading" className="flex-1 flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h2
          id="home-tasks-heading"
          className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {t('home.sections.tasks')}
        </h2>
        {remaining > 0 && !isLoading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {remaining === 1 ? t('home.tasks.remainingOne') : t('home.tasks.remaining', { count: remaining })}
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-3 flex-1">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
            <Inbox size={32} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {t('home.tasks.empty')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-xs mx-auto">
              {t('home.tasks.emptyHelper')}
            </p>
            <button
              type="button"
              onClick={() => openTaskModal()}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold min-h-[44px]',
                'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400',
                'transition-colors',
              )}
            >
              <Plus size={16} aria-hidden="true" />
              <span>{t('tasks.newTask')}</span>
            </button>
          </div>
      ) : remaining === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-emerald-700 dark:text-emerald-300 text-center font-medium bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg">
            {t('home.tasks.allDone')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.slice(0, 5).map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onCheck={() => openTaskModal()}
              onEdit={(t) => openTaskModal(t)}
            />
          ))}
          {sorted.length > 5 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-1">
              {t('home.tasks.remaining', { count: sorted.length - 5 })}
            </p>
          )}
        </div>
      )}
    </section>
  );
};