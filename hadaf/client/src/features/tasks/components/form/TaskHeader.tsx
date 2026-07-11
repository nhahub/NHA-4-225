import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

export const TaskHeader = () => {
  const { t } = useTranslation();
  const { register, watch, setValue } = useFormContext<TaskFormValues>();
  const description = watch('description');
  const [showDescription, setShowDescription] = useState(!!description);

  useEffect(() => {
    if (description) setShowDescription(true);
  }, [description]);

  const handleRemoveDescription = () => {
    setValue('description', '');
    setShowDescription(false);
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder={t('tasks.titlePlaceholder')}
        {...register('title')}
        className="text-2xl font-bold border-none px-0 rounded-none focus:ring-0 bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white p-0 h-auto"
        autoFocus
      />

      {!showDescription && (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <Plus size={14} />
          {t('tasks.addDescription')}
        </button>
      )}

      {showDescription && (
        <div className="relative animate-fade-in group">
          <Textarea
            {...register('description')}
            placeholder={t('tasks.descriptionPlaceholder')}
            className="resize-none min-h-[80px] bg-gray-50 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-brand-200 text-sm transition-all rounded-xl pe-8"
          />
          <button
            type="button"
            onClick={handleRemoveDescription}
            className="absolute top-2 end-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
            title={t('common.delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
