import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Target, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { useActiveGoals, useGoal } from '../../../goals/hooks/useGoals';
import { Input } from '@/shared/components/ui/Input';
import type { TaskFormValues } from './formValues';

/** Finds the milestone whose date range contains `dateStr` (YYYY-MM-DD strings compare lexicographically). */
const suggestMilestoneId = (
  milestones: Array<{ _id: string; startDate?: string | null; endDate?: string | null }>,
  dateStr: string,
) => {
  const match = milestones.find(
    (m) => m.startDate && m.endDate && dateStr >= m.startDate.slice(0, 10) && dateStr <= m.endDate.slice(0, 10),
  );
  return match?._id ?? '';
};

export const TaskGoalSelector = () => {
  const { t } = useTranslation();
  const { register, watch, setValue } = useFormContext<TaskFormValues>();
  const { data: goals, isLoading } = useActiveGoals();

  const goalId = watch('goalId');
  const date = watch('date');
  const { data: goalDetail } = useGoal(goalId || undefined);
  const milestones = goalDetail?.milestones ?? [];

  // Selecting a different goal (or clearing it) invalidates any milestone/points
  // choice made for the previous goal.
  const previousGoalId = useRef(goalId);
  useEffect(() => {
    if (previousGoalId.current !== goalId) {
      previousGoalId.current = goalId;
      setValue('milestoneId', '');
      setValue('goalPointsPlanned', 1);
    }
  }, [goalId, setValue]);

  // Once milestones for the selected goal load, suggest the one whose date range
  // covers the task's date — but only if the user hasn't already picked one.
  useEffect(() => {
    if (!goalId || milestones.length === 0 || !date) return;
    const current = watch('milestoneId');
    if (current) return;
    const suggestion = suggestMilestoneId(milestones, date);
    if (suggestion) setValue('milestoneId', suggestion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalId, date, milestones.length]);

  if (isLoading || !goals?.length) return null;

  const goalStats = goalDetail?.goal.stats;
  const remaining = goalStats ? Math.max(0, goalStats.targetPoints - goalStats.earnedPoints) : undefined;

  return (
    <div className="space-y-3">
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

      {goalId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {milestones.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                {t('goals.milestones')}
              </label>
              <div className="relative">
                <select
                  {...register('milestoneId')}
                  className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                >
                  <option value="">{t('tasks.noMilestone', 'No milestone')}</option>
                  {milestones.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              {t('tasks.goalPoints', 'Goal points')}
            </label>
            <Input
              type="number"
              min={1}
              {...register('goalPointsPlanned', { valueAsNumber: true })}
            />
            {remaining !== undefined && goalStats && (
              <p className="text-[11px] text-gray-400">
                {t('tasks.goalPointsRemaining', { remaining, target: goalStats.targetPoints })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
