// import { useQuery } from '@tanstack/react-query'; // ❌ احذف هذا السطر أو لا تستخدمه
import { CalendarDays, Inbox, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
// import { getTasks } from '../api/taskApi'; // ❌ غير مطلوب لأن الهوك يستخدمه داخلياً
// import { QUERY_KEYS } from '@/shared/constants/queryKeys'; // ❌ غير مطلوب هنا
import { TaskItem } from '../components/TaskItem';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useUIStore } from '@/shared/stores/useUIStore';
import { isSameDay, isValid } from 'date-fns';
import { sortTasks } from '../utils/taskUtils';
import { useTasks } from '../hooks/useTasks'; // ✅ تأكد من استيراد الهوك

export const TasksPage = () => {
  const { selectedDate } = useDateStore();
  const { searchQuery, openTaskModal } = useUIStore();

  // 👇 التعديل هنا: استخدام الهوك بدلاً من useQuery المباشر
  // الهوك يضع التاريخ في الـ queryKey تلقائياً، فأي تغيير في التاريخ سيعيد الجلب
  const { data: tasks = [], isLoading, isError } = useTasks(selectedDate);

  // ... باقي الكود كما هو تماماً ...
  const filteredTasks = tasks.filter(task => {
    try {
      if (!task.day) return false;
      const taskDate = new Date(task.day);
      if (!isValid(taskDate)) return false;
      
      // ملاحظة: الفلترة هنا بالتاريخ قد تكون زائدة لأن الباك إند يفلتر بالفعل
      // لكن لا ضرر من وجودها كضمان إضافي
      const matchesDate = isSameDay(taskDate, selectedDate);
      
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return task.name.toLowerCase().includes(query) || 
               (task.description && task.description.toLowerCase().includes(query));
      }
      return matchesDate;
    } catch {
      return false;
    }
  });

  const sortedTasks = sortTasks(filteredTasks);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error loading tasks</h3>
        <p className="text-gray-500">Please try refreshing the page.</p>
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
              {searchQuery ? "No tasks found" : "No tasks for today"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6 text-sm">
              {searchQuery 
                ? `We couldn't find any tasks matching "${searchQuery}"`
                : "Your schedule is clear. Enjoy your free time or add a new task to stay productive."}
            </p>
            {!searchQuery && (
              <Button variant="secondary" onClick={() => openTaskModal()}>
                Create First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start pb-20">
            {sortedTasks.map((task) => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onEdit={(t) => openTaskModal(t)}
                // @ts-ignore
                className={task.type === 'big_task' ? 'col-span-1 md:col-span-2' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};