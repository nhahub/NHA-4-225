/**
 * Edge Middleware — JWT validation + rate limiting for /app/* (E0-6).
 *
 * Constraints (per Architecture.md §3.2 + ADR-10):
 *   - Edge runtime only: `jose` is Edge-safe; `bcryptjs` is NOT (Node-only).
 *   - Rate limit: in-memory `Map`; per-isolate limit, acceptable for 100-user MVP.
 *   - Verifies the `hadaf:access` cookie (15-min JWT from `lib/auth/jwt.ts`).
 *   - On invalid / missing token: clear bad cookies and redirect to
 *     `/login?redirect={path}`.
 *   - On > 100 req/min/user: return 429 with Retry-After.
 */
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_COOKIE = "hadaf:access";
const REFRESH_COOKIE = "hadaf:refresh";
const ISSUER = "hadaf";

const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60_000;

let cachedSecret: Uint8Array | null = null;
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const v = process.env.JWT_SECRET;
  if (!v || v.length === 0) {
    throw new Error("JWT_SECRET is not set");
  }
  cachedSecret = new TextEncoder().encode(v);
  return cachedSecret;
}

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweepMs = 0;

function checkRate(
  key: string,
): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  if (now - lastSweepMs >= RATE_WINDOW_MS) {
    lastSweepMs = now;
    for (const [entryKey, entry] of buckets) {
      if (now > entry.resetAt) buckets.delete(entryKey);
    }
  }

  const existing = buckets.get(key);
  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }
  if (existing.count >= RATE_LIMIT) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true };
}

function redirectToLogin(req: NextRequest, clearBadTokens: boolean) {
  const target = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?redirect=${encodeURIComponent(target)}`;
  url.hash = "";
  const res = NextResponse.redirect(url);
  if (clearBadTokens) {
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
  }
  return res;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return redirectToLogin(req, false);
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: ISSUER,
    });
    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      return redirectToLogin(req, true);
    }
    userId = payload.sub;
  } catch {
    return redirectToLogin(req, true);
  }

  const rl = checkRate(userId);
  if (!rl.ok) {
    return new NextResponse("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": String(rl.retryAfter),
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set("x-user-id", userId);
  return res;
}

export const config = {
  matcher: ["/app/:path*"],
};
