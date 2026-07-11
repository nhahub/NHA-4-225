import type { Locale } from '@/providers/LocaleContextValue';
import { HEALTH_COLOR, type HealthLevel } from './healthTokens';
import { HEALTH_LABEL } from './healthLabels';

interface HealthDotProps {
  health: HealthLevel;
  size?: 'sm' | 'md';
  label?: boolean;
  locale?: Locale;
}

export type { HealthLevel };

export const HealthDot = ({ health, size = 'md', label = false, locale = 'en' }: HealthDotProps) => {
  const dot = HEALTH_COLOR[health];
  const dim = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${dot} ${dim} rounded-full ring-2 ring-white dark:ring-gray-900`} />
      {label && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {HEALTH_LABEL[health][locale]}
        </span>
      )}
    </span>
  );
};
