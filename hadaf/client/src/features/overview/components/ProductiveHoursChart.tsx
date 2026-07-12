import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useTranslation } from '@/providers/useLocale';
import type { HourBucket } from '../types';

interface ProductiveHoursChartProps {
  hours: HourBucket[];
  unscheduledCompleted: number;
}

const formatHour = (hour: number, locale: string) =>
  new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    hour: 'numeric',
    hour12: true,
  }).format(new Date(2026, 0, 1, hour));

interface TooltipPayloadEntry {
  payload?: HourBucket;
}

const HoursTooltip = ({
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
  const bucket = payload[0].payload;
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
  return (
    <div className="rounded-xl border border-border bg-background-paper px-3 py-2 shadow-md text-xs space-y-1">
      <div className="font-bold text-foreground">{formatHour(bucket.hour, locale)}</div>
      <div className="text-foreground-muted">
        {t('analytics.hours.tasks')}: {nf.format(bucket.tasksCompleted)}
      </div>
      <div className="text-foreground-muted">
        {t('analytics.hours.minutes')}: {nf.format(bucket.minutes)}
      </div>
    </div>
  );
};

export const ProductiveHoursChart = ({
  hours,
  unscheduledCompleted,
}: ProductiveHoursChartProps) => {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');

  if (hours.length === 0) {
    return (
      <p className="text-sm text-foreground-muted py-8 text-center">
        {t('analytics.hours.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div style={{ height: 220 }} dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={hours}
            margin={{ top: 8, bottom: 0, left: isRTL ? 8 : 0, right: isRTL ? 0 : 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              reversed={isRTL}
              tickFormatter={(h: number) => formatHour(h, locale)}
              tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              orientation={isRTL ? 'right' : 'left'}
              width={32}
              tickFormatter={(v: number) => nf.format(v)}
              tick={{ fill: 'var(--color-foreground-muted)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<HoursTooltip />} cursor={{ fill: 'var(--color-border)', opacity: 0.3 }} />
            <Bar
              dataKey="tasksCompleted"
              fill="var(--color-brand-500)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {unscheduledCompleted > 0 && (
        <p className="text-xs text-foreground-muted">
          {t('analytics.hours.unscheduled', { count: nf.format(unscheduledCompleted) })}
        </p>
      )}
    </div>
  );
};
