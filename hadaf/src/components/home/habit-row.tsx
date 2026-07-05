"use client";

import * as React from "react";
import { CheckIcon, MinusIcon, PlusIcon } from "lucide-react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { DayHabit } from "@/lib/mock-data/day";

type HabitRowProps = {
  habit: DayHabit;
  onLightDay: boolean;
  onToggle: () => void;
  onAdjust?: (delta: number) => void;
};

export function HabitRow({
  habit,
  onLightDay,
  onToggle,
  onAdjust,
}: HabitRowProps) {
  const { t } = useLocale();
  const showMvd = onLightDay && Boolean(habit.mvdTitle);
  const display = showMvd ? habit.mvdTitle ?? habit.title : habit.title;

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-base",
        habit.completed && "bg-muted/40",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={habit.completed}
        aria-label={display}
        onClick={onToggle}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-md border transition-fast outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          habit.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background hover:border-primary/50",
        )}
      >
        {habit.completed ? (
          <CheckIcon className="size-3.5" aria-hidden="true" />
        ) : null}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-sm leading-snug",
            habit.completed && "text-muted-foreground line-through",
          )}
        >
          {display}
        </span>
        {showMvd ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <span>{t("home.habitsMvdBadge")}</span>
            <span aria-hidden="true">·</span>
            <span>{t("home.habitsMvdHint")}</span>
          </span>
        ) : null}
      </div>
      {habit.kind === "counter" && onAdjust ? (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("home.habitsMvdBadge")}
            onClick={() => onAdjust(-1)}
            className="inline-flex size-6 items-center justify-center rounded-md border transition-base outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <MinusIcon className="size-3" aria-hidden="true" />
          </button>
          <span className="text-foreground min-w-10 text-center text-xs font-medium tabular-nums">
            {habit.progress ?? 0}
            {habit.unit ? `/${habit.target ?? ""} ${habit.unit}` : ""}
          </span>
          <button
            type="button"
            aria-label={t("home.habitsMvdBadge")}
            onClick={() => onAdjust(1)}
            className="inline-flex size-6 items-center justify-center rounded-md border transition-base outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <PlusIcon className="size-3" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </li>
  );
}