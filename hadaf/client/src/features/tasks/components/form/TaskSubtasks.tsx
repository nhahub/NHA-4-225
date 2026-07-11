import { useEffect, useRef } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Clock } from 'lucide-react';
import { Input } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

// Renamed from TaskSubtasks to TaskChecklist to disambiguate from the real
// backend's milestone/subtask concept; this controls a task's ChecklistItem[].
// Only rendered in "Big Task" mode (see TaskFormModal) — a regular task has
// no subtasks section at all.
export const TaskChecklist = () => {
  const { t } = useTranslation();
  const { control, register, setFocus } = useFormContext<TaskFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklist',
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      append({ title: '', is_completed: false, durationMinutes: 30 });
    }
  };

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current && fields.length > 0) {
      setTimeout(() => {
        setFocus(`checklist.${fields.length - 1}.title`);
      }, 10);
    }
    mounted.current = true;
  }, [fields.length, setFocus]);

  return (
    <div className="animate-fade-in bg-purple-50/50 dark:bg-purple-900/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/20">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider flex items-center gap-2">
          {t('tasks.checklist')}
        </label>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex gap-2 items-center group bg-white dark:bg-gray-800/50 p-2 rounded-xl border border-purple-100 dark:border-purple-900/30 shadow-sm transition-all hover:shadow-md hover:border-purple-200"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-300 text-[10px] font-bold">
              {index + 1}
            </div>

            <Input
              {...register(`checklist.${index}.title` as const)}
              placeholder={t('tasks.checklistItemPlaceholder')}
              className="flex-1 h-8 text-sm bg-transparent border-transparent focus:bg-transparent px-2 placeholder:text-gray-400 font-medium min-w-0"
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />

            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />

            <div className="flex items-center gap-1.5 px-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg h-8 border border-transparent focus-within:border-purple-200 dark:focus-within:border-purple-800 transition-colors w-20 shrink-0">
              <Clock size={12} className="text-gray-400 shrink-0" />
              <input
                type="number"
                {...register(`checklist.${index}.durationMinutes` as const, {
                  valueAsNumber: true,
                })}
                className="w-full bg-transparent border-none p-0 text-xs font-bold text-gray-700 dark:text-gray-300 text-center focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="30"
                min="1"
              />
              <span className="text-[10px] text-gray-400 font-medium shrink-0">m</span>
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0"
              aria-label={t('common.delete')}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ title: '', is_completed: false, durationMinutes: 30 })}
          className="mt-1 w-full py-2 border-2 border-dashed border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} strokeWidth={3} /> {t('tasks.addChecklistItem')}
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-[11px] text-purple-400 dark:text-purple-500/80 italic mt-2">
          {t('tasks.checklistHelper')}
        </p>
      )}
    </div>
  );
};

// Backwards-compat alias — keeps the original import name working for
// callers that pre-date the rename.
export const TaskSubtasks = TaskChecklist;
