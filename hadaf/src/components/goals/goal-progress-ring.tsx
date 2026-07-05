"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type ProgressTier = "low" | "warning" | "good" | "great";

function tierFromProgress(progress: number): ProgressTier {
  if (progress < 0.31) return "low";
  if (progress < 0.61) return "warning";
  if (progress < 0.86) return "good";
  return "great";
}

const TIER_INDICATOR: Record<ProgressTier, string> = {
  low: "text-status-low",
  warning: "text-status-warning",
  good: "text-status-good",
  great: "text-status-great",
};

type GoalProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  className?: string;
  showLabel?: boolean;
};

export function GoalProgressRing({
  progress,
  size = 56,
  strokeWidth = 4,
  trackClassName,
  className,
  showLabel = false,
}: GoalProgressRingProps) {
  const { t } = useLocale();
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * clamped;
  const gap = circumference - dash;
  const tier = tierFromProgress(clamped);
  const percent = Math.round(clamped * 100);
  const unit = t("home.progressPercentUnit");

  return (
    <div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={`${t("goals.progressLabel")}: ${percent}${unit}`}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn("stroke-foreground/10", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          className={cn("stroke-current transition-slow", TIER_INDICATOR[tier])}
        />
      </svg>
      {showLabel ? (
        <span className="text-foreground absolute inset-0 flex items-center justify-center text-xs font-medium tabular-nums">
          {percent}
          {unit}
        </span>
      ) : null}
    </div>
  );
}