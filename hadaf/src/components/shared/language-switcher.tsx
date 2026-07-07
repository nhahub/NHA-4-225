"use client";

import * as React from "react";
import { LanguagesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE } from "@/i18n/constants";
import { useLocale, isLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function persistLocaleCookie(locale: "ar" | "en") {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(locale);
  document.cookie = `${LOCALE_COOKIE}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, toggle, t } = useLocale();
  const next = locale === "ar" ? "en" : "ar";
  const aria = t("language.switchAria");
  const ariaLabel = `${aria} → ${t(
    isLocale(next) && next === "en"
      ? "language.switchToEnglish"
      : "language.switchToArabic",
  )}`;

  const handleClick = React.useCallback(() => {
    persistLocaleCookie(next);
    toggle();
  }, [next, toggle]);

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn("transition-base", className)}
    >
      <LanguagesIcon aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
    </Button>
  );
}

export { persistLocaleCookie };
