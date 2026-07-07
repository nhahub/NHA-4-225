"use client";

import * as React from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const ORDER: readonly Theme[] = ["light", "dark", "system"] as const;

function nextTheme(current: Theme | undefined): Theme {
  const idx = ORDER.indexOf((current ?? "system") as Theme);
  return ORDER[(idx + 1) % ORDER.length] ?? "system";
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { t, isRtl } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const aria = t("theme.toggleAria");
  const label = t("theme.label");
  const current = (mounted ? theme : undefined) as Theme | undefined;
  const target = nextTheme(current);
  const ariaLabel = `${aria} → ${t(
    target === "light"
      ? "theme.toggleToLight"
      : target === "dark"
        ? "theme.toggleToDark"
        : "theme.toggleToSystem",
  )}`;

  const Icon =
    current === "dark"
      ? MoonIcon
      : current === "light"
        ? SunIcon
        : MonitorIcon;

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => setTheme(target)}
      aria-label={ariaLabel}
      title={ariaLabel}
      data-rtl={isRtl ? "true" : undefined}
      className={cn("transition-base", className)}
    >
      <Icon aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
