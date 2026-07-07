import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "@/i18n/constants";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/messages";

export { LOCALE_COOKIE };

export async function readServerLocale(): Promise<Locale> {
  try {
    const jar = await cookies();
    const stored = jar.get(LOCALE_COOKIE)?.value;
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}