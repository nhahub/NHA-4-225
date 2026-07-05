import type { Metadata } from "next";

import { GoalReadinessDialog } from "@/components/goals/goal-readiness-dialog";
import { GoalWizard } from "@/components/goals/goal-wizard";

export const metadata: Metadata = {
  title: "New Goal · Hadaf",
  description: "Define a 12-week goal in three short steps.",
};

export default function NewGoalPage() {
  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <GoalReadinessDialog defaultOpen />
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          New goal
        </h1>
        <p className="text-muted-foreground text-sm">
          Three short steps. Twelve weeks.
        </p>
      </header>
      <GoalWizard />
    </main>
  );
}
