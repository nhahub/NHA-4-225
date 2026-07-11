import { useLocale } from '@/providers/useLocale';

interface TwelveWeekBarProps {
  cycleStart: string;
  cycleEnd: string;
  totalWeeks?: number;
  compact?: boolean;
}

/** 1-indexed current week of the cycle, clamped to [1, totalWeeks]. */
function getCurrentWeek(cycleStart: string, totalWeeks: number): number {
  const start = new Date(cycleStart);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.floor((now.getTime() - start.getTime()) / msPerWeek) + 1;
  return Math.min(totalWeeks, Math.max(1, week));
}

export const TwelveWeekBar = ({
  cycleStart,
  cycleEnd,
  totalWeeks = 12,
  compact = false,
}: TwelveWeekBarProps) => {
  const { t, formatDate } = useLocale();
  const currentWeek = getCurrentWeek(cycleStart, totalWeeks);
  const weeks = Array.from({ length: totalWeeks }, (_, i) => i + 1);

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {t('goals.twelveWeekBar')}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {t('goals.weekOf', { current: currentWeek, total: totalWeeks })}
          </span>
        </div>
      )}
      <div className={`flex gap-1 ${compact ? 'h-1.5' : ''}`} role="img" aria-label={t('goals.twelveWeekBar')}>
        {weeks.map((week) => (
          <div
            key={week}
            title={`${t('goals.week')} ${week}`}
            className={`${compact ? 'h-1.5' : 'h-2'} flex-1 rounded-full transition-colors duration-300 ${
              week === currentWeek
                ? 'bg-brand-500'
                : week < currentWeek
                  ? 'bg-brand-200 dark:bg-brand-800'
                  : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
      {!compact && (
        <p className="text-[11px] text-gray-400 mt-1">
          {formatDate(cycleStart)} – {formatDate(cycleEnd)}
        </p>
      )}
    </div>
  );
};
