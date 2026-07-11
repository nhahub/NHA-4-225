import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';
import { GoalReadinessDialog } from '@/features/goals/components/GoalReadinessDialog';
import { GoalWizard } from '@/features/goals/components/GoalWizard';

type Phase = 'readiness' | 'wizard' | 'done';

export const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('readiness');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-2">
            {t('onboarding.stepIndicator', { current: 1, total: 3 })}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  step === 1 ? 'w-8 bg-brand-500' : 'w-4 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {phase === 'done' ? (
          <div className="bg-white dark:bg-background-paper rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 text-center animate-scale-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <CheckCircle2 className="text-brand-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('onboarding.welcome')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {t('onboarding.stepsRemainingNotice')}
            </p>
            <Button className="w-full" onClick={() => navigate('/')} leftIcon={<Sparkles size={16} />}>
              {t('onboarding.goToHome')}
            </Button>
          </div>
        ) : (
          <>
            {/* Not rendered as a dismissible overlay: no way to skip past
                Step 1 (FR1/FR1.1's "cannot be skipped" requirement). */}
            <GoalReadinessDialog
              isOpen={phase === 'readiness'}
              onClose={() => {}}
              onConfirm={() => setPhase('wizard')}
              dismissible={false}
            />
            <GoalWizard
              isOpen={phase === 'wizard'}
              onClose={() => setPhase('done')}
              dismissible={false}
            />
          </>
        )}
      </div>
    </div>
  );
};
