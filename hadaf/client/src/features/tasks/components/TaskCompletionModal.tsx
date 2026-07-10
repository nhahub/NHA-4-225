import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Task } from '../types';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';
import { calculateTaskPointsPreview } from '../utils/scoringUtils';
import { format, differenceInMinutes, parse } from 'date-fns';
import { useUIStore } from '@/shared/stores/useUIStore';
import { useCompleteTask } from '../hooks/useTasks';
import { VictoryOverlay } from './completion/VictoryOverlay';
import { CompletionHeader } from './completion/CompletionHeader';
import { TimeEntry } from './completion/TimeEntry';
import { ScoreBreakdown } from './completion/ScoreBreakdown';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { t } = useTranslation();
  const setTaskToComplete = useUIStore((s) => s.setTaskToComplete);
  const completeTask = useCompleteTask();

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [actualMinutes, setActualMinutes] = useState<number | undefined>(undefined);
  const [showVictory, setShowVictory] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(0);

  const hasPlannedTime =
    task.type !== 'quick' && task.plannedDurationMinutes !== undefined;

  // Initialize time fields
  useEffect(() => {
    if (!isOpen) return;
    setShowVictory(false);
    setDisplayedPoints(0);
    if (task.timeBlockStart && task.timeBlockEnd) {
      setStartTime(task.timeBlockStart);
      setEndTime(task.timeBlockEnd);
    } else {
      const now = new Date();
      const start = format(now, 'HH:00');
      const end = format(now, 'HH:mm');
      setStartTime(start);
      setEndTime(end);
    }
  }, [isOpen, task]);

  // Derive actual minutes from start/end edits, fallback to planned duration for quick tasks.
  useEffect(() => {
    if (!startTime || !endTime) {
      setActualMinutes(undefined);
      return;
    }
    const s = parse(startTime, 'HH:mm', new Date());
    const e = parse(endTime, 'HH:mm', new Date());
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      setActualMinutes(undefined);
      return;
    }
    let diff = differenceInMinutes(e, s);
    if (diff < 0) diff += 1440;
    setActualMinutes(diff);
  }, [startTime, endTime]);

  const planned = task.plannedDurationMinutes ?? 0;
  const breakdown = calculateTaskPointsPreview({
    type: task.type,
    difficulty: task.difficulty,
    actualMinutes: actualMinutes ?? planned,
    plannedMinutes: planned,
  });

  const timeDiff = planned - (actualMinutes ?? planned);

  const handleConfirm = async () => {
    setShowVictory(true);
    const points = breakdown.total;
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = points / steps;
    let start = 0;
    const timer = setInterval(() => {
      start += increment;
      if (start >= points) {
        setDisplayedPoints(points);
        clearInterval(timer);
      } else {
        setDisplayedPoints(Math.floor(start));
      }
    }, stepTime);

    try {
      await completeTask.mutateAsync({
        id: task._id,
        input: hasPlannedTime ? { actualDurationMinutes: actualMinutes ?? 0 } : {},
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setTaskToComplete(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative bg-white dark:bg-background-paper w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]',
        )}
      >
        {showVictory && (
          <VictoryOverlay
            points={displayedPoints}
            basePoints={breakdown.base}
            bonusPoints={breakdown.bonus - Math.max(0, breakdown.bonus)}
            timeDiff={timeDiff}
            remainingTasks={0}
            onContinue={handleClose}
          />
        )}

        <CompletionHeader taskName={task.title} onClose={handleClose} />

        <div className="p-6 space-y-6 overflow-y-auto">
          <TimeEntry
            startTime={startTime}
            endTime={endTime}
            setStartTime={setStartTime}
            setEndTime={setEndTime}
            taskStartTime={task.timeBlockStart}
            taskEndTime={task.timeBlockEnd}
            expectedTime={planned}
            actualDuration={actualMinutes ?? 0}
            timeDiff={timeDiff}
          />

          <ScoreBreakdown
            basePoints={breakdown.base}
            bonusPoints={breakdown.bonus}
            totalPoints={breakdown.total}
          />
        </div>

        <div className="p-6 pt-0 mt-auto shrink-0">
          <Button
            onClick={handleConfirm}
            className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-500/20 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98] transition-all"
          >
            {t('tasks.confirmCompletion')}
          </Button>
        </div>
      </div>
    </div>
  );
};
