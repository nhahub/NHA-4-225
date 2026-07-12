import { useFormContext } from 'react-hook-form';
import { Target, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { useActiveGoals } from '../../../goals/hooks/useGoals';
import type { TaskFormValues } from './formValues';

export const TaskGoalSelector = () => {
  const { t } = useTranslation();
  const { register } = useFormContext<TaskFormValues>();
  const { data: goals, isLoading } = useActiveGoals();

  if (isLoading || !goals?.length) return null;

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-2">
        <Target size={12} />
        {t('tasks.goal', 'Linked Goal')}
      </label>
      <div className="relative">
        <select
          {...register('goalId')}
          className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
        >
          <option value="">{t('tasks.noGoal', 'No Goal (General Task)')}</option>
          {goals.map((goal) => (
            <option key={goal._id} value={goal._id}>
              {goal.title}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};
