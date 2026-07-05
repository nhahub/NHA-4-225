"use client";

import { useMemo } from "react";

import { useLocale } from "@/providers/locale-provider";
import { formatDate, formatNumber } from "@/i18n/format";

type DateStyle = "short" | "medium" | "long" | "full";

export function useDateFormatter(style: DateStyle = "medium") {
  const { locale } = useLocale();
  return useMemo(
    () => ({
      format: (date: Date) => formatDate(date, locale, style),
    }),
    [locale, style],
  );
}

export function useNumberFormatter() {
  const { locale } = useLocale();
  return useMemo(
    () => ({
      format: (value: number) => formatNumber(value, locale),
    }),
    [locale],
  );
}