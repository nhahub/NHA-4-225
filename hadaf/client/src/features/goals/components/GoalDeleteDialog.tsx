// src/features/goals/components/GoalDeleteDialog.tsx
//
// POL-4 — Confirm-archiving a goal, collecting `deletionReason`.
//
// The backend's `softDeleteGoalSchema` requires a non-empty `reason`
// (validated server-side via Zod in `Goal.softDeleteGoalSchema`).
// This dialog exposes a reason picker (with optional free-text note)
// so the reason field can never be skipped from the UI.
//
// Accomplishment-first copy — describes what will happen, not blame.

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/AlertDialog';
import { Input } from '@/shared/components/ui/Input';
import { cn } from '@/shared/utils/cn';

type ReasonKey =
  | 'priorityShifted'
  | 'tooAmbitious'
  | 'achieved'
  | 'notRightNow'
  | 'other';

const REASON_KEYS: ReasonKey[] = [
  'priorityShifted',
  'tooAmbitious',
  'achieved',
  'notRightNow',
  'other',
];

export interface GoalDeleteDialogProps {
  isOpen: boolean;
  goalTitle?: string;
  onCancel: () => void;
  /**
   * Submit handler. Receives the merged reason string (the picked preset's
   * i18n label plus any optional user note). If the user picks no preset and
   * adds no note, the dialog disables submit — the backend refuses a blank
   * reason.
   */
  onConfirm: (reason: string) => void;
  isPending?: boolean;
}

export const GoalDeleteDialog = ({
  isOpen,
  goalTitle,
  onCancel,
  onConfirm,
  isPending,
}: GoalDeleteDialogProps) => {
  const { t } = useTranslation();
  const [selectedPreset, setSelectedPreset] = useState<ReasonKey | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelectedPreset(null);
      setNote('');
    }
  }, [isOpen]);

  const reasonLabel = useMemo(() => {
    if (!selectedPreset) return note.trim();
    const base = t(`pol.goalDelete.reasons.${selectedPreset}` as const);
    const trimmedNote = note.trim();
    return trimmedNote.length > 0 ? `${base} — ${trimmedNote}` : base;
  }, [selectedPreset, note, t]);

  const canConfirm = reasonLabel.length > 0 && !isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle>{t('pol.goalDelete.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="block font-semibold text-gray-700 dark:text-gray-200">
                  {goalTitle ?? ''}
                </span>
                {t('pol.goalDelete.body')}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-3 mt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            {t('pol.goalDelete.reasonLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {REASON_KEYS.map((key) => {
              const active = selectedPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedPreset((prev) => (prev === key ? null : key))}
                  aria-pressed={active}
                  className={cn(
                    'min-h-[44px] px-3 py-2 rounded-full border text-sm font-semibold transition-colors',
                    active
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-brand-300',
                  )}
                >
                  {t(`pol.goalDelete.reasons.${key}` as const)}
                </button>
              );
            })}
          </div>

          <div className="block">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 italic block mb-1">
              {t('pol.goalDelete.reasonOptional')}
            </span>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('pol.goalDelete.reasonPlaceholder')}
              inputSize="sm"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isPending}>
            {t('pol.confirm.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            onClick={() => onConfirm(reasonLabel)}
            className="bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white"
          >
            {t('pol.goalDelete.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
