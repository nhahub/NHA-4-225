import { Repeat, Flame, ShieldCheck } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { useTranslation } from '@/providers/useLocale';
import type { HabitAnalytics } from '../types';

interface HabitAnalyticsListProps {
  habits: HabitAnalytics[];
}

export const HabitAnalyticsList = ({ habits }: HabitAnalyticsListProps) => {
  const { t, locale } = useTranslation();
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar' : 'en');
  const pct = (v: number) =>
    `${nf.format(Math.round(v * 100))}${locale === 'ar' ? '٪' : '%'}`;

  if (habits.length === 0) {
    return (
      <p className="text-sm text-foreground-muted py-8 text-center">
        {t('analytics.habits.empty')}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {habits.map((habit) => (
        <Card key={habit.habitId} padding="md">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                  {habit.title}
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-foreground-muted shrink-0">
                  {t(`analytics.habits.type.${habit.type}`)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-foreground-muted">{t('analytics.habits.rate')}</span>
                <span className="font-bold text-foreground">{pct(habit.completionRate)}</span>
              </div>
              {/* Fills from inline-start — right in RTL. */}
              <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.round(habit.completionRate * 100)}%` }}
                />
              </div>
              {habit.mvdRate > 0 && (
                <p className="text-[11px] text-foreground-muted mt-1">
                  {t('analytics.habits.mvdShare', { pct: pct(habit.mvdRate) })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm shrink-0">
              {habit.type === 'quit' ? (
                <div className="flex items-center gap-1.5" title={t('analytics.habits.daysClean')}>
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="font-bold text-foreground">
                    {habit.daysSinceRelapse !== null ? nf.format(habit.daysSinceRelapse) : '—'}
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {t('analytics.habits.daysClean')}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5" title={t('analytics.habits.currentStreak')}>
                    <Flame size={16} className="text-amber-500" />
                    <span className="font-bold text-foreground">{nf.format(habit.currentStreak)}</span>
                    <span className="text-xs text-foreground-muted">
                      {t('analytics.habits.currentStreak')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" title={t('analytics.habits.longestStreak')}>
                    <Repeat size={16} className="text-brand-500" />
                    <span className="font-bold text-foreground">{nf.format(habit.longestStreak)}</span>
                    <span className="text-xs text-foreground-muted">
                      {t('analytics.habits.longestStreak')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {habit.relapses.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-[11px] text-foreground-muted mb-1.5">
                {t('analytics.habits.relapse', { count: nf.format(habit.relapses.length) })}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {habit.relapses.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    title={date}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    {new Intl.DateTimeFormat(locale === 'ar' ? 'ar' : 'en', {
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(`${date}T00:00:00`))}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
