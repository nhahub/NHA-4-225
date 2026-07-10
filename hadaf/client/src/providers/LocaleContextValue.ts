// Exported separately so LocaleProvider.tsx can stay component-only
// (required by react-refresh/only-export-components).
import { createContext } from 'react';

export type Locale = 'ar' | 'en';

export type TranslationParams = Record<string, string | number>;

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string, params?: string | TranslationParams) => string;
  formatNumber: (n: number) => string;
  formatDate: (date: Date | string | number) => string;
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);
