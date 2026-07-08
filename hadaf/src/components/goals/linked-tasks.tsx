import { and, desc, eq } from "drizzle-orm";

import { db } from "@/data/db/client";
import { tasks } from "@/data/db/schema";
import { getAuthUser } from "@/lib/auth/session";
import { formatDate } from "@/i18n/format";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";
import { cn } from "@/lib/utils";

type LinkedTasksProps = {
  goalId: string;
};

const MAX_TASKS = 5;

/**
 * Linked-tasks list for the goal detail page (FR9).
 *
 * E2-1/E2-2 (task creation/completion) are not yet implemented, so this
 * is intentionally lightweight — a compact list of up to `MAX_TASKS`
 * tasks ordered by most-recently-completed. The page renders a graceful
 * empty state when no tasks exist yet.
 */
export async function LinkedTasks({ goalId }: LinkedTasksProps) {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  const user = await getAuthUser();

  if (!user) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("goalDetail.linkedTasksPlaceholder")}
      </p>
    );
  }

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      completedAt: tasks.completedAt,
    })
    .from(tasks)
    .where(and(eq(tasks.userId, user.id), eq(tasks.goalId, goalId)))
    .orderBy(desc(tasks.completedAt), desc(tasks.createdAt))
    .limit(MAX_TASKS);

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        {t("goalDetail.linkedTasksEmpty")}
      </p>
    );
  }

  return (
    <ul role="list" className="flex flex-col gap-2">
      {rows.map((task) => {
        const isDone = task.status === "completed";
        return (
          <li
            key={task.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border bg-card/50 px-3 py-2 text-sm",
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 leading-snug",
                isDone && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
            <span className="text-muted-foreground shrink-0 text-xs tabular-nums">
              {task.completedAt
                ? formatDate(task.completedAt, locale, "short")
                : "—"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}