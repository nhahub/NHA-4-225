import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GoalNotFound() {
  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Goal not found
        </h1>
        <p className="text-muted-foreground text-sm">
          That goal doesn&apos;t exist or was deleted.
        </p>
      </div>
      <Button render={<Link href="/goals" />} variant="outline">
        <ArrowLeftIcon aria-hidden="true" />
        Back to goals
      </Button>
    </main>
  );
}