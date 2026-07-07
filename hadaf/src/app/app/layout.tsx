import * as React from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layouts/app-shell";
import { getAuthUser } from "@/lib/auth/session";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?redirect=/app");
  }
  return <AppShell>{children}</AppShell>;
}
