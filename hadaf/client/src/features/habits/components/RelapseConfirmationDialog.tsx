import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/AlertDialog';
import { useTranslation } from '@/providers/useLocale';

interface RelapseConfirmationDialogProps {
  isOpen: boolean;
  habitTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const RelapseConfirmationDialog = ({
  isOpen,
  habitTitle,
  onClose,
  onConfirm,
}: RelapseConfirmationDialogProps) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('habits.relapseTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="block mb-2 font-semibold text-gray-700 dark:text-gray-200">
              {habitTitle}
            </span>
            {t('habits.relapseBody')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('common.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700 text-white">
            {t('habits.relapseConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
