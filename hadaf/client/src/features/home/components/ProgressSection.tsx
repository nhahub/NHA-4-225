import { useTranslation } from '@/providers/useLocale';
import { Card } from '@/shared/components/ui/Card';
import { ProgressBar } from '@/features/dashboard/components/ProgressBar';
import { CapacityGauge } from '@/features/dashboard/components/CapacityGauge';
import type { DailySummary, CapacityData } from '@/features/dashboard/api/dashboardApi';

interface ProgressSectionProps {
  summary: DailySummary | undefined;
  capacity: CapacityData | undefined;
  isLoading?: boolean;
}

/**
 * HOME-2 final section: today's progress. Reuses `ProgressBar` and
 * `CapacityGauge` from `features/dashboard/components/`. No new design
 * surface — purely a composition of pre-existing components.
 */
export const ProgressSection = ({ summary, capacity, isLoading }: ProgressSectionProps) => {
  const { t } = useTranslation();

  const pointsRatio =
    summary && summary.dailyTarget > 0
      ? (summary.pointsEarned / summary.dailyTarget) * 100
      : 0;

  return (
    <section aria-labelledby="home-progress-heading">
      <h2
        id="home-progress-heading"
        className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
      >
        {t('home.sections.progress')}
      </h2>

      <div className="flex flex-col gap-6">
        <Card padding="md" className="bg-gradient-to-br from-brand-50/50 to-white dark:from-brand-900/10 dark:to-gray-900">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {t('home.progress.scoreLabel')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t('home.progress.ofTarget', { target: summary?.dailyTarget ?? 0 })}
              </p>
            </div>
            <div className="text-end">
              <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                {summary?.pointsEarned ?? 0}
              </div>
            </div>
          </div>
          <ProgressBar percent={pointsRatio} showLabel />
        </Card>

        {capacity ? (
          <Card padding="md">
            <CapacityGauge capacity={capacity} />
          </Card>
        ) : isLoading ? (
          <Card padding="md" className="h-32 animate-pulse" />
        ) : null}
      </div>
    </section>
  );
};