import { Skeleton } from '@/shared/components/ui/Skeleton';

export const AnalyticsSkeleton = () => (
  <div className="space-y-8" aria-hidden="true">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full rounded-3xl" />
      ))}
    </div>
    <Skeleton className="h-72 w-full rounded-3xl" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-64 w-full rounded-3xl" />
      <Skeleton className="h-64 w-full rounded-3xl" />
    </div>
    <Skeleton className="h-48 w-full rounded-3xl" />
  </div>
);
