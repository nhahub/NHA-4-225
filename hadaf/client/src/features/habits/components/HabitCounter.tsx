import { Habit } from '../types';
import { useLogHabit } from '../hooks/useHabits';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from '@/providers/useLocale';
import { toast } from 'sonner';
import { Trash2, Plus, Repeat } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface HabitCounterProps {
  habit: Habit;
}

export const HabitCounter = ({ habit }: HabitCounterProps) => {
  const { t } = useTranslation();
  const logHabit = useLogHabit();
  const [draft, setDraft] = useState<number>(habit.targetValue ?? 0);

  const submit = (value: number, isMvd = false) => {
    logHabit.mutate(
      {
        id: habit._id,
        input: { date: format(new Date(), 'yyyy-MM-dd'), value, isMvd },
      },
      {
        onSuccess: () => toast.success(t('habits.logged')),
        onError: () => toast.error(t('common.error')),
      },
    );
  };

  const target = habit.targetValue ?? 1;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDraft((n) => Math.max(0, n - 1))}
        aria-label={t('habits.decrement')}
      >
        −
      </Button>
      <input
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(Number(e.target.value))}
        className="w-16 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setDraft((n) => n + 1)}
        aria-label={t('habits.increment')}
      >
        +
      </Button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        / {target}
      </span>
      <div className="flex items-center gap-1 ms-auto">
        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus size={12} />}
          onClick={() => submit(draft)}
          isLoading={logHabit.isPending}
        >
          {t('habits.logFull')}
        </Button>
        {habit.mvdValue !== undefined && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Repeat size={12} />}
            onClick={() => submit(habit.mvdValue ?? 0, true)}
            isLoading={logHabit.isPending}
          >
            {t('habits.logMvd')}
          </Button>
        )}
      </div>
      {draft === 0 && (
        <Button
          size="sm"
          variant="danger"
          leftIcon={<Trash2 size={12} />}
          onClick={() => submit(0, true)}
        >
          {t('habits.logSkip')}
        </Button>
      )}
    </div>
  );
};
