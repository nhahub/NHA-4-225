"use client";

import * as React from "react";
import { useOptimistic, useState, useTransition } from "react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { DayHabit, DayTask } from "@/lib/mock-data/day";

import { AdaptiveGreeting } from "@/components/home/adaptive-greeting";
import { BacklogRibbon } from "@/components/home/backlog-ribbon";
import { ContributionPulse } from "@/components/home/contribution-pulse";
import { DailyProgressBar } from "@/components/home/daily-progress-bar";
import { HabitRow } from "@/components/home/habit-row";
import { TaskRow } from "@/components/home/task-row";
import { LocaleToggle } from "@/components/shared/locale-toggle";

type BacklogItem = {
  id: string;
  title: string;
  carryOverDays: number;
};

type HomeShellProps = {
  initialTasks: DayTask[];
  initialHabits: DayHabit[];
  dayType: "work" | "light" | "off";
  hasGoals: boolean;
  backlogItems: BacklogItem[];
};

type PulseEvent = {
  trigger: number;
  delta: number;
  goalTitle?: string;
};

function applyTaskToggle(tasks: DayTask[], id: string): DayTask[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t,
  );
}

function applyHabitToggle(habits: DayHabit[], id: string): DayHabit[] {
  return habits.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h));
}

function applyHabitAdjust(
  habits: DayHabit[],
  id: string,
  delta: number,
): DayHabit[] {
  return habits.map((h) => {
    if (h.id !== id) return h;
    const next = Math.max(0, (h.progress ?? 0) + delta);
    const completed = h.target ? next >= h.target : h.completed;
    return { ...h, progress: next, completed };
  });
}

export function HomeShell({
  initialTasks,
  initialHabits,
  dayType,
  hasGoals,
  backlogItems,
}: HomeShellProps) {
  const { t } = useLocale();
  const [committedTasks, setCommittedTasks] = useState<DayTask[]>(initialTasks);
  const [committedHabits, setCommittedHabits] = useState<DayHabit[]>(initialHabits);
  const [optimisticTasks, applyOptimisticTasks] = useOptimistic(
    committedTasks,
    (curr, action: { kind: "toggle"; id: string }) => applyTaskToggle(curr, action.id),
  );
  const [optimisticHabits, applyOptimisticHabits] = useOptimistic(
    committedHabits,
    (
      curr,
      action:
        | { kind: "toggle"; id: string }
        | { kind: "adjust"; id: string; delta: number },
    ) => {
      if (action.kind === "toggle") return applyHabitToggle(curr, action.id);
      return applyHabitAdjust(curr, action.id, action.delta);
    },
  );
  const [, startTransition] = useTransition();
  const [pulse, setPulse] = useState<PulseEvent>({
    trigger: 0,
    delta: 0,
  });

  const onTaskToggle = (id: string) => {
    startTransition(() => {
      applyOptimisticTasks({ kind: "toggle", id });
      setCommittedTasks((prev) => applyTaskToggle(prev, id));
    });
  };

  const onHabitToggle = (id: string) => {
    startTransition(() => {
      applyOptimisticHabits({ kind: "toggle", id });
      setCommittedHabits((prev) => applyHabitToggle(prev, id));
    });
  };

  const onHabitAdjust = (id: string, delta: number) => {
    startTransition(() => {
      applyOptimisticHabits({ kind: "adjust", id, delta });
      setCommittedHabits((prev) => applyHabitAdjust(prev, id, delta));
    });
  };

  const onPulse = (delta: number, goalTitle?: string) => {
    setPulse((p) => ({
      trigger: p.trigger + 1,
      delta,
      goalTitle,
    }));
  };

  const totalUnits =
    optimisticTasks.length +
    optimisticHabits.filter((h) => h.completed).length +
    optimisticHabits.filter((h) => !h.completed).length * 0;
  const doneUnits =
    optimisticTasks.filter((t) => t.status === "done").length +
    optimisticHabits.filter((h) => h.completed).length;

  const sortedTasks = [...optimisticTasks].sort((a, b) => {
    // done at bottom; scheduled before flexible before quick; earlier time first
    if (a.status !== b.status) return a.status === "done" ? 1 : -1;
    const order: Record<DayTask["type"], number> = {
      scheduled: 0,
      flexible: 1,
      quick: 2,
    };
    if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type];
    const ta = a.scheduledAt ?? "99:99";
    const tb = b.scheduledAt ?? "99:99";
    return ta.localeCompare(tb);
  });

  const isLightDay = dayType === "light" || dayType === "off";

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-end gap-2">
        <LocaleToggle />
      </div>

      <AdaptiveGreeting
        tasks={optimisticTasks}
        habits={optimisticHabits}
        hasGoals={hasGoals}
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold">
          {t("home.todaysTasks")}
        </h2>
        <ul className="flex flex-col gap-2">
          {sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              done={task.status === "done"}
              onToggle={() => onTaskToggle(task.id)}
              onPulse={onPulse}
            />
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-base font-semibold">
          {t("home.todaysHabits")}
        </h2>
        <ul className="flex flex-col gap-2">
          {optimisticHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              onLightDay={isLightDay}
              onToggle={() => onHabitToggle(habit.id)}
              onAdjust={
                habit.kind === "counter"
                  ? (delta) => onHabitAdjust(habit.id, delta)
                  : undefined
              }
            />
          ))}
        </ul>
      </section>

      <BacklogRibbon tasks={backlogItems} />

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-heading text-base font-semibold">
            {t("home.dailyProgress")}
          </h2>
          <span
            className={cn(
              "text-muted-foreground text-xs font-medium tabular-nums",
            )}
          >
            {t("home.dailyProgressAccent", {
              done: doneUnits,
              total: totalUnits,
            })}
          </span>
        </div>
        <DailyProgressBar
          done={doneUnits}
          total={Math.max(totalUnits, 1)}
          ariaLabel={t("home.dailyProgress")}
        />
      </section>

      <ContributionPulse
        trigger={pulse.trigger}
        delta={pulse.delta}
        goalTitle={pulse.goalTitle}
        prefix={t("home.contributionPulsePrefix")}
        connector={t("home.contributionPulseSuffix")}
        unit={t("home.progressPercentUnit")}
      />
    </main>
  );
}