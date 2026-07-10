import { Clock, Zap } from 'lucide-react';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { ProgressBar } from './ProgressBar';
import type { CapacityData } from '../api/dashboardApi';

interface CapacityGaugeProps {
  capacity: CapacityData;
}

export const CapacityGauge = ({ capacity }: CapacityGaugeProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const planned = capacity.totalPlannedMinutes;
  const total = Math.max(1, capacity.totalCapacityMinutes);
  const ratio = (planned / total) * 100;

  const hours = Math.floor(planned / 60);
  const mins = planned % 60;
  const capH = Math.floor(capacity.totalCapacityMinutes / 60);
  const capM = capacity.totalCapacityMinutes % 60;

  const plannedLabel = locale === 'ar'
    ? `${hours} س ${mins} د`
    : `${hours}h ${mins}m`;
  const capLabel = locale === 'ar'
    ? `${capH} س ${capM} د`
    : `${capH}h ${capM}m`;

  const overloaded = planned > capacity.totalCapacityMinutes;
  const suggestions = planned / Math.max(1, capacity.totalCapacityMinutes) < 0.3;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
          <Clock size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('dashboard.capacity')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('dashboard.capacityHelper', { planned: plannedLabel, capacity: capLabel })}
          </p>
        </div>
      </div>

      <ProgressBar percent={ratio} />

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Zap size={12} className="text-amber-500" />
        <span>{t('dashboard.plannedOf', { planned: plannedLabel, capacity: capLabel })}</span>
      </div>

      {overloaded && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg">
          {t('dashboard.overload')}
        </p>
      )}

      {suggestions && (
        <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg">
          {t('dashboard.suggestion')}
        </p>
      )}
    </div>
  );
};
