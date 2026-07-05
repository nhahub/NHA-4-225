"use client";

import { currentWeekIndex } from "@/features/goals/week";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const TOTAL_WEEKS = 12;

type TwelveWeekBarProps = {
  cycleStart: Date;
  cycleEnd: Date;
  variant?: "card" | "detail";
  className?: string;
};

export function TwelveWeekBar({
  cycleStart,
  cycleEnd,
  variant = "card",
  className,
}: TwelveWeekBarProps) {
  const { t } = useLocale();
  const current = currentWeekIndex(cycleStart, cycleEnd);
  const isComplete = current >= TOTAL_WEEKS;
  const segments = Array.from({ length: TOTAL_WEEKS }, (_, i) => i + 1);
  const headerLabel = isComplete
    ? t("commonWeekBar.complete")
    : t("commonWeekBar.weekOf", { current, total: TOTAL_WEEKS });

  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      role="group"
      aria-label={headerLabel}
    >
      {variant === "detail" ? (
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span className="font-medium">{t("goals.cycleLabel")}</span>
          <span className="tabular-nums">{headerLabel}</span>
        </div>
      ) : null}
      <div
        className={cn(
          "flex w-full items-stretch overflow-hidden rounded-full bg-muted",
          variant === "card" ? "h-1.5 gap-px" : "h-2 gap-0.5",
        )}
      >
        {segments.map((week) => {
          const isPast = week < current;
          const isActive = week === current && !isComplete;
          return (
            <span
              key={week}
              aria-hidden="true"
              className={cn(
                "flex-1 rounded-full transition-base",
                isActive && "bg-foreground",
                isPast && "bg-foreground/40",
                !isActive && !isPast && "bg-foreground/10",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}