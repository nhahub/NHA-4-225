import { useDateStore } from '@/shared/stores/useDateStore';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useActiveGoals } from '@/features/goals/hooks/useGoals';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useDashboardStats } from './useDashboardStats';
import type { Goal } from '@/features/goals/types';

export type GreetingScenario = 'new_user' | 'no_goals' | 'no_tasks_has_goals' | 'has_tasks';

export interface GreetingData {
  scenario: GreetingScenario;
  isLoading: boolean;
  userName: string | null;
  taskCount: number;
  habitCount: number;
  /** The active goal with the least progress — surfaced in the
   * no_tasks_has_goals suggestion ("Your goal X could use attention"). */
  suggestedGoal: Goal | null;
}

/**
 * FR60 / FR84, UX-Design-Specification.md §7.2 — 4 branches:
 *   new_user            → onboarding not completed yet (a real DB signal,
 *                          not a guess) — "Start with your first task"
 *   no_goals             → onboarding done, but zero active goals right now
 *                          (e.g. all archived) — "Start with one goal"
 *   no_tasks_has_goals   → has active goals, nothing planned today
 *   has_tasks            → the common case
 */
export function useGreeting(): GreetingData {
  const user = useAuthStore((state) => state.user);
  const { selectedDate } = useDateStore();
  const stats = useDashboardStats(selectedDate);
  const { data: goals, isLoading: goalsLoading } = useActiveGoals();
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const isLoading = stats.isLoading || goalsLoading || habitsLoading;
  const taskCount = stats.pendingTasks + stats.completedTasks;
  const habitCount = habits?.length ?? 0;
  const activeGoals = goals ?? [];

  let scenario: GreetingScenario;
  if (user && user.onboardingCompleted === false) {
    scenario = 'new_user';
  } else if (activeGoals.length === 0) {
    scenario = 'no_goals';
  } else if (taskCount === 0) {
    scenario = 'no_tasks_has_goals';
  } else {
    scenario = 'has_tasks';
  }

  const suggestedGoal =
    scenario === 'no_tasks_has_goals'
      ? [...activeGoals].sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0))[0] ?? null
      : null;

  return {
    scenario,
    isLoading,
    userName: user?.name ?? null,
    taskCount,
    habitCount,
    suggestedGoal,
  };
}
