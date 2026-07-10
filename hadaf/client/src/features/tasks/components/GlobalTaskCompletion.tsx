import { useUIStore } from '@/shared/stores/useUIStore';
import { useUpdateTask } from '../hooks/useTasks';
import { TaskCompletionModal } from './TaskCompletionModal';

export const GlobalTaskCompletion = () => {
  const { taskToComplete, setTaskToComplete } = useUIStore();
  const updateTask = useUpdateTask();

  const handleClose = () => {
    setTaskToComplete(null);
  };

  // ✅ Updated handler
  const handleConfirm = (actualTime: number, points: number, start: string, end: string) => {
    if (taskToComplete) {
      updateTask.mutate({
        id: taskToComplete.id,
        updates: {
          done: true,
          actualTime: actualTime,
          actualStartTime: start,
          actualEndTime: end,
          points: points,
          completedAt: Date.now(),
        },
      });
    }
    handleClose();
  };

  if (!taskToComplete) return null;

  return (
    <TaskCompletionModal
      isOpen={!!taskToComplete}
      onClose={handleClose}
      onConfirm={handleConfirm}
      task={taskToComplete}
    />
  );
};