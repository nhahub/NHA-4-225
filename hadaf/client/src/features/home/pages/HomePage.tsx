import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useDateStore } from '@/shared/stores/useDateStore';
import { useTranslation } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';
import { HomePageSkeleton } from '../components/HomePageSkeleton';
import { DailyOverview } from '../components/DailyOverview';
import { useHomeData } from '../hooks/useHomeData';
import { useYesterdaySummaryToast } from '../components/useYesterdaySummaryToast';

/**
 * HOME-2 HomePage — orchestrator.
 *
 * On mount:
 *   1. Fire all 5 HOME-2 fetches in parallel via `useHomeData` (today's
 *      tasks, today's habits, backlog count, today's DailySummary, today's
 *      capacity). Plus active goals, used only by the greeting.
 *   2. Once the parallel fetch resolves, fire the yesterday-summary toast
 *      exactly once per day via `useYesterdaySummaryToast`.
 *
 * This page is exported as a named export so the lead can wire
 * `router.tsx` `/ → HomePage` at merge time (per the prompt).
 */
export const HomePage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { selectedDate } = useDateStore();
  const data = useHomeData(selectedDate);

  const [hour, setHour] = useState<number>(() => new Date().getHours());

  useEffect(() => {
    document.title = `${t('home.title')} · ${t('app.name')}`;
  }, [t]);

  useEffect(() => {
    // Refresh the hour once on mount so the greeting's time bucket stays
    // accurate across long sessions without re-rendering every minute.
    setHour(new Date().getHours());
  }, []);

  // Yesterday-summary toast — fires exactly once per day (server-side
  // deduped via `summaryShown`).
  useYesterdaySummaryToast(!data.isLoading);

  if (data.isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <AlertCircle size={40} className="text-red-500 mb-4" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('home.loadError')}
        </h3>
        <Button
          variant="secondary"
          onClick={() => {
            // React Query: trigger a refetch by invalidating local keys.
            // (The hooks themselves handle re-fetching on mount; this
            // button is a manual nudge if the user wants to retry
            // without navigating away.)
            window.location.reload();
          }}
        >
          {t('home.retry')}
        </Button>
      </div>
    );
  }

  if (data.isLoading) {
    return <HomePageSkeleton />;
  }

  return <DailyOverview data={data} user={user} hour={hour} />;
};

export default HomePage;