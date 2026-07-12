import { Target } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useTranslation } from '@/providers/useLocale';
import type { AccuracySummary } from '../types';

interface AccuracyCardProps {
  accuracy: AccuracySummary;
}

const formatMinutes = (minutes: number, locale: 'ar' | 'en') => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
  return locale === 'ar'
    ? `${nf.format(hrs)} س ${nf.format(mins)} د`
    : `${nf.format(hrs)}h ${nf.format(mins)}m`;
};

export const AccuracyCard = ({ accuracy }: AccuracyCardProps) => {
  const { t, locale } = useTranslation();
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <Target size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {t('analytics.accuracy.title')}
        </h3>
      </div>

      {accuracy.sampleSize === 0 || accuracy.onTargetRate === null ? (
        <p className="text-sm text-foreground-muted">{t('analytics.accuracy.noData')}</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-foreground-muted">{t('analytics.accuracy.onTarget')}</span>
              <span className="font-bold text-foreground">
                {nf.format(Math.round(accuracy.onTargetRate * 100))}
                {locale === 'ar' ? '٪' : '%'}
              </span>
            </div>
            {/* Fills from inline-start — right in RTL, left in LTR. */}
            <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${Math.round(accuracy.onTargetRate * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-foreground-muted uppercase">
                {t('analytics.accuracy.planned')}
              </div>
              <div className="font-bold text-foreground">
                {formatMinutes(accuracy.plannedMinutes, locale)}
              </div>
            </div>
            <div>
              <div className="text-xs text-foreground-muted uppercase">
                {t('analytics.accuracy.actual')}
              </div>
              <div className="font-bold text-foreground">
                {formatMinutes(accuracy.actualMinutes, locale)}
              </div>
            </div>
          </div>
          <p className="text-xs text-foreground-muted">
            {t('analytics.accuracy.sample', { count: nf.format(accuracy.sampleSize) })}
          </p>
        </div>
      )}
    </Card>
  );
};
