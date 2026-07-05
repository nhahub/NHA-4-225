"use client";

import { LanguagesIcon } from "lucide-react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type LocaleToggleProps = {
  className?: string;
};

export function LocaleToggle({ className }: LocaleToggleProps) {
  const { locale, toggle, t } = useLocale();
  const next = locale === "ar" ? "en" : "ar";
  const label = t("common.localeSwitchAria");
  const other = next === "en" ? t("common.localeToggleToEn") : t("common.localeToggleToAr");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-xs font-medium tabular-nums transition-base",
        "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "outline-none",
        className,
      )}
    >
      <LanguagesIcon className="size-3.5" aria-hidden="true" />
      <span>{other}</span>
    </button>
  );
}