import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useTranslation } from '@/providers/useLocale';
import { useActiveGoals } from '@/features/goals/hooks/useGoals';
import { WeeklyBars } from '@/features/goals/components/WeeklyBars';

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const currentCycleWeek = (cycleStart: string): number => {
  const start = new Date(`${cycleStart.split('T')[0]}T00:00:00`);
  const week = Math.floor((Date.now() - start.getTime()) / MS_PER_WEEK) + 1;
  return Math.min(Math.max(week, 1), 12);
};

/**
 * 12-week progress per active goal — reuses the goals feature's WeeklyBars
 * (the analytics view of goal↔task linkage; data comes from the goals list
 * endpoint's compiled weeklyCompletion buckets, no analytics endpoint needed).
 */
export const GoalWeeklySection = () => {
  const { t, locale } = useTranslation();
  const { data: goals, isLoading } = useActiveGoals();
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight;

  if (isLoading || !goals || goals.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        {t('analytics.goals.title')}
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <Card key={goal._id} padding="md">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                  {goal.title}
                </h4>
                <p className="text-xs text-foreground-muted">
                  {t('analytics.goals.week', {
                    week: nf.format(currentCycleWeek(goal.cycleStart)),
                  })}
                  {typeof goal.progress === 'number' && (
                    <>
                      {' · '}
                      {t('analytics.goals.progress', {
                        pct: `${nf.format(Math.round(goal.progress))}${locale === 'ar' ? '٪' : '%'}`,
                      })}
                    </>
                  )}
                </p>
              </div>
              <Link
                to={`/goals/${goal._id}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0 min-h-11"
              >
                {t('analytics.goals.details')}
                <Chevron size={14} />
              </Link>
            </div>
            {goal.weeklyCompletion && goal.weeklyCompletion.length > 0 ? (
              <WeeklyBars
                buckets={goal.weeklyCompletion}
                currentWeek={currentCycleWeek(goal.cycleStart)}
              />
            ) : (
              <p className="text-xs text-foreground-muted">
                {t('analytics.goals.noWeeklyData')}
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};
