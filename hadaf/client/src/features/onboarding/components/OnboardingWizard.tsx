import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { Card } from '@/shared/components/ui/Card';
import { cn } from '@/shared/utils/cn';
import { GoalReadinessStep, type GoalStepResult } from './GoalReadinessStep';
import { HabitsStep } from './HabitsStep';
import { SettingsStep } from './SettingsStep';
import { CompletionStep } from './CompletionStep';
import type { GoalCategory } from '@/features/goals/types';

const TOTAL_STEPS = 3;

export interface OnboardingState {
  goalId: string | null;
  goalTitle: string;
  goalCategory: GoalCategory | null;
  createdHabitIds: string[];
  createdTaskId: string | null;
}

const initialState: OnboardingState = {
  goalId: null,
  goalTitle: '',
  goalCategory: null,
  createdHabitIds: [],
  createdTaskId: null,
};

/**
 * ONB stepper shell. Renders steps 1/3, 2/3, 3/3 (the work-order-
 * mandated progress indicator), then the CompletionStep as a fourth
 * "complete" frame without the stepper chrome.
 *
 * Step 1 is non-skippable (GoalReadinessStep offers no skip affordance).
 * Step 2 is skippable (zero habits is a valid outcome).
 * Step 3 is non-skippable (settings + first task are required to finish
 * onboarding — finishing calls /api/user/onboarding/complete).
 */
export const OnboardingWizard = () => {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [state, setState] = useState<OnboardingState>(initialState);

  const handleGoalComplete = (result: GoalStepResult) => {
    setState((s) => ({
      ...s,
      goalId: result.goalId,
      goalTitle: result.goalTitle,
      goalCategory: result.goalCategory,
    }));
    setStep(1);
  };

  const handleHabitsComplete = (habitIds: string[]) => {
    setState((s) => ({ ...s, createdHabitIds: habitIds }));
    setStep(2);
  };

  const handleSettingsAndTaskComplete = () => {
    setCompleted(true);
  };

  if (completed) {
    return (
      <Card padding="lg" className="w-full">
        <CompletionStep />
      </Card>
    );
  }

  return (
    <Card padding="lg" className="w-full">
      <Stepper currentStep={step} />

      <div className="mt-6">
        {step === 0 && <GoalReadinessStep onComplete={handleGoalComplete} />}
        {step === 1 && (
          <HabitsStep onComplete={handleHabitsComplete} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <SettingsStep
            goalId={state.goalId}
            goalTitle={state.goalTitle}
            onComplete={handleSettingsAndTaskComplete}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </Card>
  );
};

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <span
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors',
                isDone && 'bg-success-500 text-white',
                isActive && !isDone && 'bg-brand-500 text-white shadow-md',
                !isActive && !isDone && 'bg-gray-200 dark:bg-gray-700 text-gray-500',
              )}
            >
              {isDone ? <Check size={14} /> : i + 1}
            </span>
            <span
              className={cn(
                'text-xs font-semibold truncate',
                isActive ? 'text-brand-700 dark:text-brand-300' : 'text-gray-400',
              )}
            >
              {t('onboarding.stepLabel', { current: i + 1, total: TOTAL_STEPS })}
            </span>
            {i < TOTAL_STEPS - 1 && (
              <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-1" />
            )}
          </div>
        );
      })}
    </div>
  );
};