// @ts-nocheck — TODO(E2): rewire to the real Hadaf Task schema. This file still uses Impulse's pre-migration task shape (name/startTime/endTime/subTasks/type/points). Full Express rewiring lands in the E2 work order.
import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea } from '@/shared/components/ui/Input';
import { TaskFormValues } from '../TaskFormModal';

export const TaskHeader = () => {
  const { register, watch, setValue } = useFormContext<TaskFormValues>();
  const description = watch('description');
  // Show description if it has a value initially
  const [showDescription, setShowDescription] = useState(!!description);

  // Sync state if external description changes (e.g. edit mode)
  useEffect(() => {
    if (description) setShowDescription(true);
  }, [description]);

  const handleRemoveDescription = () => {
    setValue('description', ''); // Clear value
    setShowDescription(false);   // Hide field
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="What needs to be done?"
        {...register('name')}
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
          Add Description
        </button>
      )}
      
      {showDescription && (
        <div className="relative animate-fade-in group">
          <Textarea
            {...register('description')}
            placeholder="Add details, context, or links..."
            className="resize-none min-h-[80px] bg-gray-50 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-brand-200 text-sm transition-all rounded-xl pe-8"
          />
          {/* Remove Description Button */}
          <button
            type="button"
            onClick={handleRemoveDescription}
            className="absolute top-2 end-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
            title="Remove description"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
};