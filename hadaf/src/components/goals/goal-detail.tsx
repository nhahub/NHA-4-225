"use client";

import Link from "next/link";
import { ArrowLeftIcon, ListTodoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { HealthDot } from "@/components/goals/health-dot";
import { MilestoneList } from "@/components/goals/milestone-list";
import { TwelveWeekBar } from "@/components/goals/twelve-week-bar";
import { DeleteGoalDialog } from "@/components/goals/delete-goal-dialog";
import { LinkedTasks } from "@/components/goals/linked-tasks";
import { ManualProgressOverride } from "@/components/goals/manual-progress-override";
import { categoryGlyph, categoryLabel, healthLabel } from "@/features/goals/labels";
import type { Goal } from "@/features/goals/schemas";
import { formatDate } from "@/i18n/format";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type GoalDetailProps = {
  goal: Goal;
};

export function GoalDetail({ goal }: GoalDetailProps) {
  const { locale, t } = useLocale();

  const categoryText =
    goal.category === "other" && goal.customCategory
      ? goal.customCategory
      : categoryLabel(locale, goal.category);

  const separator = t("goals.cycleDatesSeparator");
  const startLabel = formatDate(goal.cycleStart, locale, "long");
  const endLabel = formatDate(goal.cycleEnd, locale, "long");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-2">
        <Button render={<Link href="/goals" />} variant="ghost" size="sm">
          <ArrowLeftIcon aria-hidden="true" />
          {t("goalDetail.backToGoals")}
        </Button>
        <DeleteGoalDialog goalId={goal.id} goalTitle={goal.title} />
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <HealthDot health={goal.health} />
              <span className="text-muted-foreground text-xs font-medium">
                {healthLabel(locale, goal.health)}
              </span>
              {goal.manualProgress !== null ? (
                <span
                  className={cn(
                    "bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide uppercase",
                  )}
                  aria-label={t("goalDetail.manualBadge")}
                >
                  {t("goalDetail.manualBadge")}
                </span>
              ) : null}
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {goal.title}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">{categoryGlyph(locale, goal.category)}</span>
                <span>{categoryText}</span>
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <time dateTime={goal.cycleStart.toISOString()}>
                  {startLabel}
                </time>
                <span aria-hidden="true">{separator}</span>
                <time dateTime={goal.cycleEnd.toISOString()}>
                  {endLabel}
                </time>
              </span>
            </div>
          </div>
          <GoalProgressRing
            progress={goal.progress}
            size={80}
            strokeWidth={5}
            showLabel
          />
        </div>
        <TwelveWeekBar
          cycleStart={goal.cycleStart}
          cycleEnd={goal.cycleEnd}
          variant="detail"
        />
      </header>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {t("goalDetail.relevanceCard")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-foreground text-sm leading-relaxed">
          {goal.relevance}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            {t("goalDetail.measureCard")}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-foreground text-sm leading-relaxed">
          {goal.measure}
        </CardContent>
      </Card>

      {goal.description ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t("goalDetail.notesCard")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground text-sm leading-relaxed">
            {goal.description}
          </CardContent>
        </Card>
      ) : null}

      <MilestoneList goalId={goal.id} initialMilestones={goal.milestones} />

      <ManualProgressOverride goal={goal} />

      <Card size="sm" className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <ListTodoIcon className="text-muted-foreground size-4" aria-hidden="true" />
              {t("goalDetail.linkedTasksTitle")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LinkedTasks goalId={goal.id} />
        </CardContent>
      </Card>
    </div>
  );
}