import { CalendarDays, Inbox, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { EmptyState } from '@/shared/components/EmptyState';
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
      <EmptyState
        icon={<AlertCircle size={28} strokeWidth={1.75} className="text-red-500" />}
        title={t('tasks.errors.loadFailed')}
        body={t('common.retry')}
      />
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
          <EmptyState
            icon={
              searchQuery ? (
                <Inbox size={28} strokeWidth={1.75} />
              ) : (
                <CalendarDays size={28} strokeWidth={1.75} />
              )
            }
            title={
              searchQuery
                ? t('tasks.noTasksFound')
                : t('pol.empty.tasksTitle')
            }
            body={
              searchQuery
                ? t('tasks.noTasksForQuery', { q: searchQuery })
                : t('pol.empty.tasksBody')
            }
            cta={
              !searchQuery ? (
                <Button variant="secondary" onClick={() => openTaskModal()}>
                  {t('tasks.createFirstTask')}
                </Button>
              ) : undefined
            }
          />
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
