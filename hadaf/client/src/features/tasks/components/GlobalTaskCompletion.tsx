import { useUIStore } from '@/shared/stores/useUIStore';
import { TaskCompletionModal } from './TaskCompletionModal';

export const GlobalTaskCompletion = () => {
  const { taskToComplete, setTaskToComplete } = useUIStore();

  const handleClose = () => {
    setTaskToComplete(null);
  };

  if (!taskToComplete) return null;

  return (
    <TaskCompletionModal
      isOpen={!!taskToComplete}
      onClose={handleClose}
      task={taskToComplete}
    />
  );
};
