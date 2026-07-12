import { AdaptiveGreeting } from './AdaptiveGreeting';
import { TodayTasksList } from './TodayTasksList';
import { TodayHabitsList } from './TodayHabitsList';
import { BacklogRibbon } from './BacklogRibbon';
import { ProgressSection } from './ProgressSection';
import { HomePageSkeleton } from './HomePageSkeleton';
import type { User } from '@/features/auth/types';
import type { HomeData } from '../hooks/useHomeData';

interface DailyOverviewProps {
  data: HomeData;
  user: User | null;
  /** Local-clock hour 0-23 for the greeting's time bucket. */
  hour: number;
}

/**
 * HOME-2 contractual section order (do not rearrange):
 *   1. Greeting
 *   2. Today's Tasks
 *   3. Habits
 *   4. Backlog Ribbon
 *   5. Progress Bar
 *
 * Pure composition — no data fetching here. Parent (HomePage) owns the
 * parallel fetch and hands the result down.
 */
export const DailyOverview = ({ data, user, hour }: DailyOverviewProps) => {
  if (data.isLoading) {
    return <HomePageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AdaptiveGreeting data={data} user={user} hour={hour} />

      <TodayTasksList tasks={data.tasks} />

      <TodayHabitsList habits={data.habits} />

      <BacklogRibbon count={data.backlogCount} />

      <ProgressSection summary={data.summary} capacity={data.capacity} />
    </div>
  );
};