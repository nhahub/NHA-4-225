import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from '@/providers/useLocale';

interface CompletionStepProps {
  onContinue?: () => void;
}

/**
 * ONB-3 final screen — shown after `completeOnboarding` succeeds and
 * the auth store has been updated. The user has already been marked
 * complete; this screen just confirms and offers a single "let's go"
 * CTA that navigates to the home page.
 *
 * Single 🎉 emoji is explicitly approved by the work order (the no-
 * gamification voice guardrail targets mascots/confetti/badges/streak
 * language, not every literal emoji). Anything beyond this one emoji
 * is rejected.
 */
export const CompletionStep = ({ onContinue }: CompletionStepProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goHome = () => {
    if (onContinue) {
      onContinue();
      return;
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="text-center py-6 space-y-6">
      <div className="w-20 h-20 mx-auto rounded-full bg-success-50 dark:bg-success-900/30 text-success-600 dark:text-success-300 flex items-center justify-center">
        <CheckCircle2 size={40} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('onboarding.completion.title')}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">
          {t('onboarding.completion.body')}
        </p>
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={goHome}
        rightIcon={<ArrowRight size={16} />}
        className="min-w-[200px]"
      >
        {t('onboarding.completion.cta')}
      </Button>
    </div>
  );
};