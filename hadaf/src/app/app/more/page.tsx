import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";

import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  return {
    title: `${t("shell.more")} · ${t("common.appName")}`,
    description: t("common.tagline"),
  };
}

type MoreRow = {
  href: string;
  labelKey: "shell.settings";
  Icon: React.ElementType;
};

const ROWS: readonly MoreRow[] = [
  {
    href: "/app/more/settings",
    labelKey: "shell.settings",
    Icon: SettingsIcon,
  },
] as const;

export default async function MorePage() {
  const locale = await readServerLocale();
  const t = createT(locale).t;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("shell.more")}
        </h1>
      </header>
      <ul className="flex flex-col gap-2">
        {ROWS.map(({ href, labelKey, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="border-border bg-card text-card-foreground hover:bg-muted flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium transition-base"
            >
              <span className="flex items-center gap-3">
                <Icon aria-hidden="true" className="text-muted-foreground size-4" />
                <span>{t(labelKey)}</span>
              </span>
              <ChevronRightIcon
                aria-hidden="true"
                className="text-muted-foreground size-4"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
