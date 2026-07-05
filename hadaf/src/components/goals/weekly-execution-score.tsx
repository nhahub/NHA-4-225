"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Goal } from "@/features/goals/schemas";

type WeeklyExecutionScoreProps = {
  goals: Goal[];
};

type ScoreTier = "strong" | "steady" | "gentle";

function scoreTier(percent: number): ScoreTier {
  if (percent >= 75) return "strong";
  if (percent >= 45) return "steady";
  return "gentle";
}

const TIER_RING: Record<ScoreTier, string> = {
  strong: "stroke-status-great",
  steady: "stroke-status-good",
  gentle: "stroke-status-warning",
};

const TIER_TEXT: Record<ScoreTier, string> = {
  strong: "text-status-great",
  steady: "text-status-good",
  gentle: "text-status-warning",
};

const SIZE = 120;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;

export function WeeklyExecutionScore({ goals }: WeeklyExecutionScoreProps) {
  const { t } = useLocale();

  const hasGoals = goals.length > 0;
  const avgProgress = hasGoals
    ? goals.reduce((acc, g) => acc + g.progress, 0) / goals.length
    : 0;
  const percent = Math.round(avgProgress * 100);
  const tier = scoreTier(percent);

  const dash = CIRC * avgProgress;
  const gap = CIRC - dash;

  const summaryMessage = !hasGoals
    ? t("goals.executionScoreNoGoals")
    : tier === "strong"
      ? t("goals.executionScoreStrong")
      : tier === "steady"
        ? t("goals.executionScoreSteady")
        : t("goals.executionScoreGentle");

  return (
    <section
      aria-label={t("goals.executionScoreHeading")}
      className="flex flex-col gap-3"
    >
      <h2 className="font-heading text-base font-semibold">
        {t("goals.executionScoreHeading")}
      </h2>
      <Card size="sm">
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative inline-flex shrink-0">
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                className="stroke-foreground/10"
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${gap}`}
                className={cn("stroke-current transition-slow", TIER_RING[tier])}
              />
            </svg>
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center",
              )}
            >
              <span
                className={cn(
                  "font-heading text-2xl font-semibold tabular-nums",
                  TIER_TEXT[tier],
                )}
              >
                {hasGoals ? `${percent}${t("goals.executionScoreUnit")}` : "—"}
              </span>
              <span className="text-muted-foreground text-xs">
                {t("goals.executionScoreLabel")}
              </span>
            </div>
          </div>
          <p className="text-foreground/90 max-w-md text-sm leading-relaxed">
            {summaryMessage}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}