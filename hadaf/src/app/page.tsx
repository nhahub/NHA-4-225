import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export default async function Home() {
  const locale = await readServerLocale();
  const t = createT(locale).t;

  return (
    <main className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center gap-4 px-6 py-16">
      <div className="absolute end-4 top-4">
        <LocaleToggle />
      </div>
      <Card className="max-w-xl transition-base">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {t("common.appName")} · هدف
          </CardTitle>
          <CardDescription>{t("common.tagline")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {locale === "ar"
              ? "سبرنت ١ — ملحمة E1 (الأهداف) جاهزة. المعالج مكتمل ولوحة الأهداف قيد البناء."
              : "Sprint 1 — Epic E1 (Goals) is live. The wizard is complete and the goal dashboard is in progress."}
          </p>
          <div className="flex gap-2">
            <Button render={<Link href="/goals" />}>{t("goals.title")}</Button>
            <Button render={<Link href="/goals/new" />} variant="outline">
              {t("goals.newGoal")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}