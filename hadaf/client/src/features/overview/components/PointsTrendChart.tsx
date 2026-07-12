import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTranslation, useLocale } from '@/providers/useLocale';
import type { TrendDay } from '../types';

interface PointsTrendChartProps {
  trend: TrendDay[];
  /** Compact mode for the dashboard mini-card (no axes labels crowding). */
  compact?: boolean;
}

const formatDay = (dateStr: string, locale: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dateStr}T00:00:00`));

interface TooltipPayloadEntry {
  payload?: TrendDay;
}

const TrendTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) => {
  const { t, locale } = useTranslation();
  if (!active || !payload || payload.length === 0 || !payload[0].payload) {
    return null;
  }
  const day = payload[0].payload;
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
  return (
    <div className="rounded-xl border border-border bg-background-paper px-3 py-2 shadow-md text-xs space-y-1">
      <div className="font-bold text-foreground">{formatDay(day.date, locale)}</div>
      <div className="text-foreground-muted">
        {t('analytics.trend.points')}: {nf.format(day.points)}
      </div>
      <div className="text-foreground-muted">
        {t('analytics.trend.tasks')}: {nf.format(day.tasksCompleted)}
      </div>
      <div className="text-foreground-muted">
        {t('analytics.trend.habits')}: {nf.format(day.habitsCompleted)}
      </div>
    </div>
  );
};

export const PointsTrendChart = ({ trend, compact = false }: PointsTrendChartProps) => {
  const { locale } = useLocale();
  const isRTL = locale === 'ar';
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');

  return (
    <div style={{ height: compact ? 160 : 260 }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={trend}
          margin={{ top: 8, bottom: 0, left: isRTL ? 8 : 0, right: isRTL ? 0 : 8 }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            reversed={isRTL}
            tickFormatter={(d: string) => formatDay(d, locale)}
            tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            orientation={isRTL ? 'right' : 'left'}
            width={compact ? 28 : 36}
            tickFormatter={(v: number) => nf.format(v)}
            tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            domain={[0, 'auto']}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
          <Area
            type="monotone"
            dataKey="points"
            stroke="var(--color-brand-500)"
            strokeWidth={2}
            fill="url(#trendFill)"
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, fill: 'var(--color-brand-500)', stroke: 'var(--color-background)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
