import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import { useCreateGoal, useUpdateGoal } from '../hooks/useGoals';
import { Goal, GOAL_CATEGORY_LABELS, GoalCategory, MilestoneDraft } from '../types';
import { addDays, format, parse } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';
import { useApiErrorHandler } from '@/shared/hooks/useApiErrorHandler';

const MIN_WEEKS = 1;
const MAX_WEEKS = 52;
const DATE_FMT = 'yyyy-MM-dd';

const milestoneDraftSchema = z.object({
  title: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category: z.enum(['education_work', 'family', 'health', 'religion_spirituality', 'other']),
    customCategory: z.string().optional(),
    targetPoints: z
      .number('Target points is required')
      .int('Target points must be a whole number')
      .min(1, 'Target points must be at least 1')
      .max(100000, 'That is too many points'),
    relevance: z.string().optional(),
    cycleStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
    cycleWeeks: z
      .number('Cycle length is required')
      .int()
      .min(MIN_WEEKS, `Cycle must be at least ${MIN_WEEKS} week`)
      .max(MAX_WEEKS, `Cycle can be at most ${MAX_WEEKS} weeks`),
    cycleEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
    milestoneDrafts: z.array(milestoneDraftSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.category === 'other') {
        return !!data.customCategory && data.customCategory.trim().length > 0;
      }
      return true;
    },
    { message: 'Custom category is required', path: ['customCategory'] },
  );

type FormValues = z.infer<typeof formSchema>;

/** Which wizard step each field belongs to, for per-step validation and jump-to-error on submit. */
const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  0: ['title', 'category', 'customCategory'],
  1: ['targetPoints', 'cycleStart', 'cycleWeeks', 'cycleEnd'],
  2: ['milestoneDrafts'],
};

const stepForField = (field: string): number => {
  for (const [step, fields] of Object.entries(STEP_FIELDS)) {
    if (fields.some((f) => field === f || field.startsWith(`${f}.`))) return Number(step);
  }
  return 0;
};

/** Chunks a cycle into segments of `segmentWeeks`, the last segment absorbing any remainder. */
const generateMilestoneSegments = (
  cycleStartStr: string,
  totalWeeks: number,
  segmentWeeks: number,
  labelFor: (index: number) => string,
): MilestoneDraft[] => {
  if (segmentWeeks <= 0) return [];
  const cycleStart = parse(cycleStartStr, DATE_FMT, new Date());
  if (isNaN(cycleStart.getTime())) return [];

  const segments: MilestoneDraft[] = [];
  let weekCursor = 0;
  let index = 1;
  while (weekCursor < totalWeeks) {
    const span = Math.min(segmentWeeks, totalWeeks - weekCursor);
    const start = addDays(cycleStart, weekCursor * 7);
    const end = addDays(cycleStart, (weekCursor + span) * 7 - 1);
    segments.push({
      title: labelFor(index),
      startDate: format(start, DATE_FMT),
      endDate: format(end, DATE_FMT),
    });
    weekCursor += span;
    index += 1;
  }
  return segments;
};

interface GoalWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
}

export const GoalWizard: React.FC<GoalWizardProps> = ({ isOpen, onClose, editGoal }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white dark:bg-background-paper rounded-2xl shadow-2xl w-full max-w-2xl h-[min(700px,90vh)] overflow-hidden animate-scale-in flex flex-col border border-gray-100 dark:border-gray-800">
        <WizardBody editGoal={editGoal ?? null} onClose={onClose} />
      </div>
    </div>
  );
};

const WizardBody: React.FC<{ editGoal: Goal | null; onClose: () => void }> = ({
  editGoal,
  onClose,
}) => {
  const { t, locale } = useTranslation();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const handleError = useApiErrorHandler();
  const isEdit = !!editGoal;

  const typedLocale = locale as 'ar' | 'en';

  // Cycle dates/milestones are immutable after creation (12 Week Year discipline) —
  // editing only ever touches the basics + points pool, so the edit flow is single-step.
  const STEPS = isEdit ? (['basics'] as const) : (['basics', 'cycle', 'milestones'] as const);

  const today = new Date();
  const defaultStart = format(today, DATE_FMT);
  const defaultCycleWeeks = 12;
  const defaultEnd = format(addDays(today, defaultCycleWeeks * 7), DATE_FMT);
  const defaultSegmentWeeks = 4;

  const [step, setStep] = useState(0);
  const [cyclePreset, setCyclePreset] = useState<12 | 8 | 4 | 'custom'>(12);
  const [segmentPreset, setSegmentPreset] = useState<4 | 2 | 'custom' | 'none'>(4);
  const [customSegmentWeeks, setCustomSegmentWeeks] = useState(4);

  const milestoneLabel = (index: number) => t('goals.milestoneDefaultTitle', { index });

  // Tracks the cycleStart/cycleWeeks that milestoneDrafts was last generated from, so
  // that changing the cycle length in step 1 after already visiting step 3 doesn't
  // leave milestone date ranges stale (extending past the new cycleEnd, or falling
  // short of it).
  const lastGeneratedRef = useRef({ start: defaultStart, weeks: defaultCycleWeeks });

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      title: editGoal?.title ?? '',
      description: editGoal?.description ?? '',
      category: editGoal?.category ?? 'education_work',
      customCategory: editGoal?.customCategory ?? '',
      targetPoints: editGoal?.targetPoints ?? 100,
      relevance: editGoal?.relevance ?? '',
      cycleStart: editGoal
        ? format(new Date(editGoal.cycleStart), DATE_FMT)
        : defaultStart,
      cycleWeeks: defaultCycleWeeks,
      cycleEnd: editGoal
        ? format(new Date(editGoal.cycleEnd), DATE_FMT)
        : defaultEnd,
      milestoneDrafts: isEdit
        ? []
        : generateMilestoneSegments(defaultStart, defaultCycleWeeks, defaultSegmentWeeks, milestoneLabel),
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = methods;
  const category = watch('category');
  const cycleStart = watch('cycleStart');
  const cycleWeeks = watch('cycleWeeks');
  const customCategory = watch('customCategory');

  useEffect(() => {
    if (category !== 'other' && (customCategory ?? '').length > 0) {
      setValue('customCategory', '');
    }
  }, [category, customCategory, setValue]);

  const applyCycleWeeks = (weeks: number) => {
    setValue('cycleWeeks', weeks, { shouldValidate: true });
    if (cycleStart) {
      const start = parse(cycleStart, DATE_FMT, new Date());
      if (!isNaN(start.getTime())) {
        setValue('cycleEnd', format(addDays(start, weeks * 7), DATE_FMT), { shouldValidate: true });
      }
    }
  };

  const handleCycleStartChange = (value: string) => {
    setValue('cycleStart', value, { shouldValidate: true });
    const start = parse(value, DATE_FMT, new Date());
    if (!isNaN(start.getTime())) {
      setValue('cycleEnd', format(addDays(start, cycleWeeks * 7), DATE_FMT), { shouldValidate: true });
    }
  };

  const regenerateMilestones = (segmentWeeks: number) => {
    replace(generateMilestoneSegments(cycleStart, cycleWeeks, segmentWeeks, milestoneLabel));
    lastGeneratedRef.current = { start: cycleStart, weeks: cycleWeeks };
  };

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields as (keyof FormValues)[]);
    if (!valid) return;

    // Entering the milestones step: if the cycle changed since drafts were last
    // generated, regenerate from the current preset so date ranges stay in sync
    // with the (possibly new) cycleStart/cycleWeeks instead of silently going stale.
    if (
      step === 1 &&
      segmentPreset !== 'none' &&
      (lastGeneratedRef.current.start !== cycleStart || lastGeneratedRef.current.weeks !== cycleWeeks)
    ) {
      const weeks = segmentPreset === 'custom' ? customSegmentWeeks : segmentPreset;
      regenerateMilestones(weeks);
    }

    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return; // allow newlines
    if (step < STEPS.length - 1) {
      e.preventDefault();
      void handleNext();
    }
    // On the final step Enter is allowed to submit normally.
  };

  const onInvalid = (errs: FieldErrors<FormValues>) => {
    const firstField = Object.keys(errs)[0];
    if (firstField) setStep(stepForField(firstField));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit && editGoal) {
        await updateGoal.mutateAsync({
          id: editGoal._id,
          input: {
            title: data.title,
            description: data.description,
            category: data.category,
            customCategory: data.category === 'other' ? data.customCategory : undefined,
            targetPoints: data.targetPoints,
            relevance: data.relevance,
          },
        });
      } else {
        const milestones = (data.milestoneDrafts ?? [])
          .filter((m) => m.title.trim().length > 0)
          .map((m) => ({
            title: m.title.trim(),
            startDate: m.startDate || undefined,
            endDate: m.endDate || undefined,
          }));
        await createGoal.mutateAsync({
          title: data.title,
          description: data.description,
          category: data.category,
          customCategory: data.category === 'other' ? data.customCategory : undefined,
          targetPoints: data.targetPoints,
          relevance: data.relevance,
          cycleStart: data.cycleStart,
          cycleEnd: data.cycleEnd,
          milestones: milestones.length > 0 ? milestones : undefined,
        });
      }
      toast.success(t('goals.saved'));
      onClose();
    } catch (e) {
      handleError(e, {
        title: isEdit ? 'goals.errors.updateFailed' : 'goals.errors.createFailed',
      });
    }
  };

  const { control } = methods;
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'milestoneDrafts' });

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={18} className="text-brand-500" />
          {isEdit ? t('goals.editGoal') : t('goals.newGoal')}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400"
          aria-label={t('common.cancel')}
        >
          <X size={20} />
        </button>
      </div>

      {STEPS.length > 1 && (
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 shrink-0 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  step >= i ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-semibold whitespace-nowrap',
                  step === i ? 'text-brand-700 dark:text-brand-300' : 'text-gray-400',
                )}
              >
                {t(`goals.wizardStep${i + 1}`)}
              </span>
              {i < STEPS.length - 1 && <span className="w-8 h-px bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" />}
            </div>
          ))}
        </div>
      )}

      <FormProvider {...methods}>
        <form
          id="goal-wizard-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          onKeyDown={handleFormKeyDown}
          className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5"
        >
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.title')}
                </label>
                <Input placeholder={t('goals.titlePlaceholder')} {...register('title')} autoFocus />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.category')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(GOAL_CATEGORY_LABELS) as GoalCategory[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('category', c, { shouldValidate: true })}
                      className={cn(
                        'min-h-[44px] px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors',
                        category === c
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                      )}
                    >
                      {GOAL_CATEGORY_LABELS[c][typedLocale]}
                    </button>
                  ))}
                </div>
                {category === 'other' && (
                  <Input {...register('customCategory')} placeholder={t('goals.customCategory')} className="mt-3" autoFocus />
                )}
                {errors.customCategory && (
                  <p className="text-xs text-red-500 mt-1">{errors.customCategory.message}</p>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.relevance')}
                </label>
                <Textarea {...register('relevance')} placeholder={t('goals.relevancePlaceholder')} className="min-h-[80px]" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.description')}
                </label>
                <Textarea {...register('description')} placeholder={t('goals.descriptionPlaceholder')} className="min-h-[80px]" />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.targetPoints')}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100000}
                  placeholder={t('goals.targetPointsPlaceholder')}
                  {...register('targetPoints', { valueAsNumber: true })}
                  className="w-40"
                />
                <p className="text-[11px] text-gray-400 mt-1">{t('goals.targetPointsHelper')}</p>
                {errors.targetPoints && (
                  <p className="text-xs text-red-500 mt-1">{errors.targetPoints.message}</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('goals.cycleHelper')}</p>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.cycleDurationLabel')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {([12, 8, 4] as const).map((weeks) => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => {
                        setCyclePreset(weeks);
                        applyCycleWeeks(weeks);
                      }}
                      className={cn(
                        'min-h-[40px] px-4 rounded-xl border text-sm font-semibold transition-colors',
                        cyclePreset === weeks
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                      )}
                    >
                      {t('goals.cyclePresetWeeks', { count: weeks })}
                      {weeks === 12 && (
                        <span className="block text-[10px] font-normal opacity-70">
                          {t('goals.cyclePresetDefault')}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCyclePreset('custom')}
                    className={cn(
                      'min-h-[40px] px-4 rounded-xl border text-sm font-semibold transition-colors',
                      cyclePreset === 'custom'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {t('goals.cyclePresetCustom')}
                  </button>
                </div>

                {cyclePreset === 'custom' && (
                  <div className="mt-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                      {t('goals.cycleWeeksLabel')}
                    </label>
                    <Input
                      type="number"
                      min={MIN_WEEKS}
                      max={MAX_WEEKS}
                      className="w-32"
                      value={cycleWeeks}
                      onChange={(e) => applyCycleWeeks(Number(e.target.value) || MIN_WEEKS)}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">{t('goals.cycleWeeksHelper')}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <label className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      {t('goals.cycleStart')}
                    </span>
                    <Input
                      type="date"
                      value={cycleStart}
                      onChange={(e) => handleCycleStartChange(e.target.value)}
                    />
                  </label>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      {t('goals.cycleEnd')}
                    </span>
                    <div className="h-10 flex items-center px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-300">
                      {t('goals.cycleEndComputed', { date: watch('cycleEnd') })}
                    </div>
                  </div>
                </div>
                {errors.cycleWeeks && (
                  <p className="text-xs text-red-500 mt-1">{errors.cycleWeeks.message}</p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.milestoneSegmentLabel')}
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('goals.milestonesHelper')}</p>
                <div className="flex flex-wrap gap-2">
                  {([4, 2] as const).map((weeks) => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => {
                        setSegmentPreset(weeks);
                        regenerateMilestones(weeks);
                      }}
                      className={cn(
                        'min-h-[40px] px-4 rounded-xl border text-sm font-semibold transition-colors',
                        segmentPreset === weeks
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                      )}
                    >
                      {t('goals.milestoneSegmentEvery', { count: weeks })}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSegmentPreset('custom')}
                    className={cn(
                      'min-h-[40px] px-4 rounded-xl border text-sm font-semibold transition-colors',
                      segmentPreset === 'custom'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {t('goals.milestoneSegmentCustom')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSegmentPreset('none');
                      replace([]);
                    }}
                    className={cn(
                      'min-h-[40px] px-4 rounded-xl border text-sm font-semibold transition-colors',
                      segmentPreset === 'none'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {t('goals.milestoneSegmentNone')}
                  </button>
                </div>

                {segmentPreset === 'custom' && (
                  <div className="flex items-end gap-2 mt-3">
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        {t('goals.milestoneSegmentWeeksLabel')}
                      </span>
                      <Input
                        type="number"
                        min={1}
                        max={cycleWeeks}
                        className="w-28"
                        value={customSegmentWeeks}
                        onChange={(e) => setCustomSegmentWeeks(Number(e.target.value) || 1)}
                      />
                    </label>
                    <Button type="button" variant="secondary" size="sm" onClick={() => regenerateMilestones(customSegmentWeeks)}>
                      {t('goals.milestoneSegmentGenerate')}
                    </Button>
                  </div>
                )}
              </div>

              <MilestoneDraftList fields={fields} append={append} remove={remove} />
              <p className="text-[11px] text-gray-400 italic">{t('goals.milestonesOptional')}</p>
            </div>
          )}
        </form>
      </FormProvider>

      <div className="flex justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          {t('common.back')}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" variant="primary" onClick={handleNext}>
            {t('common.next')}
          </Button>
        ) : (
          <Button type="submit" form="goal-wizard-form" variant="primary" isLoading={isSubmitting}>
            {isEdit ? t('common.save') : t('common.confirm')}
          </Button>
        )}
      </div>
    </>
  );
};

type MilestoneFieldArray = ReturnType<typeof useFieldArray<FormValues, 'milestoneDrafts'>>;

const MilestoneDraftList: React.FC<{
  fields: MilestoneFieldArray['fields'];
  append: MilestoneFieldArray['append'];
  remove: MilestoneFieldArray['remove'];
}> = ({ fields, append, remove }) => {
  const { t, locale } = useTranslation();
  const { register, watch } = useFormContext<FormValues>();
  const titleRef = useRef<HTMLInputElement | null>(null);

  const formatRange = (from?: string, to?: string) => {
    if (!from || !to) return null;
    try {
      const fromLabel = format(parse(from, DATE_FMT, new Date()), locale === 'ar' ? 'd MMM' : 'MMM d');
      const toLabel = format(parse(to, DATE_FMT, new Date()), locale === 'ar' ? 'd MMM' : 'MMM d');
      return t('goals.milestoneRange', { from: fromLabel, to: toLabel });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-2">
      {fields.map((field, i) => {
        const range = formatRange(watch(`milestoneDrafts.${i}.startDate`), watch(`milestoneDrafts.${i}.endDate`));
        return (
          <div
            key={field.id}
            className="flex items-center gap-2 group bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 text-brand-600 dark:text-brand-300 text-[10px] font-bold">
              {i + 1}
            </div>
            <Input
              {...register(`milestoneDrafts.${i}.title` as const)}
              placeholder={t('goals.milestonePlaceholder')}
              ref={(el) => {
                titleRef.current = el;
                register(`milestoneDrafts.${i}.title` as const).ref(el);
              }}
              className="flex-1 h-8 text-sm bg-transparent border-transparent focus:bg-transparent px-2 placeholder:text-gray-400 font-medium min-w-0"
              autoComplete="off"
            />
            {range && (
              <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">{range}</span>
            )}
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
              aria-label={t('common.delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        leftIcon={<Plus size={14} />}
        onClick={() => append({ title: '' })}
        className="w-full text-brand-600 dark:text-brand-300 border-2 border-dashed border-brand-200 dark:border-brand-800"
      >
        {t('goals.addMilestone')}
      </Button>
    </div>
  );
};
