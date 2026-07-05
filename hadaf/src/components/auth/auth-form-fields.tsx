"use client";

import * as React from "react";
import { MailIcon, LockIcon, UserIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useLocale } from "@/providers/locale-provider";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-destructive text-xs leading-tight">
      {message}
    </p>
  );
}

type FieldProps = {
  id: string;
  registration: React.ComponentProps<"input">;
  error?: string;
  label: string;
  placeholder: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  icon: React.ReactNode;
};

function Field({
  id,
  registration,
  error,
  label,
  placeholder,
  type,
  autoComplete,
  icon,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute inset-y-0 start-2.5 flex items-center"
        >
          {icon}
        </span>
        <Input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error) || undefined}
          className="ps-8"
          {...registration}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}

export function AuthNameField({
  registration,
  error,
}: {
  registration: React.ComponentProps<"input">;
  error?: string;
}) {
  const { t } = useLocale();
  return (
    <Field
      id="auth-name"
      registration={registration}
      error={error}
      label={t("auth.fields.name")}
      placeholder={t("auth.fields.namePlaceholder")}
      type="text"
      autoComplete="name"
      icon={<UserIcon className="size-4" />}
    />
  );
}

export function AuthEmailField({
  registration,
  error,
}: {
  registration: React.ComponentProps<"input">;
  error?: string;
}) {
  const { t } = useLocale();
  return (
    <Field
      id="auth-email"
      registration={registration}
      error={error}
      label={t("auth.fields.email")}
      placeholder={t("auth.fields.emailPlaceholder")}
      type="email"
      autoComplete="email"
      icon={<MailIcon className="size-4" />}
    />
  );
}

export function AuthPasswordField({
  registration,
  error,
}: {
  registration: React.ComponentProps<"input">;
  error?: string;
}) {
  const { t } = useLocale();
  return (
    <Field
      id="auth-password"
      registration={registration}
      error={error}
      label={t("auth.fields.password")}
      placeholder={t("auth.fields.passwordPlaceholder")}
      type="password"
      autoComplete="current-password"
      icon={<LockIcon className="size-4" />}
    />
  );
}
