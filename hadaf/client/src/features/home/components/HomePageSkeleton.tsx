import { Skeleton } from '@/shared/components/ui/Skeleton';

/**
 * Full-page skeleton shown while the HOME-2 parallel fetch is in flight.
 * Built from `shared/components/ui/Skeleton.tsx` composition — POL will
 * replace with the shared `LoadingSkeleton` once that epic lands.
 */
export const HomePageSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Greeting */}
      <Skeleton className="h-28 w-full rounded-3xl" />

      {/* Today's tasks */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>

      {/* Today's habits */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>

      {/* Backlog ribbon */}
      <div>
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>

      {/* Progress bar + capacity gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
};