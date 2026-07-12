import { useEffect, useState } from 'react';
import { useTranslation } from '@/providers/useLocale';
import { Card } from '@/shared/components/ui/Card';
import { useAnalyticsOverview, useHabitsAnalytics } from '../hooks/useAnalytics';
import { RangePicker } from '../components/RangePicker';
import { StatTiles } from '../components/StatTiles';
import { PointsTrendChart } from '../components/PointsTrendChart';
import { ProductiveHoursChart } from '../components/ProductiveHoursChart';
import { WeekdayBreakdown } from '../components/WeekdayBreakdown';
import { AccuracyCard } from '../components/AccuracyCard';
import { HabitAnalyticsList } from '../components/HabitAnalyticsList';
import { GoalWeeklySection } from '../components/GoalWeeklySection';
import { AnalyticsSkeleton } from '../components/AnalyticsSkeleton';
import { AnalyticsEmptyState } from '../components/AnalyticsEmptyState';
import type { RangePreset } from '../types';

// /overview — the Analytics page (Epic 6). Charts read /api/analytics/*;
// the goals section reuses the goals list's compiled weekly buckets.
export const OverviewPage = () => {
  const { t } = useTranslation();
  const [preset, setPreset] = useState<RangePreset>(30);

  // The two queries run in parallel (independent useQuery calls, no await chain).
  const overviewQuery = useAnalyticsOverview(preset);
  const habitsQuery = useHabitsAnalytics(preset);

  useEffect(() => {
    document.title = `${t('analytics.title')} · ${t('app.name')}`;
  }, [t]);

  if (overviewQuery.isLoading || habitsQuery.isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <div className="rounded-3xl border border-border bg-background-paper p-10 text-center">
        <p className="text-foreground-muted mb-4">{t('analytics.loadError')}</p>
        <button
          type="button"
          onClick={() => {
            void overviewQuery.refetch();
            void habitsQuery.refetch();
          }}
          className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors"
        >
          {t('analytics.retry')}
        </button>
      </div>
    );
  }

  const overview = overviewQuery.data;
  const habits = habitsQuery.data?.habits ?? [];

  const isFreshAccount =
    overview.totals.pointsEarned === 0 &&
    overview.totals.tasksCompleted === 0 &&
    habits.length === 0;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('analytics.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('analytics.subtitle')}
          </p>
        </div>
        <RangePicker value={preset} onChange={setPreset} />
      </header>

      {isFreshAccount ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <StatTiles totals={overview.totals} />

          <Card padding="lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('analytics.trend.title')}
            </h3>
            <PointsTrendChart trend={overview.dailyTrend} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card padding="lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('analytics.hours.title')}
              </h3>
              <ProductiveHoursChart
                hours={overview.productiveHours}
                unscheduledCompleted={overview.unscheduledCompleted}
              />
            </Card>
            <Card padding="lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('analytics.weekday.title')}
              </h3>
              <WeekdayBreakdown weekdays={overview.weekdays} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <AccuracyCard accuracy={overview.accuracy} />
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('analytics.habits.title')}
              </h2>
              <HabitAnalyticsList habits={habits} />
            </section>
          </div>

          <GoalWeeklySection />
        </>
      )}
    </div>
  );
};
