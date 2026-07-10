import { useTranslation } from '@/providers/useLocale';

export type DayStateValue = 'legendary' | 'amazing' | 'perfect' | 'good_enough' | 'low';

const STATE_STYLES: Record<DayStateValue, { color: string; bg: string; ring: string; emoji: string }> = {
  legendary: {
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30',
    ring: 'ring-amber-300/50',
    emoji: '✨',
  },
  amazing: {
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-100 dark:bg-emerald-900/40',
    ring: 'ring-emerald-300/50',
    emoji: '🌟',
  },
  perfect: {
    color: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-100 dark:bg-blue-900/40',
    ring: 'ring-blue-300/50',
    emoji: '🎯',
  },
  good_enough: {
    color: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    ring: 'ring-teal-300/50',
    emoji: '🌱',
  },
  low: {
    color: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-100 dark:bg-orange-900/40',
    ring: 'ring-orange-300/50',
    emoji: '🌿',
  },
};

interface DayStateBadgeProps {
  state: DayStateValue;
  /** Override the title in the badge — useful when state-specific copy is more brand-aligned than the i18n default. */
  customTitle?: string;
}

export const DayStateBadge = ({ state, customTitle }: DayStateBadgeProps) => {
  const { t } = useTranslation();
  const styles = STATE_STYLES[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ring-1 ${styles.bg} ${styles.color} ${styles.ring}`}
    >
      <span aria-hidden="true">{styles.emoji}</span>
      {customTitle ?? t(`dashboard.dayState.${state}`)}
    </span>
  );
};
