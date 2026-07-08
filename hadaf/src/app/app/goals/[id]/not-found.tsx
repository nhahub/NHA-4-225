import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export default async function GoalNotFound() {
  const locale = await readServerLocale();
  const t = createT(locale).t;

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("goalDetail.notFoundTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("goalDetail.notFoundBody")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button nativeButton={false} render={<Link href="/app/goals" />} variant="outline">
          <ArrowLeftIcon aria-hidden="true" />
          {t("goalDetail.notFoundCta")}
        </Button>
        <LocaleToggle />
      </div>
    </main>
  );
}