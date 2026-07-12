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
    <div className="flex flex-col gap-6">
      <AdaptiveGreeting data={data} user={user} hour={hour} />

      {/* Bento Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Tasks (occupies 8 cols on desktop) */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <TodayTasksList tasks={data.tasks} />
        </div>

        {/* Right Column: Habits & Progress (occupies 4 cols on desktop) */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <TodayHabitsList habits={data.habits} />
          
          <div className="sticky top-24">
            <ProgressSection summary={data.summary} capacity={data.capacity} />
            <div className="mt-6">
              <BacklogRibbon count={data.backlogCount} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};