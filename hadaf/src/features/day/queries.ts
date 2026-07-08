import { eq, and, lt } from "drizzle-orm";

import { db } from "@/data/db/client";
import {
  goals,
  tasks,
  habits,
  habitLogs,
  dailySummaries,
  users,
} from "@/data/db/schema";
import type {
  TodaySnapshot,
  DayTask,
  DayHabit,
  BacklogTask,
  DayType,
} from "@/lib/mock-data/day";
import { getAuthUser } from "@/lib/auth/session";

function getDayName(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
}

export async function getTodaySnapshot(): Promise<TodaySnapshot> {
  const user = await getAuthUser();
  if (!user) {
    return {
      dayType: "work",
      dateIso: new Date().toISOString().slice(0, 10),
      tasks: [],
      habits: [],
      backlog: [],
    };
  }

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // 1. Fetch User Settings & Daily Summary to determine DayType
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const [summary] = await db
    .select()
    .from(dailySummaries)
    .where(and(eq(dailySummaries.userId, user.id), eq(dailySummaries.date, todayStr)));

  let dayType: DayType = "work";
  if (summary) {
    dayType = summary.dayType as DayType;
  } else if (dbUser?.settings) {
    const settingsObj = dbUser.settings as Record<string, any>;
    const offDays = settingsObj.off_days || [];
    const todayName = getDayName(now);
    if (offDays.includes(todayName)) {
      dayType = "off";
    }
  }

  // 2. Fetch Tasks for Today
  const todayTasks = await db
    .select({
      task: tasks,
      goal: goals,
    })
    .from(tasks)
    .leftJoin(goals, eq(tasks.goalId, goals.id))
    .where(and(eq(tasks.userId, user.id), eq(tasks.date, todayStr)));

  const mappedTasks: DayTask[] = todayTasks.map(({ task, goal }) => {
    let priority: 1 | 2 | 3 = 2;
    if (task.priority === "high") priority = 1;
    if (task.priority === "low") priority = 3;

    return {
      id: task.id,
      title: task.title,
      type: task.type as any,
      status: task.status === "completed" ? "done" : "todo",
      scheduledAt: task.timeBlockStart ?? undefined,
      estimatedMinutes: task.plannedDurationMinutes ?? undefined,
      priority,
      goalId: task.goalId ?? undefined,
      goalTitle: goal?.title ?? undefined,
    };
  });

  // 3. Fetch Habits & Today's Habit Logs
  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, user.id), eq(habits.isArchived, false)));

  const habitIds = userHabits.map((h) => h.id);
  const todayLogs = habitIds.length > 0
    ? await db
        .select()
        .from(habitLogs)
        .where(and(eq(habitLogs.date, todayStr)))
    : [];

  const logsMap = new Map(todayLogs.map((log) => [log.habitId, log]));

  const mappedHabits: DayHabit[] = userHabits.map((habit) => {
    const log = logsMap.get(habit.id);
    const progress = log ? log.value : 0;
    
    let completed = false;
    if (habit.type === "counter") {
      completed = progress >= (habit.targetValue ?? 1);
    } else if (habit.type === "quit") {
      completed = log ? !log.isRelapse : true; // Default completed for quit if no relapse logged
    } else {
      completed = progress >= 1;
    }

    return {
      id: habit.id,
      title: habit.title,
      kind: habit.type as any,
      mvdTitle: habit.mvdDescription ?? undefined,
      target: habit.targetValue ?? undefined,
      progress,
      completed,
    };
  });

  // 4. Fetch Carryover Backlog Tasks
  const backlogTasks = await db
    .select()
    .from(tasks)
    .where(and(
      eq(tasks.userId, user.id),
      eq(tasks.status, "pending"),
      lt(tasks.date, todayStr)
    ));

  const mappedBacklog: BacklogTask[] = backlogTasks.map((task) => {
    const diffMs = new Date(todayStr).getTime() - new Date(task.date).getTime();
    const carryOverDays = Math.max(1, Math.round(diffMs / 86400000));
    return {
      id: task.id,
      title: task.title,
      carryOverDays,
    };
  });

  return {
    dayType,
    dateIso: todayStr,
    tasks: mappedTasks,
    habits: mappedHabits,
    backlog: mappedBacklog,
  };
}