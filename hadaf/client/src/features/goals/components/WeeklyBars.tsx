import { useTranslation } from '@/providers/useLocale';
import type { WeeklyCompletionBucket } from '../types';

interface WeeklyBarsProps {
  buckets: WeeklyCompletionBucket[];
  /** Current week (1–12). The corresponding bar is highlighted with a marker. */
  currentWeek?: number;
}

/**
 * 12-week bar visualization per goal (E1-2 spec).
 * One vertical bar per cycle week; height encodes completion ratio.
 * Health colors map 1:1 to GoalHealth ratio thresholds (>=85 green, >=70 emerald,
 * >=50 amber, <50 red) so the visual echoes the existing HealthDot palette.
 */
export const WeeklyBars = ({ buckets, currentWeek }: WeeklyBarsProps) => {
  const { t } = useTranslation();
  const data = buckets ?? [];
  if (data.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-400 font-bold">
        <span>{t('goals.weeklyBars')}</span>
        <span>
          {t('goals.weeklyBarsRange', {
            from: data[0]?.week ?? 1,
            to: data[data.length - 1]?.week ?? 12,
          })}
        </span>
      </div>
      <div className="flex items-end gap-1 h-12" role="img" aria-label={t('goals.weeklyBars')}>
        {data.map((b) => {
          const heightPct = b.total > 0 ? b.ratio : 0;
          const barColor =
            b.total === 0
              ? 'bg-gray-100 dark:bg-gray-800'
              : b.ratio >= 85
                ? 'bg-emerald-500'
                : b.ratio >= 70
                  ? 'bg-emerald-400'
                  : b.ratio >= 50
                    ? 'bg-amber-400'
                    : 'bg-red-500';
          const isCurrent = b.week === currentWeek;
          return (
            <div
              key={b.week}
              className="flex-1 h-full flex items-end"
              title={`${t('goals.week')} ${b.week}: ${b.completed}/${b.total}`}
            >
              <div
                className={`w-full rounded-sm ${barColor} ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-900' : ''}`}
                style={{ height: `${Math.max(6, heightPct)}%` }}
                aria-label={`${t('goals.week')} ${b.week}: ${b.completed}/${b.total}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
