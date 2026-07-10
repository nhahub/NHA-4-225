import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';
import { format, addDays, differenceInMinutes, parse } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

export const TaskScheduling = () => {
  const { t } = useTranslation();
  const { register, control, setValue } = useFormContext<TaskFormValues>();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const date = useWatch({ control, name: 'date' });
  const startTime = useWatch({ control, name: 'timeBlockStart' });
  const endTime = useWatch({ control, name: 'timeBlockEnd' });
  const plannedMinutes = useWatch({ control, name: 'plannedDurationMinutes' });

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

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
            <Input
              type="time"
              {...register('timeBlockStart')}
              className="bg-transparent border-none h-8 p-0 text-center font-semibold text-sm w-20 focus:ring-0"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="time"
              {...register('timeBlockEnd')}
              className="bg-transparent border-none h-8 p-0 text-center font-semibold text-sm w-20 focus:ring-0"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-400 block mb-1">
              {t('tasks.plannedMinutes')}
            </label>
            <Input
              type="number"
              min="0"
              {...register('plannedDurationMinutes', { valueAsNumber: true })}
              className="w-24 h-10 text-center"
              placeholder="0"
            />
          </div>

          {(duration > 0 || (plannedMinutes && plannedMinutes > 0)) && (
            <span className="text-[11px] text-gray-400 font-medium">
              {t('tasks.durationMinutes', { count: duration || plannedMinutes || 0 })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
