// src/shared/hooks/useApiErrorHandler.ts
//
// POL-3 — bilingual, retry-capable error toaster for every `useMutation`
// across the app. Returns a stable callback suitable for `onError`:
//
//   const handleError = useApiErrorHandler();
//   return useMutation({
//     mutationFn: ...,
//     onError: (err, vars, ctx) => handleError(err, { title: 'goals.overrideFailed' }),
//   });
//
// To attach a "Try again" action to the toast, pass
// `{ retry: () => mutation.mutate(vars) }`.

import { useCallback } from 'react';
import { useTranslation } from '@/providers/useLocale';
import { handleApiError, type HandleApiErrorOptions } from '@/shared/utils/errorHandler';

export type ApiErrorHandler = (error: unknown, options?: HandleApiErrorOptions) => void;

export const useApiErrorHandler = (): ApiErrorHandler => {
  const { t } = useTranslation();

  return useCallback<ApiErrorHandler>(
    (error, options) => {
      handleApiError(error, { t }, options);
    },
    [t],
  );
};
