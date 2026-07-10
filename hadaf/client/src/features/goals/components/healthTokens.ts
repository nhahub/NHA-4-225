import { GoalHealth } from '../types';
import type { Locale } from '@/providers/LocaleContextValue';

export const HEALTH_COLOR: Record<GoalHealth, string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
};

export const HEALTH_LABEL: Record<GoalHealth, Record<Locale, string>> = {
  green: { ar: 'ممتاز', en: 'On track' },
  yellow: { ar: 'جيد', en: 'Good' },
  orange: { ar: 'متأخر', en: 'Falling behind' },
  red: { ar: 'يحتاج انتباه', en: 'Needs attention' },
};
