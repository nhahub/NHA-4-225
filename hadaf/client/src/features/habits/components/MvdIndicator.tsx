import { useTranslation } from '@/providers/useLocale';
import { useDayType } from '@/providers/useDayType';
import { Habit } from '../types';
import { cn } from '@/shared/utils/cn';

interface MvdIndicatorProps {
  habit: Habit;
}

export const MvdIndicator = ({ habit }: MvdIndicatorProps) => {
  const { t } = useTranslation();
  const { dayType } = useDayType();
  const isLightDay = dayType === 'light';

  if (!habit.mvdDescription) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded',
        isLightDay
          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
      )}
      title={t('habits.mvdTooltip', {
        value: habit.mvdValue ?? 0,
        description: habit.mvdDescription,
      })}
    >
      {isLightDay ? '★' : '·'} {t('habits.mvd')}
      {habit.mvdValue !== undefined ? ` · ${habit.mvdValue}` : ''}
    </span>
  );
};
