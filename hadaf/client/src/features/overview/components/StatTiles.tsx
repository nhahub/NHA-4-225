import { Zap, CheckCircle2, Flame, Trophy } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useTranslation } from '@/providers/useLocale';
import type { AnalyticsTotals } from '../types';

interface StatTilesProps {
  totals: AnalyticsTotals;
}

export const StatTiles = ({ totals }: StatTilesProps) => {
  const { t, locale } = useTranslation();
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');

  const bestDayLabel = totals.bestDay
    ? new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${totals.bestDay.date}T00:00:00`))
    : '—';

  const tiles = [
    {
      key: 'points',
      icon: <Zap size={20} fill="currentColor" />,
      iconClass: 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
      label: t('analytics.tiles.points'),
      value: nf.format(totals.pointsEarned),
      sub: null as string | null,
    },
    {
      key: 'tasks',
      icon: <CheckCircle2 size={20} />,
      iconClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      label: t('analytics.tiles.tasks'),
      value: nf.format(totals.tasksCompleted),
      sub: null,
    },
    {
      key: 'activeDays',
      icon: <Flame size={20} />,
      iconClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      label: t('analytics.tiles.activeDays'),
      value: nf.format(totals.activeDays),
      sub: null,
    },
    {
      key: 'bestDay',
      icon: <Trophy size={20} />,
      iconClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      label: t('analytics.tiles.bestDay'),
      value: bestDayLabel,
      sub: totals.bestDay
        ? t('analytics.tiles.bestDayPoints', { points: nf.format(totals.bestDay.points) })
        : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((tile) => (
        <Card key={tile.key} padding="md">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tile.iconClass}`}
            >
              {tile.icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase truncate">
                {tile.label}
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {tile.value}
              </div>
              {tile.sub && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{tile.sub}</div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
