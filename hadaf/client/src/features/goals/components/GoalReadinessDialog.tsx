import { Target, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from '@/providers/useLocale';

interface GoalReadinessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** Set false for non-skippable contexts (ONB-1's first onboarding step) —
   * hides the backdrop-click-to-close and Cancel affordances entirely,
   * rather than forking a second near-identical component. */
  dismissible?: boolean;
}

export const GoalReadinessDialog = ({
  isOpen,
  onClose,
  onConfirm,
  dismissible = true,
}: GoalReadinessDialogProps) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismissible ? onClose : undefined}
      />
      <div className="relative bg-white dark:bg-background-paper rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg">
            <Target className="text-brand-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('goals.readinessTitle')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {t('goals.readinessBody')}
          </p>
        </div>
        <div className="p-6 flex gap-3">
          {dismissible && (
            <Button variant="ghost" onClick={onClose} className="flex-1">
              {t('common.cancel')}
            </Button>
          )}
          <Button variant="primary" onClick={onConfirm} rightIcon={<ArrowRight size={16} />} className="flex-1">
            {t('goals.startWizard')}
          </Button>
        </div>
      </div>
    </div>
  );
};
