import Link from "next/link";
import { CalendarIcon, TargetIcon } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { HealthDot } from "@/components/goals/health-dot";
import { TwelveWeekBar } from "@/components/goals/twelve-week-bar";
import {
  CATEGORY_GLYPH_EN,
  CATEGORY_LABEL_EN,
  type Goal,
} from "@/features/goals/schemas";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function formatRange(start: Date, end: Date): string {
  return `${dateFormatter.format(start)} → ${dateFormatter.format(end)}`;
}

function milestoneSummary(goal: Goal): {
  completed: number;
  total: number;
} {
  const total = goal.milestones.length;
  const completed = goal.milestones.filter((m) => m.isCompleted).length;
  return { completed, total };
}

export function GoalCard({ goal }: { goal: Goal }) {
  const { completed, total } = milestoneSummary(goal);
  const categoryLabel =
    goal.category === "other" && goal.customCategory
      ? goal.customCategory
      : CATEGORY_LABEL_EN[goal.category];

  return (
    <Link
      href={`/goals/${goal.id}`}
      aria-label={`Open goal: ${goal.title}`}
      className={cn(
        "group block rounded-xl outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
      )}
    >
      <Card
        size="sm"
        className={cn(
          "transition-base hover:bg-muted/40",
          "group-focus-visible:border-ring",
        )}
      >
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <HealthDot health={goal.health} />
              <h3 className="font-heading line-clamp-1 text-base font-semibold">
                {goal.title}
              </h3>
            </div>
            <GoalProgressRing progress={goal.progress} size={40} strokeWidth={3} />
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex items-center gap-1">
              <span aria-hidden="true">{CATEGORY_GLYPH_EN[goal.category]}</span>
              <span>{categoryLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarIcon className="size-3" aria-hidden="true" />
              <time>{formatRange(goal.cycleStart, goal.cycleEnd)}</time>
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TwelveWeekBar
            cycleStart={goal.cycleStart}
            cycleEnd={goal.cycleEnd}
            variant="card"
          />
          <div className="text-muted-foreground flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1">
              <TargetIcon className="size-3" aria-hidden="true" />
              <span className="tabular-nums">
                {completed} of {total} milestones
              </span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}