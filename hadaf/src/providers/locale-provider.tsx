"use client";

import * as React from "react";

import {
  DEFAULT_LOCALE,
  createT,
  isLocale,
  type Locale,
} from "@/i18n/messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  toggle: () => void;
  t: ReturnType<typeof createT>["t"];
  isRtl: boolean;
  dir: "rtl" | "ltr";
};

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function applyLocaleToHtml(locale: Locale) {
  if (typeof document === "undefined") return;
  const dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = React.useState<Locale>(initialLocale);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    applyLocaleToHtml(next);
  }, []);

  const toggle = React.useCallback(() => {
    setLocaleState((prev) => {
      const next: Locale = prev === "ar" ? "en" : "ar";
      applyLocaleToHtml(next);
      return next;
    });
  }, []);

  const translator = React.useMemo(() => createT(locale), [locale]);

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggle,
      t: translator.t,
      isRtl: translator.isRtl,
      dir: translator.dir,
    }),
    [locale, setLocale, toggle, translator],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return ctx;
}

export { isLocale };