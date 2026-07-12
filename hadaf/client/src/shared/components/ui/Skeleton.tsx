import { cn } from '@/shared/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Tailwind's `animate-pulse` is heavy CSS keyframes that can trigger
 * vestibular symptoms. When the user has `prefers-reduced-motion: reduce`
 * enabled, we drop the animation and render a static placeholder instead.
 * Tailwind ships this as `motion-safe:` / `motion-reduce:` variants out
 * of the box, so we just toggle the class.
 */
export const Skeleton = ({ className, ...props }: SkeletonProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-md bg-gray-200 dark:bg-gray-700 motion-safe:animate-pulse',
        className,
      )}
      {...props}
    />
  );
};

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  </div>
);
