import { CalendarDays, Inbox, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { TaskItem } from '../components/TaskItem';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useUIStore } from '@/shared/stores/useUIStore';
import { useTranslation } from '@/providers/useLocale';
import { format } from 'date-fns';
import { sortTasks } from '../utils/taskUtils';
import { useTasksByDate } from '../hooks/useTasks';

export const TasksPage = () => {
  const { t } = useTranslation();
  const { selectedDate } = useDateStore();
  const { searchQuery, openTaskModal } = useUIStore();

  const { data: tasks = [], isLoading, isError } = useTasksByDate(selectedDate);
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const filtered = tasks.filter((task) => {
    if (!task.title) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }
    return task.date === dateStr;
  });

  const sortedTasks = sortTasks(filtered);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('tasks.errors.loadFailed')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{t('common.retry')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              {searchQuery ? (
                <Inbox size={32} className="text-gray-300" />
              ) : (
                <CalendarDays size={32} className="text-brand-200 dark:text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {searchQuery ? t('tasks.noTasksFound') : t('tasks.noTasksToday')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 text-sm">
              {searchQuery
                ? t('tasks.noTasksForQuery', { q: searchQuery })
                : t('tasks.emptySchedule')}
            </p>
            {!searchQuery && (
              <Button variant="secondary" onClick={() => openTaskModal()}>
                {t('tasks.createFirstTask')}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 items-start pb-20">
            {sortedTasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onCheck={() => openTaskModal()}
                onEdit={(t) => openTaskModal(t)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
