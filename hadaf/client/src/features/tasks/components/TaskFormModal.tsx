import React, { useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Layers, CheckSquare, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useCreateTask } from '../hooks/useTasks';
import type { Task } from '../types';
import { cn } from '@/shared/utils/cn';
import { format, addMinutes, differenceInMinutes, parse, isValid } from 'date-fns';

// Sub-components
import { TaskHeader } from './form/TaskHeader';
import { TaskScheduling } from './form/TaskScheduling';
import { TaskPriority } from './form/TaskPriority';
import { TaskSubtasks } from './form/TaskSubtasks';
import { EditRegularTaskForm } from './form/EditRegularTaskForm';
import { EditBigTaskForm } from './form/EditBigTaskForm';

const createTaskSchema = z.object({
  name: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  day: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time required'),
  endTime: z.string().min(1, 'End time required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  type: z.enum(['regular', 'big_task']),
  subTasks: z.array(z.object({
    name: z.string().optional(), 
    isCompleted: z.boolean().default(false),
    timeEstimate: z.coerce.number().min(1).default(30)
  })).optional()
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  initialDate?: Date;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  task,
  initialDate
}) => {
  if (!isOpen) return null;

  // --- ROUTING LOGIC ---
  if (task) {
    if (task.type === 'big_task') {
        return (
            <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 animate-scale-in">
                    <EditBigTaskForm task={task} onClose={onClose} />
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800 animate-scale-in">
                <EditRegularTaskForm task={task} onClose={onClose} />
            </div>
        </div>
    );
  }

  return <CreateTaskForm onClose={onClose} initialDate={initialDate} />;
};

// --- Internal Component: Create Task Form ---
const CreateTaskForm = ({ onClose, initialDate }: { onClose: () => void, initialDate?: Date }) => {
    const createTask = useCreateTask();
    const now = new Date();
    const defaultStart = format(now, 'HH:00');
    const defaultEnd = format(addMinutes(now, 60), 'HH:00');

    const methods = useForm<CreateTaskFormValues>({
        resolver: zodResolver(createTaskSchema) as any,
        defaultValues: {
            name: '', description: '', day: initialDate ? format(initialDate, 'yyyy-MM-dd') : format(now, 'yyyy-MM-dd'),
            priority: 'medium', type: 'regular', startTime: defaultStart, endTime: defaultEnd, subTasks: []
        },
    });

    const { handleSubmit, setValue, watch, formState: { isSubmitting } } = methods;
    const taskType = watch('type');
    const startTime = watch('startTime');
    const subTasks = watch('subTasks');

    useEffect(() => {
        if (taskType === 'big_task' && subTasks) {
            const validSubTasks = subTasks.filter(st => st.name && st.name.trim().length > 0);
            const totalMinutes = validSubTasks.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);
            const durationToAdd = totalMinutes > 0 ? totalMinutes : 30; 
            if (startTime) {
                const startDate = parse(startTime, 'HH:mm', new Date());
                if (isValid(startDate)) {
                    const endDate = addMinutes(startDate, durationToAdd);
                    setValue('endTime', format(endDate, 'HH:mm'));
                }
            }
        }
    }, [taskType, subTasks, startTime, setValue]);

    const calculateDuration = (start: string, end: string) => {
        try {
            const s = parse(start, 'HH:mm', new Date());
            const e = parse(end, 'HH:mm', new Date());
            let diff = differenceInMinutes(e, s);
            if (diff < 0) diff += 1440;
            return diff;
        } catch { return 60; }
    };

    const onSubmit: SubmitHandler<CreateTaskFormValues> = async (data) => {
        try {
            const validSubTasks = data.subTasks?.filter(st => st.name && st.name.trim().length > 0)
                .map(st => ({ id: crypto.randomUUID(), isCompleted: false, name: st.name!, timeEstimate: st.timeEstimate || 30 }));
            
            await createTask.mutateAsync({
                ...data,
                expectedTime: calculateDuration(data.startTime, data.endTime),
                subTasks: validSubTasks
            });
            onClose();
        } catch (error) { console.error(error); }
    };

    return (
        <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
             <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles size={18} className="text-brand-500" /> New Task
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>

                <div className="overflow-y-auto px-6 py-6 scrollbar-hide flex-1">
                    <FormProvider {...methods}>
                        <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <TaskHeader />
                            <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
                                <button type="button" onClick={() => setValue('type', 'regular')} className={cn("flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200", taskType === 'regular' ? "bg-white dark:bg-gray-700 text-brand-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200")}><CheckSquare size={16} /> Regular Task</button>
                                <button type="button" onClick={() => setValue('type', 'big_task')} className={cn("flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg transition-all duration-200", taskType === 'big_task' ? "bg-white dark:bg-gray-700 text-purple-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200")}><Layers size={16} /> Big Task (Project)</button>
                            </div>

                            {taskType === 'big_task' && <div className="animate-slide-in-up"><TaskSubtasks /></div>}
                            
                            {/* ✅ FIXED: Removed duplicate grid & message */}
                            <TaskScheduling isAutoScheduled={taskType === 'big_task'} />
                            
                            <TaskPriority />
                        </form>
                    </FormProvider>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-800/30">
                    <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
                    <Button type="submit" form="create-task-form" isLoading={isSubmitting} size="sm" className="px-8 shadow-lg shadow-brand-500/20 rounded-xl">Create Task</Button>
                </div>
             </div>
        </div>
    );
};