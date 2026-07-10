import { toast } from 'sonner';
import { useTranslation } from '@/providers/useLocale';

interface DailySummaryToastProps {
  state: 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low';
  shown: boolean;
}

/** Side-effect helper — call with today's state from `DailySummary`.
 * Skips if `shown === true` so the daily summary appears once per day.
 */
export const useDailySummaryToast = () => {
  const { t } = useTranslation();
  return (state: DailySummaryToastProps['state'], shown: boolean) => {
    if (shown) return;
    toast(t(`dashboard.dayState.${state}`), {
      description: t('dashboard.dailySummaryTeaser'),
      duration: 6000,
    });
  };
};
