import { useTranslation } from '@/providers/useLocale';
import type { WeekdayBucket } from '../types';

interface WeekdayBreakdownProps {
  weekdays: WeekdayBucket[];
}

/**
 * Hand-rolled 7-bar weekday breakdown (same visual family as goals'
 * WeeklyBars). Bars fill by avgPoints relative to the best weekday; the best
 * weekday is highlighted with the brand color.
 */
export const WeekdayBreakdown = ({ weekdays }: WeekdayBreakdownProps) => {
  const { t, locale } = useTranslation();
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');

  const max = Math.max(...weekdays.map((w) => w.avgPoints), 0);
  const hasData = max > 0;

  if (!hasData) {
    return (
      <p className="text-sm text-foreground-muted py-8 text-center">
        {t('analytics.weekday.empty')}
      </p>
    );
  }

  return (
    <div className="flex items-end gap-2 h-40" role="img" aria-label={t('analytics.weekday.title')}>
      {weekdays.map((w) => {
        const heightPct = max > 0 ? (w.avgPoints / max) * 100 : 0;
        const isBest = w.avgPoints === max && max > 0;
        return (
          <div key={w.weekday} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5">
            <span className="text-[10px] font-bold text-foreground-muted">
              {nf.format(w.avgPoints)}
            </span>
            <div
              className={`w-full rounded-t-md ${isBest ? 'bg-brand-500' : 'bg-brand-200 dark:bg-brand-900/60'}`}
              style={{ height: `${Math.max(4, heightPct)}%` }}
              title={`${t(`analytics.weekday.${w.weekday}`)}: ${nf.format(w.avgPoints)}`}
            />
            <span className={`text-[10px] font-bold ${isBest ? 'text-brand-600 dark:text-brand-400' : 'text-foreground-muted'}`}>
              {t(`analytics.weekday.${w.weekday}`)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
