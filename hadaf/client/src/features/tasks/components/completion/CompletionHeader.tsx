import { CheckCircle2, X } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';

interface CompletionHeaderProps {
  taskName: string;
  onClose: () => void;
}

export const CompletionHeader = ({ taskName, onClose }: CompletionHeaderProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 shrink-0">
      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
        <CheckCircle2 size={24} strokeWidth={3} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
          {t('tasks.completedTitle')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">{taskName}</p>
      </div>
      <button
        onClick={onClose}
        className="p-2 -me-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
        aria-label={t('common.cancel')}
      >
        <X size={24} />
      </button>
    </div>
  );
};
