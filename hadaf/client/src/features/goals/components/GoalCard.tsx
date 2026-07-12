import { useTranslation, useLocale } from '@/providers/useLocale';
import { ProgressRing } from '@/shared/components/ui/ProgressRing';
import { HealthDot } from '@/shared/components/ui/HealthDot';
import { WeeklyBars } from './WeeklyBars';
import { Goal, GOAL_CATEGORY_LABELS } from '../types';

interface GoalCardProps {
  goal: Goal;
  onOpen: (id: string) => void;
}

export const GoalCard = ({ goal, onOpen }: GoalCardProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const progress = goal.progress ?? 0;
  const health = goal.health ?? 'yellow';
  const categoryLabel = goal.category === 'other'
    ? goal.customCategory
    : GOAL_CATEGORY_LABELS[goal.category][locale];

  return (
    <button
      onClick={() => onOpen(goal._id)}
      className="group flex flex-col gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-background-paper hover:shadow-md transition-shadow text-start w-full"
    >
      <div className="flex items-start gap-3">
        <ProgressRing progress={progress} />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">
            {goal.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {categoryLabel}
          </p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <HealthDot health={health} label />
            {goal.stats && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {t('goals.pointsEarnedOf', {
                  earned: goal.stats.earnedPoints,
                  target: goal.stats.targetPoints,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
      {goal.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
          {goal.description}
        </p>
      )}
      {goal.weeklyCompletion && goal.weeklyCompletion.length > 0 && (
        <WeeklyBars buckets={goal.weeklyCompletion} currentWeek={goal.currentWeek} />
      )}
      <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
        <span>
          {t('goals.milestonesCount', {
            done: goal.stats?.completedMilestonesCount ?? 0,
            total: goal.stats?.milestonesCount ?? 0,
          })}
        </span>
        <span>
          {t('goals.tasksCount', {
            done: goal.stats?.completedTasksCount ?? 0,
            total: goal.stats?.tasksCount ?? 0,
          })}
        </span>
      </div>
    </button>
  );
};
