import { useFormContext } from 'react-hook-form';
import { ArrowUp, Minus, ArrowDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/providers/useLocale';
import type { TaskPriority as TaskPriorityValue, TaskDifficulty } from '../../types';

interface PriorityOption {
  id: TaskPriorityValue;
  label: string;
  icon: typeof ArrowUp;
  base: string;
  active: string;
}

// One consistent icon family (directional arrows) instead of mixing
// fire/triangle/arrow metaphors — high/medium/low read as a single ranked
// scale at a glance. Vertical arrows aren't mirrored under RTL, unlike
// horizontal ones, so this is safe for the Arabic layout too.
export const TaskPriorityPicker = () => {
  const { t } = useTranslation();
  const { setValue, watch } = useFormContext<{ priority: TaskPriorityValue }>();
  const selectedPriority = watch('priority');

  const priorities: PriorityOption[] = [
    {
      id: 'high',
      label: t('tasks.priorityHigh'),
      icon: ArrowUp,
      base: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
      active: 'bg-red-600 text-white border-red-600 ring-2 ring-red-200',
    },
    {
      id: 'medium',
      label: t('tasks.priorityMedium'),
      icon: Minus,
      base: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100',
      active: 'bg-orange-500 text-white border-orange-500 ring-2 ring-orange-200',
    },
    {
      id: 'low',
      label: t('tasks.priorityLow'),
      icon: ArrowDown,
      base: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      active: 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200',
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
        {t('tasks.priority')}
      </label>
      <div className="grid grid-cols-3 gap-2">
        {priorities.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setValue('priority', p.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border transition-all duration-200',
              selectedPriority === p.id
                ? p.active
                : cn('bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700', p.base),
            )}
          >
            <p.icon size={18} className={selectedPriority === p.id ? 'animate-pulse' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-wide">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const TaskDifficultyPicker = () => {
  const { t } = useTranslation();
  const { register } = useFormContext<{ difficulty: TaskDifficulty }>();
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
        {t('tasks.difficulty')}
      </label>
      <select
        {...register('difficulty')}
        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        <option value="easy">{t('tasks.difficultyEasy')}</option>
        <option value="medium">{t('tasks.difficultyMedium')}</option>
        <option value="hard">{t('tasks.difficultyHard')}</option>
      </select>
      <p className="text-[11px] text-gray-400">{t('tasks.difficultyHelper')}</p>
    </div>
  );
};
