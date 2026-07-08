import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GoalDetail } from "@/components/goals/goal-detail";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { getAllGoalIds, getGoalById } from "@/features/goals/queries";
import { readServerLocale } from "@/i18n/locale-server";

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

export default async function GoalDetailPage({ params }: RouteParams) {
  await readServerLocale();
  const { id } = await params;
  const goal = await getGoalById(id);
  if (!goal) notFound();

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <Button nativeButton={false} render={<Link href="/app/goals" />} variant="ghost" size="sm">
          <ArrowLeftIcon aria-hidden="true" />
          {t("goalDetail.backToGoals")}
        </Button>
        <LocaleToggle />
      </div>
      <GoalDetail goal={goal} />
    </main>
  );
}