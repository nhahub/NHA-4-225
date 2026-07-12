// src/shared/utils/errorHandler.ts
//
// POL-3 — bilingual, retry-capable error toast helper.
//
// `handleApiError(error, t, options?)` — leaf function that resolves the
// server-emitted `i18nKey` via the caller's `t()` and emits a localized
// sonner toast with an optional retry action.
//
// Pair with the `useApiErrorHandler` hook (in `shared/hooks`) inside
// `useMutation({ onError })` for the common case — the hook pulls `t`
// out of the active LocaleProvider.
import { toast } from 'sonner';
import { ApiError } from '@/shared/lib/api-client';

export interface ToastAdapter {
  /** Resolve a dotted key against the active dictionary. Falls back to the key. */
  t: (key: string) => string;
}

export interface HandleApiErrorOptions {
  /**
   * Optional retry callback. When provided, the toast renders a
   * "Try again" / "حاول مرة أخرى" action. Per POL-3 every mutation
   * surface with a meaningful retry path should pass one.
   */
  retry?: () => void;
  /**
   * Override the i18n title key. Defaults to the server-emitted
   * `ApiError.i18nKey`, which is already a dotted key like
   * `errors.networkError` or `goals.errors.notFound`.
   */
  title?: string;
}

const NETWORK_KEY = 'errors.networkError';

const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

export const handleApiError = (
  error: unknown,
  adapter: ToastAdapter,
  options?: HandleApiErrorOptions,
): void => {
  const apiErr = isApiError(error) ? error : null;
  const fallbackTitle = adapter.t('pol.errors.genericTitle');
  const title = options?.title
    ? adapter.t(options.title)
    : (apiErr?.i18nKey ?? fallbackTitle);

  const description =
    apiErr?.i18nKey === NETWORK_KEY || (typeof navigator !== 'undefined' && !navigator.onLine)
      ? adapter.t('pol.errors.networkFallback')
      : apiErr?.field
      ? `${apiErr.field}`
      : undefined;

  toast.error(title, {
    description,
    action: options?.retry
      ? { label: adapter.t('pol.errors.retry'), onClick: () => options.retry?.() }
      : undefined,
  });

  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
};
