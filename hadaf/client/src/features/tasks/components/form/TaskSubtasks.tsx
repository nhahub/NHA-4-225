import { useFormContext, useFieldArray } from 'react-hook-form';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

// Renamed from TaskSubtasks to TaskChecklist to disambiguate from the real
// backend's milestone/subtask concept; this controls a task's ChecklistItem[].
export const TaskChecklist = () => {
  const { t } = useTranslation();
  const { control, register } = useFormContext<TaskFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'checklist',
  });

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
        {t('tasks.checklist')}
      </label>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-2 group bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center shrink-0 text-brand-600 dark:text-brand-300 text-[10px] font-bold">
              {index + 1}
            </div>
            <Input
              {...register(`checklist.${index}.title` as const)}
              placeholder={t('tasks.checklistItemPlaceholder')}
              className="flex-1 h-8 text-sm bg-transparent border-transparent focus:bg-transparent px-2 placeholder:text-gray-400 font-medium min-w-0"
              autoComplete="off"
            />
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

        <Button
          type="button"
          variant="ghost"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => append({ title: '', is_completed: false })}
          className="w-full text-brand-600 dark:text-brand-300 border-2 border-dashed border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-900/20"
        >
          {t('tasks.addChecklistItem')}
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="text-[11px] text-gray-400 italic">{t('tasks.checklistHelper')}</p>
      )}
    </div>
  );
};

// Backwards-compat alias — keeps the original import name working for
// callers that pre-date the rename.
export const TaskSubtasks = TaskChecklist;
