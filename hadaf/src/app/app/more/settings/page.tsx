import type { Metadata } from "next";

import { SettingsControls } from "@/app/app/more/settings/settings-controls";
import { getAuthUser } from "@/lib/auth/session";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  return {
    title: `${t("shell.settings")} · ${t("common.appName")}`,
    description: t("common.tagline"),
  };
}

export default async function SettingsPage() {
  const locale = await readServerLocale();
  const t = createT(locale).t;
  const user = await getAuthUser();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("shell.settings")}
        </h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </header>
      <SettingsControls />
    </div>
  );
}
