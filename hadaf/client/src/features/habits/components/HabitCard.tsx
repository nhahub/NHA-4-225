import { useState } from 'react';
import { Check, Circle, CalendarOff } from 'lucide-react';
import { Habit } from '../types';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from '@/providers/useLocale';
import { useLogHabit, useLogRelapse } from '../hooks/useHabits';
import { MvdIndicator } from './MvdIndicator';
import { HabitCounter } from './HabitCounter';
import { RelapseConfirmationDialog } from './RelapseConfirmationDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';

interface HabitCardProps {
  habit: Habit;
}

export const HabitCard = ({ habit }: HabitCardProps) => {
  const { t } = useTranslation();
  const logHabit = useLogHabit();
  const logRelapse = useLogRelapse();
  const [showRelapse, setShowRelapse] = useState(false);

  const isQuit = habit.type === 'quit';
  const isCounter = habit.type === 'counter';

  const onToggleBoolean = () => {
    logHabit.mutate(
      {
        id: habit._id,
        input: { date: format(new Date(), 'yyyy-MM-dd'), value: 1 },
      },
      {
        onSuccess: () => toast.success(t('habits.logged')),
        onError: () => toast.error(t('common.error')),
      },
    );
  };

  const handleRelapse = () => {
    setShowRelapse(false);
    logRelapse.mutate(habit._id, {
      onSuccess: () => toast.success(t('habits.relapseLogged')),
      onError: () => toast.error(t('common.error')),
    });
  };

  return (
    <Card padding="md">
      <div className="flex items-start gap-3">
        {habit.type === 'boolean' && (
          <button
            type="button"
            onClick={onToggleBoolean}
            disabled={logHabit.isPending}
            className="mt-1 w-9 h-9 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-all flex items-center justify-center shrink-0"
            aria-label={t('habits.mark')}
          >
            <Circle size={18} className="text-gray-400" />
          </button>
        )}

        {isCounter && (
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Check size={20} />
          </div>
        )}

        {isQuit && (
          <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <CalendarOff size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{habit.title}</h3>
            {habit.mvdDescription && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {habit.mvdDescription}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <MvdIndicator habit={habit} />
              {isQuit && habit.daysSinceRelapse !== null && habit.daysSinceRelapse !== undefined && (
                <span
                  className={cn(
                    'text-xs font-bold tabular-nums px-2 py-0.5 rounded',
                    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
                  )}
                >
                  {t('habits.daysSinceRelapse', { count: habit.daysSinceRelapse })}
                </span>
              )}
            </div>
          </div>

          {isCounter && <HabitCounter habit={habit} />}

          {isQuit && (
            <div>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<CalendarOff size={14} />}
                onClick={() => setShowRelapse(true)}
              >
                {t('habits.logRelapse')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <RelapseConfirmationDialog
        isOpen={showRelapse}
        habitTitle={habit.title}
        onClose={() => setShowRelapse(false)}
        onConfirm={handleRelapse}
      />
    </Card>
  );
};
