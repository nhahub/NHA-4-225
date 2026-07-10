import { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';

// /overview — real sidebar route per E0-6 (resolves the "Overview vs Home"
// ambiguity in team-task-breakdown.md). Real Overview content lands in a
// later epic; this is a placeholder.
export const OverviewPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('nav.overview')} · ${t('app.name')}`;
  }, [t]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.overview')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('placeholder.comingSoon')}
        </p>
      </header>
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm h-[420px] flex flex-col items-center justify-center text-center p-6">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20 animate-pulse" />
          <div className="relative w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center shadow-xl border border-gray-100 dark:border-gray-700">
            <Lock className="w-9 h-9 text-brand-500" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
          {t('placeholder.comingSoon')}
        </h2>
        <div className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg border border-transparent dark:border-gray-200">
          Overview
        </div>
      </div>
    </div>
  );
};