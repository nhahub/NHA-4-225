"use client";

import { useLocale } from "@/providers/locale-provider";
import type { DayHabit, DayTask } from "@/lib/mock-data/day";

type AdaptiveGreetingProps = {
  tasks: DayTask[];
  habits: DayHabit[];
  hasGoals: boolean;
};

export function AdaptiveGreeting({
  tasks,
  habits,
  hasGoals,
}: AdaptiveGreetingProps) {
  const { t, locale } = useLocale();
  const openTasks = tasks.filter((t) => t.status === "todo").length;
  const openHabits = habits.filter((h) => !h.completed).length;

  let line: string;
  if (!hasGoals) {
    line = t("home.greetingNoGoals");
  } else if (openTasks > 0) {
    line = t("home.greetingHasTasks", {
      tasks: openTasks,
      habits: openHabits,
    });
  } else if (openHabits > 0) {
    line = t("home.greetingOnlyHabits", { habits: openHabits });
  } else {
    line = t("home.greetingNewUser");
  }

  return (
    <header className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {t("home.title")}
        {locale === "ar" ? "" : "."}
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">{line}</p>
    </header>
  );
}