import { useEffect, useRef, useState } from 'react';
import { Target } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { useActiveGoals } from '@/features/goals/hooks/useGoals';
import { GoalReadinessDialog } from '@/features/goals/components/GoalReadinessDialog';
import { GoalWizard } from '@/features/goals/components/GoalWizard';
import type { GoalCategory } from '@/features/goals/types';

export interface GoalStepResult {
  goalId: string;
  goalTitle: string;
  goalCategory: GoalCategory;
}

interface GoalReadinessStepProps {
  onComplete: (result: GoalStepResult) => void;
}

/**
 * ONB-1 — Step 1 of the onboarding wizard.
 *
 * Non-skippable: no skip affordance is rendered. The user MUST create a
 * real Goal via the E1-1 wizard before this step completes. The wizard's
 * own `onClose` is the only signal the parent receives, so we snapshot
 * the active-goal id set before opening and diff after close to
 * determine whether a new goal was created (success path) or the user
 * dismissed the modal (X button) — only the success path advances.
 */
export const GoalReadinessStep = ({ onComplete }: GoalReadinessStepProps) => {
  const { t } = useTranslation();
  const { data: activeGoals = [] } = useActiveGoals();

  const [readinessOpen, setReadinessOpen] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);

  const previousIdsRef = useRef<Set<string> | null>(null);
  const [pendingCompletion, setPendingCompletion] = useState(false);

  const openWizard = () => {
    previousIdsRef.current = new Set(activeGoals.map((g) => g._id));
    setReadinessOpen(false);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setPendingCompletion(true);
  };

  useEffect(() => {
    if (!pendingCompletion || !previousIdsRef.current) return;
    const previous = previousIdsRef.current;
    const created = activeGoals.find((g) => !previous.has(g._id));
    if (created) {
      previousIdsRef.current = null;
      setPendingCompletion(false);
      onComplete({
        goalId: created._id,
        goalTitle: created.title,
        goalCategory: created.category,
      });
    }
  }, [activeGoals, pendingCompletion, onComplete]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
          <Target size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('onboarding.goalStep.title')}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('onboarding.goalStep.body')}
          </p>
        </div>
      </div>

      <GoalReadinessDialog
        isOpen={readinessOpen}
        onClose={() => setReadinessOpen(false)}
        onConfirm={openWizard}
      />
      <GoalWizard isOpen={wizardOpen} onClose={handleWizardClose} />
    </div>
  );
};