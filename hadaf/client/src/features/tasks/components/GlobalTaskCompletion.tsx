// @ts-nocheck — TODO(E2): rewire to the real Hadaf Task schema. This file still uses Impulse's pre-migration task shape (name/startTime/endTime/subTasks/type/points). Full Express rewiring lands in the E2 work order.
import { useUIStore } from '@/shared/stores/useUIStore';
import { useUpdateTask } from '../hooks/useTasks';
import { TaskCompletionModal } from './TaskCompletionModal';

export const GlobalTaskCompletion = () => {
  const { taskToComplete, setTaskToComplete } = useUIStore();
  const updateTask = useUpdateTask();

  const handleClose = () => {
    setTaskToComplete(null);
  };

  // âœ… Updated handler
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