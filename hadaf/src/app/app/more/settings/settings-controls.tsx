"use client";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function SettingsControls() {
  const { t, isRtl } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "border-border bg-card text-card-foreground flex items-center justify-between rounded-xl border px-4 py-3",
          isRtl ? "flex-row-reverse" : null,
        )}
      >
        <span className="text-sm font-medium">{t("language.label")}</span>
        <LanguageSwitcher />
      </div>
      <div
        className={cn(
          "border-border bg-card text-card-foreground flex items-center justify-between rounded-xl border px-4 py-3",
          isRtl ? "flex-row-reverse" : null,
        )}
      >
        <span className="text-sm font-medium">{t("theme.label")}</span>
        <ThemeToggle />
      </div>
    </div>
  );
}
