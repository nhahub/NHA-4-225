import type { Locale } from "@/i18n/messages";

type DateStyle = "short" | "medium" | "long" | "full";

function buildOptions(style: DateStyle): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  if (style === "long" || style === "full") {
    options.year = "numeric";
  }
  if (style === "full") {
    options.weekday = "long";
  }
  return options;
}

export function formatDate(
  date: Date,
  locale: Locale | string,
  style: DateStyle = "medium",
): string {
  const options = buildOptions(style);
  if (locale === "ar") {
    options.numberingSystem = "arab";
  }
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatNumber(value: number, locale: Locale | string): string {
  const options: Intl.NumberFormatOptions = {};
  if (locale === "ar") {
    options.numberingSystem = "arab";
  }
  return new Intl.NumberFormat(locale, options).format(value);
}