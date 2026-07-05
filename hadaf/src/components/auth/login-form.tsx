"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AuthEmailField,
  AuthPasswordField,
} from "@/components/auth/auth-form-fields";
import { loginAction } from "@/features/auth/actions";
import {
  loginSchema,
  type LoginFormInput,
} from "@/features/auth/schemas";
import { useLocale } from "@/providers/locale-provider";
import type { MessageKey } from "@/i18n/messages";

export function LoginForm() {
  const { t } = useLocale();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await loginAction(data);
    if (!result.success) {
      if (result.errorCode === "VALIDATION" && result.field) {
        setError(result.field as keyof LoginFormInput, {
          message: t(result.error as MessageKey),
        });
        return;
      }
      toast.error(t("auth.errors.invalidCredentials" as MessageKey));
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={t("auth.login.title")}
      className="flex flex-col gap-4"
    >
      <AuthEmailField
        registration={register("email")}
        error={errors.email?.message}
      />
      <AuthPasswordField
        registration={register("password")}
        error={errors.password?.message}
      />
      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting
          ? t("auth.login.submitPending" as MessageKey)
          : t("auth.login.submit" as MessageKey)}
      </Button>
    </form>
  );
}
