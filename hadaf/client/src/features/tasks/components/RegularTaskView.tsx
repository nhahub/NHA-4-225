import React from 'react';
import { Trash2, Edit2, Clock, Check, Zap, CalendarClock } from 'lucide-react';
import { Task } from '../types';
import { useToggleTaskDone, useDeleteTask } from '../hooks/useTasks';
import { useUIStore } from '@/shared/stores/useUIStore';
import { cn } from '@/shared/utils/cn';
import { parse, format, isValid } from 'date-fns';

interface RegularTaskViewProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

export const RegularTaskView = React.memo(({ task, onEdit, className }: RegularTaskViewProps) => {
  const toggleDone = useToggleTaskDone();
  const deleteTask = useDeleteTask();
  const setTaskToComplete = useUIStore((state) => state.setTaskToComplete);

  const handleCheckClick = () => {
    if (!task.done) {
      setTaskToComplete(task);
    } else {
      toggleDone.mutate({ id: task.id, done: false });
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = parse(timeStr, 'HH:mm', new Date());
    return isValid(date) ? format(date, 'h:mm a') : timeStr;
  };

  const getPriorityStyles = () => {
    if (task.done) return { border: 'border-s-gray-300', bg: 'bg-gray-50', badge: 'text-gray-500 bg-gray-200 border-transparent' };
    switch (task.priority) {
      case 'urgent': return { border: 'border-s-red-500', bg: 'bg-white', badge: 'text-red-700 bg-red-50 border-red-100' }; 
      case 'high': return { border: 'border-s-orange-500', bg: 'bg-white', badge: 'text-orange-700 bg-orange-50 border-orange-100' };
      case 'medium': return { border: 'border-s-blue-500', bg: 'bg-white', badge: 'text-blue-700 bg-blue-50 border-blue-100' };
      case 'low': default: return { border: 'border-s-emerald-500', bg: 'bg-white', badge: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
    }
  };

  const styles = getPriorityStyles();

  return (
    <div className={cn(
      "group relative p-4 rounded-xl transition-all duration-200 ease-out h-full flex flex-col shadow-sm hover:shadow-md",
      "border border-gray-200 dark:border-gray-800",
      "border-s-[4px]", 
      styles.border,
      styles.bg,
      "dark:bg-background-paper-dark dark:hover:bg-gray-800/60",
      task.done && "opacity-75 grayscale-[0.1]",
      className
    )}>
      
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleCheckClick}
          className={cn(
            "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 shrink-0",
            task.done ? "bg-brand-600 border-brand-600" : "border-gray-300 bg-white hover:border-brand-500 dark:border-gray-600 dark:bg-transparent"
          )}
        >
          {task.done && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 pe-12 leading-none">
            <h3 className={cn("text-base font-bold text-gray-900 dark:text-gray-100 truncate max-w-full", task.done && "text-gray-500 line-through decoration-gray-300")}>
              {task.name}
            </h3>
            <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border", styles.badge, "dark:bg-transparent dark:border-opacity-30")}>
              {task.priority}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 ms-auto sm:ms-0">
              <Zap size={14} fill="currentColor" />
              <span className="text-sm">{task.points}</span>
              <span className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">
                {task.done ? 'pts (Actual)' : 'pts'}
              </span>
            </div>
          </div>

          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 leading-snug font-medium">{task.description}</p>}

          {/* Footer: Time Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-xs font-medium text-gray-400 dark:text-gray-500">
             <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span className="font-mono text-gray-600 dark:text-gray-300 text-xs">
                  {task.startTime ? formatTime(task.startTime) : '--:--'}
                  <span className="text-gray-300 mx-1">-</span>
                  {task.endTime ? formatTime(task.endTime) : '--:--'}
                </span>
                <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400 font-bold text-[10px]">
                  {task.expectedTime}m
                </span>
             </div>

             {task.done && task.actualStartTime && (
               <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 px-2 py-0.5 rounded-md border border-brand-100 dark:border-brand-900/30">
                  <CalendarClock size={14} />
                  <span className="font-mono font-semibold">
                    {formatTime(task.actualStartTime)}
                    <span className="opacity-40 mx-1">-</span>
                    {formatTime(task.actualEndTime)}
                  </span>
                  <span className="font-bold ms-1">({task.actualTime}m)</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute top-3 end-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-1">
        {onEdit && <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors"><Edit2 size={15} /></button>}
        <button onClick={() => deleteTask.mutate(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"><Trash2 size={15} /></button>
      </div>
    </div>
  );
});