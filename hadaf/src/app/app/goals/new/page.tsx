import type { Metadata } from "next";

import { GoalReadinessDialog } from "@/components/goals/goal-readiness-dialog";
import { GoalWizard } from "@/components/goals/goal-wizard";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export const metadata: Metadata = {
  title: "New Goal · Hadaf",
  description: "Define a 12-week goal in three short steps.",
};

export default async function NewGoalPage() {
  const locale = await readServerLocale();
  const t = createT(locale).t;

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <GoalReadinessDialog defaultOpen />
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("newGoal.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("newGoal.subtitle")}
          </p>
        </div>
        <LocaleToggle />
      </header>
      <GoalWizard />
    </main>
  );
}