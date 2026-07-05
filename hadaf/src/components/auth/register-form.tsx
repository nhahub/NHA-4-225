"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AuthEmailField,
  AuthNameField,
  AuthPasswordField,
} from "@/components/auth/auth-form-fields";
import { registerAction } from "@/features/auth/actions";
import {
  registerSchema,
  type RegisterFormInput,
} from "@/features/auth/schemas";
import { useLocale } from "@/providers/locale-provider";
import type { MessageKey } from "@/i18n/messages";

export function RegisterForm() {
  const { t } = useLocale();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "", name: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await registerAction(data);
    if (!result.success) {
      if (result.errorCode === "VALIDATION" && result.field) {
        setError(result.field as keyof RegisterFormInput, {
          message: t(result.error as MessageKey),
        });
        return;
      }
      toast.error(t("auth.errors.generic" as MessageKey));
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-label={t("auth.register.title")}
      className="flex flex-col gap-4"
    >
      <AuthNameField
        registration={register("name")}
        error={errors.name?.message}
      />
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
          ? t("auth.register.submitPending" as MessageKey)
          : t("auth.register.submit" as MessageKey)}
      </Button>
    </form>
  );
}
