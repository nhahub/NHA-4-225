"use client";

import { cn } from "@/lib/utils";

type ProgressTier = "low" | "warning" | "good" | "great";

function tierFromProgress(progress: number): ProgressTier {
  if (progress < 0.31) return "low";
  if (progress < 0.61) return "warning";
  if (progress < 0.86) return "good";
  return "great";
}

const TIER_FILL: Record<ProgressTier, string> = {
  low: "bg-status-low",
  warning: "bg-status-warning",
  good: "bg-status-good",
  great: "bg-status-great",
};

type DailyProgressBarProps = {
  done: number;
  total: number;
  className?: string;
  ariaLabel?: string;
};

export function DailyProgressBar({
  done,
  total,
  className,
  ariaLabel,
}: DailyProgressBarProps) {
  const safeTotal = Math.max(total, 0);
  const ratio = safeTotal === 0 ? 0 : Math.min(done / safeTotal, 1);
  const tier = tierFromProgress(ratio);
  const percent = Math.round(ratio * 100);

  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={ariaLabel}
    >
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-slow",
            TIER_FILL[tier],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}