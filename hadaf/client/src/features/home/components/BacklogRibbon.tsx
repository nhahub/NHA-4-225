import { Link } from 'react-router-dom';
import { useTranslation } from '@/providers/useLocale';
import { Card } from '@/shared/components/ui/Card';
import { Inbox, ArrowRight, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';

interface BacklogRibbonProps {
  count: number;
}

/**
 * Compact ribbon linking the home screen to the full tasks backlog.
 * Pure presentation — count comes from `useHomeData` which already fetched
 * `GET /api/tasks?view=backlog`.
 */
export const BacklogRibbon = ({ count }: BacklogRibbonProps) => {
  const { t, locale } = useTranslation();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section aria-labelledby="home-backlog-heading">
      <h2
        id="home-backlog-heading"
        className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3"
      >
        {t('home.sections.backlog')}
      </h2>

      <Link
        to={ROUTES.TASKS}
        className={cn(
          'group block rounded-2xl border border-gray-200/50 dark:border-gray-700/50',
          'bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl',
          'hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-900',
          'hover:shadow-md transition-all duration-300',
        )}
      >
        <Card padding="md" variant="ghost" className="border-0 shadow-none">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
              )}
            >
              <Inbox size={20} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {count === 0
                  ? t('home.backlog.empty')
                  : count === 1
                  ? t('home.backlog.countOne')
                  : t('home.backlog.count', { count })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('home.backlog.viewAll')}</p>
            </div>
            <Arrow
              size={18}
              className="text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
              aria-hidden="true"
            />
          </div>
        </Card>
      </Link>
    </section>
  );
};