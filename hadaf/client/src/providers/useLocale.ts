// Hooks for the LocaleProvider. Kept in their own file so the LocaleProvider
// module only exports components (the react-refresh ESLint rule requires it).
import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from './LocaleContextValue';

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within a <LocaleProvider>');
  }
  return ctx;
}

// Convenience hook — most components only need `t`.
export function useTranslation() {
  const { t } = useLocale();
  return { t };
}