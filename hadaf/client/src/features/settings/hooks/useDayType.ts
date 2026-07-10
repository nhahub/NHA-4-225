import { useLocale } from '@/providers/useLocale';
import type { UserSettings } from '../api/settingsApi';

export type DayType = 'work' | 'light' | 'off';

/**
 * Resolve the effective day type for "today" from server settings:
 *   - off_days weekday match        → 'off'
 *   - manual override (future state) → that value
 *   - default                       → 'work'
 */
export function resolveDayType(settings: UserSettings | undefined, today: Date): DayType {
  if (!settings) return 'work';
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  if (settings.off_days?.includes(weekday)) return 'off';
  return 'work';
}

export const DAY_TYPE_LABELS: Record<DayType, { ar: string; en: string }> = {
  work: { ar: 'يوم عمل', en: 'Work day' },
  light: { ar: 'يوم خفيف', en: 'Light day' },
  off: { ar: 'إجازة', en: 'Day off' },
};

export function dayTypeLabel(dayType: DayType, locale: 'ar' | 'en') {
  return DAY_TYPE_LABELS[dayType][locale];
}

export function useDayTypeLabel() {
  const { locale } = useLocale();
  return (dayType: DayType) => dayTypeLabel(dayType, locale);
}
