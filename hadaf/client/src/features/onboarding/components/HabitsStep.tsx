import { useMemo, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useCreateHabit } from '@/features/habits/hooks/useHabits';
import { SUGGESTED_HABITS, type SuggestedHabit } from '@/shared/constants/suggestedHabits';
import { cn } from '@/shared/utils/cn';

interface SelectedHabit {
  suggestion: SuggestedHabit;
  mvdValue: number | null;
  mvdDescription: string;
}

interface HabitsStepProps {
  onComplete: (habitIds: string[]) => void;
  onBack: () => void;
}

/**
 * ONB-2 — Step 2 of the onboarding wizard.
 *
 * Skippable: creating zero habits is a valid outcome, so we surface
 * both a "Skip this step" affordance AND allow advancing with nothing
 * selected. Real Habit documents are created via the E3-1 endpoint
 * (`POST /api/habits`) — no onboarding-specific shape.
 *
 * Per the PRD's FR36.1 restriction, `SUGGESTED_HABITS` deliberately
 * contains zero `religion_spirituality` entries; spiritual habits are
 * still creatable manually elsewhere via the regular habit flow.
 */
export const HabitsStep = ({ onComplete, onBack }: HabitsStepProps) => {
  const { t } = useTranslation();
  const createHabit = useCreateHabit();

  const [selected, setSelected] = useState<Record<string, SelectedHabit>>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedList = useMemo(() => Object.values(selected), [selected]);
  const selectedCount = selectedList.length;

  const toggleChip = (suggestion: SuggestedHabit) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[suggestion.i18nKey]) {
        delete next[suggestion.i18nKey];
      } else {
        next[suggestion.i18nKey] = {
          suggestion,
          mvdValue: suggestion.defaultTarget ?? null,
          mvdDescription: '',
        };
      }
      return next;
    });
  };

  const updateMvd = (key: string, patch: Partial<SelectedHabit>) => {
    setSelected((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return { ...prev, [key]: { ...existing, ...patch } };
    });
  };

  const skip = () => {
    onComplete([]);
  };

  const finish = async () => {
    if (selectedList.length === 0) {
      onComplete([]);
      return;
    }
    setSubmitting(true);
    try {
      const created = await Promise.all(
        selectedList.map((entry) =>
          createHabit.mutateAsync({
            title: t(`onboarding.suggestedHabits.${entry.suggestion.i18nKey}`),
            category: entry.suggestion.category,
            type: entry.suggestion.type,
            targetValue: entry.suggestion.defaultTarget,
            mvdValue: entry.mvdValue ?? undefined,
            mvdDescription: entry.mvdDescription.trim() || undefined,
          }),
        ),
      );
      onComplete(created.map((h) => h._id));
    } catch {
      toast.error(t('onboarding.habitsStep.createError'));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('onboarding.habitsStep.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('onboarding.habitsStep.body')}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_HABITS.map((suggestion) => {
          const isSelected = !!selected[suggestion.i18nKey];
          const label = t(`onboarding.suggestedHabits.${suggestion.i18nKey}`);
          return (
            <button
              key={suggestion.i18nKey}
              type="button"
              onClick={() => toggleChip(suggestion)}
              className={cn(
                'min-h-[44px] px-4 py-2 rounded-full border text-sm font-semibold transition-colors flex items-center gap-2',
                isSelected
                  ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20',
              )}
              aria-pressed={isSelected}
            >
              {isSelected && <Check size={14} />}
              <span>{t('onboarding.habitsStep.chipLabel', { title: label })}</span>
            </button>
          );
        })}
      </div>

      {selectedCount === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {t('onboarding.habitsStep.noneSelected')}
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-brand-600 dark:text-brand-300 flex items-center gap-1">
            <Sparkles size={12} />
            {t('onboarding.habitsStep.selectedCount', { count: selectedCount })}
          </p>
          {selectedList.map((entry) => {
            const label = t(`onboarding.suggestedHabits.${entry.suggestion.i18nKey}`);
            const suggestedMvdLabel = entry.suggestion.suggestedMvd
              ? t(`onboarding.suggestedHabits.${entry.suggestion.suggestedMvd}`)
              : '';
            return (
              <div
                key={entry.suggestion.i18nKey}
                className="rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-900/10 p-4 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="font-bold text-gray-900 dark:text-white">{label}</span>
                  <button
                    type="button"
                    onClick={() => toggleChip(entry.suggestion)}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors min-h-[44px] px-2"
                  >
                    {t('common.cancel')}
                  </button>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1">
                    {t('onboarding.habitsStep.mvdTitle')}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {t('onboarding.habitsStep.mvdHelper')}
                    {suggestedMvdLabel ? <> · <span className="italic">{suggestedMvdLabel}</span></> : null}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      type="number"
                      min={0}
                      value={entry.mvdValue ?? ''}
                      onChange={(e) =>
                        updateMvd(entry.suggestion.i18nKey, {
                          mvdValue: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      placeholder={suggestedMvdLabel || '0'}
                      inputSize="sm"
                      aria-label={t('onboarding.habitsStep.mvdTitle')}
                    />
                    <div className="md:col-span-2">
                      <Input
                        value={entry.mvdDescription}
                        onChange={(e) =>
                          updateMvd(entry.suggestion.i18nKey, { mvdDescription: e.target.value })
                        }
                        placeholder={t('onboarding.habitsStep.mvdPlaceholder')}
                        inputSize="sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        {t('onboarding.habitsStep.skipHelper')}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          {t('onboarding.back')}
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={skip} disabled={submitting}>
            {t('onboarding.skipStep')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={finish}
            isLoading={submitting}
            disabled={submitting}
          >
            {t('onboarding.next')}
          </Button>
        </div>
      </div>
    </div>
  );
};