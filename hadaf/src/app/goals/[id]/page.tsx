import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ListTodoIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GoalProgressRing } from "@/components/goals/goal-progress-ring";
import { HealthDot } from "@/components/goals/health-dot";
import { MilestoneList } from "@/components/goals/milestone-list";
import { TwelveWeekBar } from "@/components/goals/twelve-week-bar";
import {
  CATEGORY_GLYPH_EN,
  CATEGORY_LABEL_EN,
  GOAL_HEALTH_LABEL_EN,
} from "@/features/goals/schemas";
import {
  getAllGoalIds,
  getGoalById,
} from "@/features/goals/queries";

export async function generateStaticParams() {
  const ids = await getAllGoalIds();
  return ids.map((id) => ({ id }));
}

type RouteParams = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const { id } = await params;
  const goal = await getGoalById(id);
  if (!goal) {
    return { title: "Goal not found · Hadaf" };
  }
  return {
    title: `${goal.title} · Hadaf`,
    description: goal.measure,
  };
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function GoalDetailPage({ params }: RouteParams) {
  const { id } = await params;
  const goal = await getGoalById(id);
  if (!goal) notFound();

  const categoryLabel =
    goal.category === "other" && goal.customCategory
      ? goal.customCategory
      : CATEGORY_LABEL_EN[goal.category];

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <Button render={<Link href="/goals" />} variant="ghost" size="sm">
          <ArrowLeftIcon aria-hidden="true" />
          Back to goals
        </Button>
      </div>

      <header className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <HealthDot health={goal.health} />
              <span className="text-muted-foreground text-xs font-medium">
                {GOAL_HEALTH_LABEL_EN[goal.health]}
              </span>
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {goal.title}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex items-center gap-1">
                <span aria-hidden="true">{CATEGORY_GLYPH_EN[goal.category]}</span>
                <span>{categoryLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <time dateTime={goal.cycleStart.toISOString()}>
                  {dateFormatter.format(goal.cycleStart)}
                </time>
                <span aria-hidden="true">→</span>
                <time dateTime={goal.cycleEnd.toISOString()}>
                  {dateFormatter.format(goal.cycleEnd)}
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
          <CardTitle className="text-sm font-semibold">Why it matters</CardTitle>
        </CardHeader>
        <CardContent className="text-foreground text-sm leading-relaxed">
          {goal.relevance}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            How you&apos;ll know it worked
          </CardTitle>
        </CardHeader>
        <CardContent className="text-foreground text-sm leading-relaxed">
          {goal.measure}
        </CardContent>
      </Card>

      {goal.description ? (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-foreground text-sm leading-relaxed">
            {goal.description}
          </CardContent>
        </Card>
      ) : null}

      <MilestoneList
        goalId={goal.id}
        initialMilestones={goal.milestones}
      />

      <Card size="sm" className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              <ListTodoIcon className="text-muted-foreground size-4" aria-hidden="true" />
              Linked tasks
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Tasks land here in Epic E2. For now, this is a placeholder.
        </CardContent>
      </Card>
    </main>
  );
}