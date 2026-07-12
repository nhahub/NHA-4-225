import { Link } from 'react-router-dom';
import { LineChart } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';

/**
 * Fresh-account state: no points, no habits yet. Accomplishment-first copy —
 * an invitation, never a blank chart grid.
 */
export const AnalyticsEmptyState = () => {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-border bg-background-paper p-10 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-5">
        <LineChart size={28} strokeWidth={1.75} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {t('analytics.empty.title')}
      </h2>
      <p className="text-sm text-foreground-muted max-w-md mb-6">
        {t('analytics.empty.body')}
      </p>
      <Link
        to="/tasks"
        className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-brand-500 text-white text-sm font-bold hover:bg-brand-600 transition-colors"
      >
        {t('analytics.empty.cta')}
      </Link>
    </div>
  );
};
