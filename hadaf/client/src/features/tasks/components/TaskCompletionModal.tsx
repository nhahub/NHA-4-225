import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/Button';
import { Task } from '../types';
import { cn } from '@/shared/utils/cn';
import { format, differenceInMinutes, parse, addMinutes } from 'date-fns';
import { QUERY_KEYS } from '@/shared/constants/queryKeys';
import { getPointsBreakdown } from '../utils/scoringUtils';

// Sub-components
import { VictoryOverlay } from './completion/VictoryOverlay';
import { CompletionHeader } from './completion/CompletionHeader';
import { TimeEntry } from './completion/TimeEntry';
import { ScoreBreakdown } from './completion/ScoreBreakdown';

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ✅ Updated signature to accept time strings
  onConfirm: (actualTime: number, points: number, start: string, end: string) => void;
  task: Task;
}

export const TaskCompletionModal: React.FC<TaskCompletionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  task
}) => {
  const queryClient = useQueryClient();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showVictory, setShowVictory] = useState(false);
  const [displayedPoints, setDisplayedPoints] = useState(0);
  
  const tasks = queryClient.getQueryData<Task[]>(QUERY_KEYS.TASKS) || [];
  const remainingTasks = Math.max(0, tasks.filter(t => !t.done).length - 1);

  // Initialize
  useEffect(() => {
    if (isOpen) {
      setShowVictory(false);
      setDisplayedPoints(0);
      const now = new Date();
      const defaultStart = task.startTime 
        ? task.startTime 
        : format(addMinutes(now, -task.expectedTime), 'HH:mm');
      const defaultEnd = format(now, 'HH:mm');
      setStartTime(defaultStart);
      setEndTime(defaultEnd);
    }
  }, [isOpen, task]);

  // Logic
  const calculateDuration = () => {
    try {
      const now = new Date();
      const s = parse(startTime, 'HH:mm', now);
      const e = parse(endTime, 'HH:mm', now);
      let diff = differenceInMinutes(e, s);
      if (diff < 0) diff += 1440; 
      return diff;
    } catch {
      return task.expectedTime;
    }
  };

  const actualDuration = calculateDuration();
  const timeDiff = task.expectedTime - actualDuration;

  const pointsData = getPointsBreakdown(task, actualDuration);

  const handleConfirm = () => {
    setShowVictory(true);
    let start = 0;
    const duration = 800;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = pointsData.total / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= pointsData.total) {
        setDisplayedPoints(pointsData.total);
        clearInterval(timer);
      } else {
        setDisplayedPoints(Math.floor(start));
      }
    }, stepTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className={cn(
        "relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]",
      )}>
        
        {showVictory && (
          <VictoryOverlay 
            points={displayedPoints}
            basePoints={pointsData.base}
            bonusPoints={pointsData.bonus}
            timeDiff={timeDiff} 
            remainingTasks={remainingTasks}
            onContinue={() => onConfirm(actualDuration, pointsData.total, startTime, endTime)} 
          />
        )}

        <CompletionHeader taskName={task.name} onClose={onClose} />

        <div className="p-6 space-y-6 overflow-y-auto">
          <TimeEntry 
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            taskStartTime={task.startTime}
            taskEndTime={task.endTime}
            expectedTime={task.expectedTime}
            actualDuration={actualDuration}
            timeDiff={timeDiff}
          />
          
          <ScoreBreakdown 
            basePoints={pointsData.base}
            bonusPoints={pointsData.bonus}
            totalPoints={pointsData.total}
          />
        </div>

        <div className="p-6 pt-0 mt-auto shrink-0">
          <Button 
            onClick={handleConfirm} 
            className="w-full h-14 text-lg font-bold shadow-xl shadow-brand-500/20 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white active:scale-[0.98] transition-all"
          >
            Confirm Completion
          </Button>
        </div>

      </div>
    </div>
  );
};