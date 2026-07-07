"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  HomeIcon,
  SettingsIcon,
  TargetIcon,
} from "lucide-react";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/i18n/messages";
import { useLocale } from "@/providers/locale-provider";

type NavItem = {
  href: string;
  labelKey: MessageKey;
  Icon: React.ElementType;
  exact?: boolean;
};

const ITEMS: readonly NavItem[] = [
  { href: "/app", labelKey: "shell.home", Icon: HomeIcon, exact: true },
  { href: "/app/goals", labelKey: "shell.goals", Icon: TargetIcon },
  { href: "/app/habits", labelKey: "shell.habits", Icon: ActivityIcon },
  { href: "/app/more/settings", labelKey: "shell.settings", Icon: SettingsIcon },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ className }: { className?: string }) {
  const { t, isRtl } = useLocale();
  const pathname = usePathname() ?? "/";

  return (
    <aside
      aria-label={t("shell.primaryNavAria")}
      data-side="start"
      className={cn(
        "bg-sidebar text-sidebar-foreground border-sidebar-border flex w-full flex-col border-e",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-5">
        <span className="font-heading text-base font-semibold tracking-tight">
          {t("common.appName")}
        </span>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 pb-6">
        <ul className="flex flex-col gap-1">
          {ITEMS.map(({ href, labelKey, Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-base",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    isRtl ? "flex-row-reverse text-start" : null,
                  )}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{t(labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
