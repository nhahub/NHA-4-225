import * as React from "react";

import { BottomNav } from "@/components/layouts/bottom-nav";
import { Sidebar } from "@/components/layouts/sidebar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
};

const SKIP_LINK_CLASSES =
  "sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:start-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-background focus-visible:px-3 focus-visible:py-2 focus-visible:text-foreground focus-visible:shadow focus-visible:ring-2 focus-visible:ring-ring";

export function AppShell({ children }: AppShellProps) {
  return (
    <div
      className={cn(
        "bg-background text-foreground flex min-h-dvh flex-col lg:flex-row",
      )}
      data-app-shell="true"
    >
      <a href="#app-main" className={SKIP_LINK_CLASSES}>
        Skip to main content
      </a>

      <Sidebar className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col" />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <main
          id="app-main"
          className="flex-1 px-4 py-8 pb-24 sm:px-6 lg:px-8 lg:py-10 lg:pb-10"
        >
          {children}
        </main>

        <BottomNav className="lg:hidden" />
      </div>
    </div>
  );
}
