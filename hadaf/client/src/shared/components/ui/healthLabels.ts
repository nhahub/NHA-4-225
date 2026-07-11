import type { Locale } from '@/providers/LocaleContextValue';
import type { HealthLevel } from './healthTokens';

export const HEALTH_LABEL: Record<HealthLevel, Record<Locale, string>> = {
  green: { ar: 'ممتاز', en: 'On track' },
  yellow: { ar: 'جيد', en: 'Good' },
  orange: { ar: 'متأخر', en: 'Falling behind' },
  red: { ar: 'يحتاج انتباه', en: 'Needs attention' },
};
