import { useMemo } from 'react';
import { useTranslation } from '@/providers/useLocale';
import { Link } from 'react-router-dom';
import { Sparkles, ListChecks, Target, ArrowRight, ArrowLeft } from 'lucide-react';
import type { User } from '@/features/auth/types';
import type { HomeData } from '../hooks/useHomeData';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/utils/cn';

export type GreetingBranch = 'withTasks' | 'noTasksWithGoals' | 'newUser' | 'noGoalsAtAll';

export interface AdaptiveGreetingProps {
  data: HomeData;
  user: User | null;
  /**
   * Local-clock hour 0-23. Caller controls this so the greeting can be
   * pinned to "now" without forcing the component to subscribe to a clock
   * (pure presentation only — no new fetches).
   */
  hour: number;
}

/**
 * HOME-1 AdaptiveGreeting — pure function of HOME-2's already-fetched data.
 * No new endpoints. Branch precedence (first match wins):
 *   1. hasTasks  → accomplishment-first task summary
 *   2. hasGoals  → gentle nudge toward an existing goal
 *   3. newUser   → onboarding-shaped welcome
 *   4. fallback  → "start with one goal" empty-state nudge
 *
 * Voice guardrail (binding per project-context.md): accomplishment-first,
 * never punitive. No mascots / confetti / streak-flame / "you missed" copy.
 */
const computeBranch = (
  taskCount: number,
  activeGoalCount: number,
  isNewUser: boolean,
): GreetingBranch => {
  if (taskCount > 0) return 'withTasks';
  if (activeGoalCount > 0) return 'noTasksWithGoals';
  if (isNewUser) return 'newUser';
  return 'noGoalsAtAll';
};

const timeBucket = (hour: number): 'morning' | 'afternoon' | 'evening' => {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
};

export const AdaptiveGreeting = ({ data, user, hour }: AdaptiveGreetingProps) => {
  const { t } = useTranslation();

  const { branch, bucket, completedToday, firstGoalTitle, displayName } = useMemo(() => {
    const completed = data.tasks.filter((tk) => tk.status === 'completed').length;
    const branch = computeBranch(
      data.tasks.length,
      data.activeGoals.length,
      user ? !user.onboardingCompleted : true,
    );
    const firstGoal = data.activeGoals[0];
    return {
      branch,
      bucket: timeBucket(hour),
      completedToday: completed,
      firstGoalTitle: firstGoal?.title,
      displayName: user?.name?.trim() || t('dashboard.welcomeFallback'),
    };
  }, [data.tasks, data.activeGoals, user, hour, t]);

  const greetingLine = t(`home.greeting.${bucket}`, { name: displayName });

  return (
    <section
      aria-label={t('home.title')}
      className="rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8"
    >
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
              'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400',
            )}
          >
            <Sparkles size={22} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {greetingLine}
            </h1>
            <BranchBody
              branch={branch}
              taskCount={data.tasks.length}
              completedToday={completedToday}
              firstGoalTitle={firstGoalTitle}
            />
          </div>
        </div>

        <BranchCta branch={branch} firstGoalTitle={firstGoalTitle} />
      </header>
    </section>
  );
};

interface BranchBodyProps {
  branch: GreetingBranch;
  taskCount: number;
  completedToday: number;
  firstGoalTitle: string | undefined;
}

const BranchBody = ({ branch, taskCount, completedToday, firstGoalTitle }: BranchBodyProps) => {
  const { t } = useTranslation();

  if (branch === 'withTasks') {
    const remaining = taskCount - completedToday;
    const ac = t('home.greeting.accomplishments.done', {
      done: completedToday,
      total: taskCount,
    });
    const rem =
      remaining > 0
        ? t('home.greeting.accomplishments.remaining', { remaining })
        : '';
    return (
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
        {`${ac}${rem}`}
      </p>
    );
  }

  if (branch === 'noTasksWithGoals') {
    return (
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
        {t('home.greeting.noTasksWithGoals')}
      </p>
    );
  }

  if (branch === 'newUser') {
    return (
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
        {t('home.greeting.newUser')}
      </p>
    );
  }

  // noGoalsAtAll
  return (
    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
      {firstGoalTitle ? t('home.greeting.noTasksNoGoals') : t('home.greeting.noTasksNoGoals')}
    </p>
  );
};

interface BranchCtaProps {
  branch: GreetingBranch;
  firstGoalTitle: string | undefined;
}

const BranchCta = ({ branch, firstGoalTitle }: BranchCtaProps) => {
  const { t, locale } = useTranslation();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  if (branch === 'withTasks') {
    return (
      <Link
        to={ROUTES.TASKS}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
          'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400',
          'transition-colors min-h-[44px]',
        )}
      >
        <ListChecks size={18} aria-hidden="true" />
        <span>{t('nav.tasks')}</span>
        <Arrow size={16} aria-hidden="true" />
      </Link>
    );
  }

  if (branch === 'noTasksWithGoals' && firstGoalTitle) {
    return (
      <Link
        to={ROUTES.TASKS}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
          'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400',
          'transition-colors min-h-[44px]',
        )}
      >
        <Target size={18} aria-hidden="true" />
        <span className="max-w-[16ch] truncate">{t('home.greeting.noTasksWithGoalsCta', { goal: firstGoalTitle })}</span>
        <Arrow size={16} aria-hidden="true" />
      </Link>
    );
  }

  if (branch === 'newUser') {
    return (
      <Link
        to={ROUTES.GOALS}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
          'bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-400',
          'transition-colors min-h-[44px]',
        )}
      >
        <Target size={18} aria-hidden="true" />
        <span>{t('home.greeting.newUserCta')}</span>
        <Arrow size={16} aria-hidden="true" />
      </Link>
    );
  }

  // noGoalsAtAll
  return (
    <Link
      to={ROUTES.GOALS}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold',
        'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
        'transition-colors min-h-[44px]',
      )}
    >
      <Target size={18} aria-hidden="true" />
      <span>{t('home.greeting.noTasksNoGoalsCta')}</span>
      <Arrow size={16} aria-hidden="true" />
    </Link>
  );
};