"use client";

import { useLocale } from "@/providers/locale-provider";
import type { BacklogTask } from "@/lib/mock-data/day";

type BacklogRibbonProps = {
  tasks: BacklogTask[];
};

export function BacklogRibbon({ tasks }: BacklogRibbonProps) {
  const { t, locale } = useLocale();
  if (tasks.length === 0) return null;

  const dayWord = locale === "ar" ? "يوم" : "d";

  return (
    <section
      aria-label={t("home.backlogRibbon", { count: tasks.length })}
      className="border-muted-foreground/20 bg-muted/30 flex flex-col gap-2 rounded-lg border border-dashed px-3 py-2.5"
    >
      <p className="text-muted-foreground text-xs font-medium">
        {t("home.backlogRibbon", { count: tasks.length })}
      </p>
      <ul className="flex flex-col gap-1">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="text-foreground/80 flex items-center justify-between gap-2 text-xs"
          >
            <span className="line-clamp-1">{task.title}</span>
            <span className="text-muted-foreground shrink-0 tabular-nums">
              {task.carryOverDays}
              {dayWord}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}