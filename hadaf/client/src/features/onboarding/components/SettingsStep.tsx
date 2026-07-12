import { useEffect, useMemo, useState } from 'react';
import { Calendar, ListTodo } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation, useLocale } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { useSettings, useUpdateSettings } from '@/features/settings/hooks/useSettings';
import { useCreateTask } from '@/features/tasks/hooks/useTasks';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { completeOnboarding } from '../api/onboardingApi';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';

const WEEKDAYS = [
  { value: 'sunday' },
  { value: 'monday' },
  { value: 'tuesday' },
  { value: 'wednesday' },
  { value: 'thursday' },
  { value: 'friday' },
  { value: 'saturday' },
] as const;

interface SettingsStepProps {
  goalId: string | null;
  goalTitle: string;
  onComplete: () => void;
  onBack: () => void;
}

/**
 * ONB-3 — Step 3 of the onboarding wizard.
 *
 * Captures (a) a condensed settings slice (work hours + off-days only)
 * and (b) a quick-create first task pre-filled from the ONB-1 goal.
 *
 * On submit (in order):
 *   1. PATCH /api/user/settings with the work-hours + off-days patch.
 *   2. POST /api/tasks with the pre-filled title + goalId from ONB-1.
 *   3. POST /api/user/onboarding/complete → flips onboardingCompleted,
 *      writes the onboarding_complete AnalyticsEvent, returns the user.
 *   4. Push the returned user into the Zustand auth store via setState
 *      so RequireOnboarding flips to "/" without a separate /auth/refresh.
 *
 * Then `onComplete()` is called; the wizard swaps to CompletionStep.
 */
export const SettingsStep = ({ goalId, goalTitle, onComplete, onBack }: SettingsStepProps) => {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const createTask = useCreateTask();

  const [workStart, setWorkStart] = useState<string>(settings?.work_hours_start ?? '09:00');
  const [workEnd, setWorkEnd] = useState<string>(settings?.work_hours_end ?? '17:00');
  const [offDays, setOffDays] = useState<string[]>(settings?.off_days ?? ['friday', 'saturday']);
  const [taskTitle, setTaskTitle] = useState<string>(goalTitle);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setWorkStart(settings.work_hours_start);
    setWorkEnd(settings.work_hours_end);
    setOffDays(settings.off_days);
  }, [settings]);

  const weekdayLabel = useMemo(() => {
    const map: Record<string, { ar: string; en: string }> = {
      sunday: { ar: 'الأحد', en: 'Sun' },
      monday: { ar: 'الإثنين', en: 'Mon' },
      tuesday: { ar: 'الثلاثاء', en: 'Tue' },
      wednesday: { ar: 'الأربعاء', en: 'Wed' },
      thursday: { ar: 'الخميس', en: 'Thu' },
      friday: { ar: 'الجمعة', en: 'Fri' },
      saturday: { ar: 'السبت', en: 'Sat' },
    };
    return (value: string) => {
      const entry = map[value];
      if (!entry) return value;
      return locale === 'ar' ? entry.ar : entry.en;
    };
  }, [locale]);

  const toggleOffDay = (value: string) => {
    setOffDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );
  };

  const finish = async () => {
    if (!goalId) {
      toast.error(t('onboarding.taskStep.goalFixedMissing'));
      return;
    }
    if (!taskTitle.trim()) {
      toast.error(t('onboarding.taskStep.taskTitleLabel'));
      return;
    }
    setSubmitting(true);
    try {
      await updateSettings.mutateAsync({
        work_hours_start: workStart,
        work_hours_end: workEnd,
        off_days: offDays,
      });

      const todayStr = format(new Date(), 'yyyy-MM-dd');
      await createTask.mutateAsync({
        title: taskTitle.trim(),
        goalId,
        date: todayStr,
      });

      const res = await completeOnboarding();
      const returnedUser = res.user;
      if (returnedUser) {
        useAuthStore.setState({ user: returnedUser });
      }

      onComplete();
    } catch {
      toast.error(t('onboarding.errors.completeFailed'));
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('onboarding.settingsStep.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t('onboarding.settingsStep.body')}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-brand-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {t('onboarding.settingsStep.workStart')} · {t('onboarding.settingsStep.workEnd')}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t('onboarding.settingsStep.workStart')}
            </span>
            <Input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              inputSize="sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
              {t('onboarding.settingsStep.workEnd')}
            </span>
            <Input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              inputSize="sm"
            />
          </label>
        </div>
        <div>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
            {t('onboarding.settingsStep.offDays')}
          </span>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((d) => {
              const active = offDays.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleOffDay(d.value)}
                  className={cn(
                    'min-h-[44px] px-4 py-2 rounded-full border text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-300',
                  )}
                  aria-pressed={active}
                >
                  {weekdayLabel(d.value)}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            {t('onboarding.settingsStep.offDaysHelper')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ListTodo size={16} className="text-brand-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {t('onboarding.taskStep.title')}
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t('onboarding.taskStep.body')}
        </p>
        <Input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder={t('onboarding.taskStep.taskTitlePlaceholder')}
          aria-label={t('onboarding.taskStep.taskTitleLabel')}
        />
        {goalId ? (
          <p className="text-[11px] text-brand-600 dark:text-brand-300">
            {t('onboarding.taskStep.goalFixedHelper', { title: goalTitle })}
          </p>
        ) : (
          <p className="text-[11px] text-red-500">
            {t('onboarding.taskStep.goalFixedMissing')}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          {t('onboarding.back')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={finish}
          isLoading={submitting}
          disabled={submitting || !goalId || !taskTitle.trim()}
        >
          {t('onboarding.finishAndContinue')}
        </Button>
      </div>
    </div>
  );
};