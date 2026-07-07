"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { usersRepo } from "@/data/repositories/users.repo";
import { analyticsRepo } from "@/data/repositories/analytics.repo";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import {
  generateRefreshToken,
  hashPassword,
  hashRefreshToken,
  parseRefreshToken,
  REFRESH_TOKEN_TTL_MS,
  verifyPassword,
  verifyRefreshToken,
} from "@/lib/auth/password";
import {
  clearSession,
  getAuthUser,
  REFRESH_COOKIE,
  setSession,
} from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/auth/redirect-path";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "./schemas";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function firstZodError(error: import("zod").ZodError) {
  const issue = error.issues[0];
  return {
    message: issue?.message ?? "auth.validation.generic",
    field: issue?.path[0] as string | undefined,
  };
}

export async function registerAction(
  input: RegisterInput,
  next?: string | string[],
): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    const { message, field } = firstZodError(parsed.error);
    return fail(message, "VALIDATION", field ? { field } : undefined);
  }

  const { email, name, password } = parsed.data;
  const normalized = normalizeEmail(email);

  const existing = await usersRepo.findByEmail(normalized);
  if (existing) {
    return fail("auth.errors.emailExists", "VALIDATION", { field: "email" });
  }

  const passwordHash = await hashPassword(password);
  const user = await usersRepo.createUser({
    email: normalized,
    name,
    passwordHash,
  });
  if (!user) {
    return fail("errors.saveFailed", "DB_ERROR", { shouldRetry: true });
  }

  const refreshPlain = generateRefreshToken(user.id);
  const refreshExp = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const refreshHash = await hashRefreshToken(refreshPlain);
  await usersRepo.updateRefreshToken(user.id, refreshHash, refreshExp);
  await setSession(user.id, refreshPlain, refreshExp);
  await analyticsRepo.log(user.id, "user_registered", { email: normalized });

  redirect(safeRedirectPath(next));
}

export async function loginAction(
  input: LoginInput,
  next?: string | string[],
): Promise<ActionResult<{ userId: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const { message, field } = firstZodError(parsed.error);
    return fail(message, "VALIDATION", field ? { field } : undefined);
  }

  const { email, password } = parsed.data;
  const user = await usersRepo.findByEmail(normalizeEmail(email));

  if (!user) {
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const refreshPlain = generateRefreshToken(user.id);
  const refreshExp = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const refreshHash = await hashRefreshToken(refreshPlain);
  await usersRepo.updateRefreshToken(user.id, refreshHash, refreshExp);
  await setSession(user.id, refreshPlain, refreshExp);
  await analyticsRepo.log(user.id, "user_logged_in", {});

  redirect(safeRedirectPath(next));
}

export async function logoutAction(): Promise<ActionResult<{ ok: true }>> {
  const user = await getAuthUser();
  await clearSession(user?.id);
  redirect("/login");
}

export async function refreshAction(): Promise<
  ActionResult<{ userId: string }>
> {
  const jar = await cookies();
  const presented = jar.get(REFRESH_COOKIE)?.value;
  if (!presented) {
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const parsedToken = parseRefreshToken(presented);
  if (!parsedToken) {
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const user = await usersRepo.findById(parsedToken.userId);
  if (!user || !user.refreshToken || !user.refreshTokenExp) {
    await clearSession(parsedToken.userId);
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  if (user.refreshTokenExp.getTime() < Date.now()) {
    await clearSession(user.id);
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const tokenMatches = await verifyRefreshToken(presented, user.refreshToken);
  if (!tokenMatches) {
    await clearSession(user.id);
    return fail("auth.errors.invalidCredentials", "AUTH");
  }

  const newPlain = generateRefreshToken(user.id);
  const newExp = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  const newHash = await hashRefreshToken(newPlain);
  await usersRepo.updateRefreshToken(user.id, newHash, newExp);
  await setSession(user.id, newPlain, newExp);

  return ok({ userId: user.id });
}
