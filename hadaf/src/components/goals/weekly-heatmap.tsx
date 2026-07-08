"use client";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type WeekBucket = { weekIndex: number; completed: number };

export type HeatmapRow = {
  goalId: string;
  goalTitle: string;
  weeks: WeekBucket[];
};

type WeeklyHeatmapProps = {
  rows: HeatmapRow[];
  currentWeekIndex?: number;
};

const TOTAL_WEEKS = 12;

function intensityClass(count: number, max: number): string {
  if (count === 0 || max === 0) {
    return "bg-muted";
  }
  const ratio = count / max;
  // Neutral grayscale ramp — does NOT use status colors (those mean
  // progress/health only). The hint of brand teal at full intensity
  // keeps the heat map visually anchored without overstepping into the
  // status palette.
  if (ratio < 0.25) return "bg-foreground/10";
  if (ratio < 0.5) return "bg-foreground/25";
  if (ratio < 0.75) return "bg-foreground/45";
  return "bg-foreground/65";
}

/**
 * Weekly task-completion density heat map — the 3rd required visual
 * per FR8 (alongside the 12-Week Bar and the per-goal progress rings).
 *
 * Each row is one active goal; each column is one week of its 12-week
 * cycle. In RTL the grid's column order is reversed via CSS so week 1
 * stays visually anchored to the right side.
 */
export function WeeklyHeatmap({ rows, currentWeekIndex }: WeeklyHeatmapProps) {
  const { t, isRtl } = useLocale();

  if (rows.length === 0) {
    return null;
  }

  const allZero = rows.every((r) => r.weeks.every((w) => w.completed === 0));
  if (allZero) {
    return (
      <section
        aria-label={t("goals.heatmapTitle")}
        className="flex flex-col gap-2"
      >
        <h2 className="font-heading text-base font-semibold">
          {t("goals.heatmapTitle")}
        </h2>
        <p className="text-muted-foreground rounded-lg border bg-card/50 p-4 text-sm">
          {t("goals.heatmapEmpty")}
        </p>
      </section>
    );
  }

  const max = Math.max(
    1,
    ...rows.flatMap((r) => r.weeks.map((w) => w.completed)),
  );

  return (
    <section
      aria-label={t("goals.heatmapTitle")}
      className="flex flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-base font-semibold">
          {t("goals.heatmapTitle")}
        </h2>
        <p className="text-muted-foreground text-xs">
          {t("goals.heatmapHelper")}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card p-3">
        <div
          // CSS `direction: rtl` reverses the grid's column flow so week 1
          // sits on the right side in Arabic — no JS array flipping
          // required.
          dir={isRtl ? "rtl" : "ltr"}
          className="flex min-w-fit flex-col gap-2"
        >
          <div className="grid grid-cols-[minmax(8rem,1fr)_repeat(12,minmax(0,1fr))] items-center gap-1.5">
            <div aria-hidden="true" />
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
              const week = i + 1;
              const isCurrent = currentWeekIndex === week;
              return (
                <div
                  key={`hdr-${week}`}
                  className={cn(
                    "text-muted-foreground text-center text-[0.65rem] tabular-nums",
                    isCurrent && "font-semibold text-foreground",
                  )}
                  title={t("goals.heatmapWeekN", { n: week })}
                >
                  {week}
                </div>
              );
            })}
          </div>

          {rows.map((row) => (
            <div
              key={row.goalId}
              className="grid grid-cols-[minmax(8rem,1fr)_repeat(12,minmax(0,1fr))] items-center gap-1.5"
            >
              <div className="text-foreground truncate text-start text-xs font-medium">
                {row.goalTitle}
              </div>
              {row.weeks.map((bucket) => {
                const isCurrent = currentWeekIndex === bucket.weekIndex;
                return (
                  <div
                    key={`${row.goalId}-${bucket.weekIndex}`}
                    className={cn(
                      "aspect-square w-full rounded-md border transition-base",
                      intensityClass(bucket.completed, max),
                      isCurrent && "ring-2 ring-ring/60",
                    )}
                    title={`${row.goalTitle} · ${t("goals.heatmapWeekN", { n: bucket.weekIndex })}: ${bucket.completed} ${t("goalDetail.tasksCompletedUnit")}`}
                    aria-label={`${row.goalTitle}, ${t("goals.heatmapWeekN", { n: bucket.weekIndex })}: ${bucket.completed}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}