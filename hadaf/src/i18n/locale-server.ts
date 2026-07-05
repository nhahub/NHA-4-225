import { cookies } from "next/headers";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/messages";

export const LOCALE_COOKIE = "hadaf:locale";

export async function readServerLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    const stored = jar.get(LOCALE_COOKIE)?.value;
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}