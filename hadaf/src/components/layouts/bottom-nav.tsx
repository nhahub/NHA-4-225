"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EllipsisIcon,
  HomeIcon,
  ListChecksIcon,
  TargetIcon,
} from "lucide-react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/i18n/messages";

type NavItem = {
  href: string;
  labelKey: MessageKey;
  Icon: React.ElementType;
  exact?: boolean;
};

const ITEMS: readonly NavItem[] = [
  { href: "/app", labelKey: "shell.home", Icon: HomeIcon, exact: true },
  { href: "/app/goals", labelKey: "shell.goals", Icon: TargetIcon },
  { href: "/app/habits", labelKey: "shell.habits", Icon: ListChecksIcon },
  { href: "/app/more", labelKey: "shell.more", Icon: EllipsisIcon },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav({ className }: { className?: string }) {
  const { t } = useLocale();
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label={t("shell.primaryNavAria")}
      className={cn(
        "border-border bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur",
        "pb-[env(safe-area-inset-bottom,0px)]",
        className,
      )}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ href, labelKey, Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-13 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-base",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
                <span>{t(labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
