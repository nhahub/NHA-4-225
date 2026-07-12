import { cn } from '@/shared/utils/cn';

type Status = 'danger' | 'warning' | 'info' | 'success' | 'legendary';

interface ProgressBarProps {
  /** 0–150 (allows legendary overflow). >150 clamps visually. */
  percent: number;
  /** Optional status override; if omitted, derived from percent thresholds. */
  status?: Status;
  /** Show the inline percentage label. */
  showLabel?: boolean;
  className?: string;
}

const STATUS_COLOR: Record<Status, string> = {
  danger: 'bg-red-500',
  warning: 'bg-orange-500',
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  legendary: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500',
};

const STATUS_TRACK: Record<Status, string> = {
  danger: 'bg-red-100 dark:bg-red-900/20',
  warning: 'bg-orange-100 dark:bg-orange-900/20',
  info: 'bg-blue-100 dark:bg-blue-900/20',
  success: 'bg-emerald-100 dark:bg-emerald-900/20',
  legendary: 'bg-amber-50 dark:bg-amber-900/20',
};

function deriveStatus(p: number): Status {
  if (p >= 150) return 'legendary';
  if (p >= 100) return 'success';
  if (p >= 50) return 'info';
  if (p >= 25) return 'warning';
  return 'danger';
}

export const ProgressBar = ({
  percent,
  status,
  showLabel = false,
  className,
}: ProgressBarProps) => {
  const effective: Status = status ?? deriveStatus(percent);

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative h-2.5 rounded-full overflow-hidden',
          STATUS_TRACK[effective],
        )}
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={150}
      >
        <div
          className={cn(
            'absolute inset-y-0 start-0 transition-[width] duration-700 ease-out rounded-full',
            STATUS_COLOR[effective],
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          {Math.round(percent)} pts
        </div>
      )}
    </div>
  );
};
