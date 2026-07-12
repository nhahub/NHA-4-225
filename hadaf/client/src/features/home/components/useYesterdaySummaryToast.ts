import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { subDays, format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from '@/providers/useLocale';
import { markSummaryShown } from '../api/homeApi';
import { useApiErrorHandler } from '@/shared/hooks/useApiErrorHandler';

/**
 * HOME-1 yesterday's-summary toast.
 *
 * Computes yesterday's date client-side, calls
 * PATCH /daily-summaries/:date/summary-shown (which upserts the summary if
 * it doesn't exist), and fires a 3s toast when the server reports the flag
 * just transitioned from `false → true`. Subsequent calls within the same
 * day report `wasNewlyShown: false` and the toast is suppressed.
 *
 * Side-effect only — no return. Call once from HomePage once data is ready.
 */
export const useYesterdaySummaryToast = (isReady: boolean) => {
  const { t } = useTranslation();
  const handleError = useApiErrorHandler();
  const firedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (date: string) => markSummaryShown(date),
    onError: (err, date) =>
      handleError(err, {
        title: 'home.errors.summaryPingFailed',
        retry: () => markSummaryShown(date),
      }),
  });

  useEffect(() => {
    if (!isReady) return;
    if (firedRef.current) return;

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    firedRef.current = true;

    mutation.mutate(yesterday, {
      onSuccess: (res) => {
        if (res.wasNewlyShown) {
          toast(t('home.yesterday.title'), {
            description: t('home.yesterday.description'),
            duration: 3000,
          });
        }
      },
    });
  }, [isReady, mutation, t]);
};