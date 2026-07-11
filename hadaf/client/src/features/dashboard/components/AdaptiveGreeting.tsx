import { useNavigate } from 'react-router-dom';
import { Target, Sparkles } from 'lucide-react';
import { useTranslation } from '@/providers/useLocale';
import { Button } from '@/shared/components/ui/Button';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useGreeting } from '../hooks/useGreeting';

export const AdaptiveGreeting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const greeting = useGreeting();

  if (greeting.isLoading) {
    return <Skeleton className="h-14 w-2/3 rounded-lg" />;
  }

  if (greeting.scenario === 'new_user') {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.greeting.newUser')}</p>
        <Button
          className="mt-3"
          size="sm"
          leftIcon={<Sparkles size={16} />}
          onClick={() => navigate('/onboarding')}
        >
          {t('dashboard.greeting.newUserCta')}
        </Button>
      </div>
    );
  }

  if (greeting.scenario === 'no_goals') {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.greeting.noGoals')}</p>
        <Button
          className="mt-3"
          size="sm"
          leftIcon={<Target size={16} />}
          onClick={() => navigate('/goals')}
        >
          {t('dashboard.greeting.noGoalsCta')}
        </Button>
      </div>
    );
  }

  if (greeting.scenario === 'no_tasks_has_goals') {
    return (
      <div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {greeting.userName
            ? t('dashboard.greeting.noTasksHasGoalsName', {
                name: greeting.userName,
                habitCount: greeting.habitCount,
              })
            : t('dashboard.greeting.noTasksHasGoalsFallback', { habitCount: greeting.habitCount })}
        </p>
        {greeting.suggestedGoal && (
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <p className="text-sm text-brand-700 dark:text-brand-300">
              {t('dashboard.greeting.suggestion', { goalTitle: greeting.suggestedGoal.title })}
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/goals/${greeting.suggestedGoal!._id}`)}
            >
              {t('dashboard.greeting.addTask')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // has_tasks — the common case
  return (
    <p className="text-gray-600 dark:text-gray-400 mt-1">
      {greeting.userName
        ? t('dashboard.greeting.hasTasksName', {
            name: greeting.userName,
            taskCount: greeting.taskCount,
            habitCount: greeting.habitCount,
          })
        : t('dashboard.greeting.hasTasksFallback', {
            taskCount: greeting.taskCount,
            habitCount: greeting.habitCount,
          })}
    </p>
  );
};
