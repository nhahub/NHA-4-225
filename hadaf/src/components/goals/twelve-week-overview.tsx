"use client";

import { useLocale } from "@/providers/locale-provider";
import { TwelveWeekBar } from "@/components/goals/twelve-week-bar";
import type { Goal } from "@/features/goals/schemas";

type TwelveWeekOverviewProps = {
  goals: Goal[];
};

/**
 * Dashboard-level 12-Week Bar. Derives a single representative 12-week
 * window from the goals' earliest cycleStart and the corresponding
 * +84 day end. If there are no goals, falls back to a window anchored on
 * "today − 28 days".
 */
export function TwelveWeekOverview({ goals }: TwelveWeekOverviewProps) {
  const { t } = useLocale();

  let cycleStart: Date;
  let cycleEnd: Date;
  if (goals.length > 0) {
    const earliest = goals
      .map((g) => g.cycleStart.getTime())
      .reduce((a, b) => Math.min(a, b));
    cycleStart = new Date(earliest);
    cycleEnd = new Date(earliest + 84 * 86_400_000);
  } else {
    cycleStart = new Date(Date.now() - 28 * 86_400_000);
    cycleEnd = new Date(Date.now() + 56 * 86_400_000);
  }

  return (
    <section
      aria-label={t("goals.twelveWeekHeading")}
      className="flex flex-col gap-2"
    >
      <h2 className="font-heading text-base font-semibold">
        {t("goals.twelveWeekHeading")}
      </h2>
      <TwelveWeekBar
        cycleStart={cycleStart}
        cycleEnd={cycleEnd}
        variant="detail"
      />
    </section>
  );
}