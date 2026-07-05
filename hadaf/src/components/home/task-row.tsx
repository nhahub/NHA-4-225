"use client";

import * as React from "react";
import { CheckIcon, ClockIcon, FlameIcon, ZapIcon } from "lucide-react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { DayTask, TaskType } from "@/lib/mock-data/day";

type TaskRowProps = {
  task: DayTask;
  done: boolean;
  onToggle: () => void;
  onPulse: (delta: number, goalTitle?: string) => void;
};

const TYPE_ICON: Record<TaskType, React.ReactNode> = {
  scheduled: <ClockIcon className="size-3.5" aria-hidden="true" />,
  flexible: <FlameIcon className="size-3.5" aria-hidden="true" />,
  quick: <ZapIcon className="size-3.5" aria-hidden="true" />,
};

export function TaskRow({ task, done, onToggle, onPulse }: TaskRowProps) {
  const { t, locale } = useLocale();
  const percent = locale === "ar" ? "٪" : "%";

  const handleToggle = () => {
    const next = !done;
    onToggle();
    if (next && task.goalId) {
      // MVP: each completed task contributes 8% to its goal's daily pulse.
      onPulse(8, task.goalTitle);
    }
  };

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition-base",
        done && "bg-muted/40",
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={
          done
            ? `${task.title} — ${t("home.dailyProgressAccent", { done: 1, total: 1 }).split(" — ")[0]}`
            : task.title
        }
        onClick={handleToggle}
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-md border transition-fast outline-none",
          "focus-visible:ring-3 focus-visible:ring-ring/50",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-input bg-background hover:border-primary/50",
        )}
      >
        {done ? (
          <CheckIcon className="size-3.5" aria-hidden="true" />
        ) : null}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "text-sm leading-snug",
            done && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
        <span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1">
            {TYPE_ICON[task.type]}
            <span aria-hidden="true">{task.scheduledAt ?? ""}</span>
          </span>
          {task.estimatedMinutes ? (
            <span className="tabular-nums">
              {task.estimatedMinutes}
              {locale === "ar" ? " د" : "m"}
            </span>
          ) : null}
          {task.goalTitle ? (
            <span className="hidden truncate sm:inline">
              · {task.goalTitle}
            </span>
          ) : null}
        </span>
      </div>
      {!done ? (
        <span
          aria-hidden="true"
          className="text-muted-foreground text-xs tabular-nums"
        >
          {percent}
        </span>
      ) : null}
    </li>
  );
}