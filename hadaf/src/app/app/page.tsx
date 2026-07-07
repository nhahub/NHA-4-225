import type { Metadata } from "next";

import { HomeShell } from "@/components/home/home-shell";
import { getGoals } from "@/features/goals/queries";
import { getTodaySnapshot } from "@/features/day/queries";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  return {
    title:
      locale === "ar"
        ? `${t("common.appName")} · ${t("home.title")}`
        : `${t("home.title")} · ${t("common.appName")}`,
    description: t("common.tagline"),
  };
}

export default async function ProtectedHomePage() {
  const [snapshot, goals] = await Promise.all([
    getTodaySnapshot(),
    getGoals(),
  ]);
  return (
    <HomeShell
      initialTasks={snapshot.tasks}
      initialHabits={snapshot.habits}
      backlogItems={snapshot.backlog}
      dayType={snapshot.dayType}
      hasGoals={goals.length > 0}
    />
  );
}
