import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, useFieldArray, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import { useCreateGoal, useUpdateGoal } from '../hooks/useGoals';
import { Goal, GOAL_CATEGORY_LABELS, GoalCategory } from '../types';
import { addDays, format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/shared/utils/cn';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['education_work', 'family', 'health', 'religion_spirituality', 'other']),
  customCategory: z.string().optional(),
  measure: z.string().min(1, 'Measure is required'),
  relevance: z.string().optional(),
  cycleStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  cycleEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD'),
  milestoneDrafts: z.array(z.object({ title: z.string() })).optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
      <div className="relative bg-white dark:bg-background-paper rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col border border-gray-100 dark:border-gray-800">
        <WizardBody editGoal={editGoal ?? null} onClose={onClose} />
      </div>
    </div>
  );
};

const STEPS = ['basics', 'cycle', 'milestones'] as const;

const WizardBody: React.FC<{ editGoal: Goal | null; onClose: () => void }> = ({
  editGoal,
  onClose,
}) => {
  const { t, locale } = useTranslation();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const isEdit = !!editGoal;

  const typedLocale = locale as 'ar' | 'en';

  const today = new Date();
  const defaultStart = format(today, 'yyyy-MM-dd');
  const defaultEnd = format(addDays(today, 84), 'yyyy-MM-dd');

  const [step, setStep] = useState(0);

  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema) as never,
    defaultValues: {
      title: editGoal?.title ?? '',
      description: editGoal?.description ?? '',
      category: editGoal?.category ?? 'education_work',
      customCategory: editGoal?.customCategory ?? '',
      measure: editGoal?.measure ?? '',
      relevance: editGoal?.relevance ?? '',
      cycleStart: editGoal
        ? format(new Date(editGoal.cycleStart), 'yyyy-MM-dd')
        : defaultStart,
      cycleEnd: editGoal
        ? format(new Date(editGoal.cycleEnd), 'yyyy-MM-dd')
        : defaultEnd,
      milestoneDrafts: [],
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = methods;
  const category = watch('category');

  useEffect(() => {
    if (category !== 'other' && (watch('customCategory') ?? '').length > 0) {
      setValue('customCategory', '');
    }
  }, [category, setValue, watch]);

  const onSubmit = async (data: FormValues) => {
    try {
      const milestones = (data.milestoneDrafts ?? [])
        .map((m) => m.title.trim())
        .filter((t) => t.length > 0);
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        customCategory: data.category === 'other' ? data.customCategory : undefined,
        measure: data.measure,
        relevance: data.relevance,
        cycleStart: data.cycleStart,
        cycleEnd: data.cycleEnd,
        milestones: milestones.length > 0 ? milestones : undefined,
      };
      if (isEdit && editGoal) {
        await updateGoal.mutateAsync({ id: editGoal._id, input: payload });
      } else {
        await createGoal.mutateAsync(payload);
      }
      toast.success(t('goals.saved'));
      onClose();
    } catch (e) {
      toast.error(t('common.error'));
      console.error(e);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
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

      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                step >= i ? 'bg-brand-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500',
              )}
            >
              {i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-semibold',
                step === i ? 'text-brand-700 dark:text-brand-300' : 'text-gray-400',
              )}
            >
              {t(`goals.wizardStep${i + 1}`)}
            </span>
            {i < STEPS.length - 1 && <span className="w-8 h-px bg-gray-200 dark:bg-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {step === 0 && (
            <div className="space-y-4">
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(Object.keys(GOAL_CATEGORY_LABELS) as GoalCategory[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setValue('category', c)}
                      className={cn(
                        'px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors',
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
                  <Input {...register('customCategory')} placeholder={t('goals.customCategory')} className="mt-3" />
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  {t('goals.measure')}
                </label>
                <Textarea {...register('measure')} placeholder={t('goals.measurePlaceholder')} className="min-h-[80px]" />
                <p className="text-[11px] text-gray-400 mt-1">{t('goals.measureHelper')}</p>
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
            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('goals.cycleHelper')}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    {t('goals.cycleStart')}
                  </span>
                  <Input type="date" {...register('cycleStart')} />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                    {t('goals.cycleEnd')}
                  </span>
                  <Input type="date" {...register('cycleEnd')} min={watch('cycleStart')} />
                  <p className="text-[11px] text-gray-400">{t('goals.cycleEndHelper')}</p>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('goals.milestonesHelper')}</p>
              <MilestoneDraftList />
              <p className="text-[11px] text-gray-400 italic">{t('goals.milestonesOptional')}</p>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              {t('common.back')}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" variant="primary" onClick={() => setStep((s) => s + 1)}>
                {t('common.next')}
              </Button>
            ) : (
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                {isEdit ? t('common.save') : t('common.confirm')}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </>
  );
};

const MilestoneDraftList = () => {
  const { t } = useTranslation();
  const { control, register } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'milestoneDrafts',
  });

  const titleRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="space-y-2">
      {fields.map((field, i) => (
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
          <button
            type="button"
            onClick={() => remove(i)}
            className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 shrink-0"
            aria-label={t('common.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

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
