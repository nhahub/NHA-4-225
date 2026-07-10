import { useMemo } from 'react';
import { format, startOfWeek, addWeeks, parse, subDays } from 'date-fns';
import { useTranslation } from '@/providers/useLocale';

interface WeeklyHeatmapProps {
  /** Map of date string (YYYY-MM-DD) → number of completed tasks that day. */
  completedByDate: Record<string, number>;
  /** Cycle end inclusive — used to clamp the heatmap window. */
  cycleEnd?: string;
  weeks?: number;
}

interface HeatCell {
  date: string;
  count: number;
  intensity: number;
}

export const WeeklyHeatmap = ({
  completedByDate,
  cycleEnd,
  weeks = 12,
}: WeeklyHeatmapProps) => {
  const { t } = useTranslation();

  const cells = useMemo<HeatCell[]>(() => {
    const today = new Date();
    const start = startOfWeek(subDays(today, weeks * 7), { weekStartsOn: 0 });
    const endCap = cycleEnd ? parse(cycleEnd, 'yyyy-MM-dd', new Date()) : addWeeks(start, weeks);

    const counts = Object.entries(completedByDate).map(([d, n]) => ({ date: d, n }));
    const max = Math.max(1, ...counts.map((c) => c.n));

    const out: HeatCell[] = [];
    let cursor = start;
    while (cursor <= endCap && out.length < weeks * 7) {
      const ds = format(cursor, 'yyyy-MM-dd');
      const found = counts.find((c) => c.date === ds)?.n ?? 0;
      out.push({
        date: ds,
        count: found,
        intensity: found / max,
      });
      cursor = addDays(cursor, 1);
    }
    return out.slice(0, weeks * 7);
  }, [completedByDate, cycleEnd, weeks]);

  const colorFor = (intensity: number, count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity > 0.75) return 'bg-brand-600 dark:bg-brand-500';
    if (intensity > 0.5) return 'bg-brand-400 dark:bg-brand-600';
    if (intensity > 0.25) return 'bg-brand-200 dark:bg-brand-800';
    return 'bg-brand-100 dark:bg-brand-900';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        {t('goals.weeklyHeatmap')}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{t('goals.weeklyHeatmapHelper')}</p>
      <div className="flex flex-wrap gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            className={`w-3 h-3 rounded-sm ${colorFor(c.intensity, c.count)}`}
            title={`${c.date}: ${c.count} ${c.count === 1 ? t('goals.task') : t('goals.tasks')}`}
          />
        ))}
      </div>
    </div>
  );
};

function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}
