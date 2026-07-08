import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyGoalsState } from "@/components/goals/empty-goals-state";
import { GoalGrid } from "@/components/goals/goal-grid";
import { TwelveWeekOverview } from "@/components/goals/twelve-week-overview";
import { WeeklyExecutionScore } from "@/components/goals/weekly-execution-score";
import { WeeklyHeatmap, type HeatmapRow } from "@/components/goals/weekly-heatmap";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { getActiveGoals, getWeeklyTaskDensity } from "@/features/goals/queries";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";
import { currentWeekIndex } from "@/features/goals/week";

export const metadata: Metadata = {
  title: "Goals · Hadaf",
  description:
    "Your 12-week goals at a glance — current week, progress, and health.",
};

export default async function GoalsPage() {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  const goals = await getActiveGoals();

  // Heat map: one row per active goal, populated from each goal's
  // own weekly task density. Empty buckets come back zero-filled so
  // the grid always renders a full 12-cell row.
  const heatmapRows: HeatmapRow[] = await Promise.all(
    goals.map(async (goal) => ({
      goalId: goal.id,
      goalTitle: goal.title,
      weeks: await getWeeklyTaskDensity(goal.id),
    })),
  );

  // Current-week anchor: derive from the earliest active cycleStart so
  // the heatmap highlight tracks the same boundary the TwelveWeekBar
  // shows.
  const currentWeek =
    goals.length > 0
      ? currentWeekIndex(
          goals.reduce(
            (earliest, g) =>
              g.cycleStart.getTime() < earliest.getTime() ? g.cycleStart : earliest,
            goals[0].cycleStart,
          ),
          goals.reduce(
            (latest, g) =>
              g.cycleEnd.getTime() > latest.getTime() ? g.cycleEnd : latest,
            goals[0].cycleEnd,
          ),
        )
      : undefined;

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("goals.title")}
          </h1>
          <p className="text-muted-foreground text-sm">{t("goals.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleToggle />
          <Button nativeButton={false} render={<Link href="/app/goals/new" />}>
            <PlusIcon aria-hidden="true" />
            {t("goals.newGoal")}
          </Button>
        </div>
      </header>

      {goals.length === 0 ? (
        <EmptyGoalsState />
      ) : (
        <>
          <TwelveWeekOverview goals={goals} />
          <WeeklyHeatmap rows={heatmapRows} currentWeekIndex={currentWeek} />
          <GoalGrid goals={goals} />
          <WeeklyExecutionScore goals={goals} />
        </>
      )}
    </main>
  );
}