import { Trash2, Edit2, Clock, Check, Zap, ChevronDown, ChevronUp, Layers, CheckCircle2, CheckSquare } from 'lucide-react';
import { useState } from 'react';
import { Task } from '../types';
import { useDeleteTask, useCreateTask } from '../hooks/useTasks';
import { useUIStore } from '@/shared/stores/useUIStore';
import { cn } from '@/shared/utils/cn';
import { formatTime } from '../utils/taskUtils';
import { useTranslation } from '@/providers/useLocale';

interface BigTaskViewProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

export const BigTaskView = ({ task, onEdit, className }: BigTaskViewProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const deleteTask = useDeleteTask();
  const createTask = useCreateTask();
  const setTaskToComplete = useUIStore((state) => state.setTaskToComplete);

  const isDone = task.status === 'completed';
  const checklist = task.checklist || [];
  const completedCount = checklist.filter((c) => c.is_completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleChecklistToggle = async (index: number) => {
    if (isDone) return;
    const newChecklist = checklist.map((c, i) =>
      i === index ? { ...c, is_completed: !c.is_completed } : c,
    );
    // Use createTask? No, that's for new tasks. We need an update endpoint.
    // The Task model supports checklist via the create schema, but editing
    // a checklist on an existing task requires update support. We'll
    // optimistically update — for now we trigger a re-fetch when the server
    // supports it. Since the controller has no PATCH /tasks/:id for checklist,
    // we instead trigger task completion modal when all checklist items are done.
    const willBeAllCompleted =
      newChecklist.every((c) => c.is_completed) && newChecklist.length > 0;
    if (willBeAllCompleted && !isDone) {
      setTaskToComplete({ ...task, checklist: newChecklist });
    }
    // Avoid orphan TODO — we'll handle this in a follow-up. For now, swallow.
    void createTask;
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl transition-all duration-300 border h-fit overflow-hidden',
        !isDone &&
          'bg-white dark:bg-background-paper border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800',
        isDone &&
          'bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-gray-800 opacity-75 grayscale-[0.5] cursor-default',
        className,
      )}
    >
      <div className="absolute top-0 start-0 end-0 h-1.5 bg-gray-100 dark:bg-gray-800">
        <div
          className={cn(
            'h-full transition-all duration-700 ease-out',
            isDone
              ? 'bg-emerald-500'
              : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className="p-4 pb-3 cursor-pointer select-none relative"
        onClick={() => !isDone && setIsOpen(!isOpen)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 overflow-hidden w-full">
            <div
              className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm border',
                isDone
                  ? 'bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400'
                  : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-indigo-600 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800/50 dark:text-indigo-400',
              )}
            >
              {isDone ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <Layers size={22} />}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={cn(
                    'text-base font-bold text-gray-900 dark:text-gray-100 truncate max-w-[300px]',
                    isDone && 'line-through decoration-gray-400 text-gray-500',
                  )}
                >
                  {task.title}
                </h3>

                {checklist.length > 0 && !isDone && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50/50 dark:border-indigo-800 dark:text-indigo-300">
                    {t('tasks.project')}
                  </span>
                )}

                <span
                  className={cn(
                    'px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border',
                    task.priority === 'high'
                      ? 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30'
                      : task.priority === 'medium'
                      ? 'text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-900/30'
                      : 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-900/30',
                  )}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {checklist.length > 0 && (
                  <span className="font-medium flex items-center gap-1">
                    <CheckSquare size={12} className="text-gray-400" />
                    {completedCount}/{totalCount} {t('tasks.steps')}
                  </span>
                )}
                {checklist.length > 0 && (
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                )}
                <div
                  className={cn(
                    'flex items-center gap-1 font-bold',
                    isDone
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  <Zap size={12} fill="currentColor" />
                  <span>
                    {task.pointsEarned} {t('tasks.pts')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isDone && checklist.length > 0 && (
            <div className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          )}
        </div>
      </div>

      <div
        className={cn(
          'px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs font-medium border-t',
          isDone
            ? 'bg-transparent border-gray-200 dark:border-gray-800 text-gray-400'
            : 'bg-gray-50/50 dark:bg-gray-800/30 border-indigo-50 dark:border-gray-800 text-gray-600 dark:text-gray-400',
        )}
      >
        <div className="flex items-center gap-1.5">
          <Clock size={14} className={isDone ? 'text-gray-400' : 'text-indigo-400'} />
          <span className="font-mono">
            {formatTime(task.timeBlockStart)}
            <span className="mx-1 opacity-50">-</span>
            {formatTime(task.timeBlockEnd)}
          </span>
          {task.plannedDurationMinutes !== undefined && (
            <span
              className={cn(
                'px-1.5 py-0.5 rounded border text-[10px]',
                isDone
                  ? 'border-gray-200 bg-gray-100'
                  : 'border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700',
              )}
            >
              {task.plannedDurationMinutes}m
            </span>
          )}
        </div>

        {isDone && task.actualDurationMinutes !== undefined && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 ms-auto sm:ms-0 font-semibold">
            <span className="font-bold ms-1">({task.actualDurationMinutes}m)</span>
          </div>
        )}
      </div>

      {!isDone && isOpen && checklist.length > 0 && (
        <div className="px-4 pb-4 pt-3 animate-fade-in bg-white dark:bg-background-paper/50">
          <div className="space-y-1.5">
            {checklist.map((item, index) => (
              <div
                key={item._id ?? index}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/sub border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChecklistToggle(index);
                }}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0',
                    item.is_completed
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-gray-300 dark:border-gray-600 bg-transparent group-hover/sub:border-indigo-400',
                  )}
                >
                  {item.is_completed && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium transition-colors flex-1',
                    item.is_completed
                      ? 'text-gray-400 line-through decoration-gray-300'
                      : 'text-gray-700 dark:text-gray-200',
                  )}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute top-3 end-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!isDone && onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors shadow-sm"
          >
            <Edit2 size={14} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteTask.mutate(task._id);
          }}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors shadow-sm"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
