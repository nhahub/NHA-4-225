// src/shared/components/OfflineBanner.tsx
//
// POL-3 — persistent offline banner.
//
// Listens to `navigator.onLine` + the `online`/`offline` events on window.
// Renders a sticky bilingual banner at the top of the layout whenever the
// connection drops and dismisses itself once it returns. The supplied
// `onRetry` is called when the user taps the retry button — pass a stable
// refetch trigger (e.g. `queryClient.invalidateQueries`) or simply
// `() => window.location.reload()` if you want a guaranteed fresh state.

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';

interface OfflineBannerProps {
  /**
   * Triggered when the user taps "Retry". If omitted, the banner is
   * display-only (still dismisses itself when connectivity returns).
   */
  onRetry?: () => void;
}

export const OfflineBanner = ({ onRetry }: OfflineBannerProps) => {
  const { t } = useTranslation();
  const [offline, setOffline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? false : !navigator.onLine,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[2000] bg-amber-500 text-white text-sm shadow-md px-4 py-2 flex items-center justify-center gap-3 animate-fade-in"
    >
      <WifiOff size={16} aria-hidden="true" />
      <span className="font-semibold">{t('pol.offline.title')}</span>
      <span className="hidden sm:inline opacity-90">·</span>
      <span className="hidden sm:inline opacity-90">{t('pol.offline.body')}</span>
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 px-2 min-h-[32px]"
          leftIcon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          {t('pol.offline.retry')}
        </Button>
      )}
    </div>
  );
};
