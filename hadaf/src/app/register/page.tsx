import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { createT } from "@/i18n/messages";
import { readServerLocale } from "@/i18n/locale-server";

export const metadata: Metadata = {
  title: "Create account · Hadaf",
  description: "Create your Hadaf account.",
};

export default async function RegisterPage() {
  const locale = await readServerLocale();
  const t = createT(locale).t;

  return (
    <main className="bg-background text-foreground mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("auth.register.title")}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t("auth.register.subtitle")}
          </p>
        </div>
        <LocaleToggle />
      </header>

      <RegisterForm />

      <p className="text-muted-foreground text-center text-sm">
        {t("auth.register.haveAccount")}{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          {t("auth.register.loginCta")}
        </Link>
      </p>
    </main>
  );
}
