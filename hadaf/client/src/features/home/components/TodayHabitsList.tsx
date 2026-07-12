import { useTranslation } from '@/providers/useLocale';
import { Card } from '@/shared/components/ui/Card';
import { HabitCard } from '@/features/habits/components/HabitCard';
import { ShieldCheck } from 'lucide-react';
import type { Habit } from '@/features/habits/types';

interface TodayHabitsListProps {
  habits: Habit[];
  isLoading?: boolean;
}

/**
 * Home-screen section: today's habits. Reuses `HabitCard` from
 * features/habits/components/. No logging UX here — that's the dedicated
 * habits page. Home shows what's on the plate for today.
 */
export const TodayHabitsList = ({ habits, isLoading }: TodayHabitsListProps) => {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="home-habits-heading">
      <header className="flex items-center justify-between mb-3">
        <h2
          id="home-habits-heading"
          className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          {t('home.sections.habits')}
        </h2>
      </header>

      {isLoading ? (
        <Card padding="md" className="space-y-3">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-12 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </Card>
      ) : habits.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-6">
            <ShieldCheck size={28} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" aria-hidden="true" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              {t('home.habits.empty')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              {t('home.habits.emptyHelper')}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.slice(0, 4).map((habit) => (
            <HabitCard key={habit._id} habit={habit} />
          ))}
        </div>
      )}
    </section>
  );
};