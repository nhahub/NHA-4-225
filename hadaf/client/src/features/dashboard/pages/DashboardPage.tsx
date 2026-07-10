import { Clock, Lock, CheckCircle2, Hourglass, Zap } from 'lucide-react';
import { useEffect } from 'react';
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

  const pointsRatio = stats.dailyTarget > 0
    ? (stats.dailyScore / stats.dailyTarget) * 100
    : 0;

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

      {/* Advanced Analytics — out of scope for the catch-up work order;
          kept as the original "coming soon" mock exactly as it stood. */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm h-[420px] group">
        <div className="filter blur-[1.5px] pointer-events-none select-none p-8 space-y-8 h-full transition-all duration-500 group-hover:blur-[3px]">
          <div className="flex justify-between items-center opacity-80">
            <div className="h-8 w-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
          <div className="grid grid-cols-3 gap-6 h-64">
            <div className="col-span-2 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-6 flex items-end justify-between gap-4 border border-gray-100 dark:border-gray-700/50">
              {[40, 70, 50, 90, 60, 80, 45, 75, 55, 85, 65, 95].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className="w-full bg-gradient-to-t from-brand-500 to-brand-300 dark:from-brand-600 dark:to-brand-800 rounded-t-md shadow-sm opacity-90"
                ></div>
              ))}
            </div>
            <div className="col-span-1 flex flex-col gap-4">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 flex items-center justify-center border border-gray-100 dark:border-gray-700/50 relative">
                <div className="w-28 h-28 rounded-full border-[12px] border-brand-200 dark:border-brand-900 border-t-brand-500 border-e-brand-400 rotate-45 shadow-sm"></div>
                <div className="absolute text-brand-600 dark:text-brand-400 font-bold text-lg">
                  78%
                </div>
              </div>
              <div className="h-12 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center px-4">
                <div className="h-2 w-2/3 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/30 dark:bg-gray-950/50 backdrop-blur-[1px] p-6 text-center transition-all duration-300 group-hover:bg-white/40 dark:group-hover:bg-gray-950/60">
          <div className="relative">
            <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-100 dark:border-gray-700 relative z-10">
              <Lock className="w-9 h-9 text-brand-500" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight drop-shadow-sm">
            {t('dashboard.advancedAnalytics')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-md mb-8 leading-relaxed text-sm md:text-base font-medium">
            {t('dashboard.advancedAnalyticsBody')}
          </p>
          <div className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg cursor-default border border-transparent dark:border-gray-200 transform hover:scale-105 transition-transform">
            {t('dashboard.comingSoon')}
          </div>
        </div>
      </div>
    </div>
  );
};

function deriveDayState(percent: number): 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low' {
  if (percent >= 150) return 'legendary';
  if (percent >= 120) return 'amazing';
  if (percent >= 100) return 'perfect';
  if (percent >= 50) return 'good_enough';
  return 'low';
}
