import { Calendar as CalendarIcon, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';
import { format, addDays, differenceInMinutes, parse, addMinutes, roundToNearestMinutes } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

interface TaskSchedulingProps {
  // True while a big task's end time is being derived from its subtasks'
  // durations (see the auto-calc effect in TaskFormModal) — locks the end
  // time input and swaps in the "Auto-calculated" badge instead of the
  // flexible-duration toggle.
  isAutoScheduled?: boolean;
}

export const TaskScheduling = ({ isAutoScheduled }: TaskSchedulingProps) => {
  const { t } = useTranslation();
  const { register, control, setValue, getValues } = useFormContext<TaskFormValues>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const date = useWatch({ control, name: 'date' });
  const startTime = useWatch({ control, name: 'timeBlockStart' });
  const endTime = useWatch({ control, name: 'timeBlockEnd' });
  const plannedMinutes = useWatch({ control, name: 'plannedDurationMinutes' });

  const [flexibleMode, setFlexibleMode] = useState(
    () => !startTime && !!plannedMinutes,
  );

  // A big task's time is always derived from its subtasks — flexible-duration
  // mode has no meaning there. If the user picked flexible duration on a
  // regular task and then switches it to a big task, drop back to the
  // time-block view so the auto-calc badge and computed end time are visible.
  useEffect(() => {
    if (isAutoScheduled) setFlexibleMode(false);
  }, [isAutoScheduled]);

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const afterTomorrow = addDays(today, 2);
  const dayAfter = addDays(today, 3);

  const isSelected = (d: Date) => {
    const target = format(d, 'yyyy-MM-dd');
    return date === target;
  };

  const setDay = (d: Date) => {
    setValue('date', format(d, 'yyyy-MM-dd'), { shouldDirty: true });
    setShowDatePicker(false);
  };

  const switchToFlexible = () => {
    setValue('timeBlockStart', '', { shouldDirty: true });
    setValue('timeBlockEnd', '', { shouldDirty: true });
    setFlexibleMode(true);
  };

  const switchToTimeBlock = () => {
    setValue('plannedDurationMinutes', undefined, { shouldDirty: true });
    
    // If the inputs are blank, calculate an intelligent default
    const currentStart = getValues('timeBlockStart');
    if (!currentStart) {
      const nextSlot = roundToNearestMinutes(new Date(), { nearestTo: 30, roundingMethod: 'ceil' });
      setValue('timeBlockStart', format(nextSlot, 'HH:mm'), { shouldDirty: true });
      setValue('timeBlockEnd', format(addMinutes(nextSlot, 30), 'HH:mm'), { shouldDirty: true });
    }
    
    setFlexibleMode(false);
  };

  let duration = 0;
  if (startTime && endTime) {
    const s = parse(startTime, 'HH:mm', new Date());
    const e = parse(endTime, 'HH:mm', new Date());
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      let diff = differenceInMinutes(e, s);
      if (diff < 0) diff += 1440;
      duration = diff;
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
          {t('tasks.when')}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDay(today)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all border',
              isSelected(today)
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50',
            )}
          >
            {t('date.today')}
          </button>
          <button
            type="button"
            onClick={() => setDay(tomorrow)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all border',
              isSelected(tomorrow)
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50',
            )}
          >
            {t('date.tomorrow')}
          </button>
          <button
            type="button"
            onClick={() => setDay(afterTomorrow)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all border',
              isSelected(afterTomorrow)
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50',
            )}
          >
            {format(afterTomorrow, 'EEE')}
          </button>
          <button
            type="button"
            onClick={() => setDay(dayAfter)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all border',
              isSelected(dayAfter)
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50',
            )}
          >
            {format(dayAfter, 'EEE')}
          </button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <button
            type="button"
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={cn(
              'p-2 rounded-lg transition-all border',
              showDatePicker
                ? 'bg-gray-100 border-gray-300 text-gray-900'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:text-brand-600',
            )}
            aria-label={t('tasks.pickDate')}
          >
            <CalendarIcon size={18} />
          </button>
        </div>
        {showDatePicker && (
          <div className="mt-2 animate-scale-in origin-top-left">
            <Input
              type="date"
              {...register('date')}
              className="w-auto bg-white dark:bg-gray-900"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
          <Clock size={12} />
          {t('tasks.timeBlock')}
        </label>

        {!flexibleMode ? (
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-fit shrink-0">
                <Input
                  type="time"
                  {...register('timeBlockStart')}
                  className="bg-transparent border-none h-8 p-0 text-center font-semibold text-sm w-24 sm:w-28 focus:ring-0"
                />
                <ArrowRight size={14} className="text-gray-400 shrink-0 rtl:rotate-180" />
                <Input
                  type="time"
                  {...register('timeBlockEnd')}
                  className={cn(
                    'bg-transparent border-none h-8 p-0 text-center font-semibold text-sm w-24 sm:w-28 focus:ring-0',
                    isAutoScheduled && 'text-brand-600 dark:text-brand-400',
                  )}
                  readOnly={isAutoScheduled}
                />
              </div>

              {isAutoScheduled ? (
                <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 px-3 py-2 rounded-xl animate-fade-in h-[46px]">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-300">
                    <Sparkles size={12} fill="currentColor" />
                  </div>
                  <div className="flex flex-col justify-center leading-none gap-1">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                      {t('tasks.autoCalculated')}
                    </span>
                    <span className="text-[10px] text-blue-600/80 dark:text-blue-400 font-medium">
                      {t('tasks.autoCalculatedHelper')}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={switchToFlexible}
                  className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors px-3 py-2 rounded-xl border border-brand-200 dark:border-brand-500/30 flex items-center gap-1.5 h-[46px]"
                >
                  <Sparkles size={14} />
                  {t('tasks.flexibleDuration')}
                </button>
              )}
            </div>
            {duration > 0 && (
              <div className="text-[10px] text-gray-400 font-medium ms-2">
                {t('tasks.durationMinutes', { count: duration })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Input
              type="number"
              min="0"
              {...register('plannedDurationMinutes', { valueAsNumber: true })}
              className="w-24 h-10 text-center"
              placeholder="30"
              autoFocus
            />
            <span className="text-[11px] text-gray-400 font-medium">
              {t('tasks.plannedMinutes')}
            </span>
            <button
              type="button"
              onClick={switchToTimeBlock}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-500/30 flex items-center gap-1.5"
            >
              <Clock size={14} />
              {t('tasks.useTimeBlock')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
