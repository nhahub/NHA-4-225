import { Clock, CheckCircle2, Hourglass, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAnalyticsOverview } from '@/features/overview/hooks/useAnalytics';
import { PointsTrendChart } from '@/features/overview/components/PointsTrendChart';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { Card } from '@/shared/components/ui/Card';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useCapacity } from '../hooks/useCapacity';
import { ProgressBar } from '../components/ProgressBar';
import { DayStateBadge } from '../components/DayStateBadge';
import { CapacityGauge } from '../components/CapacityGauge';

const formatFocusTime = (minutes: number, locale: 'ar' | 'en') => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (locale === 'ar') {
    return `${hrs} س ${mins} د`;
  }
  return `${hrs}h ${mins}m`;
};

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const user = useAuthStore((state) => state.user);
  const { selectedDate } = useDateStore();
  const stats = useDashboardStats(selectedDate);
  const { data: capacity } = useCapacity();

  useEffect(() => {
    // Daily summary toast is rendered client-side via the toast portal; the
    // `summaryShown` flag on `DailySummary` would gate re-display. We surface
    // it here when the daily summary first loads — see DailySummaryToast.tsx.
    void locale;
  }, [locale]);

  if (stats.isLoading) {
    return <Skeleton className="h-64 w-full rounded-3xl" />;
  }

  const pointsRatio = stats.dailyScore;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.name
              ? t('dashboard.welcome', { name: user.name })
              : t('dashboard.welcomeFallback')}
          </p>
        </div>
        {stats.dailyTarget > 0 && (
          <DayStateBadge state={deriveDayState(pointsRatio)} />
        )}
      </header>

      {capacity && (
        <Card padding="lg">
          <CapacityGauge capacity={capacity} />
        </Card>
      )}

      <Card padding="lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('dashboard.dailyScore')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.scoreSummary', {
                score: stats.dailyScore,
                target: stats.dailyTarget,
              })}
            </p>
          </div>
          <div className="text-end">
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {stats.dailyScore}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t('dashboard.target', { target: stats.dailyTarget })}
            </div>
          </div>
        </div>
        <ProgressBar percent={pointsRatio} showLabel />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">{t('sidebar.done')}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completedTasks}
              </div>
            </div>
          </div>
        </Card>

        <div />
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Hourglass size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">{t('sidebar.pending')}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.pendingTasks}
              </div>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">
                {t('dashboard.totalFocusTime')}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatFocusTime(stats.totalFocusMinutes, locale)}
              </div>
            </div>
          </div>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">{t('sidebar.score')}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.dailyScore}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 7-day points trend (real data) — compact view; full analytics on /overview. */}
      <Card padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('analytics.trend.title')}
          </h3>
          <Link
            to="/overview"
            className="inline-flex items-center min-h-11 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            {t('analytics.viewAll')}
          </Link>
        </div>
        <WeeklyTrendCard />
      </Card>
    </div>
  );
};

const WeeklyTrendCard = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useAnalyticsOverview(7);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />;
  }
  if (!data) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">{t('analytics.loadError')}</p>;
  }
  return <PointsTrendChart trend={data.dailyTrend} compact />;
};

function deriveDayState(percent: number): 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low' {
  if (percent >= 150) return 'legendary';
  if (percent >= 120) return 'amazing';
  if (percent >= 100) return 'perfect';
  if (percent >= 50) return 'good_enough';
  return 'low';
}
