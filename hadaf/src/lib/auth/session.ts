import { cookies } from "next/headers";

import { usersRepo } from "@/data/repositories/users.repo";
import { ACCESS_TTL, signAccessToken, verifyAccessToken } from "./jwt";

export const ACCESS_COOKIE = "hadaf:access";
export const REFRESH_COOKIE = "hadaf:refresh";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

function cookieOptions(maxAgeOrExpires: number | Date) {
  const isProd = process.env.NODE_ENV === "production";
  const base = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };
  if (typeof maxAgeOrExpires === "number") {
    return { ...base, maxAge: maxAgeOrExpires };
  }
  return { ...base, expires: maxAgeOrExpires };
}

export async function setSession(
  userId: string,
  refreshTokenPlain: string,
  refreshTokenExp: Date,
): Promise<void> {
  const access = await signAccessToken(userId);
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, access, cookieOptions(ACCESS_TTL));
  jar.set(
    REFRESH_COOKIE,
    refreshTokenPlain,
    cookieOptions(refreshTokenExp),
  );
}

export async function clearSession(userId?: string): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  if (userId) {
    await usersRepo.updateRefreshToken(userId, null, null);
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifyAccessToken(token);
  if (!claims) return null;
  const user = await usersRepo.findById(claims.sub);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name };
}
