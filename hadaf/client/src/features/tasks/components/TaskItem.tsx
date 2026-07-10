import { Draggable } from '@hello-pangea/dnd';
import { CheckCircle2, Circle, Clock, Flame } from 'lucide-react'; // ✅ تأكد من هذا السطر
import { Task } from '../types';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  index: number;
}

export const TaskItem = ({ task, index }: TaskItemProps) => {
  
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'URGENT': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
            "bg-white dark:bg-background-paper-dark hover:shadow-md",
            snapshot.isDragging ? "shadow-xl scale-[1.02] border-brand-500 ring-1 ring-brand-500" : "border-gray-200 dark:border-gray-800",
            task.done && "opacity-60 bg-gray-50 dark:bg-gray-900/50"
          )}
        >
          {/* Status Checkbox */}
          <button className={cn(
            "flex-shrink-0 transition-colors duration-200",
            task.done ? "text-emerald-500" : "text-gray-300 hover:text-emerald-400"
          )}>
            {task.done ? <CheckCircle2 size={24} className="fill-emerald-50" /> : <Circle size={24} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-1">
               <h4 className={cn(
                 "font-semibold text-gray-900 dark:text-white truncate",
                 task.done && "line-through text-gray-500"
               )}>
                 {task.name}
               </h4>
               
               <span className={cn(
                 "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border flex items-center gap-1",
                 getPriorityColor(task.priority)
               )}>
                 {task.priority === 'URGENT' && <Flame size={10} />}
                 {task.priority}
               </span>
             </div>
             
             <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {task.startTime && (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {format(task.startTime, 'h:mm a')} 
                      {task.endTime && ` - ${format(task.endTime, 'h:mm a')}`}
                    </span>
                  </div>
                )}
                
                {task.actualStartTime && (
                   <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
                     Started: {format(task.actualStartTime, 'h:mm a')}
                   </span>
                )}

                <div className="ms-auto font-mono font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded-md">
                  +{task.points} pts
                </div>
             </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};