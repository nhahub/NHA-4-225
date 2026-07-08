"use client";

import Link from "next/link";
import { TargetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";

export function EmptyGoalsState() {
  const { t } = useLocale();

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-full"
      >
        <TargetIcon className="size-5" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <h2 className="font-heading text-base font-semibold">
          {t("goals.emptyTitle")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("goals.emptyBody")}
        </p>
      </div>
      <Button render={<Link href="/app/goals/new" />}>{t("goals.emptyCta")}</Button>
    </div>
  );
}