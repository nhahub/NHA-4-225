import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Landing page — minimal placeholder until E0.6 (App Shell + Theme Toggle)
 * replaces this with the real `/[locale]` layout.
 *
 * Notes:
 * - Uses Tailwind LOGICAL properties (ms-*, me-*, ps-*, pe-*) only.
 *   Never ml-/mr-/pl-/pr-/left-/right- — RTL-ready from day 1 (E0.2).
 * - Uses Shadcn primitives to verify the scaffold + design tokens render.
 * - No framer-motion — motion handled via CSS classes in globals.css.
 */
export default function Home() {
  return (
    <main className="bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-16">
      <Card className="max-w-xl transition-base">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Hadaf · هدف
          </CardTitle>
          <CardDescription>
            Productivity built around Elastic Motivation — Minimum Viable Day,
            adaptive capacity, and bilingual (AR + EN) parity.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            Sprint 1 — Epic E1 (Goals) is live. The wizard is complete and the
            goal dashboard is in progress.
          </p>
          <div className="flex gap-2">
            <Button render={<Link href="/goals" />}>Open goals dashboard</Button>
            <Button render={<Link href="/goals/new" />} variant="outline">
              Create a goal
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}