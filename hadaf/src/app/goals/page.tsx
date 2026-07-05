import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyGoalsState } from "@/components/goals/empty-goals-state";
import { GoalCard } from "@/components/goals/goal-card";
import { getGoals } from "@/features/goals/queries";

export const metadata: Metadata = {
  title: "Goals · Hadaf",
  description:
    "Your 12-week goals at a glance — current week, progress, and health.",
};

export default async function GoalsPage() {
  const goals = await getGoals();

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Goals
          </h1>
          <p className="text-muted-foreground text-sm">
            Your active 12-week goals. Tap one to open its milestones and tasks.
          </p>
        </div>
        <Button render={<Link href="/goals/new" />}>
          <PlusIcon aria-hidden="true" />
          New goal
        </Button>
      </header>

      {goals.length === 0 ? (
        <EmptyGoalsState />
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {goals.map((goal) => (
            <li key={goal.id}>
              <GoalCard goal={goal} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}