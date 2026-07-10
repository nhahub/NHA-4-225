import { Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { useTranslation } from '@/providers/useLocale';
import type { TaskFormValues } from './formValues';

export const TaskHeader = () => {
  const { t } = useTranslation();
  const { register } = useFormContext<TaskFormValues>();

  return (
    <div className="space-y-2">
      <Input
        placeholder={t('tasks.titlePlaceholder')}
        {...register('title')}
        className="text-2xl font-bold border-none px-0 rounded-none focus:ring-0 bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white p-0 h-auto"
        autoFocus
      />

      <div className="relative group">
        <Textarea
          {...register('description')}
          placeholder={t('tasks.descriptionPlaceholder')}
          className="resize-none min-h-[80px] bg-gray-50 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-brand-200 text-sm transition-all rounded-xl pe-8"
        />
        <span className="absolute top-2 end-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-all">
          <Trash2 size={14} />
        </span>
      </div>
    </div>
  );
};
