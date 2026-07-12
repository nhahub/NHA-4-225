import { useTranslation } from '@/providers/useLocale';
import { cn } from '@/shared/utils/cn';
import type { RangePreset } from '../types';

interface RangePickerProps {
  value: RangePreset;
  onChange: (preset: RangePreset) => void;
}

const PRESETS: RangePreset[] = [7, 30, 90];

export const RangePicker = ({ value, onChange }: RangePickerProps) => {
  const { t } = useTranslation();

  const label = (preset: RangePreset) =>
    preset === 7
      ? t('analytics.range.d7')
      : preset === 30
        ? t('analytics.range.d30')
        : t('analytics.range.d90');

  return (
    <div
      role="group"
      aria-label={t('analytics.range.label')}
      className="inline-flex rounded-xl border border-border bg-background-paper p-1 gap-1"
    >
      {PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => onChange(preset)}
          aria-pressed={value === preset}
          className={cn(
            'min-h-11 min-w-11 px-4 rounded-lg text-sm font-bold transition-colors',
            value === preset
              ? 'bg-brand-500 text-white'
              : 'text-foreground-muted hover:bg-brand-50 dark:hover:bg-brand-900/30',
          )}
        >
          {label(preset)}
        </button>
      ))}
    </div>
  );
};
