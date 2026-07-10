import React, { useState } from 'react';
import { Trash2, Edit2, Clock, Check, Zap, CalendarClock, ChevronDown, ChevronUp, Layers, CheckCircle2, CheckSquare } from 'lucide-react';
import { Task } from '../types';
import { useDeleteTask, useUpdateTask } from '../hooks/useTasks';
import { useUIStore } from '@/shared/stores/useUIStore';
import { cn } from '@/shared/utils/cn';
import { parse, format, isValid } from 'date-fns';

interface BigTaskViewProps {
  task: Task;
  onEdit?: (task: Task) => void;
  className?: string;
}

export const BigTaskView = React.memo(({ task, onEdit, className }: BigTaskViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const setTaskToComplete = useUIStore((state) => state.setTaskToComplete);

  const subTasks = task.subTasks || [];
  const completedCount = subTasks.filter(st => st.isCompleted).length;
  const totalCount = subTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isDone = task.done; 

  const handleSubtaskToggle = (subTaskId: string, currentStatus: boolean) => {
    if (isDone) return; 

    const updatedSubtasks = subTasks.map(st => 
      st.id === subTaskId ? { ...st, isCompleted: !currentStatus } : st
    );
    
    updateTask.mutate({ id: task.id, updates: { subTasks: updatedSubtasks } });

    const willBeAllCompleted = updatedSubtasks.every(st => st.isCompleted);
    if (willBeAllCompleted && !task.done) {
        setTaskToComplete({ ...task, subTasks: updatedSubtasks }); 
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = parse(timeStr, 'HH:mm', new Date());
    return isValid(date) ? format(date, 'h:mm a') : timeStr;
  };

  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'urgent': return 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-900/20 dark:border-red-900/30';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-100 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-900/30';
      case 'medium': return 'text-blue-700 bg-blue-50 border-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-900/30';
      case 'low': default: return 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-900/30';
    }
  };

  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl transition-all duration-300 border h-fit overflow-hidden pt-1.5", // Added pt-1.5 to show bar
      !isDone && "bg-white dark:bg-gray-900 border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800",
      isDone && "bg-gray-50 dark:bg-black/40 border-gray-200 dark:border-gray-800 opacity-75 grayscale-[0.5] cursor-default",
      className
    )}>
      
      {/* --- Progress Bar (Top of Card) --- */}
      {/* Always visible track */}
      <div className="absolute top-0 start-0 end-0 h-1.5 bg-gray-100 dark:bg-gray-800">
        <div 
          className={cn(
            "h-full transition-all duration-700 ease-out",
            isDone 
              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" // Green when done
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" // Purple gradient when active
          )}
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* --- 1. Header (Info & Toggle) --- */}
      <div className="p-4 pb-3 cursor-pointer select-none relative" onClick={() => !isDone && setIsOpen(!isOpen)}>
        <div className="flex items-start justify-between gap-3">
          
          <div className="flex items-start gap-3 overflow-hidden w-full">
            {/* Icon Box */}
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm border",
              isDone 
                ? "bg-emerald-100 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 text-indigo-600 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-800/50 dark:text-indigo-400"
            )}>
              {isDone ? <CheckCircle2 size={22} strokeWidth={2.5} /> : <Layers size={22} />}
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {/* Title & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={cn(
                  "text-base font-bold text-gray-900 dark:text-gray-100 truncate max-w-[300px]",
                  isDone && "line-through decoration-gray-400 text-gray-500"
                )}>
                  {task.name}
                </h3>
                
                {!isDone && (
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border border-indigo-200 text-indigo-700 bg-indigo-50/50 dark:border-indigo-800 dark:text-indigo-300">
                    Project
                  </span>
                )}

                <span className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border", getPriorityStyles())}>
                  {task.priority}
                </span>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium flex items-center gap-1">
                  <CheckSquare size={12} className="text-gray-400" />
                  {completedCount}/{totalCount} Steps
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className={cn("flex items-center gap-1 font-bold", isDone ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                   <Zap size={12} fill="currentColor" /> 
                   <span>{task.points} pts</span>
                   {isDone && <span className="text-[10px] font-normal text-gray-400">(Earned)</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Arrow (Hidden if Done) */}
          {!isDone && (
            <div className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          )}
        </div>
      </div>

      {/* --- 2. Time Block (Full Width Row) --- */}
      <div className={cn(
        "px-4 py-2.5 flex flex-wrap items-center gap-4 text-xs font-medium border-t",
        isDone 
          ? "bg-transparent border-gray-200 dark:border-gray-800 text-gray-400" 
          : "bg-gray-50/50 dark:bg-gray-800/30 border-indigo-50 dark:border-gray-800 text-gray-600 dark:text-gray-400"
      )}>
         <div className="flex items-center gap-1.5">
            <Clock size={14} className={isDone ? "text-gray-400" : "text-indigo-400"} />
            <span className="font-mono">
              {task.startTime ? formatTime(task.startTime) : '--:--'}
              <span className="mx-1 opacity-50">-</span>
              {task.endTime ? formatTime(task.endTime) : '--:--'}
            </span>
            <span className={cn(
              "px-1.5 py-0.5 rounded border text-[10px]",
              isDone ? "border-gray-200 bg-gray-100" : "border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700"
            )}>
              {task.expectedTime}m
            </span>
         </div>

         {/* Actual Time (Only showed if done) */}
         {isDone && task.actualStartTime && (
           <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 ms-auto sm:ms-0 font-semibold">
              <CalendarClock size={14} />
              <span className="font-mono">
                {formatTime(task.actualStartTime)}
                <span className="opacity-40 mx-1">-</span>
                {formatTime(task.actualEndTime)}
              </span>
              <span className="font-bold ms-1">
                ({task.actualTime}m)
              </span>
           </div>
         )}
      </div>

      {/* --- 3. Collapsible Subtasks (Only if NOT done) --- */}
      {!isDone && isOpen && (
        <div className="px-4 pb-4 pt-3 animate-fade-in bg-white dark:bg-gray-900/50">
          <div className="space-y-1.5">
            {subTasks.map((sub) => (
              <div 
                key={sub.id} 
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group/sub border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                onClick={(e) => { e.stopPropagation(); handleSubtaskToggle(sub.id, sub.isCompleted); }}
              >
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0",
                  sub.isCompleted 
                    ? "bg-indigo-500 border-indigo-500" 
                    : "border-gray-300 dark:border-gray-600 bg-transparent group-hover/sub:border-indigo-400"
                )}>
                  {sub.isCompleted && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                
                <span className={cn(
                  "text-sm font-medium transition-colors flex-1",
                  sub.isCompleted ? "text-gray-400 line-through decoration-gray-300" : "text-gray-700 dark:text-gray-200"
                )}>
                  {sub.name}
                </span>

                {sub.timeEstimate && (
                  <span className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded",
                    sub.isCompleted ? "text-gray-300 bg-transparent" : "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                  )}>
                    {sub.timeEstimate}m
                  </span>
                )}
              </div>
            ))}
            
            {subTasks.length === 0 && (
              <p className="text-xs text-center text-gray-400 italic py-2">No subtasks added.</p>
            )}
          </div>
        </div>
      )}

      {/* Actions (Floating) */}
      <div className="absolute top-3 end-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!isDone && onEdit && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors shadow-sm"
          >
            <Edit2 size={14} />
          </button>
        )}
        
        <button 
          onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id); }} 
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-md transition-colors shadow-sm"
        >
          <Trash2 size={14} />
        </button>
      </div>

    </div>
  );
});