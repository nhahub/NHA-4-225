// LocaleProvider — cookie-based locale state with Arabic as the default.
//
// Persists the active locale in a `locale` cookie so the next page load
// picks up the right directionality (SSR-safe in spirit, even though
// this client is SPA — the cookie is read on mount).
//
// The provider also flips <html dir> and <html lang> on locale change
// so the rest of the app's CSS (logical properties, RTL classes) responds
// immediately.

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ar from '@/i18n/ar';
import en from '@/i18n/en';
import { LocaleContext, type Locale } from './LocaleContextValue';

const DEFAULT_LOCALE: Locale = 'ar';
const COOKIE_NAME = 'locale';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const dictionaries = { ar, en } as const;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
}

function applyHtmlAttrs(locale: Locale) {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
}

function lookup(dict: Record<string, unknown>, dottedKey: string): unknown {
  const parts = dottedKey.split('.');
  let cursor: unknown = dict;
  for (const part of parts) {
    if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return cursor;
}

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = readCookie(COOKIE_NAME);
    return stored === 'ar' || stored === 'en' ? stored : DEFAULT_LOCALE;
  });

  useEffect(() => {
    applyHtmlAttrs(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    writeCookie(COOKIE_NAME, next, COOKIE_MAX_AGE);
    setLocaleState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: string | Record<string, string | number>): string => {
      const dict = dictionaries[locale];
      let raw = lookup(dict as unknown as Record<string, unknown>, key);
      // Fall back to the other locale if missing there too — dev-loop
      // safety net so a missing translation doesn't break the screen.
      if (typeof raw !== 'string') {
        const other = dictionaries[locale === 'ar' ? 'en' : 'ar'];
        raw = lookup(other as unknown as Record<string, unknown>, key);
        if (typeof raw !== 'string') {
          raw = typeof params === 'string' ? params : key;
        }
      }

      if (params && typeof params === 'object') {
        return Object.entries(params).reduce(
          (acc, [k, v]) => acc.split(`{${k}}`).join(String(v)),
          raw as string,
        );
      }
      return raw as string;
    },
    [locale],
  );

  const formatNumber = useCallback(
    (n: number) => new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(n),
    [locale],
  );

  const formatDate = useCallback(
    (date: Date | string | number) => {
      const d = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(d);
    },
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, formatNumber, formatDate }),
    [locale, setLocale, t, formatNumber, formatDate],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};