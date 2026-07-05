import { z } from "zod";

const K = {
  emailRequired: "auth.validation.emailRequired",
  emailInvalid: "auth.validation.emailInvalid",
  emailTooLong: "auth.validation.emailTooLong",
  passwordRequired: "auth.validation.passwordRequired",
  passwordTooShort: "auth.validation.passwordTooShort",
  passwordTooLong: "auth.validation.passwordTooLong",
  nameRequired: "auth.validation.nameRequired",
  nameTooLong: "auth.validation.nameTooLong",
} as const;

const emailSchema = z
  .string()
  .min(1, K.emailRequired)
  .email(K.emailInvalid)
  .max(254, K.emailTooLong);

const passwordSchema = z
  .string()
  .min(8, K.passwordTooShort)
  .max(128, K.passwordTooLong);

const nameSchema = z
  .string()
  .min(1, K.nameRequired)
  .max(80, K.nameTooLong);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, K.passwordRequired).max(128, K.passwordTooLong),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.input<typeof registerSchema>;
export type LoginFormInput = z.input<typeof loginSchema>;
